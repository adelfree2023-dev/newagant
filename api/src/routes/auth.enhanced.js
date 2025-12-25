/**
 * Enhanced Auth Routes
 * Routes المصادقة المحسّنة
 * 
 * يجب وضعه في: api/src/routes/auth.enhanced.js
 */

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { query } = require('../db');

// Services
const { generateTokens, setAuthCookies, clearAuthCookies, authenticateToken, refreshTokenMiddleware } = require('../middleware/auth');
const { totpService } = require('../services/totp');
const { handlers: passwordResetHandlers } = require('../services/password-reset');
const { handlers: emailVerificationHandlers, sendVerificationEmail } = require('../services/email-verification');
const { handlers: sessionHandlers, createSession } = require('../services/session');
const { logSuccessfulLogin, logFailedLogin, log, AUDIT_EVENTS } = require('../services/audit');
const { extractTenant } = require('../middleware/tenant');

/**
 * تسجيل حساب جديد
 * POST /api/auth/register
 */
router.post('/register', extractTenant, async (req, res) => {
    try {
        const { email, password, name, phone } = req.body;

        // التحقق من المدخلات
        if (!email || !password || !name) {
            return res.status(400).json({
                success: false,
                error: 'Email, password and name are required',
            });
        }

        // التحقق من قوة كلمة المرور
        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                error: 'Password must be at least 8 characters',
            });
        }

        // التحقق من وجود الإيميل
        const existingUser = await query(
            'SELECT id FROM users WHERE email = $1 AND tenant_id = $2',
            [email.toLowerCase(), req.tenant_id]
        );

        if (existingUser.rows.length > 0) {
            return res.status(400).json({
                success: false,
                error: 'Email already registered',
            });
        }

        // تشفير كلمة المرور
        const hashedPassword = await bcrypt.hash(password, 12);

        // تقسيم الاسم
        const nameParts = name.trim().split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ') || '';

        // إنشاء المستخدم
        const result = await query(
            `INSERT INTO users (tenant_id, email, password_hash, first_name, last_name, phone, user_type)
       VALUES ($1, $2, $3, $4, $5, $6, 'customer')
       RETURNING id, email, first_name, last_name`,
            [req.tenant_id, email.toLowerCase(), hashedPassword, firstName, lastName, phone]
        );

        const user = result.rows[0];

        // إرسال إيميل التحقق
        await sendVerificationEmail(user.id, email, firstName);

        // إنشاء الجلسة والتوكنات
        const session = await createSession(user.id, {
            userAgent: req.get('user-agent'),
            ipAddress: req.ip,
        });

        const tokens = generateTokens({
            id: user.id,
            email: user.email,
            tenant_id: req.tenant_id,
            sessionId: session.sessionId,
        });

        setAuthCookies(res, tokens);

        // تسجيل العملية
        await log({
            tenantId: req.tenant_id,
            userId: user.id,
            event: AUDIT_EVENTS.AUTH_REGISTER,
            entityType: 'user',
            entityId: user.id,
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
        });

        res.status(201).json({
            success: true,
            message: 'Registration successful. Please verify your email.',
            user: {
                id: user.id,
                email: user.email,
                name: `${user.first_name} ${user.last_name}`.trim(),
            },
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            error: 'Registration failed',
        });
    }
});

/**
 * تسجيل الدخول
 * POST /api/auth/login
 */
router.post('/login', extractTenant, async (req, res) => {
    try {
        const { email, password, totpCode } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Email and password are required',
            });
        }

        // البحث عن المستخدم
        const result = await query(
            `SELECT id, email, password_hash, first_name, last_name, 
              totp_enabled, totp_secret, is_active, tenant_id
       FROM users 
       WHERE email = $1 AND tenant_id = $2`,
            [email.toLowerCase(), req.tenant_id]
        );

        if (result.rows.length === 0) {
            await logFailedLogin(email, req.ip, req.get('user-agent'), 'User not found');
            return res.status(401).json({
                success: false,
                error: 'Invalid email or password',
            });
        }

        const user = result.rows[0];

        // التحقق من تفعيل الحساب
        if (!user.is_active) {
            await logFailedLogin(email, req.ip, req.get('user-agent'), 'Account disabled');
            return res.status(401).json({
                success: false,
                error: 'Account is disabled',
            });
        }

        // التحقق من كلمة المرور
        const isValidPassword = await bcrypt.compare(password, user.password_hash);

        if (!isValidPassword) {
            await logFailedLogin(email, req.ip, req.get('user-agent'), 'Wrong password');

            // تحديث عداد المحاولات الفاشلة
            await query(
                `UPDATE users 
         SET failed_login_attempts = failed_login_attempts + 1
         WHERE id = $1`,
                [user.id]
            );

            return res.status(401).json({
                success: false,
                error: 'Invalid email or password',
            });
        }

        // التحقق من 2FA إذا كان مفعلاً
        if (user.totp_enabled) {
            if (!totpCode) {
                return res.status(200).json({
                    success: false,
                    requires2FA: true,
                    message: 'Please enter your 2FA code',
                });
            }

            const isValidTotp = totpService.verify(user.totp_secret, totpCode);

            if (!isValidTotp) {
                await logFailedLogin(email, req.ip, req.get('user-agent'), 'Invalid 2FA code');
                return res.status(401).json({
                    success: false,
                    error: 'Invalid 2FA code',
                });
            }
        }

        // إعادة تعيين عداد المحاولات الفاشلة
        await query(
            `UPDATE users 
       SET failed_login_attempts = 0, last_login_at = NOW(), last_login_ip = $2
       WHERE id = $1`,
            [user.id, req.ip]
        );

        // إنشاء الجلسة والتوكنات
        const session = await createSession(user.id, {
            userAgent: req.get('user-agent'),
            ipAddress: req.ip,
        });

        const tokens = generateTokens({
            id: user.id,
            email: user.email,
            tenant_id: user.tenant_id,
            sessionId: session.sessionId,
        });

        setAuthCookies(res, tokens);

        // تسجيل الدخول الناجح
        await logSuccessfulLogin(user.tenant_id, user.id, req.ip, req.get('user-agent'));

        res.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                name: `${user.first_name} ${user.last_name}`.trim(),
                has2FA: user.totp_enabled,
            },
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            error: 'Login failed',
        });
    }
});

/**
 * تسجيل الخروج
 * POST /api/auth/logout
 */
router.post('/logout', authenticateToken, async (req, res) => {
    try {
        // تسجيل العملية
        await log({
            tenantId: req.user.tenant_id,
            userId: req.user.id,
            event: AUDIT_EVENTS.AUTH_LOGOUT,
            entityType: 'user',
            entityId: req.user.id,
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
        });

        clearAuthCookies(res);

        res.json({
            success: true,
            message: 'Logged out successfully',
        });
    } catch (error) {
        console.error('Logout error:', error);
        clearAuthCookies(res);
        res.json({ success: true });
    }
});

/**
 * تجديد التوكن
 * POST /api/auth/refresh
 */
router.post('/refresh', refreshTokenMiddleware);

/**
 * الحصول على بيانات المستخدم الحالي
 * GET /api/auth/me
 */
router.get('/me', authenticateToken, async (req, res) => {
    try {
        const result = await query(
            `SELECT id, email, first_name, last_name, phone, avatar_url,
              totp_enabled, email_verified_at, created_at
       FROM users WHERE id = $1`,
            [req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'User not found',
            });
        }

        const user = result.rows[0];

        res.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                name: `${user.first_name} ${user.last_name}`.trim(),
                firstName: user.first_name,
                lastName: user.last_name,
                phone: user.phone,
                avatar: user.avatar_url,
                has2FA: user.totp_enabled,
                emailVerified: !!user.email_verified_at,
                memberSince: user.created_at,
            },
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get profile',
        });
    }
});

/**
 * تحديث الملف الشخصي
 * PUT /api/auth/profile
 */
router.put('/profile', authenticateToken, async (req, res) => {
    try {
        const { firstName, lastName, phone } = req.body;

        await query(
            `UPDATE users 
       SET first_name = COALESCE($1, first_name),
           last_name = COALESCE($2, last_name),
           phone = COALESCE($3, phone),
           updated_at = NOW()
       WHERE id = $4`,
            [firstName, lastName, phone, req.user.id]
        );

        res.json({
            success: true,
            message: 'Profile updated successfully',
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update profile',
        });
    }
});

/**
 * تغيير كلمة المرور
 * PUT /api/auth/password
 */
router.put('/password', authenticateToken, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                error: 'Current and new passwords are required',
            });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({
                success: false,
                error: 'New password must be at least 8 characters',
            });
        }

        // التحقق من كلمة المرور الحالية
        const result = await query(
            'SELECT password_hash FROM users WHERE id = $1',
            [req.user.id]
        );

        const isValid = await bcrypt.compare(currentPassword, result.rows[0].password_hash);

        if (!isValid) {
            return res.status(401).json({
                success: false,
                error: 'Current password is incorrect',
            });
        }

        // تحديث كلمة المرور
        const hashedPassword = await bcrypt.hash(newPassword, 12);

        await query(
            'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
            [hashedPassword, req.user.id]
        );

        res.json({
            success: true,
            message: 'Password changed successfully',
        });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to change password',
        });
    }
});

// Password Reset Routes
router.post('/forgot-password', extractTenant, passwordResetHandlers.forgotPassword);
router.get('/verify-reset-token/:token', passwordResetHandlers.verifyToken);
router.post('/reset-password', passwordResetHandlers.resetPasswordHandler);

// Email Verification Routes
router.get('/verify-email/:token', emailVerificationHandlers.verify);
router.post('/resend-verification', authenticateToken, emailVerificationHandlers.resend);

// Session Management Routes
router.get('/sessions', authenticateToken, sessionHandlers.getSessions);
router.post('/logout-all', authenticateToken, sessionHandlers.logoutAll);

module.exports = router;

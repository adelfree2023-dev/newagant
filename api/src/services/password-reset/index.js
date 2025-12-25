/**
 * Password Reset Service
 * خدمة استعادة كلمة المرور
 * 
 * يجب وضعه في: api/src/services/password-reset/index.js
 */

const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { query } = require('../../db');

// تخزين التوكنات (في الإنتاج استخدم Redis)
const resetTokens = new Map();

// مدة صلاحية التوكن (ساعة واحدة)
const TOKEN_EXPIRY = 60 * 60 * 1000;

/**
 * إنشاء طلب استعادة كلمة المرور
 */
async function requestPasswordReset(email, tenantId = null) {
    // البحث عن المستخدم
    let userQuery = 'SELECT id, email, first_name FROM users WHERE email = $1';
    const params = [email.toLowerCase()];

    if (tenantId) {
        userQuery += ' AND tenant_id = $2';
        params.push(tenantId);
    }

    const result = await query(userQuery, params);

    if (result.rows.length === 0) {
        // لا نعطي معلومات عن وجود الإيميل
        return { success: true, message: 'If the email exists, a reset link will be sent' };
    }

    const user = result.rows[0];

    // إنشاء توكن
    const token = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // حفظ في قاعدة البيانات
    await query(
        `UPDATE users 
     SET password_reset_token = $1, 
         password_reset_expires = $2 
     WHERE id = $3`,
        [hashedToken, new Date(Date.now() + TOKEN_EXPIRY), user.id]
    );

    // إنشاء رابط الاستعادة
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    return {
        success: true,
        token, // للتطوير فقط - في الإنتاج أرسله بالإيميل
        resetUrl,
        user: {
            id: user.id,
            email: user.email,
            name: user.first_name,
        },
    };
}

/**
 * التحقق من صلاحية التوكن
 */
async function verifyResetToken(token) {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const result = await query(
        `SELECT id, email, first_name 
     FROM users 
     WHERE password_reset_token = $1 
       AND password_reset_expires > NOW()`,
        [hashedToken]
    );

    if (result.rows.length === 0) {
        return { valid: false, error: 'Token invalid or expired' };
    }

    return {
        valid: true,
        user: result.rows[0],
    };
}

/**
 * إعادة تعيين كلمة المرور
 */
async function resetPassword(token, newPassword) {
    // التحقق من التوكن
    const verification = await verifyResetToken(token);

    if (!verification.valid) {
        return { success: false, error: verification.error };
    }

    // التحقق من قوة كلمة المرور
    if (newPassword.length < 8) {
        return { success: false, error: 'Password must be at least 8 characters' };
    }

    // تشفير كلمة المرور الجديدة
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // تحديث كلمة المرور وحذف التوكن
    await query(
        `UPDATE users 
     SET password_hash = $1, 
         password_reset_token = NULL, 
         password_reset_expires = NULL,
         updated_at = NOW()
     WHERE id = $2`,
        [hashedPassword, verification.user.id]
    );

    return {
        success: true,
        message: 'Password reset successfully',
        user: verification.user,
    };
}

/**
 * Express handlers
 */
const handlers = {
    /**
     * طلب استعادة كلمة المرور
     * POST /api/auth/forgot-password
     */
    async forgotPassword(req, res) {
        try {
            const { email } = req.body;

            if (!email) {
                return res.status(400).json({
                    success: false,
                    error: 'Email is required',
                });
            }

            const result = await requestPasswordReset(email, req.tenant_id);

            // في الإنتاج: إرسال إيميل هنا
            // await sendPasswordResetEmail(result.user.email, result.resetUrl);

            res.json({
                success: true,
                message: 'If the email exists, a reset link will be sent',
                // للتطوير فقط:
                ...(process.env.NODE_ENV === 'development' && {
                    resetUrl: result.resetUrl,
                    token: result.token,
                }),
            });
        } catch (error) {
            console.error('Forgot password error:', error);
            res.status(500).json({
                success: false,
                error: 'An error occurred',
            });
        }
    },

    /**
     * التحقق من التوكن
     * GET /api/auth/verify-reset-token/:token
     */
    async verifyToken(req, res) {
        try {
            const { token } = req.params;
            const result = await verifyResetToken(token);

            res.json({
                success: result.valid,
                error: result.error,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'An error occurred',
            });
        }
    },

    /**
     * إعادة تعيين كلمة المرور
     * POST /api/auth/reset-password
     */
    async resetPasswordHandler(req, res) {
        try {
            const { token, password, confirmPassword } = req.body;

            if (!token || !password) {
                return res.status(400).json({
                    success: false,
                    error: 'Token and password are required',
                });
            }

            if (password !== confirmPassword) {
                return res.status(400).json({
                    success: false,
                    error: 'Passwords do not match',
                });
            }

            const result = await resetPassword(token, password);

            if (!result.success) {
                return res.status(400).json(result);
            }

            res.json({
                success: true,
                message: 'Password reset successfully',
            });
        } catch (error) {
            console.error('Reset password error:', error);
            res.status(500).json({
                success: false,
                error: 'An error occurred',
            });
        }
    },
};

module.exports = {
    requestPasswordReset,
    verifyResetToken,
    resetPassword,
    handlers,
};

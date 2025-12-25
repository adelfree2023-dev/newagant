/**
 * Email Verification Service
 * خدمة التحقق من البريد الإلكتروني
 * 
 * يجب وضعه في: api/src/services/email-verification/index.js
 */

const crypto = require('crypto');
const { query } = require('../../db');

// مدة صلاحية رابط التحقق (24 ساعة)
const VERIFICATION_EXPIRY = 24 * 60 * 60 * 1000;

/**
 * إنشاء توكن التحقق
 */
async function createVerificationToken(userId) {
    const token = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + VERIFICATION_EXPIRY);

    // حفظ التوكن في قاعدة البيانات
    await query(
        `UPDATE users 
     SET email_verification_token = $1, 
         email_verification_expires = $2 
     WHERE id = $3`,
        [hashedToken, expiresAt, userId]
    );

    return token;
}

/**
 * إرسال إيميل التحقق
 */
async function sendVerificationEmail(userId, email, name) {
    const token = await createVerificationToken(userId);
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

    // في الإنتاج: إرسال إيميل حقيقي
    // await emailService.send({
    //   to: email,
    //   subject: 'تأكيد البريد الإلكتروني',
    //   template: 'email-verification',
    //   data: { name, verificationUrl }
    // });

    console.log(`[EMAIL VERIFICATION] URL for ${email}: ${verificationUrl}`);

    return {
        success: true,
        message: 'Verification email sent',
        // للتطوير فقط
        ...(process.env.NODE_ENV === 'development' && {
            verificationUrl,
            token,
        }),
    };
}

/**
 * التحقق من التوكن وتفعيل الحساب
 */
async function verifyEmail(token) {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const result = await query(
        `SELECT id, email, email_verified_at 
     FROM users 
     WHERE email_verification_token = $1 
       AND email_verification_expires > NOW()`,
        [hashedToken]
    );

    if (result.rows.length === 0) {
        return { success: false, error: 'Invalid or expired token' };
    }

    const user = result.rows[0];

    if (user.email_verified_at) {
        return { success: true, message: 'Email already verified' };
    }

    // تفعيل الحساب
    await query(
        `UPDATE users 
     SET email_verified_at = NOW(),
         is_verified = true,
         email_verification_token = NULL,
         email_verification_expires = NULL
     WHERE id = $1`,
        [user.id]
    );

    return {
        success: true,
        message: 'Email verified successfully',
        user: { id: user.id, email: user.email },
    };
}

/**
 * إعادة إرسال إيميل التحقق
 */
async function resendVerificationEmail(userId) {
    const result = await query(
        'SELECT id, email, first_name, email_verified_at FROM users WHERE id = $1',
        [userId]
    );

    if (result.rows.length === 0) {
        return { success: false, error: 'User not found' };
    }

    const user = result.rows[0];

    if (user.email_verified_at) {
        return { success: false, error: 'Email already verified' };
    }

    return sendVerificationEmail(userId, user.email, user.first_name);
}

/**
 * Express handlers
 */
const handlers = {
    /**
     * التحقق من الإيميل
     * GET /api/auth/verify-email/:token
     */
    async verify(req, res) {
        try {
            const { token } = req.params;
            const result = await verifyEmail(token);

            if (!result.success) {
                return res.status(400).json(result);
            }

            res.json(result);
        } catch (error) {
            console.error('Email verification error:', error);
            res.status(500).json({
                success: false,
                error: 'Verification failed',
            });
        }
    },

    /**
     * إعادة إرسال رابط التحقق
     * POST /api/auth/resend-verification
     */
    async resend(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    error: 'Authentication required',
                });
            }

            const result = await resendVerificationEmail(req.user.id);
            res.json(result);
        } catch (error) {
            console.error('Resend verification error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to resend verification',
            });
        }
    },
};

/**
 * Middleware للتحقق من تفعيل الإيميل
 */
function requireVerifiedEmail(req, res, next) {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            error: 'Authentication required',
        });
    }

    if (!req.user.email_verified_at) {
        return res.status(403).json({
            success: false,
            error: 'Email verification required',
            code: 'EMAIL_NOT_VERIFIED',
        });
    }

    next();
}

module.exports = {
    createVerificationToken,
    sendVerificationEmail,
    verifyEmail,
    resendVerificationEmail,
    requireVerifiedEmail,
    handlers,
};

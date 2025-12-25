/**
 * CSRF Protection Middleware
 * حماية CSRF
 * 
 * يجب وضعه في: api/src/middleware/csrf.js
 */

const crypto = require('crypto');

// تخزين التوكنات (في الإنتاج استخدم Redis)
const csrfTokens = new Map();

// مدة صلاحية التوكن (ساعة واحدة)
const TOKEN_EXPIRY = 60 * 60 * 1000;

/**
 * إنشاء توكن CSRF جديد
 */
function generateToken(sessionId) {
    const token = crypto.randomBytes(32).toString('hex');

    csrfTokens.set(token, {
        sessionId,
        createdAt: Date.now(),
    });

    // تنظيف التوكنات المنتهية
    cleanupExpiredTokens();

    return token;
}

/**
 * التحقق من صلاحية التوكن
 */
function verifyToken(token, sessionId) {
    const tokenData = csrfTokens.get(token);

    if (!tokenData) {
        return false;
    }

    // التحقق من انتهاء الصلاحية
    if (Date.now() - tokenData.createdAt > TOKEN_EXPIRY) {
        csrfTokens.delete(token);
        return false;
    }

    // التحقق من تطابق الجلسة
    if (tokenData.sessionId !== sessionId) {
        return false;
    }

    // حذف التوكن بعد الاستخدام (one-time use)
    csrfTokens.delete(token);

    return true;
}

/**
 * تنظيف التوكنات المنتهية
 */
function cleanupExpiredTokens() {
    const now = Date.now();
    for (const [token, data] of csrfTokens.entries()) {
        if (now - data.createdAt > TOKEN_EXPIRY) {
            csrfTokens.delete(token);
        }
    }
}

/**
 * Middleware لإنشاء توكن CSRF
 */
function csrfTokenGenerator(req, res, next) {
    // إنشاء session ID إذا لم يكن موجوداً
    if (!req.sessionId) {
        req.sessionId = req.cookies?.sessionId || crypto.randomUUID();
        res.cookie('sessionId', req.sessionId, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000, // 24 ساعة
        });
    }

    // إضافة دالة لإنشاء التوكن
    res.generateCsrfToken = () => {
        const token = generateToken(req.sessionId);
        return token;
    };

    next();
}

/**
 * Middleware للتحقق من توكن CSRF
 */
function csrfProtection(req, res, next) {
    // تجاوز GET, HEAD, OPTIONS
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
        return next();
    }

    // الحصول على التوكن من الهيدر أو البودي
    const token =
        req.headers['x-csrf-token'] ||
        req.headers['x-xsrf-token'] ||
        req.body?._csrf;

    if (!token) {
        return res.status(403).json({
            success: false,
            error: 'CSRF token missing',
            code: 'CSRF_TOKEN_MISSING',
        });
    }

    const sessionId = req.cookies?.sessionId || req.sessionId;

    if (!sessionId) {
        return res.status(403).json({
            success: false,
            error: 'Session not found',
            code: 'SESSION_NOT_FOUND',
        });
    }

    if (!verifyToken(token, sessionId)) {
        return res.status(403).json({
            success: false,
            error: 'Invalid CSRF token',
            code: 'CSRF_TOKEN_INVALID',
        });
    }

    next();
}

/**
 * Route لجلب توكن CSRF جديد
 */
function csrfTokenRoute(req, res) {
    const token = res.generateCsrfToken();
    res.json({
        success: true,
        csrfToken: token,
    });
}

/**
 * Double Submit Cookie Pattern
 * بديل أبسط للـ CSRF protection
 */
function doubleSubmitCookie(req, res, next) {
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
        // إنشاء توكن جديد في كل GET request
        const token = crypto.randomBytes(32).toString('hex');
        res.cookie('XSRF-TOKEN', token, {
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
        });
        return next();
    }

    // التحقق من تطابق الكوكي والهيدر
    const cookieToken = req.cookies?.['XSRF-TOKEN'];
    const headerToken = req.headers['x-xsrf-token'];

    if (!cookieToken || !headerToken) {
        return res.status(403).json({
            success: false,
            error: 'CSRF token missing',
        });
    }

    if (cookieToken !== headerToken) {
        return res.status(403).json({
            success: false,
            error: 'CSRF token mismatch',
        });
    }

    next();
}

module.exports = {
    generateToken,
    verifyToken,
    csrfTokenGenerator,
    csrfProtection,
    csrfTokenRoute,
    doubleSubmitCookie,
};

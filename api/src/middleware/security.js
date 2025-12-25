const rateLimit = require('express-rate-limit');

// ============ Rate Limiters ============

// General API rate limiter
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window
    message: { success: false, error: 'Too many requests, please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
});

// Auth rate limiter (stricter for login/register)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 attempts per window
    message: { success: false, error: 'Too many login attempts, please try again in 15 minutes' },
    standardHeaders: true,
    legacyHeaders: false,
});

// Admin rate limiter
const adminLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 100, // 100 requests per minute
    message: { success: false, error: 'Rate limit exceeded for admin actions' },
    standardHeaders: true,
    legacyHeaders: false,
});

// Super Admin rate limiter (strictest)
const superAdminLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 50, // 50 requests per minute
    message: { success: false, error: 'Rate limit exceeded for super admin' },
    standardHeaders: true,
    legacyHeaders: false,
});

// ============ IP Whitelist ============

const SUPER_ADMIN_ALLOWED_IPS = process.env.SUPER_ADMIN_IPS ?
    process.env.SUPER_ADMIN_IPS.split(',') :
    ['127.0.0.1', '::1', '35.226.47.16']; // Default: localhost + server

const ipWhitelist = (allowedIPs) => (req, res, next) => {
    const clientIP = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for']?.split(',')[0];

    // Check if IP is in whitelist
    const isAllowed = allowedIPs.some(ip => clientIP.includes(ip));

    if (!isAllowed) {
        console.warn(`🚨 Blocked IP: ${clientIP} tried to access protected route`);
        return res.status(403).json({
            success: false,
            error: 'Access denied from this IP address'
        });
    }

    next();
};

// Super Admin IP check
const superAdminIPCheck = ipWhitelist(SUPER_ADMIN_ALLOWED_IPS);

// ============ Session Timeout ============

const sessionTimeout = (timeoutMinutes) => (req, res, next) => {
    if (req.user?.iat) {
        const tokenAge = (Date.now() / 1000) - req.user.iat;
        const maxAge = timeoutMinutes * 60;

        if (tokenAge > maxAge) {
            return res.status(401).json({
                success: false,
                error: 'Session expired, please login again',
                code: 'SESSION_EXPIRED'
            });
        }
    }
    next();
};

// Admin: 30 min timeout
const adminSessionCheck = sessionTimeout(30);

// Super Admin: 15 min timeout
const superAdminSessionCheck = sessionTimeout(15);

// ============ Audit Logging ============

const { query } = require('../db');

const auditLog = async (req, res, next) => {
    const originalSend = res.send;
    const startTime = Date.now();

    res.send = function (body) {
        const duration = Date.now() - startTime;

        // Log admin actions
        if (req.user && ['tenant_admin', 'super_admin'].includes(req.user.role)) {
            const logEntry = {
                user_id: req.user.id,
                user_email: req.user.email,
                user_role: req.user.role,
                action: `${req.method} ${req.originalUrl}`,
                ip_address: req.ip || req.connection.remoteAddress,
                user_agent: req.headers['user-agent'],
                status_code: res.statusCode,
                duration_ms: duration,
                timestamp: new Date().toISOString()
            };

            // Log to console
            console.log(`📝 AUDIT: ${logEntry.user_email} - ${logEntry.action} - ${logEntry.status_code}`);

            // Optional: Log to database (uncomment when audit_logs table exists)
            // try {
            //   query(
            //     `INSERT INTO audit_logs (user_id, action, ip_address, user_agent, status_code, created_at)
            //      VALUES ($1, $2, $3, $4, $5, NOW())`,
            //     [logEntry.user_id, logEntry.action, logEntry.ip_address, logEntry.user_agent, logEntry.status_code]
            //   );
            // } catch (error) {
            //   console.error('Audit log error:', error);
            // }
        }

        return originalSend.call(this, body);
    };

    next();
};

// ============ Security Headers ============

const securityHeaders = (req, res, next) => {
    // Prevent clickjacking
    res.setHeader('X-Frame-Options', 'DENY');

    // XSS protection
    res.setHeader('X-XSS-Protection', '1; mode=block');

    // No MIME sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // Referrer policy
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Content Security Policy (can be stricter)
    res.setHeader('Content-Security-Policy', "default-src 'self'");

    next();
};

// ============ Input Sanitization ============

const sanitizeInput = (req, res, next) => {
    // Sanitize string inputs
    const sanitize = (obj) => {
        if (typeof obj === 'string') {
            // Remove potential SQL injection patterns
            return obj.replace(/[;'"\\]/g, '');
        }
        if (typeof obj === 'object' && obj !== null) {
            for (const key in obj) {
                obj[key] = sanitize(obj[key]);
            }
        }
        return obj;
    };

    if (req.body) {
        req.body = sanitize(req.body);
    }
    if (req.query) {
        req.query = sanitize(req.query);
    }

    next();
};

module.exports = {
    apiLimiter,
    authLimiter,
    adminLimiter,
    superAdminLimiter,
    ipWhitelist,
    superAdminIPCheck,
    adminSessionCheck,
    superAdminSessionCheck,
    auditLog,
    securityHeaders,
    sanitizeInput
};

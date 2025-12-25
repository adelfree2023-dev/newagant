/**
 * CoreFlex Security Middleware
 * الإصدار: 2.1.0-secure
 * 
 * ملف الحماية المتقدمة - يجب وضعه في: api/middleware/security.js
 */

const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const xss = require('xss-clean');
const hpp = require('hpp');
const mongoSanitize = require('express-mongo-sanitize');

// ============================================
// RATE LIMITING CONFIGURATIONS
// ============================================

// Store for tracking failed attempts
const failedAttempts = new Map();
const blockedIPs = new Map();

/**
 * Get failed attempts count for an IP
 */
function getFailures(ip) {
    const record = failedAttempts.get(ip);
    if (!record) return 0;

    // Reset if more than 15 minutes passed
    if (Date.now() - record.lastAttempt > 15 * 60 * 1000) {
        failedAttempts.delete(ip);
        return 0;
    }

    return record.count;
}

/**
 * Record a failed attempt
 */
function recordFailure(ip) {
    const record = failedAttempts.get(ip) || { count: 0, lastAttempt: 0 };
    record.count++;
    record.lastAttempt = Date.now();
    failedAttempts.set(ip, record);

    // Auto-block after 10 failures
    if (record.count >= 10) {
        blockIP(ip, 60 * 60 * 1000); // 1 hour
    }
}

/**
 * Block an IP address
 */
function blockIP(ip, duration = 60 * 60 * 1000) {
    blockedIPs.set(ip, Date.now() + duration);
    console.log(`[SECURITY] IP blocked: ${ip} for ${duration / 1000}s`);
}

/**
 * Check if IP is blocked
 */
function isBlocked(ip) {
    const blockedUntil = blockedIPs.get(ip);
    if (!blockedUntil) return false;

    if (Date.now() > blockedUntil) {
        blockedIPs.delete(ip);
        return false;
    }

    return true;
}

// ============================================
// GENERAL API RATE LIMITER
// ============================================
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: (req) => {
        const failures = getFailures(req.ip);
        if (failures > 5) return 10;  // Reduced limit
        if (failures > 3) return 50;  // Slightly reduced
        return 100; // Normal limit
    },
    message: {
        error: 'Too many requests. Please try again later.',
        retryAfter: 15 * 60, // seconds
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => req.ip,
    handler: (req, res) => {
        recordFailure(req.ip);
        res.status(429).json({
            error: 'Too many requests',
            retryAfter: Math.pow(4, getFailures(req.ip)), // Exponential backoff info
        });
    },
});

// ============================================
// AUTH RATE LIMITER (Stricter)
// ============================================
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 attempts per window
    message: {
        error: 'Too many login attempts. Please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => req.ip,
    handler: (req, res) => {
        recordFailure(req.ip);
        const failures = getFailures(req.ip);
        const delay = Math.pow(4, Math.min(failures, 5)); // 4^n seconds, max 4^5 = 1024s

        res.status(429).json({
            error: 'Too many login attempts',
            retryAfter: delay,
            message: `Please wait ${delay} seconds before trying again.`,
        });
    },
});

// ============================================
// ADMIN RATE LIMITER
// ============================================
const adminLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 100,
    message: {
        error: 'Too many admin requests.',
    },
});

// ============================================
// CIRCUIT BREAKER MIDDLEWARE
// ============================================
const circuitBreaker = (req, res, next) => {
    if (isBlocked(req.ip)) {
        return res.status(403).json({
            error: 'Access temporarily blocked',
            message: 'Your IP has been temporarily blocked due to suspicious activity.',
        });
    }
    next();
};

// ============================================
// HONEYPOT DETECTION
// ============================================
const honeypotDetection = (req, res, next) => {
    // Check for honeypot fields (should be empty)
    const honeypotFields = ['hp_email', 'hp_name', 'website_url', 'fax_number'];

    for (const field of honeypotFields) {
        if (req.body && req.body[field]) {
            // Bot detected!
            blockIP(req.ip, 24 * 60 * 60 * 1000); // Block for 24 hours
            console.log(`[HONEYPOT] Bot detected from IP: ${req.ip}`);

            return res.status(403).json({
                error: 'Request blocked',
            });
        }
    }

    next();
};

// ============================================
// SESSION TIMEOUT MIDDLEWARE
// ============================================
const sessionTimeout = {
    admin: 30 * 60 * 1000,      // 30 minutes for admin
    superadmin: 15 * 60 * 1000, // 15 minutes for superadmin
    customer: 7 * 24 * 60 * 60 * 1000, // 7 days for customers
};

const checkSessionTimeout = (role = 'customer') => {
    return (req, res, next) => {
        if (!req.session || !req.session.lastActivity) {
            return next();
        }

        const timeout = sessionTimeout[role] || sessionTimeout.customer;
        const timeSinceActivity = Date.now() - req.session.lastActivity;

        if (timeSinceActivity > timeout) {
            req.session.destroy();
            return res.status(401).json({
                error: 'Session expired',
                message: 'Your session has expired. Please login again.',
            });
        }

        // Update last activity
        req.session.lastActivity = Date.now();
        next();
    };
};

// ============================================
// SECURITY HEADERS (using Helmet)
// ============================================
const securityHeaders = helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://www.googletagmanager.com"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            imgSrc: ["'self'", "data:", "https:", "blob:"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            connectSrc: ["'self'", "https://api.coreflex.io", "wss:"],
            frameSrc: ["'none'"],
            objectSrc: ["'none'"],
        },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
});

// ============================================
// INPUT SANITIZATION
// ============================================
const inputSanitization = [
    xss(), // Prevent XSS attacks
    hpp(), // Prevent HTTP Parameter Pollution
    mongoSanitize(), // Prevent NoSQL injection
];

// ============================================
// IP WHITELIST FOR ADMIN (Optional)
// ============================================
const ipWhitelist = (allowedIPs = []) => {
    return (req, res, next) => {
        if (allowedIPs.length === 0) {
            return next(); // No whitelist configured
        }

        const clientIP = req.ip || req.connection.remoteAddress;

        if (!allowedIPs.includes(clientIP)) {
            console.log(`[SECURITY] Blocked non-whitelisted IP: ${clientIP}`);
            return res.status(403).json({
                error: 'Access denied',
            });
        }

        next();
    };
};

// ============================================
// AUDIT LOGGING
// ============================================
const auditLog = (action) => {
    return (req, res, next) => {
        const logEntry = {
            timestamp: new Date().toISOString(),
            action: action,
            ip: req.ip,
            userId: req.user?.id || 'anonymous',
            userAgent: req.headers['user-agent'],
            method: req.method,
            path: req.path,
            body: req.method !== 'GET' ? sanitizeBody(req.body) : undefined,
        };

        // Log to console (replace with proper logging service)
        console.log('[AUDIT]', JSON.stringify(logEntry));

        // You can also save to database here
        // await AuditLog.create(logEntry);

        next();
    };
};

function sanitizeBody(body) {
    if (!body) return undefined;

    const sanitized = { ...body };
    // Remove sensitive fields
    delete sanitized.password;
    delete sanitized.currentPassword;
    delete sanitized.newPassword;
    delete sanitized.token;
    delete sanitized.secret;

    return sanitized;
}

// ============================================
// EXPORTS
// ============================================
module.exports = {
    // Rate limiters
    generalLimiter,
    authLimiter,
    adminLimiter,

    // Security middleware
    circuitBreaker,
    honeypotDetection,
    checkSessionTimeout,
    securityHeaders,
    inputSanitization,
    ipWhitelist,
    auditLog,

    // Helper functions
    blockIP,
    isBlocked,
    getFailures,
    recordFailure,
};

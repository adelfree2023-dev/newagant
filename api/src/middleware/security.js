const rateLimit = require('express-rate-limit');

// ============ Storage for Rate Limiting ============
const loginAttempts = new Map(); // IP -> { count, lastAttempt, blockUntil }
const circuitBreaker = { triggered: false, blockedIPs: new Set() };

// ============ ADVANCED Rate Limiters ============

// General API rate limiter
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { success: false, error: 'Too many requests, please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
});

// Exponential Backoff Rate Limiter for Auth
const exponentialBackoffLimiter = (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();

    if (!loginAttempts.has(ip)) {
        loginAttempts.set(ip, { count: 0, lastAttempt: now, blockUntil: 0 });
    }

    const attempt = loginAttempts.get(ip);

    // Check if blocked
    if (attempt.blockUntil > now) {
        const waitSeconds = Math.ceil((attempt.blockUntil - now) / 1000);
        console.warn(`🚫 Blocked IP ${ip}: must wait ${waitSeconds}s`);
        return res.status(429).json({
            success: false,
            error: `Too many attempts. Wait ${waitSeconds} seconds.`,
            retryAfter: waitSeconds
        });
    }

    // Reset if last attempt was > 30 minutes ago
    if (now - attempt.lastAttempt > 30 * 60 * 1000) {
        attempt.count = 0;
    }

    attempt.count++;
    attempt.lastAttempt = now;

    // Exponential backoff: 1s, 4s, 16s, 64s, 256s, 1024s...
    if (attempt.count > 3) {
        const backoffTime = Math.pow(4, attempt.count - 3) * 1000;
        attempt.blockUntil = now + Math.min(backoffTime, 30 * 60 * 1000); // Max 30 min
        console.warn(`⚠️ IP ${ip} blocked for ${backoffTime / 1000}s after ${attempt.count} attempts`);
    }

    loginAttempts.set(ip, attempt);

    // Clear old entries every hour
    if (loginAttempts.size > 10000) {
        for (const [key, val] of loginAttempts) {
            if (now - val.lastAttempt > 60 * 60 * 1000) {
                loginAttempts.delete(key);
            }
        }
    }

    next();
};

// Reset login attempts on successful login
const resetLoginAttempts = (ip) => {
    loginAttempts.delete(ip);
};

// ============ Circuit Breaker ============
const circuitBreakerMiddleware = (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;

    // Check if IP is permanently blocked
    if (circuitBreaker.blockedIPs.has(ip)) {
        console.error(`🚨 CIRCUIT BREAKER: Blocked IP ${ip} tried to access`);
        return res.status(403).json({ success: false, error: 'Access permanently denied' });
    }

    // Check global circuit breaker
    if (circuitBreaker.triggered) {
        // Only allow whitelisted IPs during circuit break
        const whitelist = ['127.0.0.1', '::1', '35.226.47.16'];
        if (!whitelist.some(w => ip.includes(w))) {
            return res.status(503).json({ success: false, error: 'Service temporarily unavailable' });
        }
    }

    next();
};

// Trigger circuit breaker
const triggerCircuitBreaker = (ip, reason) => {
    circuitBreaker.blockedIPs.add(ip);
    console.error(`🚨 CIRCUIT BREAKER TRIGGERED: ${ip} - ${reason}`);

    // Auto-release after 1 hour
    setTimeout(() => {
        circuitBreaker.blockedIPs.delete(ip);
    }, 60 * 60 * 1000);
};

// ============ Honey Pot Detection ============
const honeyPotDetection = (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;

    // Check for honeypot fields (should be empty)
    const honeyPotFields = ['_hp_email', '_hp_captcha', 'website', 'url', 'fax'];
    for (const field of honeyPotFields) {
        if (req.body[field]) {
            console.error(`🍯 HONEYPOT TRIGGERED: ${ip} filled hidden field "${field}"`);
            triggerCircuitBreaker(ip, 'Honeypot triggered');
            return res.status(403).json({ success: false, error: 'Access denied' });
        }
    }

    next();
};

// ============ IP Whitelist ============
const SUPER_ADMIN_ALLOWED_IPS = process.env.SUPER_ADMIN_IPS ?
    process.env.SUPER_ADMIN_IPS.split(',') :
    ['127.0.0.1', '::1', '35.226.47.16'];

const ipWhitelist = (allowedIPs) => (req, res, next) => {
    const clientIP = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for']?.split(',')[0];
    const isAllowed = allowedIPs.some(ip => clientIP.includes(ip));

    if (!isAllowed) {
        console.warn(`🚨 Blocked IP: ${clientIP} tried to access protected route`);
        return res.status(403).json({ success: false, error: 'Access denied from this IP' });
    }
    next();
};

const superAdminIPCheck = ipWhitelist(SUPER_ADMIN_ALLOWED_IPS);

// ============ Session Timeout ============
const sessionTimeout = (timeoutMinutes) => (req, res, next) => {
    if (req.user?.iat) {
        const tokenAge = (Date.now() / 1000) - req.user.iat;
        const maxAge = timeoutMinutes * 60;

        if (tokenAge > maxAge) {
            return res.status(401).json({
                success: false,
                error: 'Session expired',
                code: 'SESSION_EXPIRED'
            });
        }
    }
    next();
};

const adminSessionCheck = sessionTimeout(30);
const superAdminSessionCheck = sessionTimeout(15);

// ============ Advanced Audit Logging ============
const auditLog = async (req, res, next) => {
    const originalSend = res.send;
    const startTime = Date.now();

    res.send = function (body) {
        const duration = Date.now() - startTime;

        if (req.user && ['tenant_admin', 'super_admin'].includes(req.user.role)) {
            const logEntry = {
                timestamp: new Date().toISOString(),
                user: req.user.email,
                role: req.user.role,
                action: `${req.method} ${req.originalUrl}`,
                ip: req.ip,
                userAgent: req.headers['user-agent']?.substring(0, 100),
                status: res.statusCode,
                duration: `${duration}ms`
            };

            // Color-coded logging
            const color = res.statusCode >= 400 ? '\x1b[31m' : '\x1b[32m';
            console.log(`${color}📝 AUDIT: ${logEntry.user} | ${logEntry.action} | ${logEntry.status} | ${logEntry.duration}\x1b[0m`);
        }

        return originalSend.call(this, body);
    };
    next();
};

// ============ Security Headers (Advanced) ============
const securityHeaders = (req, res, next) => {
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;");
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    next();
};

// ============ Input Sanitization (Enhanced) ============
const sanitizeInput = (req, res, next) => {
    const dangerous = /(<script|javascript:|onclick|onerror|onload)/gi;

    const sanitize = (obj) => {
        if (typeof obj === 'string') {
            if (dangerous.test(obj)) {
                console.warn(`⚠️ XSS attempt blocked from ${req.ip}`);
                return obj.replace(dangerous, '');
            }
            return obj.replace(/[;'"\\]/g, '');
        }
        if (typeof obj === 'object' && obj !== null) {
            for (const key in obj) {
                obj[key] = sanitize(obj[key]);
            }
        }
        return obj;
    };

    if (req.body) req.body = sanitize(req.body);
    if (req.query) req.query = sanitize(req.query);
    next();
};

// ============ HttpOnly Cookie Helper ============
const setAuthCookie = (res, token) => {
    res.cookie('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
};

const clearAuthCookie = (res) => {
    res.clearCookie('auth_token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    });
};

module.exports = {
    apiLimiter,
    exponentialBackoffLimiter,
    resetLoginAttempts,
    circuitBreakerMiddleware,
    triggerCircuitBreaker,
    honeyPotDetection,
    ipWhitelist,
    superAdminIPCheck,
    adminSessionCheck,
    superAdminSessionCheck,
    auditLog,
    securityHeaders,
    sanitizeInput,
    setAuthCookie,
    clearAuthCookie
};

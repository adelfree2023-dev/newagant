/**
 * CoreFlex JWT Authentication with HttpOnly Cookies
 * الإصدار: 2.1.0-secure
 * 
 * ملف المصادقة الآمنة - يجب وضعه في: api/middleware/auth.js
 */

const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m'; // Short-lived access token
const REFRESH_TOKEN_EXPIRES_IN = '7d';

// Cookie configuration
const COOKIE_OPTIONS = {
    httpOnly: true,      // Prevents JavaScript access
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    sameSite: 'strict',  // Prevents CSRF
    path: '/',
};

// ============================================
// TOKEN GENERATION
// ============================================

/**
 * Generate access token (short-lived)
 */
function generateAccessToken(user) {
    return jwt.sign(
        {
            id: user.id,
            email: user.email,
            role: user.role,
            tenantId: user.tenant_id,
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );
}

/**
 * Generate refresh token (long-lived)
 */
function generateRefreshToken() {
    return crypto.randomBytes(40).toString('hex');
}

/**
 * Generate CSRF token
 */
function generateCSRFToken() {
    return crypto.randomBytes(32).toString('hex');
}

// ============================================
// SET TOKENS AS COOKIES
// ============================================

/**
 * Set authentication cookies
 */
function setAuthCookies(res, user, rememberMe = false) {
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken();
    const csrfToken = generateCSRFToken();

    // Access token cookie (15 minutes)
    res.cookie('access_token', accessToken, {
        ...COOKIE_OPTIONS,
        maxAge: 15 * 60 * 1000, // 15 minutes
    });

    // Refresh token cookie (7 days or session)
    res.cookie('refresh_token', refreshToken, {
        ...COOKIE_OPTIONS,
        maxAge: rememberMe ? 7 * 24 * 60 * 60 * 1000 : undefined, // 7 days or session
    });

    // CSRF token (readable by JavaScript for inclusion in headers)
    res.cookie('csrf_token', csrfToken, {
        ...COOKIE_OPTIONS,
        httpOnly: false, // Must be readable by JavaScript
        maxAge: 15 * 60 * 1000,
    });

    return { accessToken, refreshToken, csrfToken };
}

/**
 * Clear authentication cookies
 */
function clearAuthCookies(res) {
    res.clearCookie('access_token', COOKIE_OPTIONS);
    res.clearCookie('refresh_token', COOKIE_OPTIONS);
    res.clearCookie('csrf_token', { ...COOKIE_OPTIONS, httpOnly: false });
}

// ============================================
// AUTHENTICATION MIDDLEWARE
// ============================================

/**
 * Verify JWT token from cookie
 */
function authenticate(req, res, next) {
    try {
        // Get token from cookie (preferred) or header (fallback)
        const token = req.cookies?.access_token ||
            req.headers.authorization?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({
                error: 'Authentication required',
                code: 'NO_TOKEN',
            });
        }

        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET);

        // Attach user to request
        req.user = {
            id: decoded.id,
            email: decoded.email,
            role: decoded.role,
            tenantId: decoded.tenantId,
        };

        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                error: 'Token expired',
                code: 'TOKEN_EXPIRED',
            });
        }

        return res.status(401).json({
            error: 'Invalid token',
            code: 'INVALID_TOKEN',
        });
    }
}

/**
 * Optional authentication (doesn't fail if no token)
 */
function optionalAuth(req, res, next) {
    try {
        const token = req.cookies?.access_token ||
            req.headers.authorization?.replace('Bearer ', '');

        if (token) {
            const decoded = jwt.verify(token, JWT_SECRET);
            req.user = {
                id: decoded.id,
                email: decoded.email,
                role: decoded.role,
                tenantId: decoded.tenantId,
            };
        }
    } catch (error) {
        // Ignore errors, continue without user
    }

    next();
}

// ============================================
// ROLE-BASED ACCESS CONTROL
// ============================================

/**
 * Require specific role(s)
 */
function requireRole(...roles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                error: 'Authentication required',
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                error: 'Insufficient permissions',
                required: roles,
                current: req.user.role,
            });
        }

        next();
    };
}

/**
 * Require admin role
 */
const requireAdmin = requireRole('admin', 'superadmin');

/**
 * Require superadmin role
 */
const requireSuperAdmin = requireRole('superadmin');

// ============================================
// CSRF PROTECTION
// ============================================

/**
 * Verify CSRF token
 */
function verifyCSRF(req, res, next) {
    // Skip for GET, HEAD, OPTIONS
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
        return next();
    }

    const csrfCookie = req.cookies?.csrf_token;
    const csrfHeader = req.headers['x-csrf-token'];

    if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
        return res.status(403).json({
            error: 'Invalid CSRF token',
        });
    }

    next();
}

// ============================================
// REFRESH TOKEN LOGIC
// ============================================

/**
 * Refresh access token
 * This should be called when access token expires
 */
async function refreshAccessToken(req, res) {
    const refreshToken = req.cookies?.refresh_token;

    if (!refreshToken) {
        return res.status(401).json({
            error: 'Refresh token required',
        });
    }

    try {
        // In production, validate refresh token against database
        // const storedToken = await RefreshToken.findOne({ token: refreshToken });
        // if (!storedToken || storedToken.revoked) { throw new Error('Invalid'); }
        // const user = await User.findById(storedToken.userId);

        // For now, decode the old access token to get user info
        // In production, store user data with refresh token
        const oldToken = req.cookies?.access_token;

        if (!oldToken) {
            throw new Error('No access token');
        }

        // Verify without checking expiration
        const decoded = jwt.verify(oldToken, JWT_SECRET, { ignoreExpiration: true });

        // Generate new tokens
        const user = { id: decoded.id, email: decoded.email, role: decoded.role, tenant_id: decoded.tenantId };
        const tokens = setAuthCookies(res, user);

        return res.json({
            message: 'Token refreshed',
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        clearAuthCookies(res);
        return res.status(401).json({
            error: 'Invalid refresh token',
        });
    }
}

// ============================================
// EXPORTS
// ============================================

module.exports = {
    // Token functions
    generateAccessToken,
    generateRefreshToken,
    generateCSRFToken,

    // Cookie functions
    setAuthCookies,
    clearAuthCookies,

    // Middleware
    authenticate,
    authenticateToken: authenticate, // Alias for backwards compatibility
    optionalAuth,
    requireRole,
    requireAdmin,
    requireSuperAdmin,
    verifyCSRF,

    // Refresh token
    refreshAccessToken,

    // Constants
    JWT_SECRET,
    COOKIE_OPTIONS,
};

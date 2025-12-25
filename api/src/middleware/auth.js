const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'coreflex_super_secret_key_2024';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// ============ Auth Middleware ============

// Verify JWT token
const authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, error: 'No token provided' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);

        req.user = decoded;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, error: 'Token expired' });
        }
        return res.status(401).json({ success: false, error: 'Invalid token' });
    }
};

// Optional authentication (doesn't fail if no token)
const optionalAuth = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            req.user = jwt.verify(token, JWT_SECRET);
        }
        next();
    } catch (error) {
        next(); // Continue without user
    }
};

// Check if user is admin
const requireAdmin = (req, res, next) => {
    if (!req.user || !['tenant_admin', 'super_admin'].includes(req.user.role)) {
        return res.status(403).json({ success: false, error: 'Admin access required' });
    }
    next();
};

// Check if user is super admin
const requireSuperAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'super_admin') {
        return res.status(403).json({ success: false, error: 'Super admin access required' });
    }
    next();
};

// Generate JWT token
const generateToken = (user) => {
    return jwt.sign(
        {
            id: user.id,
            email: user.email,
            name: user.name,
            tenant_id: user.tenant_id,
            role: user.role
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );
};

// Generate refresh token (longer expiry)
const generateRefreshToken = (user) => {
    return jwt.sign(
        { id: user.id },
        JWT_SECRET,
        { expiresIn: '30d' }
    );
};

module.exports = {
    authenticate,
    optionalAuth,
    requireAdmin,
    requireSuperAdmin,
    generateToken,
    generateRefreshToken,
    JWT_SECRET
};

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { generateToken, generateRefreshToken, authenticate } = require('../middleware/auth');
const { tenantMiddleware } = require('../middleware/tenant');

// ============ Auth Routes ============

// POST /api/auth/register - Register new user
router.post('/register', tenantMiddleware, async (req, res) => {
    try {
        const { email, password, name, phone } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, error: 'Email and password required' });
        }

        // Check if email exists
        const existing = await User.findByEmail(email);
        if (existing) {
            return res.status(400).json({ success: false, error: 'Email already registered' });
        }

        // Create user
        const user = await User.create({
            tenant_id: req.tenant_id,
            email,
            password,
            name,
            phone,
            role: 'customer'
        });

        // Generate tokens
        const token = generateToken(user);
        const refreshToken = generateRefreshToken(user);

        res.status(201).json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            },
            token,
            refreshToken
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ success: false, error: 'Registration failed' });
    }
});

// POST /api/auth/login - Login user
router.post('/login', tenantMiddleware, async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, error: 'Email and password required' });
        }

        // Find user
        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(401).json({ success: false, error: 'Invalid email or password' });
        }

        // Verify password
        const isValid = await User.verifyPassword(user, password);
        if (!isValid) {
            return res.status(401).json({ success: false, error: 'Invalid email or password' });
        }

        // Generate tokens
        const token = generateToken(user);
        const refreshToken = generateRefreshToken(user);

        res.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                phone: user.phone,
                role: user.role,
                tenant_id: user.tenant_id
            },
            token,
            refreshToken
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, error: 'Login failed' });
    }
});

// GET /api/auth/me - Get current user
router.get('/me', authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        res.json({
            success: true,
            user
        });
    } catch (error) {
        console.error('Get me error:', error);
        res.status(500).json({ success: false, error: 'Failed to get user' });
    }
});

// PUT /api/auth/profile - Update profile
router.put('/profile', authenticate, async (req, res) => {
    try {
        const { name, phone, avatar_url } = req.body;

        const user = await User.update(req.user.id, { name, phone, avatar_url });

        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        res.json({
            success: true,
            user
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ success: false, error: 'Failed to update profile' });
    }
});

// PUT /api/auth/password - Change password
router.put('/password', authenticate, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ success: false, error: 'Current and new password required' });
        }

        // Find user with password
        const user = await User.findByEmail(req.user.email);

        // Verify current password
        const isValid = await User.verifyPassword(user, currentPassword);
        if (!isValid) {
            return res.status(401).json({ success: false, error: 'Current password is incorrect' });
        }

        // Update password
        await User.updatePassword(req.user.id, newPassword);

        res.json({
            success: true,
            message: 'Password updated successfully'
        });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ success: false, error: 'Failed to change password' });
    }
});

// POST /api/auth/logout - Logout (client-side token invalidation)
router.post('/logout', authenticate, (req, res) => {
    // In a real app, you might blacklist the token
    res.json({
        success: true,
        message: 'Logged out successfully'
    });
});

module.exports = router;

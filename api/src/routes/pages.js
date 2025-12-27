const express = require('express');
const router = express.Router();
const { tenantMiddleware } = require('../middleware/tenant');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { query } = require('../db');

// Middleware
router.use(tenantMiddleware);

// GET /api/pages - Get all pages content (Public/Admin)
router.get('/', async (req, res) => {
    try {
        const result = await query(
            'SELECT settings FROM tenants WHERE id = $1',
            [req.tenant_id]
        );

        const settings = result.rows[0]?.settings || {};
        const pages = settings.pages || {
            about: '',
            shipping: '',
            returns: '',
            contact: '',
            faq: []
        };

        res.json({ success: true, data: pages });
    } catch (error) {
        console.error('Pages fetch error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch pages' });
    }
});

// PUT /api/pages - Update pages content (Admin only)
router.put('/', authenticate, requireAdmin, async (req, res) => {
    try {
        const { about, shipping, returns, contact, faq } = req.body;

        // 1. Get current settings
        const currentRes = await query(
            'SELECT settings FROM tenants WHERE id = $1',
            [req.tenant_id]
        );
        const currentSettings = currentRes.rows[0]?.settings || {};

        // 2. Merge new pages content
        const newSettings = {
            ...currentSettings,
            pages: {
                ...currentSettings.pages,
                about,
                shipping,
                returns,
                contact,
                faq
            }
        };

        // 3. Update DB
        const updateRes = await query(
            'UPDATE tenants SET settings = $2 WHERE id = $1 RETURNING settings',
            [req.tenant_id, newSettings]
        );

        res.json({ success: true, data: updateRes.rows[0].settings.pages });
    } catch (error) {
        console.error('Pages update error:', error);
        res.status(500).json({ success: false, error: 'Failed to update pages' });
    }
});

module.exports = router;

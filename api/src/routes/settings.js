const express = require('express');
const router = express.Router();
const { query } = require('../db');
const { authenticate, requireAdmin } = require('../middleware/auth');

// GET /api/settings - Get Store Settings
router.get('/', authenticate, async (req, res) => {
    try {
        const result = await query(
            'SELECT settings, theme_id, theme_config FROM tenants WHERE id = $1',
            [req.tenant_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Store not found' });
        }

        const { settings, theme_id, theme_config } = result.rows[0];

        // Merge theme data into response
        const responseData = {
            ...settings,
            theme_id: theme_id || 'modern',
            theme_config: theme_config || {}
        };

        res.json({ success: true, data: responseData });
    } catch (error) {
        console.error('Get settings error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// PUT /api/settings - Update Store Settings
router.put('/', authenticate, requireAdmin, async (req, res) => {
    try {
        const { theme_id, theme_config, ...otherSettings } = req.body;

        // 1. Update theme_id if provided (with governance check)
        if (theme_id) {
            // Governance: Check if theme is allowed for this tenant's plan
            const tenantInfo = await query(
                'SELECT allowed_themes, plan FROM tenants WHERE id = $1',
                [req.tenant_id]
            );

            if (tenantInfo.rows.length > 0) {
                const { allowed_themes, plan } = tenantInfo.rows[0];

                // Premium themes list (can be expanded)
                const PREMIUM_THEMES = ['luxury', 'esports', 'jewelry', 'watches', 'ramadan'];
                const isPremiumTheme = PREMIUM_THEMES.includes(theme_id);
                const isFreePlan = !plan || plan === 'free' || plan === 'basic';

                // Check 1: If allowed_themes is set, enforce it
                if (allowed_themes && Array.isArray(allowed_themes) && allowed_themes.length > 0) {
                    if (!allowed_themes.includes(theme_id) && !allowed_themes.includes('*')) {
                        return res.status(403).json({
                            success: false,
                            error: 'هذا الثيم غير متاح في باقتك الحالية',
                            error_en: 'This theme is not available in your current plan',
                            upgrade_required: true,
                            theme_id: theme_id
                        });
                    }
                }

                // Check 2: Block premium themes for free plans
                if (isPremiumTheme && isFreePlan) {
                    return res.status(403).json({
                        success: false,
                        error: 'الثيمات المميزة تتطلب ترقية الباقة',
                        error_en: 'Premium themes require plan upgrade',
                        upgrade_required: true,
                        theme_id: theme_id
                    });
                }
            }

            await query(
                'UPDATE tenants SET theme_id = $1 WHERE id = $2',
                [theme_id, req.tenant_id]
            );
        }

        // 2. Update theme_config if provided
        if (theme_config) {
            await query(
                'UPDATE tenants SET theme_config = $1 WHERE id = $2',
                [theme_config, req.tenant_id]
            );
        }

        // 3. Update general settings (JSONB merge)
        if (Object.keys(otherSettings).length > 0) {
            // Fetch current settings first to merge
            const currentRes = await query('SELECT settings FROM tenants WHERE id = $1', [req.tenant_id]);
            const currentSettings = currentRes.rows[0]?.settings || {};

            const newSettings = { ...currentSettings, ...otherSettings };

            await query(
                'UPDATE tenants SET settings = $1 WHERE id = $2',
                [newSettings, req.tenant_id]
            );
        }

        res.json({ success: true, message: 'Settings updated successfully' });
    } catch (error) {
        console.error('Update settings error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const { tenantMiddleware } = require('../middleware/tenant');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { query } = require('../db');

// Middleware
router.use(tenantMiddleware);

// Governance: Plan Limits
const PLAN_LIMITS = {
    'Starter': 3,
    'Pro': 10,
    'Business': 50,
    'Enterprise': 9999
};

// GET /api/pages - List all pages (Admin)
router.get('/', authenticate, requireAdmin, async (req, res) => {
    try {
        const result = await query(
            'SELECT * FROM tenant_pages WHERE tenant_id = $1 ORDER BY created_at DESC',
            [req.tenant_id]
        );
        res.json({ success: true, data: result.rows });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch pages' });
    }
});

// GET /api/pages/:slug - Get single page (Public)
// This override the router.use(authenticate) logic because it's public
router.get('/:slug', async (req, res) => {
    try {
        const result = await query(
            'SELECT * FROM tenant_pages WHERE tenant_id = $1 AND slug = $2',
            [req.tenant_id, req.params.slug]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Page not found' });
        }

        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch page' });
    }
});

// POST /api/pages - Create new page (Admin + Governance Check)
router.post('/', authenticate, requireAdmin, async (req, res) => {
    try {
        const { title, slug, content } = req.body;

        // 1. Governance Check: Plan Limit
        const tenantRes = await query('SELECT plan FROM tenants WHERE id = $1', [req.tenant_id]);
        const plan = tenantRes.rows[0]?.plan || 'Starter';
        const limit = PLAN_LIMITS[plan] || 3;

        const countRes = await query('SELECT COUNT(*) FROM tenant_pages WHERE tenant_id = $1', [req.tenant_id]);
        const currentCount = parseInt(countRes.rows[0].count);

        if (currentCount >= limit) {
            return res.status(403).json({
                success: false,
                error: `Plan limit reached. Your ${plan} plan allows maximum ${limit} pages.`
            });
        }

        // 2. Create Page
        const result = await query(
            `INSERT INTO tenant_pages (tenant_id, title, slug, content) 
             VALUES ($1, $2, $3, $4) 
             RETURNING *`,
            [req.tenant_id, title, slug, content]
        );

        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        if (error.code === '23505') { // Unique violation
            return res.status(400).json({ success: false, error: 'Page with this slug already exists' });
        }
        res.status(500).json({ success: false, error: 'Failed to create page' });
    }
});

// PUT /api/pages/:id - Update page
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
    try {
        const { title, content, is_published } = req.body;
        const result = await query(
            `UPDATE tenant_pages 
             SET title = $2, content = $3, is_published = $4, updated_at = NOW() 
             WHERE id = $1 AND tenant_id = $5 
             RETURNING *`,
            [req.params.id, title, content, is_published, req.tenant_id]
        );
        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to update page' });
    }
});

// DELETE /api/pages/:id - Delete page
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
    try {
        await query('DELETE FROM tenant_pages WHERE id = $1 AND tenant_id = $2', [req.params.id, req.tenant_id]);
        res.json({ success: true, message: 'Page deleted' });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to delete page' });
    }
});

module.exports = router;

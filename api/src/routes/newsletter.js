const express = require('express');
const router = express.Router();
const { tenantMiddleware } = require('../middleware/tenant');
const { query } = require('../db');

// Middleware
router.use(tenantMiddleware);

// Initialize table (Lazy initialization for prototype)
const initTable = async () => {
    try {
        await query(`
            CREATE TABLE IF NOT EXISTS newsletter_subscribers (
                id SERIAL PRIMARY KEY,
                tenant_id VARCHAR(50) NOT NULL,
                email VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(tenant_id, email)
            )
        `);
    } catch (e) {
        console.error('Failed to init newsletter table', e);
    }
};
initTable(); // Run on module load

// POST /api/newsletter/subscribe - Public
router.post('/subscribe', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email || !email.includes('@')) {
            return res.status(400).json({ success: false, error: 'البريد الإلكتروني غير صحيح' });
        }

        await query(
            `INSERT INTO newsletter_subscribers (tenant_id, email) 
             VALUES ($1, $2) 
             ON CONFLICT (tenant_id, email) DO NOTHING`,
            [req.tenant_id, email]
        );

        res.json({ success: true, message: 'تم الاشتراك بنجاح' });
    } catch (error) {
        console.error('Newsletter subscribe error:', error);
        res.status(500).json({ success: false, error: 'فشل الاشتراك' });
    }
});

// GET /api/newsletter - Admin Only (Should add auth middleware here ideally, or handle in main route)
router.get('/', async (req, res) => {
    try {
        const result = await query(
            `SELECT * FROM newsletter_subscribers WHERE tenant_id = $1 ORDER BY created_at DESC`,
            [req.tenant_id]
        );
        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error('Newsletter list error:', error);
        res.status(500).json({ success: false, error: 'فشل تحميل القائمة' });
    }
});

module.exports = router;

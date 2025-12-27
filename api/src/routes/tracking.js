const express = require('express');
const router = express.Router();
const { tenantMiddleware } = require('../middleware/tenant');
const { query } = require('../db');

// Middleware
router.use(tenantMiddleware);

// GET /api/tracking/:id
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Basic validation
        if (!id || isNaN(id)) {
            return res.status(400).json({ success: false, error: 'رقم الطلب غير صحيح' });
        }

        const result = await query(
            `SELECT id, status, total_amount, created_at, 
            (SELECT COUNT(*) FROM order_items WHERE order_id = orders.id) as items_count
             FROM orders 
             WHERE id = $1 AND tenant_id = $2`,
            [id, req.tenant_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'الطلب غير موجود' });
        }

        const order = result.rows[0];

        // Format Date
        const date = new Date(order.created_at).toLocaleDateString('ar-EG', {
            year: 'numeric', month: 'long', day: 'numeric'
        });

        res.json({
            success: true,
            data: {
                id: order.id,
                status: order.status,
                total: order.total_amount,
                date: date,
                items_count: order.items_count
            }
        });

    } catch (error) {
        console.error('Tracking error:', error);
        res.status(500).json({ success: false, error: 'فشل تتبع الطلب' });
    }
});

module.exports = router;

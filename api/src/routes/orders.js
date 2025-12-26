const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { query } = require('../db');
const { tenantMiddleware } = require('../middleware/tenant');
const { authenticate, requireAdmin } = require('../middleware/auth');

router.use(tenantMiddleware);

// ============ Customer Routes ============

// GET /api/orders - User's orders
router.get('/', authenticate, async (req, res) => {
    try {
        const orders = await Order.findByUser(req.user.id, {
            limit: parseInt(req.query.limit) || 20,
            offset: 0
        });
        res.json({ success: true, data: orders });
    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({ success: false, error: 'Failed to get orders' });
    }
});

// GET /api/orders/:id - Single order
router.get('/:id', authenticate, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id, req.tenant_id);

        if (!order) return res.status(404).json({ success: false, error: 'Order not found' });

        // Check ownership (unless admin)
        if (order.user_id !== req.user.id && !['tenant_admin', 'super_admin'].includes(req.user.role)) {
            return res.status(403).json({ success: false, error: 'Access denied' });
        }

        res.json({ success: true, data: order });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to get order' });
    }
});

// POST /api/orders - Create order
router.post('/', authenticate, async (req, res) => {
    try {
        const { items, shipping_address, payment_method, notes } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ success: false, error: 'Order must have items' });
        }

        // Calculate totals
        let subtotal = 0;
        for (const item of items) {
            subtotal += item.price * item.quantity;
        }

        const shipping_cost = subtotal >= 200 ? 0 : 25; // Free shipping over 200
        const total = subtotal + shipping_cost;

        const order = await Order.create({
            tenant_id: req.tenant_id,
            user_id: req.user.id,
            items,
            subtotal,
            shipping_cost,
            total,
            shipping_address,
            payment_method: payment_method || 'cod',
            notes
        });

        res.status(201).json({
            success: true,
            data: order,
            message: 'تم إنشاء الطلب بنجاح!'
        });
    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({ success: false, error: 'Failed to create order' });
    }
});

// ============ Admin Routes ============

// GET /api/orders/admin/all - All orders (admin)
router.get('/admin/all', authenticate, requireAdmin, async (req, res) => {
    try {
        const { status, limit = 50, page = 1 } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        const orders = await Order.findAll(req.tenant_id, {
            status,
            limit: parseInt(limit),
            offset
        });

        const total = await Order.count(req.tenant_id, { status });

        res.json({
            success: true,
            data: orders,
            pagination: { page: parseInt(page), limit: parseInt(limit), total }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to get orders' });
    }
});

// GET /api/orders/admin/stats - Order stats (admin)
router.get('/admin/stats', authenticate, requireAdmin, async (req, res) => {
    try {
        const stats = await Order.getStats(req.tenant_id);
        res.json({ success: true, data: stats });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to get stats' });
    }
});

// PUT /api/orders/:id/status - Update order status (admin)
router.put('/:id/status', authenticate, requireAdmin, async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, error: 'Invalid status' });
        }

        const order = await Order.updateStatus(req.params.id, req.tenant_id, status);

        if (!order) return res.status(404).json({ success: false, error: 'Order not found' });

        res.json({ success: true, data: order });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to update order' });
    }
});

module.exports = router;

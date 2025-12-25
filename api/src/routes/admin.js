const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const { extractTenant } = require('../middleware/tenant');
const { authenticate, requireAdmin } = require('../middleware/auth');

router.use(extractTenant);
router.use(authenticate);
router.use(requireAdmin);

// GET /api/admin/dashboard - Dashboard stats
router.get('/dashboard', async (req, res) => {
    try {
        const orderStats = await Order.getStats(req.tenant_id);
        const productsCount = await Product.count(req.tenant_id);
        const customersCount = await User.countCustomers(req.tenant_id);

        res.json({
            success: true,
            data: {
                today_orders: parseInt(orderStats.today_orders) || 0,
                today_revenue: parseFloat(orderStats.today_revenue) || 0,
                total_orders: parseInt(orderStats.total_orders) || 0,
                total_revenue: parseFloat(orderStats.total_revenue) || 0,
                pending_orders: parseInt(orderStats.pending_orders) || 0,
                processing_orders: parseInt(orderStats.processing_orders) || 0,
                total_products: productsCount,
                total_customers: customersCount
            }
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({ success: false, error: 'Failed to get dashboard stats' });
    }
});

// GET /api/admin/recent-orders
router.get('/recent-orders', async (req, res) => {
    try {
        const orders = await Order.findAll(req.tenant_id, { limit: 10 });
        res.json({ success: true, data: orders });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to get recent orders' });
    }
});

// GET /api/admin/customers
router.get('/customers', async (req, res) => {
    try {
        const customers = await User.findByTenant(req.tenant_id, { role: 'customer' });
        res.json({ success: true, data: customers });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to get customers' });
    }
});

module.exports = router;

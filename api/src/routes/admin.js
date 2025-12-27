const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const Tenant = require('../models/Tenant'); // Added Tenant model
const { tenantMiddleware } = require('../middleware/tenant');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { query } = require('../db'); // Added query

router.use(tenantMiddleware);
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

// GET /api/admin/store/config - Get store settings
router.get('/store/config', async (req, res) => {
    try {
        const tenant = await Tenant.findById(req.tenant_id);
        res.json({ success: true, data: tenant.settings || {} });
    } catch (error) {
        console.error('Get config error:', error);
        res.status(500).json({ success: false, error: 'Failed to get config' });
    }
});

// PUT /api/admin/store/config - Update store settings
router.put('/store/config', async (req, res) => {
    try {
        const newSettings = req.body;

        // 1. Get current settings to merge
        const tenant = await Tenant.findById(req.tenant_id);
        const currentSettings = tenant.settings || {};

        // 2. Deep merge (simplified)
        const updatedSettings = {
            ...currentSettings,
            ...newSettings,
            // Ensure nested objects like social_floating are verified/merged if needed
            // customizable logic here
        };

        // 3. Update DB
        // Assuming Tenant model doesn't have updateSettings method yet, using direct query or basic update
        // Using direct query for specific column update is safer
        const result = await query(
            'UPDATE tenants SET settings = $2, updated_at = NOW() WHERE id = $1 RETURNING settings',
            [req.tenant_id, updatedSettings]
        );

        res.json({ success: true, data: result.rows[0].settings });
    } catch (error) {
        console.error('Update config error:', error);
        res.status(500).json({ success: false, error: 'Failed to update config' });
    }
});

module.exports = router;

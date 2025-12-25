const express = require('express');
const router = express.Router();
const Tenant = require('../models/Tenant');
const User = require('../models/User');
const Order = require('../models/Order');
const { query } = require('../db');
const { authenticate, requireSuperAdmin } = require('../middleware/auth');
const { superAdminLimiter, superAdminIPCheck, superAdminSessionCheck, auditLog } = require('../middleware/security');

// ============ Apply Super Admin Security ============
router.use(superAdminLimiter);
router.use(authenticate);
router.use(requireSuperAdmin);
router.use(superAdminSessionCheck);
router.use(auditLog);
// IP whitelist (uncomment in production)
// router.use(superAdminIPCheck);

// ============ Dashboard ============

router.get('/dashboard', async (req, res) => {
    try {
        const tenantStats = await Tenant.getStats();

        // Get total orders and revenue across all tenants
        const orderStats = await query(`
      SELECT 
        COUNT(*) as total_orders,
        COALESCE(SUM(total), 0) as total_revenue,
        COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE) as today_orders,
        COALESCE(SUM(total) FILTER (WHERE created_at >= CURRENT_DATE), 0) as today_revenue
      FROM orders
    `);

        res.json({
            success: true,
            data: {
                tenants: tenantStats,
                orders: orderStats.rows[0],
                platform_health: 'healthy'
            }
        });
    } catch (error) {
        console.error('SuperAdmin dashboard error:', error);
        res.status(500).json({ success: false, error: 'Failed to get dashboard' });
    }
});

// ============ Tenants Management ============

router.get('/tenants', async (req, res) => {
    try {
        const { status, limit = 50, page = 1 } = req.query;
        const tenants = await Tenant.findAll({ status, limit: parseInt(limit), offset: (page - 1) * limit });
        const total = await Tenant.count({ status });

        res.json({
            success: true,
            data: tenants,
            pagination: { page: parseInt(page), limit: parseInt(limit), total }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to get tenants' });
    }
});

router.post('/tenants', async (req, res) => {
    try {
        const tenant = await Tenant.create(req.body);
        console.log(`🏪 New tenant created by SuperAdmin: ${tenant.name}`);
        res.status(201).json({ success: true, data: tenant });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to create tenant' });
    }
});

router.put('/tenants/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const tenant = await Tenant.updateStatus(req.params.id, status);
        console.log(`🔄 Tenant ${req.params.id} status changed to: ${status}`);
        res.json({ success: true, data: tenant });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to update tenant' });
    }
});

router.put('/tenants/:id/plan', async (req, res) => {
    try {
        const { plan } = req.body;
        const tenant = await Tenant.updatePlan(req.params.id, plan);
        console.log(`📦 Tenant ${req.params.id} plan changed to: ${plan}`);
        res.json({ success: true, data: tenant });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to update plan' });
    }
});

// ============ Users Management ============

router.get('/users', async (req, res) => {
    try {
        const result = await query(`
      SELECT u.id, u.email, u.name, u.role, u.created_at, t.name as tenant_name
      FROM users u
      LEFT JOIN tenants t ON u.tenant_id = t.id
      ORDER BY u.created_at DESC
      LIMIT 100
    `);
        res.json({ success: true, data: result.rows });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to get users' });
    }
});

// ============ Platform Stats ============

router.get('/stats', async (req, res) => {
    try {
        const stats = await query(`
      SELECT 
        (SELECT COUNT(*) FROM tenants) as total_tenants,
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COUNT(*) FROM products) as total_products,
        (SELECT COUNT(*) FROM orders) as total_orders,
        (SELECT COALESCE(SUM(total), 0) FROM orders) as total_revenue
    `);
        res.json({ success: true, data: stats.rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to get stats' });
    }
});

// ============ Audit Logs ============

router.get('/audit-logs', async (req, res) => {
    try {
        // Return recent logs from memory/file (or database if table exists)
        res.json({
            success: true,
            data: [],
            message: 'Audit logs are being recorded to console. Database table pending.'
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to get audit logs' });
    }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const { query } = require('../db');
const { authenticate, requireAdmin, requireSuperAdmin } = require('../middleware/auth');

// ============ Admin Dashboard Stats ============

// GET /api/dashboard/admin/stats - Get admin dashboard statistics
router.get('/admin/stats', authenticate, requireAdmin, async (req, res) => {
    try {
        const tenantId = req.user.tenant_id;

        // Today's date range
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Parallel queries for performance
        const [
            todaySales,
            todayOrders,
            totalProducts,
            totalCustomers,
            recentOrders,
            topProducts
        ] = await Promise.all([
            // Today's sales
            query(`
                SELECT COALESCE(SUM(total), 0) as total 
                FROM orders 
                WHERE tenant_id = $1 AND created_at >= $2 AND created_at < $3
            `, [tenantId, today, tomorrow]),

            // Today's orders count
            query(`
                SELECT COUNT(*) as count 
                FROM orders 
                WHERE tenant_id = $1 AND created_at >= $2 AND created_at < $3
            `, [tenantId, today, tomorrow]),

            // Total products
            query(`
                SELECT COUNT(*) as count 
                FROM products 
                WHERE tenant_id = $1 AND is_active = true
            `, [tenantId]),

            // Total customers
            query(`
                SELECT COUNT(*) as count 
                FROM users 
                WHERE tenant_id = $1 AND role = 'customer'
            `, [tenantId]),

            // Recent orders (last 5)
            query(`
                SELECT o.id, o.order_number, o.total, o.status, o.created_at,
                       u.name as customer_name
                FROM orders o
                LEFT JOIN users u ON o.user_id = u.id
                WHERE o.tenant_id = $1
                ORDER BY o.created_at DESC
                LIMIT 5
            `, [tenantId]),

            // Top selling products
            query(`
                SELECT p.id, p.name, p.image_url,
                       COUNT(oi.id) as sales_count,
                       COALESCE(SUM(oi.quantity * oi.price), 0) as revenue
                FROM products p
                LEFT JOIN order_items oi ON p.id = oi.product_id
                WHERE p.tenant_id = $1
                GROUP BY p.id, p.name, p.image_url
                ORDER BY sales_count DESC
                LIMIT 4
            `, [tenantId])
        ]);

        res.json({
            success: true,
            stats: {
                todaySales: parseFloat(todaySales.rows[0]?.total || 0),
                todayOrders: parseInt(todayOrders.rows[0]?.count || 0),
                totalProducts: parseInt(totalProducts.rows[0]?.count || 0),
                totalCustomers: parseInt(totalCustomers.rows[0]?.count || 0)
            },
            recentOrders: recentOrders.rows.map(o => ({
                id: o.order_number || o.id,
                customer: o.customer_name || 'عميل',
                total: parseFloat(o.total),
                status: o.status,
                date: o.created_at
            })),
            topProducts: topProducts.rows.map(p => ({
                id: p.id,
                name: p.name,
                image: p.image_url,
                sales: parseInt(p.sales_count),
                revenue: parseFloat(p.revenue)
            }))
        });
    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch dashboard stats' });
    }
});

// ============ Super Admin Dashboard Stats ============

// GET /api/dashboard/superadmin/stats - Get platform-wide statistics
router.get('/superadmin/stats', authenticate, requireSuperAdmin, async (req, res) => {
    try {
        // Today's date range
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        // Parallel queries
        const [
            totalTenants,
            activeTenants,
            monthlyRevenue,
            totalUsers,
            recentTenants,
            alerts
        ] = await Promise.all([
            // Total tenants
            query(`SELECT COUNT(*) as count FROM tenants`),

            // Active tenants (had orders this month)
            query(`
                SELECT COUNT(DISTINCT tenant_id) as count 
                FROM orders 
                WHERE created_at >= $1
            `, [thisMonth]),

            // Monthly revenue (sum of all orders)
            query(`
                SELECT COALESCE(SUM(total), 0) as total 
                FROM orders 
                WHERE created_at >= $1
            `, [thisMonth]),

            // Total users across platform
            query(`SELECT COUNT(*) as count FROM users`),

            // Recent tenants
            query(`
                SELECT t.id, t.store_name, t.email, t.plan, t.status, t.created_at,
                       (SELECT COUNT(*) FROM orders WHERE tenant_id = t.id AND created_at >= $1) as orders_count,
                       (SELECT COALESCE(SUM(total), 0) FROM orders WHERE tenant_id = t.id) as total_revenue
                FROM tenants t
                ORDER BY t.created_at DESC
                LIMIT 5
            `, [thisMonth]),

            // Alerts (example: pending tenant approvals, usage limits)
            query(`
                SELECT COUNT(*) as count 
                FROM tenants 
                WHERE status = 'pending'
            `)
        ]);

        res.json({
            success: true,
            stats: {
                totalTenants: parseInt(totalTenants.rows[0]?.count || 0),
                activeTenants: parseInt(activeTenants.rows[0]?.count || 0),
                monthlyRevenue: parseFloat(monthlyRevenue.rows[0]?.total || 0),
                totalUsers: parseInt(totalUsers.rows[0]?.count || 0)
            },
            recentTenants: recentTenants.rows.map(t => ({
                id: t.id,
                name: t.store_name,
                email: t.email,
                plan: t.plan || 'free',
                status: t.status || 'active',
                ordersCount: parseInt(t.orders_count || 0),
                revenue: parseFloat(t.total_revenue || 0),
                createdAt: t.created_at
            })),
            alerts: [
                { type: 'pending_approvals', count: parseInt(alerts.rows[0]?.count || 0) }
            ]
        });
    } catch (error) {
        console.error('SuperAdmin dashboard stats error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch dashboard stats' });
    }
});

module.exports = router;

/**
 * CoreFlex RBAC (Role-Based Access Control) System
 * الإصدار: 2.1.0-saas
 * 
 * نظام الصلاحيات المتقدم - يجب وضعه في: api/services/rbac/index.js
 * 
 * يدعم الأدوار: Owner, Manager, Shipper, Accountant, Support
 */

const db = require('../../db');

// ============================================
// DEFAULT ROLES & PERMISSIONS
// ============================================

const DEFAULT_ROLES = {
    owner: {
        name: 'Owner',
        name_ar: 'المالك',
        description: 'Full access to everything',
        permissions: ['*'], // Wildcard = all permissions
    },
    manager: {
        name: 'Manager',
        name_ar: 'مدير',
        description: 'Manage products, orders, and customers',
        permissions: [
            'dashboard.view',
            'products.*',
            'categories.*',
            'orders.*',
            'customers.view',
            'customers.edit',
            'reports.view',
            'settings.view',
        ],
    },
    shipper: {
        name: 'Shipper',
        name_ar: 'مسؤول الشحن',
        description: 'Handle order shipping only',
        permissions: [
            'dashboard.view',
            'orders.view',
            'orders.ship',
            'orders.update_status',
        ],
    },
    accountant: {
        name: 'Accountant',
        name_ar: 'محاسب',
        description: 'View financial data and reports',
        permissions: [
            'dashboard.view',
            'orders.view',
            'reports.*',
            'payments.view',
            'refunds.view',
        ],
    },
    support: {
        name: 'Support',
        name_ar: 'دعم فني',
        description: 'Customer support access',
        permissions: [
            'dashboard.view',
            'orders.view',
            'customers.view',
            'customers.edit',
            'messages.*',
        ],
    },
    dataEntry: {
        name: 'Data Entry',
        name_ar: 'مدخل بيانات',
        description: 'Add and edit products only',
        permissions: [
            'products.view',
            'products.create',
            'products.edit',
            'categories.view',
        ],
    },
};

// All available permissions
const ALL_PERMISSIONS = {
    // Dashboard
    'dashboard.view': 'عرض لوحة التحكم',

    // Products
    'products.view': 'عرض المنتجات',
    'products.create': 'إضافة منتجات',
    'products.edit': 'تعديل المنتجات',
    'products.delete': 'حذف المنتجات',
    'products.import': 'استيراد منتجات',
    'products.export': 'تصدير منتجات',

    // Categories
    'categories.view': 'عرض الفئات',
    'categories.create': 'إضافة فئات',
    'categories.edit': 'تعديل الفئات',
    'categories.delete': 'حذف الفئات',

    // Orders
    'orders.view': 'عرض الطلبات',
    'orders.create': 'إنشاء طلبات',
    'orders.edit': 'تعديل الطلبات',
    'orders.delete': 'حذف الطلبات',
    'orders.cancel': 'إلغاء الطلبات',
    'orders.ship': 'شحن الطلبات',
    'orders.update_status': 'تحديث حالة الطلب',
    'orders.export': 'تصدير الطلبات',

    // Customers
    'customers.view': 'عرض العملاء',
    'customers.create': 'إضافة عملاء',
    'customers.edit': 'تعديل العملاء',
    'customers.delete': 'حذف العملاء',
    'customers.block': 'حظر العملاء',

    // Reports
    'reports.view': 'عرض التقارير',
    'reports.export': 'تصدير التقارير',
    'reports.sales': 'تقارير المبيعات',
    'reports.customers': 'تقارير العملاء',
    'reports.products': 'تقارير المنتجات',

    // Payments
    'payments.view': 'عرض المدفوعات',
    'refunds.view': 'عرض المرتجعات',
    'refunds.process': 'معالجة المرتجعات',

    // Messages
    'messages.view': 'عرض الرسائل',
    'messages.send': 'إرسال الرسائل',

    // Settings
    'settings.view': 'عرض الإعدادات',
    'settings.edit': 'تعديل الإعدادات',
    'settings.users': 'إدارة المستخدمين',
    'settings.roles': 'إدارة الأدوار',
    'settings.webhooks': 'إدارة الويب هوكس',
    'settings.api': 'إدارة API',
};

// ============================================
// PERMISSION CHECKING
// ============================================

/**
 * Check if a user has a specific permission
 */
function hasPermission(userPermissions, requiredPermission) {
    if (!userPermissions || userPermissions.length === 0) {
        return false;
    }

    // Check for wildcard (owner)
    if (userPermissions.includes('*')) {
        return true;
    }

    // Check exact match
    if (userPermissions.includes(requiredPermission)) {
        return true;
    }

    // Check wildcard patterns (e.g., products.* matches products.view)
    const [resource, action] = requiredPermission.split('.');
    if (userPermissions.includes(`${resource}.*`)) {
        return true;
    }

    return false;
}

/**
 * Check if user has any of the required permissions
 */
function hasAnyPermission(userPermissions, requiredPermissions) {
    return requiredPermissions.some(p => hasPermission(userPermissions, p));
}

/**
 * Check if user has all of the required permissions
 */
function hasAllPermissions(userPermissions, requiredPermissions) {
    return requiredPermissions.every(p => hasPermission(userPermissions, p));
}

// ============================================
// MIDDLEWARE
// ============================================

/**
 * Require specific permission(s)
 */
function requirePermission(...requiredPermissions) {
    return async (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        // Get user's permissions from database
        const permissions = await getUserPermissions(req.user.id, req.tenantId);

        // Check permissions
        const hasAccess = requiredPermissions.length === 1
            ? hasPermission(permissions, requiredPermissions[0])
            : hasAnyPermission(permissions, requiredPermissions);

        if (!hasAccess) {
            return res.status(403).json({
                error: 'Insufficient permissions',
                required: requiredPermissions,
            });
        }

        // Attach permissions to request for later use
        req.userPermissions = permissions;

        next();
    };
}

/**
 * Require all specified permissions
 */
function requireAllPermissions(...requiredPermissions) {
    return async (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const permissions = await getUserPermissions(req.user.id, req.tenantId);

        if (!hasAllPermissions(permissions, requiredPermissions)) {
            return res.status(403).json({
                error: 'Insufficient permissions',
                required: requiredPermissions,
            });
        }

        req.userPermissions = permissions;
        next();
    };
}

// ============================================
// DATABASE OPERATIONS
// ============================================

/**
 * Get user's permissions
 */
async function getUserPermissions(userId, tenantId) {
    const result = await db.query(`
    SELECT r.permissions
    FROM users u
    JOIN user_roles ur ON u.id = ur.user_id
    JOIN roles r ON ur.role_id = r.id
    WHERE u.id = $1 AND ur.tenant_id = $2
  `, [userId, tenantId]);

    if (result.rows.length === 0) {
        return [];
    }

    // Merge all permissions from all roles
    const allPermissions = result.rows.flatMap(row =>
        typeof row.permissions === 'string'
            ? JSON.parse(row.permissions)
            : row.permissions
    );

    return [...new Set(allPermissions)]; // Remove duplicates
}

/**
 * Get user's role
 */
async function getUserRole(userId, tenantId) {
    const result = await db.query(`
    SELECT r.id, r.slug, r.name, r.permissions
    FROM roles r
    JOIN user_roles ur ON r.id = ur.role_id
    WHERE ur.user_id = $1 AND ur.tenant_id = $2
    LIMIT 1
  `, [userId, tenantId]);

    return result.rows[0] || null;
}

/**
 * Assign role to user
 */
async function assignRole(userId, roleId, tenantId, assignedBy) {
    // Remove existing roles for this tenant
    await db.query(
        'DELETE FROM user_roles WHERE user_id = $1 AND tenant_id = $2',
        [userId, tenantId]
    );

    // Assign new role
    await db.query(`
    INSERT INTO user_roles (user_id, role_id, tenant_id, assigned_by, assigned_at)
    VALUES ($1, $2, $3, $4, NOW())
  `, [userId, roleId, tenantId, assignedBy]);

    return { success: true };
}

/**
 * Create custom role
 */
async function createRole(tenantId, data) {
    const { name, name_ar, slug, description, permissions } = data;

    const result = await db.query(`
    INSERT INTO roles (tenant_id, name, name_ar, slug, description, permissions, is_custom)
    VALUES ($1, $2, $3, $4, $5, $6, true)
    RETURNING *
  `, [tenantId, name, name_ar, slug, description, JSON.stringify(permissions)]);

    return result.rows[0];
}

/**
 * Update role permissions
 */
async function updateRolePermissions(tenantId, roleId, permissions) {
    const result = await db.query(`
    UPDATE roles
    SET permissions = $3, updated_at = NOW()
    WHERE id = $1 AND tenant_id = $2 AND is_custom = true
    RETURNING *
  `, [roleId, tenantId, JSON.stringify(permissions)]);

    return result.rows[0];
}

/**
 * Get all roles for tenant
 */
async function getRoles(tenantId) {
    const result = await db.query(`
    SELECT r.*, 
           (SELECT COUNT(*) FROM user_roles ur WHERE ur.role_id = r.id) as users_count
    FROM roles r
    WHERE r.tenant_id = $1 OR r.tenant_id IS NULL
    ORDER BY r.is_custom, r.name
  `, [tenantId]);

    return result.rows;
}

/**
 * Initialize default roles for a new tenant
 */
async function initializeDefaultRoles(tenantId) {
    for (const [slug, role] of Object.entries(DEFAULT_ROLES)) {
        await db.query(`
      INSERT INTO roles (tenant_id, slug, name, name_ar, description, permissions, is_custom)
      VALUES ($1, $2, $3, $4, $5, $6, false)
      ON CONFLICT (tenant_id, slug) DO NOTHING
    `, [
            tenantId,
            slug,
            role.name,
            role.name_ar,
            role.description,
            JSON.stringify(role.permissions),
        ]);
    }
}

// ============================================
// EXPRESS ROUTES
// ============================================

const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/auth');
const { requireTenant } = require('../../middleware/tenant');

// Get all available permissions
router.get('/permissions', authenticate, (req, res) => {
    res.json({ permissions: ALL_PERMISSIONS });
});

// Get roles
router.get('/roles', authenticate, requireTenant, async (req, res) => {
    const roles = await getRoles(req.tenantId);
    res.json({ roles });
});

// Create custom role
router.post('/roles', authenticate, requireTenant, requirePermission('settings.roles'), async (req, res) => {
    const role = await createRole(req.tenantId, req.body);
    res.status(201).json({ role });
});

// Update role
router.put('/roles/:id', authenticate, requireTenant, requirePermission('settings.roles'), async (req, res) => {
    const role = await updateRolePermissions(req.tenantId, req.params.id, req.body.permissions);
    if (!role) {
        return res.status(404).json({ error: 'Role not found or cannot be modified' });
    }
    res.json({ role });
});

// Assign role to user
router.post('/users/:userId/role', authenticate, requireTenant, requirePermission('settings.users'), async (req, res) => {
    await assignRole(req.params.userId, req.body.roleId, req.tenantId, req.user.id);
    res.json({ success: true });
});

// Get user's role
router.get('/users/:userId/role', authenticate, requireTenant, async (req, res) => {
    const role = await getUserRole(req.params.userId, req.tenantId);
    res.json({ role });
});

// Get my permissions
router.get('/me/permissions', authenticate, requireTenant, async (req, res) => {
    const permissions = await getUserPermissions(req.user.id, req.tenantId);
    const role = await getUserRole(req.user.id, req.tenantId);
    res.json({ role, permissions });
});

// ============================================
// EXPORTS
// ============================================

module.exports = {
    // Constants
    DEFAULT_ROLES,
    ALL_PERMISSIONS,

    // Permission checking
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,

    // Middleware
    requirePermission,
    requireAllPermissions,

    // Database operations
    getUserPermissions,
    getUserRole,
    assignRole,
    createRole,
    updateRolePermissions,
    getRoles,
    initializeDefaultRoles,

    // Router
    router,
};

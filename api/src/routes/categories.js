/**
 * Categories Routes
 * Routes الفئات
 * 
 * يجب وضعه في: api/src/routes/categories.js
 */

const express = require('express');
const router = express.Router();
const { query } = require('../db');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { tenantMiddleware } = require('../middleware/tenant');
const { requirePermission } = require('../services/rbac');
const { log, AUDIT_EVENTS } = require('../services/audit');

/**
 * جميع الفئات (عام)
 * GET /api/categories
 */
router.get('/', tenantMiddleware, optionalAuth, async (req, res) => {
    try {
        const { include_inactive } = req.query;

        let queryText = `
      SELECT c.*, 
             p.name as parent_name,
             (SELECT COUNT(*) FROM products WHERE category_id = c.id AND is_active = true) as products_count
      FROM categories c
      LEFT JOIN categories p ON c.parent_id = p.id
      WHERE c.tenant_id = $1
    `;

        if (!include_inactive) {
            queryText += ' AND c.is_active = true';
        }

        queryText += ' ORDER BY c.sort_order, c.name';

        const result = await query(queryText, [req.tenant_id]);

        res.json({
            success: true,
            categories: result.rows,
        });
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get categories',
        });
    }
});

/**
 * فئة واحدة
 * GET /api/categories/:slug
 */
router.get('/:slug', tenantMiddleware, optionalAuth, async (req, res) => {
    try {
        const result = await query(
            `SELECT c.*, p.name as parent_name
       FROM categories c
       LEFT JOIN categories p ON c.parent_id = p.id
       WHERE c.tenant_id = $1 AND (c.slug = $2 OR c.id::text = $2) AND c.is_active = true`,
            [req.tenant_id, req.params.slug]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Category not found',
            });
        }

        const category = result.rows[0];

        // فئات فرعية
        const subcategories = await query(
            `SELECT id, name, slug, image, products_count 
       FROM categories 
       WHERE parent_id = $1 AND is_active = true
       ORDER BY sort_order`,
            [category.id]
        );

        res.json({
            success: true,
            category,
            subcategories: subcategories.rows,
        });
    } catch (error) {
        console.error('Get category error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get category',
        });
    }
});

// ==================== Admin Routes ====================

/**
 * إنشاء فئة
 * POST /api/categories/admin
 */
router.post('/admin', tenantMiddleware, authenticateToken, requirePermission('categories:create'), async (req, res) => {
    try {
        const {
            name,
            name_ar,
            slug,
            description,
            image,
            parent_id,
            sort_order = 0,
            is_active = true,
        } = req.body;

        if (!name || !slug) {
            return res.status(400).json({
                success: false,
                error: 'Name and slug are required',
            });
        }

        // التحقق من تفرد الـ slug
        const existing = await query(
            'SELECT id FROM categories WHERE slug = $1 AND tenant_id = $2',
            [slug, req.tenant_id]
        );

        if (existing.rows.length > 0) {
            return res.status(400).json({
                success: false,
                error: 'Slug already exists',
            });
        }

        const result = await query(
            `INSERT INTO categories (
        tenant_id, name, name_ar, slug, description, image, parent_id, sort_order, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
            [req.tenant_id, name, name_ar, slug, description, image, parent_id, sort_order, is_active]
        );

        await log({
            tenantId: req.tenant_id,
            userId: req.user.id,
            event: AUDIT_EVENTS.CATEGORY_CREATED,
            entityType: 'category',
            entityId: result.rows[0].id,
            metadata: { name, slug },
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
        });

        res.status(201).json({
            success: true,
            category: result.rows[0],
        });

    } catch (error) {
        console.error('Create category error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create category',
        });
    }
});

/**
 * تحديث فئة
 * PUT /api/categories/admin/:id
 */
router.put('/admin/:id', tenantMiddleware, authenticateToken, requirePermission('categories:update'), async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const allowedFields = ['name', 'name_ar', 'slug', 'description', 'image', 'parent_id', 'sort_order', 'is_active'];

        const updateFields = [];
        const values = [id, req.tenant_id];
        let paramCount = 2;

        for (const field of allowedFields) {
            if (updates[field] !== undefined) {
                paramCount++;
                updateFields.push(`${field} = $${paramCount}`);
                values.push(updates[field]);
            }
        }

        if (updateFields.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No valid fields to update',
            });
        }

        // التحقق من عدم جعل الفئة ابناً لنفسها
        if (updates.parent_id === id) {
            return res.status(400).json({
                success: false,
                error: 'Category cannot be its own parent',
            });
        }

        updateFields.push('updated_at = NOW()');

        const result = await query(
            `UPDATE categories SET ${updateFields.join(', ')} WHERE id = $1 AND tenant_id = $2 RETURNING *`,
            values
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Category not found',
            });
        }

        res.json({
            success: true,
            category: result.rows[0],
        });

    } catch (error) {
        console.error('Update category error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update category',
        });
    }
});

/**
 * حذف فئة
 * DELETE /api/categories/admin/:id
 */
router.delete('/admin/:id', tenantMiddleware, authenticateToken, requirePermission('categories:delete'), async (req, res) => {
    try {
        const { id } = req.params;

        // التحقق من عدم وجود منتجات
        const productsCount = await query(
            'SELECT COUNT(*) FROM products WHERE category_id = $1',
            [id]
        );

        if (parseInt(productsCount.rows[0].count) > 0) {
            return res.status(400).json({
                success: false,
                error: 'Cannot delete category with products',
                products_count: parseInt(productsCount.rows[0].count),
            });
        }

        // التحقق من عدم وجود فئات فرعية
        const subcategories = await query(
            'SELECT COUNT(*) FROM categories WHERE parent_id = $1',
            [id]
        );

        if (parseInt(subcategories.rows[0].count) > 0) {
            return res.status(400).json({
                success: false,
                error: 'Cannot delete category with subcategories',
            });
        }

        const result = await query(
            'DELETE FROM categories WHERE id = $1 AND tenant_id = $2 RETURNING id, name',
            [id, req.tenant_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Category not found',
            });
        }

        await log({
            tenantId: req.tenant_id,
            userId: req.user.id,
            event: AUDIT_EVENTS.CATEGORY_DELETED,
            entityType: 'category',
            entityId: id,
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
        });

        res.json({
            success: true,
            message: 'Category deleted',
        });

    } catch (error) {
        console.error('Delete category error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete category',
        });
    }
});

/**
 * إعادة ترتيب الفئات
 * POST /api/categories/admin/reorder
 */
router.post('/admin/reorder', tenantMiddleware, authenticateToken, requirePermission('categories:update'), async (req, res) => {
    try {
        const { order } = req.body; // Array of { id, sort_order }

        if (!Array.isArray(order)) {
            return res.status(400).json({
                success: false,
                error: 'Order must be an array',
            });
        }

        for (const item of order) {
            await query(
                'UPDATE categories SET sort_order = $1, updated_at = NOW() WHERE id = $2 AND tenant_id = $3',
                [item.sort_order, item.id, req.tenant_id]
            );
        }

        res.json({
            success: true,
            message: 'Order updated',
        });

    } catch (error) {
        console.error('Reorder categories error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to reorder categories',
        });
    }
});

module.exports = router;

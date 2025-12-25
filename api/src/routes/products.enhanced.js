/**
 * Enhanced Products Routes
 * Routes المنتجات المحسّنة
 * 
 * يجب وضعه في: api/src/routes/products.enhanced.js
 */

const express = require('express');
const router = express.Router();
const { query } = require('../db');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { extractTenant } = require('../middleware/tenant');
const { requirePermission } = require('../services/rbac');
const { log, AUDIT_EVENTS } = require('../services/audit');
const { dispatchWebhook } = require('../services/webhooks');

/**
 * جميع المنتجات (عام)
 * GET /api/products
 */
router.get('/', extractTenant, optionalAuth, async (req, res) => {
    try {
        const {
            category,
            search,
            minPrice,
            maxPrice,
            inStock,
            featured,
            sort = 'created_at',
            order = 'DESC',
            page = 1,
            limit = 20,
        } = req.query;

        const offset = (page - 1) * limit;

        let queryText = `
      SELECT p.*, 
             c.name as category_name,
             c.slug as category_slug,
             (SELECT COUNT(*) FROM order_items oi 
              JOIN orders o ON oi.order_id = o.id 
              WHERE oi.product_id = p.id AND o.status = 'delivered') as sales_count
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.tenant_id = $1 AND p.is_active = true
    `;
        const params = [req.tenant_id];
        let paramCount = 1;

        // فلتر الفئة
        if (category) {
            paramCount++;
            queryText += ` AND (c.slug = $${paramCount} OR c.id::text = $${paramCount})`;
            params.push(category);
        }

        // البحث
        if (search) {
            paramCount++;
            queryText += ` AND (p.name ILIKE $${paramCount} OR p.description ILIKE $${paramCount} OR p.sku ILIKE $${paramCount})`;
            params.push(`%${search}%`);
        }

        // السعر
        if (minPrice) {
            paramCount++;
            queryText += ` AND p.price >= $${paramCount}`;
            params.push(parseFloat(minPrice));
        }

        if (maxPrice) {
            paramCount++;
            queryText += ` AND p.price <= $${paramCount}`;
            params.push(parseFloat(maxPrice));
        }

        // المخزون
        if (inStock === 'true') {
            queryText += ' AND p.stock > 0';
        }

        // المميزة
        if (featured === 'true') {
            queryText += ' AND p.is_featured = true';
        }

        // الترتيب
        const validSorts = ['created_at', 'price', 'name', 'stock', 'sales_count'];
        const sortField = validSorts.includes(sort) ? sort : 'created_at';
        const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

        queryText += ` ORDER BY p.${sortField} ${sortOrder}`;
        queryText += ` LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
        params.push(parseInt(limit), offset);

        const result = await query(queryText, params);

        // عدد المنتجات الإجمالي
        let countQuery = `
      SELECT COUNT(*) FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.tenant_id = $1 AND p.is_active = true
    `;
        const countParams = [req.tenant_id];

        if (category) {
            countQuery += ` AND (c.slug = $2 OR c.id::text = $2)`;
            countParams.push(category);
        }

        const countResult = await query(countQuery, countParams);

        res.json({
            success: true,
            products: result.rows.map(p => ({
                ...p,
                images: p.images ? JSON.parse(p.images) : [],
            })),
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: parseInt(countResult.rows[0].count),
                pages: Math.ceil(countResult.rows[0].count / limit),
            },
        });
    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get products',
        });
    }
});

/**
 * منتج واحد بالـ slug
 * GET /api/products/:slug
 */
router.get('/:slug', extractTenant, optionalAuth, async (req, res) => {
    try {
        const result = await query(
            `SELECT p.*, 
              c.name as category_name, 
              c.slug as category_slug
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.tenant_id = $1 AND (p.slug = $2 OR p.id::text = $2) AND p.is_active = true`,
            [req.tenant_id, req.params.slug]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Product not found',
            });
        }

        const product = result.rows[0];

        // جلب المنتجات المشابهة
        const relatedResult = await query(
            `SELECT id, name, slug, price, compare_price, images 
       FROM products 
       WHERE tenant_id = $1 AND category_id = $2 AND id != $3 AND is_active = true
       LIMIT 4`,
            [req.tenant_id, product.category_id, product.id]
        );

        res.json({
            success: true,
            product: {
                ...product,
                images: product.images ? JSON.parse(product.images) : [],
            },
            related: relatedResult.rows.map(p => ({
                ...p,
                images: p.images ? JSON.parse(p.images) : [],
            })),
        });
    } catch (error) {
        console.error('Get product error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get product',
        });
    }
});

// ==================== Admin Routes ====================

/**
 * جميع المنتجات (للإدارة)
 * GET /api/products/admin/all
 */
router.get('/admin/all', extractTenant, authenticateToken, requirePermission('products:read'), async (req, res) => {
    try {
        const { search, category, status, page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        let queryText = `
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.tenant_id = $1
    `;
        const params = [req.tenant_id];
        let paramCount = 1;

        if (search) {
            paramCount++;
            queryText += ` AND (p.name ILIKE $${paramCount} OR p.sku ILIKE $${paramCount})`;
            params.push(`%${search}%`);
        }

        if (category) {
            paramCount++;
            queryText += ` AND p.category_id = $${paramCount}`;
            params.push(category);
        }

        if (status === 'active') {
            queryText += ' AND p.is_active = true';
        } else if (status === 'inactive') {
            queryText += ' AND p.is_active = false';
        } else if (status === 'out_of_stock') {
            queryText += ' AND p.stock = 0';
        } else if (status === 'low_stock') {
            queryText += ' AND p.stock > 0 AND p.stock <= 5';
        }

        queryText += ` ORDER BY p.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
        params.push(parseInt(limit), offset);

        const result = await query(queryText, params);

        res.json({
            success: true,
            products: result.rows.map(p => ({
                ...p,
                images: p.images ? JSON.parse(p.images) : [],
            })),
        });
    } catch (error) {
        console.error('Get admin products error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get products',
        });
    }
});

/**
 * إنشاء منتج جديد
 * POST /api/products/admin
 */
router.post('/admin', extractTenant, authenticateToken, requirePermission('products:create'), async (req, res) => {
    try {
        const {
            name,
            name_ar,
            description,
            description_ar,
            price,
            compare_price,
            cost_price,
            sku,
            barcode,
            stock,
            category_id,
            images,
            is_active = true,
            is_featured = false,
            weight,
            dimensions,
            meta_title,
            meta_description,
        } = req.body;

        // التحقق من المدخلات
        if (!name || !price) {
            return res.status(400).json({
                success: false,
                error: 'Name and price are required',
            });
        }

        // إنشاء slug
        const slug = name
            .toLowerCase()
            .replace(/[^a-z0-9\u0621-\u064A]+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '') + '-' + Date.now().toString(36);

        const result = await query(
            `INSERT INTO products (
        tenant_id, name, name_ar, slug, description, description_ar,
        price, compare_price, cost_price, sku, barcode, stock,
        category_id, images, is_active, is_featured,
        weight, dimensions, meta_title, meta_description
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
      RETURNING *`,
            [
                req.tenant_id, name, name_ar, slug, description, description_ar,
                price, compare_price, cost_price, sku, barcode, stock || 0,
                category_id, JSON.stringify(images || []), is_active, is_featured,
                weight, JSON.stringify(dimensions), meta_title, meta_description,
            ]
        );

        const product = result.rows[0];

        // Audit log
        await log({
            tenantId: req.tenant_id,
            userId: req.user.id,
            event: AUDIT_EVENTS.PRODUCT_CREATED,
            entityType: 'product',
            entityId: product.id,
            metadata: { name, price, stock },
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
        });

        res.status(201).json({
            success: true,
            product: {
                ...product,
                images: JSON.parse(product.images),
            },
        });
    } catch (error) {
        console.error('Create product error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create product',
        });
    }
});

/**
 * تحديث منتج
 * PUT /api/products/admin/:id
 */
router.put('/admin/:id', extractTenant, authenticateToken, requirePermission('products:update'), async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // التحقق من وجود المنتج
        const existing = await query(
            'SELECT * FROM products WHERE id = $1 AND tenant_id = $2',
            [id, req.tenant_id]
        );

        if (existing.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Product not found',
            });
        }

        // بناء query التحديث
        const allowedFields = [
            'name', 'name_ar', 'description', 'description_ar',
            'price', 'compare_price', 'cost_price', 'sku', 'barcode',
            'stock', 'category_id', 'images', 'is_active', 'is_featured',
            'weight', 'dimensions', 'meta_title', 'meta_description',
        ];

        const updateFields = [];
        const values = [id, req.tenant_id];
        let paramCount = 2;

        for (const field of allowedFields) {
            if (updates[field] !== undefined) {
                paramCount++;
                let value = updates[field];

                if (field === 'images' || field === 'dimensions') {
                    value = JSON.stringify(value);
                }

                updateFields.push(`${field} = $${paramCount}`);
                values.push(value);
            }
        }

        if (updateFields.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No valid fields to update',
            });
        }

        updateFields.push('updated_at = NOW()');

        const updateQuery = `
      UPDATE products 
      SET ${updateFields.join(', ')}
      WHERE id = $1 AND tenant_id = $2
      RETURNING *
    `;

        const result = await query(updateQuery, values);
        const product = result.rows[0];

        // Check for low stock webhook
        if (product.stock <= 5 && product.stock > 0) {
            await dispatchWebhook(req.tenant_id, 'product.low_stock', {
                product_id: product.id,
                name: product.name,
                stock: product.stock,
            });
        }

        // Audit log
        await log({
            tenantId: req.tenant_id,
            userId: req.user.id,
            event: AUDIT_EVENTS.PRODUCT_UPDATED,
            entityType: 'product',
            entityId: product.id,
            metadata: { updates },
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
        });

        res.json({
            success: true,
            product: {
                ...product,
                images: product.images ? JSON.parse(product.images) : [],
            },
        });
    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update product',
        });
    }
});

/**
 * حذف منتج
 * DELETE /api/products/admin/:id
 */
router.delete('/admin/:id', extractTenant, authenticateToken, requirePermission('products:delete'), async (req, res) => {
    try {
        const { id } = req.params;

        const existing = await query(
            'SELECT * FROM products WHERE id = $1 AND tenant_id = $2',
            [id, req.tenant_id]
        );

        if (existing.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Product not found',
            });
        }

        // Soft delete
        await query(
            'UPDATE products SET deleted_at = NOW(), is_active = false WHERE id = $1',
            [id]
        );

        // Audit log
        await log({
            tenantId: req.tenant_id,
            userId: req.user.id,
            event: AUDIT_EVENTS.PRODUCT_DELETED,
            entityType: 'product',
            entityId: id,
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
        });

        res.json({
            success: true,
            message: 'Product deleted',
        });
    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete product',
        });
    }
});

/**
 * تحديث المخزون
 * PUT /api/products/admin/:id/stock
 */
router.put('/admin/:id/stock', extractTenant, authenticateToken, requirePermission('products:update'), async (req, res) => {
    try {
        const { id } = req.params;
        const { stock, operation = 'set' } = req.body;

        if (stock === undefined || isNaN(stock)) {
            return res.status(400).json({
                success: false,
                error: 'Valid stock value is required',
            });
        }

        let updateQuery;

        if (operation === 'add') {
            updateQuery = 'UPDATE products SET stock = stock + $3, updated_at = NOW() WHERE id = $1 AND tenant_id = $2 RETURNING stock';
        } else if (operation === 'subtract') {
            updateQuery = 'UPDATE products SET stock = GREATEST(0, stock - $3), updated_at = NOW() WHERE id = $1 AND tenant_id = $2 RETURNING stock';
        } else {
            updateQuery = 'UPDATE products SET stock = $3, updated_at = NOW() WHERE id = $1 AND tenant_id = $2 RETURNING stock';
        }

        const result = await query(updateQuery, [id, req.tenant_id, parseInt(stock)]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Product not found',
            });
        }

        const newStock = result.rows[0].stock;

        // Low stock webhook
        if (newStock <= 5 && newStock > 0) {
            await dispatchWebhook(req.tenant_id, 'product.low_stock', {
                product_id: id,
                stock: newStock,
            });
        }

        // Out of stock webhook
        if (newStock === 0) {
            await dispatchWebhook(req.tenant_id, 'product.out_of_stock', {
                product_id: id,
            });
        }

        res.json({
            success: true,
            stock: newStock,
        });
    } catch (error) {
        console.error('Update stock error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update stock',
        });
    }
});

module.exports = router;

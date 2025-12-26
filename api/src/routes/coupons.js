/**
 * Coupons Routes
 * Routes الكوبونات
 * 
 * يجب وضعه في: api/src/routes/coupons.js
 */

const express = require('express');
const router = express.Router();
const { query } = require('../db');
const { authenticateToken } = require('../middleware/auth');
const { tenantMiddleware } = require('../middleware/tenant');
const { requirePermission } = require('../services/rbac');
const { log, AUDIT_EVENTS } = require('../services/audit');

/**
 * التحقق من صلاحية كوبون
 * POST /api/coupons/validate
 */
router.post('/validate', tenantMiddleware, authenticateToken, async (req, res) => {
    try {
        const { code, cart_total } = req.body;

        if (!code) {
            return res.status(400).json({
                success: false,
                error: 'Coupon code is required',
            });
        }

        const result = await query(
            `SELECT * FROM coupons 
       WHERE code = $1 AND tenant_id = $2 
         AND is_active = true 
         AND (expires_at IS NULL OR expires_at > NOW())
         AND (max_uses IS NULL OR used_count < max_uses)`,
            [code.toUpperCase(), req.tenant_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Coupon not found or expired',
            });
        }

        const coupon = result.rows[0];

        // التحقق من الحد الأدنى للطلب
        if (coupon.min_order_value && cart_total < coupon.min_order_value) {
            return res.status(400).json({
                success: false,
                error: `Minimum order value is ${coupon.min_order_value} SAR`,
                min_order_value: coupon.min_order_value,
            });
        }

        // حساب الخصم
        let discount = 0;
        if (coupon.discount_type === 'percentage') {
            discount = cart_total * (coupon.discount_value / 100);
            if (coupon.max_discount) {
                discount = Math.min(discount, coupon.max_discount);
            }
        } else {
            discount = coupon.discount_value;
        }

        res.json({
            success: true,
            coupon: {
                code: coupon.code,
                discount_type: coupon.discount_type,
                discount_value: coupon.discount_value,
            },
            discount: Math.round(discount * 100) / 100,
        });

    } catch (error) {
        console.error('Validate coupon error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to validate coupon',
        });
    }
});

// ==================== Admin Routes ====================

/**
 * جميع الكوبونات
 * GET /api/coupons/admin
 */
router.get('/admin', tenantMiddleware, authenticateToken, requirePermission('coupons:read'), async (req, res) => {
    try {
        const result = await query(
            `SELECT * FROM coupons WHERE tenant_id = $1 ORDER BY created_at DESC`,
            [req.tenant_id]
        );

        res.json({
            success: true,
            coupons: result.rows,
        });
    } catch (error) {
        console.error('Get coupons error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get coupons',
        });
    }
});

/**
 * إنشاء كوبون
 * POST /api/coupons/admin
 */
router.post('/admin', tenantMiddleware, authenticateToken, requirePermission('coupons:create'), async (req, res) => {
    try {
        const {
            code,
            discount_type,
            discount_value,
            min_order_value,
            max_discount,
            max_uses,
            expires_at,
            is_active = true,
            description,
        } = req.body;

        if (!code || !discount_type || !discount_value) {
            return res.status(400).json({
                success: false,
                error: 'Code, discount_type, and discount_value are required',
            });
        }

        // التحقق من عدم تكرار الكود
        const existing = await query(
            'SELECT id FROM coupons WHERE code = $1 AND tenant_id = $2',
            [code.toUpperCase(), req.tenant_id]
        );

        if (existing.rows.length > 0) {
            return res.status(400).json({
                success: false,
                error: 'Coupon code already exists',
            });
        }

        const result = await query(
            `INSERT INTO coupons (
        tenant_id, code, discount_type, discount_value, min_order_value,
        max_discount, max_uses, expires_at, is_active, description
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
            [
                req.tenant_id,
                code.toUpperCase(),
                discount_type,
                discount_value,
                min_order_value,
                max_discount,
                max_uses,
                expires_at,
                is_active,
                description,
            ]
        );

        await log({
            tenantId: req.tenant_id,
            userId: req.user.id,
            event: AUDIT_EVENTS.COUPON_CREATED,
            entityType: 'coupon',
            entityId: result.rows[0].id,
            metadata: { code },
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
        });

        res.status(201).json({
            success: true,
            coupon: result.rows[0],
        });

    } catch (error) {
        console.error('Create coupon error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create coupon',
        });
    }
});

/**
 * تحديث كوبون
 * PUT /api/coupons/admin/:id
 */
router.put('/admin/:id', tenantMiddleware, authenticateToken, requirePermission('coupons:update'), async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const allowedFields = [
            'discount_type', 'discount_value', 'min_order_value',
            'max_discount', 'max_uses', 'expires_at', 'is_active', 'description'
        ];

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

        updateFields.push('updated_at = NOW()');

        const result = await query(
            `UPDATE coupons SET ${updateFields.join(', ')} WHERE id = $1 AND tenant_id = $2 RETURNING *`,
            values
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Coupon not found',
            });
        }

        res.json({
            success: true,
            coupon: result.rows[0],
        });

    } catch (error) {
        console.error('Update coupon error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update coupon',
        });
    }
});

/**
 * حذف كوبون
 * DELETE /api/coupons/admin/:id
 */
router.delete('/admin/:id', tenantMiddleware, authenticateToken, requirePermission('coupons:delete'), async (req, res) => {
    try {
        const { id } = req.params;

        const result = await query(
            'DELETE FROM coupons WHERE id = $1 AND tenant_id = $2 RETURNING id, code',
            [id, req.tenant_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Coupon not found',
            });
        }

        await log({
            tenantId: req.tenant_id,
            userId: req.user.id,
            event: AUDIT_EVENTS.COUPON_DELETED,
            entityType: 'coupon',
            entityId: id,
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
        });

        res.json({
            success: true,
            message: 'Coupon deleted',
        });

    } catch (error) {
        console.error('Delete coupon error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete coupon',
        });
    }
});

/**
 * إحصائيات الكوبون
 * GET /api/coupons/admin/:id/stats
 */
router.get('/admin/:id/stats', tenantMiddleware, authenticateToken, requirePermission('coupons:read'), async (req, res) => {
    try {
        const { id } = req.params;

        const couponResult = await query(
            'SELECT * FROM coupons WHERE id = $1 AND tenant_id = $2',
            [id, req.tenant_id]
        );

        if (couponResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Coupon not found',
            });
        }

        const coupon = couponResult.rows[0];

        // إحصائيات الاستخدام
        const usageResult = await query(
            `SELECT 
         COUNT(*) as total_uses,
         SUM(discount) as total_discount,
         AVG(total) as avg_order_value
       FROM orders 
       WHERE coupon_id = $1 AND tenant_id = $2 AND status != 'cancelled'`,
            [id, req.tenant_id]
        );

        res.json({
            success: true,
            coupon,
            stats: {
                totalUses: parseInt(usageResult.rows[0].total_uses) || 0,
                totalDiscount: parseFloat(usageResult.rows[0].total_discount) || 0,
                avgOrderValue: parseFloat(usageResult.rows[0].avg_order_value) || 0,
            },
        });

    } catch (error) {
        console.error('Get coupon stats error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get coupon stats',
        });
    }
});

module.exports = router;

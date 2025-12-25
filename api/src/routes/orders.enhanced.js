/**
 * Enhanced Orders Routes
 * Routes الطلبات المحسّنة
 * 
 * يجب وضعه في: api/src/routes/orders.enhanced.js
 */

const express = require('express');
const router = express.Router();
const { query } = require('../db');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { extractTenant } = require('../middleware/tenant');
const { requirePermission } = require('../services/rbac');
const { log, AUDIT_EVENTS } = require('../services/audit');
const { reserveInventory, commitOrder, releaseReservation } = require('../services/inventory/lock');
const { dispatchWebhook } = require('../services/webhooks');
const { addNotificationJob } = require('../workers');

/**
 * إنشاء طلب جديد
 * POST /api/orders
 */
router.post('/', extractTenant, authenticateToken, async (req, res) => {
    const client = await require('../db').pool.connect();

    try {
        const {
            items,
            shipping_address,
            payment_method = 'cod',
            coupon_code,
            notes
        } = req.body;

        // التحقق من المدخلات
        if (!items || items.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Order must contain at least one item',
            });
        }

        if (!shipping_address || !shipping_address.address || !shipping_address.city) {
            return res.status(400).json({
                success: false,
                error: 'Shipping address is required',
            });
        }

        await client.query('BEGIN');

        // حجز المخزون
        const reservation = await reserveInventory(
            req.tenant_id,
            items,
            `order_${req.user.id}_${Date.now()}`
        );

        if (!reservation.success) {
            await client.query('ROLLBACK');
            return res.status(400).json({
                success: false,
                error: reservation.error,
                unavailableItems: reservation.unavailableItems,
            });
        }

        // حساب المجاميع
        let subtotal = 0;
        const orderItems = [];

        for (const item of items) {
            const productResult = await client.query(
                'SELECT id, name, price, compare_price FROM products WHERE id = $1 AND tenant_id = $2',
                [item.product_id, req.tenant_id]
            );

            if (productResult.rows.length === 0) {
                await releaseReservation(reservation.reservationId);
                await client.query('ROLLBACK');
                return res.status(400).json({
                    success: false,
                    error: `Product ${item.product_id} not found`,
                });
            }

            const product = productResult.rows[0];
            const itemTotal = product.price * item.quantity;
            subtotal += itemTotal;

            orderItems.push({
                product_id: product.id,
                product_name: product.name,
                quantity: item.quantity,
                price: product.price,
                total: itemTotal,
            });
        }

        // حساب الشحن
        const shippingCost = subtotal >= 200 ? 0 : 25;

        // تطبيق الكوبون
        let discount = 0;
        let couponId = null;

        if (coupon_code) {
            const couponResult = await client.query(
                `SELECT id, discount_type, discount_value, min_order_value 
         FROM coupons 
         WHERE code = $1 AND tenant_id = $2 
           AND is_active = true 
           AND (expires_at IS NULL OR expires_at > NOW())
           AND (max_uses IS NULL OR used_count < max_uses)`,
                [coupon_code.toUpperCase(), req.tenant_id]
            );

            if (couponResult.rows.length > 0) {
                const coupon = couponResult.rows[0];

                if (subtotal >= (coupon.min_order_value || 0)) {
                    couponId = coupon.id;

                    if (coupon.discount_type === 'percentage') {
                        discount = subtotal * (coupon.discount_value / 100);
                    } else {
                        discount = coupon.discount_value;
                    }

                    // تحديث عداد استخدام الكوبون
                    await client.query(
                        'UPDATE coupons SET used_count = used_count + 1 WHERE id = $1',
                        [coupon.id]
                    );
                }
            }
        }

        const total = subtotal + shippingCost - discount;

        // إنشاء الطلب
        const orderResult = await client.query(
            `INSERT INTO orders (
        tenant_id, user_id, status, subtotal, shipping_cost, discount, total,
        shipping_address, payment_method, coupon_id, notes
      ) VALUES ($1, $2, 'pending', $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
            [
                req.tenant_id,
                req.user.id,
                subtotal,
                shippingCost,
                discount,
                total,
                JSON.stringify(shipping_address),
                payment_method,
                couponId,
                notes,
            ]
        );

        const order = orderResult.rows[0];

        // إضافة عناصر الطلب
        for (const item of orderItems) {
            await client.query(
                `INSERT INTO order_items (order_id, product_id, product_name, quantity, price, total)
         VALUES ($1, $2, $3, $4, $5, $6)`,
                [order.id, item.product_id, item.product_name, item.quantity, item.price, item.total]
            );
        }

        // تأكيد حجز المخزون
        await commitOrder(reservation.reservationId, order.id, client);

        await client.query('COMMIT');

        // مسح السلة
        await query(
            'DELETE FROM cart_items WHERE user_id = $1 AND tenant_id = $2',
            [req.user.id, req.tenant_id]
        );

        // إرسال الإشعارات
        await addNotificationJob({
            type: 'order_confirmation',
            order_id: order.id,
            user_id: req.user.id,
            tenant_id: req.tenant_id,
        });

        // إرسال Webhook
        await dispatchWebhook(req.tenant_id, 'order.created', {
            order_id: order.id,
            order_number: order.order_number,
            total: order.total,
            status: order.status,
        });

        // تسجيل العملية
        await log({
            tenantId: req.tenant_id,
            userId: req.user.id,
            event: AUDIT_EVENTS.ORDER_CREATED,
            entityType: 'order',
            entityId: order.id,
            metadata: { total: order.total, items_count: orderItems.length },
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
        });

        res.status(201).json({
            success: true,
            order: {
                id: order.id,
                order_number: order.order_number,
                status: order.status,
                subtotal: order.subtotal,
                shipping_cost: order.shipping_cost,
                discount: order.discount,
                total: order.total,
                items: orderItems,
            },
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Create order error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create order',
        });
    } finally {
        client.release();
    }
});

/**
 * الحصول على طلبات المستخدم
 * GET /api/orders
 */
router.get('/', extractTenant, authenticateToken, async (req, res) => {
    try {
        const { status, page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        let queryText = `
      SELECT o.*, 
             (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as items_count
      FROM orders o
      WHERE o.tenant_id = $1 AND o.user_id = $2
    `;
        const params = [req.tenant_id, req.user.id];

        if (status) {
            queryText += ' AND o.status = $3';
            params.push(status);
        }

        queryText += ' ORDER BY o.created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
        params.push(parseInt(limit), offset);

        const result = await query(queryText, params);

        // عدد الطلبات الإجمالي
        const countResult = await query(
            'SELECT COUNT(*) FROM orders WHERE tenant_id = $1 AND user_id = $2',
            [req.tenant_id, req.user.id]
        );

        res.json({
            success: true,
            orders: result.rows,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: parseInt(countResult.rows[0].count),
                pages: Math.ceil(countResult.rows[0].count / limit),
            },
        });
    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get orders',
        });
    }
});

/**
 * تفاصيل طلب محدد
 * GET /api/orders/:id
 */
router.get('/:id', extractTenant, authenticateToken, async (req, res) => {
    try {
        const orderResult = await query(
            `SELECT * FROM orders 
       WHERE id = $1 AND tenant_id = $2 AND user_id = $3`,
            [req.params.id, req.tenant_id, req.user.id]
        );

        if (orderResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Order not found',
            });
        }

        const order = orderResult.rows[0];

        // جلب عناصر الطلب
        const itemsResult = await query(
            'SELECT * FROM order_items WHERE order_id = $1',
            [order.id]
        );

        res.json({
            success: true,
            order: {
                ...order,
                items: itemsResult.rows,
                shipping_address: JSON.parse(order.shipping_address),
            },
        });
    } catch (error) {
        console.error('Get order error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get order',
        });
    }
});

/**
 * إلغاء طلب
 * POST /api/orders/:id/cancel
 */
router.post('/:id/cancel', extractTenant, authenticateToken, async (req, res) => {
    try {
        const { reason } = req.body;

        const orderResult = await query(
            `SELECT * FROM orders 
       WHERE id = $1 AND tenant_id = $2 AND user_id = $3`,
            [req.params.id, req.tenant_id, req.user.id]
        );

        if (orderResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Order not found',
            });
        }

        const order = orderResult.rows[0];

        // التحقق من إمكانية الإلغاء
        if (!['pending', 'confirmed'].includes(order.status)) {
            return res.status(400).json({
                success: false,
                error: 'Order cannot be cancelled at this stage',
            });
        }

        // إلغاء الطلب
        await query(
            `UPDATE orders 
       SET status = 'cancelled', cancelled_at = NOW(), cancel_reason = $2
       WHERE id = $1`,
            [order.id, reason]
        );

        // إرجاع المخزون
        const items = await query('SELECT * FROM order_items WHERE order_id = $1', [order.id]);

        for (const item of items.rows) {
            await query(
                'UPDATE products SET stock = stock + $1 WHERE id = $2',
                [item.quantity, item.product_id]
            );
        }

        // Webhook
        await dispatchWebhook(req.tenant_id, 'order.cancelled', {
            order_id: order.id,
            order_number: order.order_number,
            reason,
        });

        res.json({
            success: true,
            message: 'Order cancelled successfully',
        });
    } catch (error) {
        console.error('Cancel order error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to cancel order',
        });
    }
});

// ==================== Admin Routes ====================

/**
 * جميع الطلبات (للإدارة)
 * GET /api/orders/admin/all
 */
router.get('/admin/all', extractTenant, authenticateToken, requirePermission('orders:read'), async (req, res) => {
    try {
        const { status, search, page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        let queryText = `
      SELECT o.*, 
             u.email as customer_email, 
             u.first_name || ' ' || u.last_name as customer_name,
             (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as items_count
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      WHERE o.tenant_id = $1
    `;
        const params = [req.tenant_id];
        let paramCount = 1;

        if (status) {
            paramCount++;
            queryText += ` AND o.status = $${paramCount}`;
            params.push(status);
        }

        if (search) {
            paramCount++;
            queryText += ` AND (o.order_number ILIKE $${paramCount} OR u.email ILIKE $${paramCount})`;
            params.push(`%${search}%`);
        }

        queryText += ` ORDER BY o.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
        params.push(parseInt(limit), offset);

        const result = await query(queryText, params);

        res.json({
            success: true,
            orders: result.rows,
        });
    } catch (error) {
        console.error('Get admin orders error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get orders',
        });
    }
});

/**
 * تحديث حالة الطلب (للإدارة)
 * PUT /api/orders/admin/:id/status
 */
router.put('/admin/:id/status', extractTenant, authenticateToken, requirePermission('orders:update'), async (req, res) => {
    try {
        const { status, tracking_number } = req.body;

        const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid status',
            });
        }

        const orderResult = await query(
            'SELECT * FROM orders WHERE id = $1 AND tenant_id = $2',
            [req.params.id, req.tenant_id]
        );

        if (orderResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Order not found',
            });
        }

        const order = orderResult.rows[0];

        // تحديث الحالة
        await query(
            `UPDATE orders 
       SET status = $1, 
           tracking_number = COALESCE($2, tracking_number),
           shipped_at = CASE WHEN $1 = 'shipped' THEN NOW() ELSE shipped_at END,
           delivered_at = CASE WHEN $1 = 'delivered' THEN NOW() ELSE delivered_at END,
           updated_at = NOW()
       WHERE id = $3`,
            [status, tracking_number, order.id]
        );

        // إرسال إشعار للعميل
        await addNotificationJob({
            type: 'order_status_update',
            order_id: order.id,
            user_id: order.user_id,
            tenant_id: req.tenant_id,
            status,
            tracking_number,
        });

        // Webhook
        await dispatchWebhook(req.tenant_id, `order.${status}`, {
            order_id: order.id,
            order_number: order.order_number,
            status,
            tracking_number,
        });

        res.json({
            success: true,
            message: 'Order status updated',
        });
    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update order status',
        });
    }
});

module.exports = router;

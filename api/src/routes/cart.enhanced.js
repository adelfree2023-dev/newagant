/**
 * Enhanced Cart Routes with Abandoned Cart Recovery
 * Routes السلة مع استرداد السلات المتروكة
 * 
 * يجب وضعه في: api/src/routes/cart.enhanced.js
 */

const express = require('express');
const router = express.Router();
const { query } = require('../db');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { extractTenant } = require('../middleware/tenant');
const { addAbandonedCartJob } = require('../workers');

/**
 * الحصول على السلة
 * GET /api/cart
 */
router.get('/', extractTenant, authenticateToken, async (req, res) => {
    try {
        const result = await query(
            `SELECT ci.*, 
              p.name, p.name_ar, p.price, p.compare_price, p.images, p.stock, p.slug
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       WHERE ci.user_id = $1 AND ci.tenant_id = $2
       ORDER BY ci.created_at DESC`,
            [req.user.id, req.tenant_id]
        );

        const items = result.rows.map(item => ({
            id: item.id,
            product_id: item.product_id,
            quantity: item.quantity,
            product: {
                id: item.product_id,
                name: item.name,
                name_ar: item.name_ar,
                slug: item.slug,
                price: parseFloat(item.price),
                compare_price: item.compare_price ? parseFloat(item.compare_price) : null,
                image: item.images ? JSON.parse(item.images)[0] : null,
                stock: item.stock,
                available: item.stock >= item.quantity,
            },
            subtotal: parseFloat(item.price) * item.quantity,
        }));

        const total = items.reduce((sum, item) => sum + item.subtotal, 0);
        const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

        res.json({
            success: true,
            cart: {
                items,
                itemCount,
                subtotal: total,
                shipping: total >= 200 ? 0 : 25,
                total: total + (total >= 200 ? 0 : 25),
            },
        });
    } catch (error) {
        console.error('Get cart error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get cart',
        });
    }
});

/**
 * إضافة منتج للسلة
 * POST /api/cart
 */
router.post('/', extractTenant, authenticateToken, async (req, res) => {
    try {
        const { product_id, quantity = 1 } = req.body;

        if (!product_id) {
            return res.status(400).json({
                success: false,
                error: 'Product ID is required',
            });
        }

        // التحقق من وجود المنتج والمخزون
        const productResult = await query(
            'SELECT id, name, price, stock FROM products WHERE id = $1 AND tenant_id = $2 AND is_active = true',
            [product_id, req.tenant_id]
        );

        if (productResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Product not found',
            });
        }

        const product = productResult.rows[0];

        if (product.stock < quantity) {
            return res.status(400).json({
                success: false,
                error: 'Insufficient stock',
                available: product.stock,
            });
        }

        // التحقق من وجود المنتج في السلة
        const existingItem = await query(
            'SELECT id, quantity FROM cart_items WHERE user_id = $1 AND product_id = $2 AND tenant_id = $3',
            [req.user.id, product_id, req.tenant_id]
        );

        let cartItem;

        if (existingItem.rows.length > 0) {
            // تحديث الكمية
            const newQuantity = existingItem.rows[0].quantity + quantity;

            if (newQuantity > product.stock) {
                return res.status(400).json({
                    success: false,
                    error: 'Cannot add more than available stock',
                    available: product.stock,
                    inCart: existingItem.rows[0].quantity,
                });
            }

            const updateResult = await query(
                'UPDATE cart_items SET quantity = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
                [newQuantity, existingItem.rows[0].id]
            );

            cartItem = updateResult.rows[0];
        } else {
            // إضافة جديد
            const insertResult = await query(
                'INSERT INTO cart_items (user_id, tenant_id, product_id, quantity) VALUES ($1, $2, $3, $4) RETURNING *',
                [req.user.id, req.tenant_id, product_id, quantity]
            );

            cartItem = insertResult.rows[0];
        }

        // جدولة التذكير بالسلة المتروكة
        await scheduleAbandonedCartReminder(req.user.id, req.tenant_id);

        res.status(201).json({
            success: true,
            message: 'Added to cart',
            item: {
                id: cartItem.id,
                product_id: cartItem.product_id,
                quantity: cartItem.quantity,
            },
        });
    } catch (error) {
        console.error('Add to cart error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to add to cart',
        });
    }
});

/**
 * تحديث كمية المنتج
 * PUT /api/cart/:productId
 */
router.put('/:productId', extractTenant, authenticateToken, async (req, res) => {
    try {
        const { productId } = req.params;
        const { quantity } = req.body;

        if (!quantity || quantity < 1) {
            return res.status(400).json({
                success: false,
                error: 'Quantity must be at least 1',
            });
        }

        // التحقق من المخزون
        const productResult = await query(
            'SELECT stock FROM products WHERE id = $1 AND tenant_id = $2',
            [productId, req.tenant_id]
        );

        if (productResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Product not found',
            });
        }

        if (quantity > productResult.rows[0].stock) {
            return res.status(400).json({
                success: false,
                error: 'Insufficient stock',
                available: productResult.rows[0].stock,
            });
        }

        const result = await query(
            'UPDATE cart_items SET quantity = $1, updated_at = NOW() WHERE user_id = $2 AND product_id = $3 AND tenant_id = $4 RETURNING *',
            [quantity, req.user.id, productId, req.tenant_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Item not in cart',
            });
        }

        res.json({
            success: true,
            item: result.rows[0],
        });
    } catch (error) {
        console.error('Update cart error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update cart',
        });
    }
});

/**
 * حذف منتج من السلة
 * DELETE /api/cart/:productId
 */
router.delete('/:productId', extractTenant, authenticateToken, async (req, res) => {
    try {
        const { productId } = req.params;

        const result = await query(
            'DELETE FROM cart_items WHERE user_id = $1 AND product_id = $2 AND tenant_id = $3 RETURNING id',
            [req.user.id, productId, req.tenant_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Item not in cart',
            });
        }

        res.json({
            success: true,
            message: 'Item removed from cart',
        });
    } catch (error) {
        console.error('Remove from cart error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to remove from cart',
        });
    }
});

/**
 * إفراغ السلة
 * DELETE /api/cart
 */
router.delete('/', extractTenant, authenticateToken, async (req, res) => {
    try {
        await query(
            'DELETE FROM cart_items WHERE user_id = $1 AND tenant_id = $2',
            [req.user.id, req.tenant_id]
        );

        res.json({
            success: true,
            message: 'Cart cleared',
        });
    } catch (error) {
        console.error('Clear cart error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to clear cart',
        });
    }
});

/**
 * جدولة تذكير السلة المتروكة
 */
async function scheduleAbandonedCartReminder(userId, tenantId) {
    try {
        // إلغاء أي تذكير سابق
        // (سيتم تنفيذه في الـ worker)

        // جدولة تذكير جديد بعد 30 دقيقة
        await addAbandonedCartJob({
            user_id: userId,
            tenant_id: tenantId,
            scheduled_at: Date.now() + (30 * 60 * 1000), // 30 دقيقة
        });
    } catch (error) {
        console.error('Failed to schedule abandoned cart reminder:', error);
    }
}

// ==================== Abandoned Cart Admin ====================

/**
 * قائمة السلات المتروكة (للإدارة)
 * GET /api/cart/admin/abandoned
 */
router.get('/admin/abandoned', extractTenant, authenticateToken, async (req, res) => {
    try {
        const { days = 7, page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        // السلات التي لم يتم تحويلها لطلب خلال آخر X أيام
        const result = await query(
            `SELECT 
         u.id as user_id,
         u.email,
         u.first_name,
         u.phone,
         COUNT(ci.id) as items_count,
         SUM(p.price * ci.quantity) as cart_value,
         MAX(ci.updated_at) as last_activity,
         bool_and(ar.id IS NOT NULL) as reminder_sent
       FROM cart_items ci
       JOIN users u ON ci.user_id = u.id
       JOIN products p ON ci.product_id = p.id
       LEFT JOIN abandoned_cart_reminders ar ON ar.user_id = u.id AND ar.tenant_id = ci.tenant_id
       WHERE ci.tenant_id = $1
         AND ci.updated_at < NOW() - INTERVAL '30 minutes'
         AND ci.updated_at > NOW() - INTERVAL '${parseInt(days)} days'
         AND NOT EXISTS (
           SELECT 1 FROM orders o 
           WHERE o.user_id = u.id 
             AND o.tenant_id = ci.tenant_id 
             AND o.created_at > ci.updated_at
         )
       GROUP BY u.id, u.email, u.first_name, u.phone
       ORDER BY cart_value DESC
       LIMIT $2 OFFSET $3`,
            [req.tenant_id, parseInt(limit), offset]
        );

        res.json({
            success: true,
            abandonedCarts: result.rows.map(cart => ({
                user: {
                    id: cart.user_id,
                    email: cart.email,
                    name: cart.first_name,
                    phone: cart.phone,
                },
                itemsCount: parseInt(cart.items_count),
                cartValue: parseFloat(cart.cart_value),
                lastActivity: cart.last_activity,
                reminderSent: cart.reminder_sent,
            })),
        });
    } catch (error) {
        console.error('Get abandoned carts error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get abandoned carts',
        });
    }
});

/**
 * إرسال تذكير يدوي
 * POST /api/cart/admin/abandoned/:userId/remind
 */
router.post('/admin/abandoned/:userId/remind', extractTenant, authenticateToken, async (req, res) => {
    try {
        const { userId } = req.params;
        const { channel = 'whatsapp', couponCode } = req.body;

        // جلب بيانات السلة
        const cartResult = await query(
            `SELECT ci.*, p.name, p.price 
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       WHERE ci.user_id = $1 AND ci.tenant_id = $2`,
            [userId, req.tenant_id]
        );

        if (cartResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Cart is empty',
            });
        }

        // جلب بيانات المستخدم
        const userResult = await query(
            'SELECT email, first_name, phone FROM users WHERE id = $1',
            [userId]
        );

        const user = userResult.rows[0];
        const cartTotal = cartResult.rows.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);

        // إرسال التذكير
        await addAbandonedCartJob({
            user_id: userId,
            tenant_id: req.tenant_id,
            type: 'manual_reminder',
            channel,
            coupon_code: couponCode,
            cart_total: cartTotal,
            user_name: user.first_name,
            user_phone: user.phone,
            user_email: user.email,
        });

        // تسجيل إرسال التذكير
        await query(
            `INSERT INTO abandoned_cart_reminders (user_id, tenant_id, channel, coupon_code)
       VALUES ($1, $2, $3, $4)`,
            [userId, req.tenant_id, channel, couponCode]
        );

        res.json({
            success: true,
            message: 'Reminder sent',
        });
    } catch (error) {
        console.error('Send reminder error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to send reminder',
        });
    }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const { query } = require('../db');
const { tenantMiddleware } = require('../middleware/tenant');
const { authenticate } = require('../middleware/auth');

router.use(tenantMiddleware);

// ============ Cart Routes ============

// GET /api/cart - Get user's cart
router.get('/', authenticate, async (req, res) => {
    try {
        const result = await query(
            `SELECT ci.*, p.name, p.name_ar, p.price, p.compare_price, p.images, p.stock
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       WHERE ci.user_id = $1
       ORDER BY ci.created_at DESC`,
            [req.user.id]
        );

        // Calculate totals
        let subtotal = 0;
        const items = result.rows.map(item => {
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;
            return { ...item, total: itemTotal };
        });

        const shipping = subtotal >= 200 ? 0 : 25;
        const total = subtotal + shipping;

        res.json({
            success: true,
            data: {
                items,
                subtotal,
                shipping,
                total,
                items_count: items.length,
                free_shipping_threshold: 200,
                free_shipping_remaining: Math.max(0, 200 - subtotal)
            }
        });
    } catch (error) {
        console.error('Get cart error:', error);
        res.status(500).json({ success: false, error: 'Failed to get cart' });
    }
});

// POST /api/cart - Add to cart
router.post('/', authenticate, async (req, res) => {
    try {
        const { product_id, quantity = 1 } = req.body;

        if (!product_id) {
            return res.status(400).json({ success: false, error: 'Product ID required' });
        }

        // Check if product exists
        const productResult = await query(
            `SELECT id, stock FROM products WHERE id = $1 AND tenant_id = $2`,
            [product_id, req.tenant_id]
        );

        if (!productResult.rows[0]) {
            return res.status(404).json({ success: false, error: 'Product not found' });
        }

        // Check stock
        if (productResult.rows[0].stock < quantity) {
            return res.status(400).json({ success: false, error: 'Not enough stock' });
        }

        // Check if already in cart
        const existing = await query(
            `SELECT id, quantity FROM cart_items WHERE user_id = $1 AND product_id = $2`,
            [req.user.id, product_id]
        );

        if (existing.rows[0]) {
            // Update quantity
            await query(
                `UPDATE cart_items SET quantity = quantity + $1, updated_at = NOW() WHERE id = $2`,
                [quantity, existing.rows[0].id]
            );
        } else {
            // Add new item
            await query(
                `INSERT INTO cart_items (user_id, product_id, quantity) VALUES ($1, $2, $3)`,
                [req.user.id, product_id, quantity]
            );
        }

        res.json({ success: true, message: 'تمت الإضافة للسلة' });
    } catch (error) {
        console.error('Add to cart error:', error);
        res.status(500).json({ success: false, error: 'Failed to add to cart' });
    }
});

// PUT /api/cart/:id - Update quantity
router.put('/:id', authenticate, async (req, res) => {
    try {
        const { quantity } = req.body;

        if (quantity < 1) {
            // Remove item
            await query(`DELETE FROM cart_items WHERE id = $1 AND user_id = $2`, [req.params.id, req.user.id]);
            return res.json({ success: true, message: 'Item removed' });
        }

        await query(
            `UPDATE cart_items SET quantity = $1, updated_at = NOW() WHERE id = $2 AND user_id = $3`,
            [quantity, req.params.id, req.user.id]
        );

        res.json({ success: true, message: 'Quantity updated' });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to update cart' });
    }
});

// DELETE /api/cart/:id - Remove from cart
router.delete('/:id', authenticate, async (req, res) => {
    try {
        await query(
            `DELETE FROM cart_items WHERE id = $1 AND user_id = $2`,
            [req.params.id, req.user.id]
        );
        res.json({ success: true, message: 'Item removed' });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to remove item' });
    }
});

// DELETE /api/cart - Clear cart
router.delete('/', authenticate, async (req, res) => {
    try {
        await query(`DELETE FROM cart_items WHERE user_id = $1`, [req.user.id]);
        res.json({ success: true, message: 'Cart cleared' });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to clear cart' });
    }
});

module.exports = router;

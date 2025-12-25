/**
 * CoreFlex Inventory Locking System
 * الإصدار: 2.1.0-saas
 * 
 * نظام حجز المخزون - يجب وضعه في: api/services/inventory/lock.js
 * 
 * يمنع بيع نفس المنتج مرتين (Race Condition)
 */

const Redis = require('ioredis');
const db = require('../../db');

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// Configuration
const LOCK_PREFIX = 'inventory:lock:';
const RESERVATION_PREFIX = 'inventory:reserved:';
const DEFAULT_LOCK_TTL = 10 * 60; // 10 minutes
const LOCK_RETRY_DELAY = 100; // ms
const MAX_LOCK_RETRIES = 50;

// ============================================
// REDIS LOCK FUNCTIONS
// ============================================

/**
 * Acquire a lock on a product's inventory
 * Uses Redis SET NX EX pattern (atomic)
 */
async function acquireLock(productId, lockId, ttl = DEFAULT_LOCK_TTL) {
    const key = `${LOCK_PREFIX}${productId}`;

    // Try to set the lock (only if not exists)
    const result = await redis.set(key, lockId, 'EX', ttl, 'NX');

    return result === 'OK';
}

/**
 * Release a lock (only if we own it)
 */
async function releaseLock(productId, lockId) {
    const key = `${LOCK_PREFIX}${productId}`;

    // Lua script to atomically check and delete
    const script = `
    if redis.call("get", KEYS[1]) == ARGV[1] then
      return redis.call("del", KEYS[1])
    else
      return 0
    end
  `;

    const result = await redis.eval(script, 1, key, lockId);
    return result === 1;
}

/**
 * Try to acquire lock with retries
 */
async function acquireLockWithRetry(productId, lockId, ttl = DEFAULT_LOCK_TTL) {
    for (let i = 0; i < MAX_LOCK_RETRIES; i++) {
        if (await acquireLock(productId, lockId, ttl)) {
            return true;
        }

        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, LOCK_RETRY_DELAY));
    }

    return false;
}

// ============================================
// INVENTORY RESERVATION
// ============================================

/**
 * Reserve inventory for checkout
 * Called when customer enters checkout page
 */
async function reserveInventory(cartId, items, ttl = DEFAULT_LOCK_TTL) {
    const reservationId = `${cartId}:${Date.now()}`;
    const reservedItems = [];

    try {
        // Start a transaction
        const multi = redis.multi();

        for (const item of items) {
            const lockKey = `${LOCK_PREFIX}${item.product_id}`;
            const reserveKey = `${RESERVATION_PREFIX}${item.product_id}`;

            // Check current stock
            const stock = await getAvailableStock(item.product_id);

            if (stock < item.quantity) {
                throw new Error(`Insufficient stock for product ${item.product_id}`);
            }

            // Reserve the quantity
            multi.hincrby(reserveKey, cartId, item.quantity);
            multi.expire(reserveKey, ttl);

            reservedItems.push({
                product_id: item.product_id,
                quantity: item.quantity,
            });
        }

        await multi.exec();

        // Store reservation metadata
        await redis.setex(
            `reservation:${reservationId}`,
            ttl,
            JSON.stringify({ cartId, items: reservedItems, createdAt: Date.now() })
        );

        return {
            success: true,
            reservationId,
            expiresIn: ttl,
            items: reservedItems,
        };
    } catch (error) {
        // Rollback any partial reservations
        await releaseReservation(cartId, reservedItems);

        return {
            success: false,
            error: error.message,
        };
    }
}

/**
 * Release inventory reservation
 * Called when cart expires or order is cancelled
 */
async function releaseReservation(cartId, items) {
    const multi = redis.multi();

    for (const item of items) {
        const reserveKey = `${RESERVATION_PREFIX}${item.product_id}`;
        multi.hincrby(reserveKey, cartId, -item.quantity);

        // Clean up if 0 or negative
        multi.hdel(reserveKey, cartId);
    }

    await multi.exec();

    return { success: true };
}

/**
 * Get available stock (actual stock - reserved)
 */
async function getAvailableStock(productId) {
    // Get actual stock from database
    const result = await db.query(
        'SELECT stock FROM products WHERE id = $1',
        [productId]
    );

    if (result.rows.length === 0) {
        throw new Error('Product not found');
    }

    const actualStock = result.rows[0].stock;

    // Get reserved quantity from Redis
    const reserveKey = `${RESERVATION_PREFIX}${productId}`;
    const reservations = await redis.hgetall(reserveKey);

    const totalReserved = Object.values(reservations)
        .reduce((sum, qty) => sum + parseInt(qty, 10), 0);

    return Math.max(0, actualStock - totalReserved);
}

// ============================================
// DATABASE TRANSACTION FOR ORDER
// ============================================

/**
 * Commit order with inventory deduction
 * Uses database transaction to ensure consistency
 */
async function commitOrder(orderId, items) {
    const client = await db.pool.connect();

    try {
        await client.query('BEGIN');

        for (const item of items) {
            // Lock the row for update
            const result = await client.query(`
        SELECT id, stock FROM products 
        WHERE id = $1 
        FOR UPDATE
      `, [item.product_id]);

            if (result.rows.length === 0) {
                throw new Error(`Product ${item.product_id} not found`);
            }

            const currentStock = result.rows[0].stock;

            if (currentStock < item.quantity) {
                throw new Error(`Insufficient stock for product ${item.product_id}`);
            }

            // Deduct stock
            await client.query(`
        UPDATE products 
        SET stock = stock - $2, updated_at = NOW()
        WHERE id = $1
      `, [item.product_id, item.quantity]);

            // Check for low stock alert
            const newStock = currentStock - item.quantity;
            if (newStock <= 5) {
                // Queue low stock notification
                const { jobs } = require('../../workers');
                await jobs.dispatchWebhook({
                    event: newStock === 0 ? 'stock.out' : 'stock.low',
                    productId: item.product_id,
                    currentStock: newStock,
                });
            }
        }

        // Update order status
        await client.query(`
      UPDATE orders SET status = 'confirmed', confirmed_at = NOW()
      WHERE id = $1
    `, [orderId]);

        await client.query('COMMIT');

        return { success: true };
    } catch (error) {
        await client.query('ROLLBACK');

        return {
            success: false,
            error: error.message,
        };
    } finally {
        client.release();
    }
}

/**
 * Restore inventory (for cancellations/refunds)
 */
async function restoreInventory(orderId) {
    const client = await db.pool.connect();

    try {
        await client.query('BEGIN');

        // Get order items
        const result = await client.query(`
      SELECT product_id, quantity FROM order_items WHERE order_id = $1
    `, [orderId]);

        for (const item of result.rows) {
            await client.query(`
        UPDATE products 
        SET stock = stock + $2, updated_at = NOW()
        WHERE id = $1
      `, [item.product_id, item.quantity]);
        }

        await client.query('COMMIT');

        return { success: true };
    } catch (error) {
        await client.query('ROLLBACK');

        return {
            success: false,
            error: error.message,
        };
    } finally {
        client.release();
    }
}

// ============================================
// CLEANUP EXPIRED RESERVATIONS
// ============================================

/**
 * Clean up expired reservations (run periodically)
 */
async function cleanupExpiredReservations() {
    // This is handled automatically by Redis TTL
    // But we can add additional cleanup logic here
    console.log('[Inventory] Cleanup completed');
}

// ============================================
// EXPRESS MIDDLEWARE
// ============================================

/**
 * Middleware to reserve inventory when entering checkout
 */
async function reserveCartInventory(req, res, next) {
    const cart = req.cart; // Assume cart is attached by previous middleware

    if (!cart || !cart.items || cart.items.length === 0) {
        return next();
    }

    const result = await reserveInventory(cart.id, cart.items);

    if (!result.success) {
        return res.status(400).json({
            error: 'Some items are no longer available',
            details: result.error,
        });
    }

    req.reservation = result;
    next();
}

// ============================================
// EXPORTS
// ============================================

module.exports = {
    // Lock functions
    acquireLock,
    releaseLock,
    acquireLockWithRetry,

    // Reservation functions
    reserveInventory,
    releaseReservation,
    getAvailableStock,

    // Order functions
    commitOrder,
    restoreInventory,

    // Cleanup
    cleanupExpiredReservations,

    // Middleware
    reserveCartInventory,

    // Constants
    DEFAULT_LOCK_TTL,
};

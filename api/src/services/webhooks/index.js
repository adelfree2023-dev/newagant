/**
 * CoreFlex Webhooks System
 * الإصدار: 2.1.0-saas
 * 
 * نظام الويب هوكس - يجب وضعه في: api/services/webhooks/index.js
 * 
 * يسمح للتجار بالحصول على إشعارات لحظية لأحداث المتجر
 */

const db = require('../../db');
const { jobs } = require('../../workers');
const crypto = require('crypto');

// ============================================
// WEBHOOK EVENTS
// ============================================

const WEBHOOK_EVENTS = {
    // Order events
    'order.created': 'عند إنشاء طلب جديد',
    'order.confirmed': 'عند تأكيد الطلب',
    'order.shipped': 'عند شحن الطلب',
    'order.delivered': 'عند توصيل الطلب',
    'order.cancelled': 'عند إلغاء الطلب',
    'order.refunded': 'عند استرجاع المبلغ',

    // Product events
    'product.created': 'عند إضافة منتج',
    'product.updated': 'عند تعديل منتج',
    'product.deleted': 'عند حذف منتج',
    'stock.low': 'عند انخفاض المخزون',
    'stock.out': 'عند نفاد المخزون',

    // Customer events
    'customer.created': 'عند تسجيل عميل جديد',
    'customer.updated': 'عند تحديث بيانات العميل',

    // Cart events
    'cart.abandoned': 'عند ترك سلة التسوق',

    // Payment events
    'payment.received': 'عند استلام دفعة',
    'payment.failed': 'عند فشل الدفع',
};

// ============================================
// WEBHOOK MANAGEMENT
// ============================================

/**
 * Register a new webhook
 */
async function registerWebhook(tenantId, data) {
    const { url, events, secret } = data;

    // Generate secret if not provided
    const webhookSecret = secret || crypto.randomBytes(32).toString('hex');

    const result = await db.query(`
    INSERT INTO webhooks (tenant_id, url, events, secret, status)
    VALUES ($1, $2, $3, $4, 'active')
    RETURNING id, url, events, status, created_at
  `, [tenantId, url, JSON.stringify(events), webhookSecret]);

    return {
        ...result.rows[0],
        secret: webhookSecret, // Return secret only on creation
    };
}

/**
 * Update webhook
 */
async function updateWebhook(tenantId, webhookId, data) {
    const { url, events, status } = data;

    const result = await db.query(`
    UPDATE webhooks
    SET url = COALESCE($3, url),
        events = COALESCE($4, events),
        status = COALESCE($5, status),
        updated_at = NOW()
    WHERE id = $1 AND tenant_id = $2
    RETURNING id, url, events, status, updated_at
  `, [webhookId, tenantId, url, events ? JSON.stringify(events) : null, status]);

    return result.rows[0];
}

/**
 * Delete webhook
 */
async function deleteWebhook(tenantId, webhookId) {
    await db.query(
        'DELETE FROM webhooks WHERE id = $1 AND tenant_id = $2',
        [webhookId, tenantId]
    );
    return { success: true };
}

/**
 * Get all webhooks for tenant
 */
async function getWebhooks(tenantId) {
    const result = await db.query(`
    SELECT id, url, events, status, created_at, last_triggered_at, failure_count
    FROM webhooks
    WHERE tenant_id = $1
    ORDER BY created_at DESC
  `, [tenantId]);

    return result.rows;
}

/**
 * Regenerate webhook secret
 */
async function regenerateSecret(tenantId, webhookId) {
    const newSecret = crypto.randomBytes(32).toString('hex');

    await db.query(
        'UPDATE webhooks SET secret = $3, updated_at = NOW() WHERE id = $1 AND tenant_id = $2',
        [webhookId, tenantId, newSecret]
    );

    return { secret: newSecret };
}

// ============================================
// WEBHOOK DISPATCHER
// ============================================

/**
 * Dispatch webhook event
 * Queue the webhook for async delivery
 */
async function dispatch(tenantId, event, payload) {
    // Find all active webhooks subscribed to this event
    const result = await db.query(`
    SELECT id, url, secret, events
    FROM webhooks
    WHERE tenant_id = $1 
      AND status = 'active'
      AND events @> $2
  `, [tenantId, JSON.stringify([event])]);

    const webhooks = result.rows;

    if (webhooks.length === 0) {
        return { dispatched: 0 };
    }

    // Prepare payload with metadata
    const webhookPayload = {
        id: crypto.randomUUID(),
        event: event,
        created_at: new Date().toISOString(),
        data: payload,
    };

    // Queue each webhook
    const dispatches = webhooks.map(async (webhook) => {
        await jobs.dispatchWebhook({
            webhookId: webhook.id,
            url: webhook.url,
            event: event,
            payload: webhookPayload,
            secret: webhook.secret,
        });

        // Update last triggered
        await db.query(
            'UPDATE webhooks SET last_triggered_at = NOW() WHERE id = $1',
            [webhook.id]
        );
    });

    await Promise.all(dispatches);

    return { dispatched: webhooks.length };
}

/**
 * Record webhook delivery result
 */
async function recordDelivery(webhookId, success, statusCode, error = null) {
    if (success) {
        await db.query(`
      UPDATE webhooks 
      SET failure_count = 0, 
          last_success_at = NOW()
      WHERE id = $1
    `, [webhookId]);
    } else {
        await db.query(`
      UPDATE webhooks 
      SET failure_count = failure_count + 1,
          last_error = $2,
          last_error_at = NOW()
      WHERE id = $1
    `, [webhookId, error]);

        // Disable webhook after 10 consecutive failures
        await db.query(`
      UPDATE webhooks 
      SET status = 'disabled'
      WHERE id = $1 AND failure_count >= 10
    `, [webhookId]);
    }

    // Log delivery
    await db.query(`
    INSERT INTO webhook_logs (webhook_id, event, status_code, success, error, created_at)
    VALUES ($1, $2, $3, $4, $5, NOW())
  `, [webhookId, 'delivery', statusCode, success, error]);
}

// ============================================
// EVENT EMITTER HELPERS
// ============================================

/**
 * Create event emitter for a model
 * Use these in your controllers after CRUD operations
 */
const events = {
    // Order events
    orderCreated: async (tenantId, order) => {
        await dispatch(tenantId, 'order.created', {
            order_id: order.id,
            order_number: order.order_number,
            customer: order.customer,
            total: order.total,
            items_count: order.items?.length || 0,
        });
    },

    orderStatusChanged: async (tenantId, order, newStatus) => {
        const eventMap = {
            'confirmed': 'order.confirmed',
            'shipped': 'order.shipped',
            'delivered': 'order.delivered',
            'cancelled': 'order.cancelled',
        };

        if (eventMap[newStatus]) {
            await dispatch(tenantId, eventMap[newStatus], {
                order_id: order.id,
                order_number: order.order_number,
                status: newStatus,
                tracking_number: order.tracking_number,
            });
        }
    },

    // Product events
    productCreated: async (tenantId, product) => {
        await dispatch(tenantId, 'product.created', {
            product_id: product.id,
            name: product.name,
            price: product.price,
            stock: product.stock,
        });
    },

    stockLow: async (tenantId, product) => {
        await dispatch(tenantId, 'stock.low', {
            product_id: product.id,
            name: product.name,
            current_stock: product.stock,
            sku: product.sku,
        });
    },

    stockOut: async (tenantId, product) => {
        await dispatch(tenantId, 'stock.out', {
            product_id: product.id,
            name: product.name,
            sku: product.sku,
        });
    },

    // Customer events
    customerCreated: async (tenantId, customer) => {
        await dispatch(tenantId, 'customer.created', {
            customer_id: customer.id,
            name: customer.name,
            email: customer.email,
        });
    },

    // Cart events
    cartAbandoned: async (tenantId, cart) => {
        await dispatch(tenantId, 'cart.abandoned', {
            customer_id: cart.user_id,
            items_count: cart.items_count,
            total: cart.total,
            cart_age_hours: cart.age_hours,
        });
    },
};

// ============================================
// EXPRESS ROUTES
// ============================================

const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/auth');
const { requireTenant } = require('../../middleware/tenant');

// Get available events
router.get('/events', (req, res) => {
    res.json({ events: WEBHOOK_EVENTS });
});

// List webhooks
router.get('/', authenticate, requireTenant, async (req, res) => {
    const webhooks = await getWebhooks(req.tenantId);
    res.json({ webhooks });
});

// Create webhook
router.post('/', authenticate, requireTenant, async (req, res) => {
    const { url, events } = req.body;

    if (!url || !events || events.length === 0) {
        return res.status(400).json({ error: 'URL and events are required' });
    }

    // Validate events
    const validEvents = events.filter(e => WEBHOOK_EVENTS[e]);
    if (validEvents.length !== events.length) {
        return res.status(400).json({ error: 'Invalid event type' });
    }

    const webhook = await registerWebhook(req.tenantId, req.body);
    res.status(201).json({ webhook });
});

// Update webhook
router.put('/:id', authenticate, requireTenant, async (req, res) => {
    const webhook = await updateWebhook(req.tenantId, req.params.id, req.body);
    if (!webhook) {
        return res.status(404).json({ error: 'Webhook not found' });
    }
    res.json({ webhook });
});

// Delete webhook
router.delete('/:id', authenticate, requireTenant, async (req, res) => {
    await deleteWebhook(req.tenantId, req.params.id);
    res.json({ success: true });
});

// Regenerate secret
router.post('/:id/regenerate-secret', authenticate, requireTenant, async (req, res) => {
    const result = await regenerateSecret(req.tenantId, req.params.id);
    res.json(result);
});

// Test webhook
router.post('/:id/test', authenticate, requireTenant, async (req, res) => {
    const result = await db.query(
        'SELECT url, secret FROM webhooks WHERE id = $1 AND tenant_id = $2',
        [req.params.id, req.tenantId]
    );

    if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Webhook not found' });
    }

    await jobs.dispatchWebhook({
        webhookId: req.params.id,
        url: result.rows[0].url,
        event: 'test',
        payload: { test: true, timestamp: new Date().toISOString() },
        secret: result.rows[0].secret,
    });

    res.json({ message: 'Test webhook queued' });
});

// ============================================
// EXPORTS
// ============================================

module.exports = {
    // Constants
    WEBHOOK_EVENTS,

    // Management
    registerWebhook,
    updateWebhook,
    deleteWebhook,
    getWebhooks,
    regenerateSecret,

    // Dispatcher
    dispatch,
    recordDelivery,

    // Event emitters
    events,

    // Router
    router,
};

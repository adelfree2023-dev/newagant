/**
 * CoreFlex Redis Queue Worker System
 * الإصدار: 2.1.0-saas
 * 
 * نظام معالجة المهام الخلفية - يجب وضعه في: api/workers/index.js
 * 
 * يستخدم BullMQ لمعالجة:
 * - إرسال واتساب
 * - إرسال إيميلات
 * - مزامنة المخزون
 * - توليد التقارير
 */

const { Queue, Worker, QueueScheduler } = require('bullmq');
const Redis = require('ioredis');

// Redis connection
const connection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: null,
});

// ============================================
// QUEUE DEFINITIONS
// ============================================

// Notification Queue (WhatsApp, Email, SMS)
const notificationQueue = new Queue('notifications', { connection });

// Inventory Sync Queue
const inventoryQueue = new Queue('inventory', { connection });

// Report Generation Queue
const reportQueue = new Queue('reports', { connection });

// Webhook Dispatch Queue
const webhookQueue = new Queue('webhooks', { connection });

// Scheduled Tasks Queue
const scheduledQueue = new Queue('scheduled', { connection });

// ============================================
// QUEUE SCHEDULERS (for delayed/repeated jobs)
// ============================================

new QueueScheduler('notifications', { connection });
new QueueScheduler('inventory', { connection });
new QueueScheduler('reports', { connection });
new QueueScheduler('webhooks', { connection });
new QueueScheduler('scheduled', { connection });

// ============================================
// JOB PRODUCERS (Add jobs to queues)
// ============================================

const jobs = {
    /**
     * Send WhatsApp notification
     */
    sendWhatsApp: async (data, options = {}) => {
        return notificationQueue.add('whatsapp', data, {
            attempts: 3,
            backoff: {
                type: 'exponential',
                delay: 1000,
            },
            removeOnComplete: true,
            removeOnFail: 100,
            ...options,
        });
    },

    /**
     * Send Email notification
     */
    sendEmail: async (data, options = {}) => {
        return notificationQueue.add('email', data, {
            attempts: 3,
            backoff: {
                type: 'exponential',
                delay: 2000,
            },
            removeOnComplete: true,
            ...options,
        });
    },

    /**
     * Send SMS notification
     */
    sendSMS: async (data, options = {}) => {
        return notificationQueue.add('sms', data, {
            attempts: 2,
            backoff: { type: 'fixed', delay: 5000 },
            removeOnComplete: true,
            ...options,
        });
    },

    /**
     * Sync inventory with external platform
     */
    syncInventory: async (data, options = {}) => {
        return inventoryQueue.add('sync', data, {
            attempts: 3,
            backoff: { type: 'exponential', delay: 5000 },
            ...options,
        });
    },

    /**
     * Generate report
     */
    generateReport: async (data, options = {}) => {
        return reportQueue.add('generate', data, {
            attempts: 1,
            timeout: 5 * 60 * 1000, // 5 minutes
            ...options,
        });
    },

    /**
     * Dispatch webhook
     */
    dispatchWebhook: async (data, options = {}) => {
        return webhookQueue.add('dispatch', data, {
            attempts: 5,
            backoff: {
                type: 'exponential',
                delay: 1000,
            },
            ...options,
        });
    },

    /**
     * Schedule abandoned cart check (every 15 minutes)
     */
    scheduleAbandonedCartCheck: async () => {
        return scheduledQueue.add('abandonedCart', {}, {
            repeat: {
                every: 15 * 60 * 1000, // 15 minutes
            },
        });
    },

    /**
     * Schedule daily report
     */
    scheduleDailyReport: async (tenantId) => {
        return scheduledQueue.add('dailyReport', { tenantId }, {
            repeat: {
                cron: '0 8 * * *', // 8 AM daily
            },
        });
    },
};

// ============================================
// WORKER PROCESSORS
// ============================================

// Notification Worker
const notificationWorker = new Worker('notifications', async (job) => {
    const { type, data } = job;

    console.log(`[Notification Worker] Processing ${type} job:`, job.id);

    switch (job.name) {
        case 'whatsapp':
            const whatsapp = require('../services/whatsapp');

            if (data.type === 'order_confirmation') {
                await whatsapp.notifyOrderConfirmation(data.order);
            } else if (data.type === 'shipping_update') {
                await whatsapp.notifyShipping(data.order, data.tracking);
            } else if (data.type === 'abandoned_cart') {
                await whatsapp.sendTextMessage(data.phone, data.message);
            }
            break;

        case 'email':
            const email = require('../services/email');
            await email.send(data);
            break;

        case 'sms':
            const sms = require('../services/sms');
            await sms.send(data.phone, data.message);
            break;

        default:
            console.warn(`Unknown notification type: ${job.name}`);
    }

    return { success: true };
}, { connection, concurrency: 5 });

// Inventory Worker
const inventoryWorker = new Worker('inventory', async (job) => {
    console.log(`[Inventory Worker] Processing job:`, job.id);

    const { tenantId, productId, provider, action } = job.data;

    // Sync with external provider
    if (action === 'update_stock') {
        // Update stock in external system
    } else if (action === 'fetch_stock') {
        // Fetch stock from external system
    }

    return { success: true };
}, { connection, concurrency: 3 });

// Report Worker
const reportWorker = new Worker('reports', async (job) => {
    console.log(`[Report Worker] Generating report:`, job.id);

    const { tenantId, type, dateRange, format } = job.data;

    // Generate report based on type
    // Store in S3/local storage
    // Return download URL

    return { success: true, url: `/reports/${job.id}.${format}` };
}, { connection, concurrency: 2 });

// Webhook Worker
const webhookWorker = new Worker('webhooks', async (job) => {
    console.log(`[Webhook Worker] Dispatching webhook:`, job.id);

    const { url, event, payload, secret } = job.data;
    const axios = require('axios');
    const crypto = require('crypto');

    // Generate signature
    const signature = crypto
        .createHmac('sha256', secret)
        .update(JSON.stringify(payload))
        .digest('hex');

    const response = await axios.post(url, payload, {
        headers: {
            'Content-Type': 'application/json',
            'X-Webhook-Event': event,
            'X-Webhook-Signature': signature,
        },
        timeout: 10000,
    });

    return {
        success: true,
        statusCode: response.status,
    };
}, { connection, concurrency: 10 });

// Scheduled Tasks Worker
const scheduledWorker = new Worker('scheduled', async (job) => {
    console.log(`[Scheduled Worker] Running:`, job.name);

    switch (job.name) {
        case 'abandonedCart':
            await processAbandonedCarts();
            break;

        case 'dailyReport':
            await generateDailyReport(job.data.tenantId);
            break;

        default:
            console.warn(`Unknown scheduled task: ${job.name}`);
    }

    return { success: true };
}, { connection });

// ============================================
// SCHEDULED TASK HANDLERS
// ============================================

async function processAbandonedCarts() {
    const db = require('../db');

    // Find carts older than 30 minutes that haven't converted
    const result = await db.query(`
    SELECT c.*, u.phone, u.name, t.settings
    FROM cart_items c
    JOIN users u ON c.user_id = u.id
    JOIN tenants t ON c.tenant_id = t.id
    WHERE c.created_at < NOW() - INTERVAL '30 minutes'
      AND c.created_at > NOW() - INTERVAL '24 hours'
      AND NOT EXISTS (
        SELECT 1 FROM orders o 
        WHERE o.user_id = c.user_id 
          AND o.created_at > c.created_at
      )
      AND NOT EXISTS (
        SELECT 1 FROM abandoned_cart_notifications n
        WHERE n.cart_id = c.id
          AND n.sent_at > NOW() - INTERVAL '24 hours'
      )
    GROUP BY c.user_id, c.tenant_id, u.phone, u.name, t.settings
  `);

    for (const cart of result.rows) {
        // Queue WhatsApp reminder
        await jobs.sendWhatsApp({
            type: 'abandoned_cart',
            phone: cart.phone,
            message: `مرحباً ${cart.name}! 🛒\n\nلاحظنا أن لديك منتجات في سلتك. أكمل طلبك الآن واحصل على شحن مجاني!\n\nرابط السلة: ${cart.settings?.store_url}/cart`,
        });

        // Record that we sent notification
        await db.query(
            'INSERT INTO abandoned_cart_notifications (cart_id, sent_at) VALUES ($1, NOW())',
            [cart.id]
        );
    }

    console.log(`[Abandoned Cart] Processed ${result.rows.length} carts`);
}

async function generateDailyReport(tenantId) {
    // Generate and email daily report
    console.log(`[Daily Report] Generating for tenant:`, tenantId);
}

// ============================================
// ERROR HANDLING
// ============================================

notificationWorker.on('failed', (job, err) => {
    console.error(`[Notification Worker] Job ${job?.id} failed:`, err.message);
});

inventoryWorker.on('failed', (job, err) => {
    console.error(`[Inventory Worker] Job ${job?.id} failed:`, err.message);
});

webhookWorker.on('failed', (job, err) => {
    console.error(`[Webhook Worker] Job ${job?.id} failed:`, err.message);
});

// ============================================
// EXPORTS
// ============================================

module.exports = {
    // Queues
    queues: {
        notification: notificationQueue,
        inventory: inventoryQueue,
        report: reportQueue,
        webhook: webhookQueue,
        scheduled: scheduledQueue,
    },

    // Job producers
    jobs,

    // Workers (for graceful shutdown)
    workers: {
        notification: notificationWorker,
        inventory: inventoryWorker,
        report: reportWorker,
        webhook: webhookWorker,
        scheduled: scheduledWorker,
    },

    // Graceful shutdown
    shutdown: async () => {
        await notificationWorker.close();
        await inventoryWorker.close();
        await reportWorker.close();
        await webhookWorker.close();
        await scheduledWorker.close();
        await connection.quit();
    },
};

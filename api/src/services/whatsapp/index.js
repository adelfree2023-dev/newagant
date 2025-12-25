/**
 * CoreFlex WhatsApp Integration Service
 * الإصدار: 2.1.0
 * 
 * خدمة الواتساب - يجب وضعه في: api/services/whatsapp/index.js
 */

const axios = require('axios');

// Configuration
const config = {
    enabled: process.env.WHATSAPP_ENABLED === 'true',
    apiUrl: process.env.WHATSAPP_API_URL || 'https://graph.facebook.com/v17.0',
    phoneNumberId: process.env.WHATSAPP_PHONE_ID,
    accessToken: process.env.WHATSAPP_ACCESS_TOKEN,
};

// ============================================
// MESSAGE TEMPLATES
// ============================================

const templates = {
    // Order confirmation
    orderConfirmation: {
        name: 'order_confirmation',
        language: 'ar',
        components: (order) => [
            {
                type: 'body',
                parameters: [
                    { type: 'text', text: order.customer_name },
                    { type: 'text', text: order.order_number },
                    { type: 'text', text: `${order.total} ${order.currency}` },
                ],
            },
        ],
    },

    // Shipping update
    shippingUpdate: {
        name: 'shipping_update',
        language: 'ar',
        components: (data) => [
            {
                type: 'body',
                parameters: [
                    { type: 'text', text: data.customer_name },
                    { type: 'text', text: data.order_number },
                    { type: 'text', text: data.tracking_number },
                    { type: 'text', text: data.tracking_url },
                ],
            },
        ],
    },

    // Delivery confirmation
    deliveryConfirmation: {
        name: 'delivery_confirmation',
        language: 'ar',
        components: (order) => [
            {
                type: 'body',
                parameters: [
                    { type: 'text', text: order.customer_name },
                    { type: 'text', text: order.order_number },
                ],
            },
        ],
    },
};

// ============================================
// WHATSAPP API FUNCTIONS
// ============================================

/**
 * Send a template message
 */
async function sendTemplateMessage(to, templateName, templateData) {
    if (!config.enabled) {
        console.log('[WhatsApp] Service disabled, skipping message');
        return { success: false, error: 'WhatsApp service is disabled' };
    }

    const template = templates[templateName];
    if (!template) {
        return { success: false, error: 'Unknown template' };
    }

    try {
        const response = await axios.post(
            `${config.apiUrl}/${config.phoneNumberId}/messages`,
            {
                messaging_product: 'whatsapp',
                to: formatPhoneNumber(to),
                type: 'template',
                template: {
                    name: template.name,
                    language: { code: template.language },
                    components: template.components(templateData),
                },
            },
            {
                headers: {
                    'Authorization': `Bearer ${config.accessToken}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        return {
            success: true,
            messageId: response.data.messages?.[0]?.id,
        };
    } catch (error) {
        console.error('[WhatsApp] Send error:', error.response?.data || error.message);
        return {
            success: false,
            error: error.response?.data?.error?.message || 'Failed to send message',
        };
    }
}

/**
 * Send a text message (for support)
 */
async function sendTextMessage(to, text) {
    if (!config.enabled) {
        return { success: false, error: 'WhatsApp service is disabled' };
    }

    try {
        const response = await axios.post(
            `${config.apiUrl}/${config.phoneNumberId}/messages`,
            {
                messaging_product: 'whatsapp',
                to: formatPhoneNumber(to),
                type: 'text',
                text: { body: text },
            },
            {
                headers: {
                    'Authorization': `Bearer ${config.accessToken}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        return {
            success: true,
            messageId: response.data.messages?.[0]?.id,
        };
    } catch (error) {
        console.error('[WhatsApp] Send error:', error.response?.data || error.message);
        return {
            success: false,
            error: 'Failed to send message',
        };
    }
}

/**
 * Generate a WhatsApp chat link
 */
function generateChatLink(phone, message = '') {
    const formattedPhone = formatPhoneNumber(phone);
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
}

/**
 * Generate order confirmation message (for manual sending)
 */
function generateOrderMessage(order) {
    const items = order.items
        .map(i => `• ${i.product_name} × ${i.quantity}`)
        .join('\n');

    return `مرحباً ${order.customer_name}! 🎉

تم استلام طلبك بنجاح!

رقم الطلب: #${order.order_number}

المنتجات:
${items}

الإجمالي: ${order.total} ${order.currency}

سيتم التواصل معك قريباً لتأكيد الطلب وترتيب الشحن.

شكراً لتسوقك معنا! 🛍️`;
}

/**
 * Generate shipping update message
 */
function generateShippingMessage(order, tracking) {
    return `مرحباً ${order.customer_name}! 📦

تم شحن طلبك!

رقم الطلب: #${order.order_number}
رقم التتبع: ${tracking.tracking_number}

يمكنك تتبع شحنتك من هنا:
${tracking.tracking_url}

نتمنى لك تجربة تسوق ممتعة! 🚚`;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Format phone number to international format
 */
function formatPhoneNumber(phone) {
    // Remove all non-digits
    let cleaned = phone.replace(/\D/g, '');

    // Handle Egyptian numbers
    if (cleaned.startsWith('01') && cleaned.length === 11) {
        cleaned = '20' + cleaned.substring(1); // Add Egypt country code
    }

    // Handle Saudi numbers
    if (cleaned.startsWith('05') && cleaned.length === 10) {
        cleaned = '966' + cleaned.substring(1); // Add Saudi country code
    }

    return cleaned;
}

// ============================================
// ORDER NOTIFICATION FUNCTIONS
// ============================================

/**
 * Send order confirmation to customer
 */
async function notifyOrderConfirmation(order) {
    return sendTemplateMessage('orderConfirmation', order.customer_phone, {
        customer_name: order.customer_name,
        order_number: order.order_number,
        total: order.total,
        currency: order.currency || 'EGP',
    });
}

/**
 * Send shipping notification to customer
 */
async function notifyShipping(order, tracking) {
    return sendTemplateMessage('shippingUpdate', order.customer_phone, {
        customer_name: order.customer_name,
        order_number: order.order_number,
        tracking_number: tracking.tracking_number,
        tracking_url: tracking.tracking_url,
    });
}

/**
 * Send delivery confirmation to customer
 */
async function notifyDelivery(order) {
    return sendTemplateMessage('deliveryConfirmation', order.customer_phone, {
        customer_name: order.customer_name,
        order_number: order.order_number,
    });
}

// ============================================
// ADMIN FUNCTIONS
// ============================================

/**
 * Generate admin WhatsApp link to customer
 */
function getCustomerChatLink(order) {
    const message = `مرحباً ${order.customer_name}، بخصوص طلبك رقم #${order.order_number}...`;
    return generateChatLink(order.customer_phone, message);
}

// ============================================
// EXPRESS ROUTES
// ============================================

const express = require('express');
const router = express.Router();

// Send order confirmation
router.post('/notify/order', async (req, res) => {
    const { order } = req.body;
    const result = await notifyOrderConfirmation(order);
    res.json(result);
});

// Send shipping notification
router.post('/notify/shipping', async (req, res) => {
    const { order, tracking } = req.body;
    const result = await notifyShipping(order, tracking);
    res.json(result);
});

// Generate chat link
router.post('/chat-link', (req, res) => {
    const { phone, message } = req.body;
    const link = generateChatLink(phone, message);
    res.json({ success: true, link });
});

// ============================================
// EXPORTS
// ============================================

module.exports = {
    // Configuration
    config,

    // Core functions
    sendTemplateMessage,
    sendTextMessage,
    generateChatLink,
    formatPhoneNumber,

    // Message generators
    generateOrderMessage,
    generateShippingMessage,

    // Notification functions
    notifyOrderConfirmation,
    notifyShipping,
    notifyDelivery,

    // Admin functions
    getCustomerChatLink,

    // Express router
    router,
};

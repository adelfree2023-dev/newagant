/**
 * CoreFlex Shipping Integration Service
 * الإصدار: 2.1.0
 * 
 * خدمة الشحن المتكاملة - يجب وضعه في: api/services/shipping/index.js
 */

const axios = require('axios');

// ============================================
// SHIPPING PROVIDER CONFIGURATIONS
// ============================================

const providers = {
    bosta: {
        name: 'Bosta',
        name_ar: 'بوسطة',
        apiUrl: process.env.BOSTA_API_URL || 'https://app.bosta.co/api/v2',
        apiKey: process.env.BOSTA_API_KEY,
        enabled: !!process.env.BOSTA_API_KEY,
    },
    aramex: {
        name: 'Aramex',
        name_ar: 'أراميكس',
        apiUrl: 'https://ws.aramex.net/ShippingAPI.V2',
        username: process.env.ARAMEX_USERNAME,
        password: process.env.ARAMEX_PASSWORD,
        accountNumber: process.env.ARAMEX_ACCOUNT_NUMBER,
        enabled: !!process.env.ARAMEX_USERNAME,
    },
    r2s: {
        name: 'R2S',
        name_ar: 'R2S',
        apiUrl: process.env.R2S_API_URL,
        apiKey: process.env.R2S_API_KEY,
        enabled: !!process.env.R2S_API_KEY,
    },
    smsa: {
        name: 'SMSA',
        name_ar: 'SMSA',
        apiUrl: 'https://api.smsaexpress.com',
        apiKey: process.env.SMSA_API_KEY,
        enabled: !!process.env.SMSA_API_KEY,
    },
};

// ============================================
// BOSTA INTEGRATION
// ============================================

const bosta = {
    /**
     * Create a new shipment
     */
    async createShipment(order) {
        const { apiUrl, apiKey } = providers.bosta;

        const shipmentData = {
            type: 10, // Delivery
            specs: {
                packageType: 'Parcel',
                size: 'SMALL',
                packageDetails: {
                    itemsCount: order.items.length,
                    description: order.items.map(i => i.product_name).join(', ').substring(0, 100),
                },
            },
            notes: order.notes || '',
            cod: order.payment_method === 'cod' ? order.total : 0,
            dropOffAddress: {
                city: order.address.city,
                firstLine: order.address.address,
                secondLine: '',
                buildingNumber: '',
                floor: '',
                apartment: '',
                zone: '',
                district: '',
            },
            receiver: {
                firstName: order.address.name.split(' ')[0],
                lastName: order.address.name.split(' ').slice(1).join(' ') || '',
                phone: order.address.phone,
                email: order.customer?.email || '',
            },
            businessReference: order.order_number,
        };

        try {
            const response = await axios.post(`${apiUrl}/deliveries`, shipmentData, {
                headers: {
                    'Authorization': apiKey,
                    'Content-Type': 'application/json',
                },
            });

            return {
                success: true,
                tracking_number: response.data._id,
                tracking_url: `https://bosta.co/tracking/${response.data._id}`,
                provider: 'bosta',
                raw: response.data,
            };
        } catch (error) {
            console.error('Bosta shipment error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to create shipment',
            };
        }
    },

    /**
     * Track a shipment
     */
    async trackShipment(trackingNumber) {
        const { apiUrl, apiKey } = providers.bosta;

        try {
            const response = await axios.get(`${apiUrl}/deliveries/${trackingNumber}`, {
                headers: { 'Authorization': apiKey },
            });

            const delivery = response.data;

            return {
                success: true,
                status: mapBostaStatus(delivery.state?.value),
                current_status: delivery.state?.value,
                updates: (delivery.timeline || []).map(t => ({
                    status: t.state,
                    date: t.timestamp,
                    note: t.note || '',
                })),
                estimated_delivery: delivery.scheduledDate,
            };
        } catch (error) {
            return {
                success: false,
                error: 'Failed to track shipment',
            };
        }
    },

    /**
     * Cancel a shipment
     */
    async cancelShipment(trackingNumber) {
        const { apiUrl, apiKey } = providers.bosta;

        try {
            await axios.delete(`${apiUrl}/deliveries/${trackingNumber}`, {
                headers: { 'Authorization': apiKey },
            });

            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: 'Failed to cancel shipment',
            };
        }
    },

    /**
     * Get shipping rates
     */
    async getRates(fromCity, toCity, weight) {
        // Bosta uses zone-based pricing
        // You would typically fetch this from their API or use a cached rate card
        const baseRate = 45; // Base rate in EGP
        const weightRate = weight > 1 ? (weight - 1) * 10 : 0;

        return {
            success: true,
            rates: [{
                provider: 'bosta',
                name: 'Bosta Standard',
                price: baseRate + weightRate,
                currency: 'EGP',
                estimated_days: '2-3',
            }],
        };
    },
};

// Map Bosta status to our internal status
function mapBostaStatus(bostaStatus) {
    const statusMap = {
        'PENDING_PICKUP': 'processing',
        'PICKED_UP': 'shipped',
        'IN_HUB': 'shipped',
        'OUT_FOR_DELIVERY': 'shipped',
        'DELIVERED': 'delivered',
        'RETURNED': 'returned',
        'CANCELLED': 'cancelled',
    };
    return statusMap[bostaStatus] || 'unknown';
}

// ============================================
// ARAMEX INTEGRATION (Placeholder)
// ============================================

const aramex = {
    async createShipment(order) {
        // Implement Aramex SOAP API integration
        return {
            success: false,
            error: 'Aramex integration coming soon',
        };
    },

    async trackShipment(trackingNumber) {
        return {
            success: false,
            error: 'Aramex integration coming soon',
        };
    },

    async getRates(fromCity, toCity, weight) {
        return { success: false, error: 'Aramex integration coming soon' };
    },
};

// ============================================
// UNIFIED SHIPPING SERVICE
// ============================================

const shippingService = {
    /**
     * Get all enabled providers
     */
    getProviders() {
        return Object.entries(providers)
            .filter(([_, config]) => config.enabled)
            .map(([key, config]) => ({
                id: key,
                name: config.name,
                name_ar: config.name_ar,
            }));
    },

    /**
     * Create shipment with specified provider
     */
    async createShipment(provider, order) {
        if (!providers[provider]?.enabled) {
            return { success: false, error: `Provider ${provider} is not enabled` };
        }

        switch (provider) {
            case 'bosta':
                return bosta.createShipment(order);
            case 'aramex':
                return aramex.createShipment(order);
            default:
                return { success: false, error: 'Unknown provider' };
        }
    },

    /**
     * Track shipment
     */
    async trackShipment(provider, trackingNumber) {
        switch (provider) {
            case 'bosta':
                return bosta.trackShipment(trackingNumber);
            case 'aramex':
                return aramex.trackShipment(trackingNumber);
            default:
                return { success: false, error: 'Unknown provider' };
        }
    },

    /**
     * Cancel shipment
     */
    async cancelShipment(provider, trackingNumber) {
        switch (provider) {
            case 'bosta':
                return bosta.cancelShipment(trackingNumber);
            default:
                return { success: false, error: 'Cancel not supported for this provider' };
        }
    },

    /**
     * Get shipping rates from all providers
     */
    async getRates(fromCity, toCity, weight = 1) {
        const enabledProviders = this.getProviders();
        const ratesPromises = enabledProviders.map(async (p) => {
            try {
                switch (p.id) {
                    case 'bosta':
                        return await bosta.getRates(fromCity, toCity, weight);
                    default:
                        return { success: false };
                }
            } catch (error) {
                return { success: false };
            }
        });

        const results = await Promise.all(ratesPromises);
        const allRates = results
            .filter(r => r.success)
            .flatMap(r => r.rates || []);

        return {
            success: true,
            rates: allRates.sort((a, b) => a.price - b.price),
        };
    },

    /**
     * Auto-select best provider based on destination and price
     */
    async getBestProvider(order) {
        const rates = await this.getRates(
            order.pickup_city || 'Cairo',
            order.address.city,
            order.total_weight || 1
        );

        if (!rates.success || rates.rates.length === 0) {
            return { success: false, error: 'No shipping options available' };
        }

        // Return cheapest option
        return {
            success: true,
            recommended: rates.rates[0],
            alternatives: rates.rates.slice(1),
        };
    },
};

// ============================================
// EXPRESS ROUTES
// ============================================

const express = require('express');
const router = express.Router();

// Get available providers
router.get('/providers', (req, res) => {
    res.json({
        success: true,
        providers: shippingService.getProviders(),
    });
});

// Get shipping rates
router.post('/rates', async (req, res) => {
    const { from_city, to_city, weight } = req.body;

    const result = await shippingService.getRates(from_city, to_city, weight);
    res.json(result);
});

// Create shipment
router.post('/shipments', async (req, res) => {
    const { provider, order } = req.body;

    const result = await shippingService.createShipment(provider, order);
    res.json(result);
});

// Track shipment
router.get('/track/:provider/:tracking_number', async (req, res) => {
    const { provider, tracking_number } = req.params;

    const result = await shippingService.trackShipment(provider, tracking_number);
    res.json(result);
});

// ============================================
// EXPORTS
// ============================================

module.exports = {
    shippingService,
    bosta,
    aramex,
    router,
};

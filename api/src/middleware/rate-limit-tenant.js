/**
 * CoreFlex Rate Limiting per Tenant
 * الإصدار: 2.1.0-saas
 * 
 * Rate Limiting بناءً على TenantID - يجب وضعه في: api/middleware/rate-limit-tenant.js
 */

const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const Redis = require('ioredis');

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// ============================================
// TENANT-BASED RATE LIMITING
// ============================================

/**
 * Rate limiter that limits by tenant + IP
 * Prevents one tenant from affecting others
 */
const tenantRateLimiter = rateLimit({
    store: new RedisStore({
        client: redis,
        prefix: 'rl:tenant:',
    }),

    windowMs: 15 * 60 * 1000, // 15 minutes

    max: (req) => {
        // Different limits for different subscription plans
        const tenant = req.tenant;
        if (!tenant) return 100; // Default for non-tenant requests

        switch (tenant.subscription_plan) {
            case 'enterprise':
                return 10000;
            case 'business':
                return 5000;
            case 'starter':
                return 1000;
            case 'free':
            default:
                return 500;
        }
    },

    keyGenerator: (req) => {
        // Combine tenant ID with IP for the key
        const tenantId = req.tenantId || 'anonymous';
        const ip = req.ip || req.connection.remoteAddress;
        return `${tenantId}:${ip}`;
    },

    handler: (req, res) => {
        res.status(429).json({
            error: 'Too many requests',
            message: 'Please slow down your requests',
            retryAfter: 15 * 60,
        });
    },

    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * API-specific rate limiter (for external API usage)
 */
const apiRateLimiter = rateLimit({
    store: new RedisStore({
        client: redis,
        prefix: 'rl:api:',
    }),

    windowMs: 60 * 1000, // 1 minute

    max: (req) => {
        const tenant = req.tenant;
        if (!tenant) return 10;

        switch (tenant.subscription_plan) {
            case 'enterprise':
                return 1000;
            case 'business':
                return 500;
            case 'starter':
                return 100;
            case 'free':
            default:
                return 30;
        }
    },

    keyGenerator: (req) => {
        const tenantId = req.tenantId || 'anonymous';
        return `api:${tenantId}`;
    },

    handler: (req, res) => {
        res.status(429).json({
            error: 'API rate limit exceeded',
            message: 'Upgrade your plan for higher limits',
        });
    },
});

/**
 * Webhook-specific rate limiter (prevent webhook loops)
 */
const webhookRateLimiter = rateLimit({
    store: new RedisStore({
        client: redis,
        prefix: 'rl:webhook:',
    }),

    windowMs: 60 * 1000,
    max: 100,

    keyGenerator: (req) => {
        return `webhook:${req.tenantId}`;
    },
});

module.exports = {
    tenantRateLimiter,
    apiRateLimiter,
    webhookRateLimiter,
};

/**
 * Main API Server Entry Point
 * نقطة الدخول الرئيسية للـ API
 * 
 * يجب وضعه في: api/src/index.js
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const compression = require('compression');

// Database
const { checkConnection } = require('./db');

// Middleware
const { securityMiddleware, rateLimitMiddleware, circuitBreaker } = require('./middleware/security');
const { extractTenant } = require('./middleware/tenant');
const { tenantRateLimiter } = require('./middleware/rate-limit-tenant');
const { csrfTokenGenerator, doubleSubmitCookie } = require('./middleware/csrf');

// Routes
const authRoutes = require('./routes/auth.enhanced');
const productsRoutes = require('./routes/products.enhanced');
const ordersRoutes = require('./routes/orders.enhanced');
const cartRoutes = require('./routes/cart.enhanced');

// Services
const { initializeWorkers } = require('./workers');

const app = express();
const PORT = process.env.PORT || 8000;

// ==================== Global Middleware ====================

// Security Headers
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "https:", "blob:"],
            scriptSrc: ["'self'"],
        },
    },
    crossOriginResourcePolicy: { policy: "cross-origin" },
}));

// CORS Configuration
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, etc.)
        if (!origin) return callback(null, true);

        const allowedOrigins = [
            process.env.FRONTEND_URL,
            process.env.ADMIN_URL,
            'http://localhost:3000',
            'http://localhost:3001',
            'http://localhost:3002',
        ].filter(Boolean);

        // Allow subdomains for multi-tenancy
        const isAllowed = allowedOrigins.some(allowed =>
            origin === allowed || origin.endsWith('.coreflex.app')
        );

        if (isAllowed) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'X-Tenant-ID'],
}));

// Body Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookies
app.use(cookieParser());

// Compression
app.use(compression());

// Request ID for tracking
app.use((req, res, next) => {
    req.requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    res.setHeader('X-Request-ID', req.requestId);
    next();
});

// Request logging
app.use((req, res, next) => {
    const start = Date.now();

    res.on('finish', () => {
        const duration = Date.now() - start;
        const logLevel = res.statusCode >= 400 ? 'error' : 'info';

        console[logLevel]({
            requestId: req.requestId,
            method: req.method,
            url: req.originalUrl,
            status: res.statusCode,
            duration: `${duration}ms`,
            ip: req.ip,
            userAgent: req.get('user-agent')?.substring(0, 50),
        });
    });

    next();
});

// Security Middleware
app.use(rateLimitMiddleware);
app.use(circuitBreaker);

// CSRF Token Generator
app.use(csrfTokenGenerator);

// ==================== Health Check ====================

app.get('/health', async (req, res) => {
    const dbConnected = await checkConnection();

    res.status(dbConnected ? 200 : 503).json({
        status: dbConnected ? 'ok' : 'degraded',
        timestamp: new Date().toISOString(),
        database: dbConnected ? 'connected' : 'disconnected',
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
    });
});

// ==================== API Routes ====================

// API version prefix
const apiPrefix = '/api/v1';

// Auth Routes (no tenant required for some)
app.use(`${apiPrefix}/auth`, authRoutes);

// Tenant-scoped Routes
app.use(`${apiPrefix}/products`, extractTenant, productsRoutes);
app.use(`${apiPrefix}/orders`, extractTenant, ordersRoutes);
app.use(`${apiPrefix}/cart`, extractTenant, cartRoutes);

// CSRF Token Endpoint
app.get(`${apiPrefix}/csrf-token`, (req, res) => {
    const token = res.generateCsrfToken();
    res.json({ csrfToken: token });
});

// Categories
app.get(`${apiPrefix}/categories`, extractTenant, async (req, res) => {
    try {
        const { query } = require('./db');
        const result = await query(
            'SELECT * FROM categories WHERE tenant_id = $1 AND is_active = true ORDER BY sort_order, name',
            [req.tenant_id]
        );
        res.json({ success: true, categories: result.rows });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to get categories' });
    }
});

// Dashboard Stats (Admin)
app.get(`${apiPrefix}/dashboard/stats`, extractTenant, async (req, res) => {
    try {
        const { query } = require('./db');

        const [ordersResult, revenueResult, customersResult, productsResult] = await Promise.all([
            query('SELECT COUNT(*) FROM orders WHERE tenant_id = $1', [req.tenant_id]),
            query('SELECT COALESCE(SUM(total), 0) as revenue FROM orders WHERE tenant_id = $1 AND status != $2', [req.tenant_id, 'cancelled']),
            query('SELECT COUNT(*) FROM users WHERE tenant_id = $1 AND user_type = $2', [req.tenant_id, 'customer']),
            query('SELECT COUNT(*) FROM products WHERE tenant_id = $1 AND is_active = true', [req.tenant_id]),
        ]);

        res.json({
            success: true,
            data: {
                totalOrders: parseInt(ordersResult.rows[0].count),
                totalRevenue: parseFloat(revenueResult.rows[0].revenue),
                totalCustomers: parseInt(customersResult.rows[0].count),
                totalProducts: parseInt(productsResult.rows[0].count),
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to get stats' });
    }
});

// ==================== Error Handling ====================

// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Not Found',
        path: req.originalUrl,
    });
});

// Global Error Handler
app.use((error, req, res, next) => {
    console.error('Unhandled error:', {
        requestId: req.requestId,
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });

    // CORS Error
    if (error.message === 'Not allowed by CORS') {
        return res.status(403).json({
            success: false,
            error: 'CORS not allowed',
        });
    }

    res.status(error.status || 500).json({
        success: false,
        error: process.env.NODE_ENV === 'production'
            ? 'Internal Server Error'
            : error.message,
        requestId: req.requestId,
    });
});

// ==================== Server Start ====================

async function startServer() {
    try {
        // Check database connection
        const dbConnected = await checkConnection();
        if (!dbConnected) {
            console.error('❌ Cannot start server: Database connection failed');
            process.exit(1);
        }

        // Initialize background workers (optional)
        try {
            await initializeWorkers();
            console.log('✅ Background workers initialized');
        } catch (err) {
            console.warn('⚠️ Workers not initialized:', err.message);
        }

        // Start server
        app.listen(PORT, () => {
            console.log(`
╔════════════════════════════════════════════════╗
║                                                ║
║   🚀 CoreFlex API Server Started               ║
║                                                ║
║   Environment: ${(process.env.NODE_ENV || 'development').padEnd(26)}║
║   Port: ${String(PORT).padEnd(36)}║
║   Database: Connected ✓                        ║
║                                                ║
╚════════════════════════════════════════════════╝
      `);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

// Graceful Shutdown
process.on('SIGTERM', async () => {
    console.log('📴 Received SIGTERM, shutting down gracefully...');
    const { closePool } = require('./db');
    await closePool();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('📴 Received SIGINT, shutting down gracefully...');
    const { closePool } = require('./db');
    await closePool();
    process.exit(0);
});

// Start
startServer();

module.exports = app;

const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categories');
const orderRoutes = require('./routes/orders');
const cartRoutes = require('./routes/cart');
const adminRoutes = require('./routes/admin');
const superAdminRoutes = require('./routes/superadmin');

// Import middleware
const { tenantMiddleware } = require('./middleware/tenant');
const { generalLimiter, authLimiter, securityHeaders, inputSanitization } = require('./middleware/security');

// Import database
const { pool, query } = require('./db');

const app = express();
const PORT = process.env.PORT || 8000;

// ============ Global Security Middleware ============
app.use(cors());
app.use(express.json());
app.use(securityHeaders);
app.use(inputSanitization);
app.use('/api', generalLimiter);
app.use('/api/auth', authLimiter);

// ============ Health Check ============
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/health', async (req, res) => {
    try {
        // Test database connection
        const dbResult = await query('SELECT NOW()');
        res.json({
            status: 'ok',
            service: 'coreflex-api',
            version: '2.1.0-secure',
            database: 'connected',
            timestamp: dbResult.rows[0].now
        });
    } catch (error) {
        res.json({
            status: 'ok',
            service: 'coreflex-api',
            version: '2.1.0-secure',
            database: 'disconnected',
            error: error.message
        });
    }
});

// ============ API Routes ============
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/superadmin', superAdminRoutes);
app.use('/api/provision', require('./routes/provision'));
app.use('/api/pages', require('./routes/pages'));

// ============ Homepage Data (Combined) ============
app.get('/api/homepage', tenantMiddleware, async (req, res) => {
    try {
        const Product = require('./models/Product');
        const Category = require('./models/Category');

        const [categories, featured, flashDeals, newArrivals, bestSellers] = await Promise.all([
            Category.findAll(req.tenant_id),
            Product.findFeatured(req.tenant_id, 8),
            Product.findByBadge(req.tenant_id, 'sale', 4),
            Product.findByBadge(req.tenant_id, 'new', 4),
            Product.findByBadge(req.tenant_id, 'hot', 4)
        ]);

        res.json({
            success: true,
            data: {
                categories,
                featured_products: featured,
                flash_deals: flashDeals,
                flash_deals_ends_at: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(),
                new_arrivals: newArrivals,
                best_sellers: bestSellers,
                banners: [
                    { id: '1', title: 'عروض العيد الكبرى', subtitle: 'خصومات تصل حتى 50%', link: '/deals', bg_color: 'from-primary-500 to-primary-600' },
                    { id: '2', title: 'أحدث الإلكترونيات', subtitle: 'iPhone 15 Pro - متوفر الآن', link: '/category/electronics', bg_color: 'from-secondary-500 to-secondary-600' }
                ]
            }
        });
    } catch (error) {
        console.error('Homepage error:', error);
        res.status(500).json({ success: false, error: 'Failed to get homepage data' });
    }
});

// ============ Search ============
app.get('/api/search', tenantMiddleware, async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.json({ success: true, data: [] });

        const Product = require('./models/Product');
        const products = await Product.findAll({
            tenant_id: req.tenant_id,
            search: q,
            limit: 20
        });

        res.json({ success: true, data: products, query: q });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Search failed' });
    }
});

// ============ Store Config ============
app.get('/api/store/config', tenantMiddleware, async (req, res) => {
    try {
        const Tenant = require('./models/Tenant');
        const tenant = await Tenant.findById(req.tenant_id);

        if (!tenant) {
            return res.json({
                id: 'demo',
                name: 'المتجر',
                subdomain: 'demo',
                primary_color: '#DC2626',
                secondary_color: '#F59E0B',
                settings: { currency: 'SAR', language: 'ar' }
            });
        }

        res.json(tenant);
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to get config' });
    }
});

// ============ Error Handler ============
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
});

// ============ Start Server ============
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 CoreFlex API v2.0 running on port ${PORT}`);
    console.log(`📍 Health: http://localhost:${PORT}/health`);
    console.log(`🔐 Auth: /api/auth (login, register, profile)`);
    console.log(`📦 Products: /api/products`);
    console.log(`🛒 Cart: /api/cart`);
    console.log(`📋 Orders: /api/orders`);
    console.log(`🚚 Tracking: /api/tracking`);
});

// Routes
const trackingRoutes = require('./routes/tracking');
const newsletterRoutes = require('./routes/newsletter');
app.use('/api/tracking', trackingRoutes);
app.use('/api/newsletter', newsletterRoutes);

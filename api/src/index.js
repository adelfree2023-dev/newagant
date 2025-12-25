const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage (will be replaced with PostgreSQL)
const tenants = [];
const users = [];
const products = [];

// ============ Health Check ============
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'coreflex-api', version: '1.0.0' });
});

// ============ Provisioning APIs ============

// Check subdomain availability
app.get('/api/provision/check-subdomain', (req, res) => {
    const { subdomain } = req.query;

    if (!subdomain) {
        return res.status(400).json({ success: false, error: 'Subdomain required' });
    }

    const exists = tenants.find(t => t.subdomain === subdomain.toLowerCase());

    res.json({
        available: !exists,
        subdomain: subdomain.toLowerCase(),
        suggestion: exists ? `${subdomain}${Math.floor(Math.random() * 1000)}` : null
    });
});

// Create new store
app.post('/api/provision/store', (req, res) => {
    const { store_name, subdomain, business_type, owner, plan_slug } = req.body;

    // Validation
    if (!store_name || !subdomain || !owner?.email) {
        return res.status(400).json({
            success: false,
            error: 'Missing required fields'
        });
    }

    // Check if subdomain exists
    const exists = tenants.find(t => t.subdomain === subdomain.toLowerCase());
    if (exists) {
        return res.status(400).json({
            success: false,
            error: 'Subdomain already taken'
        });
    }

    // Create tenant
    const tenant = {
        id: uuidv4(),
        name: store_name,
        subdomain: subdomain.toLowerCase(),
        slug: subdomain.toLowerCase(),
        business_type: business_type || 'ecommerce',
        plan: plan_slug || 'free',
        status: 'active',
        primary_color: '#3B82F6',
        secondary_color: '#1E40AF',
        created_at: new Date().toISOString()
    };

    // Create owner user
    const user = {
        id: uuidv4(),
        tenant_id: tenant.id,
        email: owner.email,
        name: owner.name,
        phone: owner.phone,
        role: 'tenant_admin',
        created_at: new Date().toISOString()
    };

    tenants.push(tenant);
    users.push(user);

    // Success response
    const serverIP = process.env.SERVER_IP || 'localhost';

    res.status(201).json({
        success: true,
        tenant_id: tenant.id,
        store_url: `http://${serverIP}:3001?store=${tenant.subdomain}`,
        admin_url: `http://${serverIP}:3002?store=${tenant.subdomain}`,
        app_download: {
            android: `http://${serverIP}/download/android/${tenant.subdomain}`,
            ios: `http://${serverIP}/download/ios/${tenant.subdomain}`
        },
        credentials: {
            email: owner.email,
            password: '********'
        }
    });
});

// ============ Store Config ============

app.get('/api/store/config', (req, res) => {
    const { subdomain, id } = req.query;

    let tenant;
    if (subdomain) {
        tenant = tenants.find(t => t.subdomain === subdomain.toLowerCase());
    } else if (id) {
        tenant = tenants.find(t => t.id === id);
    }

    if (!tenant) {
        // Return demo store if no tenant found
        return res.json({
            id: 'demo',
            name: 'متجر تجريبي',
            subdomain: 'demo',
            logo_url: null,
            primary_color: '#3B82F6',
            secondary_color: '#1E40AF',
            settings: {
                currency: 'SAR',
                language: 'ar'
            }
        });
    }

    res.json(tenant);
});

// ============ Products ============

app.get('/api/products', (req, res) => {
    // Return demo products
    const demoProducts = [
        {
            id: '1',
            name: 'iPhone 15 Pro',
            name_ar: 'آيفون 15 برو',
            price: 4999,
            compare_price: 5499,
            images: ['https://picsum.photos/400/400?random=1'],
            category: 'electronics',
            stock: 50
        },
        {
            id: '2',
            name: 'Samsung Galaxy S24',
            name_ar: 'سامسونج جالكسي S24',
            price: 3999,
            images: ['https://picsum.photos/400/400?random=2'],
            category: 'electronics',
            stock: 30
        },
        {
            id: '3',
            name: 'MacBook Pro M3',
            name_ar: 'ماك بوك برو M3',
            price: 8999,
            compare_price: 9999,
            images: ['https://picsum.photos/400/400?random=3'],
            category: 'electronics',
            stock: 20
        },
        {
            id: '4',
            name: 'AirPods Pro',
            name_ar: 'ايربودز برو',
            price: 999,
            images: ['https://picsum.photos/400/400?random=4'],
            category: 'electronics',
            stock: 100
        }
    ];

    res.json({
        success: true,
        data: demoProducts,
        pagination: {
            page: 1,
            limit: 20,
            total: demoProducts.length
        }
    });
});

// ============ Categories ============

app.get('/api/categories', (req, res) => {
    const categories = [
        { id: '1', name: 'Electronics', name_ar: 'إلكترونيات', slug: 'electronics', icon: 'Smartphone' },
        { id: '2', name: 'Fashion', name_ar: 'أزياء', slug: 'fashion', icon: 'Shirt' },
        { id: '3', name: 'Home', name_ar: 'المنزل', slug: 'home', icon: 'Home' },
        { id: '4', name: 'Sports', name_ar: 'رياضة', slug: 'sports', icon: 'Dumbbell' }
    ];

    res.json({ success: true, data: categories });
});

// ============ Auth ============

app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;

    // Demo login
    if (email === 'admin@demo.com' && password === 'demo123') {
        return res.json({
            success: true,
            user: {
                id: 'demo-user',
                name: 'مدير المتجر',
                email: email,
                role: 'tenant_admin'
            },
            token: 'demo_jwt_token_' + Date.now()
        });
    }

    res.status(401).json({ success: false, error: 'Invalid credentials' });
});

// ============ Dashboard Stats ============

app.get('/api/admin/dashboard', (req, res) => {
    res.json({
        success: true,
        stats: {
            today_orders: 15,
            today_revenue: 5420,
            pending_orders: 8,
            total_products: 150,
            total_customers: 89
        },
        recent_orders: [
            { id: '1', order_number: 'ORD-001', total: 1500, status: 'pending' },
            { id: '2', order_number: 'ORD-002', total: 2300, status: 'processing' },
            { id: '3', order_number: 'ORD-003', total: 890, status: 'delivered' }
        ]
    });
});

// ============ Start Server ============

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 CoreFlex API running on port ${PORT}`);
    console.log(`📍 Health: http://localhost:${PORT}/health`);
});

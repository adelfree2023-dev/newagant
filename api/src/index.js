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

// ============ SEED DATA - منتجات حقيقية ============

const products = [
    // Electronics - إلكترونيات
    {
        id: '1',
        name: 'iPhone 15 Pro Max',
        name_ar: 'آيفون 15 برو ماكس',
        slug: 'iphone-15-pro-max',
        price: 4999,
        compare_price: 5999,
        cost_price: 4000,
        description: 'The most advanced iPhone ever with A17 Pro chip, Titanium design',
        description_ar: 'أقوى آيفون على الإطلاق مع معالج A17 Pro وتصميم تيتانيوم',
        images: [
            'https://images.unsplash.com/photo-1696446701796-da61225697cc?w=400&h=400&fit=crop',
            'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&h=400&fit=crop'
        ],
        category_id: '1',
        category: 'إلكترونيات',
        badge: 'sale',
        stock: 50,
        rating: 4.9,
        reviews_count: 2540,
        is_featured: true,
        created_at: '2024-01-15'
    },
    {
        id: '2',
        name: 'Samsung Galaxy S24 Ultra',
        name_ar: 'سامسونج جالكسي S24 الترا',
        slug: 'samsung-galaxy-s24-ultra',
        price: 4499,
        compare_price: 4999,
        cost_price: 3600,
        description: 'Galaxy AI is here with S Pen, 200MP camera',
        description_ar: 'ذكاء جالكسي الاصطناعي مع قلم S Pen وكاميرا 200 ميجابيكسل',
        images: [
            'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400&h=400&fit=crop'
        ],
        category_id: '1',
        category: 'إلكترونيات',
        badge: 'new',
        stock: 35,
        rating: 4.8,
        reviews_count: 1890,
        is_featured: true,
        created_at: '2024-02-01'
    },
    {
        id: '3',
        name: 'MacBook Pro M3 Max',
        name_ar: 'ماك بوك برو M3 ماكس',
        slug: 'macbook-pro-m3-max',
        price: 12999,
        compare_price: 14999,
        cost_price: 10000,
        description: '16-inch Liquid Retina XDR display, M3 Max chip',
        description_ar: 'شاشة 16 بوصة Liquid Retina XDR ومعالج M3 Max',
        images: [
            'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop'
        ],
        category_id: '1',
        category: 'إلكترونيات',
        badge: 'hot',
        stock: 15,
        rating: 4.9,
        reviews_count: 890,
        is_featured: true,
        created_at: '2024-01-20'
    },
    {
        id: '4',
        name: 'AirPods Pro 2',
        name_ar: 'ايربودز برو 2',
        slug: 'airpods-pro-2',
        price: 999,
        compare_price: 1199,
        cost_price: 700,
        description: 'Active Noise Cancellation, Spatial Audio, USB-C',
        description_ar: 'عزل صوت نشط، صوت مكاني، USB-C',
        images: [
            'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=400&h=400&fit=crop'
        ],
        category_id: '1',
        category: 'إلكترونيات',
        badge: 'sale',
        stock: 200,
        rating: 4.7,
        reviews_count: 5420,
        is_featured: false,
        created_at: '2024-01-10'
    },
    {
        id: '5',
        name: 'Apple Watch Ultra 2',
        name_ar: 'ساعة أبل الترا 2',
        slug: 'apple-watch-ultra-2',
        price: 3499,
        compare_price: 3999,
        cost_price: 2800,
        description: 'The most rugged and capable Apple Watch',
        description_ar: 'أقوى وأمتن ساعة أبل',
        images: [
            'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=400&h=400&fit=crop'
        ],
        category_id: '1',
        category: 'إلكترونيات',
        badge: 'new',
        stock: 40,
        rating: 4.8,
        reviews_count: 1250,
        is_featured: true,
        created_at: '2024-02-05'
    },
    {
        id: '6',
        name: 'Sony PlayStation 5',
        name_ar: 'بلايستيشن 5',
        slug: 'playstation-5',
        price: 2199,
        compare_price: 2499,
        cost_price: 1800,
        description: 'Experience lightning-fast loading, haptic feedback',
        description_ar: 'تجربة تحميل فائقة السرعة وردود فعل لمسية',
        images: [
            'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=400&h=400&fit=crop'
        ],
        category_id: '7',
        category: 'ألعاب',
        badge: 'hot',
        stock: 25,
        rating: 4.9,
        reviews_count: 8900,
        is_featured: true,
        created_at: '2023-12-01'
    },
    {
        id: '7',
        name: 'Samsung 65" OLED TV',
        name_ar: 'تلفزيون سامسونج 65 بوصة OLED',
        slug: 'samsung-65-oled-tv',
        price: 7999,
        compare_price: 9999,
        cost_price: 6000,
        description: '4K OLED Smart TV with AI Upscaling',
        description_ar: 'تلفزيون ذكي 4K OLED مع تحسين بالذكاء الاصطناعي',
        images: [
            'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=400&h=400&fit=crop'
        ],
        category_id: '1',
        category: 'إلكترونيات',
        badge: 'sale',
        stock: 10,
        rating: 4.6,
        reviews_count: 430,
        is_featured: false,
        created_at: '2024-01-25'
    },
    {
        id: '8',
        name: 'Sony WH-1000XM5',
        name_ar: 'سماعات سوني WH-1000XM5',
        slug: 'sony-wh-1000xm5',
        price: 1499,
        compare_price: 1799,
        cost_price: 1100,
        description: 'Industry-leading noise canceling headphones',
        description_ar: 'أفضل سماعات عزل صوت في العالم',
        images: [
            'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop'
        ],
        category_id: '1',
        category: 'إلكترونيات',
        badge: 'hot',
        stock: 60,
        rating: 4.8,
        reviews_count: 2100,
        is_featured: true,
        created_at: '2024-01-18'
    },
    // Fashion - أزياء
    {
        id: '9',
        name: 'Nike Air Max 90',
        name_ar: 'نايك اير ماكس 90',
        slug: 'nike-air-max-90',
        price: 599,
        compare_price: 799,
        cost_price: 400,
        description: 'Iconic style with visible Air cushioning',
        description_ar: 'تصميم أيقوني مع تقنية Air المرئية',
        images: [
            'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop'
        ],
        category_id: '2',
        category: 'أزياء',
        badge: 'sale',
        stock: 80,
        rating: 4.5,
        reviews_count: 3400,
        is_featured: true,
        created_at: '2024-02-10'
    },
    {
        id: '10',
        name: 'Adidas Ultraboost 22',
        name_ar: 'أديداس الترابوست 22',
        slug: 'adidas-ultraboost-22',
        price: 699,
        compare_price: 899,
        cost_price: 500,
        description: 'Responsive Boost cushioning for endless energy',
        description_ar: 'تقنية Boost للراحة القصوى',
        images: [
            'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400&h=400&fit=crop'
        ],
        category_id: '2',
        category: 'أزياء',
        badge: 'new',
        stock: 55,
        rating: 4.6,
        reviews_count: 1800,
        is_featured: false,
        created_at: '2024-02-12'
    },
    {
        id: '11',
        name: 'Ray-Ban Aviator',
        name_ar: 'نظارات راي بان أفييتور',
        slug: 'ray-ban-aviator',
        price: 749,
        compare_price: 899,
        cost_price: 500,
        description: 'Original Aviator Classic sunglasses',
        description_ar: 'نظارات أفييتور الكلاسيكية الأصلية',
        images: [
            'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=400&fit=crop'
        ],
        category_id: '2',
        category: 'أزياء',
        stock: 100,
        rating: 4.7,
        reviews_count: 2200,
        is_featured: false,
        created_at: '2024-01-28'
    },
    {
        id: '12',
        name: 'Rolex Submariner',
        name_ar: 'ساعة رولكس سبمارينر',
        slug: 'rolex-submariner',
        price: 45999,
        cost_price: 35000,
        description: 'The reference among divers watches',
        description_ar: 'المرجع في ساعات الغوص',
        images: [
            'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop'
        ],
        category_id: '2',
        category: 'أزياء',
        badge: 'hot',
        stock: 3,
        rating: 5.0,
        reviews_count: 150,
        is_featured: true,
        created_at: '2024-01-05'
    },
    // Home - المنزل
    {
        id: '13',
        name: 'Dyson V15 Detect',
        name_ar: 'مكنسة دايسون V15',
        slug: 'dyson-v15-detect',
        price: 2799,
        compare_price: 3299,
        cost_price: 2200,
        description: 'Most powerful cordless vacuum with laser',
        description_ar: 'أقوى مكنسة لاسلكية مع ليزر',
        images: [
            'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop'
        ],
        category_id: '4',
        category: 'المنزل',
        badge: 'sale',
        stock: 20,
        rating: 4.9,
        reviews_count: 890,
        is_featured: true,
        created_at: '2024-02-01'
    },
    {
        id: '14',
        name: 'Nespresso Vertuo',
        name_ar: 'ماكينة نسبرسو فيرتو',
        slug: 'nespresso-vertuo',
        price: 899,
        compare_price: 1199,
        cost_price: 600,
        description: 'Barista-style coffee at home',
        description_ar: 'قهوة بجودة المقاهي في منزلك',
        images: [
            'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=400&fit=crop'
        ],
        category_id: '4',
        category: 'المنزل',
        badge: 'new',
        stock: 45,
        rating: 4.6,
        reviews_count: 1200,
        is_featured: false,
        created_at: '2024-02-08'
    },
    // Beauty - الجمال
    {
        id: '15',
        name: 'La Mer Moisturizing Cream',
        name_ar: 'كريم لامير المرطب',
        slug: 'la-mer-moisturizing-cream',
        price: 1599,
        cost_price: 1000,
        description: 'The legendary moisturizer that heals',
        description_ar: 'المرطب الأسطوري',
        images: [
            'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400&h=400&fit=crop'
        ],
        category_id: '5',
        category: 'الجمال',
        badge: 'hot',
        stock: 30,
        rating: 4.8,
        reviews_count: 650,
        is_featured: true,
        created_at: '2024-01-22'
    },
    {
        id: '16',
        name: 'Chanel No. 5 Perfume',
        name_ar: 'عطر شانيل رقم 5',
        slug: 'chanel-no-5-perfume',
        price: 599,
        compare_price: 699,
        cost_price: 400,
        description: 'The timeless fragrance',
        description_ar: 'العطر الخالد',
        images: [
            'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=400&fit=crop'
        ],
        category_id: '5',
        category: 'الجمال',
        badge: 'sale',
        stock: 75,
        rating: 4.9,
        reviews_count: 3200,
        is_featured: false,
        created_at: '2024-01-30'
    }
];

const categories = [
    { id: '1', name: 'Electronics', name_ar: 'إلكترونيات', slug: 'electronics', icon: '📱', color: 'bg-blue-50', products_count: 8 },
    { id: '2', name: 'Fashion', name_ar: 'أزياء', slug: 'fashion', icon: '👔', color: 'bg-gray-50', products_count: 4 },
    { id: '3', name: 'Women Fashion', name_ar: 'أزياء نسائي', slug: 'women-fashion', icon: '👗', color: 'bg-pink-50', products_count: 0 },
    { id: '4', name: 'Home & Kitchen', name_ar: 'المنزل والمطبخ', slug: 'home-kitchen', icon: '🏠', color: 'bg-yellow-50', products_count: 2 },
    { id: '5', name: 'Beauty', name_ar: 'الجمال والعناية', slug: 'beauty', icon: '💄', color: 'bg-purple-50', products_count: 2 },
    { id: '6', name: 'Sports', name_ar: 'الرياضة', slug: 'sports', icon: '⚽', color: 'bg-green-50', products_count: 0 },
    { id: '7', name: 'Gaming', name_ar: 'الألعاب', slug: 'gaming', icon: '🎮', color: 'bg-red-50', products_count: 1 },
    { id: '8', name: 'Kids', name_ar: 'الأطفال', slug: 'kids', icon: '👶', color: 'bg-orange-50', products_count: 0 }
];

const banners = [
    {
        id: '1',
        title: 'عروض العيد الكبرى',
        subtitle: 'خصومات تصل حتى 50% على جميع المنتجات',
        image: 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=1200&h=400&fit=crop',
        link: '/deals',
        bg_color: 'from-primary-500 to-primary-600',
        button_text: 'تسوق الآن'
    },
    {
        id: '2',
        title: 'أحدث الإلكترونيات',
        subtitle: 'iPhone 15 Pro - متوفر الآن',
        image: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=1200&h=400&fit=crop',
        link: '/category/electronics',
        bg_color: 'from-secondary-500 to-secondary-600',
        button_text: 'اكتشف المزيد'
    },
    {
        id: '3',
        title: 'شحن مجاني',
        subtitle: 'على جميع الطلبات فوق 200 ر.س',
        image: 'https://images.unsplash.com/photo-1586880244406-556ebe35f282?w=1200&h=400&fit=crop',
        link: '/shop',
        bg_color: 'from-green-500 to-green-600',
        button_text: 'ابدأ التسوق'
    }
];

// ============ Health Check ============
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'coreflex-api',
        version: '1.0.0',
        products_count: products.length,
        categories_count: categories.length
    });
});

// ============ Provisioning APIs ============

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

app.post('/api/provision/store', (req, res) => {
    const { store_name, subdomain, business_type, owner, plan_slug } = req.body;

    if (!store_name || !subdomain || !owner?.email) {
        return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const exists = tenants.find(t => t.subdomain === subdomain.toLowerCase());
    if (exists) {
        return res.status(400).json({ success: false, error: 'Subdomain already taken' });
    }

    const tenant = {
        id: uuidv4(),
        name: store_name,
        subdomain: subdomain.toLowerCase(),
        slug: subdomain.toLowerCase(),
        business_type: business_type || 'ecommerce',
        plan: plan_slug || 'free',
        status: 'active',
        primary_color: '#DC2626',
        secondary_color: '#F59E0B',
        created_at: new Date().toISOString()
    };

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

    const serverIP = process.env.SERVER_IP || '35.226.47.16';

    res.status(201).json({
        success: true,
        tenant_id: tenant.id,
        store_url: `http://${serverIP}:3001`,
        admin_url: `http://${serverIP}:3002`,
        app_download: {
            android: `http://${serverIP}/download/android/${tenant.subdomain}`,
            ios: `http://${serverIP}/download/ios/${tenant.subdomain}`
        },
        credentials: { email: owner.email, password: '********' }
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
        return res.json({
            id: 'demo',
            name: 'المتجر',
            name_ar: 'المتجر',
            subdomain: 'demo',
            logo_url: null,
            primary_color: '#DC2626',
            secondary_color: '#F59E0B',
            settings: { currency: 'SAR', language: 'ar' }
        });
    }

    res.json(tenant);
});

// ============ Products ============

app.get('/api/products', (req, res) => {
    const { category, featured, limit, badge, search } = req.query;

    let filtered = [...products];

    if (category) {
        filtered = filtered.filter(p => p.category_id === category || p.category === category);
    }

    if (featured === 'true') {
        filtered = filtered.filter(p => p.is_featured);
    }

    if (badge) {
        filtered = filtered.filter(p => p.badge === badge);
    }

    if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter(p =>
            p.name.toLowerCase().includes(q) ||
            p.name_ar.includes(q) ||
            p.description?.toLowerCase().includes(q)
        );
    }

    if (limit) {
        filtered = filtered.slice(0, parseInt(limit));
    }

    res.json({
        success: true,
        data: filtered,
        pagination: {
            page: 1,
            limit: limit ? parseInt(limit) : 20,
            total: filtered.length
        }
    });
});

app.get('/api/products/featured', (req, res) => {
    const featured = products.filter(p => p.is_featured).slice(0, 8);
    res.json({ success: true, data: featured });
});

app.get('/api/products/flash-deals', (req, res) => {
    const deals = products.filter(p => p.badge === 'sale' && p.compare_price).slice(0, 4);
    res.json({
        success: true,
        data: deals,
        ends_at: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString() // 5 hours from now
    });
});

app.get('/api/products/new-arrivals', (req, res) => {
    const newProducts = products.filter(p => p.badge === 'new').slice(0, 4);
    res.json({ success: true, data: newProducts });
});

app.get('/api/products/best-sellers', (req, res) => {
    const bestSellers = products.filter(p => p.badge === 'hot').slice(0, 4);
    res.json({ success: true, data: bestSellers });
});

app.get('/api/products/:id', (req, res) => {
    const product = products.find(p => p.id === req.params.id || p.slug === req.params.id);

    if (!product) {
        return res.status(404).json({ success: false, error: 'Product not found' });
    }

    res.json({ success: true, data: product });
});

// ============ Categories ============

app.get('/api/categories', (req, res) => {
    res.json({ success: true, data: categories });
});

app.get('/api/categories/:slug', (req, res) => {
    const category = categories.find(c => c.slug === req.params.slug || c.id === req.params.slug);

    if (!category) {
        return res.status(404).json({ success: false, error: 'Category not found' });
    }

    const categoryProducts = products.filter(p => p.category_id === category.id);

    res.json({
        success: true,
        data: { ...category, products: categoryProducts }
    });
});

// ============ Banners ============

app.get('/api/banners', (req, res) => {
    res.json({ success: true, data: banners });
});

// ============ Homepage Data ============

app.get('/api/homepage', (req, res) => {
    res.json({
        success: true,
        data: {
            banners: banners,
            categories: categories,
            flash_deals: products.filter(p => p.badge === 'sale' && p.compare_price).slice(0, 4),
            flash_deals_ends_at: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(),
            new_arrivals: products.filter(p => p.badge === 'new').slice(0, 4),
            best_sellers: products.filter(p => p.badge === 'hot').slice(0, 4),
            featured_products: products.filter(p => p.is_featured).slice(0, 8)
        }
    });
});

// ============ Auth ============

app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;

    if (email === 'admin@demo.com' && password === 'demo123') {
        return res.json({
            success: true,
            user: { id: 'demo-user', name: 'مدير المتجر', email: email, role: 'tenant_admin' },
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
            total_products: products.length,
            total_customers: 89
        },
        recent_orders: [
            { id: '1', order_number: 'ORD-001', total: 1500, status: 'pending' },
            { id: '2', order_number: 'ORD-002', total: 2300, status: 'processing' },
            { id: '3', order_number: 'ORD-003', total: 890, status: 'delivered' }
        ]
    });
});

// ============ Search ============

app.get('/api/search', (req, res) => {
    const { q } = req.query;

    if (!q) {
        return res.json({ success: true, data: [] });
    }

    const query = q.toLowerCase();
    const results = products.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.name_ar.includes(query) ||
        p.description?.toLowerCase().includes(query) ||
        p.description_ar?.includes(query)
    );

    res.json({ success: true, data: results, query: q });
});

// ============ Start Server ============

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 CoreFlex API running on port ${PORT}`);
    console.log(`📍 Health: http://localhost:${PORT}/health`);
    console.log(`📦 Products: ${products.length}`);
    console.log(`📂 Categories: ${categories.length}`);
});

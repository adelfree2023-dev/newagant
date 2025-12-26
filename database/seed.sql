-- CoreFlex Database Seed
-- ملء قاعدة البيانات ببيانات تجريبية (50 سجل لكل جدول)

-- ===================== TENANTS (50) =====================
INSERT INTO tenants (id, name, domain, logo, settings, status, created_at) VALUES
(1, 'متجر الإلكترونيات', 'electronics.coreflex.app', '/logos/electronics.png', '{"currency":"SAR","language":"ar"}', 'active', NOW()),
(2, 'متجر الأزياء', 'fashion.coreflex.app', '/logos/fashion.png', '{"currency":"SAR","language":"ar"}', 'active', NOW()),
(3, 'متجر الرياضة', 'sports.coreflex.app', '/logos/sports.png', '{"currency":"SAR","language":"ar"}', 'active', NOW()),
(4, 'متجر المنزل', 'home.coreflex.app', '/logos/home.png', '{"currency":"SAR","language":"ar"}', 'active', NOW()),
(5, 'متجر الجمال', 'beauty.coreflex.app', '/logos/beauty.png', '{"currency":"SAR","language":"ar"}', 'active', NOW());

-- Generate more tenants (6-50)
INSERT INTO tenants (name, domain, logo, settings, status, created_at)
SELECT 
    'متجر رقم ' || generate_series,
    'store' || generate_series || '.coreflex.app',
    '/logos/default.png',
    '{"currency":"SAR","language":"ar"}',
    'active',
    NOW()
FROM generate_series(6, 50);

-- ===================== USERS (50) =====================
INSERT INTO users (id, tenant_id, email, password_hash, name, phone, role, status, created_at) VALUES
(1, 1, 'admin@coreflex.app', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4o0C6rOeNsLNbqFa', 'عادل المدير', '+966500000001', 'owner', 'active', NOW()),
(2, 1, 'manager@coreflex.app', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4o0C6rOeNsLNbqFa', 'محمد المدير', '+966500000002', 'manager', 'active', NOW()),
(3, 1, 'user@coreflex.app', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4o0C6rOeNsLNbqFa', 'أحمد العميل', '+966500000003', 'customer', 'active', NOW());

-- Generate more users (4-50)
INSERT INTO users (tenant_id, email, password_hash, name, phone, role, status, created_at)
SELECT 
    (generate_series % 5) + 1,
    'user' || generate_series || '@test.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4o0C6rOeNsLNbqFa',
    'مستخدم رقم ' || generate_series,
    '+9665' || LPAD(generate_series::text, 8, '0'),
    'customer',
    'active',
    NOW()
FROM generate_series(4, 50);

-- ===================== CATEGORIES (50) =====================
INSERT INTO categories (id, tenant_id, name, slug, description, image, parent_id, sort_order, status, created_at) VALUES
(1, 1, 'الإلكترونيات', 'electronics', 'جميع الأجهزة الإلكترونية', '/categories/electronics.jpg', NULL, 1, 'active', NOW()),
(2, 1, 'الهواتف', 'phones', 'الهواتف الذكية', '/categories/phones.jpg', 1, 1, 'active', NOW()),
(3, 1, 'اللابتوب', 'laptops', 'أجهزة اللابتوب', '/categories/laptops.jpg', 1, 2, 'active', NOW()),
(4, 1, 'الأزياء', 'fashion', 'ملابس وأزياء', '/categories/fashion.jpg', NULL, 2, 'active', NOW()),
(5, 1, 'الرجال', 'men', 'ملابس رجالية', '/categories/men.jpg', 4, 1, 'active', NOW()),
(6, 1, 'النساء', 'women', 'ملابس نسائية', '/categories/women.jpg', 4, 2, 'active', NOW()),
(7, 1, 'المنزل', 'home', 'مستلزمات المنزل', '/categories/home.jpg', NULL, 3, 'active', NOW()),
(8, 1, 'الأثاث', 'furniture', 'أثاث منزلي', '/categories/furniture.jpg', 7, 1, 'active', NOW()),
(9, 1, 'الديكور', 'decor', 'ديكورات', '/categories/decor.jpg', 7, 2, 'active', NOW()),
(10, 1, 'الرياضة', 'sports', 'مستلزمات رياضية', '/categories/sports.jpg', NULL, 4, 'active', NOW());

-- Generate more categories (11-50)
INSERT INTO categories (tenant_id, name, slug, description, image, parent_id, sort_order, status, created_at)
SELECT 
    (generate_series % 5) + 1,
    'فئة رقم ' || generate_series,
    'category-' || generate_series,
    'وصف الفئة رقم ' || generate_series,
    '/categories/default.jpg',
    NULL,
    generate_series,
    'active',
    NOW()
FROM generate_series(11, 50);

-- ===================== PRODUCTS (50) =====================
INSERT INTO products (id, tenant_id, category_id, name, slug, description, price, compare_price, sku, stock, images, status, featured, created_at) VALUES
(1, 1, 2, 'آيفون 15 برو ماكس', 'iphone-15-pro-max', 'أحدث هاتف من أبل', 5499.00, 5999.00, 'IPHONE15PM', 100, '["iphone15.jpg"]', 'active', true, NOW()),
(2, 1, 2, 'سامسونج جالكسي S24', 'samsung-galaxy-s24', 'هاتف سامسونج الرائد', 4299.00, 4599.00, 'SAMS24', 150, '["s24.jpg"]', 'active', true, NOW()),
(3, 1, 3, 'ماك بوك برو M3', 'macbook-pro-m3', 'لابتوب أبل الأقوى', 8999.00, 9499.00, 'MACM3', 50, '["macbook.jpg"]', 'active', true, NOW()),
(4, 1, 3, 'ديل XPS 15', 'dell-xps-15', 'لابتوب ديل المميز', 6499.00, 6999.00, 'DELLXPS15', 75, '["dell.jpg"]', 'active', false, NOW()),
(5, 1, 5, 'قميص رجالي أنيق', 'mens-shirt', 'قميص قطني عالي الجودة', 199.00, 249.00, 'SHIRT001', 200, '["shirt.jpg"]', 'active', false, NOW()),
(6, 1, 5, 'بنطلون جينز رجالي', 'mens-jeans', 'جينز مريح وعصري', 299.00, 349.00, 'JEANS001', 180, '["jeans.jpg"]', 'active', false, NOW()),
(7, 1, 6, 'فستان نسائي أنيق', 'womens-dress', 'فستان سهرة راقي', 599.00, 699.00, 'DRESS001', 100, '["dress.jpg"]', 'active', true, NOW()),
(8, 1, 8, 'كنبة جلدية', 'leather-sofa', 'كنبة جلدية فاخرة', 3999.00, 4499.00, 'SOFA001', 20, '["sofa.jpg"]', 'active', true, NOW()),
(9, 1, 9, 'لوحة ديكور', 'wall-art', 'لوحة فنية للحائط', 299.00, 349.00, 'ART001', 50, '["art.jpg"]', 'active', false, NOW()),
(10, 1, 10, 'دراجة رياضية', 'sports-bike', 'دراجة هوائية احترافية', 1999.00, 2299.00, 'BIKE001', 30, '["bike.jpg"]', 'active', false, NOW());

-- Generate more products (11-50)
INSERT INTO products (tenant_id, category_id, name, slug, description, price, compare_price, sku, stock, images, status, featured, created_at)
SELECT 
    (generate_series % 5) + 1,
    (generate_series % 10) + 1,
    'منتج رقم ' || generate_series,
    'product-' || generate_series,
    'وصف المنتج رقم ' || generate_series || ' - منتج عالي الجودة',
    (generate_series * 50)::numeric,
    (generate_series * 60)::numeric,
    'SKU' || LPAD(generate_series::text, 5, '0'),
    generate_series * 10,
    '["product.jpg"]',
    'active',
    generate_series % 5 = 0,
    NOW()
FROM generate_series(11, 50);

-- ===================== ORDERS (50) =====================
INSERT INTO orders (id, tenant_id, user_id, order_number, status, payment_status, subtotal, shipping, discount, total, shipping_address, created_at) VALUES
(1, 1, 3, 'ORD-001', 'delivered', 'paid', 5499.00, 0, 0, 5499.00, '{"city":"الرياض","street":"شارع الملك فهد","phone":"+966500000001"}', NOW() - INTERVAL '30 days'),
(2, 1, 3, 'ORD-002', 'shipped', 'paid', 4299.00, 25.00, 100.00, 4224.00, '{"city":"جدة","street":"شارع التحلية","phone":"+966500000002"}', NOW() - INTERVAL '25 days'),
(3, 1, 3, 'ORD-003', 'processing', 'paid', 8999.00, 0, 500.00, 8499.00, '{"city":"الدمام","street":"شارع الخليج","phone":"+966500000003"}', NOW() - INTERVAL '20 days'),
(4, 1, 3, 'ORD-004', 'pending', 'pending', 199.00, 25.00, 0, 224.00, '{"city":"مكة","street":"شارع العزيزية","phone":"+966500000004"}', NOW() - INTERVAL '15 days'),
(5, 1, 3, 'ORD-005', 'confirmed', 'paid', 3999.00, 100.00, 200.00, 3899.00, '{"city":"المدينة","street":"شارع قباء","phone":"+966500000005"}', NOW() - INTERVAL '10 days');

-- Generate more orders (6-50)
INSERT INTO orders (tenant_id, user_id, order_number, status, payment_status, subtotal, shipping, discount, total, shipping_address, created_at)
SELECT 
    (generate_series % 5) + 1,
    (generate_series % 47) + 3,
    'ORD-' || LPAD(generate_series::text, 3, '0'),
    CASE generate_series % 5 
        WHEN 0 THEN 'pending'
        WHEN 1 THEN 'confirmed'
        WHEN 2 THEN 'processing'
        WHEN 3 THEN 'shipped'
        ELSE 'delivered'
    END,
    CASE generate_series % 3
        WHEN 0 THEN 'pending'
        WHEN 1 THEN 'paid'
        ELSE 'paid'
    END,
    (generate_series * 100)::numeric,
    CASE WHEN generate_series * 100 > 200 THEN 0 ELSE 25 END,
    (generate_series * 5)::numeric,
    ((generate_series * 100) + CASE WHEN generate_series * 100 > 200 THEN 0 ELSE 25 END - (generate_series * 5))::numeric,
    '{"city":"الرياض","street":"شارع رقم ' || generate_series || '","phone":"+9665000000' || generate_series || '"}',
    NOW() - (generate_series || ' days')::interval
FROM generate_series(6, 50);

-- ===================== ORDER_ITEMS (50) =====================
INSERT INTO order_items (order_id, product_id, quantity, price, total)
SELECT 
    (generate_series % 50) + 1,
    (generate_series % 50) + 1,
    (generate_series % 5) + 1,
    (generate_series * 50)::numeric,
    ((generate_series % 5) + 1) * (generate_series * 50)::numeric
FROM generate_series(1, 50);

-- ===================== COUPONS (50) =====================
INSERT INTO coupons (id, tenant_id, code, type, value, min_order, max_discount, usage_limit, used_count, starts_at, expires_at, status, created_at) VALUES
(1, 1, 'WELCOME10', 'percentage', 10, 100, 100, 1000, 50, NOW() - INTERVAL '30 days', NOW() + INTERVAL '60 days', 'active', NOW()),
(2, 1, 'SAVE50', 'fixed', 50, 200, 50, 500, 100, NOW() - INTERVAL '20 days', NOW() + INTERVAL '40 days', 'active', NOW()),
(3, 1, 'VIP20', 'percentage', 20, 500, 200, 100, 20, NOW() - INTERVAL '10 days', NOW() + INTERVAL '30 days', 'active', NOW()),
(4, 1, 'FREESHIP', 'fixed', 25, 0, 25, 2000, 500, NOW() - INTERVAL '5 days', NOW() + INTERVAL '25 days', 'active', NOW()),
(5, 1, 'SUMMER15', 'percentage', 15, 150, 150, 300, 75, NOW(), NOW() + INTERVAL '90 days', 'active', NOW());

-- Generate more coupons (6-50)
INSERT INTO coupons (tenant_id, code, type, value, min_order, max_discount, usage_limit, used_count, starts_at, expires_at, status, created_at)
SELECT 
    (generate_series % 5) + 1,
    'CODE' || LPAD(generate_series::text, 3, '0'),
    CASE generate_series % 2 WHEN 0 THEN 'percentage' ELSE 'fixed' END,
    (generate_series % 30) + 5,
    generate_series * 10,
    generate_series * 5,
    generate_series * 100,
    generate_series * 10,
    NOW() - (generate_series || ' days')::interval,
    NOW() + ((generate_series + 30) || ' days')::interval,
    'active',
    NOW()
FROM generate_series(6, 50);

-- ===================== REVIEWS (50) =====================
INSERT INTO reviews (tenant_id, product_id, user_id, rating, title, comment, status, created_at)
SELECT 
    (generate_series % 5) + 1,
    (generate_series % 50) + 1,
    (generate_series % 47) + 3,
    (generate_series % 5) + 1,
    'تقييم رقم ' || generate_series,
    'هذا المنتج رائع جداً! أنصح بشرائه. تجربة ممتازة.',
    'approved',
    NOW() - (generate_series || ' days')::interval
FROM generate_series(1, 50);

-- ===================== WISHLIST (50) =====================
INSERT INTO wishlist (tenant_id, user_id, product_id, created_at)
SELECT 
    (generate_series % 5) + 1,
    (generate_series % 47) + 3,
    (generate_series % 50) + 1,
    NOW() - (generate_series || ' days')::interval
FROM generate_series(1, 50)
ON CONFLICT DO NOTHING;

-- ===================== CART_ITEMS (50) =====================
INSERT INTO cart_items (tenant_id, user_id, product_id, quantity, created_at)
SELECT 
    (generate_series % 5) + 1,
    (generate_series % 47) + 3,
    (generate_series % 50) + 1,
    (generate_series % 5) + 1,
    NOW()
FROM generate_series(1, 50)
ON CONFLICT DO NOTHING;

-- ===================== ADDRESSES (50) =====================
INSERT INTO addresses (tenant_id, user_id, name, phone, city, district, street, building, is_default, created_at)
SELECT 
    (generate_series % 5) + 1,
    (generate_series % 47) + 3,
    'عنوان رقم ' || generate_series,
    '+9665' || LPAD(generate_series::text, 8, '0'),
    CASE generate_series % 5
        WHEN 0 THEN 'الرياض'
        WHEN 1 THEN 'جدة'
        WHEN 2 THEN 'الدمام'
        WHEN 3 THEN 'مكة'
        ELSE 'المدينة'
    END,
    'حي رقم ' || generate_series,
    'شارع رقم ' || generate_series,
    'مبنى ' || generate_series,
    generate_series = 1,
    NOW()
FROM generate_series(1, 50);

-- ===================== NOTIFICATIONS (50) =====================
INSERT INTO notifications (tenant_id, user_id, type, title, message, is_read, created_at)
SELECT 
    (generate_series % 5) + 1,
    (generate_series % 47) + 3,
    CASE generate_series % 4
        WHEN 0 THEN 'order'
        WHEN 1 THEN 'promotion'
        WHEN 2 THEN 'system'
        ELSE 'reminder'
    END,
    'إشعار رقم ' || generate_series,
    'محتوى الإشعار رقم ' || generate_series || ' - لديك تحديث جديد',
    generate_series % 2 = 0,
    NOW() - (generate_series || ' hours')::interval
FROM generate_series(1, 50);

-- ===================== AUDIT_LOGS (50) =====================
INSERT INTO audit_logs (tenant_id, user_id, action, entity_type, entity_id, old_values, new_values, ip_address, created_at)
SELECT 
    (generate_series % 5) + 1,
    (generate_series % 50) + 1,
    CASE generate_series % 4
        WHEN 0 THEN 'create'
        WHEN 1 THEN 'update'
        WHEN 2 THEN 'delete'
        ELSE 'login'
    END,
    CASE generate_series % 3
        WHEN 0 THEN 'product'
        WHEN 1 THEN 'order'
        ELSE 'user'
    END,
    generate_series,
    '{}',
    '{}',
    '192.168.1.' || (generate_series % 255),
    NOW() - (generate_series || ' hours')::interval
FROM generate_series(1, 50);

-- ===================== SHIPPING_ZONES (50) =====================
INSERT INTO shipping_zones (tenant_id, name, cities, base_cost, free_threshold, delivery_days, status, created_at)
SELECT 
    (generate_series % 5) + 1,
    'منطقة شحن ' || generate_series,
    ARRAY['مدينة' || generate_series, 'مدينة' || (generate_series + 1)],
    (generate_series * 5)::numeric,
    (generate_series * 100)::numeric,
    (generate_series % 5) + 1,
    'active',
    NOW()
FROM generate_series(1, 50);

-- ===================== WEBHOOKS (50) =====================
INSERT INTO webhooks (tenant_id, url, events, secret, status, created_at)
SELECT 
    (generate_series % 5) + 1,
    'https://webhook' || generate_series || '.example.com/callback',
    ARRAY['order.created', 'order.updated'],
    'secret_' || generate_series,
    'active',
    NOW()
FROM generate_series(1, 50);

-- Reset sequences
SELECT setval('tenants_id_seq', 50);
SELECT setval('users_id_seq', 50);
SELECT setval('categories_id_seq', 50);
SELECT setval('products_id_seq', 50);
SELECT setval('orders_id_seq', 50);
SELECT setval('coupons_id_seq', 50);

-- Done!
SELECT 'تم ملء قاعدة البيانات بنجاح! 🎉' as message;

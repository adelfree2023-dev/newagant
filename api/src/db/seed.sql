-- CoreFlex Database Seed Data
-- Demo tenant and products

-- Insert demo tenant
INSERT INTO tenants (id, name, name_ar, subdomain, slug, plan, status)
VALUES ('00000000-0000-0000-0000-000000000001', 'Demo Store', 'المتجر التجريبي', 'demo', 'demo', 'pro', 'active')
ON CONFLICT (id) DO NOTHING;

-- Insert admin user (password: admin123)
INSERT INTO users (id, tenant_id, email, password_hash, name, role)
VALUES (
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    'admin@demo.com',
    '$2a$10$CwTycUXWue0Thq9StjUM0uJ8/x5.Bc.9cA.eYPZcvLoKhtY8F8lNq', -- admin123
    'مدير المتجر',
    'tenant_admin'
) ON CONFLICT (email, tenant_id) DO NOTHING;

-- Insert categories
INSERT INTO categories (id, tenant_id, name, name_ar, slug, icon, color) VALUES
('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', 'Electronics', 'إلكترونيات', 'electronics', '📱', 'bg-blue-50'),
('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000001', 'Fashion', 'أزياء', 'fashion', '👔', 'bg-gray-50'),
('00000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000001', 'Home', 'المنزل', 'home', '🏠', 'bg-yellow-50'),
('00000000-0000-0000-0000-000000000013', '00000000-0000-0000-0000-000000000001', 'Beauty', 'الجمال', 'beauty', '💄', 'bg-pink-50'),
('00000000-0000-0000-0000-000000000014', '00000000-0000-0000-0000-000000000001', 'Gaming', 'ألعاب', 'gaming', '🎮', 'bg-red-50')
ON CONFLICT (slug, tenant_id) DO NOTHING;

-- Insert products
INSERT INTO products (id, tenant_id, category_id, name, name_ar, slug, price, compare_price, description, description_ar, images, badge, stock, rating, reviews_count, is_featured) VALUES
-- Electronics
('00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000010',
 'iPhone 15 Pro Max', 'آيفون 15 برو ماكس', 'iphone-15-pro-max', 4999, 5999,
 'The most advanced iPhone ever', 'أقوى آيفون على الإطلاق',
 '["https://images.unsplash.com/photo-1696446701796-da61225697cc?w=400&h=400&fit=crop"]',
 'sale', 50, 4.9, 2540, true),

('00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000010',
 'Samsung Galaxy S24 Ultra', 'سامسونج جالكسي S24 الترا', 'samsung-galaxy-s24-ultra', 4499, 4999,
 'Galaxy AI is here', 'ذكاء جالكسي الاصطناعي',
 '["https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400&h=400&fit=crop"]',
 'new', 35, 4.8, 1890, true),

('00000000-0000-0000-0000-000000000103', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000010',
 'MacBook Pro M3', 'ماك بوك برو M3', 'macbook-pro-m3', 12999, 14999,
 'Most powerful MacBook ever', 'أقوى ماك بوك على الإطلاق',
 '["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop"]',
 'hot', 15, 4.9, 890, true),

('00000000-0000-0000-0000-000000000104', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000010',
 'AirPods Pro 2', 'ايربودز برو 2', 'airpods-pro-2', 999, 1199,
 'Active Noise Cancellation', 'عزل صوت نشط',
 '["https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=400&h=400&fit=crop"]',
 'sale', 200, 4.7, 5420, false),

-- Fashion
('00000000-0000-0000-0000-000000000105', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000011',
 'Nike Air Max 90', 'نايك اير ماكس 90', 'nike-air-max-90', 599, 799,
 'Iconic style', 'تصميم أيقوني',
 '["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop"]',
 'sale', 80, 4.5, 3400, true),

('00000000-0000-0000-0000-000000000106', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000011',
 'Ray-Ban Aviator', 'نظارات راي بان', 'ray-ban-aviator', 749, 899,
 'Classic sunglasses', 'نظارات كلاسيكية',
 '["https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=400&fit=crop"]',
 null, 100, 4.7, 2200, false),

-- Home
('00000000-0000-0000-0000-000000000107', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000012',
 'Dyson V15 Detect', 'مكنسة دايسون V15', 'dyson-v15-detect', 2799, 3299,
 'Cordless vacuum with laser', 'مكنسة لاسلكية مع ليزر',
 '["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop"]',
 'sale', 20, 4.9, 890, true),

-- Beauty
('00000000-0000-0000-0000-000000000108', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000013',
 'Chanel No. 5', 'عطر شانيل رقم 5', 'chanel-no-5', 599, 699,
 'Timeless fragrance', 'العطر الخالد',
 '["https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=400&fit=crop"]',
 'hot', 75, 4.9, 3200, true)

ON CONFLICT (slug, tenant_id) DO NOTHING;

-- Create a demo customer (password: customer123)
INSERT INTO users (id, tenant_id, email, password_hash, name, phone, role)
VALUES (
    '00000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000001',
    'customer@demo.com',
    '$2a$10$CwTycUXWue0Thq9StjUM0uOcR5RmfqY8SfEyQb7Jw3qQ5gNQqZDJq', -- customer123
    'أحمد محمد',
    '+966500000000',
    'customer'
) ON CONFLICT (email, tenant_id) DO NOTHING;

-- Insert super admin (password: super123)
INSERT INTO users (id, email, password_hash, name, role)
VALUES (
    '00000000-0000-0000-0000-000000000099',
    'super@coreflex.io',
    '$2a$10$CwTycUXWue0Thq9StjUM0uJCGAzIpkq6lQ5M6T8Q5pNa3qZDJqXXX', -- super123
    'Super Admin',
    'super_admin'
) ON CONFLICT DO NOTHING;

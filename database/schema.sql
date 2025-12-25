-- ═══════════════════════════════════════════════════════════════════════
--                    CoreFlex Database Schema
--                    Enterprise Multi-Tenant System
-- ═══════════════════════════════════════════════════════════════════════
-- Version: 1.0
-- Date: 2025-12-25
-- ═══════════════════════════════════════════════════════════════════════

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ═══════════════════════════════════════════════════════════════════════
--                         1. CORE TABLES
-- ═══════════════════════════════════════════════════════════════════════

-- Plans (الباقات)
CREATE TABLE plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    name_ar VARCHAR(100) NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    description_ar TEXT,
    
    -- Pricing
    price_monthly DECIMAL(10,2) NOT NULL DEFAULT 0,
    price_yearly DECIMAL(10,2) NOT NULL DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'SAR',
    
    -- Limits
    max_products INTEGER DEFAULT 100,
    max_categories INTEGER DEFAULT 20,
    max_users INTEGER DEFAULT 5,
    max_storage_mb INTEGER DEFAULT 1000,
    max_orders_per_month INTEGER DEFAULT 1000,
    
    -- Features (JSON for flexibility)
    features JSONB DEFAULT '[]',
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════════════

-- Tenants (المتاجر)
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Basic Info
    name VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255),
    subdomain VARCHAR(63) UNIQUE NOT NULL,
    custom_domain VARCHAR(255) UNIQUE,
    
    -- Business Info
    logo_url VARCHAR(500),
    favicon_url VARCHAR(500),
    description TEXT,
    description_ar TEXT,
    
    -- Contact
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    whatsapp VARCHAR(20),
    
    -- Address
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(2) DEFAULT 'SA',
    
    -- Plan & Subscription
    plan_id UUID REFERENCES plans(id),
    subscription_status VARCHAR(20) DEFAULT 'trial',
    -- trial, active, suspended, cancelled
    trial_ends_at TIMESTAMPTZ,
    subscription_ends_at TIMESTAMPTZ,
    
    -- Settings (JSON for flexibility)
    settings JSONB DEFAULT '{}',
    theme_settings JSONB DEFAULT '{}',
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending',
    -- pending, active, suspended, deleted
    is_verified BOOLEAN DEFAULT false,
    verified_at TIMESTAMPTZ,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Index for subdomain lookup
CREATE INDEX idx_tenants_subdomain ON tenants(subdomain);
CREATE INDEX idx_tenants_status ON tenants(status);

-- ═══════════════════════════════════════════════════════════════════════

-- Roles (الأدوار)
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    
    name VARCHAR(50) NOT NULL,
    name_ar VARCHAR(50),
    slug VARCHAR(50) NOT NULL,
    description TEXT,
    
    -- NULL tenant_id = system role (super_admin, admin, support)
    is_system BOOLEAN DEFAULT false,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(tenant_id, slug)
);

-- ═══════════════════════════════════════════════════════════════════════

-- Permissions (الصلاحيات)
CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    name VARCHAR(100) NOT NULL,
    name_ar VARCHAR(100),
    slug VARCHAR(100) UNIQUE NOT NULL,
    module VARCHAR(50) NOT NULL,
    -- users, products, orders, settings, etc.
    
    description TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════════════

-- Role Permissions (ربط الأدوار بالصلاحيات)
CREATE TABLE role_permissions (
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
    
    PRIMARY KEY (role_id, permission_id)
);

-- ═══════════════════════════════════════════════════════════════════════

-- Users (المستخدمين)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Auth
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    
    -- Profile
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100),
    phone VARCHAR(20),
    avatar_url VARCHAR(500),
    
    -- Role
    role_id UUID REFERENCES roles(id),
    
    -- Type
    user_type VARCHAR(20) DEFAULT 'tenant_user',
    -- super_admin, platform_admin, tenant_owner, tenant_user, customer
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    email_verified_at TIMESTAMPTZ,
    
    -- Security
    last_login_at TIMESTAMPTZ,
    last_login_ip VARCHAR(45),
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMPTZ,
    
    -- Preferences
    language VARCHAR(5) DEFAULT 'ar',
    timezone VARCHAR(50) DEFAULT 'Asia/Riyadh',
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    
    UNIQUE(tenant_id, email)
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_tenant ON users(tenant_id);
CREATE INDEX idx_users_type ON users(user_type);

-- ═══════════════════════════════════════════════════════════════════════
--                         2. STORE TABLES
-- ═══════════════════════════════════════════════════════════════════════

-- Categories (الفئات)
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    
    name VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255),
    slug VARCHAR(255) NOT NULL,
    description TEXT,
    description_ar TEXT,
    
    image_url VARCHAR(500),
    icon VARCHAR(50),
    
    -- SEO
    meta_title VARCHAR(255),
    meta_description TEXT,
    
    -- Display
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    show_in_menu BOOLEAN DEFAULT true,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(tenant_id, slug)
);

CREATE INDEX idx_categories_tenant ON categories(tenant_id);
CREATE INDEX idx_categories_parent ON categories(parent_id);

-- ═══════════════════════════════════════════════════════════════════════

-- Products (المنتجات)
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    
    -- Basic Info
    name VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255),
    slug VARCHAR(255) NOT NULL,
    description TEXT,
    description_ar TEXT,
    short_description VARCHAR(500),
    short_description_ar VARCHAR(500),
    
    -- SKU
    sku VARCHAR(100),
    barcode VARCHAR(100),
    
    -- Pricing
    price DECIMAL(12,2) NOT NULL,
    compare_at_price DECIMAL(12,2),
    cost_price DECIMAL(12,2),
    currency VARCHAR(3) DEFAULT 'SAR',
    
    -- Inventory
    track_inventory BOOLEAN DEFAULT true,
    quantity INTEGER DEFAULT 0,
    low_stock_threshold INTEGER DEFAULT 5,
    
    -- Product Type
    product_type VARCHAR(20) DEFAULT 'simple',
    -- simple, variable, digital, service
    
    -- Status
    status VARCHAR(20) DEFAULT 'draft',
    -- draft, active, archived
    is_featured BOOLEAN DEFAULT false,
    
    -- SEO
    meta_title VARCHAR(255),
    meta_description TEXT,
    
    -- Display
    sort_order INTEGER DEFAULT 0,
    
    -- Stats
    view_count INTEGER DEFAULT 0,
    sales_count INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    published_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,
    
    UNIQUE(tenant_id, slug),
    UNIQUE(tenant_id, sku)
);

CREATE INDEX idx_products_tenant ON products(tenant_id);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_featured ON products(is_featured);

-- ═══════════════════════════════════════════════════════════════════════

-- Product Images (صور المنتجات)
CREATE TABLE product_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    
    url VARCHAR(500) NOT NULL,
    alt_text VARCHAR(255),
    sort_order INTEGER DEFAULT 0,
    is_primary BOOLEAN DEFAULT false,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_product_images_product ON product_images(product_id);

-- ═══════════════════════════════════════════════════════════════════════

-- Product Variants (متغيرات المنتج)
CREATE TABLE product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(100),
    barcode VARCHAR(100),
    
    -- Options (e.g., {"color": "red", "size": "XL"})
    options JSONB NOT NULL DEFAULT '{}',
    
    -- Pricing
    price DECIMAL(12,2) NOT NULL,
    compare_at_price DECIMAL(12,2),
    cost_price DECIMAL(12,2),
    
    -- Inventory
    quantity INTEGER DEFAULT 0,
    
    -- Image
    image_url VARCHAR(500),
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_product_variants_product ON product_variants(product_id);

-- ═══════════════════════════════════════════════════════════════════════

-- Product Tags (وسوم المنتجات)
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(tenant_id, slug)
);

CREATE TABLE product_tags (
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    
    PRIMARY KEY (product_id, tag_id)
);

-- ═══════════════════════════════════════════════════════════════════════
--                         3. ORDER TABLES
-- ═══════════════════════════════════════════════════════════════════════

-- Orders (الطلبات)
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES users(id),
    
    -- Order Number (per tenant)
    order_number SERIAL,
    
    -- Status
    status VARCHAR(30) DEFAULT 'pending',
    -- pending, confirmed, processing, shipped, delivered, cancelled, refunded
    payment_status VARCHAR(20) DEFAULT 'pending',
    -- pending, paid, failed, refunded
    
    -- Customer Info (snapshot)
    customer_email VARCHAR(255) NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20),
    
    -- Addresses (JSON snapshots)
    shipping_address JSONB,
    billing_address JSONB,
    
    -- Pricing
    subtotal DECIMAL(12,2) NOT NULL,
    discount_amount DECIMAL(12,2) DEFAULT 0,
    shipping_amount DECIMAL(12,2) DEFAULT 0,
    tax_amount DECIMAL(12,2) DEFAULT 0,
    total DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'SAR',
    
    -- Discount
    coupon_code VARCHAR(50),
    coupon_id UUID,
    
    -- Shipping
    shipping_method VARCHAR(100),
    tracking_number VARCHAR(100),
    shipped_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    
    -- Payment
    payment_method VARCHAR(50),
    payment_reference VARCHAR(255),
    paid_at TIMESTAMPTZ,
    
    -- Notes
    customer_notes TEXT,
    admin_notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    cancelled_at TIMESTAMPTZ
);

CREATE INDEX idx_orders_tenant ON orders(tenant_id);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at);

-- ═══════════════════════════════════════════════════════════════════════

-- Order Items (عناصر الطلب)
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
    
    -- Snapshots
    product_name VARCHAR(255) NOT NULL,
    variant_name VARCHAR(255),
    sku VARCHAR(100),
    
    -- Pricing
    unit_price DECIMAL(12,2) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    subtotal DECIMAL(12,2) NOT NULL,
    
    -- Options snapshot
    options JSONB,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_order_items_order ON order_items(order_id);

-- ═══════════════════════════════════════════════════════════════════════

-- Order Status History (سجل حالات الطلب)
CREATE TABLE order_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    
    status VARCHAR(30) NOT NULL,
    notes TEXT,
    changed_by UUID REFERENCES users(id),
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_order_status_history_order ON order_status_history(order_id);

-- ═══════════════════════════════════════════════════════════════════════
--                         4. MARKETING TABLES
-- ═══════════════════════════════════════════════════════════════════════

-- Coupons (كوبونات الخصم)
CREATE TABLE coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    
    code VARCHAR(50) NOT NULL,
    description TEXT,
    
    -- Discount
    discount_type VARCHAR(20) NOT NULL,
    -- percentage, fixed
    discount_value DECIMAL(10,2) NOT NULL,
    
    -- Limits
    min_order_amount DECIMAL(10,2),
    max_discount_amount DECIMAL(10,2),
    usage_limit INTEGER,
    usage_limit_per_user INTEGER DEFAULT 1,
    usage_count INTEGER DEFAULT 0,
    
    -- Validity
    starts_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(tenant_id, code)
);

CREATE INDEX idx_coupons_tenant ON coupons(tenant_id);
CREATE INDEX idx_coupons_code ON coupons(code);

-- ═══════════════════════════════════════════════════════════════════════

-- Coupon Usage (استخدام الكوبونات)
CREATE TABLE coupon_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    coupon_id UUID NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    discount_amount DECIMAL(10,2) NOT NULL,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════════════

-- Homepage Sections (أقسام الصفحة الرئيسية)
CREATE TABLE homepage_sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    
    section_type VARCHAR(50) NOT NULL,
    -- hero_slider, category_grid, product_row, banner, brands, custom_html
    
    title VARCHAR(255),
    title_ar VARCHAR(255),
    subtitle VARCHAR(255),
    subtitle_ar VARCHAR(255),
    
    -- Content (JSON based on type)
    content JSONB NOT NULL DEFAULT '{}',
    
    -- Display
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    
    -- Visibility
    show_on_desktop BOOLEAN DEFAULT true,
    show_on_mobile BOOLEAN DEFAULT true,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_homepage_sections_tenant ON homepage_sections(tenant_id);

-- ═══════════════════════════════════════════════════════════════════════

-- Banners (البانرات)
CREATE TABLE banners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    
    title VARCHAR(255),
    image_url VARCHAR(500) NOT NULL,
    image_url_mobile VARCHAR(500),
    link_url VARCHAR(500),
    
    -- Position
    position VARCHAR(50) DEFAULT 'homepage',
    -- homepage, category, product
    
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    
    starts_at TIMESTAMPTZ,
    ends_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_banners_tenant ON banners(tenant_id);

-- ═══════════════════════════════════════════════════════════════════════
--                         5. SYSTEM TABLES
-- ═══════════════════════════════════════════════════════════════════════

-- Audit Logs (سجل المراجعة)
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Action
    action VARCHAR(50) NOT NULL,
    -- create, update, delete, login, logout, etc.
    
    -- Target
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID,
    
    -- Details
    old_values JSONB,
    new_values JSONB,
    
    -- Request Info
    ip_address VARCHAR(45),
    user_agent TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_tenant ON audit_logs(tenant_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);

-- ═══════════════════════════════════════════════════════════════════════

-- Subscriptions (الاشتراكات)
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES plans(id),
    
    -- Billing
    billing_cycle VARCHAR(20) NOT NULL,
    -- monthly, yearly
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'SAR',
    
    -- Status
    status VARCHAR(20) DEFAULT 'active',
    -- active, cancelled, expired, suspended
    
    -- Dates
    starts_at TIMESTAMPTZ NOT NULL,
    ends_at TIMESTAMPTZ NOT NULL,
    cancelled_at TIMESTAMPTZ,
    
    -- Payment
    payment_method VARCHAR(50),
    last_payment_at TIMESTAMPTZ,
    next_payment_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_tenant ON subscriptions(tenant_id);

-- ═══════════════════════════════════════════════════════════════════════

-- Payments (المدفوعات)
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES subscriptions(id),
    
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'SAR',
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending',
    -- pending, completed, failed, refunded
    
    -- Payment Details
    payment_method VARCHAR(50),
    gateway VARCHAR(50),
    gateway_reference VARCHAR(255),
    gateway_response JSONB,
    
    -- Invoice
    invoice_number VARCHAR(50),
    invoice_url VARCHAR(500),
    
    -- Dates
    paid_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payments_tenant ON payments(tenant_id);

-- ═══════════════════════════════════════════════════════════════════════

-- Notifications (الإشعارات)
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    type VARCHAR(50) NOT NULL,
    -- order, payment, system, etc.
    
    title VARCHAR(255) NOT NULL,
    message TEXT,
    data JSONB,
    
    -- Status
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read);

-- ═══════════════════════════════════════════════════════════════════════
--                    6. ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════════════════════════════

-- Enable RLS on tenant-specific tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE homepage_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;

-- ═══════════════════════════════════════════════════════════════════════
--                    7. SEED DATA
-- ═══════════════════════════════════════════════════════════════════════

-- Default Plans
INSERT INTO plans (name, name_ar, slug, price_monthly, price_yearly, max_products, max_categories, max_users, features, is_featured) VALUES
('Free', 'مجاني', 'free', 0, 0, 10, 5, 1, '["basic_store", "basic_support"]', false),
('Starter', 'المبتدئ', 'starter', 99, 990, 100, 20, 3, '["custom_domain", "email_support", "basic_analytics"]', false),
('Professional', 'الاحترافي', 'professional', 299, 2990, 1000, 50, 10, '["custom_domain", "priority_support", "advanced_analytics", "api_access"]', true),
('Enterprise', 'المؤسسات', 'enterprise', 999, 9990, -1, -1, -1, '["custom_domain", "dedicated_support", "full_analytics", "api_access", "white_label"]', false);

-- System Permissions
INSERT INTO permissions (name, name_ar, slug, module) VALUES
-- Users
('View Users', 'عرض المستخدمين', 'users.view', 'users'),
('Create User', 'إنشاء مستخدم', 'users.create', 'users'),
('Update User', 'تعديل مستخدم', 'users.update', 'users'),
('Delete User', 'حذف مستخدم', 'users.delete', 'users'),
-- Products
('View Products', 'عرض المنتجات', 'products.view', 'products'),
('Create Product', 'إنشاء منتج', 'products.create', 'products'),
('Update Product', 'تعديل منتج', 'products.update', 'products'),
('Delete Product', 'حذف منتج', 'products.delete', 'products'),
-- Orders
('View Orders', 'عرض الطلبات', 'orders.view', 'orders'),
('Update Order', 'تعديل طلب', 'orders.update', 'orders'),
('Cancel Order', 'إلغاء طلب', 'orders.cancel', 'orders'),
-- Settings
('View Settings', 'عرض الإعدادات', 'settings.view', 'settings'),
('Update Settings', 'تعديل الإعدادات', 'settings.update', 'settings'),
-- Reports
('View Reports', 'عرض التقارير', 'reports.view', 'reports'),
('Export Reports', 'تصدير التقارير', 'reports.export', 'reports'),
-- Tenants (Super Admin)
('View Tenants', 'عرض المتاجر', 'tenants.view', 'tenants'),
('Create Tenant', 'إنشاء متجر', 'tenants.create', 'tenants'),
('Update Tenant', 'تعديل متجر', 'tenants.update', 'tenants'),
('Delete Tenant', 'حذف متجر', 'tenants.delete', 'tenants'),
('Suspend Tenant', 'تعليق متجر', 'tenants.suspend', 'tenants');

-- System Roles
INSERT INTO roles (name, name_ar, slug, is_system) VALUES
('Super Admin', 'المدير الأعلى', 'super_admin', true),
('Platform Admin', 'مدير المنصة', 'platform_admin', true),
('Support', 'الدعم الفني', 'support', true);

-- ═══════════════════════════════════════════════════════════════════════
--                    SCHEMA COMPLETE ✅
-- ═══════════════════════════════════════════════════════════════════════

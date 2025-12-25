-- ═══════════════════════════════════════════════════════════════════════
--              Tenant Data Export & Self-Hosting Migration
--              تصدير البيانات والانفصال عن المنصة
-- ═══════════════════════════════════════════════════════════════════════
--
-- الميزة: يمكن للعميل طلب الحصول على نسخة كاملة من بياناته
-- والانفصال عن المنصة لاستضافة متجره بشكل مستقل
--
-- ═══════════════════════════════════════════════════════════════════════

-- طلبات تصدير البيانات
CREATE TABLE data_export_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    requested_by UUID NOT NULL REFERENCES users(id),
    
    -- نوع الطلب
    export_type VARCHAR(30) NOT NULL,
    -- full_export: تصدير كامل للبيانات
    -- self_hosting: الانفصال والاستضافة الذاتية
    -- gdpr_request: طلب بموجب GDPR
    -- backup: نسخة احتياطية
    
    -- البيانات المطلوبة
    include_products BOOLEAN DEFAULT true,
    include_categories BOOLEAN DEFAULT true,
    include_orders BOOLEAN DEFAULT true,
    include_customers BOOLEAN DEFAULT true,
    include_media BOOLEAN DEFAULT true,
    include_settings BOOLEAN DEFAULT true,
    include_analytics BOOLEAN DEFAULT false,
    
    -- صيغة التصدير
    export_format VARCHAR(20) DEFAULT 'sql',
    -- sql, json, csv, full_package
    
    -- الحالة
    status VARCHAR(20) DEFAULT 'pending',
    -- pending, processing, ready, downloaded, expired, cancelled
    
    -- التقدم
    progress_percent INTEGER DEFAULT 0,
    current_step VARCHAR(100),
    
    -- الملف الناتج
    export_file_url VARCHAR(500),
    export_file_size_mb DECIMAL(10,2),
    export_password_hash VARCHAR(255),  -- التصدير مشفر بكلمة مرور
    
    -- صلاحية التحميل
    download_count INTEGER DEFAULT 0,
    max_downloads INTEGER DEFAULT 3,
    expires_at TIMESTAMPTZ,
    
    -- ملاحظات
    admin_notes TEXT,
    user_notes TEXT,
    
    -- الأختام الزمنية
    created_at TIMESTAMPTZ DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    downloaded_at TIMESTAMPTZ
);

CREATE INDEX idx_data_export_requests_tenant ON data_export_requests(tenant_id);
CREATE INDEX idx_data_export_requests_status ON data_export_requests(status);

-- ═══════════════════════════════════════════════════════════════════════

-- طلبات الانفصال (Self-Hosting Requests)
CREATE TABLE self_hosting_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    requested_by UUID NOT NULL REFERENCES users(id),
    
    -- حالة الطلب
    status VARCHAR(30) DEFAULT 'pending',
    -- pending: في الانتظار
    -- under_review: قيد المراجعة
    -- approved: موافق عليه
    -- preparing: جاري التحضير
    -- ready: جاهز للتسليم
    -- delivered: تم التسليم
    -- rejected: مرفوض
    
    -- سبب الطلب
    reason TEXT,
    
    -- تفاصيل فنية
    target_server_info JSONB,
    -- {
    --   "ip": "xxx.xxx.xxx.xxx",
    --   "provider": "AWS/GCP/DigitalOcean",
    --   "specs": "4 CPU, 16GB RAM"
    -- }
    
    -- الباقة المطلوبة
    package_type VARCHAR(30) DEFAULT 'standard',
    -- standard: الكود + قاعدة البيانات
    -- premium: + دعم التثبيت
    -- enterprise: + صيانة لمدة سنة
    
    -- التكلفة
    one_time_fee DECIMAL(10,2),
    monthly_support_fee DECIMAL(10,2),
    currency VARCHAR(3) DEFAULT 'SAR',
    
    -- الملفات المسلمة
    deliverables JSONB,
    -- {
    --   "source_code_url": "...",
    --   "database_dump_url": "...",
    --   "media_files_url": "...",
    --   "documentation_url": "...",
    --   "deployment_guide_url": "..."
    -- }
    
    -- ملاحظات
    admin_notes TEXT,
    rejection_reason TEXT,
    
    -- المعالجة
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMPTZ,
    
    -- الأختام الزمنية
    created_at TIMESTAMPTZ DEFAULT NOW(),
    approved_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ
);

CREATE INDEX idx_self_hosting_requests_tenant ON self_hosting_requests(tenant_id);
CREATE INDEX idx_self_hosting_requests_status ON self_hosting_requests(status);

-- ═══════════════════════════════════════════════════════════════════════

-- سجل عمليات التصدير (للمتابعة)
CREATE TABLE export_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    export_request_id UUID NOT NULL REFERENCES data_export_requests(id) ON DELETE CASCADE,
    
    step VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL,
    -- started, completed, failed
    
    records_processed INTEGER,
    error_message TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════════════
--                    SELF-HOSTING PACKAGE STRUCTURE
-- ═══════════════════════════════════════════════════════════════════════
--
-- عند طلب الانفصال، يحصل العميل على:
--
-- 📦 CoreFlex-{tenant_name}-{date}.zip
-- │
-- ├── 📁 source/
-- │   ├── api/             # Node.js API
-- │   ├── storefront/      # Next.js Storefront
-- │   ├── admin/           # Next.js Admin
-- │   ├── mobile/          # Expo App (optional)
-- │   └── docker-compose.yml
-- │
-- ├── 📁 database/
-- │   ├── schema.sql       # هيكل قاعدة البيانات
-- │   ├── data.sql         # البيانات
-- │   └── migrations/      # ملفات الترحيل
-- │
-- ├── 📁 media/
-- │   ├── products/        # صور المنتجات
-- │   ├── categories/      # صور الفئات
-- │   └── banners/         # البانرات
-- │
-- ├── 📁 docs/
-- │   ├── INSTALLATION.md  # دليل التثبيت
-- │   ├── CONFIGURATION.md # دليل الإعداد
-- │   ├── API.md           # توثيق الـ API
-- │   └── TROUBLESHOOTING.md
-- │
-- ├── 📄 .env.example      # ملف البيئة
-- ├── 📄 README.md         # الملف التعريفي
-- └── 📄 LICENSE.md        # الرخصة
--
-- ═══════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════
--                    GOVERNANCE POLICIES
-- ═══════════════════════════════════════════════════════════════════════

-- سياسات التصدير والانفصال
CREATE TABLE governance_policies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    policy_type VARCHAR(50) NOT NULL UNIQUE,
    -- data_export, self_hosting, data_retention, gdpr
    
    -- القواعد
    rules JSONB NOT NULL,
    
    -- للتصدير العادي
    -- {
    --   "min_subscription_days": 30,
    --   "max_exports_per_month": 3,
    --   "export_cooldown_hours": 24,
    --   "include_media": true,
    --   "require_password": true
    -- }
    
    -- للانفصال
    -- {
    --   "min_subscription_months": 6,
    --   "notice_period_days": 30,
    --   "standard_fee": 5000,
    --   "premium_fee": 10000,
    --   "enterprise_fee": 25000,
    --   "require_paid_subscription": true
    -- }
    
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed governance policies
INSERT INTO governance_policies (policy_type, rules) VALUES
('data_export', '{
    "min_subscription_days": 0,
    "max_exports_per_month": 5,
    "export_cooldown_hours": 24,
    "include_media": true,
    "require_password": true,
    "expiry_days": 7
}'),
('self_hosting', '{
    "min_subscription_months": 3,
    "notice_period_days": 30,
    "packages": {
        "standard": {"price": 5000, "includes": ["source", "database", "docs"]},
        "premium": {"price": 10000, "includes": ["source", "database", "docs", "installation_support"]},
        "enterprise": {"price": 25000, "includes": ["source", "database", "docs", "installation_support", "12_months_support"]}
    },
    "require_paid_subscription": true,
    "allow_trial_tenants": false
}'),
('data_retention', '{
    "deleted_tenant_data_retention_days": 90,
    "export_files_retention_days": 7,
    "audit_logs_retention_months": 24,
    "backup_retention_days": 30
}');

-- ═══════════════════════════════════════════════════════════════════════
--                    COMPLETE ✅
-- ═══════════════════════════════════════════════════════════════════════

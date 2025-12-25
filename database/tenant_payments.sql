-- ═══════════════════════════════════════════════════════════════════════
--              Tenant Payment Settings - إعدادات الدفع للمتاجر
--              المدفوعات تذهب مباشرة لحساب صاحب المتجر
-- ═══════════════════════════════════════════════════════════════════════

-- Tenant Payment Settings (إعدادات الدفع لكل متجر)
CREATE TABLE tenant_payment_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- ═══════════════════════════════════════════════════════════════════
    --                    الحساب البنكي
    -- ═══════════════════════════════════════════════════════════════════
    bank_name VARCHAR(100),
    bank_name_ar VARCHAR(100),
    account_holder_name VARCHAR(255),
    account_number VARCHAR(50),
    iban VARCHAR(50),
    swift_code VARCHAR(20),
    
    -- ═══════════════════════════════════════════════════════════════════
    --                    بوابات الدفع الإلكتروني
    -- ═══════════════════════════════════════════════════════════════════
    
    -- Stripe
    stripe_enabled BOOLEAN DEFAULT false,
    stripe_account_id VARCHAR(100),        -- Connected Account ID
    stripe_publishable_key VARCHAR(255),
    stripe_secret_key_encrypted TEXT,      -- Encrypted!
    
    -- PayPal
    paypal_enabled BOOLEAN DEFAULT false,
    paypal_client_id VARCHAR(255),
    paypal_secret_encrypted TEXT,          -- Encrypted!
    paypal_email VARCHAR(255),
    
    -- Tap (للسعودية والخليج)
    tap_enabled BOOLEAN DEFAULT false,
    tap_merchant_id VARCHAR(100),
    tap_api_key_encrypted TEXT,            -- Encrypted!
    
    -- Moyasar (للسعودية)
    moyasar_enabled BOOLEAN DEFAULT false,
    moyasar_publishable_key VARCHAR(255),
    moyasar_secret_key_encrypted TEXT,     -- Encrypted!
    
    -- HyperPay (للسعودية والخليج)
    hyperpay_enabled BOOLEAN DEFAULT false,
    hyperpay_entity_id VARCHAR(100),
    hyperpay_access_token_encrypted TEXT,  -- Encrypted!
    
    -- ═══════════════════════════════════════════════════════════════════
    --                    الدفع عند الاستلام
    -- ═══════════════════════════════════════════════════════════════════
    cod_enabled BOOLEAN DEFAULT true,
    cod_extra_fee DECIMAL(10,2) DEFAULT 0,
    
    -- ═══════════════════════════════════════════════════════════════════
    --                    التحويل البنكي
    -- ═══════════════════════════════════════════════════════════════════
    bank_transfer_enabled BOOLEAN DEFAULT false,
    bank_transfer_instructions TEXT,
    bank_transfer_instructions_ar TEXT,
    
    -- ═══════════════════════════════════════════════════════════════════
    --                    إعدادات عامة
    -- ═══════════════════════════════════════════════════════════════════
    default_currency VARCHAR(3) DEFAULT 'SAR',
    
    -- Test Mode
    is_test_mode BOOLEAN DEFAULT true,
    
    -- Auto-capture or manual
    auto_capture_payments BOOLEAN DEFAULT true,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(tenant_id)
);

CREATE INDEX idx_tenant_payment_settings_tenant ON tenant_payment_settings(tenant_id);

-- ═══════════════════════════════════════════════════════════════════════

-- Tenant Payouts (تحويلات للمتاجر - في حالة نظام المحفظة)
-- هذا اختياري إذا أردت أن تمر المدفوعات عبر المنصة أولاً
CREATE TABLE tenant_payouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    
    amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'SAR',
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending',
    -- pending, processing, completed, failed
    
    -- Bank Info Snapshot
    bank_info JSONB NOT NULL,
    
    -- Reference
    reference_number VARCHAR(100),
    bank_reference VARCHAR(255),
    
    -- Notes
    notes TEXT,
    
    -- Dates
    requested_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    
    processed_by UUID REFERENCES users(id)
);

CREATE INDEX idx_tenant_payouts_tenant ON tenant_payouts(tenant_id);
CREATE INDEX idx_tenant_payouts_status ON tenant_payouts(status);

-- ═══════════════════════════════════════════════════════════════════════

-- Tenant Wallet (محفظة المتجر - اختياري)
CREATE TABLE tenant_wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    
    balance DECIMAL(12,2) DEFAULT 0,
    pending_balance DECIMAL(12,2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'SAR',
    
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(tenant_id)
);

-- Wallet Transactions
CREATE TABLE wallet_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_id UUID NOT NULL REFERENCES tenant_wallets(id) ON DELETE CASCADE,
    
    type VARCHAR(20) NOT NULL,
    -- credit, debit, payout, refund, fee
    
    amount DECIMAL(12,2) NOT NULL,
    balance_after DECIMAL(12,2) NOT NULL,
    
    -- Reference
    reference_type VARCHAR(50),
    -- order, payout, refund, subscription_fee
    reference_id UUID,
    
    description TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_wallet_transactions_wallet ON wallet_transactions(wallet_id);

-- ═══════════════════════════════════════════════════════════════════════
--                    PAYMENT FLOW OPTIONS
-- ═══════════════════════════════════════════════════════════════════════
--
-- Option A: Direct Payment (المدفوعات المباشرة)
-- ─────────────────────────────────────────────
-- العميل يدفع مباشرة لحساب صاحب المتجر
-- - Stripe Connect (Standard or Express)
-- - PayPal Business
-- - Bank Transfer مباشر
--
-- Option B: Platform Wallet (محفظة المنصة)
-- ─────────────────────────────────────────────
-- العميل يدفع للمنصة، والمنصة تحول للمتجر بعد خصم العمولة
-- - أكثر تحكم
-- - أسهل للمحاسبة
-- - يتطلب ترخيص مالي
--
-- التوصية: Option A (Direct) للبداية
-- ═══════════════════════════════════════════════════════════════════════

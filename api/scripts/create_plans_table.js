/**
 * Plans Table Migration Script
 * Creates the subscription plans table and updates tenants to reference it
 * 
 * Run: node scripts/create_plans_table.js
 */

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function migrate() {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        console.log('🗄️ Creating plans table...');

        // 1. Create plans table
        await client.query(`
            CREATE TABLE IF NOT EXISTS plans (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                name VARCHAR(50) NOT NULL UNIQUE,
                name_ar VARCHAR(100) NOT NULL,
                description TEXT,
                description_ar TEXT,
                price DECIMAL(10, 2) DEFAULT 0,
                currency VARCHAR(3) DEFAULT 'SAR',
                billing_cycle VARCHAR(20) DEFAULT 'monthly',
                
                -- Limits
                max_products INTEGER DEFAULT 50,
                max_categories INTEGER DEFAULT 10,
                max_staff INTEGER DEFAULT 2,
                max_storage_mb INTEGER DEFAULT 500,
                
                -- Theme Access
                allowed_themes TEXT[] DEFAULT ARRAY['modern', 'classic', 'minimal'],
                
                -- Features
                features JSONB DEFAULT '{
                    "custom_domain": false,
                    "analytics": false,
                    "priority_support": false,
                    "api_access": false,
                    "multi_language": true,
                    "seo_tools": false,
                    "email_marketing": false
                }'::jsonb,
                
                -- Metadata
                is_active BOOLEAN DEFAULT true,
                sort_order INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            );
        `);

        console.log('  ✅ plans table created');

        // 2. Insert default plans
        await client.query(`
            INSERT INTO plans (name, name_ar, description, description_ar, price, max_products, max_categories, max_staff, allowed_themes, features, sort_order)
            VALUES 
            (
                'free', 
                'المجانية', 
                'Perfect for getting started', 
                'مثالية للبداية',
                0,
                20,
                5,
                1,
                ARRAY['modern', 'classic', 'minimal'],
                '{"custom_domain": false, "analytics": false, "priority_support": false, "api_access": false, "multi_language": true, "seo_tools": false}'::jsonb,
                1
            ),
            (
                'basic',
                'الأساسية',
                'For small businesses',
                'للمتاجر الصغيرة',
                99,
                100,
                20,
                3,
                ARRAY['modern', 'classic', 'minimal', 'dark', 'fashion', 'electronics', 'grocery'],
                '{"custom_domain": true, "analytics": true, "priority_support": false, "api_access": false, "multi_language": true, "seo_tools": true}'::jsonb,
                2
            ),
            (
                'pro',
                'الاحترافية',
                'For growing businesses',
                'للمتاجر النامية',
                299,
                500,
                50,
                10,
                ARRAY['*'],
                '{"custom_domain": true, "analytics": true, "priority_support": true, "api_access": true, "multi_language": true, "seo_tools": true, "email_marketing": true}'::jsonb,
                3
            ),
            (
                'enterprise',
                'المؤسسية',
                'For large enterprises',
                'للمؤسسات الكبرى',
                999,
                -1,
                -1,
                -1,
                ARRAY['*'],
                '{"custom_domain": true, "analytics": true, "priority_support": true, "api_access": true, "multi_language": true, "seo_tools": true, "email_marketing": true, "dedicated_support": true}'::jsonb,
                4
            )
            ON CONFLICT (name) DO UPDATE SET 
                price = EXCLUDED.price,
                max_products = EXCLUDED.max_products,
                allowed_themes = EXCLUDED.allowed_themes;
        `);

        console.log('  ✅ Default plans inserted (free, basic, pro, enterprise)');

        // 3. Add plan column to tenants if not exists
        await client.query(`
            ALTER TABLE tenants 
            ADD COLUMN IF NOT EXISTS plan VARCHAR(50) DEFAULT 'free' REFERENCES plans(name);
        `);

        console.log('  ✅ tenants.plan column added');

        // 4. Update allowed_themes to use plan's allowed_themes
        await client.query(`
            ALTER TABLE tenants 
            ADD COLUMN IF NOT EXISTS allowed_themes TEXT[];
        `);

        console.log('  ✅ tenants.allowed_themes column added');

        await client.query('COMMIT');
        console.log('\n🎉 Migration completed successfully!');

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Migration failed:', err.message);
        throw err;
    } finally {
        client.release();
        pool.end();
    }
}

migrate().catch(err => {
    console.error(err);
    process.exit(1);
});

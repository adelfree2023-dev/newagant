const { query } = require('../src/db');

async function migrate() {
    console.log('🚀 Starting Dynamic CMS Migration...');

    try {
        // 1. Create tenant_pages table
        console.log('📄 Creating tenant_pages table...');
        await query(`
            CREATE TABLE IF NOT EXISTS tenant_pages (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
                slug VARCHAR(255) NOT NULL,
                title VARCHAR(255) NOT NULL,
                content TEXT,
                meta_title VARCHAR(255),
                meta_description TEXT,
                is_published BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW(),
                UNIQUE(tenant_id, slug)
            );
        `);

        // 2. Add max_pages limit to plans (if not exists, we'll store it in logic for now, 
        //    but good to have in DB future-proof). 
        //    For now, we'll rely on the Subscription/Plan logic to define limits.

        console.log('✅ Migration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

migrate();

const { pool, query } = require('../src/db');

async function migrate() {
    console.log('Starting Attributes Migration...');

    try {
        // 1. Attributes Definition Table
        await query(`
            CREATE TABLE IF NOT EXISTS attributes (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                tenant_id VARCHAR(50) NOT NULL REFERENCES tenants(id),
                name VARCHAR(100) NOT NULL,
                code VARCHAR(100) NOT NULL, -- e.g. 'color', 'size', 'year'
                type VARCHAR(50) DEFAULT 'text', -- text, select, color, number
                is_filterable BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT NOW(),
                UNIQUE(tenant_id, code)
            );
        `);

        // 2. Attribute Options (for 'select' type)
        await query(`
            CREATE TABLE IF NOT EXISTS attribute_options (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                attribute_id UUID REFERENCES attributes(id) ON DELETE CASCADE,
                value VARCHAR(255) NOT NULL,
                label VARCHAR(255),
                color_hex VARCHAR(50), -- for color swatches
                created_at TIMESTAMP DEFAULT NOW()
            );
        `);

        // 3. Product Attribute Values
        await query(`
            CREATE TABLE IF NOT EXISTS product_attributes (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                product_id UUID REFERENCES products(id) ON DELETE CASCADE,
                attribute_id UUID REFERENCES attributes(id) ON DELETE CASCADE,
                value TEXT,
                created_at TIMESTAMP DEFAULT NOW(),
                UNIQUE(product_id, attribute_id)
            );
        `);

        // 4. Governance: Add Theme Limits to Plans or Tenants
        // We'll add it to tenants for now to override per tenant, 
        // usually this comes from the Plan but let's store effective limit on tenant.
        await query(`
            ALTER TABLE tenants 
            ADD COLUMN IF NOT EXISTS allowed_themes TEXT[] DEFAULT ARRAY['modern'],
            ADD COLUMN IF NOT EXISTS max_themes_limit INTEGER DEFAULT 1;
        `);

        console.log('✅ Attributes tables created successfully!');
    } catch (error) {
        console.error('❌ Migration failed:', error);
    } finally {
        process.exit();
    }
}

migrate();

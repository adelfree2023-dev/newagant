const { query } = require('../src/db');

async function migrate() {
    console.log('🚀 Starting Theme Engine Migration...');

    try {
        // 1. Add theme_id column
        console.log('🎨 Adding theme_id to tenants table...');
        await query(`
            ALTER TABLE tenants 
            ADD COLUMN IF NOT EXISTS theme_id VARCHAR(50) DEFAULT 'modern';
        `);

        // 2. Add theme_config column (JSONB) for specific customization (colors per theme)
        await query(`
            ALTER TABLE tenants 
            ADD COLUMN IF NOT EXISTS theme_config JSONB DEFAULT '{}';
        `);

        console.log('✅ Migration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

migrate();

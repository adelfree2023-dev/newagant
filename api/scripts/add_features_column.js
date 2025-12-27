const { query } = require('../src/db');

async function migrate() {
    try {
        console.log('🔄 Starting migration: Add features column to tenants...');

        await query(`
            ALTER TABLE tenants 
            ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '{}';
        `);

        console.log('✅ Migration successful: features column added.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

migrate();

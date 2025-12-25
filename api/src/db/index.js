const { Pool } = require('pg');

// Database Connection Pool
const pool = new Pool({
    host: process.env.DB_HOST || 'postgres',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'coreflex',
    user: process.env.DB_USER || 'coreflex',
    password: process.env.DB_PASSWORD || 'coreflex_secret',
    max: 20, // Maximum connections
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// Test connection
pool.on('connect', () => {
    console.log('📦 Connected to PostgreSQL');
});

pool.on('error', (err) => {
    console.error('❌ PostgreSQL error:', err.message);
});

// Query helper
const query = async (text, params) => {
    const start = Date.now();
    try {
        const result = await pool.query(text, params);
        const duration = Date.now() - start;
        if (duration > 100) {
            console.log('⚠️ Slow query:', { text, duration, rows: result.rowCount });
        }
        return result;
    } catch (error) {
        console.error('❌ Query error:', error.message);
        throw error;
    }
};

// Transaction helper
const transaction = async (callback) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const result = await callback(client);
        await client.query('COMMIT');
        return result;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

module.exports = { pool, query, transaction };

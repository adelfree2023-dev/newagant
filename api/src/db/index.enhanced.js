/**
 * Database Connection Pool
 * طبقة الاتصال بقاعدة البيانات
 * 
 * يجب وضعه في: api/src/db/index.js
 */

const { Pool } = require('pg');

// إنشاء Pool للاتصالات
const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'coreflex',
    user: process.env.DB_USER || 'coreflex',
    password: process.env.DB_PASSWORD || 'coreflex',

    // Connection Pool Settings
    min: 2,                          // الحد الأدنى للاتصالات
    max: 20,                         // الحد الأقصى للاتصالات
    idleTimeoutMillis: 30000,        // وقت الإغلاق للاتصال الخامل
    connectionTimeoutMillis: 5000,   // وقت انتظار الاتصال الجديد

    // SSL للإنتاج
    ssl: process.env.DB_SSL === 'true' ? {
        rejectUnauthorized: false,
    } : false,
});

// Event Listeners
pool.on('connect', () => {
    console.log('🗄️ Database: New client connected');
});

pool.on('error', (err) => {
    console.error('🗄️ Database: Unexpected error on idle client', err);
});

pool.on('remove', () => {
    console.log('🗄️ Database: Client removed from pool');
});

/**
 * تنفيذ query
 */
async function query(text, params) {
    const start = Date.now();

    try {
        const result = await pool.query(text, params);
        const duration = Date.now() - start;

        // Log slow queries
        if (duration > 1000) {
            console.warn(`🐢 Slow query (${duration}ms):`, text.substring(0, 100));
        }

        return result;
    } catch (error) {
        console.error('🗄️ Database query error:', error.message);
        throw error;
    }
}

/**
 * الحصول على Client للـ Transactions
 */
async function getClient() {
    const client = await pool.connect();

    const originalQuery = client.query.bind(client);
    const originalRelease = client.release.bind(client);

    // Override query للـ logging
    client.query = async (...args) => {
        try {
            return await originalQuery(...args);
        } catch (error) {
            console.error('🗄️ Transaction query error:', error.message);
            throw error;
        }
    };

    // Override release للتأكد من الإغلاق
    client.release = () => {
        client.query = () => {
            throw new Error('Client has been released');
        };
        return originalRelease();
    };

    return client;
}

/**
 * تنفيذ Transaction
 */
async function transaction(callback) {
    const client = await getClient();

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
}

/**
 * التحقق من صحة الاتصال
 */
async function checkConnection() {
    try {
        const result = await query('SELECT NOW() as now, current_database() as db');
        console.log('🗄️ Database connected:', result.rows[0].db, 'at', result.rows[0].now);
        return true;
    } catch (error) {
        console.error('🗄️ Database connection failed:', error.message);
        return false;
    }
}

/**
 * إغلاق جميع الاتصالات
 */
async function closePool() {
    await pool.end();
    console.log('🗄️ Database pool closed');
}

/**
 * Query Builder Helpers
 */

// بناء شرط WHERE من object
function buildWhereClause(conditions, startParam = 1) {
    const clauses = [];
    const values = [];
    let paramIndex = startParam;

    for (const [key, value] of Object.entries(conditions)) {
        if (value !== undefined && value !== null) {
            clauses.push(`${key} = $${paramIndex}`);
            values.push(value);
            paramIndex++;
        }
    }

    return {
        clause: clauses.length > 0 ? 'WHERE ' + clauses.join(' AND ') : '',
        values,
        nextParam: paramIndex,
    };
}

// بناء SET للـ UPDATE من object
function buildSetClause(updates, startParam = 1) {
    const clauses = [];
    const values = [];
    let paramIndex = startParam;

    for (const [key, value] of Object.entries(updates)) {
        if (value !== undefined) {
            clauses.push(`${key} = $${paramIndex}`);
            values.push(value);
            paramIndex++;
        }
    }

    return {
        clause: clauses.join(', '),
        values,
        nextParam: paramIndex,
    };
}

// Pagination helper
function buildPagination(page = 1, limit = 20, maxLimit = 100) {
    const safeLimit = Math.min(Math.max(1, limit), maxLimit);
    const safePage = Math.max(1, page);
    const offset = (safePage - 1) * safeLimit;

    return {
        limit: safeLimit,
        offset,
        page: safePage,
    };
}

/**
 * Model Base Class
 */
class BaseModel {
    constructor(tableName, tenantId = null) {
        this.tableName = tableName;
        this.tenantId = tenantId;
    }

    async findById(id) {
        const conditions = { id };
        if (this.tenantId) conditions.tenant_id = this.tenantId;

        const { clause, values } = buildWhereClause(conditions);
        const result = await query(
            `SELECT * FROM ${this.tableName} ${clause} LIMIT 1`,
            values
        );

        return result.rows[0] || null;
    }

    async findAll(options = {}) {
        const { page = 1, limit = 20, orderBy = 'created_at', order = 'DESC' } = options;
        const { limit: safeLimit, offset } = buildPagination(page, limit);

        let conditions = {};
        if (this.tenantId) conditions.tenant_id = this.tenantId;

        const { clause, values } = buildWhereClause(conditions);

        const result = await query(
            `SELECT * FROM ${this.tableName} ${clause} ORDER BY ${orderBy} ${order} LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
            [...values, safeLimit, offset]
        );

        return result.rows;
    }

    async create(data) {
        if (this.tenantId) data.tenant_id = this.tenantId;

        const keys = Object.keys(data);
        const values = Object.values(data);
        const placeholders = keys.map((_, i) => `$${i + 1}`);

        const result = await query(
            `INSERT INTO ${this.tableName} (${keys.join(', ')}) VALUES (${placeholders.join(', ')}) RETURNING *`,
            values
        );

        return result.rows[0];
    }

    async update(id, data) {
        const { clause: setClause, values: setValues, nextParam } = buildSetClause(data);

        let whereValues = [id];
        let whereClause = `id = $${nextParam}`;

        if (this.tenantId) {
            whereValues.push(this.tenantId);
            whereClause += ` AND tenant_id = $${nextParam + 1}`;
        }

        const result = await query(
            `UPDATE ${this.tableName} SET ${setClause}, updated_at = NOW() WHERE ${whereClause} RETURNING *`,
            [...setValues, ...whereValues]
        );

        return result.rows[0];
    }

    async delete(id) {
        let values = [id];
        let whereClause = 'id = $1';

        if (this.tenantId) {
            values.push(this.tenantId);
            whereClause += ' AND tenant_id = $2';
        }

        const result = await query(
            `DELETE FROM ${this.tableName} WHERE ${whereClause} RETURNING id`,
            values
        );

        return result.rows.length > 0;
    }

    async count(conditions = {}) {
        if (this.tenantId) conditions.tenant_id = this.tenantId;

        const { clause, values } = buildWhereClause(conditions);

        const result = await query(
            `SELECT COUNT(*) FROM ${this.tableName} ${clause}`,
            values
        );

        return parseInt(result.rows[0].count);
    }
}

module.exports = {
    pool,
    query,
    getClient,
    transaction,
    checkConnection,
    closePool,
    buildWhereClause,
    buildSetClause,
    buildPagination,
    BaseModel,
};

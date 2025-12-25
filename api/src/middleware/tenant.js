/**
 * CoreFlex Multi-Tenancy Middleware
 * الإصدار: 2.1.0-saas
 * 
 * ميدلوير تعدد المستأجرين - يجب وضعه في: api/middleware/tenant.js
 * 
 * يضمن عزل البيانات بين التجار (Tenant Isolation)
 */

const db = require('../db');

// Configuration
const TENANT_HEADER = 'X-Tenant-ID';
const ALLOWED_SUBDOMAINS = ['www', 'api', 'admin', 'app'];

// ============================================
// TENANT EXTRACTION
// ============================================

/**
 * Extract tenant from subdomain
 * Example: store1.coreflex.io -> store1
 */
function extractTenantFromHost(host) {
    if (!host) return null;

    // Remove port
    const hostname = host.split(':')[0];

    // Get subdomain
    const parts = hostname.split('.');

    if (parts.length < 3) {
        return null; // No subdomain
    }

    const subdomain = parts[0];

    // Skip system subdomains
    if (ALLOWED_SUBDOMAINS.includes(subdomain)) {
        return null;
    }

    return subdomain;
}

/**
 * Extract tenant from custom domain
 * Lookup in database
 */
async function extractTenantFromCustomDomain(host) {
    if (!host) return null;

    const hostname = host.split(':')[0];

    try {
        const result = await db.query(
            'SELECT id, slug FROM tenants WHERE custom_domain = $1 AND status = $2',
            [hostname, 'active']
        );

        if (result.rows.length > 0) {
            return result.rows[0];
        }
    } catch (error) {
        console.error('Error looking up custom domain:', error);
    }

    return null;
}

// ============================================
// TENANT MIDDLEWARE
// ============================================

/**
 * Main tenant middleware
 * Extracts tenant from request and attaches to req object
 */
async function tenantMiddleware(req, res, next) {
    try {
        let tenant = null;

        // 1. Check header (for API calls)
        const headerTenant = req.headers[TENANT_HEADER.toLowerCase()];
        if (headerTenant) {
            tenant = await getTenantById(headerTenant);
        }

        // 2. Check subdomain
        if (!tenant) {
            const slug = extractTenantFromHost(req.headers.host);
            if (slug) {
                tenant = await getTenantBySlug(slug);
            }
        }

        // 3. Check custom domain
        if (!tenant) {
            tenant = await extractTenantFromCustomDomain(req.headers.host);
        }

        // 4. Check JWT token
        if (!tenant && req.user?.tenantId) {
            tenant = await getTenantById(req.user.tenantId);
        }

        // Attach tenant to request
        if (tenant) {
            if (tenant.status !== 'active') {
                return res.status(403).json({
                    error: 'Store is not active',
                    code: 'TENANT_INACTIVE',
                });
            }

            req.tenant = tenant;
            req.tenantId = tenant.id;

            // Add tenant to response headers for debugging
            res.setHeader(TENANT_HEADER, tenant.id);
        }

        next();
    } catch (error) {
        console.error('Tenant middleware error:', error);
        next(error);
    }
}

/**
 * Require tenant middleware
 * Fails if no tenant found
 */
function requireTenant(req, res, next) {
    if (!req.tenant) {
        return res.status(400).json({
            error: 'Store not found',
            code: 'TENANT_REQUIRED',
        });
    }
    next();
}

// ============================================
// TENANT LOOKUP FUNCTIONS
// ============================================

async function getTenantById(id) {
    try {
        const result = await db.query(
            `SELECT id, slug, name, custom_domain, status, settings, 
              subscription_plan, subscription_expires_at
       FROM tenants WHERE id = $1`,
            [id]
        );
        return result.rows[0] || null;
    } catch (error) {
        console.error('Error getting tenant by ID:', error);
        return null;
    }
}

async function getTenantBySlug(slug) {
    try {
        const result = await db.query(
            `SELECT id, slug, name, custom_domain, status, settings,
              subscription_plan, subscription_expires_at
       FROM tenants WHERE slug = $1`,
            [slug]
        );
        return result.rows[0] || null;
    } catch (error) {
        console.error('Error getting tenant by slug:', error);
        return null;
    }
}

// ============================================
// QUERY HELPERS (Auto-filter by tenant)
// ============================================

/**
 * Add tenant filter to queries
 * Use this to ensure data isolation
 */
function withTenant(query, tenantId, paramIndex = 1) {
    const tenantCondition = `tenant_id = $${paramIndex}`;

    if (query.toLowerCase().includes('where')) {
        return {
            query: query.replace(/where/i, `WHERE ${tenantCondition} AND `),
            params: [tenantId],
        };
    } else {
        // Find insertion point (before ORDER BY, LIMIT, etc)
        const insertBefore = /(order by|limit|offset|group by|having)/i;
        const match = query.match(insertBefore);

        if (match) {
            const index = match.index;
            return {
                query: query.slice(0, index) + ` WHERE ${tenantCondition} ` + query.slice(index),
                params: [tenantId],
            };
        }

        return {
            query: query + ` WHERE ${tenantCondition}`,
            params: [tenantId],
        };
    }
}

/**
 * Create a tenant-scoped query function
 * Automatically adds tenant_id to all queries
 */
function createTenantQuery(tenantId) {
    return {
        // SELECT with auto tenant filter
        select: async (table, fields = '*', where = {}, options = {}) => {
            const conditions = ['tenant_id = $1'];
            const params = [tenantId];
            let paramIndex = 2;

            Object.entries(where).forEach(([key, value]) => {
                conditions.push(`${key} = $${paramIndex}`);
                params.push(value);
                paramIndex++;
            });

            let query = `SELECT ${fields} FROM ${table} WHERE ${conditions.join(' AND ')}`;

            if (options.orderBy) query += ` ORDER BY ${options.orderBy}`;
            if (options.limit) query += ` LIMIT ${options.limit}`;
            if (options.offset) query += ` OFFSET ${options.offset}`;

            return db.query(query, params);
        },

        // INSERT with auto tenant_id
        insert: async (table, data) => {
            const dataWithTenant = { ...data, tenant_id: tenantId };
            const keys = Object.keys(dataWithTenant);
            const values = Object.values(dataWithTenant);
            const placeholders = keys.map((_, i) => `$${i + 1}`);

            const query = `
        INSERT INTO ${table} (${keys.join(', ')})
        VALUES (${placeholders.join(', ')})
        RETURNING *
      `;

            return db.query(query, values);
        },

        // UPDATE with auto tenant filter
        update: async (table, data, where) => {
            const setClauses = [];
            const conditions = ['tenant_id = $1'];
            const params = [tenantId];
            let paramIndex = 2;

            Object.entries(data).forEach(([key, value]) => {
                setClauses.push(`${key} = $${paramIndex}`);
                params.push(value);
                paramIndex++;
            });

            Object.entries(where).forEach(([key, value]) => {
                conditions.push(`${key} = $${paramIndex}`);
                params.push(value);
                paramIndex++;
            });

            const query = `
        UPDATE ${table}
        SET ${setClauses.join(', ')}, updated_at = NOW()
        WHERE ${conditions.join(' AND ')}
        RETURNING *
      `;

            return db.query(query, params);
        },

        // DELETE with auto tenant filter
        delete: async (table, where) => {
            const conditions = ['tenant_id = $1'];
            const params = [tenantId];
            let paramIndex = 2;

            Object.entries(where).forEach(([key, value]) => {
                conditions.push(`${key} = $${paramIndex}`);
                params.push(value);
                paramIndex++;
            });

            const query = `DELETE FROM ${table} WHERE ${conditions.join(' AND ')} RETURNING id`;

            return db.query(query, params);
        },
    };
}

// ============================================
// EXPORTS
// ============================================

module.exports = {
    // Middleware
    tenantMiddleware,
    requireTenant,

    // Lookup functions
    getTenantById,
    getTenantBySlug,
    extractTenantFromHost,
    extractTenantFromCustomDomain,

    // Query helpers
    withTenant,
    createTenantQuery,

    // Constants
    TENANT_HEADER,
};

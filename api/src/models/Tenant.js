const { query } = require('../db');

// ============ Tenant Model ============

const Tenant = {
    // Find by ID
    async findById(id) {
        const result = await query(
            `SELECT * FROM tenants WHERE id = $1`,
            [id]
        );
        return result.rows[0];
    },

    // Find by subdomain
    async findBySubdomain(subdomain) {
        const result = await query(
            `SELECT * FROM tenants WHERE subdomain = $1`,
            [subdomain]
        );
        return result.rows[0];
    },

    // Get all tenants (for super admin)
    async findAll({ status, limit = 50, offset = 0 } = {}) {
        let sql = `SELECT * FROM tenants`;
        const params = [];

        if (status) {
            sql += ` WHERE status = $1`;
            params.push(status);
        }

        sql += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(limit, offset);

        const result = await query(sql, params);
        return result.rows;
    },

    // Create tenant
    async create(data) {
        const result = await query(
            `INSERT INTO tenants (name, subdomain, slug, business_type, plan, status, primary_color, secondary_color, logo_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
            [data.name, data.subdomain, data.subdomain, data.business_type || 'ecommerce', data.plan || 'free', 'active', data.primary_color || '#DC2626', data.secondary_color || '#F59E0B', data.logo_url]
        );
        return result.rows[0];
    },

    // Update tenant
    async update(id, data) {
        const result = await query(
            `UPDATE tenants SET name = $2, primary_color = $3, secondary_color = $4, logo_url = $5, updated_at = NOW()
       WHERE id = $1 RETURNING *`,
            [id, data.name, data.primary_color, data.secondary_color, data.logo_url]
        );
        return result.rows[0];
    },

    // Update status
    async updateStatus(id, status) {
        const result = await query(
            `UPDATE tenants SET status = $2, updated_at = NOW() WHERE id = $1 RETURNING *`,
            [id, status]
        );
        return result.rows[0];
    },

    // Update plan
    async updatePlan(id, plan) {
        const result = await query(
            `UPDATE tenants SET plan = $2, updated_at = NOW() WHERE id = $1 RETURNING *`,
            [id, plan]
        );
        return result.rows[0];
    },

    // Count tenants
    async count(filters = {}) {
        let sql = `SELECT COUNT(*) FROM tenants`;
        const params = [];

        if (filters.status) {
            sql += ` WHERE status = $1`;
            params.push(filters.status);
        }

        const result = await query(sql, params);
        return parseInt(result.rows[0].count);
    },

    // Get tenant stats (for super admin)
    async getStats() {
        const result = await query(`
      SELECT 
        COUNT(*) as total_tenants,
        COUNT(*) FILTER (WHERE status = 'active') as active_tenants,
        COUNT(*) FILTER (WHERE plan = 'free') as free_plan,
        COUNT(*) FILTER (WHERE plan = 'pro') as pro_plan,
        COUNT(*) FILTER (WHERE plan = 'enterprise') as enterprise_plan,
        COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as new_this_month
      FROM tenants
    `);
        return result.rows[0];
    }
};

module.exports = Tenant;

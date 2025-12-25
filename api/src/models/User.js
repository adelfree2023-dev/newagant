const { query } = require('../db');
const bcrypt = require('bcryptjs');

// ============ User Model ============

const User = {
    // Find by email
    async findByEmail(email) {
        const result = await query(
            `SELECT * FROM users WHERE email = $1`,
            [email]
        );
        return result.rows[0];
    },

    // Find by ID
    async findById(id) {
        const result = await query(
            `SELECT id, tenant_id, email, name, phone, role, avatar_url, created_at FROM users WHERE id = $1`,
            [id]
        );
        return result.rows[0];
    },

    // Find all users for tenant
    async findByTenant(tenant_id, { role, limit = 50, offset = 0 } = {}) {
        let sql = `SELECT id, email, name, phone, role, avatar_url, created_at FROM users WHERE tenant_id = $1`;
        const params = [tenant_id];

        if (role) {
            sql += ` AND role = $2`;
            params.push(role);
        }

        sql += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(limit, offset);

        const result = await query(sql, params);
        return result.rows;
    },

    // Create user with hashed password
    async create(data) {
        const hashedPassword = await bcrypt.hash(data.password, 10);

        const result = await query(
            `INSERT INTO users (tenant_id, email, password_hash, name, phone, role)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, tenant_id, email, name, phone, role, created_at`,
            [data.tenant_id, data.email, hashedPassword, data.name, data.phone, data.role || 'customer']
        );
        return result.rows[0];
    },

    // Verify password
    async verifyPassword(user, password) {
        return bcrypt.compare(password, user.password_hash);
    },

    // Update user
    async update(id, data) {
        const result = await query(
            `UPDATE users SET name = $2, phone = $3, avatar_url = $4, updated_at = NOW()
       WHERE id = $1 RETURNING id, email, name, phone, role, avatar_url`,
            [id, data.name, data.phone, data.avatar_url]
        );
        return result.rows[0];
    },

    // Update password
    async updatePassword(id, newPassword) {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await query(
            `UPDATE users SET password_hash = $2, updated_at = NOW() WHERE id = $1`,
            [id, hashedPassword]
        );
        return true;
    },

    // Count users
    async count(tenant_id) {
        const result = await query(
            `SELECT COUNT(*) FROM users WHERE tenant_id = $1`,
            [tenant_id]
        );
        return parseInt(result.rows[0].count);
    },

    // Count customers (for store)
    async countCustomers(tenant_id) {
        const result = await query(
            `SELECT COUNT(*) FROM users WHERE tenant_id = $1 AND role = 'customer'`,
            [tenant_id]
        );
        return parseInt(result.rows[0].count);
    }
};

module.exports = User;

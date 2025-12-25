const { query } = require('../db');

// ============ Product Model ============

const Product = {
    // Get all products with filters
    async findAll({ category, featured, badge, search, limit = 20, offset = 0, tenant_id }) {
        let sql = `
      SELECT p.*, c.name_ar as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.tenant_id = $1
    `;
        const params = [tenant_id];
        let paramIndex = 2;

        if (category) {
            sql += ` AND (p.category_id = $${paramIndex} OR c.slug = $${paramIndex})`;
            params.push(category);
            paramIndex++;
        }

        if (featured === 'true') {
            sql += ` AND p.is_featured = true`;
        }

        if (badge) {
            sql += ` AND p.badge = $${paramIndex}`;
            params.push(badge);
            paramIndex++;
        }

        if (search) {
            sql += ` AND (p.name ILIKE $${paramIndex} OR p.name_ar ILIKE $${paramIndex} OR p.description ILIKE $${paramIndex})`;
            params.push(`%${search}%`);
            paramIndex++;
        }

        sql += ` ORDER BY p.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        params.push(limit, offset);

        const result = await query(sql, params);
        return result.rows;
    },

    // Get single product by ID or slug
    async findById(id, tenant_id) {
        const result = await query(
            `SELECT p.*, c.name_ar as category_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE (p.id = $1 OR p.slug = $1) AND p.tenant_id = $2`,
            [id, tenant_id]
        );
        return result.rows[0];
    },

    // Get featured products
    async findFeatured(tenant_id, limit = 8) {
        const result = await query(
            `SELECT * FROM products WHERE tenant_id = $1 AND is_featured = true ORDER BY created_at DESC LIMIT $2`,
            [tenant_id, limit]
        );
        return result.rows;
    },

    // Get products by badge
    async findByBadge(tenant_id, badge, limit = 4) {
        const result = await query(
            `SELECT * FROM products WHERE tenant_id = $1 AND badge = $2 ORDER BY created_at DESC LIMIT $3`,
            [tenant_id, badge, limit]
        );
        return result.rows;
    },

    // Create product
    async create(data) {
        const result = await query(
            `INSERT INTO products (tenant_id, name, name_ar, slug, price, compare_price, cost_price, description, description_ar, images, category_id, badge, stock, is_featured)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       RETURNING *`,
            [data.tenant_id, data.name, data.name_ar, data.slug, data.price, data.compare_price, data.cost_price, data.description, data.description_ar, JSON.stringify(data.images), data.category_id, data.badge, data.stock, data.is_featured]
        );
        return result.rows[0];
    },

    // Update product
    async update(id, tenant_id, data) {
        const result = await query(
            `UPDATE products SET name = $3, name_ar = $4, price = $5, compare_price = $6, description = $7, description_ar = $8, images = $9, category_id = $10, badge = $11, stock = $12, is_featured = $13, updated_at = NOW()
       WHERE id = $1 AND tenant_id = $2 RETURNING *`,
            [id, tenant_id, data.name, data.name_ar, data.price, data.compare_price, data.description, data.description_ar, JSON.stringify(data.images), data.category_id, data.badge, data.stock, data.is_featured]
        );
        return result.rows[0];
    },

    // Delete product
    async delete(id, tenant_id) {
        const result = await query(
            `DELETE FROM products WHERE id = $1 AND tenant_id = $2 RETURNING id`,
            [id, tenant_id]
        );
        return result.rowCount > 0;
    },

    // Count products
    async count(tenant_id, filters = {}) {
        let sql = `SELECT COUNT(*) FROM products WHERE tenant_id = $1`;
        const params = [tenant_id];

        if (filters.category) {
            sql += ` AND category_id = $2`;
            params.push(filters.category);
        }

        const result = await query(sql, params);
        return parseInt(result.rows[0].count);
    }
};

module.exports = Product;

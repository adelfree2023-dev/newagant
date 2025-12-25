const { query } = require('../db');

// ============ Category Model ============

const Category = {
    // Get all categories
    async findAll(tenant_id) {
        const result = await query(
            `SELECT c.*, 
        (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id AND p.tenant_id = c.tenant_id) as products_count
       FROM categories c 
       WHERE c.tenant_id = $1 
       ORDER BY c.sort_order, c.name_ar`,
            [tenant_id]
        );
        return result.rows;
    },

    // Get single category
    async findById(id, tenant_id) {
        const result = await query(
            `SELECT * FROM categories WHERE (id = $1 OR slug = $1) AND tenant_id = $2`,
            [id, tenant_id]
        );
        return result.rows[0];
    },

    // Get category with products
    async findWithProducts(slug, tenant_id) {
        const category = await this.findById(slug, tenant_id);
        if (!category) return null;

        const products = await query(
            `SELECT * FROM products WHERE category_id = $1 AND tenant_id = $2 ORDER BY created_at DESC`,
            [category.id, tenant_id]
        );

        return { ...category, products: products.rows };
    },

    // Create category
    async create(data) {
        const result = await query(
            `INSERT INTO categories (tenant_id, name, name_ar, slug, icon, color, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
            [data.tenant_id, data.name, data.name_ar, data.slug, data.icon, data.color, data.sort_order || 0]
        );
        return result.rows[0];
    },

    // Update category
    async update(id, tenant_id, data) {
        const result = await query(
            `UPDATE categories SET name = $3, name_ar = $4, slug = $5, icon = $6, color = $7, sort_order = $8, updated_at = NOW()
       WHERE id = $1 AND tenant_id = $2 RETURNING *`,
            [id, tenant_id, data.name, data.name_ar, data.slug, data.icon, data.color, data.sort_order]
        );
        return result.rows[0];
    },

    // Delete category
    async delete(id, tenant_id) {
        const result = await query(
            `DELETE FROM categories WHERE id = $1 AND tenant_id = $2 RETURNING id`,
            [id, tenant_id]
        );
        return result.rowCount > 0;
    }
};

module.exports = Category;

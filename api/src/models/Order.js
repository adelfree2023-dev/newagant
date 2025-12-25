const { query, transaction } = require('../db');

// ============ Order Model ============

const Order = {
    // Find all orders for tenant
    async findAll(tenant_id, { status, limit = 50, offset = 0 } = {}) {
        let sql = `
      SELECT o.*, u.name as customer_name, u.email as customer_email
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      WHERE o.tenant_id = $1
    `;
        const params = [tenant_id];

        if (status) {
            sql += ` AND o.status = $2`;
            params.push(status);
        }

        sql += ` ORDER BY o.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(limit, offset);

        const result = await query(sql, params);
        return result.rows;
    },

    // Find user orders
    async findByUser(user_id, { limit = 20, offset = 0 } = {}) {
        const result = await query(
            `SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
            [user_id, limit, offset]
        );
        return result.rows;
    },

    // Find single order with items
    async findById(id, tenant_id) {
        const order = await query(
            `SELECT o.*, u.name as customer_name, u.email as customer_email, u.phone as customer_phone
       FROM orders o
       LEFT JOIN users u ON o.user_id = u.id
       WHERE o.id = $1 AND o.tenant_id = $2`,
            [id, tenant_id]
        );

        if (!order.rows[0]) return null;

        const items = await query(
            `SELECT oi.*, p.name, p.name_ar, p.images
       FROM order_items oi
       LEFT JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = $1`,
            [id]
        );

        return { ...order.rows[0], items: items.rows };
    },

    // Create order with items
    async create(data) {
        return transaction(async (client) => {
            // Generate order number
            const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}`;

            // Create order
            const orderResult = await client.query(
                `INSERT INTO orders (tenant_id, user_id, order_number, status, subtotal, shipping_cost, discount, total, payment_method, shipping_address, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         RETURNING *`,
                [data.tenant_id, data.user_id, orderNumber, 'pending', data.subtotal, data.shipping_cost || 0, data.discount || 0, data.total, data.payment_method, JSON.stringify(data.shipping_address), data.notes]
            );

            const order = orderResult.rows[0];

            // Create order items
            for (const item of data.items) {
                await client.query(
                    `INSERT INTO order_items (order_id, product_id, quantity, price, total)
           VALUES ($1, $2, $3, $4, $5)`,
                    [order.id, item.product_id, item.quantity, item.price, item.quantity * item.price]
                );

                // Update product stock
                await client.query(
                    `UPDATE products SET stock = stock - $1 WHERE id = $2`,
                    [item.quantity, item.product_id]
                );
            }

            return order;
        });
    },

    // Update order status
    async updateStatus(id, tenant_id, status) {
        const result = await query(
            `UPDATE orders SET status = $3, updated_at = NOW() WHERE id = $1 AND tenant_id = $2 RETURNING *`,
            [id, tenant_id, status]
        );
        return result.rows[0];
    },

    // Get order stats
    async getStats(tenant_id) {
        const result = await query(
            `SELECT 
        COUNT(*) as total_orders,
        COUNT(*) FILTER (WHERE status = 'pending') as pending_orders,
        COUNT(*) FILTER (WHERE status = 'processing') as processing_orders,
        COUNT(*) FILTER (WHERE status = 'shipped') as shipped_orders,
        COUNT(*) FILTER (WHERE status = 'delivered') as delivered_orders,
        COALESCE(SUM(total), 0) as total_revenue,
        COALESCE(SUM(total) FILTER (WHERE created_at >= CURRENT_DATE), 0) as today_revenue,
        COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE) as today_orders
       FROM orders WHERE tenant_id = $1`,
            [tenant_id]
        );
        return result.rows[0];
    },

    // Count orders
    async count(tenant_id, filters = {}) {
        let sql = `SELECT COUNT(*) FROM orders WHERE tenant_id = $1`;
        const params = [tenant_id];

        if (filters.status) {
            sql += ` AND status = $2`;
            params.push(filters.status);
        }

        const result = await query(sql, params);
        return parseInt(result.rows[0].count);
    }
};

module.exports = Order;

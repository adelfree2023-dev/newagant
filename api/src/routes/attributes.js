// ... (Existing Routes)

// POST /api/attributes/product/:productId - Update Product Attributes
router.post('/product/:productId', authenticate, requireAdmin, async (req, res) => {
    const { productId } = req.params;
    const { attributes } = req.body; // { attrId: value, attrId2: value }

    try {
        await query('BEGIN');

        for (const [attrId, value] of Object.entries(attributes)) {
            if (!value) {
                // Remove if empty
                await query(
                    'DELETE FROM product_attributes WHERE product_id = $1 AND attribute_id = $2',
                    [productId, attrId]
                );
            } else {
                // Upsert
                await query(
                    `INSERT INTO product_attributes (product_id, attribute_id, value)
                     VALUES ($1, $2, $3)
                     ON CONFLICT (product_id, attribute_id) 
                     DO UPDATE SET value = $3, created_at = NOW()`,
                    [productId, attrId, value]
                );
            }
        }

        await query('COMMIT');
        res.json({ success: true, message: 'Attributes updated' });
    } catch (error) {
        await query('ROLLBACK');
        console.error(error);
        res.status(500).json({ success: false, error: 'Update failed' });
    }
});

module.exports = router;

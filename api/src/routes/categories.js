const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const { extractTenant } = require('../middleware/tenant');
const { authenticate, requireAdmin } = require('../middleware/auth');

router.use(extractTenant);

// GET /api/categories
router.get('/', async (req, res) => {
    try {
        const categories = await Category.findAll(req.tenant_id);
        res.json({ success: true, data: categories });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to get categories' });
    }
});

// GET /api/categories/:slug
router.get('/:slug', async (req, res) => {
    try {
        const category = await Category.findWithProducts(req.params.slug, req.tenant_id);
        if (!category) return res.status(404).json({ success: false, error: 'Category not found' });
        res.json({ success: true, data: category });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to get category' });
    }
});

// POST /api/categories (admin)
router.post('/', authenticate, requireAdmin, async (req, res) => {
    try {
        const category = await Category.create({ tenant_id: req.tenant_id, ...req.body });
        res.status(201).json({ success: true, data: category });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to create category' });
    }
});

// PUT /api/categories/:id (admin)
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
    try {
        const category = await Category.update(req.params.id, req.tenant_id, req.body);
        if (!category) return res.status(404).json({ success: false, error: 'Category not found' });
        res.json({ success: true, data: category });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to update category' });
    }
});

// DELETE /api/categories/:id (admin)
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
    try {
        const deleted = await Category.delete(req.params.id, req.tenant_id);
        if (!deleted) return res.status(404).json({ success: false, error: 'Category not found' });
        res.json({ success: true, message: 'Category deleted' });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to delete category' });
    }
});

module.exports = router;

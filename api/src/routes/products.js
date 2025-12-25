const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { extractTenant } = require('../middleware/tenant');
const { authenticate, requireAdmin } = require('../middleware/auth');

// Apply tenant middleware
router.use(extractTenant);

// ============ Public Routes ============

// GET /api/products - List products
router.get('/', async (req, res) => {
  try {
    const { category, featured, badge, search, limit = 20, page = 1 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const products = await Product.findAll({
      tenant_id: req.tenant_id,
      category, featured, badge, search,
      limit: parseInt(limit),
      offset
    });

    const total = await Product.count(req.tenant_id, { category });

    res.json({
      success: true,
      data: products,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ success: false, error: 'Failed to get products' });
  }
});

// GET /api/products/featured
router.get('/featured', async (req, res) => {
  try {
    const products = await Product.findFeatured(req.tenant_id, 8);
    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to get featured products' });
  }
});

// GET /api/products/flash-deals
router.get('/flash-deals', async (req, res) => {
  try {
    const products = await Product.findByBadge(req.tenant_id, 'sale', 4);
    res.json({ success: true, data: products, ends_at: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString() });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to get flash deals' });
  }
});

// GET /api/products/new-arrivals
router.get('/new-arrivals', async (req, res) => {
  try {
    const products = await Product.findByBadge(req.tenant_id, 'new', 4);
    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to get new arrivals' });
  }
});

// GET /api/products/best-sellers
router.get('/best-sellers', async (req, res) => {
  try {
    const products = await Product.findByBadge(req.tenant_id, 'hot', 4);
    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to get best sellers' });
  }
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id, req.tenant_id);
    if (!product) return res.status(404).json({ success: false, error: 'Product not found' });
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to get product' });
  }
});

// ============ Admin Routes ============

// POST /api/products
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const product = await Product.create({ tenant_id: req.tenant_id, ...req.body });
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create product' });
  }
});

// PUT /api/products/:id
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const product = await Product.update(req.params.id, req.tenant_id, req.body);
    if (!product) return res.status(404).json({ success: false, error: 'Product not found' });
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update product' });
  }
});

// DELETE /api/products/:id
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const deleted = await Product.delete(req.params.id, req.tenant_id);
    if (!deleted) return res.status(404).json({ success: false, error: 'Product not found' });
    res.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete product' });
  }
});

module.exports = router;

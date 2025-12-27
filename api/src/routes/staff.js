const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { query } = require('../db');
const { tenantMiddleware } = require('../middleware/tenant');
const { authenticate, requireAdmin } = require('../middleware/auth');

router.use(tenantMiddleware);
router.use(authenticate);
router.use(requireAdmin);

// GET /api/staff - List all staff members
router.get('/', async (req, res) => {
    try {
        const result = await query(
            `SELECT id, email, first_name, last_name, phone, role, created_at 
             FROM users 
             WHERE tenant_id = $1 AND role IN ('admin', 'cashier')
             ORDER BY created_at DESC`,
            [req.tenant_id]
        );
        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error('List staff error:', error);
        res.status(500).json({ success: false, error: 'Failed to list staff' });
    }
});

// POST /api/staff - Create new staff member
router.post('/', async (req, res) => {
    try {
        const { email, password, name, phone, role } = req.body;

        if (!email || !password || !name || !role) {
            return res.status(400).json({ success: false, error: 'All fields are required' });
        }

        if (!['admin', 'cashier'].includes(role)) {
            return res.status(400).json({ success: false, error: 'Invalid role' });
        }

        // Check availability
        const check = await query(
            'SELECT id FROM users WHERE email = $1 AND tenant_id = $2',
            [email, req.tenant_id]
        );
        if (check.rows.length > 0) {
            return res.status(400).json({ success: false, error: 'Email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const nameParts = name.trim().split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ') || '';

        const result = await query(
            `INSERT INTO users (tenant_id, email, password_hash, first_name, last_name, phone, role, user_type)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $7)
             RETURNING id, email, first_name, role`,
            [req.tenant_id, email, hashedPassword, firstName, lastName, phone, role]
        );

        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error('Create staff error:', error);
        res.status(500).json({ success: false, error: 'Failed to create staff member' });
    }
});

// DELETE /api/staff/:id - Remove staff
router.delete('/:id', async (req, res) => {
    try {
        // Prevent deleting self
        if (req.params.id === req.user.id) {
            return res.status(400).json({ success: false, error: 'Cannot delete yourself' });
        }

        await query(
            'DELETE FROM users WHERE id = $1 AND tenant_id = $2 AND role IN (\'admin\', \'cashier\')',
            [req.params.id, req.tenant_id]
        );

        res.json({ success: true, message: 'Staff member removed' });
    } catch (error) {
        console.error('Delete staff error:', error);
        res.status(500).json({ success: false, error: 'Failed to delete staff member' });
    }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');
const { transaction } = require('../db');

// POST /api/provision/store
// Create a new store (Tenant + Owner)
router.post('/store', async (req, res) => {
    const { store_name, subdomain, business_type, plan_slug, owner } = req.body;

    // Basic validation
    if (!store_name || !subdomain || !owner || !owner.email || !owner.password) {
        return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    try {
        const result = await transaction(async (client) => {
            // 1. Check if subdomain exists
            const existingTenant = await client.query(
                'SELECT id FROM tenants WHERE subdomain = $1',
                [subdomain]
            );

            if (existingTenant.rows.length > 0) {
                throw new Error('SUBDOMAIN_TAKEN');
            }

            // 2. Check if email exists
            const existingUser = await client.query(
                'SELECT id FROM users WHERE email = $1',
                [owner.email]
            );

            if (existingUser.rows.length > 0) {
                throw new Error('EMAIL_TAKEN');
            }

            // 3. Create Tenant
            const tenantRes = await client.query(
                `INSERT INTO tenants (name, subdomain, slug, business_type, plan, status, primary_color, secondary_color)
                 VALUES ($1, $2, $2, $3, $4, 'active', '#DC2626', '#F59E0B')
                 RETURNING *`,
                [store_name, subdomain, business_type, plan_slug || 'free']
            );
            const tenant = tenantRes.rows[0];

            // 4. Create Owner User
            const hashedPassword = await bcrypt.hash(owner.password, 10);
            const userRes = await client.query(
                `INSERT INTO users (tenant_id, email, password_hash, name, phone, role)
                 VALUES ($1, $2, $3, $4, $5, 'admin')
                 RETURNING id, email, name, role`,
                [tenant.id, owner.email, hashedPassword, owner.name, owner.phone]
            );
            const user = userRes.rows[0];

            return { tenant, user };
        });

        // Generate Token
        const token = jwt.sign(
            { id: result.user.id, role: result.user.role, tenantId: result.tenant.id },
            process.env.JWT_SECRET || 'secret_key_123',
            { expiresIn: '7d' }
        );

        // Success Response
        res.status(201).json({
            success: true,
            data: {
                tenant: result.tenant,
                user: result.user,
                token,
                urls: {
                    admin: `http://localhost:3002`, // In production: http://${subdomain}.admin.coreflex.io
                    store: `http://localhost:3001`  // In production: http://${subdomain}.coreflex.io
                }
            }
        });

    } catch (error) {
        console.error('Provisioning Error:', error);

        if (error.message === 'SUBDOMAIN_TAKEN') {
            return res.status(409).json({ success: false, error: 'اسم المتجر (الرابط) مستخدم بالفعل' });
        }
        if (error.message === 'EMAIL_TAKEN') {
            return res.status(409).json({ success: false, error: 'البريد الإلكتروني مسجل مسبقاً' });
        }

        res.status(500).json({ success: false, error: 'فشل إنشاء المتجر، حاول مرة أخرى' });
    }
});

// GET /api/provision/check-subdomain
router.get('/check-subdomain', async (req, res) => {
    const { subdomain } = req.query;
    if (!subdomain) return res.json({ available: false });

    try {
        const { query } = require('../db');
        const result = await query('SELECT id FROM tenants WHERE subdomain = $1', [subdomain]);
        res.json({ available: result.rows.length === 0 });
    } catch (error) {
        res.status(500).json({ available: false });
    }
});

module.exports = router;

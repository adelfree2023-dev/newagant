const Tenant = require('../models/Tenant');

// ============ Tenant Middleware ============

// Default demo tenant ID
const DEFAULT_TENANT_ID = '00000000-0000-0000-0000-000000000001';

// Extract tenant from request
const extractTenant = async (req, res, next) => {
    try {
        // 1. Check header first
        let tenantId = req.headers['x-tenant-id'];

        // 2. Check subdomain from host
        if (!tenantId) {
            const host = req.headers.host || '';
            const subdomain = host.split('.')[0];

            if (subdomain && subdomain !== 'localhost' && subdomain !== 'api') {
                const tenant = await Tenant.findBySubdomain(subdomain);
                if (tenant) {
                    tenantId = tenant.id;
                }
            }
        }

        // 3. Check query param
        if (!tenantId && req.query.tenant_id) {
            tenantId = req.query.tenant_id;
        }

        // 4. Get from authenticated user
        if (!tenantId && req.user?.tenant_id) {
            tenantId = req.user.tenant_id;
        }

        // 5. Use default tenant for demo
        if (!tenantId) {
            tenantId = DEFAULT_TENANT_ID;
        }

        req.tenant_id = tenantId;
        next();
    } catch (error) {
        console.error('Tenant extraction error:', error);
        req.tenant_id = DEFAULT_TENANT_ID;
        next();
    }
};

// Require valid tenant
const requireTenant = async (req, res, next) => {
    if (!req.tenant_id) {
        return res.status(400).json({ success: false, error: 'Tenant ID required' });
    }

    try {
        const tenant = await Tenant.findById(req.tenant_id);

        if (!tenant) {
            return res.status(404).json({ success: false, error: 'Tenant not found' });
        }

        if (tenant.status !== 'active') {
            return res.status(403).json({ success: false, error: 'Tenant is not active' });
        }

        req.tenant = tenant;
        next();
    } catch (error) {
        console.error('Require tenant error:', error);
        return res.status(500).json({ success: false, error: 'Internal error' });
    }
};

module.exports = {
    extractTenant,
    requireTenant,
    DEFAULT_TENANT_ID
};

import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Create Axios Instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor to inject Tenant Domain from window/environment if available
api.interceptors.request.use((config) => {
    // In client-side logic, we might need to pass the tenant ID or domain
    // extracted from the URL if not handled by a proxy.
    // However, since we are likely calling this from Server Components in Next.js,
    // we might need to pass headers explicitly in the caller.
    // For client-side calls:
    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        const tenantDomain = hostname.includes('localhost') ? 'demo' : hostname.split('.')[0];
        config.headers['x-tenant-custom-domain'] = hostname;
    }
    return config;
});

export const storeApi = {
    products: {
        list: async (params: any = {}) => {
            const res = await api.get('/products', { params });
            return res.data;
        },
        get: async (slug: string) => {
            const res = await api.get(`/products/${slug}`);
            return res.data;
        }
    },
    store: {
        config: async () => {
            // Fetch public store settings (name, colors, logo)
            // This endpoint might need to be created/verified in backend
            // For now assuming /api/store-config exists or similar public endpoint
            // We'll use a mock or generic endpoint if not.
            // It seems backend has `req.tenant` so any public route works.
            // Let's assume a basic check.
            try {
                const res = await api.get('/categories'); // Just a test public route for now
                return { success: true };
            } catch (e) {
                return { success: false };
            }
        }
    }
};

export default api;

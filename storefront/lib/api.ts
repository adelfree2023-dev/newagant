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

// Types
export interface Product {
    id: string;
    name: string;
    slug: string;
    price: number;
    images: string[];
}

export interface CartItem {
    id: string;
    product_id: string;
    quantity: number;
    product: Product;
}

export const storeApi = {
    products: {
        list: async (params: any = {}) => {
            const res = await api.get('/products', { params });
            return res.data;
        },
        getAll: async (params: any = {}) => { // Alias for backward compatibility if needed
            const res = await api.get('/products', { params });
            return res.data;
        },
        get: async (slug: string) => {
            const res = await api.get(`/products/${slug}`);
            return res.data;
        }
    },
    orders: {
        track: async (orderId: string) => {
            const res = await api.get(`/tracking/${orderId}`);
            return res.data;
        }
    },
    categories: {
        list: async () => {
            const res = await api.get('/categories');
            return res.data.categories;
        },
        getAll: async () => { // Alias
            const res = await api.get('/categories');
            return res.data.categories;
        }
    },
    pages: {
        get: async () => {
            try {
                const res = await api.get('/pages');
                return res.data.data;
            } catch (e) {
                return {};
            }
        },
        getBySlug: async (slug: string) => {
            try {
                const res = await api.get(`/pages/${slug}`);
                return res.data.data;
            } catch (e) {
                return null;
            }
        }
    },
    coupons: {
        validate: async (code: string, total: number) => {
            try {
                // Ensure backend has POST /api/coupons/validate
                const res = await api.post('/coupons/validate', { code, total });
                return res.data;
            } catch (e: any) {
                return { success: false, error: e.response?.data?.error || 'Invalid coupon' };
            }
        }
    },
    store: {
        config: async () => {
            try {
                const res = await api.get('/store/config');
                return res.data;
            } catch (e) {
                console.error('Failed to load store config', e);
                return null;
            }
        }
    }
};

export const cartApi = {
    get: async () => api.get('/cart'),
    add: async (productId: string, quantity: number) => api.post('/cart', { productId, quantity }),
    update: async (itemId: string, quantity: number) => api.put(`/cart/${itemId}`, { quantity }),
    remove: async (itemId: string) => api.delete(`/cart/${itemId}`),
    clear: async () => api.post('/cart/clear')
};

export default api;

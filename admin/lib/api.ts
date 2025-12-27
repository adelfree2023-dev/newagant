import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor: Add Token & Tenant ID
api.interceptors.request.use((config) => {
    // 1. Get Token from cookies (client-side) or storage
    // Note: For client components, we rely on the browser sending the HttpOnly cookie automatically.
    // However, if we need to send it manually:
    // const token = localStorage.getItem('token');
    // if (token) config.headers.Authorization = `Bearer ${token}`;

    return config;
});

// Response Interceptor: Handle 401 (Unauthorized)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Redirect to login if unauthorized
            if (typeof window !== 'undefined') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export const adminApi = {
    dashboard: {
        getStats: async () => {
            try {
                const res = await api.get('/admin/dashboard');
                return { data: res.data.data, error: null };
            } catch (err: any) {
                return { data: null, error: err.response?.data?.error || 'Failed to fetch stats' };
            }
        },
        getRecentOrders: async (limit = 5) => {
            try {
                const res = await api.get(`/admin/recent-orders?limit=${limit}`);
                return { data: res.data.data, error: null };
            } catch (err: any) {
                return { data: [], error: err.response?.data?.error || 'Failed to fetch orders' };
            }
        },
    },
    products: {
        list: () => api.get('/admin/products'),
        getAll: (params: any) => api.get('/admin/products', { params }), // Support filters
        create: (data: any) => api.post('/admin/products', data),
        update: (id: string, data: any) => api.put(`/admin/products/${id}`, data),
        delete: (id: string) => api.delete(`/admin/products/${id}`),
    },
    categories: {
        list: () => api.get('/categories'),
        get: (id: string) => api.get(`/categories/${id}`),
        create: (data: any) => api.post('/categories/admin', data),
        update: (id: string, data: any) => api.put(`/categories/admin/${id}`, data),
        delete: (id: string) => api.delete(`/categories/admin/${id}`),
    },
    pages: {
        list: () => api.get('/pages'),
        get: (id: string) => api.get(`/pages/id/${id}`),
        create: (data: any) => api.post('/pages', data),
        update: (id: string, data: any) => api.put(`/pages/${id}`, data),
        delete: (id: string) => api.delete(`/pages/${id}`),
    },
    settings: {
        get: () => api.get('/admin/store/config'),
        update: (data: any) => api.put('/admin/store/config', data),
    },
    staff: {
        list: async () => {
            const res = await api.get('/staff');
            return res.data;
        },
        create: async (data: any) => {
            const res = await api.post('/staff', data);
            return res.data;
        },
        delete: async (id: string) => {
            const res = await api.delete(`/staff/${id}`);
            return res.data;
        }
    }
};

export default api;

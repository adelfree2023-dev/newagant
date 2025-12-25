/**
 * CoreFlex Admin API Client
 * الإصدار: 2.1.0
 * 
 * ملف الـ Admin API - يجب وضعه في: admin/lib/api.ts
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://35.226.47.16:8000';

// Types
export interface DashboardStats {
    totalOrders: number;
    totalRevenue: number;
    totalCustomers: number;
    totalProducts: number;
    pendingOrders: number;
    todayOrders: number;
    todayRevenue: number;
}

export interface Order {
    id: string;
    order_number: string;
    customer: {
        id: string;
        name: string;
        email: string;
        phone: string;
    };
    items: OrderItem[];
    address: Address;
    status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    payment_method: 'cod' | 'card';
    payment_status: 'pending' | 'paid' | 'refunded';
    subtotal: number;
    shipping: number;
    discount: number;
    total: number;
    notes?: string;
    tracking_number?: string;
    created_at: string;
    updated_at: string;
}

export interface OrderItem {
    id: string;
    product_id: string;
    product_name: string;
    product_image?: string;
    quantity: number;
    price: number;
    total: number;
}

export interface Address {
    name: string;
    phone: string;
    address: string;
    city: string;
    postal_code?: string;
    country: string;
}

export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    compare_price?: number;
    cost?: number;
    sku?: string;
    barcode?: string;
    stock: number;
    track_stock: boolean;
    category_id: string;
    category_name?: string;
    images: string[];
    status: 'active' | 'draft' | 'archived';
    created_at: string;
    updated_at: string;
}

export interface Customer {
    id: string;
    name: string;
    email: string;
    phone: string;
    orders_count: number;
    total_spent: number;
    last_order_date?: string;
    status: 'active' | 'blocked';
    created_at: string;
}

// Helper function
async function adminApiCall<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<{ data?: T; error?: string }> {
    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            credentials: 'include',
        });

        const data = await response.json();

        if (!response.ok) {
            return { error: data.message || 'An error occurred' };
        }

        return { data };
    } catch (error) {
        return { error: 'Network error. Please try again.' };
    }
}

// ============================================
// DASHBOARD API
// ============================================
export const dashboardApi = {
    getStats: () => adminApiCall<DashboardStats>('/api/admin/dashboard/stats'),

    getRecentOrders: (limit = 10) =>
        adminApiCall<Order[]>(`/api/admin/dashboard/recent-orders?limit=${limit}`),

    getSalesChart: (period: 'week' | 'month' | 'year' = 'week') =>
        adminApiCall<{ labels: string[]; data: number[] }>(`/api/admin/dashboard/sales-chart?period=${period}`),

    getTopProducts: (limit = 5) =>
        adminApiCall<{ product: Product; sales: number; revenue: number }[]>(`/api/admin/dashboard/top-products?limit=${limit}`),
};

// ============================================
// ORDERS API
// ============================================
export const ordersApi = {
    getAll: (filters?: {
        status?: string;
        from_date?: string;
        to_date?: string;
        search?: string;
        page?: number;
        limit?: number;
    }) => {
        const params = new URLSearchParams();
        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value) params.append(key, String(value));
            });
        }
        return adminApiCall<{ orders: Order[]; total: number; page: number }>(
            `/api/admin/orders?${params.toString()}`
        );
    },

    getById: (id: string) => adminApiCall<Order>(`/api/admin/orders/${id}`),

    updateStatus: (id: string, status: string, note?: string) =>
        adminApiCall<Order>(`/api/admin/orders/${id}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status, note }),
        }),

    addNote: (id: string, note: string) =>
        adminApiCall<Order>(`/api/admin/orders/${id}/notes`, {
            method: 'POST',
            body: JSON.stringify({ note }),
        }),

    createShipment: (id: string, data: { provider: string; tracking_number?: string }) =>
        adminApiCall<{ tracking_number: string; tracking_url: string }>(`/api/admin/orders/${id}/ship`, {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    refund: (id: string, amount: number, reason: string) =>
        adminApiCall<Order>(`/api/admin/orders/${id}/refund`, {
            method: 'POST',
            body: JSON.stringify({ amount, reason }),
        }),

    export: (filters?: object) =>
        adminApiCall<{ url: string }>('/api/admin/orders/export', {
            method: 'POST',
            body: JSON.stringify(filters || {}),
        }),
};

// ============================================
// PRODUCTS API
// ============================================
export const productsApi = {
    getAll: (filters?: {
        category?: string;
        status?: string;
        search?: string;
        page?: number;
        limit?: number;
    }) => {
        const params = new URLSearchParams();
        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value) params.append(key, String(value));
            });
        }
        return adminApiCall<{ products: Product[]; total: number }>(
            `/api/admin/products?${params.toString()}`
        );
    },

    getById: (id: string) => adminApiCall<Product>(`/api/admin/products/${id}`),

    create: (product: Partial<Product>) =>
        adminApiCall<Product>('/api/admin/products', {
            method: 'POST',
            body: JSON.stringify(product),
        }),

    update: (id: string, product: Partial<Product>) =>
        adminApiCall<Product>(`/api/admin/products/${id}`, {
            method: 'PUT',
            body: JSON.stringify(product),
        }),

    delete: (id: string) =>
        adminApiCall<{ message: string }>(`/api/admin/products/${id}`, {
            method: 'DELETE',
        }),

    updateStock: (id: string, quantity: number, type: 'add' | 'set' | 'subtract') =>
        adminApiCall<Product>(`/api/admin/products/${id}/stock`, {
            method: 'PUT',
            body: JSON.stringify({ quantity, type }),
        }),

    bulkUpdate: (ids: string[], data: Partial<Product>) =>
        adminApiCall<{ updated: number }>('/api/admin/products/bulk', {
            method: 'PUT',
            body: JSON.stringify({ ids, data }),
        }),

    import: (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        return fetch(`${API_URL}/api/admin/products/import`, {
            method: 'POST',
            body: formData,
            credentials: 'include',
        }).then(res => res.json());
    },

    export: () => adminApiCall<{ url: string }>('/api/admin/products/export'),
};

// ============================================
// CUSTOMERS API
// ============================================
export const customersApi = {
    getAll: (filters?: { search?: string; status?: string; page?: number; limit?: number }) => {
        const params = new URLSearchParams();
        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value) params.append(key, String(value));
            });
        }
        return adminApiCall<{ customers: Customer[]; total: number }>(
            `/api/admin/customers?${params.toString()}`
        );
    },

    getById: (id: string) => adminApiCall<Customer>(`/api/admin/customers/${id}`),

    getOrders: (id: string) => adminApiCall<Order[]>(`/api/admin/customers/${id}/orders`),

    block: (id: string, reason: string) =>
        adminApiCall<Customer>(`/api/admin/customers/${id}/block`, {
            method: 'POST',
            body: JSON.stringify({ reason }),
        }),

    unblock: (id: string) =>
        adminApiCall<Customer>(`/api/admin/customers/${id}/unblock`, {
            method: 'POST',
        }),
};

// ============================================
// CATEGORIES API
// ============================================
export const categoriesApi = {
    getAll: () => adminApiCall<{ id: string; name: string; slug: string; products_count: number }[]>('/api/admin/categories'),

    create: (data: { name: string; slug?: string; image?: string }) =>
        adminApiCall('/api/admin/categories', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    update: (id: string, data: { name?: string; slug?: string; image?: string }) =>
        adminApiCall(`/api/admin/categories/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),

    delete: (id: string) =>
        adminApiCall(`/api/admin/categories/${id}`, { method: 'DELETE' }),
};

// ============================================
// SETTINGS API
// ============================================
export const settingsApi = {
    getStore: () => adminApiCall<{
        name: string;
        logo?: string;
        description?: string;
        currency: string;
        language: string;
    }>('/api/admin/settings/store'),

    updateStore: (data: object) =>
        adminApiCall('/api/admin/settings/store', {
            method: 'PUT',
            body: JSON.stringify(data),
        }),

    getShipping: () => adminApiCall('/api/admin/settings/shipping'),

    updateShipping: (data: object) =>
        adminApiCall('/api/admin/settings/shipping', {
            method: 'PUT',
            body: JSON.stringify(data),
        }),

    getPayment: () => adminApiCall('/api/admin/settings/payment'),

    updatePayment: (data: object) =>
        adminApiCall('/api/admin/settings/payment', {
            method: 'PUT',
            body: JSON.stringify(data),
        }),
};

// ============================================
// COMBINED EXPORT
// ============================================
export const adminApi = {
    dashboard: dashboardApi,
    orders: ordersApi,
    products: productsApi,
    customers: customersApi,
    categories: categoriesApi,
    settings: settingsApi,
};

export default adminApi;

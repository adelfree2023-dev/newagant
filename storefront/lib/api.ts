/**
 * CoreFlex API Client
 * الإصدار: 2.1.0
 * 
 * ملف الاتصال بالـ API - يجب وضعه في: storefront/lib/api.ts
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://35.226.47.16:8000';

// Types
export interface User {
    id: string;
    name: string;
    email: string;
    phone?: string;
    role: 'customer' | 'admin' | 'superadmin';
}

export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    compare_price?: number;
    images: string[];
    category_id: string;
    stock: number;
    sku?: string;
    slug: string;
    is_featured?: boolean;
}

export interface CartItem {
    id: string;
    product_id: string;
    product: Product;
    quantity: number;
}

export interface Order {
    id: string;
    user_id: string;
    status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
    total: number;
    items: OrderItem[];
    address: Address;
    created_at: string;
}

export interface OrderItem {
    product_id: string;
    product_name: string;
    quantity: number;
    price: number;
}

export interface Address {
    name: string;
    phone: string;
    address: string;
    city: string;
    postal_code?: string;
}

export interface Category {
    id: string;
    name: string;
    slug: string;
    image?: string;
    products_count?: number;
}

// API Response Types
interface ApiResponse<T> {
    data?: T;
    error?: string;
    message?: string;
}

// Helper function for API calls
async function apiCall<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<ApiResponse<T>> {
    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            credentials: 'include', // Important for cookies
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
// AUTH API
// ============================================
export const authApi = {
    /**
     * تسجيل مستخدم جديد
     */
    register: async (userData: {
        name: string;
        email: string;
        password: string;
        phone?: string;
    }) => {
        return apiCall<{ user: User; token: string }>('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData),
        });
    },

    /**
     * تسجيل الدخول
     */
    login: async (email: string, password: string) => {
        return apiCall<{ user: User; token: string }>('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
    },

    /**
     * تسجيل الخروج
     */
    logout: async () => {
        return apiCall<{ message: string }>('/api/auth/logout', {
            method: 'POST',
        });
    },

    /**
     * الحصول على بيانات المستخدم الحالي
     */
    getProfile: async () => {
        return apiCall<User>('/api/auth/profile');
    },

    /**
     * تحديث بيانات المستخدم
     */
    updateProfile: async (data: Partial<User>) => {
        return apiCall<User>('/api/auth/profile', {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    /**
     * تغيير كلمة المرور
     */
    changePassword: async (currentPassword: string, newPassword: string) => {
        return apiCall<{ message: string }>('/api/auth/password', {
            method: 'PUT',
            body: JSON.stringify({ currentPassword, newPassword }),
        });
    },
};

// ============================================
// PRODUCTS API
// ============================================
export const productsApi = {
    /**
     * الحصول على قائمة المنتجات
     */
    getAll: async (filters?: {
        category?: string;
        search?: string;
        page?: number;
        limit?: number;
        sort?: string;
        featured?: boolean;
    }) => {
        const params = new URLSearchParams();
        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value) params.append(key, String(value));
            });
        }
        const query = params.toString() ? `?${params.toString()}` : '';
        return apiCall<{ products: Product[]; total: number; page: number }>(
            `/api/products${query}`
        );
    },

    /**
     * الحصول على منتج واحد
     */
    getById: async (id: string) => {
        return apiCall<Product>(`/api/products/${id}`);
    },

    /**
     * البحث في المنتجات
     */
    search: async (query: string) => {
        return apiCall<Product[]>(`/api/products/search?q=${encodeURIComponent(query)}`);
    },
};

// ============================================
// CATEGORIES API
// ============================================
export const categoriesApi = {
    /**
     * الحصول على كل الفئات
     */
    getAll: async () => {
        return apiCall<Category[]>('/api/categories');
    },

    /**
     * الحصول على فئة واحدة مع منتجاتها
     */
    getBySlug: async (slug: string) => {
        return apiCall<{ category: Category; products: Product[] }>(
            `/api/categories/${slug}`
        );
    },
};

// ============================================
// CART API
// ============================================
export const cartApi = {
    /**
     * الحصول على السلة
     */
    get: async () => {
        return apiCall<{ items: CartItem[]; total: number }>('/api/cart');
    },

    /**
     * إضافة منتج للسلة
     */
    add: async (productId: string, quantity: number = 1) => {
        return apiCall<{ items: CartItem[]; total: number }>('/api/cart', {
            method: 'POST',
            body: JSON.stringify({ productId, quantity }),
        });
    },

    /**
     * تحديث كمية منتج في السلة
     */
    update: async (itemId: string, quantity: number) => {
        return apiCall<{ items: CartItem[]; total: number }>(`/api/cart/${itemId}`, {
            method: 'PUT',
            body: JSON.stringify({ quantity }),
        });
    },

    /**
     * حذف منتج من السلة
     */
    remove: async (itemId: string) => {
        return apiCall<{ items: CartItem[]; total: number }>(`/api/cart/${itemId}`, {
            method: 'DELETE',
        });
    },

    /**
     * تفريغ السلة
     */
    clear: async () => {
        return apiCall<{ message: string }>('/api/cart', {
            method: 'DELETE',
        });
    },
};

// ============================================
// ORDERS API
// ============================================
export const ordersApi = {
    /**
     * إنشاء طلب جديد
     */
    create: async (orderData: {
        items: { productId: string; quantity: number }[];
        address: Address;
        paymentMethod: 'cod' | 'card';
        couponCode?: string;
        notes?: string;
    }) => {
        return apiCall<Order>('/api/orders', {
            method: 'POST',
            body: JSON.stringify(orderData),
        });
    },

    /**
     * الحصول على طلبات المستخدم
     */
    getAll: async () => {
        return apiCall<Order[]>('/api/orders');
    },

    /**
     * الحصول على تفاصيل طلب
     */
    getById: async (id: string) => {
        return apiCall<Order>(`/api/orders/${id}`);
    },

    /**
     * إلغاء طلب
     */
    cancel: async (id: string) => {
        return apiCall<Order>(`/api/orders/${id}/cancel`, {
            method: 'POST',
        });
    },

    /**
     * تتبع الطلب
     */
    track: async (id: string) => {
        return apiCall<{
            status: string;
            tracking_number?: string;
            updates: { status: string; date: string; note?: string }[];
        }>(`/api/orders/${id}/track`);
    },
};

// ============================================
// ADDRESSES API
// ============================================
export const addressesApi = {
    /**
     * الحصول على عناوين المستخدم
     */
    getAll: async () => {
        return apiCall<Address[]>('/api/addresses');
    },

    /**
     * إضافة عنوان جديد
     */
    create: async (address: Address) => {
        return apiCall<Address>('/api/addresses', {
            method: 'POST',
            body: JSON.stringify(address),
        });
    },

    /**
     * تحديث عنوان
     */
    update: async (id: string, address: Partial<Address>) => {
        return apiCall<Address>(`/api/addresses/${id}`, {
            method: 'PUT',
            body: JSON.stringify(address),
        });
    },

    /**
     * حذف عنوان
     */
    delete: async (id: string) => {
        return apiCall<{ message: string }>(`/api/addresses/${id}`, {
            method: 'DELETE',
        });
    },
};

// ============================================
// WISHLIST API
// ============================================
export const wishlistApi = {
    /**
     * الحصول على قائمة الأمنيات
     */
    getAll: async () => {
        return apiCall<Product[]>('/api/wishlist');
    },

    /**
     * إضافة منتج للمفضلة
     */
    add: async (productId: string) => {
        return apiCall<{ message: string }>('/api/wishlist', {
            method: 'POST',
            body: JSON.stringify({ productId }),
        });
    },

    /**
     * إزالة من المفضلة
     */
    remove: async (productId: string) => {
        return apiCall<{ message: string }>(`/api/wishlist/${productId}`, {
            method: 'DELETE',
        });
    },
};

// ============================================
// COUPONS API
// ============================================
export const couponsApi = {
    /**
     * التحقق من كوبون
     */
    validate: async (code: string, cartTotal: number) => {
        return apiCall<{
            valid: boolean;
            discount: number;
            type: 'percentage' | 'fixed';
            message?: string;
        }>('/api/coupons/validate', {
            method: 'POST',
            body: JSON.stringify({ code, cartTotal }),
        });
    },
};

// ============================================
// COMBINED API EXPORT
// ============================================
export const api = {
    auth: authApi,
    products: productsApi,
    categories: categoriesApi,
    cart: cartApi,
    orders: ordersApi,
    addresses: addressesApi,
    wishlist: wishlistApi,
    coupons: couponsApi,
};

export default api;

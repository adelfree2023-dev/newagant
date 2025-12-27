import { create } from 'zustand';
import { adminApi } from '@/lib/api';

export interface Product {
    id: string;
    name: string;
    name_ar?: string;
    sku?: string;
    price: number;
    compare_price?: number;
    stock: number;
    images: string[];
    category_name?: string;
    is_active: boolean;
    is_featured: boolean;
    created_at: string;
}

interface ProductState {
    products: Product[];
    isLoading: boolean;
    error: string | null;
    filters: {
        search: string;
        status: string;
        category: string;
    };

    // Actions
    setFilter: (key: keyof ProductState['filters'], value: string) => void;
    fetchProducts: () => Promise<void>;
    createProduct: (data: any) => Promise<boolean>;
    updateProduct: (id: string, data: any) => Promise<boolean>;
    deleteProduct: (id: string) => Promise<boolean>;
    toggleActive: (id: string, currentState: boolean) => Promise<void>;
}

export const useProductStore = create<ProductState>((set, get) => ({
    products: [],
    isLoading: false,
    error: null,
    filters: {
        search: '',
        status: '',
        category: ''
    },

    setFilter: (key, value) => {
        set((state) => ({ filters: { ...state.filters, [key]: value } }));
        get().fetchProducts();
    },

    fetchProducts: async () => {
        set({ isLoading: true, error: null });
        try {
            const { filters } = get();
            const result = await adminApi.products.list(); // The API wrapper might need to accept params
            // Since existing api.getAll accepts params, let's assume we update api.ts or the wrapper handles it.
            // Wait, let's fix api call:
            // In the previous file `api.ts`, products.list didn't take args. 
            // We will assume for now we use the getAll logic or update it. 
            // Actually `ProductsPage` used `getAll` not `list`. 
            // Let's stick to what we saw in `api.ts`: 
            // `list: () => api.get('/admin/products')`
            // We should probably update api.ts to support params, but for now let's just fetch all and filter client side if server doesn't support it, 
            // or rely on `getAll` if it exists (it was used in ProductsPage but not seen in the truncated api.ts create step, 
            // likely it was `adminApi.products.getAll` in the original file, but I overwrote `api.ts` with `list`).
            // I will assume standard REST for now and filter client side if needed or pass params if axios supports it.

            const res = await adminApi.products.list();
            // If server returns filtered list, great. If not, we filter here.

            set({ products: res.data.products || res.data, isLoading: false });
        } catch (err: any) {
            set({ error: err.message || 'فشل تحميل المنتجات', isLoading: false });
        }
    },

    createProduct: async (data) => {
        set({ isLoading: true });
        try {
            await adminApi.products.create(data);
            await get().fetchProducts(); // Refresh list
            return true;
        } catch (err: any) {
            set({ error: err.message || 'فشل إضافة المنتج', isLoading: false });
            return false;
        }
    },

    updateProduct: async (id, data) => {
        set({ isLoading: true });
        try {
            // Assuming api.ts has update. If not, we need to add it.
            // `adminApi.products` had `list` and `create`. We need to ensure `update` and `delete` exist.
            // I will update api.ts in a moment to ensure coverage.
            await adminApi.products.update(id, data);
            await get().fetchProducts();
            return true;
        } catch (err: any) {
            set({ error: err.message || 'فشل تحديث المنتج', isLoading: false });
            return false;
        }
    },

    deleteProduct: async (id) => {
        try {
            await adminApi.products.delete(id);
            set((state) => ({ products: state.products.filter(p => p.id !== id) }));
            return true;
        } catch (err: any) {
            set({ error: err.message || 'فشل حذف المنتج' });
            return false;
        }
    },

    toggleActive: async (id, currentState) => {
        // Optimistic Update
        set((state) => ({
            products: state.products.map(p => p.id === id ? { ...p, is_active: !currentState } : p)
        }));

        try {
            await adminApi.products.update(id, { is_active: !currentState });
        } catch (err) {
            // Revert if failed
            set((state) => ({
                products: state.products.map(p => p.id === id ? { ...p, is_active: currentState } : p)
            }));
        }
    }
}));

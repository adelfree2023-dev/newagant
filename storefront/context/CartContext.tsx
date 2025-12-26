'use client';

/**
 * CoreFlex Cart Context
 * الإصدار: 2.1.0
 * 
 * سياق السلة - يجب وضعه في: storefront/context/CartContext.tsx
 */

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { cartApi, CartItem, Product } from '@/lib/api';

// Types
interface CartContextType {
    items: CartItem[];
    total: number;
    totalPrice: number;
    itemCount: number;
    loading: boolean;
    error: string | null;
    addToCart: (productOrId: string | { productId: string; quantity?: number; name?: string; price?: number; image?: string }, quantity?: number) => Promise<boolean>;
    updateQuantity: (itemId: string, quantity: number) => Promise<boolean>;
    removeFromCart: (itemId: string) => Promise<boolean>;
    clearCart: () => Promise<boolean>;
    isInCart: (productId: string) => boolean;
    getItemQuantity: (productId: string) => number;
    clearError: () => void;
}

// Create context
const CartContext = createContext<CartContextType | undefined>(undefined);

// Provider component
export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load cart on mount
    useEffect(() => {
        loadCart();
    }, []);

    const loadCart = async () => {
        try {
            setLoading(true);
            const response = await cartApi.get();
            if (response.data) {
                setItems(response.data.items || []);
            }
        } catch (err) {
            // Cart might be empty or user not logged in
            setItems([]);
        } finally {
            setLoading(false);
        }
    };

    const addToCart = useCallback(async (productOrId: string | { productId: string; quantity?: number }, quantity: number = 1): Promise<boolean> => {
        try {
            setError(null);

            const productId = typeof productOrId === 'string' ? productOrId : productOrId.productId;
            const qty = typeof productOrId === 'string' ? quantity : (productOrId.quantity || 1);

            const response = await cartApi.add(productId, qty);

            if (response.error) {
                setError(response.error);
                return false;
            }

            if (response.data) {
                setItems(response.data.items || []);
                return true;
            }

            return false;
        } catch (err) {
            setError('حدث خطأ أثناء الإضافة للسلة');
            return false;
        }
    }, []);

    const updateQuantity = useCallback(async (itemId: string, quantity: number): Promise<boolean> => {
        try {
            setError(null);

            if (quantity < 1) {
                return removeFromCart(itemId);
            }

            const response = await cartApi.update(itemId, quantity);

            if (response.error) {
                setError(response.error);
                return false;
            }

            if (response.data) {
                setItems(response.data.items || []);
                return true;
            }

            return false;
        } catch (err) {
            setError('حدث خطأ أثناء تحديث الكمية');
            return false;
        }
    }, []);

    const removeFromCart = useCallback(async (itemId: string): Promise<boolean> => {
        try {
            setError(null);

            const response = await cartApi.remove(itemId);

            if (response.error) {
                setError(response.error);
                return false;
            }

            if (response.data) {
                setItems(response.data.items || []);
                return true;
            }

            // Optimistic update
            setItems(prev => prev.filter(item => item.id !== itemId));
            return true;
        } catch (err) {
            setError('حدث خطأ أثناء الحذف من السلة');
            return false;
        }
    }, []);

    const clearCart = useCallback(async (): Promise<boolean> => {
        try {
            setError(null);

            const response = await cartApi.clear();

            if (response.error) {
                setError(response.error);
                return false;
            }

            setItems([]);
            return true;
        } catch (err) {
            setError('حدث خطأ أثناء تفريغ السلة');
            return false;
        }
    }, []);

    const isInCart = useCallback((productId: string): boolean => {
        return items.some(item => item.product_id === productId);
    }, [items]);

    const getItemQuantity = useCallback((productId: string): number => {
        const item = items.find(item => item.product_id === productId);
        return item ? item.quantity : 0;
    }, [items]);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    // Calculate totals
    const total = items.reduce((sum, item) => {
        const price = item.product?.price || 0;
        return sum + (price * item.quantity);
    }, 0);

    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    const value: CartContextType = {
        items,
        total,
        totalPrice: total,
        itemCount,
        loading,
        error,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        isInCart,
        getItemQuantity,
        clearError,
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
}

// Hook to use cart context
export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}

// Cart Icon component with badge
export function CartBadge({ className = '' }: { className?: string }) {
    const { itemCount } = useCart();

    if (itemCount === 0) return null;

    return (
        <span className={`absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center ${className}`}>
            {itemCount > 99 ? '99+' : itemCount}
        </span>
    );
}

export default CartContext;

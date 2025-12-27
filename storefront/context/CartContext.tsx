'use client';

/**
 * CoreFlex Cart Context
 * الإصدار: 2.1.0
 * 
 * سياق السلة - يجب وضعه في: storefront/context/CartContext.tsx
 */

import { useEffect } from 'react';
import { useCartStore } from '@/lib/cartStore';

// Adapter to keep the same API signature for existing components
export function useCart() {
    const store = useCartStore();

    // Load cart on mount if empty (or could rely on persist)
    useEffect(() => {
        if (store.items.length === 0) {
            store.fetchCart();
        }
    }, []);

    return {
        items: store.items,
        total: store.totalPrice(),
        totalPrice: store.totalPrice(),
        itemCount: store.itemCount(),
        loading: store.loading,
        error: store.error,
        addToCart: store.addToCart,
        updateQuantity: store.updateQuantity,
        removeFromCart: store.removeFromCart,
        clearCart: store.clearCart,
        isInCart: (id: string) => store.items.some(i => i.product_id === id),
        getItemQuantity: (id: string) => store.items.find(i => i.product_id === id)?.quantity || 0,
        clearError: () => { }, // No-op or imp if needed
    };
}

// Keep Provider for backward compatibility if it wraps anything else, but now it's just a shell or can be removed if we remove it from Providers.tsx
// Let's keep a dummy provider to avoid breaking Providers.tsx immediately
export function CartProvider({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}

export default useCart;


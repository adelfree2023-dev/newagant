'use client';

/**
 * CoreFlex Providers Wrapper
 * الإصدار: 2.1.0
 * 
 * ملف الـ Providers - يجب وضعه في: storefront/components/Providers.tsx
 * ثم استخدامه في layout.tsx
 */

import { ReactNode } from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { StoreConfigProvider } from '@/context/StoreConfigContext';

interface ProvidersProps {
    children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
    return (
        <StoreConfigProvider>
            <AuthProvider>
                <CartProvider>
                    {children}
                </CartProvider>
            </AuthProvider>
        </StoreConfigProvider>
    );
}

export default Providers;

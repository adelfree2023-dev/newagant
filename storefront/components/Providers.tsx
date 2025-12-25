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

interface ProvidersProps {
    children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
    return (
        <AuthProvider>
            <CartProvider>
                {children}
            </CartProvider>
        </AuthProvider>
    );
}

export default Providers;

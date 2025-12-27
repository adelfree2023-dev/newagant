'use client';

import dynamic from 'next/dynamic';
import { useStoreConfig } from '@/context/StoreConfigContext';

// Theme Registry
const THEMES: Record<string, any> = {
    modern: {
        Header: dynamic(() => import('@/components/themes/modern/Header')),
        Footer: dynamic(() => import('@/components/themes/modern/Footer')),
        Hero: dynamic(() => import('@/components/themes/modern/Hero')),
        ProductCard: dynamic(() => import('@/components/themes/modern/ProductCard')),
    },
    classic: {
        Header: dynamic(() => import('@/components/themes/classic/Header')),
        Footer: dynamic(() => import('@/components/themes/classic/Footer')),
        Hero: dynamic(() => import('@/components/themes/classic/Hero')),
        ProductCard: dynamic(() => import('@/components/themes/classic/ProductCard')),
    }
};

export function getThemeComponent(componentName: string) {
    return function ThemeWrapper(props: any) {
        const { config } = useStoreConfig();
        const themeId = config?.theme_id || 'modern';

        // 1. Try to get component from selected theme
        let Component = THEMES[themeId]?.[componentName];

        // 2. Fallback to 'modern' if not found in selected theme
        if (!Component) {
            Component = THEMES['modern'][componentName];
        }

        // 3. Fallback to null if absolutely nothing found (shouldn't happen)
        if (!Component) return null;

        return <Component {...props} />;
    };
}

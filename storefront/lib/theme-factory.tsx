'use client';

import dynamic from 'next/dynamic';
import { useStoreConfig } from '@/context/StoreConfigContext';
import { Loader2 } from 'lucide-react';

// Loading Fallback
const LoadingComponent = () => <div className="p-4 flex justify-center"><Loader2 className="animate-spin w-6 h-6 text-gray-300" /></div>;

/**
 * Smart Theme Factory 🏭
 * Automatically loads components based on the active theme_id.
 * No manual registration required!
 * 
 * Works by telling Webpack to bundle all subdirectories in 'themes'.
 */
export function getThemeComponent(componentName: string) {
    return function ThemeWrapper(props: any) {
        const { config } = useStoreConfig();
        const themeId = config?.theme_id || 'modern';

        // 🪄 Magic: Dynamic Import with Template String
        // Webpack will bundle all files matching `@/components/themes/*/${componentName}`
        const Component = dynamic(
            () => import(`@/components/themes/${themeId}/${componentName}`)
                .catch(e => {
                    // 🛡️ Fallback: If theme is missing this component, use 'modern' version
                    console.warn(`Theme component not found: ${themeId}/${componentName}, using fallback.`);
                    return import(`@/components/themes/modern/${componentName}`);
                }),
            {
                loading: () => <LoadingComponent />,
                ssr: true // Enable Server Side Rendering for SEO
            }
        );

        return <Component {...props} />;
    };
}

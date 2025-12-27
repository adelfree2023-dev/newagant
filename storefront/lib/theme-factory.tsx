import dynamic from 'next/dynamic';
import { useStoreConfig } from '@/context/StoreConfigContext';
import { Loader2 } from 'lucide-react';
import { getThemeMetadata } from './theme-registry';

// Loading Fallback
const LoadingComponent = () => <div className="p-4 flex justify-center"><Loader2 className="animate-spin w-6 h-6 text-gray-300" /></div>;

/**
 * Matrix Theme Engine 🏭🚀
 * Loads specific component variants based on the theme configuration.
 * Avoids code duplication and enables mixing & matching.
 */
export function getThemeComponent(componentType: 'Header' | 'Footer' | 'ProductCard') {
    return function ThemeWrapper(props: any) {
        const { config: storeConfig } = useStoreConfig();
        // 1. Get current theme ID
        const themeId = storeConfig?.theme_id || 'modern';

        // 2. Look up the Matrix Config for this theme
        const themeMetadata = getThemeMetadata(themeId);

        // 3. Determine which variant to load (e.g. 'v1', 'v2')
        // Default to 'v1' if not specified
        const variant = themeMetadata.config[componentType.toLowerCase() as keyof typeof themeMetadata.config] || 'v1';

        // 4. Dynamic Import of the Variant
        // Mapping types to folders: Header -> headers, Footer -> footers
        const folderMap: Record<string, string> = {
            'Header': 'headers',
            'Footer': 'footers',
            'ProductCard': 'product-cards'
        };
        const folder = folderMap[componentType];

        const Component = dynamic(
            () => import(`@/components/themes/variants/${folder}/${componentType}${variant.toUpperCase()}`)
                .catch(err => {
                    console.error(`Matrix Error: Variant ${variant} for ${componentType} not found.`, err);
                    return () => <div className="p-2 text-red-500 text-xs">Error loading {componentType}</div>;
                }),
            {
                loading: () => <LoadingComponent />,
                ssr: true
            }
        );

        return <Component {...props} />;
    };
}

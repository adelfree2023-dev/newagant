'use client';

import { useStoreConfig } from '@/context/StoreConfigContext';

interface FeatureGuardProps {
    feature: string;
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

export default function FeatureGuard({ feature, children, fallback = null }: FeatureGuardProps) {
    const { config } = useStoreConfig();

    // Check if feature is enabled
    // support dot notation: 'modules.pos', 'storefront.footer'
    const isEnabled = () => {
        if (!config?.features) return true; // Default to true if no governance set

        const parts = feature.split('.');
        let current: any = config.features;

        for (const part of parts) {
            if (current[part] === false) return false;
            // If undefined, we assume enabled unless explicitly disabled
            if (current[part] === undefined) return true;
            current = current[part];
        }

        return true;
    };

    if (!isEnabled()) return <>{fallback}</>;

    return <>{children}</>;
}

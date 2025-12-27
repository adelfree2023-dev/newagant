'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { storeApi } from '@/lib/api';

interface LayoutConfig {
    top_bar?: {
        enabled: boolean;
        left_text?: string;
        right_text?: string;
    };
    features_bar?: {
        enabled: boolean;
        items: Array<{ icon: string; title: string; desc: string }>;
    };
    footer?: {
        description?: string;
        social?: { twitter?: string; instagram?: string; facebook?: string };
        payment_methods?: { [key: string]: boolean };
    };
}

interface StoreConfig {
    id: string;
    name: string;
    primary_color: string;
    secondary_color: string;
    settings?: {
        layout?: LayoutConfig;
        currency?: string;
        language?: string;
    };
    features?: Record<string, any>;
}

interface StoreConfigContextType {
    config: StoreConfig | null;
    loading: boolean;
}

const StoreConfigContext = createContext<StoreConfigContextType | undefined>(undefined);

export function StoreConfigProvider({ children }: { children: ReactNode }) {
    const [config, setConfig] = useState<StoreConfig | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadConfig() {
            try {
                const data = await storeApi.store.config();
                if (data) {
                    setConfig(data);

                    // Apply theme colors if available
                    if (data.primary_color) {
                        document.documentElement.style.setProperty('--primary-color', data.primary_color);
                        // Convert hex to logic for tailwind variable if needed, or mostly inline styles
                    }
                }
            } catch (error) {
                console.error('Error loading store config:', error);
            } finally {
                setLoading(false);
            }
        }
        loadConfig();
    }, []);

    return (
        <StoreConfigContext.Provider value={{ config, loading }}>
            {children}
        </StoreConfigContext.Provider>
    );
}

export function useStoreConfig() {
    const context = useContext(StoreConfigContext);
    if (context === undefined) {
        throw new Error('useStoreConfig must be used within a StoreConfigProvider');
    }
    return context;
}

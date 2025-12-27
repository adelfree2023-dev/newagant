'use client';

import { useStoreConfig } from '@/context/StoreConfigContext';
import * as LucideIcons from 'lucide-react';
import { motion } from 'framer-motion';

export default function FeaturesBar() {
    const { config } = useStoreConfig();
    const features = config?.settings?.layout?.features_bar;

    if (!features?.enabled || !features?.items?.length) return null;

    // Helper to get icon component dynamically
    const getIcon = (iconName: string) => {
        const Icon = (LucideIcons as any)[iconName] || LucideIcons.Star;
        return <Icon className="w-8 h-8 text-primary-500 mb-2" />;
    };

    return (
        <div className="w-full bg-white border-b border-gray-100 py-8">
            <div className="max-w-7xl mx-auto px-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                    {features.items.map((item, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="flex flex-col items-center hover:bg-gray-50 p-4 rounded-xl transition-colors"
                        >
                            {getIcon(item.icon)}
                            <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
                            <p className="text-sm text-gray-500">{item.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}

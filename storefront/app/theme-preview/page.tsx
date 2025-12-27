'use client';

import { useState } from 'react';
import { THEME_REGISTRY } from '@/lib/theme-registry';
import { getThemeComponent } from '@/lib/theme-factory';
import { StoreConfigProvider } from '@/context/StoreConfigContext';

export default function ThemePreviewPage() {
    const [selectedTheme, setSelectedTheme] = useState('modern');
    const activeTheme = THEME_REGISTRY.find(t => t.id === selectedTheme)!;

    // Use the Factory to get components (simulating the app)
    const Header = getThemeComponent('Header');
    // We would need Footer too but let's focus on Header

    // Mock Config for the Provider
    const mockConfig = {
        store_name: 'Matrix Preview Store',
        theme_id: selectedTheme,
        features: { user_account: true, pages: {} }
    };

    return (
        <StoreConfigProvider initialConfig={mockConfig}>
            <div className="min-h-screen bg-gray-50 pb-20">
                {/* Control Panel */}
                <div className="bg-white border-b p-6 shadow-sm sticky top-0 z-[100]">
                    <div className="container mx-auto flex flex-col md:flex-row gap-6 items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold mb-1">Theme Matrix Engine 🚀</h1>
                            <p className="text-gray-500 text-sm">Previewing: <span className="font-mono bg-blue-100 text-blue-800 px-2 py-0.5 rounded">{activeTheme.name}</span></p>
                        </div>

                        <div className="flex items-center gap-4 bg-gray-100 p-2 rounded-lg">
                            {THEME_REGISTRY.map(theme => (
                                <button
                                    key={theme.id}
                                    onClick={() => setSelectedTheme(theme.id)}
                                    className={`px-4 py-2 rounded-md font-medium text-sm transition-all ${selectedTheme === theme.id ? 'bg-white shadow text-primary-600' : 'text-gray-500 hover:text-gray-900'}`}
                                >
                                    {theme.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Matrix Debug Info */}
                    <div className="container mx-auto mt-4 pt-4 border-t flex gap-8 text-xs font-mono text-gray-400">
                        <div>Header Variant: {activeTheme.config.header}</div>
                        <div>Footer Variant: {activeTheme.config.footer}</div>
                        <div className={activeTheme.config.header === 'v1' ? 'text-green-600' : 'text-blue-600'}>
                            {activeTheme.config.header === 'v1' ? 'Loading HeaderV1.tsx' : 'Loading HeaderV2.tsx'}
                        </div>
                    </div>
                </div>

                {/* The Actual Theme Component */}
                <div className="border-[10px] border-dashed border-gray-200 m-8">
                    <Header />

                    <div className="h-64 bg-gray-100 flex items-center justify-center text-gray-400">
                        Content Area (Store Page)
                    </div>
                </div>
            </div>
        </StoreConfigProvider>
    );
}

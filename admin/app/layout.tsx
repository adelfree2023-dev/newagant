'use client';

/**
 * Admin Layout with Sidebar
 * تخطيط لوحة التحكم مع القائمة الجانبية
 * 
 * يجب وضعه في: admin/app/layout.tsx
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { adminApi } from '@/lib/api';
// Auth temporarily disabled - will be re-enabled in Phase 3
// import { AuthProvider, useAuth, ProtectedRoute } from '@/context/AuthContext';
import './globals.css';

// Feature mapping: Which feature controls which menu item?
// No mapping = always visible
const FEATURE_MAP: Record<string, string> = {
    '/orders': 'modules.orders', // Just an example, maybe orders is core?
    '/coupons': 'modules.coupons',
    '/settings': 'admin.settings',
    '/products': 'admin.products'
};

const defaultMenuItems = [
    { href: '/dashboard', icon: '📊', label: 'لوحة التحكم' },
    { href: '/orders', icon: '📦', label: 'الطلبات', badge: 'new' },
    { href: '/products', icon: '🛍️', label: 'المنتجات' },
    { href: '/categories', icon: '📁', label: 'الفئات' },
    { href: '/customers', icon: '👥', label: 'العملاء' },
    { href: '/coupons', icon: '🎟️', label: 'الكوبونات' },
    { href: '/analytics', icon: '📈', label: 'التحليلات' },
    { href: '/settings', icon: '⚙️', label: 'الإعدادات' },
];

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [features, setFeatures] = useState<Record<string, any>>({});
    const [loadingFeatures, setLoadingFeatures] = useState(true);
    const pathname = usePathname();

    useEffect(() => {
        // Load features from API
        adminApi.settings.get().then(res => {
            if (res.data && res.data.features) {
                setFeatures(res.data.features);
            }
            setLoadingFeatures(false);
        }).catch(() => setLoadingFeatures(false));
    }, []);

    // Helper to check if feature is enabled (dot notation)
    const isFeatureEnabled = (path?: string) => {
        if (!path) return true; // No restriction
        if (Object.keys(features).length === 0) return true; // Default to visible if no features loaded yet (or migration not run)

        const parts = path.split('.');
        let current = features;
        for (const part of parts) {
            if (current[part] === false) return false;
            if (current[part] === undefined) return true; // Default true if not defined
            current = current[part];
        }
        return true;
    };

    const visibleMenuItems = defaultMenuItems.filter(item =>
        isFeatureEnabled(FEATURE_MAP[item.href])
    );

    return (
        <html lang="ar" dir="rtl">
            <head>
                <title>لوحة التحكم - CoreFlex</title>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap" rel="stylesheet" />
            </head>
            <body className="bg-gray-100 font-tajawal">
                <div className="flex min-h-screen">
                    {/* Sidebar */}
                    <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gray-900 text-white transition-all duration-300 fixed h-full z-40`}>
                        {/* Logo */}
                        <div className="h-16 flex items-center justify-center border-b border-gray-800">
                            <Link href="/dashboard" className="flex items-center gap-2">
                                <span className="text-2xl">🏪</span>
                                {sidebarOpen && <span className="font-bold text-lg">CoreFlex</span>}
                            </Link>
                        </div>

                        {/* Menu */}
                        <nav className="p-4 space-y-2">
                            {visibleMenuItems.map((item) => {
                                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                            ? 'bg-primary-600 text-white'
                                            : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                            }`}
                                    >
                                        <span className="text-xl">{item.icon}</span>
                                        {sidebarOpen && (
                                            <span className="flex-1">{item.label}</span>
                                        )}
                                        {sidebarOpen && item.badge && (
                                            <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                                                جديد
                                            </span>
                                        )}
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* Toggle Button */}
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="absolute bottom-4 left-1/2 -translate-x-1/2 p-2 bg-gray-800 rounded-lg hover:bg-gray-700"
                        >
                            {sidebarOpen ? '◀' : '▶'}
                        </button>
                    </aside>

                    {/* Main Content */}
                    <main className={`flex-1 ${sidebarOpen ? 'mr-64' : 'mr-20'} transition-all duration-300`}>
                        {/* Top Bar */}
                        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-6 sticky top-0 z-30">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setSidebarOpen(!sidebarOpen)}
                                    className="p-2 hover:bg-gray-100 rounded-lg lg:hidden"
                                >
                                    ☰
                                </button>
                                <h1 className="text-lg font-medium text-gray-800">
                                    {visibleMenuItems.find(item => pathname.startsWith(item.href))?.label || 'لوحة التحكم'}
                                </h1>
                            </div>

                            <div className="flex items-center gap-4">
                                {/* Notifications */}
                                <button className="relative p-2 hover:bg-gray-100 rounded-lg">
                                    <span className="text-xl">🔔</span>
                                    <span className="absolute top-0 left-0 w-2 h-2 bg-red-500 rounded-full"></span>
                                </button>

                                {/* User Menu */}
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-bold">
                                        م
                                    </div>
                                    <div className="hidden md:block">
                                        <p className="text-sm font-medium">مدير المتجر</p>
                                        <p className="text-xs text-gray-500">admin@store.com</p>
                                    </div>
                                </div>
                            </div>
                        </header>

                        {/* Page Content */}
                        <div className="min-h-[calc(100vh-4rem)]">
                            {children}
                        </div>
                    </main>
                </div>
            </body>
        </html>
    );
}

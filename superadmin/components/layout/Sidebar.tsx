'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard,
    Store,
    Users,
    CreditCard,
    Package,
    Settings,
    BarChart3,
    Shield,
    FileText,
    Bell,
    Database,
    LogOut
} from 'lucide-react'

const menuItems = [
    { icon: LayoutDashboard, label: 'الرئيسية', href: '/' },
    { icon: Store, label: 'المتاجر', href: '/tenants' },
    { icon: Package, label: 'الباقات', href: '/plans' },
    { icon: Users, label: 'المستخدمين', href: '/users' },
    { icon: CreditCard, label: 'المدفوعات', href: '/payments' },
    { icon: Database, label: 'طلبات الانفصال', href: '/exports' },
    { icon: BarChart3, label: 'التقارير', href: '/reports' },
    { icon: FileText, label: 'سجل النشاط', href: '/audit' },
]

const settingsItems = [
    { icon: Settings, label: 'إعدادات المنصة', href: '/settings' },
    { icon: Bell, label: 'الإشعارات', href: '/notifications' },
    { icon: Shield, label: 'الأمان', href: '/security' },
]

export default function Sidebar() {
    const pathname = usePathname()

    return (
        <aside className="fixed right-0 top-0 w-64 h-screen bg-dark-900 text-white z-40">
            {/* Logo */}
            <div className="h-16 flex items-center justify-center border-b border-dark-800">
                <Link href="/" className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                        <Shield className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <span className="text-lg font-bold">CoreFlex</span>
                        <span className="block text-xs text-gray-400">Super Admin</span>
                    </div>
                </Link>
            </div>

            {/* Menu */}
            <nav className="p-4 space-y-1">
                <p className="text-xs text-gray-500 font-medium mb-2 px-4">الإدارة</p>
                {menuItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`sidebar-item ${pathname === item.href ? 'active' : ''}`}
                    >
                        <item.icon className="w-5 h-5" />
                        <span>{item.label}</span>
                    </Link>
                ))}

                <div className="pt-4 mt-4 border-t border-dark-800">
                    <p className="text-xs text-gray-500 font-medium mb-2 px-4">النظام</p>
                    {settingsItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`sidebar-item ${pathname === item.href ? 'active' : ''}`}
                        >
                            <item.icon className="w-5 h-5" />
                            <span>{item.label}</span>
                        </Link>
                    ))}
                </div>
            </nav>

            {/* Logout */}
            <div className="absolute bottom-0 right-0 left-0 p-4 border-t border-dark-800">
                <button className="sidebar-item w-full text-red-400 hover:bg-red-900/20 hover:text-red-300">
                    <LogOut className="w-5 h-5" />
                    <span>تسجيل الخروج</span>
                </button>
            </div>
        </aside>
    )
}

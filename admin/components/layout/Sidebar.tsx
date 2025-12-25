'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Users,
    Tag,
    Settings,
    BarChart3,
    Ticket,
    Truck,
    CreditCard,
    Store,
    LogOut
} from 'lucide-react'

const menuItems = [
    { icon: LayoutDashboard, label: 'الرئيسية', href: '/' },
    { icon: Package, label: 'المنتجات', href: '/products' },
    { icon: Tag, label: 'الفئات', href: '/categories' },
    { icon: ShoppingCart, label: 'الطلبات', href: '/orders' },
    { icon: Users, label: 'العملاء', href: '/customers' },
    { icon: Ticket, label: 'الكوبونات', href: '/coupons' },
    { icon: BarChart3, label: 'التقارير', href: '/reports' },
]

const settingsItems = [
    { icon: Store, label: 'إعدادات المتجر', href: '/settings/store' },
    { icon: CreditCard, label: 'الدفع', href: '/settings/payment' },
    { icon: Truck, label: 'الشحن', href: '/settings/shipping' },
    { icon: Settings, label: 'الإعدادات العامة', href: '/settings' },
]

export default function Sidebar() {
    const pathname = usePathname()

    return (
        <aside className="fixed right-0 top-0 w-64 h-screen bg-white border-l shadow-sm z-40">
            {/* Logo */}
            <div className="h-16 flex items-center justify-center border-b">
                <Link href="/" className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                        <Store className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xl font-bold text-gray-900">المتجر</span>
                </Link>
            </div>

            {/* Menu */}
            <nav className="p-4 space-y-1">
                <p className="text-xs text-gray-400 font-medium mb-2 px-4">القائمة الرئيسية</p>
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

                <div className="pt-4 mt-4 border-t">
                    <p className="text-xs text-gray-400 font-medium mb-2 px-4">الإعدادات</p>
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
            <div className="absolute bottom-0 right-0 left-0 p-4 border-t">
                <button className="sidebar-item w-full text-red-600 hover:bg-red-50 hover:text-red-700">
                    <LogOut className="w-5 h-5" />
                    <span>تسجيل الخروج</span>
                </button>
            </div>
        </aside>
    )
}

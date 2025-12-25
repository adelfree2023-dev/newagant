'use client'

import Link from 'next/link'
import {
    User,
    Package,
    MapPin,
    Heart,
    CreditCard,
    Settings,
    LogOut,
    ChevronLeft,
    Bell,
    Gift,
    Star,
    Wallet
} from 'lucide-react'

const user = {
    name: 'أحمد محمد',
    email: 'ahmed@email.com',
    phone: '+966500000000',
    avatar: null,
    memberSince: '2024',
    points: 1250,
    wallet: 350,
}

const stats = [
    { label: 'الطلبات', value: 12, icon: Package, color: 'bg-blue-100 text-blue-600' },
    { label: 'المفضلة', value: 24, icon: Heart, color: 'bg-red-100 text-red-600' },
    { label: 'النقاط', value: user.points, icon: Star, color: 'bg-yellow-100 text-yellow-600' },
    { label: 'المحفظة', value: `${user.wallet} ر.س`, icon: Wallet, color: 'bg-green-100 text-green-600' },
]

const menuItems = [
    { title: 'طلباتي', description: 'تتبع وإدارة طلباتك', href: '/account/orders', icon: Package, badge: 2 },
    { title: 'عناويني', description: 'إدارة عناوين التوصيل', href: '/account/addresses', icon: MapPin },
    { title: 'المفضلة', description: 'المنتجات المحفوظة', href: '/wishlist', icon: Heart, badge: 24 },
    { title: 'الإشعارات', description: 'تنبيهات وعروض', href: '/account/notifications', icon: Bell, badge: 5 },
    { title: 'طرق الدفع', description: 'البطاقات المحفوظة', href: '/account/payment', icon: CreditCard },
    { title: 'نقاط الولاء', description: 'اكسب واستبدل النقاط', href: '/account/rewards', icon: Gift },
    { title: 'الملف الشخصي', description: 'معلوماتك الشخصية', href: '/account/profile', icon: User },
    { title: 'الإعدادات', description: 'تفضيلات الحساب', href: '/account/settings', icon: Settings },
]

const recentOrders = [
    { id: 'ORD-12345', date: '2024-12-23', status: 'shipping', total: 5998, items: 2 },
    { id: 'ORD-12344', date: '2024-12-20', status: 'delivered', total: 1299, items: 1 },
]

const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    processing: 'bg-blue-100 text-blue-700',
    shipping: 'bg-purple-100 text-purple-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
}

const statusLabels: Record<string, string> = {
    pending: 'قيد الانتظار',
    processing: 'جاري التجهيز',
    shipping: 'جاري الشحن',
    delivered: 'تم التوصيل',
    cancelled: 'ملغي',
}

export default function AccountPage() {
    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4">
                <div className="grid lg:grid-cols-4 gap-8">
                    {/* Sidebar - User Info */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
                            {/* Avatar */}
                            <div className="text-center mb-6">
                                <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <span className="text-3xl font-bold text-primary-600">{user.name.charAt(0)}</span>
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
                                <p className="text-sm text-gray-500">{user.email}</p>
                                <p className="text-xs text-gray-400 mt-1">عضو منذ {user.memberSince}</p>
                            </div>

                            {/* Quick Stats */}
                            <div className="grid grid-cols-2 gap-3">
                                {stats.map((stat, index) => (
                                    <div key={index} className="text-center p-3 bg-gray-50 rounded-xl">
                                        <stat.icon className={`w-6 h-6 mx-auto mb-1 ${stat.color.split(' ')[1]}`} />
                                        <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                                        <p className="text-xs text-gray-500">{stat.label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Logout */}
                        <button className="w-full bg-white border border-red-200 text-red-600 rounded-xl p-4 font-medium hover:bg-red-50 transition flex items-center justify-center gap-2">
                            <LogOut className="w-5 h-5" />
                            تسجيل الخروج
                        </button>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3 space-y-6">
                        {/* Quick Menu */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {menuItems.slice(0, 4).map((item, index) => (
                                <Link key={index} href={item.href} className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition relative group">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${index === 0 ? 'bg-blue-100' : index === 1 ? 'bg-green-100' : index === 2 ? 'bg-red-100' : 'bg-yellow-100'
                                        }`}>
                                        <item.icon className={`w-6 h-6 ${index === 0 ? 'text-blue-600' : index === 1 ? 'text-green-600' : index === 2 ? 'text-red-600' : 'text-yellow-600'
                                            }`} />
                                    </div>
                                    <h3 className="font-bold text-gray-900">{item.title}</h3>
                                    <p className="text-xs text-gray-500">{item.description}</p>
                                    {item.badge && (
                                        <span className="absolute top-3 left-3 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">{item.badge}</span>
                                    )}
                                    <ChevronLeft className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-hover:text-primary-500 transition" />
                                </Link>
                            ))}
                        </div>

                        {/* Recent Orders */}
                        <div className="bg-white rounded-2xl shadow-sm">
                            <div className="p-5 border-b flex items-center justify-between">
                                <h2 className="font-bold text-gray-900">آخر الطلبات</h2>
                                <Link href="/account/orders" className="text-primary-600 text-sm hover:underline">عرض الكل</Link>
                            </div>
                            <div className="divide-y">
                                {recentOrders.map((order) => (
                                    <Link key={order.id} href={`/account/orders/${order.id}`} className="p-5 flex items-center justify-between hover:bg-gray-50 transition">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                                <Package className="w-6 h-6 text-gray-400" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{order.id}</p>
                                                <p className="text-sm text-gray-500">{order.items} منتج • {order.date}</p>
                                            </div>
                                        </div>
                                        <div className="text-left">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[order.status]}`}>
                                                {statusLabels[order.status]}
                                            </span>
                                            <p className="mt-1 font-bold text-gray-900">{order.total} ر.س</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* More Links */}
                        <div className="bg-white rounded-2xl shadow-sm divide-y">
                            {menuItems.slice(4).map((item, index) => (
                                <Link key={index} href={item.href} className="p-4 flex items-center justify-between hover:bg-gray-50 transition">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                            <item.icon className="w-5 h-5 text-gray-500" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">{item.title}</p>
                                            <p className="text-sm text-gray-500">{item.description}</p>
                                        </div>
                                    </div>
                                    <ChevronLeft className="w-5 h-5 text-gray-300" />
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

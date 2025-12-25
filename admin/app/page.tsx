'use client'

import {
    ShoppingCart,
    DollarSign,
    Package,
    Users,
    TrendingUp,
    TrendingDown,
    ArrowUpRight,
    Clock
} from 'lucide-react'
import Link from 'next/link'

// Mock data
const stats = [
    {
        title: 'المبيعات اليوم',
        value: '5,420',
        unit: 'ر.س',
        change: '+12.5%',
        trend: 'up',
        icon: DollarSign,
        color: 'bg-green-500',
    },
    {
        title: 'الطلبات اليوم',
        value: '15',
        change: '+8.3%',
        trend: 'up',
        icon: ShoppingCart,
        color: 'bg-blue-500',
    },
    {
        title: 'المنتجات',
        value: '156',
        change: '+2',
        trend: 'up',
        icon: Package,
        color: 'bg-purple-500',
    },
    {
        title: 'العملاء',
        value: '89',
        change: '+5',
        trend: 'up',
        icon: Users,
        color: 'bg-orange-500',
    },
]

const recentOrders = [
    { id: 'ORD-001', customer: 'أحمد محمد', total: 1500, status: 'pending', date: 'منذ 5 دقائق' },
    { id: 'ORD-002', customer: 'سارة علي', total: 2300, status: 'processing', date: 'منذ 15 دقيقة' },
    { id: 'ORD-003', customer: 'محمد خالد', total: 890, status: 'shipped', date: 'منذ ساعة' },
    { id: 'ORD-004', customer: 'نورة أحمد', total: 3200, status: 'delivered', date: 'منذ 2 ساعة' },
    { id: 'ORD-005', customer: 'عبدالله سعد', total: 750, status: 'pending', date: 'منذ 3 ساعات' },
]

const topProducts = [
    { name: 'آيفون 15 برو ماكس', sales: 45, revenue: 202455, image: 'https://via.placeholder.com/50' },
    { name: 'ايربودز برو 2', sales: 120, revenue: 119880, image: 'https://via.placeholder.com/50' },
    { name: 'ماك بوك برو M3', sales: 12, revenue: 155988, image: 'https://via.placeholder.com/50' },
    { name: 'ساعة أبل الترا 2', sales: 28, revenue: 97972, image: 'https://via.placeholder.com/50' },
]

const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    processing: 'bg-blue-100 text-blue-700',
    shipped: 'bg-purple-100 text-purple-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
}

const statusLabels: Record<string, string> = {
    pending: 'قيد الانتظار',
    processing: 'جاري التجهيز',
    shipped: 'تم الشحن',
    delivered: 'تم التوصيل',
    cancelled: 'ملغي',
}

export default function DashboardPage() {
    return (
        <div className="space-y-6">
            {/* Page Title */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">لوحة التحكم</h1>
                    <p className="text-gray-500">مرحباً بك في لوحة تحكم متجرك</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    <span>آخر تحديث: الآن</span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <div key={index} className="stat-card">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm text-gray-500 mb-1">{stat.title}</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {stat.value} {stat.unit && <span className="text-base font-normal">{stat.unit}</span>}
                                </p>
                            </div>
                            <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                                <stat.icon className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <div className="flex items-center gap-1 mt-3">
                            {stat.trend === 'up' ? (
                                <TrendingUp className="w-4 h-4 text-green-500" />
                            ) : (
                                <TrendingDown className="w-4 h-4 text-red-500" />
                            )}
                            <span className={stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}>
                                {stat.change}
                            </span>
                            <span className="text-gray-400 text-sm">من الأمس</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Orders */}
                <div className="card">
                    <div className="p-4 border-b flex items-center justify-between">
                        <h2 className="font-bold text-gray-900">آخر الطلبات</h2>
                        <Link href="/orders" className="text-primary-600 text-sm hover:underline flex items-center gap-1">
                            عرض الكل <ArrowUpRight className="w-4 h-4" />
                        </Link>
                    </div>
                    <div className="divide-y">
                        {recentOrders.map((order) => (
                            <div key={order.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                                <div>
                                    <p className="font-medium text-gray-900">{order.id}</p>
                                    <p className="text-sm text-gray-500">{order.customer}</p>
                                </div>
                                <div className="text-left">
                                    <p className="font-bold text-gray-900">{order.total.toFixed(2)} ر.س</p>
                                    <span className={`text-xs px-2 py-1 rounded-full ${statusColors[order.status]}`}>
                                        {statusLabels[order.status]}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Products */}
                <div className="card">
                    <div className="p-4 border-b flex items-center justify-between">
                        <h2 className="font-bold text-gray-900">أفضل المنتجات مبيعاً</h2>
                        <Link href="/products" className="text-primary-600 text-sm hover:underline flex items-center gap-1">
                            عرض الكل <ArrowUpRight className="w-4 h-4" />
                        </Link>
                    </div>
                    <div className="divide-y">
                        {topProducts.map((product, index) => (
                            <div key={index} className="p-4 flex items-center gap-4 hover:bg-gray-50">
                                <span className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-sm font-bold text-gray-500">
                                    {index + 1}
                                </span>
                                <img src={product.image} alt={product.name} className="w-12 h-12 rounded-lg object-cover" />
                                <div className="flex-grow">
                                    <p className="font-medium text-gray-900">{product.name}</p>
                                    <p className="text-sm text-gray-500">{product.sales} مبيعات</p>
                                </div>
                                <p className="font-bold text-gray-900">{product.revenue.toLocaleString()} ر.س</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

'use client'

import { useState } from 'react'
import {
    DollarSign,
    ShoppingCart,
    TrendingUp,
    TrendingDown,
    Users,
    Package,
    Calendar,
    Download,
    Filter
} from 'lucide-react'

const salesData = [
    { date: '2024-12-19', orders: 12, revenue: 4500 },
    { date: '2024-12-20', orders: 18, revenue: 6200 },
    { date: '2024-12-21', orders: 25, revenue: 9800 },
    { date: '2024-12-22', orders: 15, revenue: 5100 },
    { date: '2024-12-23', orders: 30, revenue: 12500 },
    { date: '2024-12-24', orders: 45, revenue: 18900 },
    { date: '2024-12-25', orders: 38, revenue: 15200 },
]

const topProducts = [
    { name: 'آيفون 15 برو ماكس', sales: 45, revenue: 202455 },
    { name: 'ايربودز برو 2', sales: 120, revenue: 119880 },
    { name: 'ماك بوك برو M3', sales: 12, revenue: 155988 },
    { name: 'ساعة أبل الترا 2', sales: 28, revenue: 97972 },
    { name: 'آيباد برو 12.9', sales: 18, revenue: 71982 },
]

const stats = [
    { title: 'إجمالي المبيعات', value: '72,200', unit: 'ر.س', change: '+18%', icon: DollarSign, color: 'text-green-600' },
    { title: 'الطلبات', value: '183', change: '+12%', icon: ShoppingCart, color: 'text-blue-600' },
    { title: 'العملاء الجدد', value: '45', change: '+8%', icon: Users, color: 'text-purple-600' },
    { title: 'المنتجات المباعة', value: '312', change: '+15%', icon: Package, color: 'text-orange-600' },
]

export default function ReportsPage() {
    const [period, setPeriod] = useState('week')

    const maxRevenue = Math.max(...salesData.map(d => d.revenue))

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">التقارير</h1>
                    <p className="text-gray-500">تحليل أداء متجرك</p>
                </div>
                <div className="flex items-center gap-3">
                    <select
                        value={period}
                        onChange={(e) => setPeriod(e.target.value)}
                        className="input-field w-auto"
                    >
                        <option value="today">اليوم</option>
                        <option value="week">هذا الأسبوع</option>
                        <option value="month">هذا الشهر</option>
                        <option value="year">هذا العام</option>
                    </select>
                    <button className="btn-secondary flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        تصدير
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                    <div key={index} className="stat-card">
                        <div className="flex items-center justify-between mb-2">
                            <stat.icon className={`w-8 h-8 ${stat.color}`} />
                            <span className="flex items-center text-sm text-green-600">
                                <TrendingUp className="w-4 h-4" />
                                {stat.change}
                            </span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">
                            {stat.value} {stat.unit && <span className="text-base font-normal">{stat.unit}</span>}
                        </p>
                        <p className="text-sm text-gray-500">{stat.title}</p>
                    </div>
                ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Sales Chart */}
                <div className="lg:col-span-2 card p-6">
                    <h2 className="font-bold text-gray-900 mb-4">المبيعات اليومية</h2>
                    <div className="h-64 flex items-end gap-2">
                        {salesData.map((day, index) => (
                            <div key={index} className="flex-1 flex flex-col items-center gap-2">
                                <div
                                    className="w-full bg-primary-500 rounded-t-lg transition-all hover:bg-primary-600"
                                    style={{ height: `${(day.revenue / maxRevenue) * 100}%` }}
                                    title={`${day.revenue} ر.س`}
                                />
                                <span className="text-xs text-gray-500">{day.date.split('-')[2]}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Products */}
                <div className="card p-6">
                    <h2 className="font-bold text-gray-900 mb-4">أفضل المنتجات</h2>
                    <div className="space-y-4">
                        {topProducts.map((product, index) => (
                            <div key={index} className="flex items-center gap-3">
                                <span className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center text-xs font-bold text-primary-600">
                                    {index + 1}
                                </span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                                    <p className="text-xs text-gray-500">{product.sales} مبيعات</p>
                                </div>
                                <p className="text-sm font-bold text-gray-900">{product.revenue.toLocaleString()}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

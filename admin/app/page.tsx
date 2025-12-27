'use client'

import { useState, useEffect } from 'react'
import {
    ShoppingCart,
    DollarSign,
    Package,
    Users,
    TrendingUp,
    ArrowUpRight,
    Clock,
    Loader2
} from 'lucide-react'
import Link from 'next/link'
import { adminApi } from '@/lib/api'

interface DashboardStats {
    todaySales: number
    todayOrders: number
    totalProducts: number
    totalCustomers: number
}

interface RecentOrder {
    id: string
    customer: string
    total: number
    status: string
    date: string
}

interface TopProduct {
    id: string
    name: string
    image: string
    sales: number
    revenue: number
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null)
    const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
    const [topProducts, setTopProducts] = useState<TopProduct[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        loadDashboardData()
    }, [])

    async function loadDashboardData() {
        try {
            setLoading(true)
            // Try to get real data from API
            const res = await fetch('/api/admin/dashboard', {
                headers: {
                    'Content-Type': 'application/json',
                }
            })

            if (res.ok) {
                const data = await res.json()
                if (data.success && data.data) {
                    setStats({
                        todaySales: data.data.today_revenue || 0,
                        todayOrders: data.data.today_orders || 0,
                        totalProducts: data.data.total_products || 0,
                        totalCustomers: data.data.total_customers || 0
                    })
                }
            }

            // Get recent orders
            const ordersRes = await adminApi.dashboard.getRecentOrders(5)
            if (ordersRes.data) {
                setRecentOrders(ordersRes.data.map((o: any) => ({
                    id: o.order_number || o.id,
                    customer: o.customer?.name || 'عميل',
                    total: o.total,
                    status: o.status,
                    date: formatDate(o.created_at)
                })))
            }
        } catch (err) {
            console.error('Dashboard load error:', err)
            // Use fallback data if API fails
            setStats({
                todaySales: 0,
                todayOrders: 0,
                totalProducts: 0,
                totalCustomers: 0
            })
        } finally {
            setLoading(false)
        }
    }

    function formatDate(dateStr: string) {
        const date = new Date(dateStr)
        const now = new Date()
        const diff = now.getTime() - date.getTime()
        const minutes = Math.floor(diff / 60000)
        if (minutes < 60) return `منذ ${minutes} دقيقة`
        const hours = Math.floor(minutes / 60)
        if (hours < 24) return `منذ ${hours} ساعة`
        return date.toLocaleDateString('ar-SA')
    }

    const statusColors: Record<string, string> = {
        pending: 'bg-yellow-100 text-yellow-800',
        processing: 'bg-blue-100 text-blue-800',
        shipped: 'bg-purple-100 text-purple-800',
        delivered: 'bg-green-100 text-green-800',
        cancelled: 'bg-red-100 text-red-800'
    }

    const statusLabels: Record<string, string> = {
        pending: 'قيد الانتظار',
        processing: 'قيد التجهيز',
        shipped: 'تم الشحن',
        delivered: 'تم التوصيل',
        cancelled: 'ملغي'
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
            </div>
        )
    }

    const statCards = [
        {
            title: 'المبيعات اليوم',
            value: stats?.todaySales?.toLocaleString() || '0',
            unit: 'ر.س',
            icon: DollarSign,
            color: 'bg-green-500',
        },
        {
            title: 'الطلبات اليوم',
            value: stats?.todayOrders?.toString() || '0',
            icon: ShoppingCart,
            color: 'bg-blue-500',
        },
        {
            title: 'المنتجات',
            value: stats?.totalProducts?.toString() || '0',
            icon: Package,
            color: 'bg-purple-500',
        },
        {
            title: 'العملاء',
            value: stats?.totalCustomers?.toString() || '0',
            icon: Users,
            color: 'bg-orange-500',
        },
    ]

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">لوحة التحكم</h1>
                    <p className="text-gray-500">مرحباً بك في لوحة تحكم متجرك</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    آخر تحديث: {new Date().toLocaleTimeString('ar-SA')}
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, index) => (
                    <div
                        key={index}
                        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-xl ${stat.color}`}>
                                <stat.icon className="w-6 h-6 text-white" />
                            </div>
                            <TrendingUp className="w-5 h-5 text-green-500" />
                        </div>
                        <h3 className="text-3xl font-bold text-gray-900">
                            {stat.value}
                            {stat.unit && <span className="text-lg mr-1">{stat.unit}</span>}
                        </h3>
                        <p className="text-gray-500 mt-1">{stat.title}</p>
                    </div>
                ))}
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-gray-900">آخر الطلبات</h2>
                    <Link href="/orders" className="text-primary-600 hover:underline flex items-center gap-1">
                        عرض الكل
                        <ArrowUpRight className="w-4 h-4" />
                    </Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">رقم الطلب</th>
                                <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">العميل</th>
                                <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">المبلغ</th>
                                <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">الحالة</th>
                                <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">الوقت</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {recentOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        لا توجد طلبات حتى الآن
                                    </td>
                                </tr>
                            ) : (
                                recentOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium text-gray-900">#{order.id}</td>
                                        <td className="px-6 py-4 text-gray-600">{order.customer}</td>
                                        <td className="px-6 py-4 font-medium">{order.total.toLocaleString()} ر.س</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[order.status] || 'bg-gray-100'}`}>
                                                {statusLabels[order.status] || order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 text-sm">{order.date}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

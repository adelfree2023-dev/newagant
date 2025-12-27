'use client'

import { useState, useEffect } from 'react'
import {
    Store,
    DollarSign,
    Users,
    TrendingUp,
    ArrowUpRight,
    Clock,
    AlertCircle,
    Loader2
} from 'lucide-react'
import Link from 'next/link'

interface DashboardStats {
    totalTenants: number
    activeTenants: number
    monthlyRevenue: number
    totalUsers: number
}

interface Tenant {
    id: string
    name: string
    plan: string
    status: string
    createdAt: string
    ordersCount: number
    revenue: number
}

export default function SuperAdminDashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null)
    const [recentTenants, setRecentTenants] = useState<Tenant[]>([])
    const [loading, setLoading] = useState(true)

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

    useEffect(() => {
        loadDashboardData()
    }, [])

    async function loadDashboardData() {
        try {
            setLoading(true)
            const token = localStorage.getItem('superadmin_token')

            const res = await fetch(`${API_URL}/api/dashboard/superadmin/stats`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : ''
                }
            })

            if (res.ok) {
                const data = await res.json()
                if (data.success) {
                    setStats(data.stats)
                    setRecentTenants(data.recentTenants || [])
                }
            } else {
                // Fallback: Direct SQL query to get tenants
                const tenantsRes = await fetch(`${API_URL}/api/superadmin/tenants`)
                if (tenantsRes.ok) {
                    const tenantsData = await tenantsRes.json()
                    const tenants = tenantsData.data || tenantsData.tenants || []
                    setStats({
                        totalTenants: tenants.length,
                        activeTenants: tenants.filter((t: any) => t.status === 'active').length,
                        monthlyRevenue: 0,
                        totalUsers: 0
                    })
                    setRecentTenants(tenants.slice(0, 5).map((t: any) => ({
                        id: t.id,
                        name: t.name,
                        plan: t.plan || 'free',
                        status: t.status || 'active',
                        createdAt: t.created_at,
                        ordersCount: 0,
                        revenue: 0
                    })))
                }
            }
        } catch (err) {
            console.error('Dashboard load error:', err)
            setStats({ totalTenants: 0, activeTenants: 0, monthlyRevenue: 0, totalUsers: 0 })
        } finally {
            setLoading(false)
        }
    }

    function formatDate(dateStr: string) {
        if (!dateStr) return 'غير محدد'
        const date = new Date(dateStr)
        const now = new Date()
        const diff = now.getTime() - date.getTime()
        const hours = Math.floor(diff / 3600000)
        if (hours < 24) return `منذ ${hours} ساعة`
        const days = Math.floor(hours / 24)
        return `منذ ${days} يوم`
    }

    const statusColors: Record<string, string> = {
        active: 'bg-green-100 text-green-700',
        pending: 'bg-yellow-100 text-yellow-700',
        suspended: 'bg-red-100 text-red-700',
        trial: 'bg-blue-100 text-blue-700'
    }

    const statusLabels: Record<string, string> = {
        active: 'نشط',
        pending: 'قيد المراجعة',
        suspended: 'معلق',
        trial: 'تجريبي'
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
            </div>
        )
    }

    const statCards = [
        { title: 'إجمالي المتاجر', value: stats?.totalTenants || 0, icon: Store, color: 'bg-blue-500' },
        { title: 'المتاجر النشطة', value: stats?.activeTenants || 0, icon: Store, color: 'bg-green-500' },
        { title: 'الإيرادات الشهرية', value: stats?.monthlyRevenue?.toLocaleString() || '0', unit: 'ر.س', icon: DollarSign, color: 'bg-purple-500' },
        { title: 'المستخدمين', value: stats?.totalUsers || 0, icon: Users, color: 'bg-orange-500' },
    ]

    return (
        <div className="space-y-6">
            {/* Page Title */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">لوحة التحكم</h1>
                    <p className="text-gray-500">نظرة عامة على المنصة</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    <span>آخر تحديث: {new Date().toLocaleTimeString('ar-SA')}</span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, index) => (
                    <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
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
                            <TrendingUp className="w-4 h-4 text-green-500" />
                            <span className="text-sm text-green-600">نمو</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Tenants */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-lg font-bold">آخر المتاجر المسجلة</h2>
                    <Link href="/tenants" className="text-primary-600 hover:underline flex items-center gap-1">
                        عرض الكل
                        <ArrowUpRight className="w-4 h-4" />
                    </Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">المتجر</th>
                                <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">الباقة</th>
                                <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">الحالة</th>
                                <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">تاريخ التسجيل</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {recentTenants.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                        لا توجد متاجر مسجلة بعد
                                    </td>
                                </tr>
                            ) : (
                                recentTenants.map((tenant) => (
                                    <tr key={tenant.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                                    <Store className="w-5 h-5 text-gray-500" />
                                                </div>
                                                <span className="font-medium text-gray-900">{tenant.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 bg-gray-100 rounded text-sm">
                                                {tenant.plan}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[tenant.status] || 'bg-gray-100'}`}>
                                                {statusLabels[tenant.status] || tenant.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 text-sm">
                                            {formatDate(tenant.createdAt)}
                                        </td>
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

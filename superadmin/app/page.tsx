'use client'

import {
    Store,
    DollarSign,
    Users,
    Package,
    TrendingUp,
    TrendingDown,
    ArrowUpRight,
    Clock,
    AlertCircle
} from 'lucide-react'
import Link from 'next/link'

const stats = [
    { title: 'إجمالي المتاجر', value: '156', change: '+8', trend: 'up', icon: Store, color: 'bg-blue-500' },
    { title: 'المتاجر النشطة', value: '142', change: '+5', trend: 'up', icon: Store, color: 'bg-green-500' },
    { title: 'الإيرادات الشهرية', value: '45,680', unit: 'ر.س', change: '+15%', trend: 'up', icon: DollarSign, color: 'bg-purple-500' },
    { title: 'المستخدمين', value: '1,245', change: '+32', trend: 'up', icon: Users, color: 'bg-orange-500' },
]

const recentTenants = [
    { id: '1', name: 'متجر التقنية', plan: 'Pro', status: 'active', created: 'منذ ساعة', orders: 45, revenue: 12500 },
    { id: '2', name: 'أزياء العصر', plan: 'Business', status: 'active', created: 'منذ 3 ساعات', orders: 23, revenue: 8900 },
    { id: '3', name: 'مكتبة المعرفة', plan: 'Starter', status: 'pending', created: 'منذ 5 ساعات', orders: 0, revenue: 0 },
    { id: '4', name: 'دكان البيت', plan: 'Pro', status: 'active', created: 'منذ يوم', orders: 67, revenue: 23400 },
    { id: '5', name: 'متجر الرياضة', plan: 'Starter', status: 'suspended', created: 'منذ 2 يوم', orders: 12, revenue: 3200 },
]

const alerts = [
    { type: 'warning', message: '3 متاجر تجاوزت حد الاستخدام الشهري', time: 'منذ 10 دقائق' },
    { type: 'error', message: 'فشل في الدفع لـ 2 متجر', time: 'منذ ساعة' },
    { type: 'info', message: '5 طلبات انفصال جديدة بانتظار المراجعة', time: 'منذ 2 ساعة' },
]

const statusColors: Record<string, string> = {
    active: 'bg-green-100 text-green-700',
    pending: 'bg-yellow-100 text-yellow-700',
    suspended: 'bg-red-100 text-red-700',
}

const statusLabels: Record<string, string> = {
    active: 'نشط',
    pending: 'قيد المراجعة',
    suspended: 'معلق',
}

export default function DashboardPage() {
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
                            <span className="text-gray-400 text-sm">هذا الشهر</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Tenants */}
                <div className="lg:col-span-2 card">
                    <div className="p-4 border-b flex items-center justify-between">
                        <h2 className="font-bold text-gray-900">آخر المتاجر المسجلة</h2>
                        <Link href="/tenants" className="text-primary-600 text-sm hover:underline flex items-center gap-1">
                            عرض الكل <ArrowUpRight className="w-4 h-4" />
                        </Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 text-gray-600 text-sm">
                                <tr>
                                    <th className="p-3 text-right">المتجر</th>
                                    <th className="p-3 text-right">الباقة</th>
                                    <th className="p-3 text-right">الحالة</th>
                                    <th className="p-3 text-right">الطلبات</th>
                                    <th className="p-3 text-right">الإيرادات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {recentTenants.map((tenant) => (
                                    <tr key={tenant.id} className="hover:bg-gray-50">
                                        <td className="p-3">
                                            <div>
                                                <p className="font-medium text-gray-900">{tenant.name}</p>
                                                <p className="text-xs text-gray-500">{tenant.created}</p>
                                            </div>
                                        </td>
                                        <td className="p-3">
                                            <span className="text-sm">{tenant.plan}</span>
                                        </td>
                                        <td className="p-3">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[tenant.status]}`}>
                                                {statusLabels[tenant.status]}
                                            </span>
                                        </td>
                                        <td className="p-3 text-gray-600">{tenant.orders}</td>
                                        <td className="p-3 font-medium">{tenant.revenue.toLocaleString()} ر.س</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Alerts */}
                <div className="card">
                    <div className="p-4 border-b">
                        <h2 className="font-bold text-gray-900">التنبيهات</h2>
                    </div>
                    <div className="divide-y">
                        {alerts.map((alert, index) => (
                            <div key={index} className="p-4 flex gap-3">
                                <AlertCircle className={`w-5 h-5 flex-shrink-0 ${alert.type === 'error' ? 'text-red-500' :
                                        alert.type === 'warning' ? 'text-yellow-500' : 'text-blue-500'
                                    }`} />
                                <div>
                                    <p className="text-sm text-gray-900">{alert.message}</p>
                                    <p className="text-xs text-gray-500 mt-1">{alert.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

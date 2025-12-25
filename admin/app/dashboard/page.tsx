'use client';

/**
 * Admin Dashboard Integration
 * لوحة التحكم الرئيسية مع بيانات حقيقية
 * 
 * يجب وضعه في: admin/app/dashboard/page.tsx
 */

import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/api';

interface DashboardStats {
    totalOrders: number;
    totalRevenue: number;
    totalCustomers: number;
    totalProducts: number;
    pendingOrders: number;
    todayOrders: number;
    todayRevenue: number;
}

interface RecentOrder {
    id: string;
    order_number: string;
    customer: { name: string };
    total: number;
    status: string;
    created_at: string;
}

export default function DashboardPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadDashboard() {
            try {
                setLoading(true);

                const [statsRes, ordersRes] = await Promise.all([
                    adminApi.dashboard.getStats(),
                    adminApi.dashboard.getRecentOrders(5),
                ]);

                if (statsRes.data) setStats(statsRes.data);
                if (ordersRes.data) setRecentOrders(ordersRes.data);

                if (statsRes.error || ordersRes.error) {
                    setError(statsRes.error || ordersRes.error || 'خطأ في تحميل البيانات');
                }
            } catch (err) {
                setError('فشل في تحميل لوحة التحكم');
            } finally {
                setLoading(false);
            }
        }

        loadDashboard();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            </div>
        );
    }

    const statCards = [
        {
            title: 'إجمالي الطلبات',
            value: stats?.totalOrders || 0,
            icon: '📦',
            color: 'bg-blue-500'
        },
        {
            title: 'إجمالي المبيعات',
            value: `${stats?.totalRevenue?.toFixed(2) || 0} ر.س`,
            icon: '💰',
            color: 'bg-green-500'
        },
        {
            title: 'العملاء',
            value: stats?.totalCustomers || 0,
            icon: '👥',
            color: 'bg-purple-500'
        },
        {
            title: 'المنتجات',
            value: stats?.totalProducts || 0,
            icon: '🛍️',
            color: 'bg-orange-500'
        },
        {
            title: 'طلبات اليوم',
            value: stats?.todayOrders || 0,
            icon: '📊',
            color: 'bg-cyan-500'
        },
        {
            title: 'مبيعات اليوم',
            value: `${stats?.todayRevenue?.toFixed(2) || 0} ر.س`,
            icon: '📈',
            color: 'bg-emerald-500'
        },
    ];

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            pending: 'bg-yellow-100 text-yellow-800',
            confirmed: 'bg-blue-100 text-blue-800',
            processing: 'bg-indigo-100 text-indigo-800',
            shipped: 'bg-purple-100 text-purple-800',
            delivered: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const getStatusLabel = (status: string) => {
        const labels: Record<string, string> = {
            pending: 'قيد الانتظار',
            confirmed: 'مؤكد',
            processing: 'قيد التجهيز',
            shipped: 'تم الشحن',
            delivered: 'تم التوصيل',
            cancelled: 'ملغي',
        };
        return labels[status] || status;
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">لوحة التحكم</h1>
                <span className="text-sm text-gray-500">
                    آخر تحديث: {new Date().toLocaleTimeString('ar-SA')}
                </span>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {statCards.map((card, index) => (
                    <div
                        key={index}
                        className="bg-white rounded-xl shadow-sm border p-4 hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-2xl">{card.icon}</span>
                            <div className={`w-2 h-2 rounded-full ${card.color}`}></div>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                        <p className="text-sm text-gray-500">{card.title}</p>
                    </div>
                ))}
            </div>

            {/* Pending Orders Alert */}
            {stats?.pendingOrders && stats.pendingOrders > 0 && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                    <div className="flex items-center">
                        <span className="text-xl ml-2">⚠️</span>
                        <p className="text-yellow-800">
                            لديك <strong>{stats.pendingOrders}</strong> طلب بانتظار التأكيد
                        </p>
                    </div>
                </div>
            )}

            {/* Recent Orders */}
            <div className="bg-white rounded-xl shadow-sm border">
                <div className="p-4 border-b">
                    <h2 className="text-lg font-semibold">آخر الطلبات</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">رقم الطلب</th>
                                <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">العميل</th>
                                <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">المبلغ</th>
                                <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">الحالة</th>
                                <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">التاريخ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {recentOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                                        لا توجد طلبات حتى الآن
                                    </td>
                                </tr>
                            ) : (
                                recentOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 font-medium">#{order.order_number}</td>
                                        <td className="px-4 py-3">{order.customer?.name || 'زائر'}</td>
                                        <td className="px-4 py-3">{order.total?.toFixed(2)} ر.س</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                                {getStatusLabel(order.status)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-500">
                                            {new Date(order.created_at).toLocaleDateString('ar-SA')}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

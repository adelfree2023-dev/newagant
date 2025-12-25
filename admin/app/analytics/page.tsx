'use client';

/**
 * Admin Analytics Page
 * صفحة التحليلات
 * 
 * يجب وضعه في: admin/app/analytics/page.tsx
 */

import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/api';

interface AnalyticsData {
    revenue: {
        today: number;
        yesterday: number;
        thisWeek: number;
        lastWeek: number;
        thisMonth: number;
        lastMonth: number;
    };
    orders: {
        today: number;
        thisWeek: number;
        thisMonth: number;
        pending: number;
    };
    customers: {
        total: number;
        new: number;
        returning: number;
    };
    products: {
        total: number;
        outOfStock: number;
        lowStock: number;
    };
    topProducts: Array<{
        id: string;
        name: string;
        sales: number;
        revenue: number;
    }>;
    revenueChart: Array<{
        date: string;
        revenue: number;
        orders: number;
    }>;
}

export default function AnalyticsPage() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d');

    useEffect(() => {
        loadAnalytics();
    }, [period]);

    async function loadAnalytics() {
        try {
            setLoading(true);
            const result = await adminApi.dashboard.getAnalytics(period);
            if (result.data) {
                setData(result.data);
            }
        } catch (error) {
            console.error('Error loading analytics:', error);
            // Mock data for development
            setData({
                revenue: { today: 2450, yesterday: 1800, thisWeek: 15600, lastWeek: 12400, thisMonth: 58000, lastMonth: 45000 },
                orders: { today: 12, thisWeek: 78, thisMonth: 245, pending: 8 },
                customers: { total: 1250, new: 85, returning: 165 },
                products: { total: 156, outOfStock: 5, lowStock: 12 },
                topProducts: [
                    { id: '1', name: 'منتج 1', sales: 145, revenue: 14500 },
                    { id: '2', name: 'منتج 2', sales: 98, revenue: 9800 },
                    { id: '3', name: 'منتج 3', sales: 76, revenue: 7600 },
                    { id: '4', name: 'منتج 4', sales: 54, revenue: 5400 },
                    { id: '5', name: 'منتج 5', sales: 43, revenue: 4300 },
                ],
                revenueChart: Array.from({ length: 30 }, (_, i) => ({
                    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    revenue: Math.floor(Math.random() * 5000) + 1000,
                    orders: Math.floor(Math.random() * 20) + 5,
                })),
            });
        } finally {
            setLoading(false);
        }
    }

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('ar-SA', { style: 'decimal' }).format(value) + ' ر.س';
    };

    const getGrowth = (current: number, previous: number) => {
        if (previous === 0) return 100;
        return ((current - previous) / previous * 100).toFixed(1);
    };

    if (loading) {
        return (
            <div className="p-6">
                <div className="grid grid-cols-4 gap-4 mb-6">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="bg-white rounded-xl p-6 animate-pulse">
                            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900">التحليلات</h1>
                <div className="flex gap-2">
                    {['7d', '30d', '90d'].map((p) => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p as any)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium ${period === p
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {p === '7d' ? '7 أيام' : p === '30d' ? '30 يوم' : '90 يوم'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard
                    label="إيرادات اليوم"
                    value={formatCurrency(data.revenue.today)}
                    trend={parseFloat(getGrowth(data.revenue.today, data.revenue.yesterday))}
                    icon="💰"
                    color="green"
                />
                <StatCard
                    label="طلبات اليوم"
                    value={data.orders.today.toString()}
                    subtitle={`${data.orders.pending} قيد الانتظار`}
                    icon="📦"
                    color="blue"
                />
                <StatCard
                    label="عملاء جدد"
                    value={data.customers.new.toString()}
                    subtitle={`${data.customers.returning} متكرر`}
                    icon="👥"
                    color="purple"
                />
                <StatCard
                    label="منتجات نشطة"
                    value={data.products.total.toString()}
                    subtitle={`${data.products.outOfStock} نفذ`}
                    icon="🛍️"
                    color="orange"
                />
            </div>

            {/* Revenue Comparison */}
            <div className="grid lg:grid-cols-3 gap-6 mb-6">
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-lg font-bold mb-4">مقارنة الإيرادات</h2>
                    <div className="grid grid-cols-3 gap-4">
                        <CompareCard
                            label="هذا الأسبوع"
                            current={data.revenue.thisWeek}
                            previous={data.revenue.lastWeek}
                        />
                        <CompareCard
                            label="هذا الشهر"
                            current={data.revenue.thisMonth}
                            previous={data.revenue.lastMonth}
                        />
                        <CompareCard
                            label="اليوم"
                            current={data.revenue.today}
                            previous={data.revenue.yesterday}
                        />
                    </div>
                </div>

                {/* Orders Overview */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-lg font-bold mb-4">ملخص الطلبات</h2>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-gray-500">اليوم</span>
                            <span className="font-bold">{data.orders.today}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-500">هذا الأسبوع</span>
                            <span className="font-bold">{data.orders.thisWeek}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-500">هذا الشهر</span>
                            <span className="font-bold">{data.orders.thisMonth}</span>
                        </div>
                        <hr />
                        <div className="flex items-center justify-between text-yellow-600">
                            <span>قيد الانتظار</span>
                            <span className="font-bold">{data.orders.pending}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid lg:grid-cols-2 gap-6 mb-6">
                {/* Revenue Chart */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-lg font-bold mb-4">الإيرادات اليومية</h2>
                    <div className="h-64 flex items-end gap-1">
                        {data.revenueChart.slice(-14).map((day, i) => {
                            const maxRevenue = Math.max(...data.revenueChart.map(d => d.revenue));
                            const height = (day.revenue / maxRevenue) * 100;
                            return (
                                <div key={i} className="flex-1 group relative">
                                    <div
                                        className="bg-primary-500 rounded-t hover:bg-primary-600 transition-colors"
                                        style={{ height: `${height}%` }}
                                    >
                                        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap">
                                            {formatCurrency(day.revenue)}
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-400 text-center mt-1">
                                        {new Date(day.date).getDate()}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Top Products */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-lg font-bold mb-4">المنتجات الأكثر مبيعاً</h2>
                    <div className="space-y-3">
                        {data.topProducts.map((product, i) => (
                            <div key={product.id} className="flex items-center gap-4">
                                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-yellow-100 text-yellow-800' :
                                        i === 1 ? 'bg-gray-100 text-gray-800' :
                                            i === 2 ? 'bg-orange-100 text-orange-800' :
                                                'bg-gray-50 text-gray-600'
                                    }`}>
                                    {i + 1}
                                </span>
                                <div className="flex-1">
                                    <p className="font-medium">{product.name}</p>
                                    <p className="text-sm text-gray-500">{product.sales} مبيعة</p>
                                </div>
                                <p className="font-bold text-primary-600">{formatCurrency(product.revenue)}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Inventory Alerts */}
            {(data.products.outOfStock > 0 || data.products.lowStock > 0) && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                    <h3 className="font-bold text-yellow-800 mb-2">⚠️ تنبيهات المخزون</h3>
                    <div className="flex gap-6">
                        {data.products.outOfStock > 0 && (
                            <p className="text-yellow-700">
                                <span className="font-bold">{data.products.outOfStock}</span> منتج نفذ من المخزون
                            </p>
                        )}
                        {data.products.lowStock > 0 && (
                            <p className="text-yellow-700">
                                <span className="font-bold">{data.products.lowStock}</span> منتج بمخزون منخفض
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

// ==================== Components ====================

function StatCard({ label, value, trend, subtitle, icon, color }: {
    label: string;
    value: string;
    trend?: number;
    subtitle?: string;
    icon: string;
    color: 'green' | 'blue' | 'purple' | 'orange';
}) {
    const colors = {
        green: 'bg-green-50 text-green-600',
        blue: 'bg-blue-50 text-blue-600',
        purple: 'bg-purple-50 text-purple-600',
        orange: 'bg-orange-50 text-orange-600',
    };

    return (
        <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-3">
                <span className="text-gray-500 text-sm">{label}</span>
                <span className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${colors[color]}`}>
                    {icon}
                </span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {trend !== undefined && (
                <p className={`text-sm mt-1 ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {trend >= 0 ? '▲' : '▼'} {Math.abs(trend)}% من الأمس
                </p>
            )}
            {subtitle && (
                <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
            )}
        </div>
    );
}

function CompareCard({ label, current, previous }: {
    label: string;
    current: number;
    previous: number;
}) {
    const growth = previous > 0 ? ((current - previous) / previous * 100).toFixed(1) : 100;
    const isPositive = current >= previous;

    return (
        <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-500 mb-2">{label}</p>
            <p className="text-xl font-bold">{current.toLocaleString()} ر.س</p>
            <p className={`text-sm mt-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {isPositive ? '▲' : '▼'} {Math.abs(parseFloat(growth))}%
            </p>
            <p className="text-xs text-gray-400">مقارنة بـ {previous.toLocaleString()} ر.س</p>
        </div>
    );
}

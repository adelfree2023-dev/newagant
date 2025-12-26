'use client';

/**
 * Account Orders Page
 * صفحة طلباتي
 * 
 * يجب وضعه في: storefront/app/account/orders/page.tsx
 */

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import Link from 'next/link';

interface Order {
    id: string;
    order_number: string;
    status: string;
    total: number;
    items_count: number;
    created_at: string;
    tracking_number?: string;
}

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadOrders() {
            try {
                const result = await api.orders.getAll();
                if (result.data) {
                    // @ts-ignore - Handle potential API response variation (Array vs Object wrapper)
                    setOrders((result.data as any).orders || result.data);
                }
            } catch (error) {
                console.error('Error loading orders:', error);
            } finally {
                setLoading(false);
            }
        }

        loadOrders();
    }, []);

    const getStatusInfo = (status: string) => {
        const statuses: Record<string, { label: string; color: string; icon: string }> = {
            pending: { label: 'قيد الانتظار', color: 'bg-yellow-100 text-yellow-800', icon: '⏳' },
            confirmed: { label: 'تم التأكيد', color: 'bg-blue-100 text-blue-800', icon: '✅' },
            processing: { label: 'قيد التجهيز', color: 'bg-indigo-100 text-indigo-800', icon: '📦' },
            shipped: { label: 'تم الشحن', color: 'bg-purple-100 text-purple-800', icon: '🚚' },
            delivered: { label: 'تم التوصيل', color: 'bg-green-100 text-green-800', icon: '🎉' },
            cancelled: { label: 'ملغي', color: 'bg-red-100 text-red-800', icon: '❌' },
        };
        return statuses[status] || { label: status, color: 'bg-gray-100 text-gray-800', icon: '📋' };
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-4xl mx-auto space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="bg-white rounded-xl p-6 animate-pulse">
                            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">طلباتي</h1>

                {orders.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                        <span className="text-6xl block mb-4">📦</span>
                        <h2 className="text-xl font-medium text-gray-900 mb-2">لا توجد طلبات</h2>
                        <p className="text-gray-500 mb-6">لم تقم بأي طلبات بعد</p>
                        <Link
                            href="/products"
                            className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700"
                        >
                            ابدأ التسوق
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order) => {
                            const statusInfo = getStatusInfo(order.status);
                            return (
                                <div
                                    key={order.id}
                                    className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
                                >
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <div className="flex items-center gap-3">
                                                <h3 className="font-bold text-gray-900">
                                                    طلب #{order.order_number}
                                                </h3>
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                                                    {statusInfo.icon} {statusInfo.label}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {new Date(order.created_at).toLocaleDateString('ar-SA', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                })}
                                            </p>
                                        </div>
                                        <div className="text-left">
                                            <p className="font-bold text-primary-600">{order.total.toFixed(2)} ر.س</p>
                                            <p className="text-sm text-gray-500">{order.items_count} منتج</p>
                                        </div>
                                    </div>

                                    {order.tracking_number && (
                                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                                            <p className="text-sm text-gray-600">
                                                رقم التتبع: <span className="font-mono font-medium">{order.tracking_number}</span>
                                            </p>
                                        </div>
                                    )}

                                    <div className="mt-4 flex gap-3">
                                        <Link
                                            href={`/account/orders/${order.id}`}
                                            className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700"
                                        >
                                            تفاصيل الطلب
                                        </Link>
                                        {order.status === 'shipped' && order.tracking_number && (
                                            <Link
                                                href={`/track-order?number=${order.tracking_number}`}
                                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200"
                                            >
                                                تتبع الشحنة
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

'use client';

/**
 * Admin Orders Management Page
 * صفحة إدارة الطلبات
 * 
 * يجب وضعه في: admin/app/orders/page.tsx
 */

import { useEffect, useState } from 'react';
import { adminApi, Order } from '@/lib/api';

const ORDER_STATUSES = [
    { value: 'pending', label: 'قيد الانتظار', color: 'bg-yellow-100 text-yellow-800', icon: '⏳' },
    { value: 'confirmed', label: 'مؤكد', color: 'bg-blue-100 text-blue-800', icon: '✅' },
    { value: 'processing', label: 'قيد التجهيز', color: 'bg-indigo-100 text-indigo-800', icon: '📦' },
    { value: 'shipped', label: 'تم الشحن', color: 'bg-purple-100 text-purple-800', icon: '🚚' },
    { value: 'delivered', label: 'تم التوصيل', color: 'bg-green-100 text-green-800', icon: '🎉' },
    { value: 'cancelled', label: 'ملغي', color: 'bg-red-100 text-red-800', icon: '❌' },
];

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [filter, setFilter] = useState({ status: '', search: '' });
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        loadOrders();
    }, [filter.status]);

    async function loadOrders() {
        try {
            setLoading(true);
            const result = await adminApi.orders.getAll({
                status: filter.status,
                search: filter.search,
            });
            if (result.data) {
                setOrders(result.data.orders || result.data);
            }
        } catch (error) {
            console.error('Error loading orders:', error);
        } finally {
            setLoading(false);
        }
    }

    async function updateOrderStatus(orderId: string, newStatus: string, trackingNumber?: string) {
        try {
            const result = await adminApi.orders.updateStatus(orderId, newStatus, trackingNumber);
            if (result.data) {
                // تحديث القائمة
                setOrders(orders.map(o =>
                    o.id === orderId ? { ...o, status: newStatus, tracking_number: trackingNumber } : o
                ));
                setShowModal(false);
                setSelectedOrder(null);
            }
        } catch (error) {
            console.error('Error updating order:', error);
        }
    }

    const getStatusInfo = (status: string) => {
        return ORDER_STATUSES.find(s => s.value === status) || ORDER_STATUSES[0];
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('ar-SA', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900">إدارة الطلبات</h1>
                <button
                    onClick={loadOrders}
                    className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                    🔄 تحديث
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
                <div className="flex flex-wrap gap-4">
                    {/* Status Filter */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => setFilter({ ...filter, status: '' })}
                            className={`px-3 py-1 rounded-full text-sm ${filter.status === '' ? 'bg-gray-900 text-white' : 'bg-gray-100'
                                }`}
                        >
                            الكل
                        </button>
                        {ORDER_STATUSES.map(status => (
                            <button
                                key={status.value}
                                onClick={() => setFilter({ ...filter, status: status.value })}
                                className={`px-3 py-1 rounded-full text-sm ${filter.status === status.value ? 'bg-gray-900 text-white' : 'bg-gray-100'
                                    }`}
                            >
                                {status.icon} {status.label}
                            </button>
                        ))}
                    </div>

                    {/* Search */}
                    <input
                        type="text"
                        placeholder="بحث برقم الطلب أو إيميل العميل..."
                        value={filter.search}
                        onChange={(e) => setFilter({ ...filter, search: e.target.value })}
                        onKeyDown={(e) => e.key === 'Enter' && loadOrders()}
                        className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        لا توجد طلبات
                    </div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">رقم الطلب</th>
                                <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">العميل</th>
                                <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">المبلغ</th>
                                <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">الحالة</th>
                                <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">التاريخ</th>
                                <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {orders.map((order) => {
                                const statusInfo = getStatusInfo(order.status);
                                return (
                                    <tr key={order.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-4 font-medium">#{order.order_number}</td>
                                        <td className="px-4 py-4">
                                            <div>
                                                <p className="font-medium">{order.customer_name || 'زائر'}</p>
                                                <p className="text-sm text-gray-500">{order.customer_email}</p>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 font-bold text-primary-600">
                                            {order.total?.toFixed(2)} ر.س
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                                                {statusInfo.icon} {statusInfo.label}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-sm text-gray-500">
                                            {formatDate(order.created_at)}
                                        </td>
                                        <td className="px-4 py-4">
                                            <button
                                                onClick={() => { setSelectedOrder(order); setShowModal(true); }}
                                                className="px-3 py-1 bg-primary-600 text-white rounded text-sm hover:bg-primary-700"
                                            >
                                                عرض
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Order Details Modal */}
            {showModal && selectedOrder && (
                <OrderModal
                    order={selectedOrder}
                    onClose={() => { setShowModal(false); setSelectedOrder(null); }}
                    onUpdateStatus={updateOrderStatus}
                />
            )}
        </div>
    );
}

// ==================== Order Modal Component ====================

interface OrderModalProps {
    order: Order;
    onClose: () => void;
    onUpdateStatus: (orderId: string, status: string, trackingNumber?: string) => void;
}

function OrderModal({ order, onClose, onUpdateStatus }: OrderModalProps) {
    const [newStatus, setNewStatus] = useState(order.status);
    const [trackingNumber, setTrackingNumber] = useState(order.tracking_number || '');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        setLoading(true);
        await onUpdateStatus(order.id, newStatus, trackingNumber || undefined);
        setLoading(false);
    };

    const statusInfo = ORDER_STATUSES.find(s => s.value === order.status);

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="p-6 border-b flex items-center justify-between">
                    <h2 className="text-xl font-bold">طلب #{order.order_number}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
                </div>

                <div className="p-6">
                    {/* Current Status */}
                    <div className="flex items-center gap-4 mb-6">
                        <span className={`px-4 py-2 rounded-full ${statusInfo?.color}`}>
                            {statusInfo?.icon} {statusInfo?.label}
                        </span>
                        <span className="text-gray-500">
                            {new Date(order.created_at).toLocaleDateString('ar-SA')}
                        </span>
                    </div>

                    {/* Customer Info */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                        <h3 className="font-medium mb-2">معلومات العميل</h3>
                        <p>{order.customer_name}</p>
                        <p className="text-sm text-gray-500">{order.customer_email}</p>
                        {order.shipping_address && (
                            <p className="text-sm text-gray-500 mt-2">
                                {(() => {
                                    try {
                                        const addr = typeof order.shipping_address === 'string'
                                            ? JSON.parse(order.shipping_address)
                                            : order.shipping_address;
                                        return (
                                            <>
                                                {addr.address}<br />
                                                {order.notes && order.notes.includes('http') && (
                                                    <a href={order.notes} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1 mt-1">
                                                        📍 عرض الموقع على الخريطة
                                                    </a>
                                                )}
                                            </>
                                        );
                                    } catch (e) { return 'عنوان غير صالح'; }
                                })()}
                            </p>
                        )}
                    </div>

                    {/* Order Summary */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                        <h3 className="font-medium mb-2">ملخص الطلب</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span>المجموع الفرعي</span>
                                <span>{order.subtotal?.toFixed(2)} ر.س</span>
                            </div>
                            <div className="flex justify-between">
                                <span>الشحن</span>
                                <span>{order.shipping_cost === 0 ? 'مجاني' : `${order.shipping_cost?.toFixed(2)} ر.س`}</span>
                            </div>
                            {order.discount > 0 && (
                                <div className="flex justify-between text-green-600">
                                    <span>الخصم</span>
                                    <span>-{order.discount?.toFixed(2)} ر.س</span>
                                </div>
                            )}
                            <hr />
                            <div className="flex justify-between font-bold text-lg">
                                <span>الإجمالي</span>
                                <span className="text-primary-600">{order.total?.toFixed(2)} ر.س</span>
                            </div>
                        </div>
                    </div>

                    {/* Update Status */}
                    <div className="border-t pt-6">
                        <h3 className="font-medium mb-4">تحديث الحالة</h3>

                        <div className="grid gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">الحالة الجديدة</label>
                                <select
                                    value={newStatus}
                                    onChange={(e) => setNewStatus(e.target.value)}
                                    className="w-full px-4 py-2 border rounded-lg"
                                >
                                    {ORDER_STATUSES.map(status => (
                                        <option key={status.value} value={status.value}>
                                            {status.icon} {status.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {newStatus === 'shipped' && (
                                <div>
                                    <label className="block text-sm font-medium mb-1">رقم التتبع</label>
                                    <input
                                        type="text"
                                        value={trackingNumber}
                                        onChange={(e) => setTrackingNumber(e.target.value)}
                                        placeholder="أدخل رقم التتبع..."
                                        className="w-full px-4 py-2 border rounded-lg"
                                    />
                                </div>
                            )}

                            <button
                                onClick={handleSubmit}
                                disabled={loading || newStatus === order.status}
                                className="w-full py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:bg-gray-300"
                            >
                                {loading ? 'جاري التحديث...' : 'تحديث الحالة'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

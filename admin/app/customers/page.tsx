'use client';

/**
 * Admin Customers Page
 * صفحة العملاء
 * 
 * يجب وضعه في: admin/app/customers/page.tsx
 */

import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/api';

interface Customer {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    phone?: string;
    orders_count: number;
    total_spent: number;
    last_order_at?: string;
    created_at: string;
    is_active: boolean;
}

export default function CustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

    useEffect(() => {
        loadCustomers();
    }, []);

    async function loadCustomers() {
        try {
            setLoading(true);
            const result = await adminApi.customers.getAll({ search });
            if (result.data) {
                setCustomers(result.data.customers || result.data);
            }
        } catch (error) {
            console.error('Error loading customers:', error);
        } finally {
            setLoading(false);
        }
    }

    const formatDate = (date?: string) => {
        if (!date) return 'لم يطلب بعد';
        return new Date(date).toLocaleDateString('ar-SA');
    };

    const getCustomerTier = (totalSpent: number) => {
        if (totalSpent >= 5000) return { label: 'VIP', color: 'bg-purple-100 text-purple-800', icon: '👑' };
        if (totalSpent >= 1000) return { label: 'ذهبي', color: 'bg-yellow-100 text-yellow-800', icon: '⭐' };
        if (totalSpent >= 500) return { label: 'فضي', color: 'bg-gray-100 text-gray-800', icon: '🥈' };
        return { label: 'عادي', color: 'bg-blue-100 text-blue-800', icon: '👤' };
    };

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900">العملاء</h1>
                <div className="text-sm text-gray-500">
                    إجمالي: {customers.length} عميل
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl p-4 shadow-sm">
                    <p className="text-sm text-gray-500">إجمالي العملاء</p>
                    <p className="text-2xl font-bold">{customers.length}</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm">
                    <p className="text-sm text-gray-500">عملاء VIP</p>
                    <p className="text-2xl font-bold text-purple-600">
                        {customers.filter(c => c.total_spent >= 5000).length}
                    </p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm">
                    <p className="text-sm text-gray-500">متوسط الإنفاق</p>
                    <p className="text-2xl font-bold text-green-600">
                        {customers.length > 0
                            ? (customers.reduce((sum, c) => sum + c.total_spent, 0) / customers.length).toFixed(0)
                            : 0} ر.س
                    </p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm">
                    <p className="text-sm text-gray-500">عملاء الشهر</p>
                    <p className="text-2xl font-bold text-blue-600">
                        {customers.filter(c => {
                            const monthAgo = new Date();
                            monthAgo.setMonth(monthAgo.getMonth() - 1);
                            return new Date(c.created_at) > monthAgo;
                        }).length}
                    </p>
                </div>
            </div>

            {/* Search */}
            <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
                <div className="flex gap-4">
                    <input
                        type="text"
                        placeholder="بحث بالاسم، الإيميل، أو رقم الهاتف..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && loadCustomers()}
                        className="flex-1 px-4 py-2 border rounded-lg"
                    />
                    <button
                        onClick={loadCustomers}
                        className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                    >
                        بحث
                    </button>
                </div>
            </div>

            {/* Customers Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                    </div>
                ) : customers.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        لا يوجد عملاء
                    </div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">العميل</th>
                                <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">الفئة</th>
                                <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">الطلبات</th>
                                <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">إجمالي الإنفاق</th>
                                <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">آخر طلب</th>
                                <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">منذ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {customers.map((customer) => {
                                const tier = getCustomerTier(customer.total_spent);
                                return (
                                    <tr
                                        key={customer.id}
                                        className="hover:bg-gray-50 cursor-pointer"
                                        onClick={() => setSelectedCustomer(customer)}
                                    >
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-bold">
                                                    {customer.first_name?.[0] || '?'}
                                                </div>
                                                <div>
                                                    <p className="font-medium">{customer.first_name} {customer.last_name}</p>
                                                    <p className="text-sm text-gray-500">{customer.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${tier.color}`}>
                                                {tier.icon} {tier.label}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 font-medium">
                                            {customer.orders_count} طلب
                                        </td>
                                        <td className="px-4 py-4 font-bold text-primary-600">
                                            {customer.total_spent.toFixed(2)} ر.س
                                        </td>
                                        <td className="px-4 py-4 text-sm text-gray-500">
                                            {formatDate(customer.last_order_at)}
                                        </td>
                                        <td className="px-4 py-4 text-sm text-gray-500">
                                            {formatDate(customer.created_at)}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Customer Details Modal */}
            {selectedCustomer && (
                <CustomerModal
                    customer={selectedCustomer}
                    onClose={() => setSelectedCustomer(null)}
                />
            )}
        </div>
    );
}

// ==================== Customer Modal ====================

function CustomerModal({ customer, onClose }: { customer: Customer; onClose: () => void }) {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadCustomerOrders();
    }, []);

    async function loadCustomerOrders() {
        try {
            const result = await adminApi.customers.getOrders(customer.id);
            if (result.data) {
                setOrders(result.data.orders || result.data);
            }
        } catch (error) {
            console.error('Error loading orders:', error);
        } finally {
            setLoading(false);
        }
    }

    const tier = customer.total_spent >= 5000 ? 'VIP' :
        customer.total_spent >= 1000 ? 'ذهبي' :
            customer.total_spent >= 500 ? 'فضي' : 'عادي';

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b flex items-center justify-between">
                    <h2 className="text-xl font-bold">ملف العميل</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
                </div>

                <div className="p-6">
                    {/* Customer Info */}
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-2xl font-bold">
                            {customer.first_name?.[0] || '?'}
                        </div>
                        <div>
                            <h3 className="text-xl font-bold">{customer.first_name} {customer.last_name}</h3>
                            <p className="text-gray-500">{customer.email}</p>
                            {customer.phone && <p className="text-sm text-gray-400">{customer.phone}</p>}
                        </div>
                        <div className="mr-auto text-left">
                            <span className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm font-medium">
                                {tier}
                            </span>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="bg-gray-50 rounded-lg p-4 text-center">
                            <p className="text-2xl font-bold text-primary-600">{customer.orders_count}</p>
                            <p className="text-sm text-gray-500">طلب</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4 text-center">
                            <p className="text-2xl font-bold text-green-600">{customer.total_spent.toFixed(0)}</p>
                            <p className="text-sm text-gray-500">ر.س إجمالي</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4 text-center">
                            <p className="text-2xl font-bold text-blue-600">
                                {customer.orders_count > 0
                                    ? (customer.total_spent / customer.orders_count).toFixed(0)
                                    : 0}
                            </p>
                            <p className="text-sm text-gray-500">ر.س متوسط</p>
                        </div>
                    </div>

                    {/* Orders History */}
                    <div>
                        <h4 className="font-medium mb-3">سجل الطلبات</h4>
                        {loading ? (
                            <div className="text-center py-4">جاري التحميل...</div>
                        ) : orders.length === 0 ? (
                            <div className="text-center py-4 text-gray-500">لا توجد طلبات</div>
                        ) : (
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                {orders.map((order: any) => (
                                    <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div>
                                            <p className="font-medium">#{order.order_number}</p>
                                            <p className="text-sm text-gray-500">
                                                {new Date(order.created_at).toLocaleDateString('ar-SA')}
                                            </p>
                                        </div>
                                        <div className="text-left">
                                            <p className="font-bold text-primary-600">{order.total?.toFixed(2)} ر.س</p>
                                            <p className="text-xs text-gray-500">{order.status}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

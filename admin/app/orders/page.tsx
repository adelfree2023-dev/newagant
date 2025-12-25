'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
    Search,
    Filter,
    Eye,
    ChevronLeft,
    ChevronRight,
    Printer,
    Download
} from 'lucide-react'

const orders = [
    { id: 'ORD-001', customer: 'أحمد محمد', email: 'ahmed@email.com', total: 1500, items: 2, status: 'pending', payment: 'cod', date: '2024-12-25 10:30' },
    { id: 'ORD-002', customer: 'سارة علي', email: 'sara@email.com', total: 2300, items: 3, status: 'processing', payment: 'card', date: '2024-12-25 09:15' },
    { id: 'ORD-003', customer: 'محمد خالد', email: 'mohamed@email.com', total: 890, items: 1, status: 'shipped', payment: 'card', date: '2024-12-24 16:45' },
    { id: 'ORD-004', customer: 'نورة أحمد', email: 'noura@email.com', total: 3200, items: 4, status: 'delivered', payment: 'cod', date: '2024-12-24 14:20' },
    { id: 'ORD-005', customer: 'عبدالله سعد', email: 'abdullah@email.com', total: 750, items: 1, status: 'cancelled', payment: 'card', date: '2024-12-24 11:00' },
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

export default function OrdersPage() {
    const [selectedStatus, setSelectedStatus] = useState('')

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">الطلبات</h1>
                    <p className="text-gray-500">{orders.length} طلب</p>
                </div>
                <div className="flex gap-2">
                    <button className="btn-secondary flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        تصدير
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {Object.entries(statusLabels).map(([key, label]) => (
                    <button
                        key={key}
                        onClick={() => setSelectedStatus(key === selectedStatus ? '' : key)}
                        className={`p-4 rounded-xl text-center transition ${selectedStatus === key
                                ? 'bg-primary-600 text-white'
                                : 'bg-white border hover:border-primary-300'
                            }`}
                    >
                        <p className="text-2xl font-bold">{orders.filter(o => o.status === key).length}</p>
                        <p className="text-sm">{label}</p>
                    </button>
                ))}
            </div>

            {/* Filters */}
            <div className="card p-4">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex-grow max-w-md relative">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="ابحث برقم الطلب أو اسم العميل..."
                            className="input-field pr-10"
                        />
                    </div>
                    <select className="input-field w-auto">
                        <option value="">جميع الحالات</option>
                        {Object.entries(statusLabels).map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                        ))}
                    </select>
                    <input type="date" className="input-field w-auto" />
                </div>
            </div>

            {/* Table */}
            <div className="card overflow-hidden">
                <table className="w-full">
                    <thead className="table-header">
                        <tr>
                            <th className="p-4 text-right">رقم الطلب</th>
                            <th className="p-4 text-right">العميل</th>
                            <th className="p-4 text-right">المنتجات</th>
                            <th className="p-4 text-right">الإجمالي</th>
                            <th className="p-4 text-right">الدفع</th>
                            <th className="p-4 text-right">الحالة</th>
                            <th className="p-4 text-right">التاريخ</th>
                            <th className="p-4 text-right">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order) => (
                            <tr key={order.id} className="table-row">
                                <td className="p-4 font-medium text-primary-600">{order.id}</td>
                                <td className="p-4">
                                    <p className="font-medium text-gray-900">{order.customer}</p>
                                    <p className="text-sm text-gray-500">{order.email}</p>
                                </td>
                                <td className="p-4 text-gray-500">{order.items} منتج</td>
                                <td className="p-4 font-bold">{order.total.toFixed(2)} ر.س</td>
                                <td className="p-4">
                                    <span className="text-sm">
                                        {order.payment === 'cod' ? 'عند الاستلام' : 'بطاقة'}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[order.status]}`}>
                                        {statusLabels[order.status]}
                                    </span>
                                </td>
                                <td className="p-4 text-gray-500 text-sm">{order.date}</td>
                                <td className="p-4">
                                    <div className="flex items-center gap-2">
                                        <Link href={`/orders/${order.id}`} className="p-2 hover:bg-gray-100 rounded-lg" title="عرض">
                                            <Eye className="w-4 h-4 text-gray-500" />
                                        </Link>
                                        <button className="p-2 hover:bg-gray-100 rounded-lg" title="طباعة">
                                            <Printer className="w-4 h-4 text-gray-500" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Pagination */}
                <div className="p-4 border-t flex items-center justify-between">
                    <p className="text-sm text-gray-500">عرض 1-5 من 5 طلب</p>
                    <div className="flex items-center gap-2">
                        <button className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50" disabled>
                            <ChevronRight className="w-4 h-4" />
                        </button>
                        <button className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50" disabled>
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

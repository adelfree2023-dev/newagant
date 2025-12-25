'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, Eye, Mail, Phone, ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react'

const customers = [
    { id: '1', name: 'أحمد محمد', email: 'ahmed@email.com', phone: '0501234567', orders: 12, total_spent: 15420, last_order: '2024-12-25', status: 'active' },
    { id: '2', name: 'سارة علي', email: 'sara@email.com', phone: '0551234567', orders: 8, total_spent: 8900, last_order: '2024-12-24', status: 'active' },
    { id: '3', name: 'محمد خالد', email: 'mohamed@email.com', phone: '0561234567', orders: 5, total_spent: 4500, last_order: '2024-12-20', status: 'active' },
    { id: '4', name: 'نورة أحمد', email: 'noura@email.com', phone: '0571234567', orders: 3, total_spent: 2100, last_order: '2024-12-15', status: 'inactive' },
    { id: '5', name: 'عبدالله سعد', email: 'abdullah@email.com', phone: '0581234567', orders: 1, total_spent: 750, last_order: '2024-12-10', status: 'active' },
]

export default function CustomersPage() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">العملاء</h1>
                    <p className="text-gray-500">{customers.length} عميل</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="stat-card">
                    <p className="text-sm text-gray-500">إجمالي العملاء</p>
                    <p className="text-2xl font-bold text-gray-900">{customers.length}</p>
                </div>
                <div className="stat-card">
                    <p className="text-sm text-gray-500">العملاء النشطين</p>
                    <p className="text-2xl font-bold text-green-600">{customers.filter(c => c.status === 'active').length}</p>
                </div>
                <div className="stat-card">
                    <p className="text-sm text-gray-500">إجمالي المبيعات</p>
                    <p className="text-2xl font-bold text-gray-900">{customers.reduce((sum, c) => sum + c.total_spent, 0).toLocaleString()} ر.س</p>
                </div>
                <div className="stat-card">
                    <p className="text-sm text-gray-500">متوسط قيمة الطلب</p>
                    <p className="text-2xl font-bold text-gray-900">
                        {Math.round(customers.reduce((sum, c) => sum + c.total_spent, 0) / customers.reduce((sum, c) => sum + c.orders, 0))} ر.س
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="card p-4">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex-grow max-w-md relative">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="ابحث بالاسم أو الإيميل أو الهاتف..."
                            className="input-field pr-10"
                        />
                    </div>
                    <select className="input-field w-auto">
                        <option value="">جميع العملاء</option>
                        <option value="active">نشط</option>
                        <option value="inactive">غير نشط</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="card overflow-hidden">
                <table className="w-full">
                    <thead className="table-header">
                        <tr>
                            <th className="p-4 text-right">العميل</th>
                            <th className="p-4 text-right">التواصل</th>
                            <th className="p-4 text-right">الطلبات</th>
                            <th className="p-4 text-right">إجمالي المشتريات</th>
                            <th className="p-4 text-right">آخر طلب</th>
                            <th className="p-4 text-right">الحالة</th>
                            <th className="p-4 text-right">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {customers.map((customer) => (
                            <tr key={customer.id} className="table-row">
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                                            <span className="text-primary-600 font-bold">{customer.name.charAt(0)}</span>
                                        </div>
                                        <span className="font-medium text-gray-900">{customer.name}</span>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="text-sm">
                                        <div className="flex items-center gap-1 text-gray-600">
                                            <Mail className="w-4 h-4" />
                                            {customer.email}
                                        </div>
                                        <div className="flex items-center gap-1 text-gray-500">
                                            <Phone className="w-4 h-4" />
                                            {customer.phone}
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-1">
                                        <ShoppingCart className="w-4 h-4 text-gray-400" />
                                        <span>{customer.orders}</span>
                                    </div>
                                </td>
                                <td className="p-4 font-bold">{customer.total_spent.toLocaleString()} ر.س</td>
                                <td className="p-4 text-gray-500 text-sm">{customer.last_order}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${customer.status === 'active'
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-gray-100 text-gray-700'
                                        }`}>
                                        {customer.status === 'active' ? 'نشط' : 'غير نشط'}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <Link href={`/customers/${customer.id}`} className="p-2 hover:bg-gray-100 rounded-lg inline-flex" title="عرض">
                                        <Eye className="w-4 h-4 text-gray-500" />
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Pagination */}
                <div className="p-4 border-t flex items-center justify-between">
                    <p className="text-sm text-gray-500">عرض 1-5 من 5 عميل</p>
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

'use client'

import { useState } from 'react'
import { Plus, Search, Edit, Trash2, Shield, Eye, Ban, ChevronLeft, ChevronRight } from 'lucide-react'

const users = [
    { id: '1', name: 'أدمن رئيسي', email: 'admin@coreflex.io', role: 'super_admin', status: 'active', last_login: '2024-12-25 10:30', tenants: '-' },
    { id: '2', name: 'أحمد محمد', email: 'ahmed@techstore.com', role: 'tenant_admin', status: 'active', last_login: '2024-12-25 09:15', tenants: 'متجر التقنية' },
    { id: '3', name: 'سارة علي', email: 'sara@fashion.com', role: 'tenant_admin', status: 'active', last_login: '2024-12-24 16:45', tenants: 'أزياء العصر' },
    { id: '4', name: 'محمد خالد', email: 'mohamed@lib.com', role: 'tenant_admin', status: 'pending', last_login: '-', tenants: 'مكتبة المعرفة' },
    { id: '5', name: 'عبدالله سعد', email: 'abdullah@sports.com', role: 'tenant_admin', status: 'suspended', last_login: '2024-12-20 11:00', tenants: 'متجر الرياضة' },
]

const roleLabels: Record<string, string> = { super_admin: 'مدير النظام', tenant_admin: 'مدير متجر', support: 'دعم فني' }
const roleColors: Record<string, string> = { super_admin: 'bg-purple-100 text-purple-700', tenant_admin: 'bg-blue-100 text-blue-700', support: 'bg-gray-100 text-gray-700' }
const statusColors: Record<string, string> = { active: 'bg-green-100 text-green-700', pending: 'bg-yellow-100 text-yellow-700', suspended: 'bg-red-100 text-red-700' }
const statusLabels: Record<string, string> = { active: 'نشط', pending: 'قيد المراجعة', suspended: 'معلق' }

export default function UsersPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">المستخدمين</h1>
                    <p className="text-gray-500">{users.length} مستخدم</p>
                </div>
                <button className="btn-primary flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    إضافة مستخدم
                </button>
            </div>

            <div className="card p-4">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex-grow max-w-md relative">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input type="text" placeholder="ابحث بالاسم أو البريد..." className="input-field pr-10" />
                    </div>
                    <select className="input-field w-auto">
                        <option value="">جميع الأدوار</option>
                        <option value="super_admin">مدير النظام</option>
                        <option value="tenant_admin">مدير متجر</option>
                    </select>
                    <select className="input-field w-auto">
                        <option value="">جميع الحالات</option>
                        <option value="active">نشط</option>
                        <option value="suspended">معلق</option>
                    </select>
                </div>
            </div>

            <div className="card overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 text-gray-600 text-sm">
                        <tr>
                            <th className="p-4 text-right">المستخدم</th>
                            <th className="p-4 text-right">الدور</th>
                            <th className="p-4 text-right">المتجر</th>
                            <th className="p-4 text-right">آخر دخول</th>
                            <th className="p-4 text-right">الحالة</th>
                            <th className="p-4 text-right">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50">
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                                            <span className="text-primary-600 font-bold">{user.name.charAt(0)}</span>
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">{user.name}</p>
                                            <p className="text-sm text-gray-500">{user.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleColors[user.role]}`}>
                                        {roleLabels[user.role]}
                                    </span>
                                </td>
                                <td className="p-4 text-gray-600">{user.tenants}</td>
                                <td className="p-4 text-gray-500 text-sm">{user.last_login}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[user.status]}`}>
                                        {statusLabels[user.status]}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <div className="flex gap-1">
                                        <button className="p-2 hover:bg-gray-100 rounded-lg"><Eye className="w-4 h-4 text-gray-500" /></button>
                                        <button className="p-2 hover:bg-gray-100 rounded-lg"><Edit className="w-4 h-4 text-gray-500" /></button>
                                        <button className="p-2 hover:bg-red-50 rounded-lg"><Ban className="w-4 h-4 text-red-500" /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

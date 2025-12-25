'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
    Plus,
    Search,
    Filter,
    Eye,
    Edit,
    Power,
    Trash2,
    ExternalLink,
    ChevronLeft,
    ChevronRight
} from 'lucide-react'

const tenants = [
    { id: '1', name: 'متجر التقنية', slug: 'tech-store', plan: 'Pro', status: 'active', owner: 'أحمد محمد', email: 'ahmed@tech.com', products: 156, orders: 450, revenue: 125000, created: '2024-10-15' },
    { id: '2', name: 'أزياء العصر', slug: 'fashion-era', plan: 'Business', status: 'active', owner: 'سارة علي', email: 'sara@fashion.com', products: 89, orders: 230, revenue: 89000, created: '2024-11-01' },
    { id: '3', name: 'مكتبة المعرفة', slug: 'knowledge-lib', plan: 'Starter', status: 'pending', owner: 'محمد خالد', email: 'mohamed@lib.com', products: 45, orders: 0, revenue: 0, created: '2024-12-20' },
    { id: '4', name: 'دكان البيت', slug: 'home-shop', plan: 'Pro', status: 'active', owner: 'نورة أحمد', email: 'noura@home.com', products: 234, orders: 670, revenue: 234000, created: '2024-09-01' },
    { id: '5', name: 'متجر الرياضة', slug: 'sports-shop', plan: 'Starter', status: 'suspended', owner: 'عبدالله سعد', email: 'abdullah@sports.com', products: 67, orders: 120, revenue: 32000, created: '2024-08-15' },
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

const planColors: Record<string, string> = {
    Starter: 'bg-gray-100 text-gray-700',
    Pro: 'bg-blue-100 text-blue-700',
    Business: 'bg-purple-100 text-purple-700',
}

export default function TenantsPage() {
    const [selectedTenants, setSelectedTenants] = useState<string[]>([])

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">المتاجر</h1>
                    <p className="text-gray-500">{tenants.length} متجر مسجل</p>
                </div>
                <Link href="/tenants/new" className="btn-primary flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    إضافة متجر
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                <div className="stat-card text-center">
                    <p className="text-3xl font-bold text-green-600">{tenants.filter(t => t.status === 'active').length}</p>
                    <p className="text-sm text-gray-500">نشط</p>
                </div>
                <div className="stat-card text-center">
                    <p className="text-3xl font-bold text-yellow-600">{tenants.filter(t => t.status === 'pending').length}</p>
                    <p className="text-sm text-gray-500">قيد المراجعة</p>
                </div>
                <div className="stat-card text-center">
                    <p className="text-3xl font-bold text-red-600">{tenants.filter(t => t.status === 'suspended').length}</p>
                    <p className="text-sm text-gray-500">معلق</p>
                </div>
            </div>

            {/* Filters */}
            <div className="card p-4">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex-grow max-w-md relative">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="ابحث بالاسم أو البريد..."
                            className="input-field pr-10"
                        />
                    </div>
                    <select className="input-field w-auto">
                        <option value="">جميع الباقات</option>
                        <option value="Starter">Starter</option>
                        <option value="Pro">Pro</option>
                        <option value="Business">Business</option>
                    </select>
                    <select className="input-field w-auto">
                        <option value="">جميع الحالات</option>
                        <option value="active">نشط</option>
                        <option value="pending">قيد المراجعة</option>
                        <option value="suspended">معلق</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="card overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 text-gray-600 text-sm">
                        <tr>
                            <th className="p-4 text-right">المتجر</th>
                            <th className="p-4 text-right">المالك</th>
                            <th className="p-4 text-right">الباقة</th>
                            <th className="p-4 text-right">المنتجات</th>
                            <th className="p-4 text-right">الطلبات</th>
                            <th className="p-4 text-right">الإيرادات</th>
                            <th className="p-4 text-right">الحالة</th>
                            <th className="p-4 text-right">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {tenants.map((tenant) => (
                            <tr key={tenant.id} className="hover:bg-gray-50">
                                <td className="p-4">
                                    <div>
                                        <p className="font-medium text-gray-900">{tenant.name}</p>
                                        <p className="text-xs text-gray-500">{tenant.slug}.coreflex.io</p>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div>
                                        <p className="text-sm text-gray-900">{tenant.owner}</p>
                                        <p className="text-xs text-gray-500">{tenant.email}</p>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${planColors[tenant.plan]}`}>
                                        {tenant.plan}
                                    </span>
                                </td>
                                <td className="p-4 text-gray-600">{tenant.products}</td>
                                <td className="p-4 text-gray-600">{tenant.orders}</td>
                                <td className="p-4 font-medium">{tenant.revenue.toLocaleString()} ر.س</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[tenant.status]}`}>
                                        {statusLabels[tenant.status]}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-1">
                                        <button className="p-2 hover:bg-gray-100 rounded-lg" title="زيارة المتجر">
                                            <ExternalLink className="w-4 h-4 text-gray-500" />
                                        </button>
                                        <button className="p-2 hover:bg-gray-100 rounded-lg" title="عرض">
                                            <Eye className="w-4 h-4 text-gray-500" />
                                        </button>
                                        <button className="p-2 hover:bg-gray-100 rounded-lg" title="تعديل">
                                            <Edit className="w-4 h-4 text-gray-500" />
                                        </button>
                                        <button className="p-2 hover:bg-yellow-50 rounded-lg" title="تعليق/تفعيل">
                                            <Power className="w-4 h-4 text-yellow-600" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Pagination */}
                <div className="p-4 border-t flex items-center justify-between">
                    <p className="text-sm text-gray-500">عرض 1-5 من 5 متجر</p>
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

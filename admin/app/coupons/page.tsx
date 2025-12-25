'use client'

import { useState } from 'react'
import { Plus, Edit, Trash2, Copy, Tag, Calendar, Percent, DollarSign } from 'lucide-react'

const coupons = [
    { id: '1', code: 'WELCOME20', type: 'percentage', value: 20, min_order: 100, usage_limit: 100, used: 45, expires: '2025-01-31', status: 'active' },
    { id: '2', code: 'SAVE50', type: 'fixed', value: 50, min_order: 200, usage_limit: 50, used: 23, expires: '2025-02-15', status: 'active' },
    { id: '3', code: 'FREESHIP', type: 'shipping', value: 0, min_order: 150, usage_limit: 200, used: 180, expires: '2024-12-31', status: 'expired' },
    { id: '4', code: 'VIP30', type: 'percentage', value: 30, min_order: 500, usage_limit: 20, used: 20, expires: '2025-03-01', status: 'exhausted' },
]

const typeLabels: Record<string, string> = {
    percentage: 'نسبة مئوية',
    fixed: 'مبلغ ثابت',
    shipping: 'شحن مجاني',
}

const statusColors: Record<string, string> = {
    active: 'bg-green-100 text-green-700',
    expired: 'bg-red-100 text-red-700',
    exhausted: 'bg-yellow-100 text-yellow-700',
}

const statusLabels: Record<string, string> = {
    active: 'نشط',
    expired: 'منتهي',
    exhausted: 'مستنفد',
}

export default function CouponsPage() {
    const copyCode = (code: string) => {
        navigator.clipboard.writeText(code)
        alert(`تم نسخ الكود: ${code}`)
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">الكوبونات</h1>
                    <p className="text-gray-500">{coupons.length} كوبون</p>
                </div>
                <button className="btn-primary flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    إضافة كوبون
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                <div className="stat-card text-center">
                    <p className="text-3xl font-bold text-green-600">{coupons.filter(c => c.status === 'active').length}</p>
                    <p className="text-sm text-gray-500">نشط</p>
                </div>
                <div className="stat-card text-center">
                    <p className="text-3xl font-bold text-gray-600">{coupons.reduce((sum, c) => sum + c.used, 0)}</p>
                    <p className="text-sm text-gray-500">إجمالي الاستخدام</p>
                </div>
                <div className="stat-card text-center">
                    <p className="text-3xl font-bold text-red-600">{coupons.filter(c => c.status === 'expired').length}</p>
                    <p className="text-sm text-gray-500">منتهي</p>
                </div>
            </div>

            {/* Coupons Table */}
            <div className="card overflow-hidden">
                <table className="w-full">
                    <thead className="table-header">
                        <tr>
                            <th className="p-4 text-right">الكود</th>
                            <th className="p-4 text-right">النوع</th>
                            <th className="p-4 text-right">القيمة</th>
                            <th className="p-4 text-right">الحد الأدنى</th>
                            <th className="p-4 text-right">الاستخدام</th>
                            <th className="p-4 text-right">الانتهاء</th>
                            <th className="p-4 text-right">الحالة</th>
                            <th className="p-4 text-right">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {coupons.map((coupon) => (
                            <tr key={coupon.id} className="hover:bg-gray-50">
                                <td className="p-4">
                                    <div className="flex items-center gap-2">
                                        <Tag className="w-4 h-4 text-primary-500" />
                                        <span className="font-mono font-bold text-primary-600">{coupon.code}</span>
                                        <button onClick={() => copyCode(coupon.code)} className="p-1 hover:bg-gray-100 rounded">
                                            <Copy className="w-3 h-3 text-gray-400" />
                                        </button>
                                    </div>
                                </td>
                                <td className="p-4 text-gray-600">{typeLabels[coupon.type]}</td>
                                <td className="p-4">
                                    <div className="flex items-center gap-1">
                                        {coupon.type === 'percentage' ? (
                                            <><Percent className="w-4 h-4 text-gray-400" />{coupon.value}%</>
                                        ) : coupon.type === 'fixed' ? (
                                            <><DollarSign className="w-4 h-4 text-gray-400" />{coupon.value} ر.س</>
                                        ) : (
                                            <span>مجاني</span>
                                        )}
                                    </div>
                                </td>
                                <td className="p-4 text-gray-600">{coupon.min_order} ر.س</td>
                                <td className="p-4">
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-primary-500"
                                                style={{ width: `${(coupon.used / coupon.usage_limit) * 100}%` }}
                                            />
                                        </div>
                                        <span className="text-sm text-gray-500">{coupon.used}/{coupon.usage_limit}</span>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-1 text-sm text-gray-500">
                                        <Calendar className="w-4 h-4" />
                                        {coupon.expires}
                                    </div>
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[coupon.status]}`}>
                                        {statusLabels[coupon.status]}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <div className="flex gap-1">
                                        <button className="p-2 hover:bg-gray-100 rounded-lg"><Edit className="w-4 h-4 text-gray-500" /></button>
                                        <button className="p-2 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4 text-red-500" /></button>
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

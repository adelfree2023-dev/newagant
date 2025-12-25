'use client'

import { Database, Download, Clock, CheckCircle, XCircle, Eye, FileText } from 'lucide-react'

const exports = [
    { id: 'EXP-001', tenant: 'متجر التقنية', owner: 'أحمد محمد', reason: 'نقل لسيرفر خاص', status: 'pending', requested: '2024-12-24', products: 156, orders: 450 },
    { id: 'EXP-002', tenant: 'دكان البيت', owner: 'نورة أحمد', reason: 'إغلاق النشاط', status: 'approved', requested: '2024-12-20', products: 234, orders: 670 },
    { id: 'EXP-003', tenant: 'متجر الرياضة', owner: 'عبدالله سعد', reason: 'تغيير المنصة', status: 'completed', requested: '2024-12-15', products: 67, orders: 120 },
]

const statusColors: Record<string, string> = { pending: 'bg-yellow-100 text-yellow-700', approved: 'bg-blue-100 text-blue-700', completed: 'bg-green-100 text-green-700', rejected: 'bg-red-100 text-red-700' }
const statusLabels: Record<string, string> = { pending: 'قيد المراجعة', approved: 'تمت الموافقة', completed: 'مكتمل', rejected: 'مرفوض' }

export default function ExportsPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">طلبات تصدير البيانات</h1>
                    <p className="text-gray-500">إدارة طلبات انفصال المتاجر</p>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
                <div className="stat-card text-center">
                    <Clock className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold">{exports.filter(e => e.status === 'pending').length}</p>
                    <p className="text-sm text-gray-500">قيد المراجعة</p>
                </div>
                <div className="stat-card text-center">
                    <CheckCircle className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold">{exports.filter(e => e.status === 'approved').length}</p>
                    <p className="text-sm text-gray-500">تمت الموافقة</p>
                </div>
                <div className="stat-card text-center">
                    <Database className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold">{exports.filter(e => e.status === 'completed').length}</p>
                    <p className="text-sm text-gray-500">مكتمل</p>
                </div>
            </div>

            <div className="card overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 text-gray-600 text-sm">
                        <tr>
                            <th className="p-4 text-right">رقم الطلب</th>
                            <th className="p-4 text-right">المتجر</th>
                            <th className="p-4 text-right">المالك</th>
                            <th className="p-4 text-right">السبب</th>
                            <th className="p-4 text-right">البيانات</th>
                            <th className="p-4 text-right">التاريخ</th>
                            <th className="p-4 text-right">الحالة</th>
                            <th className="p-4 text-right">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {exports.map((exp) => (
                            <tr key={exp.id} className="hover:bg-gray-50">
                                <td className="p-4 font-mono text-primary-600">{exp.id}</td>
                                <td className="p-4 font-medium">{exp.tenant}</td>
                                <td className="p-4 text-gray-600">{exp.owner}</td>
                                <td className="p-4 text-gray-500 text-sm">{exp.reason}</td>
                                <td className="p-4 text-sm">
                                    <span className="text-gray-600">{exp.products} منتج</span>
                                    <span className="mx-2">•</span>
                                    <span className="text-gray-600">{exp.orders} طلب</span>
                                </td>
                                <td className="p-4 text-gray-500">{exp.requested}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[exp.status]}`}>
                                        {statusLabels[exp.status]}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <div className="flex gap-1">
                                        <button className="p-2 hover:bg-gray-100 rounded-lg"><Eye className="w-4 h-4 text-gray-500" /></button>
                                        {exp.status === 'pending' && (
                                            <>
                                                <button className="p-2 hover:bg-green-50 rounded-lg"><CheckCircle className="w-4 h-4 text-green-500" /></button>
                                                <button className="p-2 hover:bg-red-50 rounded-lg"><XCircle className="w-4 h-4 text-red-500" /></button>
                                            </>
                                        )}
                                        {exp.status === 'completed' && (
                                            <button className="p-2 hover:bg-gray-100 rounded-lg"><Download className="w-4 h-4 text-gray-500" /></button>
                                        )}
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

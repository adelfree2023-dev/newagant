'use client'

import { DollarSign, TrendingUp, Download, Calendar, CreditCard, CheckCircle, XCircle, Clock } from 'lucide-react'

const payments = [
    { id: 'PAY-001', tenant: 'متجر التقنية', plan: 'Pro', amount: 299, method: 'card', status: 'paid', date: '2024-12-25' },
    { id: 'PAY-002', tenant: 'أزياء العصر', plan: 'Business', amount: 599, method: 'card', status: 'paid', date: '2024-12-24' },
    { id: 'PAY-003', tenant: 'مكتبة المعرفة', plan: 'Starter', amount: 99, method: 'bank', status: 'pending', date: '2024-12-23' },
    { id: 'PAY-004', tenant: 'دكان البيت', plan: 'Pro', amount: 299, method: 'card', status: 'paid', date: '2024-12-22' },
    { id: 'PAY-005', tenant: 'متجر الرياضة', plan: 'Starter', amount: 99, method: 'card', status: 'failed', date: '2024-12-21' },
]

const statusIcons: Record<string, any> = { paid: CheckCircle, pending: Clock, failed: XCircle }
const statusColors: Record<string, string> = { paid: 'text-green-600', pending: 'text-yellow-600', failed: 'text-red-600' }
const statusLabels: Record<string, string> = { paid: 'مدفوع', pending: 'قيد الانتظار', failed: 'فشل' }

export default function PaymentsPage() {
    const totalRevenue = payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0)

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">المدفوعات</h1>
                    <p className="text-gray-500">إدارة مدفوعات الاشتراكات</p>
                </div>
                <button className="btn-secondary flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    تصدير
                </button>
            </div>

            <div className="grid grid-cols-4 gap-4">
                <div className="stat-card">
                    <DollarSign className="w-8 h-8 text-green-600 mb-2" />
                    <p className="text-2xl font-bold text-gray-900">{totalRevenue} ر.س</p>
                    <p className="text-sm text-gray-500">الإيرادات الشهرية</p>
                </div>
                <div className="stat-card">
                    <CheckCircle className="w-8 h-8 text-green-600 mb-2" />
                    <p className="text-2xl font-bold text-gray-900">{payments.filter(p => p.status === 'paid').length}</p>
                    <p className="text-sm text-gray-500">مدفوعات ناجحة</p>
                </div>
                <div className="stat-card">
                    <Clock className="w-8 h-8 text-yellow-600 mb-2" />
                    <p className="text-2xl font-bold text-gray-900">{payments.filter(p => p.status === 'pending').length}</p>
                    <p className="text-sm text-gray-500">قيد الانتظار</p>
                </div>
                <div className="stat-card">
                    <XCircle className="w-8 h-8 text-red-600 mb-2" />
                    <p className="text-2xl font-bold text-gray-900">{payments.filter(p => p.status === 'failed').length}</p>
                    <p className="text-sm text-gray-500">فاشلة</p>
                </div>
            </div>

            <div className="card overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 text-gray-600 text-sm">
                        <tr>
                            <th className="p-4 text-right">رقم الدفع</th>
                            <th className="p-4 text-right">المتجر</th>
                            <th className="p-4 text-right">الباقة</th>
                            <th className="p-4 text-right">المبلغ</th>
                            <th className="p-4 text-right">الطريقة</th>
                            <th className="p-4 text-right">التاريخ</th>
                            <th className="p-4 text-right">الحالة</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {payments.map((payment) => {
                            const StatusIcon = statusIcons[payment.status]
                            return (
                                <tr key={payment.id} className="hover:bg-gray-50">
                                    <td className="p-4 font-mono text-primary-600">{payment.id}</td>
                                    <td className="p-4 font-medium">{payment.tenant}</td>
                                    <td className="p-4">{payment.plan}</td>
                                    <td className="p-4 font-bold">{payment.amount} ر.س</td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <CreditCard className="w-4 h-4 text-gray-400" />
                                            {payment.method === 'card' ? 'بطاقة' : 'تحويل'}
                                        </div>
                                    </td>
                                    <td className="p-4 text-gray-500">{payment.date}</td>
                                    <td className="p-4">
                                        <div className={`flex items-center gap-1 ${statusColors[payment.status]}`}>
                                            <StatusIcon className="w-4 h-4" />
                                            {statusLabels[payment.status]}
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

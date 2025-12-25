'use client'

import { BarChart3, TrendingUp, DollarSign, Store, Users, Package, Download } from 'lucide-react'

const stats = [
    { title: 'إجمالي الإيرادات', value: '156,800', unit: 'ر.س', change: '+23%', icon: DollarSign, color: 'text-green-600' },
    { title: 'المتاجر النشطة', value: '142', change: '+12', icon: Store, color: 'text-blue-600' },
    { title: 'المستخدمين', value: '1,245', change: '+85', icon: Users, color: 'text-purple-600' },
    { title: 'إجمالي المنتجات', value: '12,456', change: '+456', icon: Package, color: 'text-orange-600' },
]

const topTenants = [
    { name: 'متجر التقنية', revenue: 45600, orders: 450, growth: '+18%' },
    { name: 'أزياء العصر', revenue: 38900, orders: 380, growth: '+15%' },
    { name: 'دكان البيت', revenue: 32400, orders: 310, growth: '+22%' },
    { name: 'مكتبة المعرفة', revenue: 21500, orders: 215, growth: '+8%' },
    { name: 'متجر الرياضة', revenue: 18400, orders: 184, growth: '+5%' },
]

const planDistribution = [
    { name: 'Starter', count: 45, color: 'bg-gray-500' },
    { name: 'Pro', count: 78, color: 'bg-blue-500' },
    { name: 'Business', count: 33, color: 'bg-purple-500' },
]

export default function ReportsPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">التقارير</h1>
                    <p className="text-gray-500">تحليل أداء المنصة</p>
                </div>
                <div className="flex gap-2">
                    <select className="input-field w-auto">
                        <option value="month">هذا الشهر</option>
                        <option value="quarter">هذا الربع</option>
                        <option value="year">هذا العام</option>
                    </select>
                    <button className="btn-secondary flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        تصدير
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                    <div key={index} className="stat-card">
                        <stat.icon className={`w-8 h-8 ${stat.color} mb-2`} />
                        <p className="text-2xl font-bold text-gray-900">
                            {stat.value} {stat.unit && <span className="text-base font-normal">{stat.unit}</span>}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                            <p className="text-sm text-gray-500">{stat.title}</p>
                            <span className="text-sm text-green-600">{stat.change}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 card p-6">
                    <h2 className="font-bold text-gray-900 mb-4">أفضل المتاجر أداءً</h2>
                    <table className="w-full">
                        <thead className="text-gray-600 text-sm">
                            <tr>
                                <th className="text-right pb-3">#</th>
                                <th className="text-right pb-3">المتجر</th>
                                <th className="text-right pb-3">الإيرادات</th>
                                <th className="text-right pb-3">الطلبات</th>
                                <th className="text-right pb-3">النمو</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {topTenants.map((tenant, index) => (
                                <tr key={index}>
                                    <td className="py-3 text-gray-400">{index + 1}</td>
                                    <td className="py-3 font-medium">{tenant.name}</td>
                                    <td className="py-3">{tenant.revenue.toLocaleString()} ر.س</td>
                                    <td className="py-3">{tenant.orders}</td>
                                    <td className="py-3 text-green-600">{tenant.growth}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="card p-6">
                    <h2 className="font-bold text-gray-900 mb-4">توزيع الباقات</h2>
                    <div className="space-y-4">
                        {planDistribution.map((plan, index) => (
                            <div key={index}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span>{plan.name}</span>
                                    <span className="text-gray-500">{plan.count} متجر</span>
                                </div>
                                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full ${plan.color}`}
                                        style={{ width: `${(plan.count / 156) * 100}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

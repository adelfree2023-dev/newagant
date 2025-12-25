'use client'

import { Activity, User, Store, Settings, Shield, Clock, Filter, Search, Eye } from 'lucide-react'

const auditLogs = [
    { id: '1', action: 'تسجيل دخول', user: 'أدمن رئيسي', target: '-', ip: '192.168.1.1', time: '2024-12-25 10:30:00', type: 'auth' },
    { id: '2', action: 'إنشاء متجر', user: 'أدمن رئيسي', target: 'متجر التقنية', ip: '192.168.1.1', time: '2024-12-25 09:45:00', type: 'create' },
    { id: '3', action: 'تعديل باقة', user: 'أدمن رئيسي', target: 'Pro Plan', ip: '192.168.1.1', time: '2024-12-25 09:30:00', type: 'update' },
    { id: '4', action: 'تعليق متجر', user: 'أدمن رئيسي', target: 'متجر الرياضة', ip: '192.168.1.1', time: '2024-12-24 16:00:00', type: 'suspend' },
    { id: '5', action: 'تغيير إعدادات', user: 'أدمن رئيسي', target: 'إعدادات المنصة', ip: '192.168.1.1', time: '2024-12-24 14:20:00', type: 'settings' },
    { id: '6', action: 'موافقة على طلب تصدير', user: 'أدمن رئيسي', target: 'دكان البيت', ip: '192.168.1.1', time: '2024-12-24 11:00:00', type: 'approve' },
    { id: '7', action: 'إضافة مستخدم', user: 'أدمن رئيسي', target: 'محمد خالد', ip: '192.168.1.1', time: '2024-12-23 15:30:00', type: 'create' },
]

const typeIcons: Record<string, any> = { auth: User, create: Store, update: Settings, suspend: Shield, settings: Settings, approve: Activity }
const typeColors: Record<string, string> = { auth: 'bg-blue-100 text-blue-600', create: 'bg-green-100 text-green-600', update: 'bg-yellow-100 text-yellow-600', suspend: 'bg-red-100 text-red-600', settings: 'bg-purple-100 text-purple-600', approve: 'bg-green-100 text-green-600' }

export default function AuditPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">سجل النشاط</h1>
                    <p className="text-gray-500">تتبع جميع العمليات على المنصة</p>
                </div>
            </div>

            <div className="card p-4">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex-grow max-w-md relative">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input type="text" placeholder="ابحث في السجل..." className="input-field pr-10" />
                    </div>
                    <select className="input-field w-auto">
                        <option value="">جميع العمليات</option>
                        <option value="auth">تسجيل دخول</option>
                        <option value="create">إنشاء</option>
                        <option value="update">تعديل</option>
                        <option value="suspend">تعليق</option>
                    </select>
                    <input type="date" className="input-field w-auto" />
                </div>
            </div>

            <div className="card divide-y">
                {auditLogs.map((log) => {
                    const Icon = typeIcons[log.type] || Activity
                    return (
                        <div key={log.id} className="p-4 flex items-center gap-4 hover:bg-gray-50">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${typeColors[log.type]}`}>
                                <Icon className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                                <p className="font-medium text-gray-900">{log.action}</p>
                                <p className="text-sm text-gray-500">
                                    <span>{log.user}</span>
                                    {log.target !== '-' && <span> • {log.target}</span>}
                                </p>
                            </div>
                            <div className="text-left">
                                <p className="text-sm text-gray-500 flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    {log.time}
                                </p>
                                <p className="text-xs text-gray-400">IP: {log.ip}</p>
                            </div>
                            <button className="p-2 hover:bg-gray-100 rounded-lg">
                                <Eye className="w-4 h-4 text-gray-400" />
                            </button>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

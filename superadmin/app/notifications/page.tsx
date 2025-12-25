'use client'

import { Bell, Check, Trash2, Settings, Eye, Clock, Store, CreditCard, Shield } from 'lucide-react'

const notifications = [
    { id: '1', type: 'store', title: 'متجر جديد مسجل', message: 'تم تسجيل "مكتبة المعرفة" وبانتظار التفعيل', time: 'منذ 10 دقائق', read: false },
    { id: '2', type: 'payment', title: 'دفعة ناجحة', message: 'متجر التقنية دفع اشتراك Pro بقيمة 299 ر.س', time: 'منذ ساعة', read: false },
    { id: '3', type: 'alert', title: 'تنبيه أمني', message: 'محاولة دخول فاشلة من IP مجهول', time: 'منذ 2 ساعة', read: false },
    { id: '4', type: 'store', title: 'طلب تصدير بيانات', message: 'دكان البيت طلب تصدير بياناته', time: 'منذ 3 ساعات', read: true },
    { id: '5', type: 'payment', title: 'فشل في الدفع', message: 'فشل تجديد اشتراك متجر الرياضة', time: 'منذ يوم', read: true },
]

const typeIcons: Record<string, any> = { store: Store, payment: CreditCard, alert: Shield }
const typeColors: Record<string, string> = { store: 'bg-blue-100 text-blue-600', payment: 'bg-green-100 text-green-600', alert: 'bg-red-100 text-red-600' }

export default function NotificationsPage() {
    const unreadCount = notifications.filter(n => !n.read).length

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">الإشعارات</h1>
                    <p className="text-gray-500">{unreadCount} إشعار غير مقروء</p>
                </div>
                <div className="flex gap-2">
                    <button className="btn-secondary flex items-center gap-2">
                        <Check className="w-4 h-4" />
                        تعليم الكل كمقروء
                    </button>
                    <button className="btn-secondary">
                        <Settings className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="card divide-y">
                {notifications.map((notification) => {
                    const Icon = typeIcons[notification.type] || Bell
                    return (
                        <div key={notification.id} className={`p-4 flex items-center gap-4 hover:bg-gray-50 ${!notification.read ? 'bg-blue-50/30' : ''}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${typeColors[notification.type]}`}>
                                <Icon className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <p className="font-medium text-gray-900">{notification.title}</p>
                                    {!notification.read && <span className="w-2 h-2 bg-blue-500 rounded-full" />}
                                </div>
                                <p className="text-sm text-gray-500">{notification.message}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-400 flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {notification.time}
                                </span>
                                <button className="p-2 hover:bg-gray-100 rounded-lg"><Eye className="w-4 h-4 text-gray-400" /></button>
                                <button className="p-2 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4 text-red-400" /></button>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

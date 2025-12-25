'use client'

import { useState } from 'react'
import { Shield, Key, Smartphone, Globe, Clock, Save, AlertTriangle, CheckCircle } from 'lucide-react'

const loginHistory = [
    { ip: '192.168.1.1', device: 'Chrome / Windows', location: 'الرياض', time: '2024-12-25 10:30', status: 'success' },
    { ip: '192.168.1.1', device: 'Safari / iPhone', location: 'الرياض', time: '2024-12-24 16:45', status: 'success' },
    { ip: '85.123.45.67', device: 'Unknown', location: 'مجهول', time: '2024-12-24 14:20', status: 'failed' },
    { ip: '192.168.1.1', device: 'Chrome / Windows', location: 'الرياض', time: '2024-12-23 09:00', status: 'success' },
]

export default function SecurityPage() {
    const [twoFactor, setTwoFactor] = useState(false)

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">الأمان</h1>
                    <p className="text-gray-500">إعدادات الأمان وتسجيل الدخول</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Password */}
                <div className="card p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Key className="w-5 h-5 text-blue-600" />
                        </div>
                        <h2 className="font-bold text-gray-900">تغيير كلمة المرور</h2>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block mb-2 text-sm font-medium">كلمة المرور الحالية</label>
                            <input type="password" className="input-field" placeholder="••••••••" />
                        </div>
                        <div>
                            <label className="block mb-2 text-sm font-medium">كلمة المرور الجديدة</label>
                            <input type="password" className="input-field" placeholder="••••••••" />
                        </div>
                        <div>
                            <label className="block mb-2 text-sm font-medium">تأكيد كلمة المرور</label>
                            <input type="password" className="input-field" placeholder="••••••••" />
                        </div>
                        <button className="btn-primary w-full">تغيير كلمة المرور</button>
                    </div>
                </div>

                {/* Two Factor */}
                <div className="card p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <Smartphone className="w-5 h-5 text-green-600" />
                        </div>
                        <h2 className="font-bold text-gray-900">المصادقة الثنائية</h2>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg mb-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-gray-900">المصادقة الثنائية (2FA)</p>
                                <p className="text-sm text-gray-500">طبقة حماية إضافية لحسابك</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" checked={twoFactor} onChange={(e) => setTwoFactor(e.target.checked)} className="sr-only peer" />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:-translate-x-full peer-checked:bg-primary-600 after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                            </label>
                        </div>
                    </div>
                    {!twoFactor && (
                        <div className="flex items-start gap-3 p-4 bg-yellow-50 rounded-lg">
                            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-yellow-800">يُنصح بتفعيل المصادقة الثنائية لحماية حسابك</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Login History */}
            <div className="card">
                <div className="p-4 border-b">
                    <h2 className="font-bold text-gray-900">سجل تسجيل الدخول</h2>
                </div>
                <table className="w-full">
                    <thead className="bg-gray-50 text-gray-600 text-sm">
                        <tr>
                            <th className="p-4 text-right">IP</th>
                            <th className="p-4 text-right">الجهاز</th>
                            <th className="p-4 text-right">الموقع</th>
                            <th className="p-4 text-right">الوقت</th>
                            <th className="p-4 text-right">الحالة</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {loginHistory.map((log, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                                <td className="p-4 font-mono text-sm">{log.ip}</td>
                                <td className="p-4">{log.device}</td>
                                <td className="p-4 flex items-center gap-1"><Globe className="w-4 h-4 text-gray-400" />{log.location}</td>
                                <td className="p-4 text-gray-500 text-sm">{log.time}</td>
                                <td className="p-4">
                                    <span className={`flex items-center gap-1 ${log.status === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                                        {log.status === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                                        {log.status === 'success' ? 'ناجح' : 'فاشل'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

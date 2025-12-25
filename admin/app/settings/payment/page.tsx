'use client'

import { useState } from 'react'
import { CreditCard, Check, Save, ExternalLink } from 'lucide-react'

const paymentMethods = [
    { id: 'cod', name: 'الدفع عند الاستلام', icon: '💵', enabled: true },
    { id: 'card', name: 'بطاقة ائتمان', icon: '💳', enabled: true, provider: 'Stripe' },
    { id: 'applepay', name: 'Apple Pay', icon: '🍎', enabled: false },
    { id: 'mada', name: 'مدى', icon: '🏦', enabled: true },
    { id: 'stcpay', name: 'STC Pay', icon: '📱', enabled: false },
    { id: 'tamara', name: 'تمارا (تقسيط)', icon: '🔄', enabled: false },
]

export default function PaymentSettingsPage() {
    const [methods, setMethods] = useState(paymentMethods)

    const toggleMethod = (id: string) => {
        setMethods(methods.map(m =>
            m.id === id ? { ...m, enabled: !m.enabled } : m
        ))
    }

    const handleSave = () => alert('تم حفظ إعدادات الدفع!')

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">إعدادات الدفع</h1>
                    <p className="text-gray-500">إدارة طرق الدفع المتاحة</p>
                </div>
                <button onClick={handleSave} className="btn-primary flex items-center gap-2">
                    <Save className="w-5 h-5" />
                    حفظ التغييرات
                </button>
            </div>

            {/* Payment Methods */}
            <div className="card">
                <div className="p-4 border-b">
                    <h2 className="font-bold text-gray-900">طرق الدفع</h2>
                </div>
                <div className="divide-y">
                    {methods.map((method) => (
                        <div key={method.id} className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <span className="text-3xl">{method.icon}</span>
                                <div>
                                    <p className="font-medium text-gray-900">{method.name}</p>
                                    {method.provider && (
                                        <p className="text-sm text-gray-500">مزود: {method.provider}</p>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                {method.enabled && method.id !== 'cod' && (
                                    <button className="text-sm text-primary-600 hover:underline flex items-center gap-1">
                                        <ExternalLink className="w-4 h-4" />
                                        إعدادات
                                    </button>
                                )}
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={method.enabled}
                                        onChange={() => toggleMethod(method.id)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:-translate-x-full peer-checked:bg-primary-600 after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                                </label>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* API Keys */}
            <div className="card p-6">
                <h2 className="font-bold text-gray-900 mb-4">مفاتيح API</h2>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block mb-2 text-sm font-medium">Stripe Public Key</label>
                        <input
                            type="text"
                            placeholder="pk_live_..."
                            className="input-field font-mono text-sm"
                            dir="ltr"
                        />
                    </div>
                    <div>
                        <label className="block mb-2 text-sm font-medium">Stripe Secret Key</label>
                        <input
                            type="password"
                            placeholder="sk_live_..."
                            className="input-field font-mono text-sm"
                            dir="ltr"
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

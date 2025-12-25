'use client'

import { useState } from 'react'
import { Globe, Mail, Bell, Shield, Palette, Save, Database, Server } from 'lucide-react'

export default function SettingsPage() {
    const [settings, setSettings] = useState({
        platform_name: 'CoreFlex',
        platform_url: 'https://coreflex.io',
        support_email: 'support@coreflex.io',
        trial_days: 14,
        default_language: 'ar',
        maintenance_mode: false,
        registration_enabled: true,
        email_verification: true,
    })

    const handleSave = () => alert('تم حفظ الإعدادات!')

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">إعدادات المنصة</h1>
                    <p className="text-gray-500">إعدادات النظام العامة</p>
                </div>
                <button onClick={handleSave} className="btn-primary flex items-center gap-2">
                    <Save className="w-5 h-5" />
                    حفظ التغييرات
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* General */}
                <div className="card p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Globe className="w-5 h-5 text-blue-600" />
                        </div>
                        <h2 className="font-bold text-gray-900">إعدادات عامة</h2>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block mb-2 text-sm font-medium">اسم المنصة</label>
                            <input type="text" value={settings.platform_name} onChange={(e) => setSettings({ ...settings, platform_name: e.target.value })} className="input-field" />
                        </div>
                        <div>
                            <label className="block mb-2 text-sm font-medium">رابط المنصة</label>
                            <input type="url" value={settings.platform_url} onChange={(e) => setSettings({ ...settings, platform_url: e.target.value })} className="input-field" dir="ltr" />
                        </div>
                        <div>
                            <label className="block mb-2 text-sm font-medium">بريد الدعم</label>
                            <input type="email" value={settings.support_email} onChange={(e) => setSettings({ ...settings, support_email: e.target.value })} className="input-field" dir="ltr" />
                        </div>
                        <div>
                            <label className="block mb-2 text-sm font-medium">فترة التجربة (أيام)</label>
                            <input type="number" value={settings.trial_days} onChange={(e) => setSettings({ ...settings, trial_days: parseInt(e.target.value) })} className="input-field" />
                        </div>
                    </div>
                </div>

                {/* System */}
                <div className="card p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Server className="w-5 h-5 text-purple-600" />
                        </div>
                        <h2 className="font-bold text-gray-900">إعدادات النظام</h2>
                    </div>
                    <div className="space-y-4">
                        <label className="flex items-center justify-between cursor-pointer p-3 bg-gray-50 rounded-lg">
                            <span className="text-sm font-medium">وضع الصيانة</span>
                            <input type="checkbox" checked={settings.maintenance_mode} onChange={(e) => setSettings({ ...settings, maintenance_mode: e.target.checked })} className="w-5 h-5 rounded text-primary-600" />
                        </label>
                        <label className="flex items-center justify-between cursor-pointer p-3 bg-gray-50 rounded-lg">
                            <span className="text-sm font-medium">السماح بالتسجيل</span>
                            <input type="checkbox" checked={settings.registration_enabled} onChange={(e) => setSettings({ ...settings, registration_enabled: e.target.checked })} className="w-5 h-5 rounded text-primary-600" />
                        </label>
                        <label className="flex items-center justify-between cursor-pointer p-3 bg-gray-50 rounded-lg">
                            <span className="text-sm font-medium">التحقق من البريد</span>
                            <input type="checkbox" checked={settings.email_verification} onChange={(e) => setSettings({ ...settings, email_verification: e.target.checked })} className="w-5 h-5 rounded text-primary-600" />
                        </label>
                        <div>
                            <label className="block mb-2 text-sm font-medium">اللغة الافتراضية</label>
                            <select value={settings.default_language} onChange={(e) => setSettings({ ...settings, default_language: e.target.value })} className="input-field">
                                <option value="ar">العربية</option>
                                <option value="en">English</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

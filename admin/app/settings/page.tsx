'use client'

import { useState } from 'react'
import { Store, Globe, Palette, Bell, Shield, Save } from 'lucide-react'

export default function SettingsPage() {
    const [settings, setSettings] = useState({
        store_name: 'المتجر',
        store_name_ar: 'المتجر',
        email: 'support@store.com',
        phone: '+966920000000',
        address: 'الرياض، المملكة العربية السعودية',
        currency: 'SAR',
        language: 'ar',
        primary_color: '#DC2626',
        secondary_color: '#F59E0B',
        notifications_email: true,
        notifications_sms: false,
        notifications_push: true,
    })

    const handleSave = () => {
        console.log('Settings saved:', settings)
        alert('تم حفظ الإعدادات بنجاح!')
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">الإعدادات</h1>
                    <p className="text-gray-500">إدارة إعدادات متجرك</p>
                </div>
                <button onClick={handleSave} className="btn-primary flex items-center gap-2">
                    <Save className="w-5 h-5" />
                    حفظ التغييرات
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Store Info */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="card p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                                <Store className="w-5 h-5 text-primary-600" />
                            </div>
                            <h2 className="font-bold text-gray-900">معلومات المتجر</h2>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block mb-2 text-sm font-medium">اسم المتجر (عربي)</label>
                                <input
                                    type="text"
                                    value={settings.store_name_ar}
                                    onChange={(e) => setSettings({ ...settings, store_name_ar: e.target.value })}
                                    className="input-field"
                                />
                            </div>
                            <div>
                                <label className="block mb-2 text-sm font-medium">اسم المتجر (انجليزي)</label>
                                <input
                                    type="text"
                                    value={settings.store_name}
                                    onChange={(e) => setSettings({ ...settings, store_name: e.target.value })}
                                    className="input-field"
                                    dir="ltr"
                                />
                            </div>
                            <div>
                                <label className="block mb-2 text-sm font-medium">البريد الإلكتروني</label>
                                <input
                                    type="email"
                                    value={settings.email}
                                    onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                                    className="input-field"
                                    dir="ltr"
                                />
                            </div>
                            <div>
                                <label className="block mb-2 text-sm font-medium">رقم الهاتف</label>
                                <input
                                    type="tel"
                                    value={settings.phone}
                                    onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                                    className="input-field"
                                    dir="ltr"
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="block mb-2 text-sm font-medium">العنوان</label>
                                <textarea
                                    value={settings.address}
                                    onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                                    className="input-field"
                                    rows={2}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Localization */}
                    <div className="card p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Globe className="w-5 h-5 text-blue-600" />
                            </div>
                            <h2 className="font-bold text-gray-900">الإقليمية</h2>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block mb-2 text-sm font-medium">العملة</label>
                                <select
                                    value={settings.currency}
                                    onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                                    className="input-field"
                                >
                                    <option value="SAR">ريال سعودي (SAR)</option>
                                    <option value="AED">درهم إماراتي (AED)</option>
                                    <option value="USD">دولار أمريكي (USD)</option>
                                    <option value="EUR">يورو (EUR)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block mb-2 text-sm font-medium">اللغة الافتراضية</label>
                                <select
                                    value={settings.language}
                                    onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                                    className="input-field"
                                >
                                    <option value="ar">العربية</option>
                                    <option value="en">English</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Theme */}
                    <div className="card p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                <Palette className="w-5 h-5 text-purple-600" />
                            </div>
                            <h2 className="font-bold text-gray-900">المظهر</h2>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block mb-2 text-sm font-medium">اللون الرئيسي</label>
                                <div className="flex gap-2">
                                    <input
                                        type="color"
                                        value={settings.primary_color}
                                        onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })}
                                        className="w-12 h-10 rounded border cursor-pointer"
                                    />
                                    <input
                                        type="text"
                                        value={settings.primary_color}
                                        onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })}
                                        className="input-field flex-1"
                                        dir="ltr"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block mb-2 text-sm font-medium">اللون الثانوي</label>
                                <div className="flex gap-2">
                                    <input
                                        type="color"
                                        value={settings.secondary_color}
                                        onChange={(e) => setSettings({ ...settings, secondary_color: e.target.value })}
                                        className="w-12 h-10 rounded border cursor-pointer"
                                    />
                                    <input
                                        type="text"
                                        value={settings.secondary_color}
                                        onChange={(e) => setSettings({ ...settings, secondary_color: e.target.value })}
                                        className="input-field flex-1"
                                        dir="ltr"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Notifications */}
                    <div className="card p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                <Bell className="w-5 h-5 text-orange-600" />
                            </div>
                            <h2 className="font-bold text-gray-900">الإشعارات</h2>
                        </div>

                        <div className="space-y-4">
                            <label className="flex items-center justify-between cursor-pointer">
                                <span className="text-sm">إشعارات البريد</span>
                                <input
                                    type="checkbox"
                                    checked={settings.notifications_email}
                                    onChange={(e) => setSettings({ ...settings, notifications_email: e.target.checked })}
                                    className="w-5 h-5 rounded text-primary-600"
                                />
                            </label>
                            <label className="flex items-center justify-between cursor-pointer">
                                <span className="text-sm">إشعارات SMS</span>
                                <input
                                    type="checkbox"
                                    checked={settings.notifications_sms}
                                    onChange={(e) => setSettings({ ...settings, notifications_sms: e.target.checked })}
                                    className="w-5 h-5 rounded text-primary-600"
                                />
                            </label>
                            <label className="flex items-center justify-between cursor-pointer">
                                <span className="text-sm">إشعارات المتصفح</span>
                                <input
                                    type="checkbox"
                                    checked={settings.notifications_push}
                                    onChange={(e) => setSettings({ ...settings, notifications_push: e.target.checked })}
                                    className="w-5 h-5 rounded text-primary-600"
                                />
                            </label>
                        </div>
                    </div>

                    {/* Security */}
                    <div className="card p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                <Shield className="w-5 h-5 text-green-600" />
                            </div>
                            <h2 className="font-bold text-gray-900">الأمان</h2>
                        </div>

                        <div className="space-y-3">
                            <button className="w-full btn-secondary text-sm">تغيير كلمة المرور</button>
                            <button className="w-full btn-secondary text-sm">تفعيل المصادقة الثنائية</button>
                            <button className="w-full btn-secondary text-sm">سجل الدخول</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

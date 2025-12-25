'use client'

import { useState } from 'react'
import { Store, Upload, Save } from 'lucide-react'

export default function StoreSettingsPage() {
    const [settings, setSettings] = useState({
        name: 'المتجر',
        name_en: 'My Store',
        description: 'متجرك الإلكتروني المميز',
        email: 'support@store.com',
        phone: '+966920000000',
        address: 'الرياض، المملكة العربية السعودية',
        tax_number: '123456789',
        currency: 'SAR',
        timezone: 'Asia/Riyadh',
    })

    const handleSave = () => alert('تم حفظ الإعدادات!')

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">إعدادات المتجر</h1>
                    <p className="text-gray-500">معلومات متجرك الأساسية</p>
                </div>
                <button onClick={handleSave} className="btn-primary flex items-center gap-2">
                    <Save className="w-5 h-5" />
                    حفظ التغييرات
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Logo & Info */}
                <div className="card p-6">
                    <h2 className="font-bold text-gray-900 mb-4">شعار المتجر</h2>
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-primary-500 transition cursor-pointer">
                        <div className="w-20 h-20 bg-primary-100 rounded-xl mx-auto mb-3 flex items-center justify-center">
                            <Store className="w-10 h-10 text-primary-600" />
                        </div>
                        <p className="text-sm text-gray-500">اضغط لرفع الشعار</p>
                        <p className="text-xs text-gray-400">PNG, JPG حتى 2MB</p>
                    </div>
                </div>

                {/* Store Info */}
                <div className="lg:col-span-2 card p-6">
                    <h2 className="font-bold text-gray-900 mb-4">معلومات المتجر</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block mb-2 text-sm font-medium">اسم المتجر (عربي)</label>
                            <input
                                type="text"
                                value={settings.name}
                                onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                                className="input-field"
                            />
                        </div>
                        <div>
                            <label className="block mb-2 text-sm font-medium">اسم المتجر (انجليزي)</label>
                            <input
                                type="text"
                                value={settings.name_en}
                                onChange={(e) => setSettings({ ...settings, name_en: e.target.value })}
                                className="input-field"
                                dir="ltr"
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="block mb-2 text-sm font-medium">وصف المتجر</label>
                            <textarea
                                value={settings.description}
                                onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                                className="input-field"
                                rows={3}
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
                            <input
                                type="text"
                                value={settings.address}
                                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                                className="input-field"
                            />
                        </div>
                        <div>
                            <label className="block mb-2 text-sm font-medium">الرقم الضريبي</label>
                            <input
                                type="text"
                                value={settings.tax_number}
                                onChange={(e) => setSettings({ ...settings, tax_number: e.target.value })}
                                className="input-field"
                                dir="ltr"
                            />
                        </div>
                        <div>
                            <label className="block mb-2 text-sm font-medium">العملة</label>
                            <select
                                value={settings.currency}
                                onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                                className="input-field"
                            >
                                <option value="SAR">ريال سعودي (SAR)</option>
                                <option value="AED">درهم إماراتي (AED)</option>
                                <option value="USD">دولار (USD)</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

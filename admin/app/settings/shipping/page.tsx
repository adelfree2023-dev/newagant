'use client'

import { useState } from 'react'
import { Truck, Plus, Edit, Trash2, Save, MapPin } from 'lucide-react'

const shippingZones = [
    { id: '1', name: 'الرياض', cities: ['الرياض', 'الخرج'], price: 25, free_above: 200, days: '1-2' },
    { id: '2', name: 'المنطقة الوسطى', cities: ['القصيم', 'حائل'], price: 35, free_above: 300, days: '2-3' },
    { id: '3', name: 'المنطقة الشرقية', cities: ['الدمام', 'الخبر', 'الأحساء'], price: 30, free_above: 250, days: '2-3' },
    { id: '4', name: 'المنطقة الغربية', cities: ['جدة', 'مكة', 'المدينة'], price: 35, free_above: 300, days: '3-4' },
]

const shippingCompanies = [
    { id: 'aramex', name: 'أرامكس', enabled: true, logo: '📦' },
    { id: 'smsa', name: 'SMSA', enabled: true, logo: '🚚' },
    { id: 'dhl', name: 'DHL', enabled: false, logo: '✈️' },
    { id: 'fetchr', name: 'فتشر', enabled: false, logo: '🏃' },
]

export default function ShippingSettingsPage() {
    const [companies, setCompanies] = useState(shippingCompanies)

    const toggleCompany = (id: string) => {
        setCompanies(companies.map(c =>
            c.id === id ? { ...c, enabled: !c.enabled } : c
        ))
    }

    const handleSave = () => alert('تم حفظ إعدادات الشحن!')

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">إعدادات الشحن</h1>
                    <p className="text-gray-500">إدارة مناطق وشركات الشحن</p>
                </div>
                <button onClick={handleSave} className="btn-primary flex items-center gap-2">
                    <Save className="w-5 h-5" />
                    حفظ التغييرات
                </button>
            </div>

            {/* Shipping Zones */}
            <div className="card">
                <div className="p-4 border-b flex items-center justify-between">
                    <h2 className="font-bold text-gray-900">مناطق الشحن</h2>
                    <button className="btn-secondary flex items-center gap-2 text-sm">
                        <Plus className="w-4 h-4" />
                        إضافة منطقة
                    </button>
                </div>
                <table className="w-full">
                    <thead className="table-header">
                        <tr>
                            <th className="p-4 text-right">المنطقة</th>
                            <th className="p-4 text-right">المدن</th>
                            <th className="p-4 text-right">سعر الشحن</th>
                            <th className="p-4 text-right">شحن مجاني فوق</th>
                            <th className="p-4 text-right">مدة التوصيل</th>
                            <th className="p-4 text-right">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {shippingZones.map((zone) => (
                            <tr key={zone.id} className="hover:bg-gray-50">
                                <td className="p-4">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-primary-500" />
                                        <span className="font-medium text-gray-900">{zone.name}</span>
                                    </div>
                                </td>
                                <td className="p-4 text-gray-600 text-sm">{zone.cities.join('، ')}</td>
                                <td className="p-4 font-bold">{zone.price} ر.س</td>
                                <td className="p-4 text-gray-600">{zone.free_above} ر.س</td>
                                <td className="p-4 text-gray-600">{zone.days} أيام</td>
                                <td className="p-4">
                                    <div className="flex gap-1">
                                        <button className="p-2 hover:bg-gray-100 rounded-lg"><Edit className="w-4 h-4 text-gray-500" /></button>
                                        <button className="p-2 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4 text-red-500" /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Shipping Companies */}
            <div className="card">
                <div className="p-4 border-b">
                    <h2 className="font-bold text-gray-900">شركات الشحن</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
                    {companies.map((company) => (
                        <div
                            key={company.id}
                            onClick={() => toggleCompany(company.id)}
                            className={`p-4 border-2 rounded-xl cursor-pointer transition ${company.enabled
                                    ? 'border-primary-500 bg-primary-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                        >
                            <div className="text-center">
                                <span className="text-3xl">{company.logo}</span>
                                <p className="font-medium text-gray-900 mt-2">{company.name}</p>
                                <span className={`text-xs ${company.enabled ? 'text-primary-600' : 'text-gray-400'}`}>
                                    {company.enabled ? 'مفعل' : 'غير مفعل'}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

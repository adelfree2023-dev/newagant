'use client'

import { useState } from 'react'
import { MapPin, Plus, Edit, Trash2, Home, Building, Check } from 'lucide-react'

const initialAddresses = [
    { id: '1', name: 'المنزل', recipient: 'أحمد محمد', phone: '+966500000000', address: 'الرياض، حي العليا، شارع الملك فهد، مبنى 123، الطابق 2', city: 'الرياض', isDefault: true },
    { id: '2', name: 'العمل', recipient: 'أحمد محمد', phone: '+966500000000', address: 'الرياض، حي الملقا، طريق الملك سلمان، برج الأعمال', city: 'الرياض', isDefault: false },
]

export default function AddressesPage() {
    const [addresses, setAddresses] = useState(initialAddresses)
    const [showForm, setShowForm] = useState(false)

    const setDefaultAddress = (id: string) => {
        setAddresses(addresses.map(addr => ({ ...addr, isDefault: addr.id === id })))
    }

    const deleteAddress = (id: string) => {
        if (confirm('هل أنت متأكد من حذف هذا العنوان؟')) {
            setAddresses(addresses.filter(addr => addr.id !== id))
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-3xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">عناويني</h1>
                        <p className="text-gray-500">{addresses.length} عنوان</p>
                    </div>
                    <button
                        onClick={() => setShowForm(true)}
                        className="bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        إضافة عنوان
                    </button>
                </div>

                {/* Addresses */}
                <div className="space-y-4">
                    {addresses.map((addr) => (
                        <div key={addr.id} className={`bg-white rounded-2xl shadow-sm p-6 border-2 transition ${addr.isDefault ? 'border-primary-500' : 'border-transparent'}`}>
                            <div className="flex items-start justify-between">
                                <div className="flex items-start gap-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${addr.name === 'المنزل' ? 'bg-blue-100' : 'bg-purple-100'}`}>
                                        {addr.name === 'المنزل' ? (
                                            <Home className="w-6 h-6 text-blue-600" />
                                        ) : (
                                            <Building className="w-6 h-6 text-purple-600" />
                                        )}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-bold text-gray-900">{addr.name}</h3>
                                            {addr.isDefault && (
                                                <span className="bg-primary-100 text-primary-700 text-xs px-2 py-0.5 rounded-full">الافتراضي</span>
                                            )}
                                        </div>
                                        <p className="text-gray-600">{addr.recipient}</p>
                                        <p className="text-gray-500 text-sm mt-1">{addr.address}</p>
                                        <p className="text-gray-500 text-sm">{addr.phone}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button className="p-2 hover:bg-gray-100 rounded-lg">
                                        <Edit className="w-4 h-4 text-gray-500" />
                                    </button>
                                    <button onClick={() => deleteAddress(addr.id)} className="p-2 hover:bg-red-50 rounded-lg">
                                        <Trash2 className="w-4 h-4 text-red-500" />
                                    </button>
                                </div>
                            </div>

                            {!addr.isDefault && (
                                <button
                                    onClick={() => setDefaultAddress(addr.id)}
                                    className="mt-4 text-primary-600 text-sm font-medium hover:underline flex items-center gap-1"
                                >
                                    <Check className="w-4 h-4" />
                                    تعيين كعنوان افتراضي
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                {addresses.length === 0 && (
                    <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                        <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-gray-900 mb-2">لا توجد عناوين</h2>
                        <p className="text-gray-500 mb-6">أضف عنوان توصيل لتسهيل عملية الشراء</p>
                        <button
                            onClick={() => setShowForm(true)}
                            className="bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition"
                        >
                            إضافة عنوان جديد
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

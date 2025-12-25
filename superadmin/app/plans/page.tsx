'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, Edit, Trash2, Check, Star } from 'lucide-react'

const plans = [
    {
        id: '1',
        name: 'Starter',
        name_ar: 'المبتدئ',
        price: 99,
        period: 'monthly',
        features: ['100 منتج', '1000 طلب/شهر', 'دعم بالإيميل', 'تصميم أساسي'],
        tenants: 45,
        active: true,
        popular: false,
    },
    {
        id: '2',
        name: 'Pro',
        name_ar: 'الاحترافي',
        price: 299,
        period: 'monthly',
        features: ['1000 منتج', '10000 طلب/شهر', 'دعم مباشر', 'تصميم متقدم', 'تقارير متقدمة', 'دومين مخصص'],
        tenants: 78,
        active: true,
        popular: true,
    },
    {
        id: '3',
        name: 'Business',
        name_ar: 'الأعمال',
        price: 599,
        period: 'monthly',
        features: ['منتجات غير محدودة', 'طلبات غير محدودة', 'دعم VIP', 'تصميم مخصص', 'API كامل', 'Multistore'],
        tenants: 33,
        active: true,
        popular: false,
    },
]

export default function PlansPage() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">الباقات</h1>
                    <p className="text-gray-500">{plans.length} باقات متاحة</p>
                </div>
                <button className="btn-primary flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    إضافة باقة
                </button>
            </div>

            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map((plan) => (
                    <div key={plan.id} className={`card relative overflow-hidden ${plan.popular ? 'ring-2 ring-primary-500' : ''}`}>
                        {plan.popular && (
                            <div className="absolute top-4 left-4">
                                <span className="bg-primary-500 text-white text-xs px-3 py-1 rounded-full flex items-center gap-1">
                                    <Star className="w-3 h-3" /> الأكثر طلباً
                                </span>
                            </div>
                        )}

                        <div className="p-6 border-b">
                            <h3 className="text-xl font-bold text-gray-900">{plan.name_ar}</h3>
                            <p className="text-sm text-gray-500">{plan.name}</p>
                            <div className="mt-4">
                                <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                                <span className="text-gray-500"> ر.س/شهر</span>
                            </div>
                        </div>

                        <div className="p-6">
                            <p className="text-sm text-gray-500 mb-4">{plan.tenants} متجر مشترك</p>
                            <ul className="space-y-3">
                                {plan.features.map((feature, index) => (
                                    <li key={index} className="flex items-center gap-2 text-sm">
                                        <Check className="w-4 h-4 text-green-500" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="p-6 border-t flex gap-2">
                            <button className="btn-secondary flex-1 flex items-center justify-center gap-2">
                                <Edit className="w-4 h-4" />
                                تعديل
                            </button>
                            <button className="p-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

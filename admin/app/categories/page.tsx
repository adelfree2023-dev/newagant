'use client'

import { useState } from 'react'
import { Plus, Edit, Trash2, Package, MoreVertical } from 'lucide-react'

const categories = [
    { id: '1', name: 'إلكترونيات', name_en: 'Electronics', slug: 'electronics', products: 45, status: 'active', image: 'https://via.placeholder.com/80' },
    { id: '2', name: 'أزياء', name_en: 'Fashion', slug: 'fashion', products: 120, status: 'active', image: 'https://via.placeholder.com/80' },
    { id: '3', name: 'المنزل والمطبخ', name_en: 'Home & Kitchen', slug: 'home', products: 67, status: 'active', image: 'https://via.placeholder.com/80' },
    { id: '4', name: 'الجمال والعناية', name_en: 'Beauty', slug: 'beauty', products: 89, status: 'active', image: 'https://via.placeholder.com/80' },
    { id: '5', name: 'الرياضة', name_en: 'Sports', slug: 'sports', products: 34, status: 'inactive', image: 'https://via.placeholder.com/80' },
]

export default function CategoriesPage() {
    const [showModal, setShowModal] = useState(false)

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">الفئات</h1>
                    <p className="text-gray-500">{categories.length} فئة</p>
                </div>
                <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    إضافة فئة
                </button>
            </div>

            {/* Categories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((category) => (
                    <div key={category.id} className="card overflow-hidden">
                        <div className="relative h-32 bg-gradient-to-br from-primary-500 to-primary-600">
                            <img
                                src={category.image}
                                alt={category.name}
                                className="w-full h-full object-cover opacity-50"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Package className="w-12 h-12 text-white" />
                            </div>
                            <div className="absolute top-2 left-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${category.status === 'active'
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-gray-100 text-gray-700'
                                    }`}>
                                    {category.status === 'active' ? 'نشط' : 'غير نشط'}
                                </span>
                            </div>
                        </div>
                        <div className="p-4">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="font-bold text-gray-900">{category.name}</h3>
                                    <p className="text-sm text-gray-500">{category.name_en}</p>
                                </div>
                                <button className="p-2 hover:bg-gray-100 rounded-lg">
                                    <MoreVertical className="w-4 h-4 text-gray-500" />
                                </button>
                            </div>
                            <div className="mt-3 flex items-center justify-between">
                                <span className="text-sm text-gray-500">{category.products} منتج</span>
                                <div className="flex gap-1">
                                    <button className="p-2 hover:bg-gray-100 rounded-lg" title="تعديل">
                                        <Edit className="w-4 h-4 text-gray-500" />
                                    </button>
                                    <button className="p-2 hover:bg-red-50 rounded-lg" title="حذف">
                                        <Trash2 className="w-4 h-4 text-red-500" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

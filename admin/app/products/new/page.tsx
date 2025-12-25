'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Upload, X, Plus } from 'lucide-react'

export default function NewProductPage() {
    const [images, setImages] = useState<string[]>([])
    const [formData, setFormData] = useState({
        name: '',
        name_ar: '',
        sku: '',
        price: '',
        compare_price: '',
        cost_price: '',
        category: '',
        stock: '',
        description: '',
        description_ar: '',
        status: 'active'
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        console.log('Product data:', formData)
        alert('تم حفظ المنتج بنجاح!')
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/products" className="p-2 hover:bg-gray-100 rounded-lg">
                    <ArrowRight className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">إضافة منتج جديد</h1>
                    <p className="text-gray-500">أضف منتج جديد لمتجرك</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Basic Info */}
                    <div className="card p-6">
                        <h2 className="font-bold text-gray-900 mb-4">المعلومات الأساسية</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2 md:col-span-1">
                                <label className="block mb-2 text-sm font-medium">اسم المنتج (عربي) *</label>
                                <input
                                    type="text"
                                    value={formData.name_ar}
                                    onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                                    className="input-field"
                                    placeholder="آيفون 15 برو ماكس"
                                    required
                                />
                            </div>
                            <div className="col-span-2 md:col-span-1">
                                <label className="block mb-2 text-sm font-medium">اسم المنتج (انجليزي)</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="input-field"
                                    dir="ltr"
                                    placeholder="iPhone 15 Pro Max"
                                />
                            </div>
                            <div>
                                <label className="block mb-2 text-sm font-medium">SKU</label>
                                <input
                                    type="text"
                                    value={formData.sku}
                                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                                    className="input-field"
                                    dir="ltr"
                                    placeholder="IPH-15PM"
                                />
                            </div>
                            <div>
                                <label className="block mb-2 text-sm font-medium">الفئة *</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="input-field"
                                    required
                                >
                                    <option value="">اختر الفئة</option>
                                    <option value="electronics">إلكترونيات</option>
                                    <option value="fashion">أزياء</option>
                                    <option value="home">المنزل</option>
                                    <option value="beauty">الجمال</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Pricing */}
                    <div className="card p-6">
                        <h2 className="font-bold text-gray-900 mb-4">التسعير</h2>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block mb-2 text-sm font-medium">سعر البيع *</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        className="input-field pl-12"
                                        placeholder="0.00"
                                        required
                                    />
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">ر.س</span>
                                </div>
                            </div>
                            <div>
                                <label className="block mb-2 text-sm font-medium">السعر قبل الخصم</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={formData.compare_price}
                                        onChange={(e) => setFormData({ ...formData, compare_price: e.target.value })}
                                        className="input-field pl-12"
                                        placeholder="0.00"
                                    />
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">ر.س</span>
                                </div>
                            </div>
                            <div>
                                <label className="block mb-2 text-sm font-medium">سعر التكلفة</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={formData.cost_price}
                                        onChange={(e) => setFormData({ ...formData, cost_price: e.target.value })}
                                        className="input-field pl-12"
                                        placeholder="0.00"
                                    />
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">ر.س</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="card p-6">
                        <h2 className="font-bold text-gray-900 mb-4">الوصف</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block mb-2 text-sm font-medium">الوصف (عربي)</label>
                                <textarea
                                    value={formData.description_ar}
                                    onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
                                    className="input-field"
                                    rows={4}
                                    placeholder="وصف المنتج بالعربي..."
                                />
                            </div>
                            <div>
                                <label className="block mb-2 text-sm font-medium">الوصف (انجليزي)</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="input-field"
                                    rows={4}
                                    dir="ltr"
                                    placeholder="Product description in English..."
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Status */}
                    <div className="card p-6">
                        <h2 className="font-bold text-gray-900 mb-4">الحالة</h2>
                        <select
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            className="input-field"
                        >
                            <option value="active">نشط</option>
                            <option value="draft">مسودة</option>
                            <option value="archived">مؤرشف</option>
                        </select>
                    </div>

                    {/* Stock */}
                    <div className="card p-6">
                        <h2 className="font-bold text-gray-900 mb-4">المخزون</h2>
                        <input
                            type="number"
                            value={formData.stock}
                            onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                            className="input-field"
                            placeholder="0"
                        />
                    </div>

                    {/* Images */}
                    <div className="card p-6">
                        <h2 className="font-bold text-gray-900 mb-4">الصور</h2>
                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-primary-500 transition cursor-pointer">
                            <Upload className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-500">اسحب الصور هنا</p>
                            <p className="text-xs text-gray-400">أو انقر للاختيار</p>
                        </div>
                        {images.length > 0 && (
                            <div className="mt-4 grid grid-cols-3 gap-2">
                                {images.map((img, index) => (
                                    <div key={index} className="relative">
                                        <img src={img} alt="" className="w-full h-20 object-cover rounded-lg" />
                                        <button
                                            type="button"
                                            onClick={() => setImages(images.filter((_, i) => i !== index))}
                                            className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full"
                                        >
                                            <X className="w-3 h-3 mx-auto" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                        <button type="submit" className="btn-primary flex-1">
                            حفظ المنتج
                        </button>
                        <Link href="/products" className="btn-secondary">
                            إلغاء
                        </Link>
                    </div>
                </div>
            </form>
        </div>
    )
}

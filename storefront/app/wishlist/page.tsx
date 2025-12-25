'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Heart, ShoppingCart, Trash2, Eye, Share2 } from 'lucide-react'

const wishlistItems = [
    { id: '1', name: 'آيفون 15 برو ماكس', price: 4999, originalPrice: 5499, image: 'https://via.placeholder.com/200', inStock: true },
    { id: '2', name: 'ايربودز برو 2', price: 999, originalPrice: null, image: 'https://via.placeholder.com/200', inStock: true },
    { id: '3', name: 'ماك بوك برو M3', price: 12999, originalPrice: 14999, image: 'https://via.placeholder.com/200', inStock: false },
    { id: '4', name: 'ساعة أبل الترا 2', price: 3499, originalPrice: null, image: 'https://via.placeholder.com/200', inStock: true },
]

export default function WishlistPage() {
    const [items, setItems] = useState(wishlistItems)

    const removeItem = (id: string) => {
        setItems(items.filter(item => item.id !== id))
    }

    const addToCart = (item: typeof wishlistItems[0]) => {
        alert(`تمت إضافة ${item.name} إلى السلة`)
    }

    if (items.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 py-16">
                <div className="container mx-auto px-4 text-center">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Heart className="w-12 h-12 text-gray-300" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">قائمة المفضلة فارغة</h1>
                    <p className="text-gray-500 mb-6">لم تقم بإضافة أي منتجات للمفضلة بعد</p>
                    <Link href="/" className="bg-primary-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-primary-700 transition inline-flex items-center gap-2">
                        تصفح المنتجات
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">المفضلة</h1>
                        <p className="text-gray-500">{items.length} منتج</p>
                    </div>
                    <button className="text-red-600 hover:text-red-700 text-sm font-medium">
                        مسح الكل
                    </button>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {items.map((item) => (
                        <div key={item.id} className="bg-white rounded-2xl shadow-sm overflow-hidden group">
                            {/* Image */}
                            <div className="relative aspect-square bg-gray-100">
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                {!item.inStock && (
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                        <span className="bg-white text-gray-900 px-4 py-2 rounded-lg font-medium">غير متوفر</span>
                                    </div>
                                )}
                                {item.originalPrice && (
                                    <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                                        {Math.round((1 - item.price / item.originalPrice) * 100)}%-
                                    </div>
                                )}
                                {/* Actions */}
                                <div className="absolute top-3 left-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition">
                                    <button onClick={() => removeItem(item.id)} className="w-9 h-9 bg-white rounded-full shadow flex items-center justify-center hover:bg-red-50">
                                        <Trash2 className="w-4 h-4 text-red-500" />
                                    </button>
                                    <Link href={`/product/${item.id}`} className="w-9 h-9 bg-white rounded-full shadow flex items-center justify-center hover:bg-gray-50">
                                        <Eye className="w-4 h-4 text-gray-600" />
                                    </Link>
                                </div>
                            </div>

                            {/* Info */}
                            <div className="p-4">
                                <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">{item.name}</h3>
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="text-lg font-bold text-primary-600">{item.price} ر.س</span>
                                    {item.originalPrice && (
                                        <span className="text-sm text-gray-400 line-through">{item.originalPrice}</span>
                                    )}
                                </div>
                                <button
                                    onClick={() => addToCart(item)}
                                    disabled={!item.inStock}
                                    className="w-full bg-primary-600 text-white py-2.5 rounded-lg font-medium hover:bg-primary-700 transition flex items-center justify-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
                                >
                                    <ShoppingCart className="w-4 h-4" />
                                    {item.inStock ? 'أضف للسلة' : 'غير متوفر'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

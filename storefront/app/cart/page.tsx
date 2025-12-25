'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Trash2, Minus, Plus, ShoppingBag, ArrowLeft } from 'lucide-react'

// Mock cart items (will be replaced with state management)
const initialCartItems = [
    {
        id: '1',
        name_ar: 'آيفون 15 برو ماكس',
        price: 4999,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1696446701796-da61225697cc?w=200&h=200&fit=crop',
    },
    {
        id: '4',
        name_ar: 'ايربودز برو 2',
        price: 999,
        quantity: 2,
        image: 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2569?w=200&h=200&fit=crop',
    },
]

export default function CartPage() {
    const [cartItems, setCartItems] = useState(initialCartItems)

    const updateQuantity = (id: string, delta: number) => {
        setCartItems(items =>
            items.map(item =>
                item.id === id
                    ? { ...item, quantity: Math.max(1, item.quantity + delta) }
                    : item
            )
        )
    }

    const removeItem = (id: string) => {
        setCartItems(items => items.filter(item => item.id !== id))
    }

    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const shipping = subtotal > 200 ? 0 : 25
    const total = subtotal + shipping

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">سلة التسوق</h1>

            {cartItems.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-4">
                        {cartItems.map((item) => (
                            <div
                                key={item.id}
                                className="bg-white rounded-xl p-4 shadow-sm flex gap-4"
                            >
                                <img
                                    src={item.image}
                                    alt={item.name_ar}
                                    className="w-24 h-24 object-cover rounded-lg"
                                />
                                <div className="flex-grow">
                                    <h3 className="font-bold text-gray-900 mb-1">{item.name_ar}</h3>
                                    <p className="text-primary-500 font-bold">{item.price.toFixed(2)} ر.س</p>
                                </div>
                                <div className="flex flex-col items-end justify-between">
                                    <button
                                        onClick={() => removeItem(item.id)}
                                        className="text-red-500 hover:text-red-600 p-2"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                    <div className="flex items-center border rounded-lg">
                                        <button
                                            onClick={() => updateQuantity(item.id, -1)}
                                            className="p-2 hover:bg-gray-100"
                                        >
                                            <Minus className="w-4 h-4" />
                                        </button>
                                        <span className="px-3 font-bold">{item.quantity}</span>
                                        <button
                                            onClick={() => updateQuantity(item.id, 1)}
                                            className="p-2 hover:bg-gray-100"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl p-6 shadow-sm sticky top-24">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">ملخص الطلب</h2>

                            <div className="space-y-3 mb-4">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">المجموع الفرعي</span>
                                    <span className="font-bold">{subtotal.toFixed(2)} ر.س</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">الشحن</span>
                                    <span className={shipping === 0 ? 'text-green-500 font-bold' : 'font-bold'}>
                                        {shipping === 0 ? 'مجاني' : `${shipping.toFixed(2)} ر.س`}
                                    </span>
                                </div>
                                {shipping === 0 && (
                                    <p className="text-green-500 text-sm">🎉 شحن مجاني للطلبات فوق 200 ر.س</p>
                                )}
                            </div>

                            <div className="border-t pt-4 mb-6">
                                <div className="flex justify-between text-lg">
                                    <span className="font-bold">الإجمالي</span>
                                    <span className="font-bold text-primary-500">{total.toFixed(2)} ر.س</span>
                                </div>
                            </div>

                            <Link
                                href="/checkout"
                                className="block w-full bg-primary-500 text-white text-center py-4 rounded-xl 
                         font-bold hover:bg-primary-600 transition"
                            >
                                إتمام الشراء
                            </Link>

                            <Link
                                href="/"
                                className="flex items-center justify-center gap-2 mt-4 text-gray-600 hover:text-primary-500"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                متابعة التسوق
                            </Link>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center py-16">
                    <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">السلة فارغة</h2>
                    <p className="text-gray-500 mb-6">لم تضف أي منتجات للسلة بعد</p>
                    <Link href="/" className="btn-primary">ابدأ التسوق</Link>
                </div>
            )}
        </div>
    )
}

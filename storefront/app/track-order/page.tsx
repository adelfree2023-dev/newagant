'use client'

import { useState } from 'react'
import { Search, Truck, Package, CheckCircle, Clock, MapPin, Phone, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

const mockOrder = {
    id: 'ORD-12345',
    status: 'shipping',
    items: [
        { name: 'آيفون 15 برو ماكس', quantity: 1, image: 'https://via.placeholder.com/80' },
        { name: 'ايربودز برو 2', quantity: 2, image: 'https://via.placeholder.com/80' },
    ],
    timeline: [
        { status: 'ordered', title: 'تم استلام الطلب', date: '2024-12-23 10:30', completed: true },
        { status: 'processing', title: 'جاري التجهيز', date: '2024-12-23 14:00', completed: true },
        { status: 'shipped', title: 'تم الشحن', date: '2024-12-24 09:00', completed: true },
        { status: 'out_for_delivery', title: 'في الطريق إليك', date: '2024-12-25 08:00', completed: true },
        { status: 'delivered', title: 'تم التوصيل', date: '', completed: false },
    ],
    shipping: {
        company: 'أرامكس',
        tracking: 'ARX123456789',
        address: 'الرياض، حي العليا، شارع الملك فهد، مبنى 123',
        phone: '0501234567',
        eta: 'اليوم، قبل الساعة 6 مساءً'
    }
}

export default function TrackOrderPage() {
    const [orderNumber, setOrderNumber] = useState('')
    const [email, setEmail] = useState('')
    const [order, setOrder] = useState<typeof mockOrder | null>(null)
    const [searching, setSearching] = useState(false)

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        setSearching(true)
        // Simulate search
        setTimeout(() => {
            setOrder(mockOrder)
            setSearching(false)
        }, 1000)
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero */}
            <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-16">
                <div className="container mx-auto px-4 text-center">
                    <Truck className="w-14 h-14 mx-auto mb-4 opacity-80" />
                    <h1 className="text-4xl font-bold mb-2">تتبع طلبك</h1>
                    <p className="text-xl text-white/80">اعرف أين وصل طلبك الآن</p>
                </div>
            </section>

            <section className="py-12">
                <div className="container mx-auto px-4 max-w-2xl">
                    {/* Search Form */}
                    <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
                        <form onSubmit={handleSearch} className="space-y-4">
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-700">رقم الطلب *</label>
                                <input
                                    type="text"
                                    value={orderNumber}
                                    onChange={(e) => setOrderNumber(e.target.value)}
                                    placeholder="مثال: ORD-12345"
                                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                    dir="ltr"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-700">البريد الإلكتروني *</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="email@example.com"
                                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                    dir="ltr"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={searching}
                                className="w-full bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                <Search className="w-5 h-5" />
                                {searching ? 'جاري البحث...' : 'تتبع الطلب'}
                            </button>
                        </form>
                    </div>

                    {/* Order Result */}
                    {order && (
                        <div className="space-y-6">
                            {/* Status Header */}
                            <div className="bg-white rounded-2xl shadow-sm p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <p className="text-sm text-gray-500">رقم الطلب</p>
                                        <p className="text-xl font-bold text-primary-600">{order.id}</p>
                                    </div>
                                    <div className="flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full">
                                        <Truck className="w-5 h-5" />
                                        <span className="font-medium">في الطريق إليك</span>
                                    </div>
                                </div>
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-5 h-5 text-green-600" />
                                        <span className="font-medium text-green-700">التوصيل المتوقع: {order.shipping.eta}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Timeline */}
                            <div className="bg-white rounded-2xl shadow-sm p-6">
                                <h3 className="font-bold text-gray-900 mb-6">حالة الطلب</h3>
                                <div className="relative">
                                    {order.timeline.map((step, index) => (
                                        <div key={index} className="flex gap-4 mb-6 last:mb-0">
                                            <div className="relative">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step.completed ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'
                                                    }`}>
                                                    {step.completed ? <CheckCircle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                                                </div>
                                                {index < order.timeline.length - 1 && (
                                                    <div className={`absolute top-8 right-3.5 w-1 h-12 ${order.timeline[index + 1].completed ? 'bg-green-500' : 'bg-gray-200'
                                                        }`} />
                                                )}
                                            </div>
                                            <div>
                                                <p className={`font-medium ${step.completed ? 'text-gray-900' : 'text-gray-400'}`}>{step.title}</p>
                                                {step.date && <p className="text-sm text-gray-500">{step.date}</p>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Shipping Info */}
                            <div className="bg-white rounded-2xl shadow-sm p-6">
                                <h3 className="font-bold text-gray-900 mb-4">معلومات الشحن</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <Truck className="w-5 h-5 text-gray-400" />
                                        <span>شركة الشحن: {order.shipping.company}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Package className="w-5 h-5 text-gray-400" />
                                        <span>رقم التتبع: <span className="font-mono text-primary-600">{order.shipping.tracking}</span></span>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                                        <span>{order.shipping.address}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </div>
    )
}

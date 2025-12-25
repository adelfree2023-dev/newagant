'use client'

import Link from 'next/link'
import { ArrowRight, Package, Truck, CheckCircle, Clock, MapPin, CreditCard, Phone, RefreshCw, Download, MessageCircle } from 'lucide-react'

const order = {
    id: 'ORD-12345',
    status: 'shipping',
    date: '2024-12-23',
    paymentMethod: 'بطاقة ائتمان',
    items: [
        { name: 'آيفون 15 برو ماكس', quantity: 1, price: 4999, image: 'https://via.placeholder.com/100' },
        { name: 'ايربودز برو 2', quantity: 1, price: 999, image: 'https://via.placeholder.com/100' },
    ],
    subtotal: 5998,
    shipping: 0,
    discount: 0,
    total: 5998,
    timeline: [
        { status: 'ordered', title: 'تم استلام الطلب', date: '23 ديسمبر 2024 - 10:30 ص', completed: true },
        { status: 'processing', title: 'جاري التجهيز', date: '23 ديسمبر 2024 - 02:00 م', completed: true },
        { status: 'shipped', title: 'تم الشحن', date: '24 ديسمبر 2024 - 09:00 ص', completed: true },
        { status: 'out_for_delivery', title: 'جاري التوصيل', date: '25 ديسمبر 2024 - 08:00 ص', completed: true },
        { status: 'delivered', title: 'تم التوصيل', date: '', completed: false },
    ],
    shipping_info: {
        name: 'أحمد محمد',
        phone: '+966500000000',
        address: 'الرياض، حي العليا، شارع الملك فهد، مبنى 123، الطابق 2',
        company: 'أرامكس',
        tracking: 'ARX123456789',
    }
}

export default function OrderDetailPage({ params }: { params: { id: string } }) {
    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Back */}
                <Link href="/account/orders" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
                    <ArrowRight className="w-5 h-5" />
                    العودة للطلبات
                </Link>

                {/* Header */}
                <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{order.id}</h1>
                            <p className="text-gray-500">{order.date}</p>
                        </div>
                        <span className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full font-medium flex items-center gap-2">
                            <Truck className="w-4 h-4" />
                            جاري الشحن
                        </span>
                    </div>
                    <div className="flex gap-3">
                        <button className="btn-secondary flex items-center gap-2 text-sm">
                            <Download className="w-4 h-4" />
                            تحميل الفاتورة
                        </button>
                        <button className="btn-secondary flex items-center gap-2 text-sm">
                            <MessageCircle className="w-4 h-4" />
                            تواصل معنا
                        </button>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Timeline */}
                    <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-6">
                        <h2 className="font-bold text-gray-900 mb-6">حالة الطلب</h2>
                        <div className="relative">
                            {order.timeline.map((step, index) => (
                                <div key={index} className="flex gap-4 mb-6 last:mb-0">
                                    <div className="relative">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step.completed ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'
                                            }`}>
                                            {step.completed ? <CheckCircle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                                        </div>
                                        {index < order.timeline.length - 1 && (
                                            <div className={`absolute top-10 right-4.5 w-1 h-10 ${order.timeline[index + 1].completed ? 'bg-green-500' : 'bg-gray-200'
                                                }`} />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <p className={`font-medium ${step.completed ? 'text-gray-900' : 'text-gray-400'}`}>{step.title}</p>
                                        {step.date && <p className="text-sm text-gray-500">{step.date}</p>}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Shipping Tracking */}
                        <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">شركة الشحن</p>
                                    <p className="font-medium">{order.shipping_info.company}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">رقم التتبع</p>
                                    <p className="font-mono text-primary-600">{order.shipping_info.tracking}</p>
                                </div>
                                <Link href="/track-order" className="text-primary-600 text-sm hover:underline">
                                    تتبع الشحنة
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Delivery Address */}
                        <div className="bg-white rounded-2xl shadow-sm p-6">
                            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-gray-400" />
                                عنوان التوصيل
                            </h3>
                            <p className="text-gray-900 font-medium">{order.shipping_info.name}</p>
                            <p className="text-gray-600 text-sm mt-1">{order.shipping_info.address}</p>
                            <p className="text-gray-600 text-sm mt-2 flex items-center gap-2">
                                <Phone className="w-4 h-4" />
                                {order.shipping_info.phone}
                            </p>
                        </div>

                        {/* Payment */}
                        <div className="bg-white rounded-2xl shadow-sm p-6">
                            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <CreditCard className="w-5 h-5 text-gray-400" />
                                طريقة الدفع
                            </h3>
                            <p className="text-gray-600">{order.paymentMethod}</p>
                        </div>
                    </div>
                </div>

                {/* Items */}
                <div className="bg-white rounded-2xl shadow-sm mt-6">
                    <div className="p-6 border-b">
                        <h2 className="font-bold text-gray-900">المنتجات ({order.items.length})</h2>
                    </div>
                    <div className="divide-y">
                        {order.items.map((item, index) => (
                            <div key={index} className="p-6 flex items-center gap-4">
                                <img src={item.image} alt={item.name} className="w-20 h-20 rounded-xl object-cover bg-gray-100" />
                                <div className="flex-1">
                                    <p className="font-medium text-gray-900">{item.name}</p>
                                    <p className="text-sm text-gray-500">الكمية: {item.quantity}</p>
                                </div>
                                <p className="text-lg font-bold">{item.price} ر.س</p>
                            </div>
                        ))}
                    </div>
                    <div className="p-6 bg-gray-50 space-y-2">
                        <div className="flex justify-between text-gray-600">
                            <span>المجموع الفرعي</span>
                            <span>{order.subtotal} ر.س</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                            <span>الشحن</span>
                            <span className="text-green-600">مجاني</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold pt-2 border-t">
                            <span>الإجمالي</span>
                            <span>{order.total} ر.س</span>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="mt-6 flex gap-3">
                    <button className="flex-1 bg-primary-600 text-white py-3 rounded-xl font-medium hover:bg-primary-700 transition flex items-center justify-center gap-2">
                        <RefreshCw className="w-5 h-5" />
                        إعادة الطلب
                    </button>
                </div>
            </div>
        </div>
    )
}

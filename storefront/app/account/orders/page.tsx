'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Package, Truck, CheckCircle, Clock, XCircle, ChevronLeft, Search, Filter } from 'lucide-react'

const orders = [
    {
        id: 'ORD-12345',
        date: '2024-12-23',
        status: 'shipping',
        total: 5998,
        items: [
            { name: 'آيفون 15 برو ماكس', quantity: 1, price: 4999, image: 'https://via.placeholder.com/80' },
            { name: 'ايربودز برو 2', quantity: 1, price: 999, image: 'https://via.placeholder.com/80' },
        ]
    },
    {
        id: 'ORD-12344',
        date: '2024-12-20',
        status: 'delivered',
        total: 1299,
        items: [
            { name: 'ساعة أبل الترا 2', quantity: 1, price: 1299, image: 'https://via.placeholder.com/80' },
        ]
    },
    {
        id: 'ORD-12343',
        date: '2024-12-15',
        status: 'delivered',
        total: 2499,
        items: [
            { name: 'ماك بوك اير M2', quantity: 1, price: 2499, image: 'https://via.placeholder.com/80' },
        ]
    },
    {
        id: 'ORD-12342',
        date: '2024-12-10',
        status: 'cancelled',
        total: 599,
        items: [
            { name: 'شاحن MagSafe', quantity: 2, price: 299, image: 'https://via.placeholder.com/80' },
        ]
    },
]

const statusConfig: Record<string, { color: string, icon: any, label: string }> = {
    pending: { color: 'bg-yellow-100 text-yellow-700', icon: Clock, label: 'قيد الانتظار' },
    processing: { color: 'bg-blue-100 text-blue-700', icon: Package, label: 'جاري التجهيز' },
    shipping: { color: 'bg-purple-100 text-purple-700', icon: Truck, label: 'جاري الشحن' },
    delivered: { color: 'bg-green-100 text-green-700', icon: CheckCircle, label: 'تم التوصيل' },
    cancelled: { color: 'bg-red-100 text-red-700', icon: XCircle, label: 'ملغي' },
}

const tabs = [
    { id: 'all', label: 'الكل' },
    { id: 'shipping', label: 'جاري الشحن' },
    { id: 'delivered', label: 'تم التوصيل' },
    { id: 'cancelled', label: 'ملغي' },
]

export default function OrdersPage() {
    const [activeTab, setActiveTab] = useState('all')

    const filteredOrders = activeTab === 'all' ? orders : orders.filter(o => o.status === activeTab)

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">طلباتي</h1>
                        <p className="text-gray-500">{orders.length} طلب</p>
                    </div>
                    <Link href="/track-order" className="text-primary-600 text-sm hover:underline flex items-center gap-1">
                        <Truck className="w-4 h-4" />
                        تتبع طلب
                    </Link>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${activeTab === tab.id
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-white text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Orders List */}
                <div className="space-y-4">
                    {filteredOrders.map((order) => {
                        const status = statusConfig[order.status]
                        const StatusIcon = status.icon
                        return (
                            <div key={order.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                                {/* Order Header */}
                                <div className="p-4 border-b flex items-center justify-between bg-gray-50">
                                    <div className="flex items-center gap-4">
                                        <span className="font-mono font-bold text-primary-600">{order.id}</span>
                                        <span className="text-sm text-gray-500">{order.date}</span>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${status.color}`}>
                                        <StatusIcon className="w-3.5 h-3.5" />
                                        {status.label}
                                    </span>
                                </div>

                                {/* Items */}
                                <div className="p-4">
                                    {order.items.map((item, index) => (
                                        <div key={index} className="flex items-center gap-4 mb-3 last:mb-0">
                                            <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg object-cover bg-gray-100" />
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-900">{item.name}</p>
                                                <p className="text-sm text-gray-500">الكمية: {item.quantity}</p>
                                            </div>
                                            <p className="font-bold">{item.price} ر.س</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Footer */}
                                <div className="p-4 border-t flex items-center justify-between bg-gray-50">
                                    <div>
                                        <span className="text-sm text-gray-500">الإجمالي: </span>
                                        <span className="text-lg font-bold text-gray-900">{order.total} ر.س</span>
                                    </div>
                                    <Link href={`/account/orders/${order.id}`} className="text-primary-600 text-sm font-medium hover:underline flex items-center gap-1">
                                        تفاصيل الطلب
                                        <ChevronLeft className="w-4 h-4" />
                                    </Link>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {filteredOrders.length === 0 && (
                    <div className="text-center py-16">
                        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">لا توجد طلبات</p>
                    </div>
                )}
            </div>
        </div>
    )
}

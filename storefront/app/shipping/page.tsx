'use client'

import { Truck, Clock, MapPin, Package, CreditCard, CheckCircle } from 'lucide-react'

const shippingZones = [
    { region: 'الرياض', days: '1-2', price: 25, freeAbove: 200 },
    { region: 'المنطقة الوسطى', days: '2-3', price: 35, freeAbove: 300 },
    { region: 'المنطقة الشرقية', days: '2-3', price: 30, freeAbove: 250 },
    { region: 'المنطقة الغربية', days: '3-4', price: 35, freeAbove: 300 },
    { region: 'المنطقة الجنوبية', days: '4-5', price: 45, freeAbove: 400 },
    { region: 'المنطقة الشمالية', days: '4-5', price: 45, freeAbove: 400 },
]

const shippingCompanies = [
    { name: 'أرامكس', logo: '📦' },
    { name: 'SMSA', logo: '🚚' },
    { name: 'DHL', logo: '✈️' },
]

export default function ShippingPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero */}
            <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-16">
                <div className="container mx-auto px-4 text-center">
                    <Truck className="w-14 h-14 mx-auto mb-4 opacity-80" />
                    <h1 className="text-4xl font-bold mb-2">سياسة الشحن والتوصيل</h1>
                    <p className="text-xl text-white/80">كل ما تحتاج معرفته عن شحن طلباتك</p>
                </div>
            </section>

            <section className="py-12">
                <div className="container mx-auto px-4 max-w-4xl">
                    {/* Key Points */}
                    <div className="grid md:grid-cols-3 gap-4 mb-12">
                        <div className="bg-white p-6 rounded-xl shadow-sm text-center">
                            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <CheckCircle className="w-7 h-7 text-green-600" />
                            </div>
                            <h3 className="font-bold text-gray-900 mb-1">شحن مجاني</h3>
                            <p className="text-sm text-gray-500">للطلبات فوق 200 ريال</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm text-center">
                            <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Clock className="w-7 h-7 text-blue-600" />
                            </div>
                            <h3 className="font-bold text-gray-900 mb-1">توصيل سريع</h3>
                            <p className="text-sm text-gray-500">1-5 أيام عمل</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm text-center">
                            <div className="w-14 h-14 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <CreditCard className="w-7 h-7 text-yellow-600" />
                            </div>
                            <h3 className="font-bold text-gray-900 mb-1">الدفع عند الاستلام</h3>
                            <p className="text-sm text-gray-500">+15 ريال رسوم</p>
                        </div>
                    </div>

                    {/* Shipping Zones */}
                    <div className="bg-white rounded-2xl shadow-sm mb-12 overflow-hidden">
                        <div className="p-6 border-b">
                            <h2 className="text-2xl font-bold text-gray-900">مناطق وأسعار الشحن</h2>
                        </div>
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="p-4 text-right font-medium text-gray-600">المنطقة</th>
                                    <th className="p-4 text-right font-medium text-gray-600">مدة التوصيل</th>
                                    <th className="p-4 text-right font-medium text-gray-600">سعر الشحن</th>
                                    <th className="p-4 text-right font-medium text-gray-600">شحن مجاني فوق</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {shippingZones.map((zone, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                        <td className="p-4 flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-gray-400" />
                                            {zone.region}
                                        </td>
                                        <td className="p-4">{zone.days} أيام عمل</td>
                                        <td className="p-4 font-bold">{zone.price} ريال</td>
                                        <td className="p-4 text-green-600">{zone.freeAbove} ريال</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Shipping Companies */}
                    <div className="bg-white rounded-2xl shadow-sm p-6 mb-12">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">شركات الشحن المعتمدة</h2>
                        <div className="flex flex-wrap gap-6 justify-center">
                            {shippingCompanies.map((company, index) => (
                                <div key={index} className="flex items-center gap-3 bg-gray-50 px-6 py-4 rounded-xl">
                                    <span className="text-3xl">{company.logo}</span>
                                    <span className="font-medium text-gray-900">{company.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                        <h3 className="font-bold text-yellow-800 mb-3">ملاحظات هامة</h3>
                        <ul className="space-y-2 text-yellow-700">
                            <li>• أيام العمل: السبت - الخميس (عدا الجمعة والعطل الرسمية)</li>
                            <li>• الطلبات قبل الساعة 2 ظهراً تُشحن في نفس اليوم</li>
                            <li>• يمكنك تتبع شحنتك عبر الرابط المرسل على البريد الإلكتروني أو SMS</li>
                            <li>• في حال عدم وجودك وقت التوصيل، سيتم إعادة المحاولة في اليوم التالي</li>
                        </ul>
                    </div>
                </div>
            </section>
        </div>
    )
}

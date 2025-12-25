'use client'

import { RefreshCw, CheckCircle, XCircle, Clock, Package, ArrowLeft, AlertTriangle } from 'lucide-react'

export default function ReturnsPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero */}
            <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-16">
                <div className="container mx-auto px-4 text-center">
                    <RefreshCw className="w-14 h-14 mx-auto mb-4 opacity-80" />
                    <h1 className="text-4xl font-bold mb-2">سياسة الإرجاع والاستبدال</h1>
                    <p className="text-xl text-white/80">راحتك أولويتنا</p>
                </div>
            </section>

            <section className="py-12">
                <div className="container mx-auto px-4 max-w-4xl">
                    {/* Key Points */}
                    <div className="grid md:grid-cols-3 gap-4 mb-12">
                        <div className="bg-white p-6 rounded-xl shadow-sm text-center">
                            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Clock className="w-7 h-7 text-green-600" />
                            </div>
                            <h3 className="font-bold text-gray-900 mb-1">14 يوم للإرجاع</h3>
                            <p className="text-sm text-gray-500">من تاريخ الاستلام</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm text-center">
                            <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <RefreshCw className="w-7 h-7 text-blue-600" />
                            </div>
                            <h3 className="font-bold text-gray-900 mb-1">استبدال مجاني</h3>
                            <p className="text-sm text-gray-500">في حالة العيوب</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm text-center">
                            <div className="w-14 h-14 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Package className="w-7 h-7 text-yellow-600" />
                            </div>
                            <h3 className="font-bold text-gray-900 mb-1">استرداد كامل</h3>
                            <p className="text-sm text-gray-500">خلال 5-7 أيام عمل</p>
                        </div>
                    </div>

                    {/* Conditions */}
                    <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">شروط الإرجاع</h2>
                        <div className="grid md:grid-cols-2 gap-8">
                            <div>
                                <h3 className="flex items-center gap-2 font-bold text-green-600 mb-4">
                                    <CheckCircle className="w-5 h-5" />
                                    يمكنك الإرجاع إذا:
                                </h3>
                                <ul className="space-y-2 text-gray-600">
                                    <li>• المنتج بحالته الأصلية مع التغليف</li>
                                    <li>• لم يتجاوز 14 يوم من الاستلام</li>
                                    <li>• الفاتورة الأصلية موجودة</li>
                                    <li>• المنتج غير مستخدم</li>
                                    <li>• جميع الملحقات موجودة</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="flex items-center gap-2 font-bold text-red-600 mb-4">
                                    <XCircle className="w-5 h-5" />
                                    لا يمكن الإرجاع:
                                </h3>
                                <ul className="space-y-2 text-gray-600">
                                    <li>• المنتجات المستعملة أو التالفة</li>
                                    <li>• منتجات العناية الشخصية</li>
                                    <li>• الملابس الداخلية</li>
                                    <li>• المنتجات المخصصة حسب الطلب</li>
                                    <li>• البرمجيات والمحتوى الرقمي</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Process */}
                    <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">خطوات الإرجاع</h2>
                        <div className="space-y-4">
                            {[
                                { step: 1, title: 'تقديم طلب الإرجاع', desc: 'من حسابك أو التواصل مع خدمة العملاء' },
                                { step: 2, title: 'الموافقة على الطلب', desc: 'سنراجع طلبك ونرد خلال 24 ساعة' },
                                { step: 3, title: 'استلام المنتج', desc: 'مندوب الشحن سيستلم المنتج من عنوانك' },
                                { step: 4, title: 'فحص المنتج', desc: 'التأكد من حالة المنتج' },
                                { step: 5, title: 'استرداد المبلغ', desc: 'إعادة المبلغ لحسابك خلال 5-7 أيام عمل' },
                            ].map((item) => (
                                <div key={item.step} className="flex items-start gap-4">
                                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        <span className="text-primary-600 font-bold">{item.step}</span>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">{item.title}</h4>
                                        <p className="text-sm text-gray-500">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Note */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                        <div className="flex gap-3">
                            <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0" />
                            <div>
                                <h3 className="font-bold text-yellow-800 mb-2">ملاحظة هامة</h3>
                                <p className="text-yellow-700">في حالة استلام منتج تالف أو خاطئ، تواصل معنا خلال 48 ساعة وسنقوم بالاستبدال أو الاسترداد الفوري بدون أي تكلفة عليك.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

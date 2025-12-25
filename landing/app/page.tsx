'use client'

import { useState } from 'react'
import { Rocket, Store, Smartphone, Settings, CheckCircle, ArrowLeft, Zap, Shield, Globe, Palette } from 'lucide-react'
import Link from 'next/link'

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
                    <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400 rounded-full blur-3xl"></div>
                </div>

                <div className="relative max-w-7xl mx-auto px-4 py-20 sm:py-32">
                    <div className="text-center">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-full mb-8">
                            <Zap className="w-4 h-4 text-yellow-400" />
                            <span className="text-sm">أسرع منصة لإنشاء المتاجر</span>
                        </div>

                        {/* Main Heading */}
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight">
                            أنشئ متجرك الإلكتروني
                            <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
                                في 60 ثانية فقط
                            </span>
                        </h1>

                        {/* Subtitle */}
                        <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-10">
                            موقع احترافي + تطبيق موبايل + لوحة تحكم كاملة
                            <br />
                            كل ما تحتاجه لبدء تجارتك الإلكترونية
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href="/start"
                                className="inline-flex items-center justify-center gap-2 bg-white text-blue-700 px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-50 transition shadow-xl shadow-blue-900/20"
                            >
                                <Rocket className="w-5 h-5" />
                                ابدأ الآن مجاناً
                            </Link>
                            <button className="inline-flex items-center justify-center gap-2 border-2 border-white/30 text-white px-8 py-4 rounded-xl font-medium hover:bg-white/10 transition">
                                شاهد العرض التوضيحي
                            </button>
                        </div>

                        {/* Stats */}
                        <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto">
                            <div>
                                <div className="text-3xl font-bold">500+</div>
                                <div className="text-blue-200 text-sm">متجر نشط</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold">60</div>
                                <div className="text-blue-200 text-sm">ثانية للإطلاق</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold">24/7</div>
                                <div className="text-blue-200 text-sm">دعم فني</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                            كل ما تحتاجه في مكان واحد
                        </h2>
                        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                            منصة متكاملة توفر لك كل الأدوات لإدارة متجرك بنجاح
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {/* Feature 1 */}
                        <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition group">
                            <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition">
                                <Store className="w-7 h-7 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">متجر احترافي</h3>
                            <p className="text-gray-600">تصميم عصري متجاوب مع كل الأجهزة وسهل التخصيص</p>
                        </div>

                        {/* Feature 2 */}
                        <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition group">
                            <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition">
                                <Smartphone className="w-7 h-7 text-green-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">تطبيق موبايل</h3>
                            <p className="text-gray-600">تطبيق جاهز للتحميل على Android و iOS</p>
                        </div>

                        {/* Feature 3 */}
                        <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition group">
                            <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition">
                                <Settings className="w-7 h-7 text-purple-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">لوحة تحكم</h3>
                            <p className="text-gray-600">إدارة كاملة للمنتجات والطلبات والعملاء</p>
                        </div>

                        {/* Feature 4 */}
                        <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition group">
                            <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition">
                                <Palette className="w-7 h-7 text-orange-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">5 قوالب</h3>
                            <p className="text-gray-600">اختر من بين 5 تصاميم احترافية جاهزة</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section className="py-20 px-4 bg-gray-100">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                            باقات تناسب الجميع
                        </h2>
                        <p className="text-gray-600 text-lg">ابدأ مجاناً وترقى حسب احتياجاتك</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Free */}
                        <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-transparent hover:border-blue-500 transition">
                            <div className="text-center mb-6">
                                <h3 className="text-xl font-bold text-gray-900 mb-2">مجاني</h3>
                                <div className="text-4xl font-extrabold text-gray-900">$0</div>
                                <div className="text-gray-500">/شهرياً</div>
                            </div>
                            <ul className="space-y-3 mb-6">
                                <li className="flex items-center gap-2 text-gray-600">
                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                    10 منتجات
                                </li>
                                <li className="flex items-center gap-2 text-gray-600">
                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                    موقع أساسي
                                </li>
                            </ul>
                            <button className="w-full py-3 border-2 border-gray-200 rounded-xl font-medium hover:bg-gray-50">
                                البدء
                            </button>
                        </div>

                        {/* Standard */}
                        <div className="bg-white p-6 rounded-2xl shadow-xl border-2 border-blue-500 relative">
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                                الأكثر طلباً
                            </div>
                            <div className="text-center mb-6">
                                <h3 className="text-xl font-bold text-gray-900 mb-2">ستاندرد</h3>
                                <div className="text-4xl font-extrabold text-blue-600">$30</div>
                                <div className="text-gray-500">/شهرياً</div>
                            </div>
                            <ul className="space-y-3 mb-6">
                                <li className="flex items-center gap-2 text-gray-600">
                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                    100 منتج
                                </li>
                                <li className="flex items-center gap-2 text-gray-600">
                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                    تطبيق موبايل
                                </li>
                                <li className="flex items-center gap-2 text-gray-600">
                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                    دعم فني
                                </li>
                            </ul>
                            <button className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700">
                                اختر الباقة
                            </button>
                        </div>

                        {/* Premium */}
                        <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-transparent hover:border-blue-500 transition">
                            <div className="text-center mb-6">
                                <h3 className="text-xl font-bold text-gray-900 mb-2">بريميوم</h3>
                                <div className="text-4xl font-extrabold text-gray-900">$100</div>
                                <div className="text-gray-500">/شهرياً</div>
                            </div>
                            <ul className="space-y-3 mb-6">
                                <li className="flex items-center gap-2 text-gray-600">
                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                    منتجات غير محدودة
                                </li>
                                <li className="flex items-center gap-2 text-gray-600">
                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                    كل المميزات
                                </li>
                                <li className="flex items-center gap-2 text-gray-600">
                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                    دعم أولوية
                                </li>
                            </ul>
                            <button className="w-full py-3 border-2 border-gray-200 rounded-xl font-medium hover:bg-gray-50">
                                اختر الباقة
                            </button>
                        </div>

                        {/* VIP */}
                        <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl shadow-lg text-white">
                            <div className="text-center mb-6">
                                <h3 className="text-xl font-bold mb-2">VIP</h3>
                                <div className="text-4xl font-extrabold">تواصل</div>
                                <div className="text-gray-400">معنا</div>
                            </div>
                            <ul className="space-y-3 mb-6">
                                <li className="flex items-center gap-2 text-gray-300">
                                    <CheckCircle className="w-5 h-5 text-yellow-400" />
                                    تخصيص كامل
                                </li>
                                <li className="flex items-center gap-2 text-gray-300">
                                    <CheckCircle className="w-5 h-5 text-yellow-400" />
                                    سيرفر خاص
                                </li>
                                <li className="flex items-center gap-2 text-gray-300">
                                    <CheckCircle className="w-5 h-5 text-yellow-400" />
                                    مدير حساب
                                </li>
                            </ul>
                            <button className="w-full py-3 bg-yellow-500 text-gray-900 rounded-xl font-medium hover:bg-yellow-400">
                                تواصل معنا
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                        جاهز لإطلاق متجرك؟
                    </h2>
                    <p className="text-xl text-blue-100 mb-10">
                        انضم لأكثر من 500 تاجر يثقون في منصتنا
                    </p>
                    <Link
                        href="/start"
                        className="inline-flex items-center gap-2 bg-white text-blue-700 px-10 py-4 rounded-xl font-bold text-lg hover:bg-blue-50 transition shadow-xl"
                    >
                        <Rocket className="w-5 h-5" />
                        أنشئ متجرك الآن
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-gray-400 py-12 px-4">
                <div className="max-w-7xl mx-auto text-center">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <Store className="w-8 h-8 text-blue-500" />
                        <span className="text-2xl font-bold text-white">CoreFlex</span>
                    </div>
                    <p className="mb-4">منصة إنشاء المتاجر الإلكترونية</p>
                    <p className="text-sm">© 2024 CoreFlex. جميع الحقوق محفوظة.</p>
                </div>
            </footer>
        </div>
    )
}

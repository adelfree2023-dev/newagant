'use client'

import { Store, Users, Award, Target, Heart, Globe } from 'lucide-react'

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero */}
            <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-20">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">من نحن</h1>
                    <p className="text-xl text-white/80 max-w-2xl mx-auto">
                        نحن متجرك الإلكتروني المفضل، نسعى لتقديم أفضل المنتجات بأفضل الأسعار
                    </p>
                </div>
            </section>

            {/* Story */}
            <section className="py-16">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto text-center">
                        <h2 className="text-3xl font-bold text-gray-900 mb-6">قصتنا</h2>
                        <p className="text-lg text-gray-600 leading-relaxed mb-6">
                            بدأنا رحلتنا في عام 2020 برؤية واضحة: توفير تجربة تسوق استثنائية للعملاء في المملكة العربية السعودية والخليج.
                            نؤمن بأن التسوق يجب أن يكون ممتعاً وسهلاً وآمناً.
                        </p>
                        <p className="text-lg text-gray-600 leading-relaxed">
                            اليوم، نفخر بخدمة أكثر من 100,000 عميل راضٍ، ونستمر في النمو والتطور لتقديم الأفضل دائماً.
                        </p>
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Users className="w-8 h-8 text-primary-600" />
                            </div>
                            <p className="text-3xl font-bold text-gray-900">100K+</p>
                            <p className="text-gray-500">عميل سعيد</p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Store className="w-8 h-8 text-green-600" />
                            </div>
                            <p className="text-3xl font-bold text-gray-900">50K+</p>
                            <p className="text-gray-500">منتج متوفر</p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Globe className="w-8 h-8 text-blue-600" />
                            </div>
                            <p className="text-3xl font-bold text-gray-900">13</p>
                            <p className="text-gray-500">منطقة تغطية</p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Award className="w-8 h-8 text-yellow-600" />
                            </div>
                            <p className="text-3xl font-bold text-gray-900">4.9</p>
                            <p className="text-gray-500">تقييم العملاء</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Values */}
            <section className="py-16">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">قيمنا</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-white p-8 rounded-2xl shadow-sm text-center">
                            <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                                <Target className="w-7 h-7 text-primary-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">الجودة</h3>
                            <p className="text-gray-600">نختار منتجاتنا بعناية لضمان أعلى مستويات الجودة</p>
                        </div>
                        <div className="bg-white p-8 rounded-2xl shadow-sm text-center">
                            <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                                <Heart className="w-7 h-7 text-green-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">العميل أولاً</h3>
                            <p className="text-gray-600">رضا العملاء هو هدفنا الأول والأخير</p>
                        </div>
                        <div className="bg-white p-8 rounded-2xl shadow-sm text-center">
                            <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                                <Award className="w-7 h-7 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">الثقة</h3>
                            <p className="text-gray-600">نبني علاقات طويلة الأمد مبنية على الثقة والمصداقية</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

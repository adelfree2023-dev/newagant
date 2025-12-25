'use client'

import { Phone, Mail, MessageCircle, FileText, HelpCircle, Truck, ArrowLeft, CreditCard, RefreshCw, ExternalLink } from 'lucide-react'
import Link from 'next/link'

const helpTopics = [
    { icon: Truck, title: 'الشحن والتوصيل', description: 'معلومات عن مواعيد ومناطق التوصيل', href: '/shipping' },
    { icon: RefreshCw, title: 'الإرجاع والاستبدال', description: 'سياسة الإرجاع والاستبدال', href: '/returns' },
    { icon: CreditCard, title: 'الدفع', description: 'طرق الدفع المتاحة', href: '/faq' },
    { icon: FileText, title: 'الأسئلة الشائعة', description: 'إجابات لأكثر الأسئلة شيوعاً', href: '/faq' },
]

const contactMethods = [
    { icon: Phone, title: 'اتصل بنا', value: '920000000', action: 'tel:+966920000000', color: 'bg-green-100 text-green-600' },
    { icon: MessageCircle, title: 'واتساب', value: '0500000000', action: 'https://wa.me/966500000000', color: 'bg-[#25D366]/10 text-[#25D366]' },
    { icon: Mail, title: 'البريد الإلكتروني', value: 'support@store.com', action: 'mailto:support@store.com', color: 'bg-blue-100 text-blue-600' },
]

export default function HelpPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero */}
            <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-16">
                <div className="container mx-auto px-4 text-center">
                    <HelpCircle className="w-14 h-14 mx-auto mb-4 opacity-80" />
                    <h1 className="text-4xl font-bold mb-2">مركز المساعدة</h1>
                    <p className="text-xl text-white/80">كيف يمكننا مساعدتك؟</p>
                </div>
            </section>

            <section className="py-12">
                <div className="container mx-auto px-4 max-w-4xl">
                    {/* Quick Links */}
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">مواضيع المساعدة</h2>
                    <div className="grid md:grid-cols-2 gap-4 mb-12">
                        {helpTopics.map((topic, index) => (
                            <Link key={index} href={topic.href} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition flex items-start gap-4">
                                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <topic.icon className="w-6 h-6 text-primary-600" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-gray-900">{topic.title}</h3>
                                    <p className="text-sm text-gray-500">{topic.description}</p>
                                </div>
                                <ArrowLeft className="w-5 h-5 text-gray-400" />
                            </Link>
                        ))}
                    </div>

                    {/* Track Order */}
                    <div className="bg-primary-50 border border-primary-100 rounded-2xl p-8 mb-12 text-center">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">تتبع طلبك</h2>
                        <p className="text-gray-600 mb-6">أدخل رقم الطلب لمعرفة حالة الشحن</p>
                        <Link href="/track-order" className="inline-flex items-center gap-2 bg-primary-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-primary-700 transition">
                            <Truck className="w-5 h-5" />
                            تتبع الطلب
                        </Link>
                    </div>

                    {/* Contact */}
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">تواصل معنا</h2>
                    <div className="grid md:grid-cols-3 gap-4 mb-12">
                        {contactMethods.map((method, index) => (
                            <a key={index} href={method.action} target="_blank" className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition text-center">
                                <div className={`w-14 h-14 ${method.color} rounded-xl flex items-center justify-center mx-auto mb-3`}>
                                    <method.icon className="w-7 h-7" />
                                </div>
                                <h3 className="font-bold text-gray-900">{method.title}</h3>
                                <p className="text-gray-600" dir="ltr">{method.value}</p>
                            </a>
                        ))}
                    </div>

                    {/* Working Hours */}
                    <div className="bg-white rounded-xl shadow-sm p-6 text-center">
                        <h3 className="font-bold text-gray-900 mb-2">ساعات خدمة العملاء</h3>
                        <p className="text-gray-600">السبت - الخميس: 9 صباحاً - 9 مساءً</p>
                        <p className="text-gray-600">الجمعة: 2 مساءً - 9 مساءً</p>
                    </div>
                </div>
            </section>
        </div>
    )
}

'use client'

import { useState } from 'react'
import { Phone, Mail, MapPin, Clock, Send, MessageCircle } from 'lucide-react'

export default function ContactPage() {
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', subject: '', message: '' })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        alert('تم إرسال رسالتك بنجاح! سنتواصل معك قريباً')
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero */}
            <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-20">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">اتصل بنا</h1>
                    <p className="text-xl text-white/80">نحن هنا لمساعدتك!</p>
                </div>
            </section>

            <section className="py-16">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Contact Info */}
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">معلومات التواصل</h2>

                            <div className="bg-white p-6 rounded-xl shadow-sm">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <Phone className="w-6 h-6 text-primary-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">الهاتف</h3>
                                        <p className="text-gray-600" dir="ltr">+966 920000000</p>
                                        <p className="text-gray-600" dir="ltr">+966 500000000</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-xl shadow-sm">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <Mail className="w-6 h-6 text-green-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">البريد الإلكتروني</h3>
                                        <p className="text-gray-600">support@store.com</p>
                                        <p className="text-gray-600">info@store.com</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-xl shadow-sm">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <MapPin className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">العنوان</h3>
                                        <p className="text-gray-600">الرياض، المملكة العربية السعودية</p>
                                        <p className="text-gray-600">حي العليا، شارع الملك فهد</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-xl shadow-sm">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <Clock className="w-6 h-6 text-yellow-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">ساعات العمل</h3>
                                        <p className="text-gray-600">السبت - الخميس: 9 ص - 9 م</p>
                                        <p className="text-gray-600">الجمعة: 2 م - 9 م</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="md:col-span-2">
                            <div className="bg-white p-8 rounded-2xl shadow-sm">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">أرسل لنا رسالة</h2>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block mb-2 text-sm font-medium">الاسم *</label>
                                            <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" required />
                                        </div>
                                        <div>
                                            <label className="block mb-2 text-sm font-medium">البريد الإلكتروني *</label>
                                            <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" dir="ltr" required />
                                        </div>
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block mb-2 text-sm font-medium">رقم الهاتف</label>
                                            <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" dir="ltr" />
                                        </div>
                                        <div>
                                            <label className="block mb-2 text-sm font-medium">الموضوع *</label>
                                            <select value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" required>
                                                <option value="">اختر الموضوع</option>
                                                <option value="order">استفسار عن طلب</option>
                                                <option value="product">استفسار عن منتج</option>
                                                <option value="complaint">شكوى</option>
                                                <option value="suggestion">اقتراح</option>
                                                <option value="other">أخرى</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block mb-2 text-sm font-medium">الرسالة *</label>
                                        <textarea value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} rows={5} className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none resize-none" required />
                                    </div>
                                    <button type="submit" className="w-full bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 transition flex items-center justify-center gap-2">
                                        <Send className="w-5 h-5" />
                                        إرسال الرسالة
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

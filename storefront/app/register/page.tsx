'use client'

import { useState } from 'react'
import Link from 'next/link'
import { User, Mail, Phone, Lock, Eye, EyeOff, ArrowLeft, Store, CheckCircle } from 'lucide-react'

export default function RegisterPage() {
    const [showPassword, setShowPassword] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        terms: false,
        newsletter: true,
    })
    const [loading, setLoading] = useState(false)

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        if (formData.password !== formData.confirmPassword) {
            alert('كلمة المرور غير متطابقة')
            return
        }
        setLoading(true)
        setTimeout(() => {
            setLoading(false)
            window.location.href = '/account'
        }, 1500)
    }

    const benefits = [
        'تتبع طلباتك بسهولة',
        'حفظ عناوين التوصيل',
        'قائمة المفضلة',
        'عروض حصرية للأعضاء',
        'نقاط ولاء مع كل عملية شراء',
    ]

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Left Side - Form */}
            <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
                <div className="w-full max-w-md">
                    <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8">
                        <ArrowLeft className="w-5 h-5" />
                        العودة للمتجر
                    </Link>

                    <h1 className="text-3xl font-bold text-gray-900 mb-2">إنشاء حساب جديد</h1>
                    <p className="text-gray-500 mb-8">انضم إلينا واستمتع بتجربة تسوق مميزة</p>

                    <form onSubmit={handleRegister} className="space-y-4">
                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-700">الاسم الكامل *</label>
                            <div className="relative">
                                <User className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full pr-10 pl-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                    placeholder="أحمد محمد"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-700">البريد الإلكتروني *</label>
                            <div className="relative">
                                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full pr-10 pl-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                    placeholder="email@example.com"
                                    dir="ltr"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-700">رقم الهاتف *</label>
                            <div className="relative">
                                <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full pr-10 pl-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                    placeholder="+966500000000"
                                    dir="ltr"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-700">كلمة المرور *</label>
                            <div className="relative">
                                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full pr-10 pl-12 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                    placeholder="••••••••"
                                    dir="ltr"
                                    required
                                    minLength={8}
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-700">تأكيد كلمة المرور *</label>
                            <div className="relative">
                                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="password"
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    className="w-full pr-10 pl-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                    placeholder="••••••••"
                                    dir="ltr"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="flex items-start gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.terms}
                                    onChange={(e) => setFormData({ ...formData, terms: e.target.checked })}
                                    className="w-4 h-4 mt-1 rounded text-primary-600"
                                    required
                                />
                                <span className="text-sm text-gray-600">
                                    أوافق على <Link href="/privacy" className="text-primary-600 hover:underline">سياسة الخصوصية</Link> و<Link href="/terms" className="text-primary-600 hover:underline">شروط الاستخدام</Link>
                                </span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.newsletter}
                                    onChange={(e) => setFormData({ ...formData, newsletter: e.target.checked })}
                                    className="w-4 h-4 rounded text-primary-600"
                                />
                                <span className="text-sm text-gray-600">أرغب في استلام العروض والتخفيضات</span>
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 transition disabled:opacity-50"
                        >
                            {loading ? 'جاري إنشاء الحساب...' : 'إنشاء حساب'}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <span className="text-gray-500">لديك حساب؟ </span>
                        <Link href="/login" className="text-primary-600 font-medium hover:underline">
                            سجل دخولك
                        </Link>
                    </div>
                </div>
            </div>

            {/* Right Side */}
            <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary-600 to-primary-800 items-center justify-center p-12">
                <div className="text-white max-w-md">
                    <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
                        <Store className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold mb-6">مزايا التسجيل</h2>
                    <ul className="space-y-4">
                        {benefits.map((benefit, index) => (
                            <li key={index} className="flex items-center gap-3">
                                <CheckCircle className="w-5 h-5 text-green-400" />
                                <span>{benefit}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    )
}

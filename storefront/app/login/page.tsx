'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mail, Lock, Eye, EyeOff, ArrowLeft, Store } from 'lucide-react'

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false)
    const [formData, setFormData] = useState({ email: '', password: '', remember: false })
    const [loading, setLoading] = useState(false)

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        // Simulate login
        setTimeout(() => {
            setLoading(false)
            window.location.href = '/account'
        }, 1500)
    }

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Left Side - Form */}
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="w-full max-w-md">
                    <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8">
                        <ArrowLeft className="w-5 h-5" />
                        العودة للمتجر
                    </Link>

                    <h1 className="text-3xl font-bold text-gray-900 mb-2">مرحباً بعودتك!</h1>
                    <p className="text-gray-500 mb-8">سجل دخولك للمتابعة</p>

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-700">البريد الإلكتروني</label>
                            <div className="relative">
                                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full pr-10 pl-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                                    placeholder="email@example.com"
                                    dir="ltr"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-700">كلمة المرور</label>
                            <div className="relative">
                                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full pr-10 pl-12 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                                    placeholder="••••••••"
                                    dir="ltr"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.remember}
                                    onChange={(e) => setFormData({ ...formData, remember: e.target.checked })}
                                    className="w-4 h-4 rounded text-primary-600"
                                />
                                <span className="text-sm text-gray-600">تذكرني</span>
                            </label>
                            <Link href="/forgot-password" className="text-sm text-primary-600 hover:underline">
                                نسيت كلمة المرور؟
                            </Link>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 transition disabled:opacity-50"
                        >
                            {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <span className="text-gray-500">ليس لديك حساب؟ </span>
                        <Link href="/register" className="text-primary-600 font-medium hover:underline">
                            سجل الآن
                        </Link>
                    </div>

                    {/* Social Login */}
                    <div className="mt-8">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-gray-50 text-gray-500">أو</span>
                            </div>
                        </div>
                        <div className="mt-6 grid grid-cols-2 gap-3">
                            <button className="flex items-center justify-center gap-2 py-3 border rounded-lg hover:bg-gray-50 transition">
                                <span className="text-xl">🔵</span>
                                <span className="text-sm font-medium">Google</span>
                            </button>
                            <button className="flex items-center justify-center gap-2 py-3 border rounded-lg hover:bg-gray-50 transition">
                                <span className="text-xl">🍎</span>
                                <span className="text-sm font-medium">Apple</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Image/Promo */}
            <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary-600 to-primary-800 items-center justify-center p-12">
                <div className="text-center text-white max-w-md">
                    <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Store className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold mb-4">تسوق بسهولة</h2>
                    <p className="text-white/80">
                        استمتع بتجربة تسوق فريدة مع آلاف المنتجات وأفضل الأسعار والتوصيل السريع
                    </p>
                </div>
            </div>
        </div>
    )
}

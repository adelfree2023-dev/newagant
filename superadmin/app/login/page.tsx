'use client'

import { useState } from 'react'
import { Shield, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false)
    const [formData, setFormData] = useState({ email: '', password: '', remember: false })

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault()
        console.log('Login:', formData)
        // Redirect to dashboard
        window.location.href = '/'
    }

    return (
        <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Shield className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">CoreFlex</h1>
                    <p className="text-gray-400 mt-1">لوحة تحكم Super Admin</p>
                </div>

                {/* Form */}
                <div className="bg-dark-800 rounded-2xl p-8 shadow-xl border border-dark-700">
                    <h2 className="text-xl font-bold text-white mb-6 text-center">تسجيل الدخول</h2>

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div>
                            <label className="block mb-2 text-sm text-gray-400">البريد الإلكتروني</label>
                            <div className="relative">
                                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full bg-dark-700 border border-dark-600 rounded-lg py-3 pr-10 pl-4 text-white placeholder-gray-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
                                    placeholder="admin@coreflex.io"
                                    dir="ltr"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block mb-2 text-sm text-gray-400">كلمة المرور</label>
                            <div className="relative">
                                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full bg-dark-700 border border-dark-600 rounded-lg py-3 pr-10 pl-12 text-white placeholder-gray-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
                                    placeholder="••••••••"
                                    dir="ltr"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
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
                                    className="w-4 h-4 rounded bg-dark-700 border-dark-600 text-primary-600"
                                />
                                <span className="text-sm text-gray-400">تذكرني</span>
                            </label>
                            <a href="#" className="text-sm text-primary-500 hover:underline">نسيت كلمة المرور؟</a>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 transition flex items-center justify-center gap-2"
                        >
                            تسجيل الدخول
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </form>
                </div>

                <p className="text-center text-gray-500 text-sm mt-6">
                    © 2024 CoreFlex. جميع الحقوق محفوظة
                </p>
            </div>
        </div>
    )
}

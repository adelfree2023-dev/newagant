'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Shield, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, Loader2 } from 'lucide-react'

export default function LoginPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [formData, setFormData] = useState({ email: '', password: '', remember: false })

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://35.226.47.16:8000'

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setIsLoading(true)

        try {
            const res = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password
                })
            })

            const data = await res.json()

            if (data.success && data.token) {
                // Check if user is superadmin
                if (data.user?.role !== 'superadmin') {
                    setError('هذا الحساب ليس صلاحية Super Admin')
                    setIsLoading(false)
                    return
                }

                // Save token in cookie for middleware
                document.cookie = `superadmin_token=${data.token}; path=/; max-age=${formData.remember ? 604800 : 86400}`
                // Also save in localStorage
                localStorage.setItem('superadmin_token', data.token)
                localStorage.setItem('superadmin_user', JSON.stringify(data.user))

                // Redirect
                const redirect = searchParams.get('redirect') || '/'
                router.push(redirect)
            } else {
                setError(data.error || 'بيانات الدخول غير صحيحة')
            }
        } catch (err) {
            console.error('Login error:', err)
            setError('فشل الاتصال بالسيرفر')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/30">
                        <Shield className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white">CoreFlex</h1>
                    <p className="text-gray-400 mt-2">لوحة تحكم Super Admin</p>
                </div>

                {/* Form */}
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
                    <h2 className="text-xl font-bold text-white mb-6 text-center">تسجيل الدخول</h2>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 flex items-center gap-3 mb-6">
                            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                            <p className="text-red-300 text-sm">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div>
                            <label className="block mb-2 text-sm text-gray-300">البريد الإلكتروني</label>
                            <div className="relative">
                                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full bg-white/10 border border-white/20 rounded-xl py-3 pr-12 pl-4 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none"
                                    placeholder="admin@coreflex.io"
                                    dir="ltr"
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block mb-2 text-sm text-gray-300">كلمة المرور</label>
                            <div className="relative">
                                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full bg-white/10 border border-white/20 rounded-xl py-3 pr-12 pl-12 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none"
                                    placeholder="••••••••"
                                    dir="ltr"
                                    required
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.remember}
                                onChange={(e) => setFormData({ ...formData, remember: e.target.checked })}
                                className="w-4 h-4 rounded bg-white/10 border-white/20 text-purple-600"
                            />
                            <span className="text-sm text-gray-300">تذكرني</span>
                        </label>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-4 rounded-xl font-medium hover:from-purple-700 hover:to-purple-800 transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-500/30 disabled:opacity-50"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    جاري تسجيل الدخول...
                                </>
                            ) : (
                                <>
                                    <ArrowRight className="w-5 h-5" />
                                    تسجيل الدخول
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <p className="text-center text-gray-500 text-sm mt-8">
                    © 2024 CoreFlex Platform
                </p>
            </div>
        </div>
    )
}

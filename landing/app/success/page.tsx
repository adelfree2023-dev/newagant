'use client'

import { useEffect, useState } from 'react'
import { CheckCircle, ExternalLink, Copy, Store, Settings, Key } from 'lucide-react'
import Link from 'next/link'

interface ProvisionResult {
    success: boolean
    data: {
        tenant: {
            id: string
            name: string
            subdomain: string
        }
        user: {
            id: string
            email: string
            name: string
            role: string
        }
        token: string
        urls: {
            admin: string
            store: string
        }
    }
}

export default function SuccessPage() {
    const [result, setResult] = useState<ProvisionResult | null>(null)
    const [copied, setCopied] = useState<string | null>(null)
    const [password, setPassword] = useState<string>('')

    useEffect(() => {
        const data = localStorage.getItem('provision_result')
        const savedPassword = localStorage.getItem('provision_password')
        if (data) {
            try {
                setResult(JSON.parse(data))
            } catch (e) {
                console.error('Failed to parse provision result')
            }
        }
        if (savedPassword) {
            setPassword(savedPassword)
        }
    }, [])

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text)
        setCopied(label)
        setTimeout(() => setCopied(null), 2000)
    }

    if (!result || !result.data) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600 mb-4">لا توجد بيانات</p>
                    <Link href="/start" className="text-blue-600 hover:underline">
                        إنشاء متجر جديد
                    </Link>
                </div>
            </div>
        )
    }

    const { tenant, user, urls } = result.data
    // Fix localhost URLs to use actual server IP
    const storeUrl = urls.store.replace('localhost:3001', '35.226.47.16:3000') + `?tenant=${tenant.subdomain}`
    const adminUrl = urls.admin.replace('localhost:3002', '35.226.47.16:3001') + `?tenant=${tenant.subdomain}`

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-500 via-green-600 to-emerald-700 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl">
                {/* Success Header */}
                <div className="text-center text-white mb-8">
                    <div className="inline-flex items-center justify-center w-24 h-24 bg-white/10 backdrop-blur rounded-full mb-4">
                        <CheckCircle className="w-12 h-12" />
                    </div>
                    <h1 className="text-4xl font-bold mb-2">🎉 تم إنشاء متجرك!</h1>
                    <p className="text-green-100 text-lg">متجرك "{tenant.name}" جاهز للعمل الآن</p>
                </div>

                {/* Links Card */}
                <div className="bg-white rounded-2xl shadow-2xl p-8 space-y-6">
                    {/* Store URL */}
                    <div className="p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-3 mb-2">
                            <Store className="w-6 h-6 text-blue-600" />
                            <span className="font-bold text-gray-900">رابط المتجر</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                readOnly
                                value={storeUrl}
                                className="flex-1 px-3 py-2 bg-white border rounded-lg text-gray-700 text-sm"
                                dir="ltr"
                            />
                            <button
                                onClick={() => copyToClipboard(storeUrl, 'store')}
                                className="p-2 hover:bg-gray-200 rounded-lg"
                            >
                                <Copy className={`w-5 h-5 ${copied === 'store' ? 'text-green-600' : 'text-gray-500'}`} />
                            </button>
                            <a
                                href={storeUrl}
                                target="_blank"
                                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                <ExternalLink className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Admin URL */}
                    <div className="p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-3 mb-2">
                            <Settings className="w-6 h-6 text-purple-600" />
                            <span className="font-bold text-gray-900">لوحة التحكم</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                readOnly
                                value={adminUrl}
                                className="flex-1 px-3 py-2 bg-white border rounded-lg text-gray-700 text-sm"
                                dir="ltr"
                            />
                            <button
                                onClick={() => copyToClipboard(adminUrl, 'admin')}
                                className="p-2 hover:bg-gray-200 rounded-lg"
                            >
                                <Copy className={`w-5 h-5 ${copied === 'admin' ? 'text-green-600' : 'text-gray-500'}`} />
                            </button>
                            <a
                                href={adminUrl}
                                target="_blank"
                                className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                            >
                                <ExternalLink className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Credentials */}
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                        <div className="flex items-center gap-3 mb-3">
                            <Key className="w-6 h-6 text-amber-600" />
                            <span className="font-bold text-gray-900">بيانات الدخول</span>
                        </div>
                        <div className="space-y-2 text-sm" dir="ltr">
                            <div className="flex justify-between items-center p-2 bg-white rounded">
                                <span className="text-gray-600">Email:</span>
                                <span className="font-mono font-bold">{user.email}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-white rounded">
                                <span className="text-gray-600">Password:</span>
                                <span className="font-mono font-bold">{password || '(كلمة المرور التي أدخلتها)'}</span>
                            </div>
                        </div>
                        <p className="text-xs text-amber-700 mt-3">⚠️ احتفظ بهذه البيانات في مكان آمن</p>
                    </div>

                    {/* Next Steps */}
                    <div className="text-center pt-4 border-t">
                        <p className="text-gray-600 mb-4">✅ متجرك جاهز! ابدأ بإضافة منتجاتك</p>
                        <div className="flex gap-4 justify-center">
                            <a
                                href={adminUrl}
                                target="_blank"
                                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
                            >
                                الذهاب للوحة التحكم
                            </a>
                            <Link
                                href="/"
                                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
                            >
                                العودة للرئيسية
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

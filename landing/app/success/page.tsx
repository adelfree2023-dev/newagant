'use client'

import { useEffect, useState } from 'react'
import { CheckCircle, ExternalLink, Copy, Store, Settings, Smartphone } from 'lucide-react'
import Link from 'next/link'

interface ProvisionResult {
    success: boolean
    tenant_id: string
    store_url: string
    admin_url: string
    app_download: {
        android: string
        ios: string
    }
    credentials: {
        email: string
        password: string
    }
}

export default function SuccessPage() {
    const [result, setResult] = useState<ProvisionResult | null>(null)
    const [copied, setCopied] = useState<string | null>(null)

    useEffect(() => {
        const data = localStorage.getItem('provision_result')
        if (data) {
            setResult(JSON.parse(data))
        }
    }, [])

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text)
        setCopied(label)
        setTimeout(() => setCopied(null), 2000)
    }

    if (!result) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600">لا توجد بيانات</p>
                    <Link href="/start" className="text-blue-600 hover:underline">
                        إنشاء متجر جديد
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-500 via-green-600 to-emerald-700 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl">
                {/* Success Header */}
                <div className="text-center text-white mb-8">
                    <div className="inline-flex items-center justify-center w-24 h-24 bg-white/10 backdrop-blur rounded-full mb-4 animate-float">
                        <CheckCircle className="w-12 h-12" />
                    </div>
                    <h1 className="text-4xl font-bold mb-2">🎉 تم إنشاء متجرك!</h1>
                    <p className="text-green-100 text-lg">متجرك جاهز للعمل الآن</p>
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
                                value={result.store_url}
                                className="flex-1 px-3 py-2 bg-white border rounded-lg text-gray-700"
                                dir="ltr"
                            />
                            <button
                                onClick={() => copyToClipboard(result.store_url, 'store')}
                                className="p-2 hover:bg-gray-200 rounded-lg"
                            >
                                <Copy className={`w-5 h-5 ${copied === 'store' ? 'text-green-600' : 'text-gray-500'}`} />
                            </button>
                            <a
                                href={result.store_url}
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
                                value={result.admin_url}
                                className="flex-1 px-3 py-2 bg-white border rounded-lg text-gray-700"
                                dir="ltr"
                            />
                            <button
                                onClick={() => copyToClipboard(result.admin_url, 'admin')}
                                className="p-2 hover:bg-gray-200 rounded-lg"
                            >
                                <Copy className={`w-5 h-5 ${copied === 'admin' ? 'text-green-600' : 'text-gray-500'}`} />
                            </button>
                            <a
                                href={result.admin_url}
                                target="_blank"
                                className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                            >
                                <ExternalLink className="w-5 h-5" />
                            </a>
                        </div>

                        <div className="mt-3 p-3 bg-white border rounded-lg">
                            <p className="text-sm text-gray-600 mb-1">بيانات الدخول:</p>
                            <p className="text-sm" dir="ltr">
                                <strong>Email:</strong> {result.credentials.email}
                            </p>
                            <p className="text-sm" dir="ltr">
                                <strong>Password:</strong> {result.credentials.password}
                            </p>
                        </div>
                    </div>

                    {/* Mobile App */}
                    <div className="p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-3 mb-3">
                            <Smartphone className="w-6 h-6 text-green-600" />
                            <span className="font-bold text-gray-900">تطبيق الموبايل</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <a
                                href={result.app_download.android}
                                className="flex items-center justify-center gap-2 p-3 bg-black text-white rounded-lg hover:bg-gray-800"
                            >
                                Android APK
                            </a>
                            <a
                                href={result.app_download.ios}
                                className="flex items-center justify-center gap-2 p-3 bg-black text-white rounded-lg hover:bg-gray-800"
                            >
                                iOS IPA
                            </a>
                        </div>
                    </div>

                    {/* Next Steps */}
                    <div className="text-center pt-4 border-t">
                        <p className="text-gray-600 mb-4">📧 تم إرسال التفاصيل لبريدك الإلكتروني</p>
                        <Link
                            href="/"
                            className="text-blue-600 hover:underline"
                        >
                            العودة للرئيسية
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

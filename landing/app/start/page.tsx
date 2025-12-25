'use client'

import { useState } from 'react'
import { ArrowRight, ArrowLeft, Store, Building2, User, CreditCard, CheckCircle, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export default function StartWizard() {
    const router = useRouter()
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const [formData, setFormData] = useState({
        store_name: '',
        subdomain: '',
        business_type: 'ecommerce',
        owner_name: '',
        owner_email: '',
        owner_phone: '',
        owner_password: '',
        plan: 'free'
    })

    const [subdomainAvailable, setSubdomainAvailable] = useState<boolean | null>(null)

    // Check subdomain availability
    const checkSubdomain = async (subdomain: string) => {
        if (subdomain.length < 3) {
            setSubdomainAvailable(null)
            return
        }
        try {
            const res = await fetch(`${API_URL}/api/provision/check-subdomain?subdomain=${subdomain}`)
            const data = await res.json()
            setSubdomainAvailable(data.available)
        } catch {
            setSubdomainAvailable(null)
        }
    }

    // Handle form submit
    const handleSubmit = async () => {
        setLoading(true)
        setError('')

        try {
            const res = await fetch(`${API_URL}/api/provision/store`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    store_name: formData.store_name,
                    subdomain: formData.subdomain,
                    business_type: formData.business_type,
                    owner: {
                        name: formData.owner_name,
                        email: formData.owner_email,
                        phone: formData.owner_phone,
                        password: formData.owner_password
                    },
                    plan_slug: formData.plan
                })
            })

            const data = await res.json()

            if (data.success) {
                // Store result and go to success page
                localStorage.setItem('provision_result', JSON.stringify(data))
                router.push('/success')
            } else {
                setError(data.error || 'حدث خطأ في إنشاء المتجر')
            }
        } catch (err) {
            setError('حدث خطأ في الاتصال بالخادم')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 flex items-center justify-center p-4">
            <div className="w-full max-w-lg">
                {/* Progress Steps */}
                <div className="flex justify-center mb-8">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="flex items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= i ? 'bg-white text-blue-600' : 'bg-white/20 text-white'
                                }`}>
                                {step > i ? <CheckCircle className="w-5 h-5" /> : i}
                            </div>
                            {i < 4 && (
                                <div className={`w-12 h-1 ${step > i ? 'bg-white' : 'bg-white/20'}`} />
                            )}
                        </div>
                    ))}
                </div>

                {/* Card */}
                <div className="bg-white rounded-2xl shadow-2xl p-8">

                    {/* Step 1: Store Name */}
                    {step === 1 && (
                        <div>
                            <div className="text-center mb-6">
                                <Store className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                                <h2 className="text-2xl font-bold text-gray-900">معلومات المتجر</h2>
                                <p className="text-gray-500">اختر اسم ورابط متجرك</p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">اسم المتجر</label>
                                    <input
                                        type="text"
                                        value={formData.store_name}
                                        onChange={e => setFormData({ ...formData, store_name: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="متجر الأناقة"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">رابط المتجر</label>
                                    <div className="flex items-center">
                                        <input
                                            type="text"
                                            value={formData.subdomain}
                                            onChange={e => {
                                                const val = e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '')
                                                setFormData({ ...formData, subdomain: val })
                                                checkSubdomain(val)
                                            }}
                                            className="flex-1 px-4 py-3 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                            placeholder="anaqa"
                                            dir="ltr"
                                        />
                                        <span className="bg-gray-100 px-4 py-3 border border-r-0 border-gray-300 rounded-l-lg text-gray-500" dir="ltr">
                                            .coreflex.io
                                        </span>
                                    </div>
                                    {subdomainAvailable === true && (
                                        <p className="text-green-600 text-sm mt-1 flex items-center gap-1">
                                            <CheckCircle className="w-4 h-4" /> متاح
                                        </p>
                                    )}
                                    {subdomainAvailable === false && (
                                        <p className="text-red-600 text-sm mt-1">غير متاح، جرب اسم آخر</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Business Type */}
                    {step === 2 && (
                        <div>
                            <div className="text-center mb-6">
                                <Building2 className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                                <h2 className="text-2xl font-bold text-gray-900">نوع النشاط</h2>
                                <p className="text-gray-500">اختر نوع نشاطك التجاري</p>
                            </div>

                            <div className="space-y-3">
                                {[
                                    { id: 'ecommerce', label: '🛒 متجر منتجات' },
                                    { id: 'restaurant', label: '🍕 مطعم / كافيه' },
                                    { id: 'services', label: '✂️ خدمات' },
                                ].map(type => (
                                    <label
                                        key={type.id}
                                        className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition ${formData.business_type === type.id
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="business_type"
                                            value={type.id}
                                            checked={formData.business_type === type.id}
                                            onChange={e => setFormData({ ...formData, business_type: e.target.value })}
                                            className="sr-only"
                                        />
                                        <span className="text-lg">{type.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 3: Owner Info */}
                    {step === 3 && (
                        <div>
                            <div className="text-center mb-6">
                                <User className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                                <h2 className="text-2xl font-bold text-gray-900">بياناتك</h2>
                                <p className="text-gray-500">معلومات صاحب المتجر</p>
                            </div>

                            <div className="space-y-4">
                                <input
                                    type="text"
                                    placeholder="الاسم الكامل"
                                    value={formData.owner_name}
                                    onChange={e => setFormData({ ...formData, owner_name: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                                <input
                                    type="email"
                                    placeholder="البريد الإلكتروني"
                                    value={formData.owner_email}
                                    onChange={e => setFormData({ ...formData, owner_email: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    dir="ltr"
                                />
                                <input
                                    type="tel"
                                    placeholder="رقم الهاتف"
                                    value={formData.owner_phone}
                                    onChange={e => setFormData({ ...formData, owner_phone: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    dir="ltr"
                                />
                                <input
                                    type="password"
                                    placeholder="كلمة المرور"
                                    value={formData.owner_password}
                                    onChange={e => setFormData({ ...formData, owner_password: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    dir="ltr"
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 4: Plan Selection */}
                    {step === 4 && (
                        <div>
                            <div className="text-center mb-6">
                                <CreditCard className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                                <h2 className="text-2xl font-bold text-gray-900">اختر الباقة</h2>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { id: 'free', name: 'مجاني', price: '$0' },
                                    { id: 'standard', name: 'ستاندرد', price: '$30' },
                                ].map(plan => (
                                    <label
                                        key={plan.id}
                                        className={`p-4 border-2 rounded-xl cursor-pointer text-center transition ${formData.plan === plan.id
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="plan"
                                            value={plan.id}
                                            checked={formData.plan === plan.id}
                                            onChange={e => setFormData({ ...formData, plan: e.target.value })}
                                            className="sr-only"
                                        />
                                        <div className="text-2xl font-bold text-gray-900">{plan.price}</div>
                                        <div className="text-gray-600">{plan.name}</div>
                                    </label>
                                ))}
                            </div>

                            {error && (
                                <p className="mt-4 text-red-600 text-center">{error}</p>
                            )}
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex justify-between mt-8">
                        {step > 1 ? (
                            <button
                                onClick={() => setStep(step - 1)}
                                className="flex items-center gap-2 px-6 py-3 text-gray-600 hover:bg-gray-100 rounded-lg"
                            >
                                <ArrowRight className="w-5 h-5" />
                                السابق
                            </button>
                        ) : <div />}

                        {step < 4 ? (
                            <button
                                onClick={() => setStep(step + 1)}
                                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                التالي
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="flex items-center gap-2 px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        جاري الإنشاء...
                                    </>
                                ) : (
                                    '🚀 إطلاق متجري'
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

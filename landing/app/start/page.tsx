'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ArrowRight, Building2, CheckCircle, CreditCard, Loader2, Store, User } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast, Toaster } from 'sonner'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// ============ Validation Schema ============
const formSchema = z.object({
    store_name: z.string().min(3, 'اسم المتجر يجب أن يكون 3 أحرف على الأقل'),
    subdomain: z.string()
        .min(3, 'الرابط يجب أن يكون 3 أحرف على الأقل')
        .regex(/^[a-z0-9]+$/, 'الأحرف الإنجليزية والأرقام فقط بدون مسافات'),
    business_type: z.enum(['ecommerce', 'restaurant', 'services']),
    owner_name: z.string().min(3, 'الاسم يجب أن يكون 3 أحرف على الأقل'),
    owner_email: z.string().email('بريد إلكتروني غير صحيح'),
    owner_phone: z.string().min(10, 'رقم الهاتف غير صحيح'),
    owner_password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
    plan: z.enum(['free', 'standard'])
})

type FormData = z.infer<typeof formSchema>

// ============ Component ============
export default function StartWizard() {
    const router = useRouter()
    const [step, setStep] = useState(1)
    const [isChecking, setIsChecking] = useState(false)
    const [isSubdomainAvailable, setIsSubdomainAvailable] = useState<boolean | null>(null)

    const { register, handleSubmit, watch, formState: { errors, isValid, isSubmitting }, trigger, setValue } = useForm<FormData>({
        resolver: zodResolver(formSchema),
        mode: 'onChange',
        defaultValues: {
            business_type: 'ecommerce',
            plan: 'free'
        }
    })

    // Watch subdomain for live check
    const subdomain = watch('subdomain')

    // Check Subdomain Availability
    const checkSubdomain = async (val: string) => {
        if (val.length < 3) return
        setIsChecking(true)
        try {
            const res = await fetch(`${API_URL}/api/provision/check-subdomain?subdomain=${val}`)
            const data = await res.json()
            setIsSubdomainAvailable(data.available)
        } catch {
            setIsSubdomainAvailable(null)
        } finally {
            setIsChecking(false)
        }
    }

    // Next Step Handler
    const nextStep = async () => {
        let fieldsToValidate: any[] = []
        if (step === 1) fieldsToValidate = ['store_name', 'subdomain']
        if (step === 2) fieldsToValidate = ['business_type']
        if (step === 3) fieldsToValidate = ['owner_name', 'owner_email', 'owner_phone', 'owner_password']

        const isStepValid = await trigger(fieldsToValidate)

        // Extra verify for subdomain step
        if (step === 1) {
            if (!isSubdomainAvailable && !isChecking) {
                toast.error('اسم الرابط غير متاح، يرجى تغييره')
                return
            }
        }

        if (isStepValid) setStep(s => s + 1)
    }

    // Final Submit
    const onSubmit = async (data: FormData) => {
        try {
            const res = await fetch(`${API_URL}/api/provision/store`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    store_name: data.store_name,
                    subdomain: data.subdomain,
                    business_type: data.business_type,
                    plan_slug: data.plan,
                    owner: {
                        name: data.owner_name,
                        email: data.owner_email,
                        phone: data.owner_phone,
                        password: data.owner_password
                    }
                })
            })

            const result = await res.json()

            if (result.success) {
                toast.success('تم إنشاء متجرك بنجاح! 🚀')
                // Store success data
                localStorage.setItem('provision_result', JSON.stringify(result))
                localStorage.setItem('provision_password', data.owner_password)
                router.push('/success')
            } else {
                toast.error(result.error || 'حدث خطأ في النظام')
            }
        } catch (err) {
            toast.error('فشل الاتصال بالخادم')
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 flex items-center justify-center p-4 font-tajawal" dir="rtl">
            <Toaster position="top-center" richColors />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-lg"
            >
                {/* Progress Bar */}
                <div className="flex justify-center mb-8 gap-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="relative flex items-center">
                            <motion.div
                                animate={{
                                    backgroundColor: step >= i ? '#fff' : 'rgba(255,255,255,0.2)',
                                    color: step >= i ? '#4F46E5' : '#fff',
                                    scale: step === i ? 1.1 : 1
                                }}
                                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold z-10 transition-colors`}
                            >
                                {step > i ? <CheckCircle className="w-6 h-6" /> : i}
                            </motion.div>
                            {i < 4 && (
                                <div className={`absolute top-1/2 right-10 w-full h-1 -translate-y-1/2 -z-0 bg-white/20`}>
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: step > i ? '4rem' : '0%' }}
                                        className="h-full bg-white"
                                    />
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Main Card */}
                <div className="bg-white rounded-3xl shadow-2xl p-8 overflow-hidden relative min-h-[500px]">
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <AnimatePresence mode="wait">

                            {/* Step 1 */}
                            {step === 1 && (
                                <motion.div
                                    key="step1"
                                    initial={{ x: 50, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    exit={{ x: -50, opacity: 0 }}
                                    className="space-y-6"
                                >
                                    <div className="text-center">
                                        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                            <Store className="w-8 h-8" />
                                        </div>
                                        <h2 className="text-2xl font-bold text-gray-900">مرحباً بك، التاجر الجديد 👋</h2>
                                        <p className="text-gray-500">لنبدأ بتسمية امبراطوريتك التجارية</p>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">اسم المتجر</label>
                                            <input
                                                {...register('store_name')}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                                placeholder="مثال: متجر الأناقة"
                                            />
                                            {errors.store_name && <p className="text-red-500 text-sm mt-1">{errors.store_name.message}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">روبط المتجر (بالإنجليزي)</label>
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 relative">
                                                    <input
                                                        {...register('subdomain')}
                                                        onChange={(e) => {
                                                            setValue('subdomain', e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))
                                                            checkSubdomain(e.target.value)
                                                        }}
                                                        className={`w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 transition-all dir-ltr ${isSubdomainAvailable === true ? 'border-green-500 ring-green-500' :
                                                            isSubdomainAvailable === false ? 'border-red-500 ring-red-500' :
                                                                'border-gray-200 focus:ring-blue-500'
                                                            }`}
                                                        placeholder="store"
                                                        dir="ltr"
                                                    />
                                                    <div className="absolute left-3 top-3">
                                                        {isChecking && <Loader2 className="w-5 h-5 animate-spin text-gray-400" />}
                                                    </div>
                                                </div>
                                                <span className="bg-gray-100 px-3 py-3 rounded-xl text-gray-500 font-mono text-sm" dir="ltr">.coreflex.io</span>
                                            </div>
                                            {isSubdomainAvailable === true && <p className="text-green-600 text-sm mt-1">✅ الاسم متاح!</p>}
                                            {isSubdomainAvailable === false && <p className="text-red-500 text-sm mt-1">❌ الاسم محجوز، اختر اسماً آخر</p>}
                                            {errors.subdomain && <p className="text-red-500 text-sm mt-1">{errors.subdomain.message}</p>}
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Step 2 */}
                            {step === 2 && (
                                <motion.div
                                    key="step2"
                                    initial={{ x: 50, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    exit={{ x: -50, opacity: 0 }}
                                    className="space-y-6"
                                >
                                    <div className="text-center">
                                        <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                            <Building2 className="w-8 h-8" />
                                        </div>
                                        <h2 className="text-2xl font-bold text-gray-900">ما هو نشاطك؟</h2>
                                        <p className="text-gray-500">نخصص التجربة بناءً على نوع عملك</p>
                                    </div>

                                    <div className="grid gap-4">
                                        {[
                                            { id: 'ecommerce', label: '🛒 متجر تجزئة', desc: 'ملابس، إلكترونيات، منتجات ملموسة' },
                                            { id: 'restaurant', label: '🍽️ مطعم / كافيه', desc: 'قائمة طعام، طلبات توصيل' },
                                            { id: 'services', label: '✂️ خدمات وحجوزات', desc: 'حلاقة، استشارات، صيانة' },
                                        ].map(type => (
                                            <label
                                                key={type.id}
                                                className={`flex items-start gap-4 p-4 border-2 rounded-2xl cursor-pointer transition-all hover:shadow-md ${watch('business_type') === type.id
                                                    ? 'border-blue-500 bg-blue-50/50'
                                                    : 'border-gray-100 hover:border-blue-200'
                                                    }`}
                                            >
                                                <input
                                                    type="radio"
                                                    value={type.id}
                                                    {...register('business_type')}
                                                    className="mt-1 w-4 h-4 text-blue-600"
                                                />
                                                <div>
                                                    <div className="font-bold text-gray-900 text-lg">{type.label}</div>
                                                    <div className="text-gray-500 text-sm">{type.desc}</div>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {/* Step 3 */}
                            {step === 3 && (
                                <motion.div
                                    key="step3"
                                    initial={{ x: 50, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    exit={{ x: -50, opacity: 0 }}
                                    className="space-y-6"
                                >
                                    <div className="text-center">
                                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                            <User className="w-8 h-8" />
                                        </div>
                                        <h2 className="text-2xl font-bold text-gray-900">بيانات الدخول</h2>
                                        <p className="text-gray-500">ستستخدم هذه البيانات للدخول للوحة التحكم</p>
                                    </div>

                                    <div className="space-y-4">
                                        <input
                                            {...register('owner_name')}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                                            placeholder="الاسم الكامل"
                                        />
                                        {errors.owner_name && <p className="text-red-500 text-sm">{errors.owner_name.message}</p>}

                                        <input
                                            {...register('owner_email')}
                                            type="email"
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                                            placeholder="البريد الإلكتروني"
                                            dir="ltr"
                                        />
                                        {errors.owner_email && <p className="text-red-500 text-sm">{errors.owner_email.message}</p>}

                                        <input
                                            {...register('owner_phone')}
                                            type="tel"
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                                            placeholder="رقم الهاتف"
                                            dir="ltr"
                                        />
                                        {errors.owner_phone && <p className="text-red-500 text-sm">{errors.owner_phone.message}</p>}

                                        <input
                                            {...register('owner_password')}
                                            type="password"
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                                            placeholder="كلمة المرور"
                                            dir="ltr"
                                        />
                                        {errors.owner_password && <p className="text-red-500 text-sm">{errors.owner_password.message}</p>}
                                    </div>
                                </motion.div>
                            )}

                            {/* Step 4 */}
                            {step === 4 && (
                                <motion.div
                                    key="step4"
                                    initial={{ x: 50, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    exit={{ x: -50, opacity: 0 }}
                                    className="space-y-6"
                                >
                                    <div className="text-center">
                                        <div className="w-16 h-16 bg-yellow-100 text-yellow-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                            <CreditCard className="w-8 h-8" />
                                        </div>
                                        <h2 className="text-2xl font-bold text-gray-900">باقة الاشتراك</h2>
                                        <p className="text-gray-500">اختر الخطة المناسبة لحجم أعمالك</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        {[
                                            { id: 'free', name: 'مجاني', price: '$0', features: ['100 منتج', 'متجر أساسي', 'دعم عبر الإيميل'] },
                                            { id: 'standard', name: 'المحترفين', price: '$29', features: ['منتجات غير محدودة', 'دومين خاص', 'أدوات تسويق'] },
                                        ].map(plan => (
                                            <label
                                                key={plan.id}
                                                className={`p-6 border-2 rounded-2xl cursor-pointer text-center transition-all hover:shadow-lg relative overflow-hidden ${watch('plan') === plan.id
                                                    ? 'border-blue-500 bg-blue-50 transform scale-105 shadow-xl'
                                                    : 'border-gray-100 hover:border-gray-300'
                                                    }`}
                                            >
                                                <input
                                                    type="radio"
                                                    value={plan.id}
                                                    {...register('plan')}
                                                    className="sr-only"
                                                />
                                                {watch('plan') === plan.id && (
                                                    <div className="absolute top-2 right-2 text-blue-500">
                                                        <CheckCircle className="w-6 h-6" />
                                                    </div>
                                                )}
                                                <div className="text-3xl font-bold text-gray-900 mb-1">{plan.price}</div>
                                                <div className="font-bold text-lg mb-4">{plan.name}</div>
                                                <ul className="text-xs text-gray-500 space-y-2">
                                                    {plan.features.map((f, i) => (
                                                        <li key={i}>✓ {f}</li>
                                                    ))}
                                                </ul>
                                            </label>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                        </AnimatePresence>

                        {/* Actions */}
                        <div className="flex justify-between mt-10 pt-6 border-t border-gray-100">
                            {step > 1 ? (
                                <button
                                    type="button"
                                    onClick={() => setStep(step - 1)}
                                    className="flex items-center gap-2 px-6 py-3 text-gray-500 hover:bg-gray-50 rounded-xl transition-colors font-bold"
                                >
                                    <ArrowRight className="w-5 h-5" />
                                    السابق
                                </button>
                            ) : <div />}

                            {step < 4 ? (
                                <button
                                    type="button"
                                    onClick={nextStep}
                                    className="flex items-center gap-2 px-8 py-3 bg-gray-900 text-white rounded-xl hover:bg-black transition-all shadow-lg shadow-gray-200 font-bold"
                                >
                                    التالي
                                    <ArrowLeft className="w-5 h-5" />
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex items-center gap-2 px-10 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-xl hover:scale-105 transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : '🚀 إطلاق المتجر الآن'}
                                </button>
                            )}
                        </div>

                    </form>
                </div>
            </motion.div>
        </div>
    )
}

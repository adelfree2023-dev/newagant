'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronRight, CreditCard, Truck, CheckCircle } from 'lucide-react'

export default function CheckoutPage() {
    const [step, setStep] = useState(1)
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        city: '',
        address: '',
        paymentMethod: 'cod'
    })

    // Mock order summary
    const subtotal = 6997
    const shipping = 0
    const total = 6997

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (step < 3) {
            setStep(step + 1)
        } else {
            // Place order
            window.location.href = '/order-success'
        }
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                <Link href="/cart" className="hover:text-primary-500">السلة</Link>
                <ChevronRight className="w-4 h-4" />
                <span className="text-gray-900">إتمام الشراء</span>
            </nav>

            {/* Steps */}
            <div className="flex justify-center mb-8">
                <div className="flex items-center gap-4">
                    {[
                        { num: 1, title: 'العنوان', icon: Truck },
                        { num: 2, title: 'الدفع', icon: CreditCard },
                        { num: 3, title: 'تأكيد', icon: CheckCircle },
                    ].map((s, index) => (
                        <div key={s.num} className="flex items-center gap-4">
                            <div className={`flex items-center gap-2 ${step >= s.num ? 'text-primary-500' : 'text-gray-400'}`}>
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= s.num ? 'bg-primary-500 text-white' : 'bg-gray-200'
                                    }`}>
                                    <s.icon className="w-5 h-5" />
                                </div>
                                <span className="font-medium hidden sm:block">{s.title}</span>
                            </div>
                            {index < 2 && <div className={`w-12 h-1 rounded ${step > s.num ? 'bg-primary-500' : 'bg-gray-200'}`} />}
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form */}
                <div className="lg:col-span-2">
                    <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-sm">
                        {step === 1 && (
                            <>
                                <h2 className="text-xl font-bold mb-6">عنوان التوصيل</h2>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block mb-2 font-medium">الاسم الأول</label>
                                        <input
                                            type="text"
                                            value={formData.firstName}
                                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                            className="input-field"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block mb-2 font-medium">اسم العائلة</label>
                                        <input
                                            type="text"
                                            value={formData.lastName}
                                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                            className="input-field"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block mb-2 font-medium">رقم الجوال</label>
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="input-field"
                                            dir="ltr"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block mb-2 font-medium">البريد الإلكتروني</label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="input-field"
                                            dir="ltr"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block mb-2 font-medium">المدينة</label>
                                        <select
                                            value={formData.city}
                                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                            className="input-field"
                                            required
                                        >
                                            <option value="">اختر المدينة</option>
                                            <option value="riyadh">الرياض</option>
                                            <option value="jeddah">جدة</option>
                                            <option value="dammam">الدمام</option>
                                            <option value="makkah">مكة المكرمة</option>
                                            <option value="madinah">المدينة المنورة</option>
                                        </select>
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block mb-2 font-medium">العنوان التفصيلي</label>
                                        <textarea
                                            value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                            className="input-field"
                                            rows={3}
                                            required
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        {step === 2 && (
                            <>
                                <h2 className="text-xl font-bold mb-6">طريقة الدفع</h2>
                                <div className="space-y-4">
                                    <label className={`block p-4 border-2 rounded-xl cursor-pointer transition ${formData.paymentMethod === 'cod' ? 'border-primary-500 bg-primary-50' : 'border-gray-200'
                                        }`}>
                                        <input
                                            type="radio"
                                            name="payment"
                                            value="cod"
                                            checked={formData.paymentMethod === 'cod'}
                                            onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                                            className="ml-2"
                                        />
                                        <span className="font-medium">الدفع عند الاستلام</span>
                                        <p className="text-sm text-gray-500 mt-1">ادفع نقداً عند استلام الطلب</p>
                                    </label>

                                    <label className={`block p-4 border-2 rounded-xl cursor-pointer transition ${formData.paymentMethod === 'card' ? 'border-primary-500 bg-primary-50' : 'border-gray-200'
                                        }`}>
                                        <input
                                            type="radio"
                                            name="payment"
                                            value="card"
                                            checked={formData.paymentMethod === 'card'}
                                            onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                                            className="ml-2"
                                        />
                                        <span className="font-medium">بطاقة ائتمانية</span>
                                        <p className="text-sm text-gray-500 mt-1">Visa, Mastercard, Mada</p>
                                    </label>

                                    <label className={`block p-4 border-2 rounded-xl cursor-pointer transition ${formData.paymentMethod === 'bank' ? 'border-primary-500 bg-primary-50' : 'border-gray-200'
                                        }`}>
                                        <input
                                            type="radio"
                                            name="payment"
                                            value="bank"
                                            checked={formData.paymentMethod === 'bank'}
                                            onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                                            className="ml-2"
                                        />
                                        <span className="font-medium">تحويل بنكي</span>
                                        <p className="text-sm text-gray-500 mt-1">حوّل المبلغ مباشرة لحسابنا البنكي</p>
                                    </label>
                                </div>
                            </>
                        )}

                        {step === 3 && (
                            <>
                                <h2 className="text-xl font-bold mb-6">تأكيد الطلب</h2>
                                <div className="space-y-4">
                                    <div className="p-4 bg-gray-50 rounded-xl">
                                        <h3 className="font-bold mb-2">عنوان التوصيل</h3>
                                        <p className="text-gray-600">
                                            {formData.firstName} {formData.lastName}<br />
                                            {formData.address}<br />
                                            {formData.city}<br />
                                            {formData.phone}
                                        </p>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-xl">
                                        <h3 className="font-bold mb-2">طريقة الدفع</h3>
                                        <p className="text-gray-600">
                                            {formData.paymentMethod === 'cod' && 'الدفع عند الاستلام'}
                                            {formData.paymentMethod === 'card' && 'بطاقة ائتمانية'}
                                            {formData.paymentMethod === 'bank' && 'تحويل بنكي'}
                                        </p>
                                    </div>
                                </div>
                            </>
                        )}

                        <div className="flex gap-4 mt-8">
                            {step > 1 && (
                                <button
                                    type="button"
                                    onClick={() => setStep(step - 1)}
                                    className="btn-outline flex-1"
                                >
                                    السابق
                                </button>
                            )}
                            <button type="submit" className="btn-primary flex-1">
                                {step === 3 ? 'تأكيد الطلب' : 'التالي'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl p-6 shadow-sm sticky top-24">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">ملخص الطلب</h2>

                        <div className="space-y-3 mb-4">
                            <div className="flex justify-between">
                                <span className="text-gray-600">المجموع الفرعي</span>
                                <span className="font-bold">{subtotal.toFixed(2)} ر.س</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">الشحن</span>
                                <span className="text-green-500 font-bold">مجاني</span>
                            </div>
                        </div>

                        <div className="border-t pt-4">
                            <div className="flex justify-between text-lg">
                                <span className="font-bold">الإجمالي</span>
                                <span className="font-bold text-primary-500">{total.toFixed(2)} ر.س</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

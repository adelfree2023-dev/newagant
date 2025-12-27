'use client';

/**
 * Storefront Checkout Page
 * صفحة إتمام الطلب - الإصدار المطور
 * 
 * يجب وضعه في: storefront/app/checkout/page.tsx
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';

interface ShippingAddress {
    name: string;
    phone: string;
    city: string;
    district: string;
    street: string;
    building: string;
    notes?: string;
}

interface PaymentMethod {
    type: 'online' | 'cod' | 'bank_transfer';
    label: string;
    icon: string;
    description: string;
    extraFee?: number;
}

const PAYMENT_METHODS: PaymentMethod[] = [
    { type: 'online', label: 'بطاقة ائتمان', icon: '💳', description: 'Visa, Mastercard, مدى' },
    { type: 'cod', label: 'الدفع عند الاستلام', icon: '💵', description: 'نقداً عند التوصيل', extraFee: 15 },
    { type: 'bank_transfer', label: 'تحويل بنكي', icon: '🏦', description: 'تحويل لحسابنا البنكي' },
];

export default function CheckoutPage() {
    const router = useRouter();
    const { isAuthenticated, user, requireAuth } = useAuth();
    const { items, total, itemCount, clearCart } = useCart();

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [shippingCost, setShippingCost] = useState(25);
    const [couponCode, setCouponCode] = useState('');
    const [couponDiscount, setCouponDiscount] = useState(0);
    const [couponError, setCouponError] = useState('');

    const [address, setAddress] = useState<ShippingAddress>({
        name: user?.name || '',
        phone: user?.phone || '',
        city: '',
        district: '',
        street: '',
        building: '',
        notes: '',
    });

    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod['type']>('cod');

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login?redirect=/checkout');
        }

        if (itemCount === 0 && step !== 4) {
            // Avoid redirect if already finished
        }
    }, [isAuthenticated, itemCount]);

    useEffect(() => {
        if (total >= 200) {
            setShippingCost(0);
        } else {
            setShippingCost(25);
        }
    }, [total]);

    async function applyCoupon() {
        if (!couponCode.trim()) return;

        setCouponError('');
        try {
            const result = await api.coupons.validate(couponCode, total);

            if (result.data && result.data.valid) {
                const discount = result.data.type === 'percentage'
                    ? (total * result.data.discount / 100)
                    : result.data.discount;
                setCouponDiscount(discount);
            } else {
                setCouponError(result.error || 'كوبون غير صالح');
                setCouponDiscount(0);
            }
        } catch (error) {
            setCouponError('فشل في التحقق من الكوبون');
        }
    }

    async function placeOrder() {
        if (!address.name || !address.phone || !address.city || !address.street) {
            alert('يرجى إكمال بيانات الشحن');
            setStep(1);
            return;
        }

        setLoading(true);
        try {
            const orderData = {
                items: items.map(i => ({
                    productId: i.product_id,
                    quantity: i.quantity,
                })),
                address: {
                    name: address.name,
                    phone: address.phone,
                    address: `${address.city}, ${address.district}, ${address.street}, ${address.building}`,
                    city: address.city
                },
                paymentMethod: paymentMethod,
                couponCode: couponCode || undefined,
                notes: address.notes,
            };

            const result = await api.orders.create(orderData as any);

            if (result.data) {
                clearCart();
                setStep(4); // Success step
            } else {
                alert(result.error || 'فشل في إنشاء الطلب');
            }
        } catch (error) {
            console.error('Error placing order:', error);
            alert('حدث خطأ أثناء إنشاء الطلب');
        } finally {
            setLoading(false);
        }
    }

    const selectedPayment = PAYMENT_METHODS.find(p => p.type === paymentMethod);
    const paymentFee = selectedPayment?.extraFee || 0;
    const finalTotal = total + shippingCost + paymentFee - couponDiscount;

    // Success Screen
    if (step === 4) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="text-4xl">✓</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">تم استلام طلبك!</h1>
                    <p className="text-gray-500 mb-6">
                        سيتم التواصل معك قريباً لتأكيد الطلب
                    </p>
                    <button
                        onClick={() => router.push('/account/orders')}
                        className="w-full py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700"
                    >
                        متابعة طلباتي
                    </button>
                    <button
                        onClick={() => router.push('/')}
                        className="w-full py-3 mt-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200"
                    >
                        العودة للرئيسية
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-6xl mx-auto px-4">
                {/* Steps Header */}
                <div className="flex items-center justify-center gap-4 mb-8">
                    {[
                        { num: 1, label: 'الشحن' },
                        { num: 2, label: 'الدفع' },
                        { num: 3, label: 'المراجعة' },
                    ].map((s, i) => (
                        <div key={s.num} className="flex items-center gap-2">
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= s.num
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-gray-200 text-gray-500'
                                    }`}
                            >
                                {step > s.num ? '✓' : s.num}
                            </div>
                            <span className={step >= s.num ? 'text-gray-900 font-medium' : 'text-gray-400'}>
                                {s.label}
                            </span>
                            {i < 2 && <div className="w-12 h-px bg-gray-300 mx-2"></div>}
                        </div>
                    ))}
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Form Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {step === 1 && (
                            <div className="bg-white rounded-xl shadow-sm p-6">
                                <h2 className="text-xl font-bold mb-6">📍 عنوان الشحن</h2>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">الاسم الكامل *</label>
                                        <input
                                            type="text"
                                            value={address.name}
                                            onChange={(e) => setAddress({ ...address, name: e.target.value })}
                                            className="w-full px-4 py-3 border rounded-lg"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">رقم الجوال *</label>
                                        <input
                                            type="tel"
                                            value={address.phone}
                                            onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                                            className="w-full px-4 py-3 border rounded-lg"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">المدينة *</label>
                                        <select
                                            value={address.city}
                                            onChange={(e) => setAddress({ ...address, city: e.target.value })}
                                            className="w-full px-4 py-3 border rounded-lg"
                                        >
                                            <option value="">اختر المدينة</option>
                                            <option value="الرياض">الرياض</option>
                                            <option value="جدة">جدة</option>
                                            <option value="مكة المكرمة">مكة المكرمة</option>
                                            <option value="المدينة المنورة">المدينة المنورة</option>
                                            <option value="الدمام">الدمام</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">الحي *</label>
                                        <input
                                            type="text"
                                            value={address.district}
                                            onChange={(e) => setAddress({ ...address, district: e.target.value })}
                                            className="w-full px-4 py-3 border rounded-lg"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium mb-1">الشارع *</label>
                                        <input
                                            type="text"
                                            value={address.street}
                                            onChange={(e) => setAddress({ ...address, street: e.target.value })}
                                            className="w-full px-4 py-3 border rounded-lg"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium mb-1">الشارع *</label>
                                        <input
                                            type="text"
                                            value={address.street}
                                            onChange={(e) => setAddress({ ...address, street: e.target.value })}
                                            className="w-full px-4 py-3 border rounded-lg"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium mb-1">
                                            رابط الموقع (Google Maps) 📍
                                            <span className="text-xs text-gray-500 font-normal mr-2">(اختياري، لتسهيل وصول المندوب)</span>
                                        </label>
                                        <input
                                            type="url"
                                            placeholder="https://maps.google.com/..."
                                            value={address.notes} // Storing maps link in notes for now, or append to address
                                            onChange={(e) => setAddress({ ...address, notes: e.target.value })}
                                            className="w-full px-4 py-3 border rounded-lg text-left dir-ltr"
                                        />
                                    </div>
                                </div>
                                <button
                                    onClick={() => setStep(2)}
                                    className="mt-6 w-full py-3 bg-primary-600 text-white rounded-lg font-bold hover:bg-primary-700"
                                >
                                    متابعة للدفع
                                </button>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="bg-white rounded-xl shadow-sm p-6">
                                <h2 className="text-xl font-bold mb-6">💳 طريقة الدفع</h2>
                                <div className="space-y-3">
                                    {PAYMENT_METHODS.map((method) => (
                                        <label
                                            key={method.type}
                                            className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === method.type
                                                ? 'border-primary-500 bg-primary-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                        >
                                            <input
                                                type="radio"
                                                name="payment"
                                                checked={paymentMethod === method.type}
                                                onChange={() => setPaymentMethod(method.type)}
                                                className="sr-only"
                                            />
                                            <span className="text-2xl">{method.icon}</span>
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-900">{method.label}</p>
                                                <p className="text-sm text-gray-500">{method.description}</p>
                                            </div>
                                            {method.extraFee && (
                                                <span className="text-sm text-yellow-600 font-bold">+{method.extraFee} ر.س</span>
                                            )}
                                        </label>
                                    ))}
                                </div>
                                <div className="flex gap-4 mt-8">
                                    <button onClick={() => setStep(1)} className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">رجوع</button>
                                    <button onClick={() => setStep(3)} className="flex-1 py-3 bg-primary-600 text-white rounded-lg font-bold hover:bg-primary-700">متابعة للمراجعة</button>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="bg-white rounded-xl shadow-sm p-6">
                                <h2 className="text-xl font-bold mb-6">✅ مراجعة الطلب النهائي</h2>
                                <div className="space-y-4">
                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <h3 className="font-bold flex items-center justify-between mb-2">
                                            📍 العنوان <button onClick={() => setStep(1)} className="text-xs text-primary-600">تعديل</button>
                                        </h3>
                                        <p className="text-sm text-gray-600">{address.name} - {address.phone}</p>
                                        <p className="text-sm text-gray-600">{address.street}, {address.district}, {address.city}</p>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <h3 className="font-bold flex items-center justify-between mb-2">
                                            💳 الدفع <button onClick={() => setStep(2)} className="text-xs text-primary-600">تعديل</button>
                                        </h3>
                                        <p className="text-sm text-gray-600">{selectedPayment?.label}</p>
                                    </div>
                                    <div className="border-t pt-4">
                                        <h3 className="font-bold mb-3">🛒 المنتجات ({itemCount})</h3>
                                        <div className="space-y-2">
                                            {items.map((item) => (
                                                <div key={item.id} className="flex justify-between text-sm">
                                                    <span>{item.product?.name} × {item.quantity}</span>
                                                    <span className="font-bold">{(item.product?.price || 0 * item.quantity).toFixed(2)} ر.س</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={placeOrder}
                                    disabled={loading}
                                    className="mt-8 w-full py-4 bg-green-600 text-white rounded-xl font-bold text-lg hover:bg-green-700 disabled:bg-gray-400"
                                >
                                    {loading ? 'جاري إنشاء الطلب...' : `تأكيد الطلب - ${finalTotal.toFixed(2)} ر.س`}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Order Summary Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
                            <h2 className="text-lg font-bold mb-4">ملخص الحساب</h2>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between text-gray-600">
                                    <span>المجموع الفرعي</span>
                                    <span>{total.toFixed(2)} ر.س</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>الشحن</span>
                                    <span className={shippingCost === 0 ? 'text-green-600' : ''}>
                                        {shippingCost === 0 ? 'مجاني' : `${shippingCost.toFixed(2)} ر.س`}
                                    </span>
                                </div>
                                {paymentFee > 0 && (
                                    <div className="flex justify-between text-yellow-700">
                                        <span>رسوم الدفع عند الاستلام</span>
                                        <span>{paymentFee.toFixed(2)} ر.س</span>
                                    </div>
                                )}{couponDiscount > 0 && (
                                    <div className="flex justify-between text-green-600">
                                        <span>خصم الكوبون</span>
                                        <span>-{couponDiscount.toFixed(2)} ر.س</span>
                                    </div>
                                )}
                                <div className="pt-4 border-t flex justify-between text-xl font-bold text-primary-600">
                                    <span>الإجمالي</span>
                                    <span>{finalTotal.toFixed(2)} ر.س</span>
                                </div>
                            </div>

                            <div className="mt-6">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="كود الخصم"
                                        value={couponCode}
                                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                        className="flex-1 px-3 py-2 border rounded-lg text-sm"
                                    />
                                    <button onClick={applyCoupon} className="px-4 py-2 bg-gray-100 rounded-lg text-sm font-bold">تطبيق</button>
                                </div>
                                {couponError && <p className="text-red-500 text-xs mt-1">{couponError}</p>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

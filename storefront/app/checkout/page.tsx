'use client';

/**
 * Storefront Checkout Page
 * صفحة إتمام الشراء
 * 
 * يجب وضعه في: storefront/app/checkout/page.tsx
 */

import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

interface ShippingAddress {
    name: string;
    phone: string;
    address: string;
    city: string;
    notes: string;
}

export default function CheckoutPage() {
    const { items, total, clearCart } = useCart();
    const { user } = useAuth();
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [step, setStep] = useState<'address' | 'payment' | 'confirmation'>('address');
    const [paymentMethod, setPaymentMethod] = useState<'cod' | 'card'>('cod');

    const [address, setAddress] = useState<ShippingAddress>({
        name: user?.name || '',
        phone: user?.phone || '',
        address: '',
        city: '',
        notes: '',
    });

    const shippingCost = total >= 200 ? 0 : 25;
    const grandTotal = total + shippingCost;

    const cities = [
        'الرياض', 'جدة', 'مكة المكرمة', 'المدينة المنورة', 'الدمام',
        'الخبر', 'الظهران', 'الجبيل', 'الطائف', 'تبوك', 'القصيم',
    ];

    const handleAddressSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!address.name || !address.phone || !address.address || !address.city) {
            setError('يرجى ملء جميع الحقول المطلوبة');
            return;
        }
        setError(null);
        setStep('payment');
    };

    const handlePlaceOrder = async () => {
        try {
            setLoading(true);
            setError(null);

            const orderData = {
                items: items.map(item => ({
                    product_id: item.productId,
                    quantity: item.quantity,
                    price: item.price,
                })),
                shipping_address: address,
                payment_method: paymentMethod,
                subtotal: total,
                shipping_cost: shippingCost,
                total: grandTotal,
                notes: address.notes,
            };

            const result = await api.orders.create(orderData);

            if (result.error) {
                setError(result.error);
                return;
            }

            // Success!
            clearCart();
            setStep('confirmation');

        } catch (err) {
            setError('حدث خطأ في إنشاء الطلب');
        } finally {
            setLoading(false);
        }
    };

    if (items.length === 0 && step !== 'confirmation') {
        router.push('/cart');
        return null;
    }

    // Confirmation Step
    if (step === 'confirmation') {
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
            <div className="max-w-4xl mx-auto px-4">
                {/* Progress Steps */}
                <div className="flex items-center justify-center gap-4 mb-8">
                    <div className={`flex items-center gap-2 ${step === 'address' ? 'text-primary-600' : 'text-gray-400'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'address' ? 'bg-primary-600 text-white' : 'bg-gray-200'
                            }`}>
                            1
                        </div>
                        <span className="font-medium">العنوان</span>
                    </div>
                    <div className="w-12 h-px bg-gray-300"></div>
                    <div className={`flex items-center gap-2 ${step === 'payment' ? 'text-primary-600' : 'text-gray-400'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'payment' ? 'bg-primary-600 text-white' : 'bg-gray-200'
                            }`}>
                            2
                        </div>
                        <span className="font-medium">الدفع</span>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Form */}
                    <div className="lg:col-span-2">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                                {error}
                            </div>
                        )}

                        {/* Address Step */}
                        {step === 'address' && (
                            <form onSubmit={handleAddressSubmit} className="bg-white rounded-xl shadow-sm p-6">
                                <h2 className="text-lg font-bold text-gray-900 mb-4">عنوان التوصيل</h2>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            الاسم الكامل *
                                        </label>
                                        <input
                                            type="text"
                                            value={address.name}
                                            onChange={(e) => setAddress({ ...address, name: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            رقم الهاتف *
                                        </label>
                                        <input
                                            type="tel"
                                            value={address.phone}
                                            onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        المدينة *
                                    </label>
                                    <select
                                        value={address.city}
                                        onChange={(e) => setAddress({ ...address, city: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                        required
                                    >
                                        <option value="">اختر المدينة</option>
                                        {cities.map((city) => (
                                            <option key={city} value={city}>{city}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        العنوان التفصيلي *
                                    </label>
                                    <textarea
                                        value={address.address}
                                        onChange={(e) => setAddress({ ...address, address: e.target.value })}
                                        rows={3}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                        placeholder="الحي، الشارع، رقم المبنى، الشقة..."
                                        required
                                    />
                                </div>

                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        ملاحظات (اختياري)
                                    </label>
                                    <input
                                        type="text"
                                        value={address.notes}
                                        onChange={(e) => setAddress({ ...address, notes: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                        placeholder="تعليمات التوصيل..."
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full mt-6 py-3 bg-primary-600 text-white rounded-lg font-bold hover:bg-primary-700"
                                >
                                    متابعة للدفع
                                </button>
                            </form>
                        )}

                        {/* Payment Step */}
                        {step === 'payment' && (
                            <div className="bg-white rounded-xl shadow-sm p-6">
                                <h2 className="text-lg font-bold text-gray-900 mb-4">طريقة الدفع</h2>

                                <div className="space-y-3">
                                    <label className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer ${paymentMethod === 'cod' ? 'border-primary-500 bg-primary-50' : 'border-gray-200'
                                        }`}>
                                        <input
                                            type="radio"
                                            name="payment"
                                            checked={paymentMethod === 'cod'}
                                            onChange={() => setPaymentMethod('cod')}
                                            className="text-primary-600"
                                        />
                                        <div className="flex-1">
                                            <p className="font-medium">الدفع عند الاستلام</p>
                                            <p className="text-sm text-gray-500">ادفع نقداً عند التوصيل</p>
                                        </div>
                                        <span className="text-2xl">💵</span>
                                    </label>

                                    <label className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer ${paymentMethod === 'card' ? 'border-primary-500 bg-primary-50' : 'border-gray-200'
                                        }`}>
                                        <input
                                            type="radio"
                                            name="payment"
                                            checked={paymentMethod === 'card'}
                                            onChange={() => setPaymentMethod('card')}
                                            className="text-primary-600"
                                        />
                                        <div className="flex-1">
                                            <p className="font-medium">بطاقة ائتمان</p>
                                            <p className="text-sm text-gray-500">Visa, Mastercard, مدى</p>
                                        </div>
                                        <span className="text-2xl">💳</span>
                                    </label>
                                </div>

                                <div className="flex gap-3 mt-6">
                                    <button
                                        onClick={() => setStep('address')}
                                        className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200"
                                    >
                                        رجوع
                                    </button>
                                    <button
                                        onClick={handlePlaceOrder}
                                        disabled={loading}
                                        className="flex-1 py-3 bg-primary-600 text-white rounded-lg font-bold hover:bg-primary-700 disabled:bg-gray-300"
                                    >
                                        {loading ? 'جاري الطلب...' : 'تأكيد الطلب'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">ملخص الطلب</h2>

                            <div className="space-y-3 text-sm max-h-60 overflow-y-auto">
                                {items.map((item) => (
                                    <div key={item.productId} className="flex justify-between">
                                        <span className="text-gray-600">{item.name} × {item.quantity}</span>
                                        <span>{(item.price * item.quantity).toFixed(2)} ر.س</span>
                                    </div>
                                ))}
                            </div>

                            <hr className="my-4" />

                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">المجموع الفرعي</span>
                                    <span>{total.toFixed(2)} ر.س</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">الشحن</span>
                                    <span className={shippingCost === 0 ? 'text-green-600' : ''}>
                                        {shippingCost === 0 ? 'مجاني' : `${shippingCost} ر.س`}
                                    </span>
                                </div>
                            </div>

                            <hr className="my-4" />

                            <div className="flex justify-between text-lg font-bold">
                                <span>الإجمالي</span>
                                <span className="text-primary-600">{grandTotal.toFixed(2)} ر.س</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

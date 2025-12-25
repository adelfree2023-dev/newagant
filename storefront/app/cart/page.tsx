'use client';

/**
 * Storefront Cart Page
 * صفحة السلة مع API
 * 
 * يجب وضعه في: storefront/app/cart/page.tsx
 */

import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function CartPage() {
    const { items, total, itemCount, updateQuantity, removeFromCart, clearCart } = useCart();
    const { isAuthenticated } = useAuth();
    const router = useRouter();

    const shippingCost = total >= 200 ? 0 : 25; // شحن مجاني للطلبات فوق 200
    const grandTotal = total + shippingCost;

    const handleCheckout = () => {
        if (!isAuthenticated) {
            router.push('/login?redirect=/checkout');
            return;
        }
        router.push('/checkout');
    };

    if (items.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <span className="text-8xl block mb-6">🛒</span>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">السلة فارغة</h2>
                    <p className="text-gray-500 mb-6">أضف بعض المنتجات لتبدأ التسوق</p>
                    <Link
                        href="/products"
                        className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
                    >
                        تصفح المنتجات
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">
                        سلة التسوق ({itemCount} منتج)
                    </h1>
                    <button
                        onClick={() => clearCart()}
                        className="text-red-600 hover:text-red-700 text-sm font-medium"
                    >
                        إفراغ السلة
                    </button>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-4">
                        {items.map((item) => (
                            <div
                                key={item.productId}
                                className="bg-white rounded-xl shadow-sm p-4 flex gap-4"
                            >
                                {/* Product Image */}
                                <div className="w-24 h-24 relative flex-shrink-0 rounded-lg overflow-hidden">
                                    {item.image ? (
                                        <Image
                                            src={item.image}
                                            alt={item.name}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                            <span className="text-2xl">📦</span>
                                        </div>
                                    )}
                                </div>

                                {/* Product Info */}
                                <div className="flex-1">
                                    <h3 className="font-medium text-gray-900">{item.name}</h3>
                                    <p className="text-primary-600 font-bold mt-1">
                                        {item.price.toFixed(2)} ر.س
                                    </p>

                                    {/* Quantity Controls */}
                                    <div className="flex items-center gap-3 mt-3">
                                        <button
                                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold"
                                        >
                                            -
                                        </button>
                                        <span className="font-medium w-8 text-center">{item.quantity}</span>
                                        <button
                                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>

                                {/* Item Total & Remove */}
                                <div className="text-left flex flex-col justify-between">
                                    <p className="font-bold text-gray-900">
                                        {(item.price * item.quantity).toFixed(2)} ر.س
                                    </p>
                                    <button
                                        onClick={() => removeFromCart(item.productId)}
                                        className="text-red-500 hover:text-red-600 text-sm"
                                    >
                                        حذف
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">ملخص الطلب</h2>

                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">المجموع الفرعي</span>
                                    <span className="font-medium">{total.toFixed(2)} ر.س</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">الشحن</span>
                                    <span className="font-medium">
                                        {shippingCost === 0 ? (
                                            <span className="text-green-600">مجاني</span>
                                        ) : (
                                            `${shippingCost.toFixed(2)} ر.س`
                                        )}
                                    </span>
                                </div>
                                {shippingCost > 0 && (
                                    <p className="text-xs text-gray-400">
                                        أضف {(200 - total).toFixed(2)} ر.س للحصول على شحن مجاني
                                    </p>
                                )}
                                <hr />
                                <div className="flex justify-between text-lg font-bold">
                                    <span>الإجمالي</span>
                                    <span className="text-primary-600">{grandTotal.toFixed(2)} ر.س</span>
                                </div>
                            </div>

                            <button
                                onClick={handleCheckout}
                                className="w-full mt-6 py-3 bg-primary-600 text-white rounded-lg font-bold hover:bg-primary-700 transition-colors"
                            >
                                إتمام الشراء
                            </button>

                            <Link
                                href="/products"
                                className="block text-center mt-4 text-primary-600 hover:underline text-sm"
                            >
                                متابعة التسوق
                            </Link>

                            {/* Trust Badges */}
                            <div className="mt-6 pt-6 border-t flex items-center justify-center gap-4 text-xs text-gray-500">
                                <span>🔒 دفع آمن</span>
                                <span>🚚 توصيل سريع</span>
                                <span>↩️ إرجاع سهل</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

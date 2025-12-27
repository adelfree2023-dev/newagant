'use client';

import { useCart } from '@/context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function CartPage() {
    const { items, total, updateQuantity, removeFromCart, loading } = useCart();
    const shipping = 25; // Default for now, should come from settings

    if (loading && items.length === 0) {
        return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin w-8 h-8" /></div>;
    }

    if (items.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="bg-white p-6 rounded-full shadow-sm mb-6">
                    <ShoppingBag className="w-16 h-16 text-gray-300" />
                </motion.div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">سلة المشتريات فارغة</h2>
                <p className="text-gray-500 mb-8">لم تقم بإضافة أي منتجات للسلة بعد</p>
                <Link href="/products" className="px-8 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-all flex items-center gap-2">
                    <ArrowLeft className="w-5 h-5" /> تسوق الآن
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4" dir="rtl">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                    <ShoppingBag /> سلة المشتريات
                    <span className="bg-gray-200 text-gray-600 text-sm px-3 py-1 rounded-full">{items.length} منتجات</span>
                </h1>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Cart Items */}
                    <div className="flex-1 space-y-4">
                        <AnimatePresence>
                            {items.map((item) => (
                                <motion.div
                                    key={item.id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: -100 }}
                                    className="bg-white p-4 rounded-2xl flex gap-4 border border-gray-100 shadow-sm"
                                >
                                    <div className="w-24 h-24 bg-gray-100 rounded-xl relative overflow-hidden flex-shrink-0">
                                        {/* Use first image or placeholder */}
                                        {/* Assume item has product info with images */}
                                        {(item as any).product?.images?.[0] ? (
                                            <Image
                                                src={(item as any).product.images[0]}
                                                alt={item.product_id}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center text-gray-300">🖼️</div>
                                        )}
                                    </div>
                                    <div className="flex-1 flex flex-col justify-between">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-bold text-gray-900">{(item as any).product?.name || 'منتج'}</h3>
                                                <p className="text-sm text-gray-500">{(item as any).product?.category_id || ''}</p>
                                            </div>
                                            <button
                                                onClick={() => removeFromCart(item.id)}
                                                className="text-gray-400 hover:text-red-500 p-2 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                        <div className="flex justify-between items-end">
                                            <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-1 border border-gray-100">
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    className="p-1 hover:bg-white rounded shadow-sm disabled:opacity-50"
                                                    disabled={item.quantity <= 1}
                                                >
                                                    <Minus className="w-4 h-4" />
                                                </button>
                                                <span className="font-medium w-4 text-center">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    className="p-1 hover:bg-white rounded shadow-sm"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <p className="font-bold text-lg">{((item as any).product?.price || 0) * item.quantity} ر.س</p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    {/* Summary */}
                    <div className="w-full lg:w-96">
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 sticky top-24">
                            <h2 className="text-xl font-bold mb-6">ملخص الطلب</h2>
                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between text-gray-500">
                                    <span>المجموع الفرعي</span>
                                    <span>{total} ر.س</span>
                                </div>
                                <div className="flex justify-between text-gray-500">
                                    <span>الشحن</span>
                                    <span>{shipping} ر.س</span>
                                </div>
                                <div className="border-t pt-4 flex justify-between font-bold text-lg text-gray-900">
                                    <span>الإجمالي</span>
                                    <span>{total + shipping} ر.س</span>
                                </div>
                            </div>
                            <button className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2">
                                إتمام الشراء <ArrowLeft className="w-5 h-5" />
                            </button>
                            <Link href="/products" className="block text-center mt-4 text-gray-500 hover:text-gray-900 text-sm">
                                مواصلة التسوق
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

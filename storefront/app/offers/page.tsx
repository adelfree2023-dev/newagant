'use client';

import { useEffect, useState } from 'react';
import { storeApi } from '@/lib/api';
import { motion } from 'framer-motion';
import { ShoppingBag, Tag } from 'lucide-react';
import Image from 'next/image';

export default function OffersPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                // Fetch all products and filter for discounts
                // Ideally backend should support /products?has_discount=true
                const allProducts = await storeApi.products.list();
                const discounted = (allProducts.products || allProducts).filter((p: any) =>
                    p.compare_price && p.compare_price > p.price
                );
                setProducts(discounted);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4" dir="rtl">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16 relative">
                    <div className="absolute inset-0 flex items-center justify-center opacity-5">
                        <Tag className="w-48 h-48 text-red-600" />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-4 relative z-10">عروض خاصة 🔥</h1>
                    <p className="text-gray-500 relative z-10">أقوى التخفيضات لفترة محدودة</p>
                </div>

                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-pulse">
                        {[...Array(4)].map((_, i) => <div key={i} className="h-64 bg-gray-200 rounded-2xl"></div>)}
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-xl text-gray-400">لا توجد عروض حالياً. تابعنا قريباً!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {products.map((product, i) => (
                            <motion.div
                                key={product.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-100 group relative"
                            >
                                <div className="absolute top-4 right-4 z-10 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                                    خصم {Math.round(((product.compare_price - product.price) / product.compare_price) * 100)}%
                                </div>
                                <div className="aspect-[4/5] relative bg-gray-100">
                                    {product.images?.[0] && (
                                        <Image
                                            src={product.images[0]}
                                            alt={product.name}
                                            fill
                                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                    )}
                                </div>
                                <div className="p-4">
                                    <h3 className="font-bold text-gray-900 mb-2 truncate">{product.name}</h3>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl font-bold text-red-600">{product.price} ر.س</span>
                                        <span className="text-sm text-gray-400 line-through">{product.compare_price} ر.س</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

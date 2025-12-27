'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Star, Search, Filter } from 'lucide-react';
import { storeApi } from '@/lib/api';
import Image from 'next/image';

interface Product {
    id: string;
    name: string;
    price: number;
    compare_price?: number;
    images: string[];
    category_name?: string;
    is_active: boolean;
    stock: number;
    slug: string;
}

export default function StorefrontHome() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            try {
                // Fetch products (public)
                // Note: The API middleware will handle tenant resolution based on domain
                // For localhost, it defaults to 'demo' tenant or first active one via our backend fallback
                const data = await storeApi.products.list();
                if (data && data.products) {
                    setProducts(data.products);
                } else if (Array.isArray(data)) {
                    setProducts(data);
                }
            } catch (err) {
                console.error('Failed to load store data', err);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    // Animation Variants
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans" dir="rtl">

            {/* Navbar (Mock) */}
            <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center font-bold text-xl">
                            S
                        </div>
                        <span className="font-bold text-xl tracking-tight text-gray-900">Storefront</span>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="p-2 hover:bg-gray-100 rounded-full transition-colors relative">
                            <ShoppingBag className="w-6 h-6 text-gray-700" />
                            <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full font-bold">2</span>
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="bg-gray-900 text-white py-20 px-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1556740758-90de374c12ad?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-20"></div>
                <div className="max-w-7xl mx-auto relative z-10 text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-4xl md:text-6xl font-bold mb-6"
                    >
                        أحدث التشكيلات العصرية
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto"
                    >
                        اكتشف أفضل المنتجات بجودة عالية وأسعار منافسة تصلك أينما كنت.
                    </motion.p>
                    <motion.button
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-white text-gray-900 px-8 py-3 rounded-full font-bold text-lg hover:bg-gray-100 transition-colors shadow-lg"
                    >
                        تسوق الآن
                    </motion.button>
                </div>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="max-w-7xl mx-auto px-4 py-20 text-center">
                    <div className="animate-spin w-12 h-12 border-4 border-gray-200 border-t-black rounded-full mx-auto mb-4"></div>
                </div>
            )}

            {/* Products Grid */}
            {!loading && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                            منتجات مختارة لك
                        </h2>
                        <div className="flex gap-2">
                            <button className="p-2 border rounded-lg hover:bg-white hover:shadow-sm transition-all"><Filter className="w-5 h-5" /></button>
                        </div>
                    </div>

                    {products.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                            <p className="text-gray-500 text-lg">عفواً، لا توجد منتجات حالياً.</p>
                        </div>
                    ) : (
                        <motion.div
                            variants={container}
                            initial="hidden"
                            animate="show"
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
                        >
                            {products.map((product) => (
                                <ProductCard key={product.id} product={product} variants={item} />
                            ))}
                        </motion.div>
                    )}
                </div>
            )}
        </div>
    );
}

function ProductCard({ product, variants }: { product: Product, variants: any }) {
    return (
        <motion.div
            variants={variants}
            className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 cursor-pointer"
        >
            <div className="aspect-[4/5] relative bg-gray-100 overflow-hidden">
                {product.images?.[0] && (
                    <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                )}
                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-10 transition-opacity" />

                <button className="absolute bottom-4 right-4 bg-white text-black p-3 rounded-full shadow-lg translate-y-20 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 hover:bg-black hover:text-white">
                    <ShoppingBag className="w-5 h-5" />
                </button>
            </div>

            <div className="p-5">
                <p className="text-xs text-gray-500 mb-1">{product.category_name || 'عام'}</p>
                <h3 className="font-bold text-gray-900 mb-2 truncate text-lg group-hover:text-blue-600 transition-colors">
                    {product.name}
                </h3>
                <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-gray-900">{product.price} ر.س</span>
                    {product.compare_price && (
                        <span className="text-sm text-gray-400 line-through decoration-red-500/50">
                            {product.compare_price} ر.س
                        </span>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

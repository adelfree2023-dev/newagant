'use client';

/**
 * Storefront Homepage
 * الصفحة الرئيسية
 * 
 * يجب وضعه في: storefront/app/page.tsx
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { api } from '@/lib/api';
import { useCart } from '@/context/CartContext';

interface Product {
    id: string;
    name: string;
    slug: string;
    price: number;
    compare_price?: number;
    images: string[];
    is_featured?: boolean;
}

interface Category {
    id: string;
    name: string;
    slug: string;
    image?: string;
}

export default function HomePage() {
    const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const { addToCart } = useCart();

    useEffect(() => {
        async function loadData() {
            try {
                const [productsRes, categoriesRes] = await Promise.all([
                    api.products.getAll({ featured: true, limit: 8 }),
                    api.categories.getAll(),
                ]);

                if (productsRes.data) setFeaturedProducts(productsRes.data.products || productsRes.data);
                if (categoriesRes.data) setCategories(categoriesRes.data);
            } catch (error) {
                console.error('Error loading homepage data:', error);
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, []);

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="hero py-20 md:py-32">
                <div className="hero-overlay"></div>
                <div className="max-w-7xl mx-auto px-4 relative z-10">
                    <div className="max-w-2xl">
                        <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fadeIn">
                            تسوق بذكاء
                            <br />
                            وفّر أكثر
                        </h1>
                        <p className="text-xl md:text-2xl text-white/80 mb-8 animate-fadeIn">
                            اكتشف أفضل المنتجات بأسعار لا تُقاوم مع شحن مجاني للطلبات فوق 200 ر.س
                        </p>
                        <div className="flex gap-4 animate-slideUp">
                            <Link
                                href="/products"
                                className="px-8 py-4 bg-white text-primary-600 rounded-lg font-bold hover:bg-gray-100 transition-colors"
                            >
                                تسوق الآن
                            </Link>
                            <Link
                                href="/offers"
                                className="px-8 py-4 border-2 border-white text-white rounded-lg font-bold hover:bg-white/10 transition-colors"
                            >
                                العروض 🔥
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="py-8 bg-white border-b">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="flex items-center gap-3 p-4">
                            <span className="text-2xl">🚚</span>
                            <div>
                                <p className="font-medium">شحن مجاني</p>
                                <p className="text-sm text-gray-500">للطلبات فوق 200 ر.س</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-4">
                            <span className="text-2xl">↩️</span>
                            <div>
                                <p className="font-medium">إرجاع سهل</p>
                                <p className="text-sm text-gray-500">خلال 14 يوم</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-4">
                            <span className="text-2xl">💯</span>
                            <div>
                                <p className="font-medium">منتجات أصلية</p>
                                <p className="text-sm text-gray-500">ضمان الجودة</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-4">
                            <span className="text-2xl">📞</span>
                            <div>
                                <p className="font-medium">دعم 24/7</p>
                                <p className="text-sm text-gray-500">للرد على استفساراتك</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Categories */}
            <section className="py-12 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold text-gray-900">تصفح الفئات</h2>
                        <Link href="/categories" className="text-primary-600 hover:underline">
                            عرض الكل ←
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {loading ? (
                            [...Array(6)].map((_, i) => (
                                <div key={i} className="aspect-square bg-gray-200 rounded-xl animate-pulse"></div>
                            ))
                        ) : categories.length === 0 ? (
                            <p className="col-span-full text-center text-gray-500">لا توجد فئات</p>
                        ) : (
                            categories.slice(0, 6).map((category) => (
                                <Link
                                    key={category.id}
                                    href={`/products?category=${category.slug}`}
                                    className="category-card group"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-primary-700 opacity-80 group-hover:opacity-90 transition-opacity"></div>
                                    <div className="category-card-overlay">
                                        <p className="text-white font-bold text-lg">{category.name}</p>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                </div>
            </section>

            {/* Featured Products */}
            <section className="py-12">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold text-gray-900">منتجات مميزة</h2>
                        <Link href="/products?featured=true" className="text-primary-600 hover:underline">
                            عرض الكل ←
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {loading ? (
                            [...Array(8)].map((_, i) => (
                                <div key={i} className="bg-white rounded-xl shadow-sm animate-pulse">
                                    <div className="aspect-square bg-gray-200 rounded-t-xl"></div>
                                    <div className="p-4 space-y-2">
                                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                    </div>
                                </div>
                            ))
                        ) : featuredProducts.length === 0 ? (
                            <p className="col-span-full text-center text-gray-500">لا توجد منتجات مميزة</p>
                        ) : (
                            featuredProducts.map((product) => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    onAddToCart={() => addToCart({
                                        productId: product.id,
                                        name: product.name,
                                        price: product.price,
                                        image: product.images?.[0],
                                        quantity: 1,
                                    })}
                                />
                            ))
                        )}
                    </div>
                </div>
            </section>

            {/* Newsletter */}
            <section className="newsletter">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <h2 className="text-2xl font-bold mb-2">اشترك في نشرتنا البريدية</h2>
                    <p className="text-white/80 mb-6">احصل على آخر العروض والتخفيضات مباشرة في بريدك</p>
                    <form className="flex gap-2 max-w-md mx-auto">
                        <input
                            type="email"
                            placeholder="أدخل بريدك الإلكتروني"
                            className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none"
                        />
                        <button
                            type="submit"
                            className="px-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800"
                        >
                            اشتراك
                        </button>
                    </form>
                </div>
            </section>
        </div>
    );
}

// ==================== Product Card Component ====================

function ProductCard({ product, onAddToCart }: { product: Product; onAddToCart: () => void }) {
    const discount = product.compare_price && product.compare_price > product.price
        ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
        : 0;

    return (
        <div className="product-card group">
            <Link href={`/products/${product.slug}`}>
                <div className="aspect-square relative overflow-hidden">
                    {product.images?.[0] ? (
                        <Image
                            src={product.images[0]}
                            alt={product.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                    ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                            <span className="text-4xl">📦</span>
                        </div>
                    )}

                    {discount > 0 && (
                        <span className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                            -{discount}%
                        </span>
                    )}

                    {product.is_featured && (
                        <span className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold">
                            ⭐ مميز
                        </span>
                    )}
                </div>
            </Link>

            <div className="p-4">
                <Link href={`/products/${product.slug}`}>
                    <h3 className="font-medium text-gray-900 line-clamp-2 hover:text-primary-600">
                        {product.name}
                    </h3>
                </Link>

                <div className="flex items-center gap-2 mt-2">
                    <span className="price text-lg">{product.price.toFixed(2)} ر.س</span>
                    {product.compare_price && product.compare_price > product.price && (
                        <span className="price-old">{product.compare_price.toFixed(2)}</span>
                    )}
                </div>

                <button
                    onClick={onAddToCart}
                    className="mt-3 w-full py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
                >
                    أضف للسلة
                </button>
            </div>
        </div>
    );
}

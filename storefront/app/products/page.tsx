'use client';

/**
 * Storefront Products Page Integration
 * صفحة المنتجات مع API
 * 
 * يجب وضعه في: storefront/app/products/page.tsx
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { storeApi } from '@/lib/api';
import { useCart } from '@/context/CartContext';

interface Product {
    id: string;
    name: string;
    name_ar?: string;
    slug: string;
    price: number;
    compare_price?: number;
    images: string[];
    stock: number;
    category_name?: string;
}

interface Category {
    id: string;
    name: string;
    slug: string;
}

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState('');
    const { addToCart } = useCart();

    useEffect(() => {
        async function loadData() {
            try {
                setLoading(true);
                const [productsRes, categoriesRes] = await Promise.all([
                    storeApi.products.list({ category: selectedCategory, search: searchQuery }),
                    storeApi.categories.list(),
                ]);

                if (productsRes.products) setProducts(productsRes.products);
                else if (Array.isArray(productsRes)) setProducts(productsRes);
                else if (productsRes.data && Array.isArray(productsRes.data)) setProducts(productsRes.data);

                if (categoriesRes) setCategories(categoriesRes);
            } catch (error) {
                console.error('Error loading products:', error);
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, [selectedCategory, searchQuery]);

    const handleAddToCart = (product: Product) => {
        addToCart({
            productId: product.id,
            name: product.name,
            price: product.price,
            image: product.images?.[0],
            quantity: 1,
        });
    };

    const getDiscountPercent = (price: number, comparePrice?: number) => {
        if (!comparePrice || comparePrice <= price) return 0;
        return Math.round(((comparePrice - price) / comparePrice) * 100);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <h1 className="text-2xl font-bold text-gray-900">المنتجات</h1>

                    {/* Search */}
                    <div className="mt-4 flex gap-4">
                        <input
                            type="text"
                            placeholder="ابحث عن منتج..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                    </div>

                    {/* Categories */}
                    <div className="mt-4 flex gap-2 flex-wrap">
                        <button
                            onClick={() => setSelectedCategory('')}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedCategory === ''
                                ? 'bg-primary-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            الكل
                        </button>
                        {categories.map((category) => (
                            <button
                                key={category.id}
                                onClick={() => setSelectedCategory(category.id)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedCategory === category.id
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                {category.name}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Products Grid */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="bg-white rounded-xl shadow-sm animate-pulse">
                                <div className="aspect-square bg-gray-200 rounded-t-xl"></div>
                                <div className="p-4 space-y-2">
                                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-12">
                        <span className="text-6xl mb-4 block">📦</span>
                        <h3 className="text-xl font-medium text-gray-900">لا توجد منتجات</h3>
                        <p className="text-gray-500 mt-2">جرب البحث بكلمات مختلفة</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {products.map((product) => (
                            <div
                                key={product.id}
                                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow group"
                            >
                                {/* Product Image */}
                                <Link href={`/products/${product.slug}`}>
                                    <div className="aspect-square relative overflow-hidden rounded-t-xl">
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

                                        {/* Discount Badge */}
                                        {product.compare_price && product.compare_price > product.price && (
                                            <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                                                -{getDiscountPercent(product.price, product.compare_price)}%
                                            </div>
                                        )}

                                        {/* Out of Stock */}
                                        {product.stock === 0 && (
                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                <span className="bg-white text-gray-900 px-3 py-1 rounded-full text-sm font-medium">
                                                    نفذت الكمية
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </Link>

                                {/* Product Info */}
                                <div className="p-4">
                                    <Link href={`/products/${product.slug}`}>
                                        <h3 className="font-medium text-gray-900 line-clamp-2 hover:text-primary-600">
                                            {product.name}
                                        </h3>
                                    </Link>

                                    {product.category_name && (
                                        <p className="text-sm text-gray-500 mt-1">{product.category_name}</p>
                                    )}

                                    <div className="mt-2 flex items-center gap-2">
                                        <span className="text-lg font-bold text-primary-600">
                                            {product.price.toFixed(2)} ر.س
                                        </span>
                                        {product.compare_price && product.compare_price > product.price && (
                                            <span className="text-sm text-gray-400 line-through">
                                                {product.compare_price.toFixed(2)}
                                            </span>
                                        )}
                                    </div>

                                    <button
                                        onClick={() => handleAddToCart(product)}
                                        disabled={product.stock === 0}
                                        className="mt-3 w-full py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {product.stock === 0 ? 'نفذت الكمية' : 'أضف للسلة'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}


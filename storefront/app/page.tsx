'use client'

import { useState, useEffect } from 'react'
import HeroSlider from '@/components/home/HeroSlider'
import CategoryGrid from '@/components/home/CategoryGrid'
import FlashDeals from '@/components/home/FlashDeals'
import ProductCard from '@/components/product/ProductCard'
import Link from 'next/link'
import { Truck, Shield, Headphones, RotateCcw, Loader2 } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://35.226.47.16:8000'

interface Product {
    id: string
    name: string
    name_ar: string
    slug: string
    price: number
    compare_price?: number
    images: string[]
    category: string
    badge?: 'sale' | 'new' | 'hot'
    rating?: number
    reviews_count?: number
}

interface HomepageData {
    banners: any[]
    categories: any[]
    flash_deals: Product[]
    flash_deals_ends_at: string
    new_arrivals: Product[]
    best_sellers: Product[]
    featured_products: Product[]
}

const features = [
    { icon: Truck, title: 'شحن سريع', description: 'توصيل خلال 2-5 أيام' },
    { icon: Shield, title: 'ضمان الجودة', description: 'منتجات أصلية 100%' },
    { icon: RotateCcw, title: 'استرجاع سهل', description: 'استرجاع خلال 14 يوم' },
    { icon: Headphones, title: 'دعم متواصل', description: 'خدمة عملاء 24/7' },
]

const brands = [
    { name: 'Apple', logo: 'https://via.placeholder.com/120x60/ffffff/333333?text=Apple' },
    { name: 'Samsung', logo: 'https://via.placeholder.com/120x60/ffffff/1428A0?text=Samsung' },
    { name: 'Nike', logo: 'https://via.placeholder.com/120x60/ffffff/333333?text=Nike' },
    { name: 'Adidas', logo: 'https://via.placeholder.com/120x60/ffffff/333333?text=Adidas' },
    { name: 'Sony', logo: 'https://via.placeholder.com/120x60/ffffff/333333?text=Sony' },
    { name: 'LG', logo: 'https://via.placeholder.com/120x60/ffffff/A50034?text=LG' },
]

export default function HomePage() {
    const [data, setData] = useState<HomepageData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await fetch(`${API_URL}/api/homepage`)
                const json = await res.json()
                if (json.success) {
                    setData(json.data)
                } else {
                    setError('Failed to load data')
                }
            } catch (err) {
                console.error('API Error:', err)
                setError('Failed to connect to API')
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-primary-500 mx-auto mb-4" />
                    <p className="text-gray-500">جاري التحميل...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-500 mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="btn-primary"
                    >
                        إعادة المحاولة
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="pb-8">
            {/* Hero Section */}
            <div className="container mx-auto px-4 py-6">
                <HeroSlider banners={data?.banners} />
            </div>

            {/* Features Bar */}
            <div className="bg-white border-y py-6 mb-8">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {features.map((feature, index) => (
                            <div key={index} className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center">
                                    <feature.icon className="w-6 h-6 text-primary-500" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900">{feature.title}</h4>
                                    <p className="text-sm text-gray-500">{feature.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4">
                {/* Categories */}
                <CategoryGrid categories={data?.categories} />

                {/* Flash Deals */}
                <FlashDeals products={data?.flash_deals} endsAt={data?.flash_deals_ends_at} />

                {/* Banner */}
                <div className="my-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Link href="/category/electronics" className="relative overflow-hidden rounded-xl group">
                        <div className="bg-gradient-to-l from-blue-600 to-blue-800 h-48 p-8 flex items-center">
                            <div className="text-white">
                                <span className="text-sm font-medium opacity-80">خصم 30%</span>
                                <h3 className="text-2xl font-bold mb-2">الإلكترونيات</h3>
                                <span className="text-sm opacity-90">على جميع الأجهزة الذكية</span>
                            </div>
                        </div>
                    </Link>
                    <Link href="/category/fashion" className="relative overflow-hidden rounded-xl group">
                        <div className="bg-gradient-to-l from-pink-500 to-purple-600 h-48 p-8 flex items-center">
                            <div className="text-white">
                                <span className="text-sm font-medium opacity-80">مجموعة جديدة</span>
                                <h3 className="text-2xl font-bold mb-2">الأزياء</h3>
                                <span className="text-sm opacity-90">أحدث صيحات الموضة</span>
                            </div>
                        </div>
                    </Link>
                </div>

                {/* New Arrivals */}
                {data?.new_arrivals && data.new_arrivals.length > 0 && (
                    <section className="py-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">وصل حديثاً</h2>
                            <Link href="/new" className="text-primary-500 hover:text-primary-600 font-medium">
                                عرض الكل ←
                            </Link>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                            {data.new_arrivals.map((product) => (
                                <ProductCard
                                    key={product.id}
                                    id={product.id}
                                    name={product.name}
                                    nameAr={product.name_ar}
                                    price={product.price}
                                    comparePrice={product.compare_price}
                                    image={product.images?.[0] || ''}
                                    category={product.category}
                                    badge={product.badge}
                                    rating={product.rating}
                                    reviewCount={product.reviews_count}
                                />
                            ))}
                        </div>
                    </section>
                )}

                {/* Brands */}
                <section className="py-8">
                    <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">تسوق من أفضل الماركات</h2>
                    <div className="flex flex-wrap justify-center gap-6">
                        {brands.map((brand, index) => (
                            <Link
                                key={index}
                                href={`/brand/${brand.name.toLowerCase()}`}
                                className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition"
                            >
                                <img src={brand.logo} alt={brand.name} className="h-10 object-contain" />
                            </Link>
                        ))}
                    </div>
                </section>

                {/* Best Sellers */}
                {data?.best_sellers && data.best_sellers.length > 0 && (
                    <section className="py-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">🔥 الأكثر مبيعاً</h2>
                            <Link href="/best-sellers" className="text-primary-500 hover:text-primary-600 font-medium">
                                عرض الكل ←
                            </Link>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                            {data.best_sellers.map((product) => (
                                <ProductCard
                                    key={product.id}
                                    id={product.id}
                                    name={product.name}
                                    nameAr={product.name_ar}
                                    price={product.price}
                                    comparePrice={product.compare_price}
                                    image={product.images?.[0] || ''}
                                    category={product.category}
                                    badge={product.badge}
                                    rating={product.rating}
                                    reviewCount={product.reviews_count}
                                />
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    )
}

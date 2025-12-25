import HeroSlider from '@/components/home/HeroSlider'
import CategoryGrid from '@/components/home/CategoryGrid'
import FlashDeals from '@/components/home/FlashDeals'
import ProductCard from '@/components/product/ProductCard'
import Link from 'next/link'
import { Truck, Shield, Headphones, RotateCcw } from 'lucide-react'

// Mock products
const newArrivals = [
    {
        id: '5',
        name: 'MacBook Pro M3',
        nameAr: 'ماك بوك برو M3',
        price: 8499,
        image: 'https://via.placeholder.com/300x300/333333/ffffff?text=MacBook',
        category: 'إلكترونيات',
        badge: 'new' as const,
    },
    {
        id: '6',
        name: 'Sony Headphones',
        nameAr: 'سماعات سوني WH-1000XM5',
        price: 1299,
        image: 'https://via.placeholder.com/300x300/1a1a1a/ffffff?text=Sony',
        category: 'إلكترونيات',
        badge: 'new' as const,
    },
    {
        id: '7',
        name: 'Adidas Running',
        nameAr: 'حذاء أديداس للجري',
        price: 399,
        image: 'https://via.placeholder.com/300x300/000000/ffffff?text=Adidas',
        category: 'رياضة',
        badge: 'new' as const,
    },
    {
        id: '8',
        name: 'Smart Watch',
        nameAr: 'ساعة ذكية Galaxy Watch',
        price: 999,
        image: 'https://via.placeholder.com/300x300/1a1a1a/ffffff?text=Galaxy',
        category: 'إلكترونيات',
    },
]

const bestSellers = [
    {
        id: '9',
        name: 'AirPods Pro',
        nameAr: 'سماعات ايربودز برو 2',
        price: 899,
        comparePrice: 1099,
        image: 'https://via.placeholder.com/300x300/f5f5f5/333333?text=AirPods',
        category: 'إلكترونيات',
        badge: 'hot' as const,
        rating: 4.8,
        reviewCount: 2540,
    },
    {
        id: '10',
        name: 'Dyson V15',
        nameAr: 'مكنسة دايسون V15',
        price: 2799,
        image: 'https://via.placeholder.com/300x300/6B21A8/ffffff?text=Dyson',
        category: 'المنزل',
        badge: 'hot' as const,
        rating: 4.9,
        reviewCount: 890,
    },
    {
        id: '11',
        name: 'PS5 Console',
        nameAr: 'جهاز بلايستيشن 5',
        price: 2199,
        image: 'https://via.placeholder.com/300x300/0070d1/ffffff?text=PS5',
        category: 'ألعاب',
        badge: 'hot' as const,
        rating: 4.7,
        reviewCount: 3200,
    },
    {
        id: '12',
        name: 'iPad Pro',
        nameAr: 'آيباد برو 12.9 بوصة',
        price: 4299,
        image: 'https://via.placeholder.com/300x300/1a1a1a/ffffff?text=iPad',
        category: 'إلكترونيات',
        rating: 4.9,
        reviewCount: 1850,
    },
]

// Features
const features = [
    {
        icon: Truck,
        title: 'شحن سريع',
        description: 'توصيل خلال 2-5 أيام',
    },
    {
        icon: Shield,
        title: 'ضمان الجودة',
        description: 'منتجات أصلية 100%',
    },
    {
        icon: RotateCcw,
        title: 'استرجاع سهل',
        description: 'استرجاع خلال 14 يوم',
    },
    {
        icon: Headphones,
        title: 'دعم متواصل',
        description: 'خدمة عملاء 24/7',
    },
]

// Brands
const brands = [
    { name: 'Apple', logo: 'https://via.placeholder.com/120x60/ffffff/333333?text=Apple' },
    { name: 'Samsung', logo: 'https://via.placeholder.com/120x60/ffffff/1428A0?text=Samsung' },
    { name: 'Nike', logo: 'https://via.placeholder.com/120x60/ffffff/333333?text=Nike' },
    { name: 'Adidas', logo: 'https://via.placeholder.com/120x60/ffffff/333333?text=Adidas' },
    { name: 'Sony', logo: 'https://via.placeholder.com/120x60/ffffff/333333?text=Sony' },
    { name: 'LG', logo: 'https://via.placeholder.com/120x60/ffffff/A50034?text=LG' },
]

export default function HomePage() {
    return (
        <div className="pb-8">
            {/* Hero Section */}
            <div className="container mx-auto px-4 py-6">
                <HeroSlider />
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
                <CategoryGrid />

                {/* Flash Deals */}
                <FlashDeals />

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
                <section className="py-8">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">وصل حديثاً</h2>
                        <Link href="/new" className="text-primary-500 hover:text-primary-600 font-medium">
                            عرض الكل ←
                        </Link>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                        {newArrivals.map((product) => (
                            <ProductCard key={product.id} {...product} />
                        ))}
                    </div>
                </section>

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
                <section className="py-8">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">🔥 الأكثر مبيعاً</h2>
                        <Link href="/best-sellers" className="text-primary-500 hover:text-primary-600 font-medium">
                            عرض الكل ←
                        </Link>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                        {bestSellers.map((product) => (
                            <ProductCard key={product.id} {...product} />
                        ))}
                    </div>
                </section>
            </div>
        </div>
    )
}

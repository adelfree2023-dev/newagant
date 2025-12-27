'use client'

import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, Grid, List, SlidersHorizontal, Loader2 } from 'lucide-react'
import ProductCard from '@/components/product/ProductCard'
import FilterSidebar from '@/components/product/FilterSidebar'
import { useLanguage } from '@/context/LanguageContext'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://35.226.47.16:8000'

interface Product {
    id: string
    name: string
    name_ar: string
    price: number
    compare_price?: number
    images: string[]
    category: string
    badge?: 'sale' | 'new' | 'hot'
    rating?: number
    reviews_count?: number
    attributes?: Record<string, string> // Added for filtering
}

interface Category {
    id: string
    name: string
    name_ar: string
    slug: string
    icon: string
    products: Product[]
}

export default function CategoryPage() {
    const params = useParams()
    const searchParams = useSearchParams()
    const { t, locale } = useLanguage();

    const [category, setCategory] = useState<Category | null>(null)
    const [aggregations, setAggregations] = useState<any[]>([])

    const [loading, setLoading] = useState(true)
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
    const [sortBy, setSortBy] = useState('default')
    const [showFilters, setShowFilters] = useState(false)

    useEffect(() => {
        async function fetchCategory() {
            setLoading(true);
            try {
                const res = await fetch(`${API_URL}/api/categories/${params.slug}`)
                const json = await res.json()
                if (json.success) {
                    setCategory(json.category)
                    setAggregations(json.aggregations || [])
                }
            } catch (err) {
                console.error('Error:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchCategory()
    }, [params.slug])

    // --- Filtering Logic ---
    const filterProducts = (products: Product[]) => {
        let filtered = [...products];

        // 1. Price
        const minPrice = searchParams.get('min_price')
        const maxPrice = searchParams.get('max_price')
        if (minPrice) filtered = filtered.filter(p => p.price >= Number(minPrice))
        if (maxPrice) filtered = filtered.filter(p => p.price <= Number(maxPrice))

        // 2. Rating
        const minRating = searchParams.get('rating')
        if (minRating) filtered = filtered.filter(p => (p.rating || 0) >= Number(minRating))

        // 3. Dynamic Attributes
        // Iterate through all active search params
        // If the param matches a known attribute code, filter by it
        // Note: This requires products to have 'attributes' field loaded.
        // For now, this is a placeholder unless we create a 'Client Side' matching logic
        // or fully rely on server (which we aren't doing here to keep it fast/optimistic).

        // Example: Only rudimentary support if product has 'attributes' map
        /*
        searchParams.forEach((value, key) => {
            if (['min_price', 'max_price', 'rating'].includes(key)) return;
            // It's a dynamic attribute
            filtered = filtered.filter(p => p.attributes?.[key] === value);
        });
        */

        return filtered;
    }

    const sortProducts = (products: Product[]) => {
        switch (sortBy) {
            case 'price-low':
                return [...products].sort((a, b) => a.price - b.price)
            case 'price-high':
                return [...products].sort((a, b) => b.price - a.price)
            case 'name':
                return [...products].sort((a, b) => (locale === 'ar' ? a.name_ar : a.name).localeCompare(locale === 'ar' ? b.name_ar : b.name))
            default:
                return products
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-12 h-12 animate-spin text-primary-500" />
            </div>
        )
    }

    if (!category) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">{t('category_not_found') || 'القسم غير موجود'}</h1>
                    <Link href="/" className="px-6 py-2 bg-primary-600 text-white rounded-lg">{t('home')}</Link>
                </div>
            </div>
        )
    }

    const filteredProducts = filterProducts(category.products || [])
    const sortedProducts = sortProducts(filteredProducts)

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                <Link href="/" className="hover:text-primary-500">{t('home')}</Link>
                <ChevronRight className={`w-4 h-4 ${locale === 'en' ? 'rotate-180' : ''}`} />
                <span className="text-gray-900">{locale === 'ar' ? category.name_ar : category.name}</span>
            </nav>

            {/* Header */}
            <div className="bg-gradient-to-l from-primary-500 to-primary-600 rounded-2xl p-8 mb-8 text-white">
                <div className="flex items-center gap-4">
                    <span className="text-6xl">{category.icon}</span>
                    <div>
                        <h1 className="text-4xl font-bold mb-2">{locale === 'ar' ? category.name_ar : category.name}</h1>
                        <p className="opacity-80">{sortedProducts.length} {t('products') || 'منتج'}</p>
                    </div>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar (Desktop) */}
                <aside className="hidden lg:block w-1/4 min-w-[280px]">
                    <FilterSidebar aggregations={aggregations} />
                </aside>

                {/* Main Content */}
                <div className="flex-1">
                    {/* Filters Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-6 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="lg:hidden flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
                            >
                                <SlidersHorizontal className="w-5 h-5" />
                                <span>{t('filter_by')}</span>
                            </button>
                            <span className="text-gray-500 text-sm hidden sm:block">{sortedProducts.length} {t('products')}</span>
                        </div>

                        <div className="flex items-center gap-4 ml-auto">
                            {/* Sort */}
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm bg-gray-50"
                            >
                                <option value="default">{t('sort_default') || 'الترتيب الافتراضي'}</option>
                                <option value="price-low">{t('price_low') || 'السعر: من الأقل للأعلى'}</option>
                                <option value="price-high">{t('price_high') || 'السعر: من الأعلى للأقل'}</option>
                            </select>

                            {/* View Mode */}
                            <div className="flex border rounded-lg overflow-hidden">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2 ${viewMode === 'grid' ? 'bg-primary-500 text-white' : 'hover:bg-gray-50'}`}
                                >
                                    <Grid className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-2 ${viewMode === 'list' ? 'bg-primary-500 text-white' : 'hover:bg-gray-50'}`}
                                >
                                    <List className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Filters (Collapsible) */}
                    {showFilters && (
                        <div className="lg:hidden mb-6">
                            <FilterSidebar aggregations={aggregations} />
                        </div>
                    )}

                    {/* Products Grid */}
                    {sortedProducts.length > 0 ? (
                        <div className={`grid gap-6 ${viewMode === 'grid'
                            ? 'grid-cols-2 md:grid-cols-3'
                            : 'grid-cols-1'
                            }`}>
                            {sortedProducts.map((product) => (
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
                    ) : (
                        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
                            <p className="text-gray-500 text-lg mb-4">{t('no_products_found') || 'لا توجد منتجات تطابق الفلاتر الحالية'}</p>
                            <Link href="/" className="text-primary-600 font-bold hover:underline">{t('clear_filters') || 'مسح الفلاتر'}</Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

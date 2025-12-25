'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, Grid, List, SlidersHorizontal, Loader2 } from 'lucide-react'
import ProductCard from '@/components/product/ProductCard'

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
    const [category, setCategory] = useState<Category | null>(null)
    const [loading, setLoading] = useState(true)
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
    const [sortBy, setSortBy] = useState('default')

    useEffect(() => {
        async function fetchCategory() {
            try {
                const res = await fetch(`${API_URL}/api/categories/${params.slug}`)
                const json = await res.json()
                if (json.success) {
                    setCategory(json.data)
                }
            } catch (err) {
                console.error('Error:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchCategory()
    }, [params.slug])

    const sortProducts = (products: Product[]) => {
        switch (sortBy) {
            case 'price-low':
                return [...products].sort((a, b) => a.price - b.price)
            case 'price-high':
                return [...products].sort((a, b) => b.price - a.price)
            case 'name':
                return [...products].sort((a, b) => a.name_ar.localeCompare(b.name_ar))
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
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">القسم غير موجود</h1>
                    <Link href="/" className="btn-primary">العودة للرئيسية</Link>
                </div>
            </div>
        )
    }

    const sortedProducts = sortProducts(category.products || [])

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                <Link href="/" className="hover:text-primary-500">الرئيسية</Link>
                <ChevronRight className="w-4 h-4" />
                <span className="text-gray-900">{category.name_ar}</span>
            </nav>

            {/* Header */}
            <div className="bg-gradient-to-l from-primary-500 to-primary-600 rounded-2xl p-8 mb-8 text-white">
                <div className="flex items-center gap-4">
                    <span className="text-6xl">{category.icon}</span>
                    <div>
                        <h1 className="text-4xl font-bold mb-2">{category.name_ar}</h1>
                        <p className="opacity-80">{sortedProducts.length} منتج</p>
                    </div>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6 p-4 bg-white rounded-xl shadow-sm">
                <div className="flex items-center gap-4">
                    <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50">
                        <SlidersHorizontal className="w-5 h-5" />
                        <span>الفلاتر</span>
                    </button>
                    <span className="text-gray-500">{sortedProducts.length} منتج</span>
                </div>

                <div className="flex items-center gap-4">
                    {/* Sort */}
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                    >
                        <option value="default">الترتيب الافتراضي</option>
                        <option value="price-low">السعر: من الأقل للأعلى</option>
                        <option value="price-high">السعر: من الأعلى للأقل</option>
                        <option value="name">الاسم</option>
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

            {/* Products */}
            {sortedProducts.length > 0 ? (
                <div className={`grid gap-6 ${viewMode === 'grid'
                        ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
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
                <div className="text-center py-16">
                    <p className="text-gray-500 text-lg">لا توجد منتجات في هذا القسم</p>
                    <Link href="/" className="btn-primary mt-4 inline-block">تصفح المنتجات</Link>
                </div>
            )}
        </div>
    )
}

'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Search, Loader2 } from 'lucide-react'
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

export default function SearchPage() {
    const searchParams = useSearchParams()
    const query = searchParams.get('q') || ''
    const [results, setResults] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [searchInput, setSearchInput] = useState(query)

    useEffect(() => {
        async function search() {
            if (!query) {
                setResults([])
                setLoading(false)
                return
            }

            setLoading(true)
            try {
                const res = await fetch(`${API_URL}/api/search?q=${encodeURIComponent(query)}`)
                const json = await res.json()
                if (json.success) {
                    setResults(json.data)
                }
            } catch (err) {
                console.error('Error:', err)
            } finally {
                setLoading(false)
            }
        }
        search()
    }, [query])

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (searchInput.trim()) {
            window.location.href = `/search?q=${encodeURIComponent(searchInput)}`
        }
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Search Box */}
            <div className="max-w-2xl mx-auto mb-8">
                <form onSubmit={handleSearch} className="relative">
                    <input
                        type="text"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        placeholder="ابحث عن منتجات..."
                        className="w-full py-4 px-6 pr-14 text-lg rounded-xl border-2 border-gray-200 
                     focus:border-primary-500 focus:ring-0 outline-none"
                    />
                    <button
                        type="submit"
                        className="absolute left-2 top-1/2 -translate-y-1/2 p-3 bg-primary-500 
                     rounded-lg text-white hover:bg-primary-600 transition"
                    >
                        <Search className="w-5 h-5" />
                    </button>
                </form>
            </div>

            {/* Results */}
            {loading ? (
                <div className="flex justify-center py-16">
                    <Loader2 className="w-12 h-12 animate-spin text-primary-500" />
                </div>
            ) : query ? (
                <>
                    <h1 className="text-2xl font-bold text-gray-900 mb-6">
                        نتائج البحث عن "{query}" ({results.length} نتيجة)
                    </h1>

                    {results.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {results.map((product) => (
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
                            <p className="text-gray-500 text-lg mb-4">لم يتم العثور على نتائج</p>
                            <Link href="/" className="btn-primary">تصفح المنتجات</Link>
                        </div>
                    )}
                </>
            ) : (
                <div className="text-center py-16">
                    <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">ابحث عن المنتجات التي تريدها</p>
                </div>
            )}
        </div>
    )
}

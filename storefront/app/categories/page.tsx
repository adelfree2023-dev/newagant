'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://35.226.47.16:8000'

interface Category {
    id: string
    name: string
    name_ar: string
    slug: string
    icon: string
    products_count?: number
}

const colorClasses = [
    'from-blue-500 to-blue-600',
    'from-pink-500 to-pink-600',
    'from-green-500 to-green-600',
    'from-purple-500 to-purple-600',
    'from-orange-500 to-orange-600',
    'from-red-500 to-red-600',
    'from-teal-500 to-teal-600',
    'from-indigo-500 to-indigo-600',
]

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchCategories() {
            try {
                const res = await fetch(`${API_URL}/api/categories`)
                const json = await res.json()
                if (json.success) {
                    setCategories(json.data)
                }
            } catch (err) {
                console.error('Error:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchCategories()
    }, [])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-12 h-12 animate-spin text-primary-500" />
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">جميع الأقسام</h1>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {categories.map((cat, index) => (
                    <Link
                        key={cat.id}
                        href={`/category/${cat.slug}`}
                        className={`bg-gradient-to-br ${colorClasses[index % colorClasses.length]} 
                       rounded-2xl p-6 text-center text-white 
                       hover:shadow-xl hover:-translate-y-2 transition-all duration-300`}
                    >
                        <span className="text-6xl block mb-4">{cat.icon}</span>
                        <h2 className="text-xl font-bold mb-2">{cat.name_ar}</h2>
                        {cat.products_count !== undefined && (
                            <p className="text-sm opacity-80">{cat.products_count} منتج</p>
                        )}
                    </Link>
                ))}
            </div>
        </div>
    )
}

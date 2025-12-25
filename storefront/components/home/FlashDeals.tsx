'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import ProductCard from '../product/ProductCard'
import { Clock } from 'lucide-react'

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

interface FlashDealsProps {
    products?: Product[]
    endsAt?: string
}

export default function FlashDeals({ products, endsAt }: FlashDealsProps) {
    const [timeLeft, setTimeLeft] = useState({
        hours: 5,
        minutes: 30,
        seconds: 0
    })

    useEffect(() => {
        const calculateTimeLeft = () => {
            if (endsAt) {
                const end = new Date(endsAt).getTime()
                const now = Date.now()
                const diff = end - now

                if (diff > 0) {
                    const hours = Math.floor(diff / (1000 * 60 * 60))
                    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
                    const seconds = Math.floor((diff % (1000 * 60)) / 1000)
                    setTimeLeft({ hours, minutes, seconds })
                }
            }
        }

        calculateTimeLeft()
        const timer = setInterval(calculateTimeLeft, 1000)
        return () => clearInterval(timer)
    }, [endsAt])

    useEffect(() => {
        if (!endsAt) {
            const timer = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev.seconds > 0) {
                        return { ...prev, seconds: prev.seconds - 1 }
                    } else if (prev.minutes > 0) {
                        return { ...prev, minutes: prev.minutes - 1, seconds: 59 }
                    } else if (prev.hours > 0) {
                        return { hours: prev.hours - 1, minutes: 59, seconds: 59 }
                    }
                    return prev
                })
            }, 1000)
            return () => clearInterval(timer)
        }
    }, [endsAt])

    if (!products || products.length === 0) {
        return null
    }

    return (
        <section className="py-8">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        ⚡ عروض فلاش
                    </h2>

                    {/* Countdown */}
                    <div className="flex items-center gap-2 bg-dark-200 text-white px-4 py-2 rounded-lg">
                        <Clock className="w-5 h-5 text-secondary-400" />
                        <span className="text-sm">ينتهي خلال</span>
                        <div className="flex gap-1 font-mono">
                            <span className="bg-primary-500 px-2 py-1 rounded">
                                {String(timeLeft.hours).padStart(2, '0')}
                            </span>
                            <span>:</span>
                            <span className="bg-primary-500 px-2 py-1 rounded">
                                {String(timeLeft.minutes).padStart(2, '0')}
                            </span>
                            <span>:</span>
                            <span className="bg-primary-500 px-2 py-1 rounded">
                                {String(timeLeft.seconds).padStart(2, '0')}
                            </span>
                        </div>
                    </div>
                </div>

                <Link
                    href="/deals"
                    className="text-primary-500 hover:text-primary-600 font-medium"
                >
                    عرض الكل ←
                </Link>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {products.map((product) => (
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
    )
}

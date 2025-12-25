'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import ProductCard from '../product/ProductCard'
import { Clock } from 'lucide-react'

// Mock products for flash deals
const flashDealProducts = [
    {
        id: '1',
        name: 'iPhone 15 Pro Max',
        nameAr: 'آيفون 15 برو ماكس',
        price: 4499,
        comparePrice: 5999,
        image: 'https://via.placeholder.com/300x300/1a1a1a/ffffff?text=iPhone+15',
        category: 'إلكترونيات',
        badge: 'sale' as const,
    },
    {
        id: '2',
        name: 'Samsung TV',
        nameAr: 'تلفزيون سامسونج 65 بوصة',
        price: 2999,
        comparePrice: 4499,
        image: 'https://via.placeholder.com/300x300/0a0a0a/ffffff?text=TV',
        category: 'إلكترونيات',
        badge: 'sale' as const,
    },
    {
        id: '3',
        name: 'Nike Air Max',
        nameAr: 'حذاء نايك اير ماكس',
        price: 499,
        comparePrice: 799,
        image: 'https://via.placeholder.com/300x300/ff5722/ffffff?text=Nike',
        category: 'رياضة',
        badge: 'sale' as const,
    },
    {
        id: '4',
        name: 'Apple Watch',
        nameAr: 'ساعة أبل ووتش سيريس 9',
        price: 1599,
        comparePrice: 1999,
        image: 'https://via.placeholder.com/300x300/2196F3/ffffff?text=Watch',
        category: 'إلكترونيات',
        badge: 'sale' as const,
    },
]

export default function FlashDeals() {
    const [timeLeft, setTimeLeft] = useState({
        hours: 5,
        minutes: 30,
        seconds: 0
    })

    useEffect(() => {
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
    }, [])

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
                {flashDealProducts.map((product) => (
                    <ProductCard key={product.id} {...product} />
                ))}
            </div>
        </section>
    )
}

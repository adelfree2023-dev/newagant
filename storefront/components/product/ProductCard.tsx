import Link from 'next/link'
import { Heart, ShoppingCart, Eye } from 'lucide-react'

interface ProductCardProps {
    id: string
    name: string
    nameAr: string
    price: number
    comparePrice?: number
    image: string
    category: string
    badge?: 'sale' | 'new' | 'hot'
    rating?: number
    reviewCount?: number
}

export default function ProductCard({
    id,
    name,
    nameAr,
    price,
    comparePrice,
    image,
    category,
    badge,
    rating = 4.5,
    reviewCount = 120
}: ProductCardProps) {
    const discount = comparePrice ? Math.round(((comparePrice - price) / comparePrice) * 100) : 0

    return (
        <div className="product-card group bg-white rounded-xl shadow-md overflow-hidden 
                    hover:shadow-xl transition-all duration-300">
            {/* Image Container */}
            <div className="relative aspect-square overflow-hidden bg-gray-100">
                <img
                    src={image}
                    alt={nameAr}
                    className="product-image w-full h-full object-cover transition-transform duration-300"
                />

                {/* Badge */}
                {badge && (
                    <span className={`absolute top-3 right-3 badge ${badge === 'sale' ? 'badge-sale' :
                            badge === 'new' ? 'badge-new' : 'badge-hot'
                        }`}>
                        {badge === 'sale' ? `${discount}% خصم` :
                            badge === 'new' ? 'جديد' : '🔥 رائج'}
                    </span>
                )}

                {/* Quick Actions */}
                <div className="quick-actions absolute bottom-3 left-3 right-3 
                       flex justify-center gap-2">
                    <button className="w-10 h-10 bg-white rounded-full shadow-lg 
                           flex items-center justify-center hover:bg-primary-500 
                           hover:text-white transition-all duration-200"
                        title="أضف للسلة">
                        <ShoppingCart className="w-5 h-5" />
                    </button>
                    <button className="w-10 h-10 bg-white rounded-full shadow-lg 
                           flex items-center justify-center hover:bg-primary-500 
                           hover:text-white transition-all duration-200"
                        title="أضف للمفضلة">
                        <Heart className="w-5 h-5" />
                    </button>
                    <Link
                        href={`/product/${id}`}
                        className="w-10 h-10 bg-white rounded-full shadow-lg 
                      flex items-center justify-center hover:bg-primary-500 
                      hover:text-white transition-all duration-200"
                        title="عرض سريع"
                    >
                        <Eye className="w-5 h-5" />
                    </Link>
                </div>
            </div>

            {/* Content */}
            <div className="p-4">
                {/* Category */}
                <p className="text-xs text-gray-500 mb-1">{category}</p>

                {/* Name */}
                <Link href={`/product/${id}`}>
                    <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 
                        hover:text-primary-500 transition">
                        {nameAr}
                    </h3>
                </Link>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-2">
                    <div className="flex text-yellow-400">
                        {'★'.repeat(Math.floor(rating))}
                        {'☆'.repeat(5 - Math.floor(rating))}
                    </div>
                    <span className="text-xs text-gray-500">({reviewCount})</span>
                </div>

                {/* Price */}
                <div className="flex items-center justify-between">
                    <div>
                        <span className="text-lg font-bold text-primary-500">
                            {price.toFixed(2)} ر.س
                        </span>
                        {comparePrice && (
                            <span className="text-sm text-gray-400 line-through mr-2">
                                {comparePrice.toFixed(2)}
                            </span>
                        )}
                    </div>
                    <button className="btn-primary !py-2 !px-3 text-sm">
                        أضف للسلة
                    </button>
                </div>
            </div>
        </div>
    )
}

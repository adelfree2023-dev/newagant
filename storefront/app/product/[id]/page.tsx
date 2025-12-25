'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
    ChevronRight,
    Heart,
    Share2,
    ShoppingCart,
    Minus,
    Plus,
    Truck,
    Shield,
    RotateCcw,
    Star,
    Loader2
} from 'lucide-react'
import ProductCard from '@/components/product/ProductCard'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://35.226.47.16:8000'

interface Product {
    id: string
    name: string
    name_ar: string
    slug: string
    price: number
    compare_price?: number
    description?: string
    description_ar?: string
    images: string[]
    category: string
    category_id: string
    badge?: 'sale' | 'new' | 'hot'
    stock: number
    rating?: number
    reviews_count?: number
}

export default function ProductPage() {
    const params = useParams()
    const [product, setProduct] = useState<Product | null>(null)
    const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [quantity, setQuantity] = useState(1)
    const [selectedImage, setSelectedImage] = useState(0)
    const [addedToCart, setAddedToCart] = useState(false)

    useEffect(() => {
        async function fetchProduct() {
            try {
                const res = await fetch(`${API_URL}/api/products/${params.id}`)
                const json = await res.json()
                if (json.success) {
                    setProduct(json.data)

                    // Fetch related products
                    const relatedRes = await fetch(`${API_URL}/api/products?limit=4`)
                    const relatedJson = await relatedRes.json()
                    if (relatedJson.success) {
                        setRelatedProducts(relatedJson.data.filter((p: Product) => p.id !== json.data.id).slice(0, 4))
                    }
                }
            } catch (err) {
                console.error('Error:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchProduct()
    }, [params.id])

    const handleAddToCart = () => {
        setAddedToCart(true)
        setTimeout(() => setAddedToCart(false), 2000)
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-12 h-12 animate-spin text-primary-500" />
            </div>
        )
    }

    if (!product) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">المنتج غير موجود</h1>
                    <Link href="/" className="btn-primary">العودة للرئيسية</Link>
                </div>
            </div>
        )
    }

    const discount = product.compare_price
        ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
        : 0

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                <Link href="/" className="hover:text-primary-500">الرئيسية</Link>
                <ChevronRight className="w-4 h-4" />
                <Link href={`/category/${product.category_id}`} className="hover:text-primary-500">
                    {product.category}
                </Link>
                <ChevronRight className="w-4 h-4" />
                <span className="text-gray-900">{product.name_ar}</span>
            </nav>

            {/* Product Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                {/* Images */}
                <div>
                    <div className="bg-white rounded-2xl p-4 mb-4">
                        <img
                            src={product.images[selectedImage] || 'https://via.placeholder.com/500'}
                            alt={product.name_ar}
                            className="w-full h-96 object-contain"
                        />
                    </div>
                    {product.images.length > 1 && (
                        <div className="flex gap-2">
                            {product.images.map((img, index) => (
                                <button
                                    key={index}
                                    onClick={() => setSelectedImage(index)}
                                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 ${selectedImage === index ? 'border-primary-500' : 'border-gray-200'
                                        }`}
                                >
                                    <img src={img} alt="" className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Info */}
                <div>
                    {/* Badge */}
                    {product.badge && (
                        <span className={`inline-block px-3 py-1 text-sm font-bold rounded-full text-white mb-4 ${product.badge === 'sale' ? 'bg-red-500' :
                                product.badge === 'new' ? 'bg-green-500' : 'bg-orange-500'
                            }`}>
                            {product.badge === 'sale' ? `خصم ${discount}%` :
                                product.badge === 'new' ? 'جديد' : '🔥 رائج'}
                        </span>
                    )}

                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name_ar}</h1>
                    <p className="text-gray-500 mb-4">{product.name}</p>

                    {/* Rating */}
                    <div className="flex items-center gap-2 mb-4">
                        <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                    key={star}
                                    className={`w-5 h-5 ${star <= (product.rating || 4.5)
                                            ? 'fill-yellow-400 text-yellow-400'
                                            : 'text-gray-300'
                                        }`}
                                />
                            ))}
                        </div>
                        <span className="text-gray-500">({product.reviews_count || 0} تقييم)</span>
                    </div>

                    {/* Price */}
                    <div className="flex items-center gap-4 mb-6">
                        <span className="text-4xl font-bold text-primary-500">{product.price.toFixed(2)} ر.س</span>
                        {product.compare_price && (
                            <span className="text-xl text-gray-400 line-through">{product.compare_price.toFixed(2)} ر.س</span>
                        )}
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 mb-6 leading-relaxed">
                        {product.description_ar || product.description || 'لا يوجد وصف متاح'}
                    </p>

                    {/* Stock */}
                    <div className="flex items-center gap-2 mb-6">
                        <span className={`w-3 h-3 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span className={product.stock > 0 ? 'text-green-600' : 'text-red-600'}>
                            {product.stock > 0 ? `متوفر (${product.stock} قطعة)` : 'غير متوفر'}
                        </span>
                    </div>

                    {/* Quantity */}
                    <div className="flex items-center gap-4 mb-6">
                        <span className="font-medium">الكمية:</span>
                        <div className="flex items-center border rounded-lg">
                            <button
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                className="p-3 hover:bg-gray-100"
                            >
                                <Minus className="w-4 h-4" />
                            </button>
                            <span className="px-4 font-bold">{quantity}</span>
                            <button
                                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                                className="p-3 hover:bg-gray-100"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-4 mb-8">
                        <button
                            onClick={handleAddToCart}
                            disabled={product.stock === 0}
                            className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-lg transition ${addedToCart
                                    ? 'bg-green-500 text-white'
                                    : 'bg-primary-500 text-white hover:bg-primary-600'
                                } disabled:bg-gray-300 disabled:cursor-not-allowed`}
                        >
                            <ShoppingCart className="w-6 h-6" />
                            {addedToCart ? 'تمت الإضافة ✓' : 'أضف للسلة'}
                        </button>
                        <button className="p-4 border rounded-xl hover:bg-gray-50">
                            <Heart className="w-6 h-6 text-gray-400" />
                        </button>
                        <button className="p-4 border rounded-xl hover:bg-gray-50">
                            <Share2 className="w-6 h-6 text-gray-400" />
                        </button>
                    </div>

                    {/* Features */}
                    <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-xl">
                        <div className="text-center">
                            <Truck className="w-8 h-8 mx-auto mb-2 text-primary-500" />
                            <span className="text-sm text-gray-600">شحن سريع</span>
                        </div>
                        <div className="text-center">
                            <Shield className="w-8 h-8 mx-auto mb-2 text-primary-500" />
                            <span className="text-sm text-gray-600">ضمان الجودة</span>
                        </div>
                        <div className="text-center">
                            <RotateCcw className="w-8 h-8 mx-auto mb-2 text-primary-500" />
                            <span className="text-sm text-gray-600">استرجاع سهل</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Related Products */}
            {relatedProducts.length > 0 && (
                <section>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">منتجات ذات صلة</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                        {relatedProducts.map((p) => (
                            <ProductCard
                                key={p.id}
                                id={p.id}
                                name={p.name}
                                nameAr={p.name_ar}
                                price={p.price}
                                comparePrice={p.compare_price}
                                image={p.images?.[0] || ''}
                                category={p.category}
                                badge={p.badge}
                            />
                        ))}
                    </div>
                </section>
            )}
        </div>
    )
}

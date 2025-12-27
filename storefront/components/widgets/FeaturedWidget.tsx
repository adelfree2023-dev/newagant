'use client';

/**
 * FeaturedWidget - Featured Products Grid/Carousel
 */

import { FeaturedWidget as FeaturedWidgetType } from '@/types/widget';
import { useState, useEffect } from 'react';
import { ShoppingCart, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { storeApi } from '@/lib/api';
import clsx from 'clsx';

interface Props {
    widget: FeaturedWidgetType;
}

interface Product {
    id: string;
    name: string;
    name_en?: string;
    price: number;
    compare_price?: number;
    image: string;
    rating?: number;
    slug: string;
}

export default function FeaturedWidget({ widget }: Props) {
    const { settings, title } = widget;
    const { limit, display, columns, show_price, show_rating, show_add_to_cart } = settings;
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [scrollPosition, setScrollPosition] = useState(0);
    const { addToCart } = useCart();

    useEffect(() => {
        async function fetchProducts() {
            try {
                // Fetch from API or use product_ids if specified
                const response = await storeApi.products.list({ limit: limit || 8 });
                if (response?.data) {
                    setProducts(response.data);
                }
            } catch (error) {
                console.error('Failed to fetch featured products:', error);
                // Use mock data for demo
                setProducts([
                    { id: '1', name: 'منتج مميز 1', price: 199, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400', rating: 4.5, slug: 'product-1' },
                    { id: '2', name: 'منتج مميز 2', price: 299, compare_price: 399, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400', rating: 5, slug: 'product-2' },
                    { id: '3', name: 'منتج مميز 3', price: 149, image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400', rating: 4, slug: 'product-3' },
                    { id: '4', name: 'منتج مميز 4', price: 399, image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400', rating: 4.8, slug: 'product-4' },
                ]);
            } finally {
                setLoading(false);
            }
        }
        fetchProducts();
    }, [limit, settings.product_ids, settings.category_id]);

    const columnClasses: Record<number, string> = {
        2: 'grid-cols-2',
        3: 'grid-cols-2 md:grid-cols-3',
        4: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
        5: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5',
    };

    const handleAddToCart = (product: Product) => {
        addToCart(product.id, 1);
    };

    if (loading) {
        return (
            <section className="py-12 bg-white">
                <div className="container mx-auto px-4">
                    <div className="animate-pulse">
                        <div className="h-8 w-48 bg-gray-200 rounded mb-8"></div>
                        <div className={`grid ${columnClasses[columns] || columnClasses[4]} gap-6`}>
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="bg-gray-100 rounded-xl h-72"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-12 bg-white">
            <div className="container mx-auto px-4">
                {/* Section Title */}
                {title && (
                    <h2 className="text-2xl md:text-3xl font-bold mb-8 text-gray-900">
                        {title}
                    </h2>
                )}

                {/* Products Grid/Carousel */}
                {display === 'carousel' ? (
                    <div className="relative">
                        <div className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth" style={{ scrollSnapType: 'x mandatory' }}>
                            {products.map((product) => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    showPrice={show_price}
                                    showRating={show_rating}
                                    showAddToCart={show_add_to_cart}
                                    onAddToCart={() => handleAddToCart(product)}
                                    isCarousel
                                />
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className={`grid ${columnClasses[columns] || columnClasses[4]} gap-6`}>
                        {products.map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                showPrice={show_price}
                                showRating={show_rating}
                                showAddToCart={show_add_to_cart}
                                onAddToCart={() => handleAddToCart(product)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}

// Product Card Component
function ProductCard({
    product,
    showPrice,
    showRating,
    showAddToCart,
    onAddToCart,
    isCarousel = false
}: {
    product: Product;
    showPrice: boolean;
    showRating: boolean;
    showAddToCart: boolean;
    onAddToCart: () => void;
    isCarousel?: boolean;
}) {
    const discount = product.compare_price
        ? Math.round((1 - product.price / product.compare_price) * 100)
        : 0;

    return (
        <div
            className={clsx(
                'group bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300',
                isCarousel && 'flex-shrink-0 w-64 scroll-snap-align-start'
            )}
        >
            {/* Image */}
            <Link href={`/product/${product.slug}`} className="block relative aspect-square overflow-hidden">
                <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                {discount > 0 && (
                    <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                        -{discount}%
                    </span>
                )}
            </Link>

            {/* Content */}
            <div className="p-4">
                <Link href={`/product/${product.slug}`}>
                    <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 hover:text-primary-600 transition-colors">
                        {product.name}
                    </h3>
                </Link>

                {/* Rating */}
                {showRating && product.rating && (
                    <div className="flex items-center gap-1 mb-2">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm text-gray-600">{product.rating}</span>
                    </div>
                )}

                {/* Price */}
                {showPrice && (
                    <div className="flex items-center gap-2 mb-3">
                        <span className="text-lg font-black text-primary-600">{product.price} ريال</span>
                        {product.compare_price && (
                            <span className="text-sm text-gray-400 line-through">{product.compare_price} ريال</span>
                        )}
                    </div>
                )}

                {/* Add to Cart */}
                {showAddToCart && (
                    <button
                        onClick={(e) => { e.preventDefault(); onAddToCart(); }}
                        className="w-full py-2 bg-primary-600 text-white rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-primary-700 transition-colors"
                    >
                        <ShoppingCart className="w-4 h-4" />
                        أضف للسلة
                    </button>
                )}
            </div>
        </div>
    );
}

'use client';

/**
 * CategoriesWidget - Category Showcase
 */

import { CategoriesWidget as CategoriesWidgetType } from '@/types/widget';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { storeApi } from '@/lib/api';
import clsx from 'clsx';

interface Props {
    widget: CategoriesWidgetType;
}

interface Category {
    id: string;
    name: string;
    name_en?: string;
    slug: string;
    image?: string;
    product_count?: number;
}

export default function CategoriesWidget({ widget }: Props) {
    const { settings, title } = widget;
    const { display, show_count, columns, style } = settings;
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchCategories() {
            try {
                const response = await storeApi.categories?.list?.();
                if (response?.data) {
                    setCategories(response.data);
                }
            } catch (error) {
                console.error('Failed to fetch categories:', error);
                // Mock data
                setCategories([
                    { id: '1', name: 'إلكترونيات', slug: 'electronics', image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=300', product_count: 156 },
                    { id: '2', name: 'أزياء', slug: 'fashion', image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=300', product_count: 234 },
                    { id: '3', name: 'منزل وحديقة', slug: 'home', image: 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=300', product_count: 89 },
                    { id: '4', name: 'رياضة', slug: 'sports', image: 'https://images.unsplash.com/photo-1461896836934- voices?w=300', product_count: 67 },
                    { id: '5', name: 'جمال', slug: 'beauty', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=300', product_count: 145 },
                    { id: '6', name: 'أطفال', slug: 'kids', image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=300', product_count: 98 },
                ]);
            } finally {
                setLoading(false);
            }
        }
        fetchCategories();
    }, [settings.category_ids]);

    const columnClasses: Record<number, string> = {
        3: 'grid-cols-2 md:grid-cols-3',
        4: 'grid-cols-2 md:grid-cols-4',
        6: 'grid-cols-3 md:grid-cols-6',
    };

    if (loading) {
        return (
            <section className="py-12 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="h-8 w-48 bg-gray-200 rounded mb-8 animate-pulse"></div>
                    <div className={`grid ${columnClasses[columns] || columnClasses[6]} gap-4`}>
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="aspect-square bg-gray-200 rounded-xl animate-pulse"></div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-12 bg-gray-50">
            <div className="container mx-auto px-4">
                {title && (
                    <h2 className="text-2xl md:text-3xl font-bold mb-8 text-gray-900">
                        {title}
                    </h2>
                )}

                {display === 'carousel' ? (
                    <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4">
                        {categories.map((category) => (
                            <CategoryCard
                                key={category.id}
                                category={category}
                                style={style}
                                showCount={show_count}
                                isCarousel
                            />
                        ))}
                    </div>
                ) : (
                    <div className={`grid ${columnClasses[columns] || columnClasses[6]} gap-4`}>
                        {categories.map((category) => (
                            <CategoryCard
                                key={category.id}
                                category={category}
                                style={style}
                                showCount={show_count}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}

function CategoryCard({
    category,
    style,
    showCount,
    isCarousel = false
}: {
    category: Category;
    style: string;
    showCount: boolean;
    isCarousel?: boolean;
}) {
    if (style === 'overlay') {
        return (
            <Link
                href={`/category/${category.slug}`}
                className={clsx(
                    'relative aspect-square overflow-hidden rounded-xl group',
                    isCarousel && 'flex-shrink-0 w-40'
                )}
            >
                <img
                    src={category.image || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300'}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <h3 className="font-bold text-lg">{category.name}</h3>
                    {showCount && category.product_count && (
                        <p className="text-sm opacity-80">{category.product_count} منتج</p>
                    )}
                </div>
            </Link>
        );
    }

    if (style === 'minimal') {
        return (
            <Link
                href={`/category/${category.slug}`}
                className={clsx(
                    'text-center group',
                    isCarousel && 'flex-shrink-0 w-32'
                )}
            >
                <div className="w-20 h-20 mx-auto rounded-full overflow-hidden mb-3 ring-4 ring-transparent group-hover:ring-primary-200 transition-all">
                    <img
                        src={category.image || 'https://via.placeholder.com/80'}
                        alt={category.name}
                        className="w-full h-full object-cover"
                    />
                </div>
                <h3 className="font-medium text-gray-900 group-hover:text-primary-600 transition-colors">
                    {category.name}
                </h3>
            </Link>
        );
    }

    // Default: Cards
    return (
        <Link
            href={`/category/${category.slug}`}
            className={clsx(
                'bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow group',
                isCarousel && 'flex-shrink-0 w-48'
            )}
        >
            <div className="aspect-video overflow-hidden">
                <img
                    src={category.image || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300'}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
            </div>
            <div className="p-4">
                <h3 className="font-bold text-gray-900">{category.name}</h3>
                {showCount && category.product_count && (
                    <p className="text-sm text-gray-500">{category.product_count} منتج</p>
                )}
            </div>
        </Link>
    );
}

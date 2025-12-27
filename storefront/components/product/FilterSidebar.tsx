'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Star, Check } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function FilterSidebar() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { t } = useLanguage();

    // State from URL or defaults
    const [minPrice, setMinPrice] = useState(searchParams.get('min_price') || '');
    const [maxPrice, setMaxPrice] = useState(searchParams.get('max_price') || '');

    const applyFilters = () => {
        const params = new URLSearchParams(searchParams.toString());

        if (minPrice) params.set('min_price', minPrice);
        else params.delete('min_price');

        if (maxPrice) params.set('max_price', maxPrice);
        else params.delete('max_price');

        router.push(`?${params.toString()}`);
    };

    const toggleFilter = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        const current = params.get(key);

        if (current === value) {
            params.delete(key);
        } else {
            params.set(key, value);
        }
        router.push(`?${params.toString()}`);
    };

    return (
        <div className="w-full bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-6">{t('filter_by')}</h3>

            {/* Price Range */}
            <div className="mb-8">
                <h4 className="text-sm font-medium text-gray-900 mb-3">{t('price_range')}</h4>
                <div className="flex items-center gap-2 mb-3">
                    <input
                        type="number"
                        placeholder="Min"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        className="w-full p-2 border rounded-lg text-sm bg-gray-50"
                    />
                    <span className="text-gray-400">-</span>
                    <input
                        type="number"
                        placeholder="Max"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        className="w-full p-2 border rounded-lg text-sm bg-gray-50"
                    />
                </div>
                <button
                    onClick={applyFilters}
                    className="w-full py-2 bg-gray-900 text-white text-xs font-bold rounded-lg hover:bg-black transition-colors"
                >
                    {t('apply')}
                </button>
            </div>

            {/* Ratings */}
            <div className="mb-8">
                <h4 className="text-sm font-medium text-gray-900 mb-3">التقييم</h4>
                <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map((rating) => (
                        <button
                            key={rating}
                            onClick={() => toggleFilter('rating', rating.toString())}
                            className={`flex items-center gap-2 w-full text-sm hover:bg-gray-50 p-1 rounded ${searchParams.get('rating') === rating.toString() ? 'bg-primary-50 text-primary-600 font-bold' : 'text-gray-600'}`}
                        >
                            <div className="flex items-center text-yellow-400">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className={`w-3 h-3 ${i < rating ? 'fill-current' : 'text-gray-200 fill-gray-200'}`} />
                                ))}
                            </div>
                            <span className="text-xs text-gray-400">وأكثر</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Product Status */}
            <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">حالة المنتج</h4>
                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                        <input type="checkbox" className="rounded text-primary-600" />
                        <span>عروض وخصومات</span>
                    </label>
                    <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                        <input type="checkbox" className="rounded text-primary-600" />
                        <span>متوفر في المخزون</span>
                    </label>
                </div>
            </div>
        </div>
    );
}

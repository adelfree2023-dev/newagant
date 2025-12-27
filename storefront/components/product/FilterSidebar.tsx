'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Star, Check } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface FilterSidebarProps {
    aggregations?: {
        id: string;
        name: string;
        code: string;
        type: string;
        values: { value: string, count: number }[]
    }[];
}

export default function FilterSidebar({ aggregations = [] }: FilterSidebarProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { t } = useLanguage();

    // State from URL or defaults
    const [minPrice, setMinPrice] = useState(searchParams.get('min_price') || '');
    const [maxPrice, setMaxPrice] = useState(searchParams.get('max_price') || '');

    const applyPriceFilter = () => {
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

    const toggleAttribute = (code: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        const current = params.get(code);

        // Simple toggle logic (supports one value per attribute for now)
        if (current === value) {
            params.delete(code);
        } else {
            params.set(code, value);
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
                    onClick={applyPriceFilter}
                    className="w-full py-2 bg-gray-900 text-white text-xs font-bold rounded-lg hover:bg-black transition-colors"
                >
                    {t('apply')}
                </button>
            </div>

            {/* Dynamic Attributes (Smart Filters) */}
            {aggregations && aggregations.length > 0 && aggregations.map((attr) => (
                <div key={attr.id} className="mb-8 border-t border-gray-100 pt-6 animate-in slide-in-from-left-2 fade-in">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">{attr.name}</h4>
                    <div className="space-y-2">
                        {attr.values.map((val, idx) => {
                            const isSelected = searchParams.get(attr.code) === val.value;
                            return (
                                <button
                                    key={idx}
                                    onClick={() => toggleAttribute(attr.code, val.value)}
                                    className={`flex items-center justify-between w-full text-sm p-2 rounded-lg transition-all ${isSelected ? 'text-primary-600 font-bold bg-primary-50 ring-1 ring-primary-100' : 'text-gray-600 hover:bg-gray-50'}`}
                                >
                                    <span className="flex items-center gap-2">
                                        {attr.type === 'color' && (
                                            <span
                                                className="w-4 h-4 rounded-full border border-gray-200 shadow-sm"
                                                style={{ backgroundColor: val.value }}
                                            />
                                        )}
                                        {val.value}
                                    </span>
                                    {isSelected && <Check className="w-4 h-4" />}
                                </button>
                            );
                        })}
                    </div>
                </div>
            ))}

            {/* Ratings */}
            <div className="mb-8 border-t border-gray-100 pt-6">
                <h4 className="text-sm font-medium text-gray-900 mb-3">التقييم</h4>
                <div className="space-y-1">
                    {[5, 4, 3, 2, 1].map((rating) => (
                        <button
                            key={rating}
                            onClick={() => toggleFilter('rating', rating.toString())}
                            className={`flex items-center gap-2 w-full text-sm hover:bg-gray-50 p-2 rounded-lg transition-colors ${searchParams.get('rating') === rating.toString() ? 'bg-primary-50 text-primary-600 font-bold' : 'text-gray-600'}`}
                        >
                            <div className="flex items-center text-yellow-400">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className={`w-3.5 h-3.5 ${i < rating ? 'fill-current' : 'text-gray-200 fill-gray-200'}`} />
                                ))}
                            </div>
                            <span className="text-xs text-gray-400">وأكثر</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

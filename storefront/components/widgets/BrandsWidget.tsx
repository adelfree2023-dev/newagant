'use client';
import { BaseWidget } from '@/types/widget';
export default function BrandsWidget({ widget }: { widget: BaseWidget }) {
    return (
        <section className="py-8 bg-white border-y">
            <div className="container mx-auto px-4">
                <div className="flex justify-center items-center gap-12 opacity-50 grayscale">
                    {['Brand 1', 'Brand 2', 'Brand 3', 'Brand 4', 'Brand 5'].map(brand => (
                        <div key={brand} className="text-xl font-bold">{brand}</div>
                    ))}
                </div>
            </div>
        </section>
    );
}

'use client';
import { BaseWidget } from '@/types/widget';
export default function InstagramWidget({ widget }: { widget: BaseWidget }) {
    return (
        <section className="py-12">
            <div className="container mx-auto px-4">
                <h2 className="text-2xl font-bold mb-8 text-center">تابعونا على انستغرام</h2>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="aspect-square bg-gray-200 rounded-lg"></div>
                    ))}
                </div>
            </div>
        </section>
    );
}

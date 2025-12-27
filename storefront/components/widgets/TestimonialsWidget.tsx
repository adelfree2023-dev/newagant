'use client';

// Placeholder Widgets - To be expanded later

import { BaseWidget } from '@/types/widget';

interface Props {
    widget: BaseWidget;
}

// Testimonials Widget
export function TestimonialsWidget({ widget }: Props) {
    return (
        <section className="py-12 bg-gray-50">
            <div className="container mx-auto px-4 text-center">
                <h2 className="text-2xl font-bold mb-8">آراء العملاء</h2>
                <div className="grid md:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-white p-6 rounded-xl shadow-sm">
                            <p className="text-gray-600 mb-4">"خدمة ممتازة ومنتجات عالية الجودة"</p>
                            <p className="font-bold">عميل {i}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// Brands Widget
export function BrandsWidget({ widget }: Props) {
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

// Newsletter Widget
export function NewsletterWidget({ widget }: Props) {
    return (
        <section className="py-16 bg-primary-600 text-white">
            <div className="container mx-auto px-4 text-center">
                <h2 className="text-3xl font-bold mb-4">اشترك في نشرتنا البريدية</h2>
                <p className="mb-8 opacity-80">احصل على آخر العروض والتخفيضات</p>
                <div className="flex gap-2 max-w-md mx-auto">
                    <input type="email" placeholder="البريد الإلكتروني" className="flex-1 px-4 py-3 rounded-lg text-black" />
                    <button className="px-6 py-3 bg-black text-white rounded-lg font-bold">اشترك</button>
                </div>
            </div>
        </section>
    );
}

// Instagram Widget
export function InstagramWidget({ widget }: Props) {
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

// Video Widget
export function VideoWidget({ widget }: Props) {
    return (
        <section className="py-12 bg-black">
            <div className="container mx-auto px-4">
                <div className="aspect-video bg-gray-800 rounded-xl flex items-center justify-center text-white">
                    <span>Video Player Placeholder</span>
                </div>
            </div>
        </section>
    );
}

// Custom HTML Widget
export function CustomHtmlWidget({ widget }: Props) {
    return (
        <section className="py-8">
            <div className="container mx-auto px-4" dangerouslySetInnerHTML={{ __html: widget.settings?.html || '<p>Custom content</p>' }} />
        </section>
    );
}

// Export all as default for dynamic imports
export default TestimonialsWidget;

'use client';
import { BaseWidget } from '@/types/widget';
export default function NewsletterWidget({ widget }: { widget: BaseWidget }) {
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

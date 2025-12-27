'use client';
import Link from 'next/link';
import { Facebook, Twitter, Instagram, Youtube, Phone, Mail, MapPin } from 'lucide-react';

export default function FooterV1() {
    return (
        <footer className="bg-gray-900 text-gray-300 mt-16 animate-in slide-in-from-bottom-4 duration-700">
            {/* Newsletter */}
            <div className="bg-primary-600 py-8 text-white">
                <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div>
                        <h3 className="text-xl font-bold">اشترك في نشرتنا البريدية</h3>
                        <p className="text-white/80">احصل على أحدث العروض والخصومات</p>
                    </div>
                    <div className="flex w-full md:w-auto">
                        <input
                            type="email"
                            placeholder="البريد الإلكتروني"
                            className="flex-grow md:w-80 px-4 py-3 rounded-r-lg focus:outline-none text-gray-900"
                            dir="ltr"
                        />
                        <button className="bg-gray-900 text-white px-6 py-3 rounded-l-lg font-bold hover:bg-black transition">
                            اشترك
                        </button>
                    </div>
                </div>
            </div>
            {/* Main Footer (Mocked for brevity) */}
            <div className="container mx-auto px-4 py-12 text-center">
                <p>© 2025 Modern Footer V1 - Optimized for Visuals</p>
            </div>
        </footer>
    )
}

'use client';

import { ShoppingCart, Search, Menu, User, CarFront } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import Link from 'next/link';
import { useState } from 'react';

export default function HeaderV3() {
    const { t, locale } = useLanguage();
    const { itemCount } = useCart();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <header className="bg-zinc-950 text-white border-b border-zinc-800 sticky top-0 z-50 animate-in fade-in duration-700">
            {/* Top Bar for specs/contact - very automotive */}
            <div className="bg-red-700 text-xs font-bold tracking-wider py-1 px-4 text-center uppercase">
                {locale === 'ar' ? 'شحن مجاني للطلبات فوق 500 ريال' : 'Free Shipping on Orders Over 500 SAR'}
            </div>

            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">

                    {/* Logo Area */}
                    <div className="flex items-center gap-2 group cursor-pointer">
                        <div className="p-2 bg-zinc-800 rounded-sm border border-zinc-700 group-hover:border-red-600 transition-colors">
                            <CarFront className="w-6 h-6 text-red-600" />
                        </div>
                        <span className="text-2xl font-black tracking-tighter italic uppercase">
                            TURBO<span className="text-red-600">GEAR</span>
                        </span>
                    </div>

                    {/* Search - Hidden on mobile, skew style */}
                    <div className="hidden md:flex flex-1 max-w-md mx-8 relative">
                        <div className="absolute inset-0 bg-zinc-800 -skew-x-12 border border-zinc-700"></div>
                        <input
                            type="text"
                            placeholder={t('search_placeholder')}
                            className="relative w-full bg-transparent border-none focus:ring-0 text-white placeholder-zinc-500 px-6 py-2 outline-none font-medium"
                        />
                        <button className="absolute right-0 top-0 bottom-0 px-4 text-zinc-400 hover:text-white z-10">
                            <Search className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-6">
                        <nav className="hidden lg:flex gap-6 font-bold uppercase text-sm tracking-wide text-zinc-400">
                            <Link href="#" className="hover:text-red-500 transition-colors text-white">{t('home')}</Link>
                            <Link href="#" className="hover:text-red-500 transition-colors">{t('all_categories')}</Link>
                            <Link href="#" className="hover:text-red-500 transition-colors">{t('deals')}</Link>
                        </nav>

                        <div className="flex items-center gap-4 border-l border-zinc-800 pl-6 rtl:border-l-0 rtl:border-r rtl:pr-6">
                            <button className="hover:text-red-500 transition-colors">
                                <User className="w-6 h-6" />
                            </button>
                            <div className="relative group cursor-pointer">
                                <Link href="/cart">
                                    <ShoppingCart className="w-6 h-6 group-hover:text-red-500 transition-colors" />
                                    {itemCount > 0 && (
                                        <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-sm">
                                            {itemCount}
                                        </span>
                                    )}
                                </Link>
                            </div>
                            <button className="lg:hidden text-zinc-300" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                                <Menu className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}

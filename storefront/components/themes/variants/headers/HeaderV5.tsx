'use client';

import { ShoppingBag, Search, Menu } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import clsx from 'clsx';

export default function HeaderV5() {
    const { t } = useLanguage();
    const { itemCount } = useCart();
    const [scrolled, setScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <>
            <header className={clsx(
                'fixed top-0 left-0 right-0 z-50 transition-all duration-300 py-4 px-6 md:px-12 animate-in fade-in',
                scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm py-3' : 'bg-transparent'
            )}>
                <div className="max-w-[1920px] mx-auto grid grid-cols-3 items-center">

                    {/* Left: Mobile Menu & Search */}
                    <div className="flex items-center gap-6">
                        <button className="flex items-center gap-2 text-sm uppercase font-medium tracking-widest hover:text-zinc-500 transition-colors" onClick={() => setIsMenuOpen(true)}>
                            <Menu className="w-5 h-5" />
                            <span className="hidden xl:inline">Collection</span>
                        </button>
                        <div className="hidden md:flex items-center border-b border-black py-1">
                            <input
                                type="text"
                                placeholder={t('search_placeholder')}
                                className="bg-transparent border-none outline-none text-sm placeholder:text-zinc-500 w-32 focus:w-48 transition-all"
                            />
                            <Search className="w-4 h-4 ml-2" />
                        </div>
                    </div>

                    {/* Center: Logo */}
                    <div className="flex justify-center">
                        <Link href="/" className="text-3xl md:text-5xl font-serif font-bold tracking-tighter uppercase relative z-50 mix-blend-difference text-black">
                            Z A R A <span className="text-xs absolute -right-4 top-0 font-sans tracking-normal opacity-50">CLONE</span>
                        </Link>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex justify-end items-center gap-6 text-sm font-medium uppercase tracking-widest">
                        <Link href="/login" className="hidden md:block hover:underline">{t('login')}</Link>

                        <div className="relative">
                            <Link href="/cart" className="flex items-center gap-1">
                                <ShoppingBag className="w-5 h-5" />
                                <span className="tabular-nums">{itemCount}</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            {/* Menu Overlay */}
            {isMenuOpen && (
                <div className="fixed inset-0 bg-white z-[60] flex flex-col p-8">
                    <button onClick={() => setIsMenuOpen(false)} className="self-end text-xl font-bold uppercase">Close</button>
                    <div className="flex-1 flex items-center justify-center text-4xl font-serif">
                        <ul>
                            <li>Woman</li>
                            <li>Man</li>
                            <li>Kids</li>
                        </ul>
                    </div>
                </div>
            )}
        </>
    );
}

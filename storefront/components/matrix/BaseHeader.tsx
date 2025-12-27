'use client';

import { ThemeConfig } from '@/types/theme';
import { ShoppingCart, Search, Menu, User } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';

interface BaseHeaderProps {
    config: ThemeConfig;
}

export default function BaseHeader({ config }: BaseHeaderProps) {
    const { layout, colors, typography, radius } = config;
    const { t } = useLanguage();
    const { itemCount } = useCart();

    const headerStyle = {
        fontFamily: typography.headingFont === 'serif' ? 'serif' : 'sans-serif',
        backgroundColor: colors.background,
        color: colors.foreground,
        borderColor: colors.border
    };

    // 1. Minimal / Centered (Jewelry, Fashion)
    if (layout.header === 'centered' || layout.header === 'minimal') {
        return (
            <header style={headerStyle} className="border-b sticky top-0 z-50">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="w-1/3 flex items-center gap-4">
                        <button><Menu className="w-6 h-6" /></button>
                        <Search className="w-5 h-5 opacity-70" />
                    </div>

                    <div className="w-1/3 text-center">
                        <Link href="/" className="text-2xl font-black tracking-widest uppercase">
                            {config.name}
                        </Link>
                    </div>

                    <div className="w-1/3 flex justify-end gap-4">
                        <User className="w-5 h-5 opacity-70" />
                        <div className="relative">
                            <ShoppingCart className="w-5 h-5" style={{ color: colors.primary }} />
                            {itemCount > 0 && (
                                <span className="absolute -top-2 -right-2 text-xs w-4 h-4 rounded-full flex items-center justify-center" style={{ backgroundColor: colors.primary, color: colors.background }}>
                                    {itemCount}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </header>
        );
    }

    // 2. Search Heavy / Retail (Electronics, Grocery)
    if (layout.header === 'search-heavy' || layout.header === 'standard') {
        return (
            <header style={{ backgroundColor: colors.primary, color: '#fff' }} className="pb-2">
                <div className="container mx-auto px-4 py-3 flex items-center gap-6">
                    <Link href="/" className="font-bold text-2xl tracking-tighter">{config.name}</Link>

                    <div className="flex-1 relative">
                        <input
                            type="text"
                            placeholder={t('search_placeholder')}
                            className="w-full h-10 px-4 rounded-sm text-black"
                            style={{ borderRadius: radius === 'lg' ? '0.5rem' : radius === 'sm' ? '0.125rem' : '0' }}
                        />
                        <button
                            className="absolute right-0 top-0 h-10 px-4 text-black font-bold"
                            style={{ backgroundColor: colors.secondary, borderRadius: radius === 'lg' ? '0 0.5rem 0.5rem 0' : '0' }}
                        >
                            {t('search')}
                        </button>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="text-xs text-white/80">
                            <div>{t('welcome')}</div>
                            <div className="font-bold cursor-pointer hover:underline">{t('login')}</div>
                        </div>
                        <Link href="/cart" className="relative p-2">
                            <ShoppingCart className="w-6 h-6" />
                            <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">{itemCount}</span>
                        </Link>
                    </div>
                </div>
                <div className="container mx-auto px-4 text-xs font-bold flex gap-4 overflow-x-auto text-white/90">
                    <span>{t('all_categories')}</span>
                    <span>{t('deals')}</span>
                </div>
            </header>
        );
    }

    // 3. Imbalanced (Fashion, Gaming - Logo Left, Nav Right, Minimal)
    if (layout.header === 'imbalanced') {
        return (
            <header className="absolute top-0 w-full z-50 p-6 flex justify-between items-start text-white mix-blend-difference">
                <Link href="/" className="text-4xl font-black tracking-tighter uppercase leading-none">
                    {config.name}
                </Link>

                <div className="flex gap-8 text-sm font-bold tracking-widest uppercase">
                    <nav className="hidden md:flex gap-8">
                        <Link href="#" className="hover:line-through decoration-2">{t('shop')}</Link>
                        <Link href="#" className="hover:line-through decoration-2">{t('about')}</Link>
                    </nav>
                    <div className="flex gap-4">
                        <Search className="w-5 h-5 cursor-pointer" />
                        <Link href="/cart" className="relative">
                            <ShoppingCart className="w-5 h-5 cursor-pointer" />
                            {itemCount > 0 && <span className="absolute -top-1 -right-1 text-[9px] font-bold">{itemCount}</span>}
                        </Link>
                        <Menu className="w-6 h-6 md:hidden cursor-pointer" />
                    </div>
                </div>
            </header>
        );
    }

    // Default Fallback
    return (
        <header className="border-b bg-white">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                <Link href="/" className="font-bold text-xl">{config.name}</Link>
                <nav className="flex gap-4 text-sm">
                    <Link href="#">{t('home')}</Link>
                    <Link href="#">{t('shop')}</Link>
                </nav>
                <Link href="/cart"><ShoppingCart className="w-5 h-5" /></Link>
            </div>
        </header>
    );
}

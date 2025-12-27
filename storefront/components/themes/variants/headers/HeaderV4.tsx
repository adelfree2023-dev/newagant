'use client';

import { ShoppingCart, Search, Menu, User, MapPin } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import Link from 'next/link';

export default function HeaderV4() {
    const { t } = useLanguage();
    const { itemCount } = useCart();

    return (
        <header className="bg-blue-900 text-white pb-4 animate-in slide-in-from-top-2 duration-500">
            {/* Top Utility Bar */}
            <div className="bg-blue-950 text-[11px] py-1 border-b border-blue-800">
                <div className="container mx-auto px-4 flex justify-between">
                    <div className="flex gap-4">
                        <span className="hover:underline cursor-pointer">Business</span>
                        <span className="hover:underline cursor-pointer">Support</span>
                        <span className="hover:underline cursor-pointer">Brand Store</span>
                    </div>
                </div>
            </div>

            {/* Main Header */}
            <div className="container mx-auto px-4 py-5 flex items-center justify-between gap-8">
                {/* Logo */}
                <Link href="/" className="flex flex-col leading-none group">
                    <span className="text-3xl font-black tracking-tighter group-hover:text-yellow-400 transition-colors">TECH<span className="bg-yellow-400 text-black px-1 ml-1 rounded-sm text-2xl group-hover:bg-white">MART</span></span>
                </Link>

                {/* Hamburger (Desktop) */}
                <button className="flex items-center gap-2 font-bold text-lg hover:text-yellow-400">
                    <Menu className="w-8 h-8" />
                    <span className="hidden xl:inline">Menu</span>
                </button>

                {/* Search Bar */}
                <div className="flex-1 max-w-2xl relative">
                    <input
                        type="text"
                        placeholder="Search for laptops, tvs..."
                        className="w-full h-10 px-4 rounded-full text-black placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                    <button className="absolute right-0 top-0 h-10 w-10 bg-yellow-400 rounded-r-full text-blue-900 hover:bg-white transition-colors flex items-center justify-center">
                        <Search className="w-5 h-5" />
                    </button>
                </div>

                {/* Cart & Account */}
                <div className="flex items-center gap-6">
                    <div className="flex flex-col text-sm leading-tight cursor-pointer hover:text-yellow-400">
                        <div className="flex items-center gap-1 font-bold">
                            <User className="w-5 h-5" /> Account
                        </div>
                        <span className="text-xs text-blue-200">Sign In</span>
                    </div>

                    <Link href="/cart" className="flex items-center gap-2 group">
                        <div className="relative">
                            <ShoppingCart className="w-8 h-8 group-hover:text-yellow-400" />
                            <span className="absolute -top-1 -right-1 bg-yellow-400 text-blue-900 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                                {itemCount}
                            </span>
                        </div>
                        <span className="hidden md:block font-bold text-lg group-hover:text-yellow-400">Cart</span>
                    </Link>
                </div>
            </div>
        </header>
    );
}

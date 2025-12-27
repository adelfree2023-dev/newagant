'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ShoppingCart, Menu, X, Search, Phone, Heart, User, MapPin, ChevronDown } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useStoreConfig } from '@/context/StoreConfigContext';

// Mock Categories
const categories = [
    { id: 1, name: 'إلكترونيات', slug: 'electronics', icon: '📱' },
    { id: 2, name: 'أزياء رجالي', slug: 'men-fashion', icon: '👔' },
    { id: 3, name: 'أزياء نسائي', slug: 'women-fashion', icon: '👗' },
    { id: 4, name: 'المنزل والمطبخ', slug: 'home-kitchen', icon: '🏠' },
    { id: 5, name: 'الجمال والعناية', slug: 'beauty', icon: '💄' },
    { id: 6, name: 'الرياضة', slug: 'sports', icon: '⚽' },
    { id: 7, name: 'الألعاب', slug: 'toys', icon: '🎮' },
    { id: 8, name: 'الكتب', slug: 'books', icon: '📚' },
];

export default function Header() {
    const pathname = usePathname();
    const router = useRouter();
    const { cart } = useCart();
    const { user } = useAuth();
    const { config } = useStoreConfig();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Calculate total items
    const cartItemsCount = cart.items.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <header className="sticky top-0 z-50">
            {/* Top Bar */}
            <div className="bg-gray-900 text-white text-xs py-2">
                <div className="container mx-auto px-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {config?.phone || '920000000'}
                        </span>
                        <span className="hidden sm:flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            توصيل لجميع مناطق المملكة
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        {config?.features?.pages?.track_order !== false && (
                            <Link href="/track-order" className="hover:text-primary-400 text-gray-300">
                                تتبع الطلب
                            </Link>
                        )}
                        <Link href="/help" className="hover:text-primary-400 text-gray-300">
                            المساعدة
                        </Link>
                    </div>
                </div>
            </div>

            {/* Main Header */}
            <div className="bg-white border-b border-gray-100 shadow-sm py-4">
                <div className="container mx-auto px-4">
                    <div className="flex items-center gap-4 lg:gap-8 transition-all">
                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="lg:hidden p-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                        >
                            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>

                        {/* Logo */}
                        <Link href="/" className="flex-shrink-0 group">
                            <h1 className="text-2xl font-black text-primary-600 tracking-tighter group-hover:scale-105 transition-transform">
                                {config?.store_name || 'المتجر'}
                            </h1>
                        </Link>

                        {/* Search Bar (Desktop) */}
                        <div className="flex-grow max-w-2xl mx-auto hidden lg:block">
                            <div className="relative group">
                                <input
                                    type="text"
                                    placeholder="ابحث عن منتجات..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full py-2.5 px-4 pr-12 rounded-full border border-gray-200 bg-gray-50 
                                             focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:bg-white transition-all shadow-sm"
                                />
                                <button className="absolute left-1 top-1 h-[calc(100%-8px)] px-4 bg-primary-600 hover:bg-primary-700 
                                                 rounded-full transition-colors flex items-center justify-center">
                                    <Search className="w-4 h-4 text-white" />
                                </button>
                            </div>
                        </div>

                        {/* Right Actions */}
                        <div className="flex items-center gap-2 lg:gap-4 mr-auto">
                            {/* Wishlist */}
                            <Link href="/wishlist" className="hidden sm:flex flex-col items-center justify-center w-10 h-10 rounded-full hover:bg-red-50 text-gray-600 hover:text-red-500 transition-colors">
                                <Heart className="w-5 h-5" />
                            </Link>

                            {/* Account */}
                            {config?.features?.user_account !== false && (
                                <Link href={user ? "/account" : "/login"} className="flex flex-col items-center justify-center w-10 h-10 rounded-full hover:bg-primary-50 text-gray-600 hover:text-primary-600 transition-colors">
                                    <User className="w-5 h-5" />
                                </Link>
                            )}

                            {/* Cart */}
                            <Link href="/cart" className="flex items-center gap-2 bg-gray-900 hover:bg-black text-white px-4 py-2 rounded-full transition-colors group shadow-lg shadow-gray-200">
                                <div className="relative">
                                    <ShoppingCart className="w-5 h-5" />
                                    {cartItemsCount > 0 && (
                                        <span className="absolute -top-2 -right-2 bg-red-500 text-white 
                                                       text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold border-2 border-gray-900">
                                            {cartItemsCount}
                                        </span>
                                    )}
                                </div>
                                <span className="font-medium hidden sm:block">السلة</span>
                            </Link>
                        </div>
                    </div>

                    {/* Mobile Search */}
                    <div className="lg:hidden mt-4">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="ابحث..."
                                className="w-full py-2 px-4 pr-10 rounded-lg bg-gray-100 border-none text-sm"
                            />
                            <Search className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Navbar */}
            <div className="hidden lg:block bg-white border-b border-gray-100">
                <div className="container mx-auto px-4 flex items-center gap-8 text-sm font-medium text-gray-900 h-12">
                    <div className="mega-menu-trigger relative h-full flex items-center group cursor-pointer border-l border-gray-100 pl-6 ml-2">
                        <button className="flex items-center gap-2 text-primary-600 hover:text-primary-700">
                            <Menu className="w-4 h-4" />
                            جميع الأقسام
                        </button>
                    </div>

                    <Link href="/" className="hover:text-primary-600 transition-colors">الرئيسية</Link>

                    {config?.features?.pages?.about !== false && (
                        <Link href="/about" className={`hover:text-primary-600 transition-colors ${pathname === '/about' ? 'text-primary-600' : ''}`}>
                            من نحن
                        </Link>
                    )}

                    <Link href="/category/offers" className="text-red-500 hover:text-red-600 transition-colors flex items-center gap-1">
                        عروض خاصة 🔥
                    </Link>

                    {config?.features?.pages?.contact !== false && (
                        <Link href="/contact" className={`hover:text-primary-600 transition-colors ${pathname === '/contact' ? 'text-primary-600' : ''}`}>
                            اتصل بنا
                        </Link>
                    )}
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}></div>
                    <div className="absolute top-0 right-0 w-3/4 max-w-xs h-full bg-white shadow-2xl p-6 flex flex-col gap-4">
                        <div className="flex items-center justify-between mb-4">
                            <span className="font-bold text-lg">القائمة</span>
                            <button onClick={() => setMobileMenuOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <nav className="flex flex-col gap-2">
                            <Link href="/" className="p-3 bg-gray-50 rounded-lg font-medium text-gray-900">الرئيسية</Link>
                            {config?.features?.pages?.about !== false && <Link href="/about" className="p-3 hover:bg-gray-50 rounded-lg">من نحن</Link>}
                            {config?.features?.pages?.contact !== false && <Link href="/contact" className="p-3 hover:bg-gray-50 rounded-lg">اتصل بنا</Link>}
                        </nav>
                    </div>
                </div>
            )}
        </header>
    );
}

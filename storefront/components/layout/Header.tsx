'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
    Search,
    ShoppingCart,
    User,
    Menu,
    X,
    ChevronDown,
    Heart,
    MapPin,
    Phone
} from 'lucide-react'

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
]

export default function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const cartItemsCount = 3 // Mock

    return (
        <header className="sticky top-0 z-50">
            {/* Top Bar */}
            <div className="bg-dark-200 text-white text-sm py-2">
                <div className="container mx-auto px-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            920000000
                        </span>
                        <span className="hidden sm:flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            توصيل لجميع مناطق المملكة
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/track-order" className="hover:text-secondary-400">
                            تتبع الطلب
                        </Link>
                        <Link href="/help" className="hover:text-secondary-400">
                            المساعدة
                        </Link>
                    </div>
                </div>
            </div>

            {/* Main Header */}
            <div className="bg-primary-500 text-white py-3">
                <div className="container mx-auto px-4">
                    <div className="flex items-center gap-4">
                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="lg:hidden p-2"
                        >
                            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>

                        {/* Logo */}
                        <Link href="/" className="flex-shrink-0">
                            <h1 className="text-2xl font-bold">المتجر</h1>
                        </Link>

                        {/* Search Bar */}
                        <div className="flex-grow max-w-2xl mx-4 hidden md:block">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="ابحث عن منتجات..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full py-2.5 px-4 pr-12 rounded-lg text-gray-900 
                           focus:outline-none focus:ring-2 focus:ring-secondary-400"
                                />
                                <button className="absolute left-0 top-0 h-full px-4 bg-secondary-500 
                                 rounded-l-lg hover:bg-secondary-600 transition">
                                    <Search className="w-5 h-5 text-white" />
                                </button>
                            </div>
                        </div>

                        {/* Right Actions */}
                        <div className="flex items-center gap-4 mr-auto">
                            {/* Wishlist */}
                            <Link href="/wishlist" className="hidden sm:flex flex-col items-center hover:text-secondary-200">
                                <Heart className="w-6 h-6" />
                                <span className="text-xs mt-1">المفضلة</span>
                            </Link>

                            {/* Account */}
                            <Link href="/account" className="flex flex-col items-center hover:text-secondary-200">
                                <User className="w-6 h-6" />
                                <span className="text-xs mt-1 hidden sm:block">حسابي</span>
                            </Link>

                            {/* Cart */}
                            <Link href="/cart" className="flex flex-col items-center hover:text-secondary-200 relative">
                                <div className="relative">
                                    <ShoppingCart className="w-6 h-6" />
                                    {cartItemsCount > 0 && (
                                        <span className="absolute -top-2 -right-2 bg-secondary-500 text-white 
                                   text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                                            {cartItemsCount}
                                        </span>
                                    )}
                                </div>
                                <span className="text-xs mt-1 hidden sm:block">السلة</span>
                            </Link>
                        </div>
                    </div>

                    {/* Mobile Search */}
                    <div className="md:hidden mt-3">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="ابحث عن منتجات..."
                                className="w-full py-2.5 px-4 pr-12 rounded-lg text-gray-900"
                            />
                            <button className="absolute left-0 top-0 h-full px-4 bg-secondary-500 rounded-l-lg">
                                <Search className="w-5 h-5 text-white" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Categories Bar */}
            <div className="bg-white shadow-sm border-b hidden lg:block">
                <div className="container mx-auto px-4">
                    <div className="flex items-center gap-6">
                        {/* All Categories Dropdown */}
                        <div className="mega-menu-trigger relative py-3">
                            <button className="flex items-center gap-2 font-bold text-gray-800 hover:text-primary-500">
                                <Menu className="w-5 h-5" />
                                جميع الأقسام
                                <ChevronDown className="w-4 h-4" />
                            </button>

                            {/* Mega Menu */}
                            <div className="mega-menu absolute top-full right-0 w-64 bg-white shadow-xl rounded-b-lg z-50">
                                <div className="py-2">
                                    {categories.map((cat) => (
                                        <Link
                                            key={cat.id}
                                            href={`/category/${cat.slug}`}
                                            className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition"
                                        >
                                            <span className="text-xl">{cat.icon}</span>
                                            <span className="text-gray-700">{cat.name}</span>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Quick Links */}
                        <Link href="/deals" className="py-3 font-medium text-primary-500 hover:text-primary-600">
                            🔥 العروض
                        </Link>
                        <Link href="/new" className="py-3 font-medium text-gray-700 hover:text-primary-500">
                            الجديد
                        </Link>
                        <Link href="/best-sellers" className="py-3 font-medium text-gray-700 hover:text-primary-500">
                            الأكثر مبيعاً
                        </Link>
                        <Link href="/brands" className="py-3 font-medium text-gray-700 hover:text-primary-500">
                            الماركات
                        </Link>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="lg:hidden bg-white shadow-lg border-b">
                    <div className="container mx-auto px-4 py-4">
                        <div className="space-y-2">
                            {categories.map((cat) => (
                                <Link
                                    key={cat.id}
                                    href={`/category/${cat.slug}`}
                                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    <span className="text-xl">{cat.icon}</span>
                                    <span className="text-gray-700">{cat.name}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </header>
    )
}

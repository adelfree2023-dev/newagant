'use client';

/**
 * Storefront Layout
 * تخطيط المتجر مع Header و Footer
 * 
 * يجب وضعه في: storefront/app/layout.tsx
 */

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import './globals.css';
import { Providers } from '@/components/Providers';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="ar" dir="rtl">
            <head>
                <title>المتجر - CoreFlex</title>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <meta name="description" content="تسوق أفضل المنتجات بأسعار منافسة" />
                <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap" rel="stylesheet" />
            </head>
            <body className="bg-gray-50 font-tajawal">
                <Providers>
                    <div className="flex flex-col min-h-screen">
                        <Header />
                        <main className="flex-1">{children}</main>
                        <Footer />
                    </div>
                </Providers>
            </body>
        </html>
    );
}

// ==================== Header ====================

function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const pathname = usePathname();

    return (
        <header className="bg-white shadow-sm sticky top-0 z-50">
            {/* Top Bar */}
            <div className="bg-gray-900 text-white text-sm py-2">
                <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
                    <p>🚚 شحن مجاني للطلبات فوق 200 ر.س</p>
                    <div className="flex items-center gap-4">
                        <a href="tel:+966500000000" className="hover:text-primary-400">📞 920000000</a>
                        <Link href="/track-order" className="hover:text-primary-400">تتبع طلبك</Link>
                    </div>
                </div>
            </div>

            {/* Main Header */}
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <span className="text-2xl">🏪</span>
                        <span className="font-bold text-xl text-gray-900">المتجر</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-6">
                        <NavLink href="/" active={pathname === '/'}>الرئيسية</NavLink>
                        <NavLink href="/products" active={pathname.startsWith('/products')}>المنتجات</NavLink>
                        <NavLink href="/categories" active={pathname.startsWith('/categories')}>الفئات</NavLink>
                        <NavLink href="/offers" active={pathname === '/offers'}>العروض</NavLink>
                        <NavLink href="/about" active={pathname === '/about'}>من نحن</NavLink>
                    </nav>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                        {/* Search */}
                        <button
                            onClick={() => setSearchOpen(!searchOpen)}
                            className="p-2 hover:bg-gray-100 rounded-full"
                        >
                            🔍
                        </button>

                        {/* Cart Button - Uses CartContext */}
                        <CartButton />

                        {/* Account - Uses AuthContext */}
                        <AccountButton />

                        {/* Mobile Menu Toggle */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2 hover:bg-gray-100 rounded-full"
                        >
                            {mobileMenuOpen ? '✕' : '☰'}
                        </button>
                    </div>
                </div>

                {/* Search Bar */}
                {searchOpen && (
                    <div className="py-4 border-t animate-fadeIn">
                        <form action="/products" className="flex gap-2">
                            <input
                                type="text"
                                name="search"
                                placeholder="ابحث عن منتج..."
                                className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                                autoFocus
                            />
                            <button type="submit" className="px-6 py-2 bg-primary-600 text-white rounded-lg">
                                بحث
                            </button>
                        </form>
                    </div>
                )}

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <nav className="md:hidden py-4 border-t animate-fadeIn">
                        <div className="flex flex-col gap-2">
                            <MobileNavLink href="/" onClick={() => setMobileMenuOpen(false)}>الرئيسية</MobileNavLink>
                            <MobileNavLink href="/products" onClick={() => setMobileMenuOpen(false)}>المنتجات</MobileNavLink>
                            <MobileNavLink href="/categories" onClick={() => setMobileMenuOpen(false)}>الفئات</MobileNavLink>
                            <MobileNavLink href="/offers" onClick={() => setMobileMenuOpen(false)}>العروض</MobileNavLink>
                            <MobileNavLink href="/about" onClick={() => setMobileMenuOpen(false)}>من نحن</MobileNavLink>
                        </div>
                    </nav>
                )}
            </div>
        </header>
    );
}

function NavLink({ href, children, active }: { href: string; children: React.ReactNode; active?: boolean }) {
    return (
        <Link
            href={href}
            className={`font-medium transition-colors ${active ? 'text-primary-600' : 'text-gray-600 hover:text-primary-600'
                }`}
        >
            {children}
        </Link>
    );
}

function MobileNavLink({ href, children, onClick }: { href: string; children: React.ReactNode; onClick: () => void }) {
    return (
        <Link
            href={href}
            onClick={onClick}
            className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
        >
            {children}
        </Link>
    );
}

function CartButton() {
    const { itemCount } = useCart();

    return (
        <Link href="/cart" className="relative p-2 hover:bg-gray-100 rounded-full">
            <span className="text-xl">🛒</span>
            {itemCount > 0 && (
                <span className="absolute -top-1 -left-1 w-5 h-5 bg-primary-600 text-white text-xs rounded-full flex items-center justify-center">
                    {itemCount > 9 ? '9+' : itemCount}
                </span>
            )}
        </Link>
    );
}

function AccountButton() {
    const { isAuthenticated, user, logout } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);

    if (!isAuthenticated) {
        return (
            <Link href="/login" className="p-2 hover:bg-gray-100 rounded-full">
                👤
            </Link>
        );
    }

    return (
        <div className="relative">
            <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-full"
            >
                <span className="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-bold">
                    {user?.name?.[0] || '؟'}
                </span>
            </button>

            {menuOpen && (
                <div className="absolute left-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border py-2 animate-fadeIn">
                    <div className="px-4 py-2 border-b">
                        <p className="font-medium">{user?.name}</p>
                        <p className="text-sm text-gray-500 truncate">{user?.email}</p>
                    </div>
                    <Link
                        href="/account"
                        className="block px-4 py-2 hover:bg-gray-100"
                        onClick={() => setMenuOpen(false)}
                    >
                        حسابي
                    </Link>
                    <Link
                        href="/account/orders"
                        className="block px-4 py-2 hover:bg-gray-100"
                        onClick={() => setMenuOpen(false)}
                    >
                        طلباتي
                    </Link>
                    <button
                        onClick={() => { logout(); setMenuOpen(false); }}
                        className="block w-full text-right px-4 py-2 text-red-600 hover:bg-red-50"
                    >
                        تسجيل خروج
                    </button>
                </div>
            )}
        </div>
    );
}

// ==================== Footer ====================

function Footer() {
    return (
        <footer className="bg-gray-900 text-white pt-12 pb-6">
            <div className="max-w-7xl mx-auto px-4">
                <div className="grid md:grid-cols-4 gap-8 mb-8">
                    {/* About */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-2xl">🏪</span>
                            <span className="font-bold text-lg">المتجر</span>
                        </div>
                        <p className="text-gray-400 text-sm">
                            متجرك الإلكتروني الموثوق لأفضل المنتجات بأسعار منافسة وشحن سريع لجميع مناطق المملكة.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-bold mb-4">روابط سريعة</h4>
                        <ul className="space-y-2 text-gray-400 text-sm">
                            <li><Link href="/products" className="hover:text-white">المنتجات</Link></li>
                            <li><Link href="/offers" className="hover:text-white">العروض</Link></li>
                            <li><Link href="/about" className="hover:text-white">من نحن</Link></li>
                            <li><Link href="/contact" className="hover:text-white">اتصل بنا</Link></li>
                        </ul>
                    </div>

                    {/* Customer Service */}
                    <div>
                        <h4 className="font-bold mb-4">خدمة العملاء</h4>
                        <ul className="space-y-2 text-gray-400 text-sm">
                            <li><Link href="/track-order" className="hover:text-white">تتبع طلبك</Link></li>
                            <li><Link href="/faq" className="hover:text-white">الأسئلة الشائعة</Link></li>
                            <li><Link href="/shipping" className="hover:text-white">سياسة الشحن</Link></li>
                            <li><Link href="/returns" className="hover:text-white">سياسة الإرجاع</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="font-bold mb-4">تواصل معنا</h4>
                        <ul className="space-y-2 text-gray-400 text-sm">
                            <li>📞 920000000</li>
                            <li>📧 support@store.com</li>
                            <li>📍 الرياض، المملكة العربية السعودية</li>
                        </ul>
                        <div className="flex gap-3 mt-4">
                            <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700">
                                𝕏
                            </a>
                            <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700">
                                📷
                            </a>
                            <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700">
                                📱
                            </a>
                        </div>
                    </div>
                </div>

                {/* Payment Methods */}
                <div className="border-t border-gray-800 pt-6 mb-6">
                    <div className="flex items-center justify-center gap-4 text-2xl">
                        <span title="Visa">💳</span>
                        <span title="Mastercard">💳</span>
                        <span title="مدى">💳</span>
                        <span title="Apple Pay">🍎</span>
                        <span title="الدفع عند الاستلام">💵</span>
                    </div>
                </div>

                {/* Copyright */}
                <div className="text-center text-gray-500 text-sm">
                    <p>© {new Date().getFullYear()} المتجر. جميع الحقوق محفوظة.</p>
                    <p className="mt-1">
                        <Link href="/terms" className="hover:text-white">الشروط والأحكام</Link>
                        {' • '}
                        <Link href="/privacy" className="hover:text-white">سياسة الخصوصية</Link>
                    </p>
                </div>
            </div>
        </footer>
    );
}

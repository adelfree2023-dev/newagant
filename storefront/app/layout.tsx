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
import FloatingContacts from '@/components/FloatingContacts';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FeaturesBar from '@/components/FeaturesBar';
import ThemeSwitcher from '@/components/ThemeSwitcher';
import NewsletterSection from '@/components/NewsletterSection';

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
                        <FeaturesBar />
                        <main className="flex-1">{children}</main>
                        <NewsletterSection />
                        <Footer />
                        <FloatingContacts />
                        <ThemeSwitcher />
                    </div>
                </Providers>
            </body>
        </html>
    );
}

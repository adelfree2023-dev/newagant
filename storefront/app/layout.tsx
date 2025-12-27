'use client';

/**
 * Storefront Layout
 * The main layout that dynamically loads Header/Footer based on the selected theme.
 * Refactored for Theme Engine & Governance.
 */

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import './globals.css';
import { Providers } from '@/components/Providers';
import { StoreConfigProvider } from '@/context/StoreConfigContext';
import { CartProvider } from '@/context/CartContext';
import { LanguageProvider } from '@/context/LanguageContext';
import FloatingContacts from '@/components/FloatingContacts';
import FeaturesBar from '@/components/FeaturesBar';
import ThemeSwitcher from '@/components/ThemeSwitcher';
import NewsletterSection from '@/components/NewsletterSection';
import { Toaster } from 'sonner';
import { getThemeComponent } from '@/lib/theme-factory';
import FeatureGuard from '@/components/FeatureGuard';

// Dynamic Theme Components
const Header = getThemeComponent('Header');
const Footer = getThemeComponent('Footer');

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
                <StoreConfigProvider>
                    <LanguageProvider>
                        <CartProvider>
                            <Providers>
                                <Toaster position="top-center" richColors />

                                <div className="flex flex-col min-h-screen">
                                    <FeatureGuard feature="storefront.header">
                                        <Header />
                                    </FeatureGuard>

                                    <FeaturesBar />

                                    <main className="flex-1">
                                        {children}
                                    </main>

                                    <NewsletterSection />

                                    <FeatureGuard feature="storefront.footer">
                                        <Footer />
                                    </FeatureGuard>

                                    <FloatingContacts />
                                    <ThemeSwitcher />
                                </div>
                            </Providers>
                        </CartProvider>
                    </LanguageProvider>
                </StoreConfigProvider>
            </body>
        </html>
    );
}

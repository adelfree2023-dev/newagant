'use client';

import { createContext, useContext, useState, useEffect } from 'react';

// Simple Dictionary System
const translations = {
    ar: {
        'search_placeholder': 'ابحث عن منتجات...',
        'cart': 'السلة',
        'account': 'حسابي',
        'wishlist': 'المفضلة',
        'all_categories': 'جميع الأقسام',
        'home': 'الرئيسية',
        'about': 'من نحن',
        'contact': 'اتصل بنا',
        'deals': 'عروض',
        'new': 'جديد',
        'currency': 'ر.س',
        'add_to_cart': 'أضف للسلة',
        'buy_now': 'اشتر الآن',
        'out_of_stock': 'نفذت الكمية',
        'filter_by': 'تصفية حسب',
        'price_range': 'نطاق السعر',
        'brands': 'العلامات التجارية',
        'apply': 'تطبيق',
        'clear': 'مسح',
        'delivery_to': 'التوصيل إلى',
        'login': 'دخول',
        'help': 'مساعدة',
        'track_order': 'تتبع الطلب'
    },
    en: {
        'search_placeholder': 'Search products...',
        'cart': 'Cart',
        'account': 'Account',
        'wishlist': 'Wishlist',
        'all_categories': 'All Categories',
        'home': 'Home',
        'about': 'About Us',
        'contact': 'Contact Us',
        'deals': 'Deals',
        'new': 'New Arrivals',
        'currency': 'SAR',
        'add_to_cart': 'Add to Cart',
        'buy_now': 'Buy Now',
        'out_of_stock': 'Out of Stock',
        'filter_by': 'Filter By',
        'price_range': 'Price Range',
        'brands': 'Brands',
        'apply': 'Apply',
        'clear': 'Clear',
        'delivery_to': 'Deliver to',
        'login': 'Login',
        'help': 'Help',
        'track_order': 'Track Order'
    }
};

type Locale = 'ar' | 'en';

interface LanguageContextType {
    locale: Locale;
    dir: 'rtl' | 'ltr';
    setLocale: (lang: Locale) => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [locale, setLocaleState] = useState<Locale>('ar');

    useEffect(() => {
        // Load from storage
        const saved = localStorage.getItem('NEXT_LOCALE') as Locale;
        if (saved) {
            setLocaleState(saved);
        }
    }, []);

    const setLocale = (lang: Locale) => {
        setLocaleState(lang);
        localStorage.setItem('NEXT_LOCALE', lang);
        // Reload to apply direction changes at html level (or we can just update context)
        // For smoother UX, we can just update context, but html dir needs to change
        document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = lang;
    };

    const t = (key: string) => {
        return (translations[locale] as any)[key] || key;
    };

    const dir = locale === 'ar' ? 'rtl' : 'ltr';

    return (
        <LanguageContext.Provider value={{ locale, dir, setLocale, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) throw new Error('useLanguage must be used within LanguageProvider');
    return context;
};

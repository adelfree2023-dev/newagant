'use client';

import { useLanguage } from "@/context/LanguageContext";
import { Globe } from "lucide-react";

export default function LanguageSwitcher() {
    const { locale, setLocale } = useLanguage();

    return (
        <button
            onClick={() => setLocale(locale === 'ar' ? 'en' : 'ar')}
            className="flex items-center gap-1 hover:text-primary-300 transition-colors text-xs font-medium"
        >
            <Globe className="w-3 h-3" />
            {locale === 'ar' ? 'English' : 'العربية'}
        </button>
    );
}

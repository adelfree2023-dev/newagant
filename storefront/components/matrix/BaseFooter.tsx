'use client';

import { ThemeConfig } from '@/types/theme';
import { Facebook, Instagram, Twitter } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface BaseFooterProps {
    config: ThemeConfig;
}

export default function BaseFooter({ config }: BaseFooterProps) {
    const { layout, colors, typography } = config;
    const { t } = useLanguage();

    // 1. MINIMAL (Fashion, Jewelry)
    if (layout.footer === 'minimal' || layout.footer === 'simple') {
        return (
            <footer className="py-12 border-t" style={{ borderColor: colors.border, backgroundColor: colors.background }}>
                <div className="container mx-auto px-4 flex flex-col items-center text-center">
                    <h2 className="text-2xl font-bold uppercase tracking-widest mb-8" style={{ fontFamily: typography.headingFont }}>{config.name}</h2>
                    <div className="flex gap-8 text-sm uppercase tracking-wider mb-8 opacity-60">
                        <a href="#">{t('shop')}</a>
                        <a href="#">{t('about')}</a>
                        <a href="#">{t('contact')}</a>
                        <a href="#">{t('terms')}</a>
                    </div>
                    <div className="opacity-40 text-xs">
                        &copy; 2024 {config.name}. {t('all_rights_reserved')}
                    </div>
                </div>
            </footer>
        );
    }

    // 2. Newsletter Focused (Beauty, Yoga, Modern)
    if (layout.footer === 'newsletter-focused') {
        return (
            <footer className="py-20 relative overflow-hidden" style={{ backgroundColor: colors.secondary, color: colors.foreground }}>
                <div className="absolute inset-0 opacity-5" style={{ backgroundImage: `radial-gradient(${colors.primary} 1px, transparent 1px)`, backgroundSize: '20px 20px' }}></div>
                <div className="container mx-auto px-4 relative z-10 text-center max-w-2xl">
                    <h3 className="text-3xl md:text-4xl font-black mb-6" style={{ fontFamily: typography.headingFont }}>{t('join_newsletter')}</h3>
                    <p className="mb-10 text-lg opacity-80">
                        {t('newsletter_desc')}
                    </p>
                    <div className="flex flex-col md:flex-row gap-4 mb-12">
                        <input
                            type="email"
                            placeholder={t('enter_email')}
                            className="flex-1 px-6 py-4 rounded-full border-2 bg-transparent focus:outline-none"
                            style={{ borderColor: colors.border }}
                        />
                        <button
                            className="px-10 py-4 rounded-full font-bold uppercase tracking-wider text-white shadow-lg transform hover:scale-105 transition-transform"
                            style={{ backgroundColor: colors.primary }}
                        >
                            {t('subscribe')}
                        </button>
                    </div>
                    <div className="flex justify-center gap-8 opacity-50 text-sm font-bold uppercase tracking-widest">
                        <a href="#" className="hover:text-primary transition-colors">Instagram</a>
                        <a href="#" className="hover:text-primary transition-colors">TikTok</a>
                        <a href="#" className="hover:text-primary transition-colors">Twitter</a>
                    </div>
                </div>
            </footer>
        );
    }

    // 3. Multicolumn / Default
    return (
        <footer className="pt-16 pb-8" style={{ backgroundColor: colors.muted, color: colors.foreground }}>
            <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                <div>
                    <h3 className="text-lg font-bold mb-6 uppercase" style={{ color: colors.primary }}>{config.name}</h3>
                    <p className="opacity-70 text-sm leading-relaxed mb-6">
                        {t('footer_desc')}
                    </p>
                    <div className="flex gap-4">
                        {[Facebook, Instagram, Twitter].map((Icon, i) => (
                            <div key={i} className="w-10 h-10 rounded-full flex items-center justify-center bg-black/5 hover:bg-black/10 transition-colors cursor-pointer">
                                <Icon className="w-4 h-4" />
                            </div>
                        ))}
                    </div>
                </div>

                {[t('shop'), t('support'), t('company')].map(col => (
                    <div key={col}>
                        <h4 className="font-bold mb-6 uppercase text-sm tracking-wider">{col}</h4>
                        <ul className="space-y-3 opacity-70 text-sm">
                            <li>{t('link_one')}</li>
                            <li>{t('link_two')}</li>
                            <li>{t('link_three')}</li>
                        </ul>
                    </div>
                ))}
            </div>

            <div className="container mx-auto px-4 pt-8 border-t border-black/10 text-center md:text-right flex flex-col md:flex-row justify-between items-center opacity-50 text-xs">
                <p>&copy; 2024 {config.name} Inc.</p>
                <div className="flex gap-4 mt-4 md:mt-0">
                    <span>{t('privacy_policy')}</span>
                    <span>{t('terms_of_service')}</span>
                </div>
            </div>
        </footer>
    );
}

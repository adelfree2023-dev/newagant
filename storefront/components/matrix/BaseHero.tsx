'use client';

import { ThemeConfig } from '@/types/theme';
import { useLanguage } from '@/context/LanguageContext';

interface BaseHeroProps {
    config: ThemeConfig;
}

export default function BaseHero({ config }: BaseHeroProps) {
    const { layout, colors, typography, radius } = config;
    const { t } = useLanguage();

    const containerStyle = {
        fontFamily: typography.headingFont === 'serif' ? 'serif' : 'sans-serif',
    };

    // 1. Cover / Full Screen (Fashion, Jewelry)
    if (layout.hero === 'cover') {
        return (
            <div className="relative h-[600px] flex items-center justify-center text-center bg-zinc-900 text-white" style={containerStyle}>
                <div className="z-10 max-w-2xl px-4">
                    <h1 className="text-5xl md:text-7xl font-bold mb-6" style={{ color: colors.primary }}>{config.name}</h1>
                    <p className="text-xl text-zinc-300 mb-8 max-w-lg mx-auto">{t('hero_description') || 'Discover the essence of luxury and style.'}</p>
                    <button
                        className="px-8 py-3 bg-white text-black font-bold tracking-widest uppercase hover:bg-zinc-200 transition-colors"
                        style={{ borderRadius: radius === 'full' ? '999px' : radius === 'lg' ? '0.5rem' : '0' }}
                    >
                        {t('explore')}
                    </button>
                </div>
                <div className="absolute inset-0 bg-black/40"></div>
                <div className="absolute inset-0 z-0 opacity-50 bg-[url('https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80')] bg-cover bg-center"></div>
            </div>
        );
    }

    // 2. Simple / Standard (Grocery)
    if (layout.hero === 'simple') {
        return (
            <div className="py-12" style={{ backgroundColor: colors.muted }}>
                <div className="container mx-auto px-4 flex flex-col md:flex-row items-center gap-8">
                    <div className="flex-1" style={containerStyle}>
                        <h1 className="text-4xl md:text-6xl font-black mb-4" style={{ color: colors.foreground }}>
                            {t('fresh_organic')} <br />
                            <span style={{ color: colors.primary }}>{t('delivered')}</span>
                        </h1>
                        <p className="text-lg text-zinc-600 mb-8">{t('hero_description')}</p>
                        <div className="flex gap-4">
                            <button
                                className="px-8 py-4 text-white font-bold"
                                style={{ backgroundColor: colors.primary, borderRadius: radius === 'lg' ? '1rem' : '0' }}
                            >
                                {t('shop_now')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // 3. Split (Automotive, Tech - Text Left, Image Right)
    if (layout.hero === 'split') {
        return (
            <div className="relative overflow-hidden" style={{ backgroundColor: colors.background }}>
                <div className="absolute top-0 right-0 w-1/2 h-full hidden lg:block bg-zinc-800">
                    <img
                        src="https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&q=80"
                        alt="Hero"
                        className="w-full h-full object-cover opacity-80 mix-blend-overlay"
                    />
                </div>

                <div className="container mx-auto px-4 py-24 relative z-10">
                    <div className="max-w-xl">
                        <div className="inline-block px-3 py-1 mb-6 text-xs font-bold uppercase tracking-widest border" style={{ color: colors.primary, borderColor: colors.primary }}>
                            {t('new_arrival')}
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black mb-8 leading-tight" style={{ color: colors.foreground }}>
                            {t('next_level')} <br />
                            <span style={{ color: colors.primary }}>{t('performance')}</span>
                        </h1>
                        <p className="text-lg opacity-70 mb-10 max-w-md" style={{ color: colors.foreground }}>
                            {t('hero_description')}
                        </p>
                        <button className="px-8 py-4 font-bold text-white uppercase tracking-wider" style={{ backgroundColor: colors.primary, borderRadius: radius === 'lg' ? '0.5rem' : '0' }}>
                            {t('shop_collection')}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // 4. Video / Immersive (Gaming, Sports)
    if (layout.hero === 'video') {
        return (
            <div className="relative h-[700px] flex items-center justify-center overflow-hidden bg-black">
                <div className="absolute inset-0 opacity-50">
                    <img
                        src="https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80"
                        className="w-full h-full object-cover blur-sm scale-110"
                        alt="Background"
                    />
                </div>

                <div className="relative z-10 text-center text-white px-4">
                    <h1 className="text-6xl md:text-9xl font-black tracking-tighter mb-4 italic" style={{ textShadow: `0 0 40px ${colors.primary}` }}>
                        {config.name}
                    </h1>
                    <p className="text-2xl font-bold uppercase tracking-[1em] mb-12 opacity-80">
                        {t('no_limits')}
                    </p>
                    <button
                        className="px-12 py-4 text-xl font-bold uppercase tracking-widest border-2 hover:bg-white hover:text-black transition-all duration-300"
                        style={{ borderColor: colors.primary, color: 'white' }}
                    >
                        {t('start_game')}
                    </button>
                </div>
            </div>
        );
    }

    return null;
}

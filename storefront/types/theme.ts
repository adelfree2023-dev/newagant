/**
 * Theme Configuration Types for Matrix 2.0
 * Used by BaseHeader, BaseHero, BaseFooter to determine component rendering
 */

export interface ThemeLayout {
    header: 'centered' | 'minimal' | 'search-heavy' | 'standard' | 'imbalanced';
    hero: 'cover' | 'simple' | 'split' | 'video' | 'carousel';
    footer: 'minimal' | 'simple' | 'newsletter-focused' | 'multicolumn';
    productCard: 'minimal' | 'detailed' | 'imageFirst';
}

export interface ThemeColors {
    primary: string;
    secondary: string;
    background: string;
    foreground: string;
    muted: string;
    border: string;
    accent?: string;
}

export interface ThemeTypography {
    headingFont: 'serif' | 'sans-serif' | 'display';
    bodyFont: 'serif' | 'sans-serif';
    headingWeight: 'bold' | 'black' | 'normal';
}

export type ThemeRadius = 'none' | 'sm' | 'lg' | 'full';

export interface ThemeConfig {
    id: string;
    name: string;
    niche: string;
    layout: ThemeLayout;
    colors: ThemeColors;
    typography: ThemeTypography;
    radius: ThemeRadius;
    isPremium?: boolean;
}

// Pre-defined Theme Presets
export const THEME_PRESETS: Record<string, Partial<ThemeConfig>> = {
    'modern': {
        layout: { header: 'standard', hero: 'simple', footer: 'multicolumn', productCard: 'detailed' },
        colors: { primary: '#4f46e5', secondary: '#f97316', background: '#ffffff', foreground: '#09090b', muted: '#f4f4f5', border: '#e4e4e7' },
        typography: { headingFont: 'sans-serif', bodyFont: 'sans-serif', headingWeight: 'bold' },
        radius: 'lg',
    },
    'fashion': {
        layout: { header: 'minimal', hero: 'cover', footer: 'minimal', productCard: 'imageFirst' },
        colors: { primary: '#000000', secondary: '#ffffff', background: '#ffffff', foreground: '#000000', muted: '#f8f8f8', border: '#e0e0e0' },
        typography: { headingFont: 'serif', bodyFont: 'sans-serif', headingWeight: 'normal' },
        radius: 'none',
    },
    'electronics': {
        layout: { header: 'search-heavy', hero: 'split', footer: 'multicolumn', productCard: 'detailed' },
        colors: { primary: '#1e3a8a', secondary: '#facc15', background: '#ffffff', foreground: '#1e293b', muted: '#f1f5f9', border: '#cbd5e1' },
        typography: { headingFont: 'sans-serif', bodyFont: 'sans-serif', headingWeight: 'bold' },
        radius: 'sm',
    },
    'automotive': {
        layout: { header: 'imbalanced', hero: 'split', footer: 'multicolumn', productCard: 'detailed' },
        colors: { primary: '#ef4444', secondary: '#facc15', background: '#09090b', foreground: '#ffffff', muted: '#18181b', border: '#27272a' },
        typography: { headingFont: 'sans-serif', bodyFont: 'sans-serif', headingWeight: 'black' },
        radius: 'none',
    },
    'grocery': {
        layout: { header: 'search-heavy', hero: 'simple', footer: 'newsletter-focused', productCard: 'minimal' },
        colors: { primary: '#16a34a', secondary: '#f97316', background: '#ffffff', foreground: '#166534', muted: '#dcfce7', border: '#bbf7d0' },
        typography: { headingFont: 'sans-serif', bodyFont: 'sans-serif', headingWeight: 'bold' },
        radius: 'lg',
    },
    'gaming': {
        layout: { header: 'imbalanced', hero: 'video', footer: 'minimal', productCard: 'imageFirst' },
        colors: { primary: '#8b5cf6', secondary: '#06b6d4', background: '#000000', foreground: '#ffffff', muted: '#1e1e1e', border: '#333333' },
        typography: { headingFont: 'display', bodyFont: 'sans-serif', headingWeight: 'black' },
        radius: 'none',
    },
};

export function getThemeConfig(themeId: string): ThemeConfig {
    const preset = THEME_PRESETS[themeId] || THEME_PRESETS['modern'];
    return {
        id: themeId,
        name: themeId.charAt(0).toUpperCase() + themeId.slice(1),
        niche: themeId,
        layout: preset.layout as ThemeLayout,
        colors: preset.colors as ThemeColors,
        typography: preset.typography as ThemeTypography,
        radius: preset.radius as ThemeRadius,
    };
}

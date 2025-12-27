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

// Pre-defined Theme Presets (50 Themes)
export const THEME_PRESETS: Record<string, Partial<ThemeConfig>> = {
    // === GENERAL PURPOSE ===
    'modern': {
        layout: { header: 'standard', hero: 'simple', footer: 'multicolumn', productCard: 'detailed' },
        colors: { primary: '#4f46e5', secondary: '#f97316', background: '#ffffff', foreground: '#09090b', muted: '#f4f4f5', border: '#e4e4e7' },
        typography: { headingFont: 'sans-serif', bodyFont: 'sans-serif', headingWeight: 'bold' },
        radius: 'lg',
    },
    'classic': {
        layout: { header: 'search-heavy', hero: 'simple', footer: 'multicolumn', productCard: 'detailed' },
        colors: { primary: '#131921', secondary: '#febd69', background: '#ffffff', foreground: '#0f1111', muted: '#f7f8f8', border: '#ddd' },
        typography: { headingFont: 'sans-serif', bodyFont: 'sans-serif', headingWeight: 'bold' },
        radius: 'sm',
    },
    'minimal': {
        layout: { header: 'minimal', hero: 'cover', footer: 'minimal', productCard: 'imageFirst' },
        colors: { primary: '#18181b', secondary: '#71717a', background: '#ffffff', foreground: '#09090b', muted: '#fafafa', border: '#e4e4e7' },
        typography: { headingFont: 'sans-serif', bodyFont: 'sans-serif', headingWeight: 'normal' },
        radius: 'none',
    },
    'dark': {
        layout: { header: 'standard', hero: 'split', footer: 'multicolumn', productCard: 'detailed' },
        colors: { primary: '#3b82f6', secondary: '#f59e0b', background: '#0a0a0a', foreground: '#fafafa', muted: '#171717', border: '#262626' },
        typography: { headingFont: 'sans-serif', bodyFont: 'sans-serif', headingWeight: 'bold' },
        radius: 'lg',
    },
    // === FASHION & LUXURY ===
    'fashion': {
        layout: { header: 'minimal', hero: 'cover', footer: 'minimal', productCard: 'imageFirst' },
        colors: { primary: '#000000', secondary: '#ffffff', background: '#ffffff', foreground: '#000000', muted: '#f8f8f8', border: '#e0e0e0' },
        typography: { headingFont: 'serif', bodyFont: 'sans-serif', headingWeight: 'normal' },
        radius: 'none',
    },
    'luxury': {
        layout: { header: 'centered', hero: 'cover', footer: 'minimal', productCard: 'imageFirst' },
        colors: { primary: '#b8860b', secondary: '#1a1a1a', background: '#0d0d0d', foreground: '#f5f5f5', muted: '#1a1a1a', border: '#333' },
        typography: { headingFont: 'serif', bodyFont: 'serif', headingWeight: 'normal' },
        radius: 'none', isPremium: true,
    },
    'boutique': {
        layout: { header: 'centered', hero: 'cover', footer: 'newsletter-focused', productCard: 'imageFirst' },
        colors: { primary: '#ec4899', secondary: '#f472b6', background: '#fdf2f8', foreground: '#831843', muted: '#fce7f3', border: '#f9a8d4' },
        typography: { headingFont: 'serif', bodyFont: 'sans-serif', headingWeight: 'normal' },
        radius: 'lg',
    },
    'streetwear': {
        layout: { header: 'imbalanced', hero: 'video', footer: 'minimal', productCard: 'imageFirst' },
        colors: { primary: '#ef4444', secondary: '#fbbf24', background: '#000000', foreground: '#ffffff', muted: '#1c1c1c', border: '#333' },
        typography: { headingFont: 'sans-serif', bodyFont: 'sans-serif', headingWeight: 'black' },
        radius: 'none',
    },
    // === ELECTRONICS & TECH ===
    'electronics': {
        layout: { header: 'search-heavy', hero: 'split', footer: 'multicolumn', productCard: 'detailed' },
        colors: { primary: '#1e3a8a', secondary: '#facc15', background: '#ffffff', foreground: '#1e293b', muted: '#f1f5f9', border: '#cbd5e1' },
        typography: { headingFont: 'sans-serif', bodyFont: 'sans-serif', headingWeight: 'bold' },
        radius: 'sm',
    },
    'tech': {
        layout: { header: 'standard', hero: 'split', footer: 'multicolumn', productCard: 'detailed' },
        colors: { primary: '#06b6d4', secondary: '#8b5cf6', background: '#0f172a', foreground: '#f8fafc', muted: '#1e293b', border: '#334155' },
        typography: { headingFont: 'sans-serif', bodyFont: 'sans-serif', headingWeight: 'bold' },
        radius: 'lg',
    },
    'gadgets': {
        layout: { header: 'search-heavy', hero: 'simple', footer: 'multicolumn', productCard: 'detailed' },
        colors: { primary: '#7c3aed', secondary: '#22d3ee', background: '#ffffff', foreground: '#1f2937', muted: '#f3f4f6', border: '#d1d5db' },
        typography: { headingFont: 'sans-serif', bodyFont: 'sans-serif', headingWeight: 'bold' },
        radius: 'lg',
    },
    // === AUTOMOTIVE ===
    'automotive': {
        layout: { header: 'imbalanced', hero: 'split', footer: 'multicolumn', productCard: 'detailed' },
        colors: { primary: '#ef4444', secondary: '#facc15', background: '#09090b', foreground: '#ffffff', muted: '#18181b', border: '#27272a' },
        typography: { headingFont: 'sans-serif', bodyFont: 'sans-serif', headingWeight: 'black' },
        radius: 'none',
    },
    'motorcycle': {
        layout: { header: 'imbalanced', hero: 'video', footer: 'minimal', productCard: 'imageFirst' },
        colors: { primary: '#f97316', secondary: '#000000', background: '#1c1917', foreground: '#fafaf9', muted: '#292524', border: '#44403c' },
        typography: { headingFont: 'sans-serif', bodyFont: 'sans-serif', headingWeight: 'black' },
        radius: 'none',
    },
    'carparts': {
        layout: { header: 'search-heavy', hero: 'split', footer: 'multicolumn', productCard: 'detailed' },
        colors: { primary: '#dc2626', secondary: '#fbbf24', background: '#18181b', foreground: '#f4f4f5', muted: '#27272a', border: '#3f3f46' },
        typography: { headingFont: 'sans-serif', bodyFont: 'sans-serif', headingWeight: 'bold' },
        radius: 'sm',
    },
    // === FOOD & GROCERY ===
    'grocery': {
        layout: { header: 'search-heavy', hero: 'simple', footer: 'newsletter-focused', productCard: 'minimal' },
        colors: { primary: '#16a34a', secondary: '#f97316', background: '#ffffff', foreground: '#166534', muted: '#dcfce7', border: '#bbf7d0' },
        typography: { headingFont: 'sans-serif', bodyFont: 'sans-serif', headingWeight: 'bold' },
        radius: 'lg',
    },
    'organic': {
        layout: { header: 'centered', hero: 'simple', footer: 'newsletter-focused', productCard: 'minimal' },
        colors: { primary: '#84cc16', secondary: '#a3e635', background: '#fefce8', foreground: '#365314', muted: '#ecfccb', border: '#d9f99d' },
        typography: { headingFont: 'serif', bodyFont: 'sans-serif', headingWeight: 'normal' },
        radius: 'lg',
    },
    'restaurant': {
        layout: { header: 'centered', hero: 'cover', footer: 'minimal', productCard: 'imageFirst' },
        colors: { primary: '#dc2626', secondary: '#fbbf24', background: '#1c1917', foreground: '#fafaf9', muted: '#292524', border: '#44403c' },
        typography: { headingFont: 'serif', bodyFont: 'sans-serif', headingWeight: 'bold' },
        radius: 'lg',
    },
    'bakery': {
        layout: { header: 'centered', hero: 'simple', footer: 'newsletter-focused', productCard: 'imageFirst' },
        colors: { primary: '#d97706', secondary: '#fbbf24', background: '#fffbeb', foreground: '#78350f', muted: '#fef3c7', border: '#fcd34d' },
        typography: { headingFont: 'serif', bodyFont: 'serif', headingWeight: 'normal' },
        radius: 'lg',
    },
    // === GAMING & ENTERTAINMENT ===
    'gaming': {
        layout: { header: 'imbalanced', hero: 'video', footer: 'minimal', productCard: 'imageFirst' },
        colors: { primary: '#8b5cf6', secondary: '#06b6d4', background: '#000000', foreground: '#ffffff', muted: '#1e1e1e', border: '#333333' },
        typography: { headingFont: 'display', bodyFont: 'sans-serif', headingWeight: 'black' },
        radius: 'none',
    },
    'esports': {
        layout: { header: 'imbalanced', hero: 'video', footer: 'minimal', productCard: 'imageFirst' },
        colors: { primary: '#10b981', secondary: '#f43f5e', background: '#030712', foreground: '#f9fafb', muted: '#111827', border: '#1f2937' },
        typography: { headingFont: 'sans-serif', bodyFont: 'sans-serif', headingWeight: 'black' },
        radius: 'none', isPremium: true,
    },
    'toys': {
        layout: { header: 'standard', hero: 'simple', footer: 'multicolumn', productCard: 'detailed' },
        colors: { primary: '#f43f5e', secondary: '#fbbf24', background: '#fef2f2', foreground: '#881337', muted: '#ffe4e6', border: '#fda4af' },
        typography: { headingFont: 'sans-serif', bodyFont: 'sans-serif', headingWeight: 'bold' },
        radius: 'full',
    },
    // === HEALTH & BEAUTY ===
    'beauty': {
        layout: { header: 'centered', hero: 'cover', footer: 'newsletter-focused', productCard: 'imageFirst' },
        colors: { primary: '#ec4899', secondary: '#a855f7', background: '#fdf4ff', foreground: '#86198f', muted: '#fae8ff', border: '#f0abfc' },
        typography: { headingFont: 'serif', bodyFont: 'sans-serif', headingWeight: 'normal' },
        radius: 'lg',
    },
    'skincare': {
        layout: { header: 'minimal', hero: 'cover', footer: 'newsletter-focused', productCard: 'imageFirst' },
        colors: { primary: '#14b8a6', secondary: '#f0fdfa', background: '#ffffff', foreground: '#134e4a', muted: '#ccfbf1', border: '#99f6e4' },
        typography: { headingFont: 'serif', bodyFont: 'sans-serif', headingWeight: 'normal' },
        radius: 'lg',
    },
    'pharmacy': {
        layout: { header: 'search-heavy', hero: 'simple', footer: 'multicolumn', productCard: 'detailed' },
        colors: { primary: '#0ea5e9', secondary: '#22c55e', background: '#ffffff', foreground: '#0c4a6e', muted: '#f0f9ff', border: '#bae6fd' },
        typography: { headingFont: 'sans-serif', bodyFont: 'sans-serif', headingWeight: 'bold' },
        radius: 'sm',
    },
    'fitness': {
        layout: { header: 'imbalanced', hero: 'video', footer: 'multicolumn', productCard: 'detailed' },
        colors: { primary: '#f97316', secondary: '#84cc16', background: '#171717', foreground: '#fafafa', muted: '#262626', border: '#404040' },
        typography: { headingFont: 'sans-serif', bodyFont: 'sans-serif', headingWeight: 'black' },
        radius: 'sm',
    },
    // === HOME & FURNITURE ===
    'furniture': {
        layout: { header: 'centered', hero: 'cover', footer: 'multicolumn', productCard: 'imageFirst' },
        colors: { primary: '#78716c', secondary: '#d6d3d1', background: '#fafaf9', foreground: '#292524', muted: '#f5f5f4', border: '#e7e5e4' },
        typography: { headingFont: 'serif', bodyFont: 'sans-serif', headingWeight: 'normal' },
        radius: 'sm',
    },
    'homedecor': {
        layout: { header: 'minimal', hero: 'cover', footer: 'newsletter-focused', productCard: 'imageFirst' },
        colors: { primary: '#a3a3a3', secondary: '#d4d4d4', background: '#fafafa', foreground: '#262626', muted: '#f5f5f5', border: '#e5e5e5' },
        typography: { headingFont: 'serif', bodyFont: 'sans-serif', headingWeight: 'normal' },
        radius: 'none',
    },
    'kitchen': {
        layout: { header: 'search-heavy', hero: 'simple', footer: 'multicolumn', productCard: 'detailed' },
        colors: { primary: '#059669', secondary: '#fbbf24', background: '#ffffff', foreground: '#064e3b', muted: '#ecfdf5', border: '#a7f3d0' },
        typography: { headingFont: 'sans-serif', bodyFont: 'sans-serif', headingWeight: 'bold' },
        radius: 'lg',
    },
    // === SPORTS & OUTDOOR ===
    'sports': {
        layout: { header: 'standard', hero: 'split', footer: 'multicolumn', productCard: 'detailed' },
        colors: { primary: '#2563eb', secondary: '#f97316', background: '#ffffff', foreground: '#1e3a8a', muted: '#eff6ff', border: '#bfdbfe' },
        typography: { headingFont: 'sans-serif', bodyFont: 'sans-serif', headingWeight: 'bold' },
        radius: 'lg',
    },
    'outdoor': {
        layout: { header: 'standard', hero: 'cover', footer: 'multicolumn', productCard: 'detailed' },
        colors: { primary: '#15803d', secondary: '#eab308', background: '#f0fdf4', foreground: '#14532d', muted: '#dcfce7', border: '#86efac' },
        typography: { headingFont: 'sans-serif', bodyFont: 'sans-serif', headingWeight: 'bold' },
        radius: 'sm',
    },
    'camping': {
        layout: { header: 'standard', hero: 'split', footer: 'multicolumn', productCard: 'detailed' },
        colors: { primary: '#854d0e', secondary: '#16a34a', background: '#fefce8', foreground: '#422006', muted: '#fef9c3', border: '#fde047' },
        typography: { headingFont: 'sans-serif', bodyFont: 'sans-serif', headingWeight: 'bold' },
        radius: 'sm',
    },
    // === KIDS & BABIES ===
    'kids': {
        layout: { header: 'standard', hero: 'simple', footer: 'multicolumn', productCard: 'detailed' },
        colors: { primary: '#06b6d4', secondary: '#f43f5e', background: '#ecfeff', foreground: '#164e63', muted: '#cffafe', border: '#67e8f9' },
        typography: { headingFont: 'sans-serif', bodyFont: 'sans-serif', headingWeight: 'bold' },
        radius: 'full',
    },
    'baby': {
        layout: { header: 'centered', hero: 'simple', footer: 'newsletter-focused', productCard: 'imageFirst' },
        colors: { primary: '#fb7185', secondary: '#a5b4fc', background: '#fff1f2', foreground: '#9f1239', muted: '#ffe4e6', border: '#fda4af' },
        typography: { headingFont: 'serif', bodyFont: 'sans-serif', headingWeight: 'normal' },
        radius: 'full',
    },
    // === BOOKS & EDUCATION ===
    'bookstore': {
        layout: { header: 'search-heavy', hero: 'simple', footer: 'multicolumn', productCard: 'detailed' },
        colors: { primary: '#7c2d12', secondary: '#fbbf24', background: '#fffbeb', foreground: '#451a03', muted: '#fef3c7', border: '#fcd34d' },
        typography: { headingFont: 'serif', bodyFont: 'serif', headingWeight: 'normal' },
        radius: 'sm',
    },
    'education': {
        layout: { header: 'standard', hero: 'simple', footer: 'multicolumn', productCard: 'detailed' },
        colors: { primary: '#4f46e5', secondary: '#10b981', background: '#ffffff', foreground: '#312e81', muted: '#eef2ff', border: '#c7d2fe' },
        typography: { headingFont: 'sans-serif', bodyFont: 'sans-serif', headingWeight: 'bold' },
        radius: 'lg',
    },
    // === PETS ===
    'pets': {
        layout: { header: 'standard', hero: 'simple', footer: 'newsletter-focused', productCard: 'detailed' },
        colors: { primary: '#f97316', secondary: '#22c55e', background: '#fff7ed', foreground: '#7c2d12', muted: '#ffedd5', border: '#fed7aa' },
        typography: { headingFont: 'sans-serif', bodyFont: 'sans-serif', headingWeight: 'bold' },
        radius: 'full',
    },
    // === JEWELRY & ACCESSORIES ===
    'jewelry': {
        layout: { header: 'centered', hero: 'cover', footer: 'minimal', productCard: 'imageFirst' },
        colors: { primary: '#d4af37', secondary: '#1c1917', background: '#0c0a09', foreground: '#fafaf9', muted: '#1c1917', border: '#292524' },
        typography: { headingFont: 'serif', bodyFont: 'serif', headingWeight: 'normal' },
        radius: 'none', isPremium: true,
    },
    'watches': {
        layout: { header: 'minimal', hero: 'cover', footer: 'minimal', productCard: 'imageFirst' },
        colors: { primary: '#a3a3a3', secondary: '#d4d4d4', background: '#0a0a0a', foreground: '#fafafa', muted: '#171717', border: '#262626' },
        typography: { headingFont: 'serif', bodyFont: 'sans-serif', headingWeight: 'normal' },
        radius: 'none', isPremium: true,
    },
    // === SERVICES ===
    'services': {
        layout: { header: 'standard', hero: 'split', footer: 'multicolumn', productCard: 'detailed' },
        colors: { primary: '#0891b2', secondary: '#f59e0b', background: '#ffffff', foreground: '#164e63', muted: '#ecfeff', border: '#a5f3fc' },
        typography: { headingFont: 'sans-serif', bodyFont: 'sans-serif', headingWeight: 'bold' },
        radius: 'lg',
    },
    // === REGIONAL THEMES ===
    'arabic': {
        layout: { header: 'standard', hero: 'simple', footer: 'multicolumn', productCard: 'detailed' },
        colors: { primary: '#059669', secondary: '#d4af37', background: '#fefce8', foreground: '#064e3b', muted: '#ecfdf5', border: '#a7f3d0' },
        typography: { headingFont: 'serif', bodyFont: 'sans-serif', headingWeight: 'bold' },
        radius: 'lg',
    },
    'ramadan': {
        layout: { header: 'centered', hero: 'cover', footer: 'newsletter-focused', productCard: 'imageFirst' },
        colors: { primary: '#d4af37', secondary: '#059669', background: '#1e1b4b', foreground: '#f5f3ff', muted: '#312e81', border: '#4c1d95' },
        typography: { headingFont: 'serif', bodyFont: 'sans-serif', headingWeight: 'normal' },
        radius: 'lg', isPremium: true,
    },
    // === SEASONAL ===
    'summer': {
        layout: { header: 'standard', hero: 'cover', footer: 'newsletter-focused', productCard: 'imageFirst' },
        colors: { primary: '#0ea5e9', secondary: '#fbbf24', background: '#f0f9ff', foreground: '#0c4a6e', muted: '#e0f2fe', border: '#7dd3fc' },
        typography: { headingFont: 'sans-serif', bodyFont: 'sans-serif', headingWeight: 'bold' },
        radius: 'full',
    },
    'winter': {
        layout: { header: 'standard', hero: 'cover', footer: 'multicolumn', productCard: 'detailed' },
        colors: { primary: '#3b82f6', secondary: '#e2e8f0', background: '#1e293b', foreground: '#f1f5f9', muted: '#334155', border: '#475569' },
        typography: { headingFont: 'sans-serif', bodyFont: 'sans-serif', headingWeight: 'bold' },
        radius: 'lg',
    },
    // === SPECIALTY ===
    'handmade': {
        layout: { header: 'centered', hero: 'cover', footer: 'newsletter-focused', productCard: 'imageFirst' },
        colors: { primary: '#b45309', secondary: '#78716c', background: '#fffbeb', foreground: '#78350f', muted: '#fef3c7', border: '#fcd34d' },
        typography: { headingFont: 'serif', bodyFont: 'serif', headingWeight: 'normal' },
        radius: 'sm',
    },
    'vintage': {
        layout: { header: 'centered', hero: 'cover', footer: 'minimal', productCard: 'imageFirst' },
        colors: { primary: '#78716c', secondary: '#a8a29e', background: '#fafaf9', foreground: '#44403c', muted: '#f5f5f4', border: '#d6d3d1' },
        typography: { headingFont: 'serif', bodyFont: 'serif', headingWeight: 'normal' },
        radius: 'sm',
    },
    'art': {
        layout: { header: 'minimal', hero: 'cover', footer: 'minimal', productCard: 'imageFirst' },
        colors: { primary: '#000000', secondary: '#ef4444', background: '#ffffff', foreground: '#000000', muted: '#fafafa', border: '#e5e5e5' },
        typography: { headingFont: 'serif', bodyFont: 'sans-serif', headingWeight: 'normal' },
        radius: 'none',
    },
    'music': {
        layout: { header: 'imbalanced', hero: 'video', footer: 'minimal', productCard: 'imageFirst' },
        colors: { primary: '#f43f5e', secondary: '#a855f7', background: '#0f0f0f', foreground: '#ffffff', muted: '#1a1a1a', border: '#333' },
        typography: { headingFont: 'sans-serif', bodyFont: 'sans-serif', headingWeight: 'black' },
        radius: 'none',
    },
    'photography': {
        layout: { header: 'minimal', hero: 'cover', footer: 'minimal', productCard: 'imageFirst' },
        colors: { primary: '#18181b', secondary: '#f4f4f5', background: '#000000', foreground: '#ffffff', muted: '#18181b', border: '#27272a' },
        typography: { headingFont: 'sans-serif', bodyFont: 'sans-serif', headingWeight: 'normal' },
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

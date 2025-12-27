export interface ThemeMetadata {
    id: string;
    name: string;
    description: string;
    colors: string[];
    features: string[];
    isPremium?: boolean;
    // 🔧 Matrix Configuration
    config: {
        header: 'v1' | 'v2' | 'v3';
        footer: 'v1' | 'v2';
        productCard: 'v1' | 'v2';
        colorInvert?: boolean;
    };
}

export const THEME_REGISTRY: ThemeMetadata[] = [
    {
        id: 'modern',
        name: 'العصري (Modern)',
        description: 'تصميم حديث وأنيق يركز على الصور الكبيرة.',
        colors: ['#4f46e5', '#ffffff', '#f3f4f6'],
        features: ['هيدر شفاف', 'صور كبيرة'],
        config: { header: 'v1', footer: 'v1', productCard: 'v1' }
    },
    {
        id: 'classic',
        name: 'الكلاسيكي (Classic)',
        description: 'تصميم تقليدي موثوق مشابه للمتاجر العالمية.',
        colors: ['#131921', '#febd69', '#ffffff'],
        features: ['شريط داكن', 'عرض كثيف'],
        config: { header: 'v2', footer: 'v2', productCard: 'v1' }
    },
    {
        id: 'automotive',
        name: 'قطاع السيارات (TurboGear)',
        description: 'ثيم داكن رياضي مخصص لمعارض السيارات.',
        colors: ['#ef4444', '#09090b', '#ffffff'],
        features: ['Spec Search', 'Dark Mode'],
        config: { header: 'v3', footer: 'v2', productCard: 'v2' }
    },
    {
        id: 'electronics',
        name: 'الإلكترونيات (TechMart)',
        description: 'تصميم تقني عالي الكثافة للمتاجر الكبرى.',
        colors: ['#1e3a8a', '#facc15', '#ffffff'],
        features: ['Dense Menu', 'Search Focus'],
        config: { header: 'v4', footer: 'v2', productCard: 'v1' }
    },
    {
        id: 'fashion',
        name: 'الأزياء (ZaraStyle)',
        description: 'تصميم مينيماليست يركز على الصور وتجربة الماركة.',
        colors: ['#000000', '#ffffff', '#ffffff'],
        features: ['Serif Fonts', 'Wide Layout'],
        config: { header: 'v5', footer: 'v1', productCard: 'v2' }
    }
];

export function getThemeMetadata(id: string) {
    return THEME_REGISTRY.find(t => t.id === id) || THEME_REGISTRY[0];
}

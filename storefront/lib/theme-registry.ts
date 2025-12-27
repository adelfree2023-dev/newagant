export interface ThemeMetadata {
    id: string;
    name: string;
    description: string;
    colors: string[];
    features: string[];
    isPremium?: boolean;
}

export const THEME_REGISTRY: ThemeMetadata[] = [
    {
        id: 'modern',
        name: 'العصري (Modern)',
        description: 'تصميم حديث وأنيق يركز على الصور الكبيرة والتجربة البصرية.',
        colors: ['#4f46e5', '#ffffff', '#f3f4f6'],
        features: ['هيدر شفاف', 'صور كبيرة', 'قائمة جانبية'],
    },
    {
        id: 'classic',
        name: 'الكلاسيكي (Classic)',
        description: 'تصميم تقليدي موثوق مشابه للمتاجر العالمية الكبرى.',
        colors: ['#131921', '#febd69', '#ffffff'],
        features: ['شريط داكن', 'عرض بيانات كثيف', 'تركيز على البحث'],
    },
    // Add your 50 themes here easily...
    // { id: 'minimal', name: 'Minimal', ... },
    // { id: 'luxury', name: 'Luxury', ... },
    // { id: 'dark', name: 'Dark Mode', ... },
];

export function getThemeMetadata(id: string) {
    return THEME_REGISTRY.find(t => t.id === id) || THEME_REGISTRY[0];
}

/**
 * Widget System Types
 * Defines the structure for homepage customization widgets
 */

// Widget Types Available
export type WidgetType =
    | 'hero'           // Main banner/slider
    | 'featured'       // Featured products grid
    | 'categories'     // Category showcase
    | 'banner'         // Promotional banner
    | 'testimonials'   // Customer reviews
    | 'brands'         // Brand logos
    | 'newsletter'     // Newsletter signup
    | 'countdown'      // Sale countdown timer
    | 'instagram'      // Instagram feed
    | 'video'          // Video embed
    | 'custom_html';   // Custom HTML/Rich text

// Base Widget Configuration
export interface BaseWidget {
    id: string;
    type: WidgetType;
    title?: string;
    title_en?: string;
    enabled: boolean;
    sort_order: number;
    settings: Record<string, any>;
}

// Hero Widget
export interface HeroWidget extends BaseWidget {
    type: 'hero';
    settings: {
        slides: Array<{
            id: string;
            image: string;
            title: string;
            subtitle?: string;
            cta_text?: string;
            cta_link?: string;
            overlay_color?: string;
        }>;
        autoplay: boolean;
        interval: number; // in ms
        height: 'small' | 'medium' | 'large' | 'full';
        style: 'default' | 'split' | 'minimal';
    };
}

// Featured Products Widget
export interface FeaturedWidget extends BaseWidget {
    type: 'featured';
    settings: {
        product_ids?: string[];       // Specific products
        category_id?: string;          // From category
        limit: number;
        display: 'grid' | 'carousel' | 'list';
        columns: 2 | 3 | 4 | 5;
        show_price: boolean;
        show_rating: boolean;
        show_add_to_cart: boolean;
    };
}

// Banner Widget
export interface BannerWidget extends BaseWidget {
    type: 'banner';
    settings: {
        image: string;
        link?: string;
        aspect_ratio: '16:9' | '21:9' | '4:3' | 'auto';
        text?: string;
        text_position: 'left' | 'center' | 'right';
        background_color?: string;
        text_color?: string;
    };
}

// Categories Widget
export interface CategoriesWidget extends BaseWidget {
    type: 'categories';
    settings: {
        category_ids?: string[];  // Specific or all if empty
        display: 'grid' | 'carousel' | 'list';
        show_count: boolean;
        columns: 3 | 4 | 6;
        style: 'cards' | 'minimal' | 'overlay';
    };
}

// Countdown Widget
export interface CountdownWidget extends BaseWidget {
    type: 'countdown';
    settings: {
        end_date: string;  // ISO string
        title: string;
        background_image?: string;
        background_color?: string;
        link?: string;
    };
}

// Union type for all widgets
export type Widget =
    | HeroWidget
    | FeaturedWidget
    | BannerWidget
    | CategoriesWidget
    | CountdownWidget
    | BaseWidget;

// Homepage Configuration
export interface HomepageConfig {
    widgets: Widget[];
    theme_overrides?: Record<string, any>;
}

// Default Widget Templates
export const DEFAULT_WIDGETS: Widget[] = [
    {
        id: 'hero-1',
        type: 'hero',
        title: 'البانر الرئيسي',
        enabled: true,
        sort_order: 1,
        settings: {
            slides: [
                {
                    id: 'slide-1',
                    image: '/placeholder-hero.jpg',
                    title: 'عروض لا تُفوّت',
                    subtitle: 'خصم يصل إلى 50%',
                    cta_text: 'تسوق الآن',
                    cta_link: '/category/offers'
                }
            ],
            autoplay: true,
            interval: 5000,
            height: 'large',
            style: 'default'
        }
    },
    {
        id: 'featured-1',
        type: 'featured',
        title: 'المنتجات المميزة',
        enabled: true,
        sort_order: 2,
        settings: {
            limit: 8,
            display: 'grid',
            columns: 4,
            show_price: true,
            show_rating: true,
            show_add_to_cart: true
        }
    },
    {
        id: 'categories-1',
        type: 'categories',
        title: 'تسوق حسب التصنيف',
        enabled: true,
        sort_order: 3,
        settings: {
            display: 'carousel',
            show_count: true,
            columns: 6,
            style: 'cards'
        }
    },
    {
        id: 'banner-1',
        type: 'banner',
        title: 'بانر إعلاني',
        enabled: true,
        sort_order: 4,
        settings: {
            image: '/placeholder-banner.jpg',
            aspect_ratio: '21:9',
            text: 'شحن مجاني للطلبات فوق 200 ريال',
            text_position: 'center'
        }
    }
];

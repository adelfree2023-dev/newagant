'use client';

/**
 * WidgetRenderer - Dynamic Homepage Widget System
 * Renders widgets based on configuration from the backend
 */

import { Widget, WidgetType } from '@/types/widget';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

// Dynamic imports for each widget type
const widgetComponents: Record<WidgetType, React.ComponentType<{ widget: Widget }>> = {
    hero: dynamic(() => import('./widgets/HeroWidget'), { loading: () => <WidgetLoader /> }),
    featured: dynamic(() => import('./widgets/FeaturedWidget'), { loading: () => <WidgetLoader /> }),
    banner: dynamic(() => import('./widgets/BannerWidget'), { loading: () => <WidgetLoader /> }),
    categories: dynamic(() => import('./widgets/CategoriesWidget'), { loading: () => <WidgetLoader /> }),
    countdown: dynamic(() => import('./widgets/CountdownWidget'), { loading: () => <WidgetLoader /> }),
    testimonials: dynamic(() => import('./widgets/TestimonialsWidget'), { loading: () => <WidgetLoader /> }),
    brands: dynamic(() => import('./widgets/BrandsWidget'), { loading: () => <WidgetLoader /> }),
    newsletter: dynamic(() => import('./widgets/NewsletterWidget'), { loading: () => <WidgetLoader /> }),
    instagram: dynamic(() => import('./widgets/InstagramWidget'), { loading: () => <WidgetLoader /> }),
    video: dynamic(() => import('./widgets/VideoWidget'), { loading: () => <WidgetLoader /> }),
    custom_html: dynamic(() => import('./widgets/CustomHtmlWidget'), { loading: () => <WidgetLoader /> }),
};

// Loading placeholder
function WidgetLoader() {
    return (
        <div className="w-full py-12 flex items-center justify-center bg-gray-50">
            <Loader2 className="w-8 h-8 animate-spin text-gray-300" />
        </div>
    );
}

// Widget not found fallback
function WidgetNotFound({ type }: { type: string }) {
    return (
        <div className="w-full py-8 px-4 bg-yellow-50 border border-yellow-200 text-center text-yellow-700">
            Widget type "{type}" not implemented
        </div>
    );
}

interface WidgetRendererProps {
    widgets: Widget[];
    isEditing?: boolean;
    onWidgetClick?: (widget: Widget) => void;
}

export default function WidgetRenderer({ widgets, isEditing = false, onWidgetClick }: WidgetRendererProps) {
    // Sort widgets by sort_order
    const sortedWidgets = [...widgets]
        .filter(w => w.enabled)
        .sort((a, b) => a.sort_order - b.sort_order);

    return (
        <div className="widget-container space-y-0">
            {sortedWidgets.map((widget) => {
                const WidgetComponent = widgetComponents[widget.type];

                if (!WidgetComponent) {
                    return <WidgetNotFound key={widget.id} type={widget.type} />;
                }

                return (
                    <div
                        key={widget.id}
                        className={`widget-wrapper ${isEditing ? 'ring-2 ring-blue-500/50 ring-offset-2 cursor-pointer hover:ring-blue-500' : ''}`}
                        onClick={() => isEditing && onWidgetClick?.(widget)}
                    >
                        {isEditing && (
                            <div className="bg-blue-600 text-white text-xs font-bold px-3 py-1 absolute top-0 left-0 z-10">
                                {widget.title || widget.type}
                            </div>
                        )}
                        <WidgetComponent widget={widget} />
                    </div>
                );
            })}
        </div>
    );
}

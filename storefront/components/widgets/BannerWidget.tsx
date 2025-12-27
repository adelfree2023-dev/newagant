'use client';

/**
 * BannerWidget - Promotional Banner
 */

import { BannerWidget as BannerWidgetType } from '@/types/widget';
import Link from 'next/link';
import clsx from 'clsx';

interface Props {
    widget: BannerWidgetType;
}

export default function BannerWidget({ widget }: Props) {
    const { settings } = widget;
    const { image, link, aspect_ratio, text, text_position, background_color, text_color } = settings;

    const aspectClasses: Record<string, string> = {
        '16:9': 'aspect-video',
        '21:9': 'aspect-[21/9]',
        '4:3': 'aspect-[4/3]',
        'auto': ''
    };

    const positionClasses: Record<string, string> = {
        left: 'items-start text-right',
        center: 'items-center text-center',
        right: 'items-end text-left',
    };

    const content = (
        <div
            className={clsx(
                'relative overflow-hidden rounded-xl',
                aspectClasses[aspect_ratio] || aspectClasses['21:9']
            )}
            style={{ backgroundColor: background_color || '#1a1a1a' }}
        >
            {/* Background Image */}
            {image && (
                <img
                    src={image}
                    alt={text || 'Banner'}
                    className="absolute inset-0 w-full h-full object-cover"
                />
            )}

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/60" />

            {/* Text Content */}
            {text && (
                <div className={clsx(
                    'absolute inset-0 flex flex-col justify-center p-8 md:p-12',
                    positionClasses[text_position] || positionClasses.center
                )}>
                    <h3
                        className="text-2xl md:text-4xl font-black max-w-lg drop-shadow-lg"
                        style={{ color: text_color || '#ffffff' }}
                    >
                        {text}
                    </h3>
                </div>
            )}
        </div>
    );

    if (link) {
        return (
            <section className="py-4">
                <div className="container mx-auto px-4">
                    <Link href={link} className="block hover:opacity-95 transition-opacity">
                        {content}
                    </Link>
                </div>
            </section>
        );
    }

    return (
        <section className="py-4">
            <div className="container mx-auto px-4">
                {content}
            </div>
        </section>
    );
}

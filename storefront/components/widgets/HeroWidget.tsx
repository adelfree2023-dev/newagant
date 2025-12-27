'use client';

/**
 * HeroWidget - Main Hero Banner/Slider
 */

import { HeroWidget as HeroWidgetType } from '@/types/widget';
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import clsx from 'clsx';

interface Props {
    widget: HeroWidgetType;
}

export default function HeroWidget({ widget }: Props) {
    const { settings } = widget;
    const { slides, autoplay, interval, height, style } = settings;
    const [currentSlide, setCurrentSlide] = useState(0);

    // Autoplay
    useEffect(() => {
        if (!autoplay || slides.length <= 1) return;

        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, interval || 5000);

        return () => clearInterval(timer);
    }, [autoplay, interval, slides.length]);

    const heightClasses = {
        small: 'h-[300px]',
        medium: 'h-[450px]',
        large: 'h-[600px]',
        full: 'h-screen'
    };

    const goToSlide = (index: number) => setCurrentSlide(index);
    const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);

    if (!slides || slides.length === 0) {
        return (
            <div className="w-full h-[400px] bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center text-white">
                <p>No slides configured</p>
            </div>
        );
    }

    return (
        <div className={clsx('relative overflow-hidden', heightClasses[height] || heightClasses.large)}>
            {/* Slides */}
            {slides.map((slide, index) => (
                <div
                    key={slide.id}
                    className={clsx(
                        'absolute inset-0 transition-all duration-700 ease-in-out',
                        index === currentSlide ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
                    )}
                >
                    {/* Background Image */}
                    <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: `url(${slide.image || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920'})` }}
                    />

                    {/* Overlay */}
                    <div
                        className="absolute inset-0"
                        style={{ backgroundColor: slide.overlay_color || 'rgba(0,0,0,0.4)' }}
                    />

                    {/* Content */}
                    <div className="relative z-10 h-full flex items-center justify-center text-center text-white px-4">
                        <div className="max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <h1 className="text-4xl md:text-6xl font-black mb-4 drop-shadow-lg">
                                {slide.title}
                            </h1>
                            {slide.subtitle && (
                                <p className="text-xl md:text-2xl mb-8 opacity-90 drop-shadow">
                                    {slide.subtitle}
                                </p>
                            )}
                            {slide.cta_text && (
                                <Link
                                    href={slide.cta_link || '#'}
                                    className="inline-block px-8 py-4 bg-white text-black font-bold text-lg rounded-full hover:bg-gray-100 transition-colors shadow-xl"
                                >
                                    {slide.cta_text}
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            ))}

            {/* Navigation Arrows */}
            {slides.length > 1 && (
                <>
                    <button
                        onClick={prevSlide}
                        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/40 transition-colors"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>
                    <button
                        onClick={nextSlide}
                        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/40 transition-colors"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                </>
            )}

            {/* Dots */}
            {slides.length > 1 && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => goToSlide(index)}
                            className={clsx(
                                'w-3 h-3 rounded-full transition-all',
                                index === currentSlide ? 'bg-white w-8' : 'bg-white/50 hover:bg-white/80'
                            )}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

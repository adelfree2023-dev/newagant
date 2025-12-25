'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Banner {
    id: string
    title: string
    subtitle: string
    image: string
    link: string
    bg_color: string
    button_text: string
}

interface HeroSliderProps {
    banners?: Banner[]
}

const defaultSlides: Banner[] = [
    {
        id: '1',
        title: 'عروض العيد الكبرى',
        subtitle: 'خصومات تصل حتى 50% على جميع المنتجات',
        image: '',
        link: '/deals',
        bg_color: 'from-primary-500 to-primary-600',
        button_text: 'تسوق الآن'
    },
    {
        id: '2',
        title: 'أحدث الإلكترونيات',
        subtitle: 'iPhone 15 Pro - متوفر الآن',
        image: '',
        link: '/category/electronics',
        bg_color: 'from-secondary-500 to-secondary-600',
        button_text: 'اكتشف المزيد'
    },
    {
        id: '3',
        title: 'شحن مجاني',
        subtitle: 'على جميع الطلبات فوق 200 ر.س',
        image: '',
        link: '/shop',
        bg_color: 'from-green-500 to-green-600',
        button_text: 'ابدأ التسوق'
    },
]

export default function HeroSlider({ banners }: HeroSliderProps) {
    const [currentSlide, setCurrentSlide] = useState(0)
    const slides = banners && banners.length > 0 ? banners : defaultSlides

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length)
        }, 5000)
        return () => clearInterval(timer)
    }, [slides.length])

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % slides.length)
    }

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
    }

    return (
        <div className="relative overflow-hidden rounded-2xl">
            {/* Slides */}
            <div
                className="flex transition-transform duration-500 ease-out"
                style={{ transform: `translateX(${currentSlide * 100}%)` }}
            >
                {slides.map((slide) => (
                    <div
                        key={slide.id}
                        className={`min-w-full h-64 md:h-96 bg-gradient-to-l ${slide.bg_color} relative`}
                    >
                        <div className="container mx-auto h-full flex items-center px-8 md:px-16">
                            <div className="max-w-lg text-white">
                                <h2 className="text-3xl md:text-5xl font-bold mb-4">
                                    {slide.title}
                                </h2>
                                <p className="text-lg md:text-xl mb-6 opacity-90">
                                    {slide.subtitle}
                                </p>
                                <a
                                    href={slide.link}
                                    className="inline-block bg-white text-gray-900 px-8 py-3 
                           rounded-lg font-bold hover:bg-gray-100 transition"
                                >
                                    {slide.button_text}
                                </a>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Navigation Arrows */}
            <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 
                   bg-white/80 rounded-full flex items-center justify-center
                   hover:bg-white transition shadow-lg"
            >
                <ChevronLeft className="w-6 h-6" />
            </button>
            <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 
                   bg-white/80 rounded-full flex items-center justify-center
                   hover:bg-white transition shadow-lg"
            >
                <ChevronRight className="w-6 h-6" />
            </button>

            {/* Dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentSlide
                                ? 'bg-white w-8'
                                : 'bg-white/50 hover:bg-white/75'
                            }`}
                    />
                ))}
            </div>
        </div>
    )
}

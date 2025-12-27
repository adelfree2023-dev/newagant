'use client';

/**
 * CountdownWidget - Sale Countdown Timer
 */

import { CountdownWidget as CountdownWidgetType } from '@/types/widget';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Props {
    widget: CountdownWidgetType;
}

interface TimeLeft {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}

export default function CountdownWidget({ widget }: Props) {
    const { settings } = widget;
    const { end_date, title, background_image, background_color, link } = settings;
    const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
    const [isExpired, setIsExpired] = useState(false);

    useEffect(() => {
        const calculateTimeLeft = () => {
            const difference = new Date(end_date).getTime() - new Date().getTime();

            if (difference <= 0) {
                setIsExpired(true);
                return null;
            }

            return {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
            };
        };

        setTimeLeft(calculateTimeLeft());

        const timer = setInterval(() => {
            const time = calculateTimeLeft();
            setTimeLeft(time);
        }, 1000);

        return () => clearInterval(timer);
    }, [end_date]);

    if (isExpired) {
        return null; // Hide widget if countdown is over
    }

    const content = (
        <div
            className="relative py-12 px-4 rounded-2xl overflow-hidden"
            style={{ backgroundColor: background_color || '#1a1a1a' }}
        >
            {/* Background Image */}
            {background_image && (
                <>
                    <div
                        className="absolute inset-0 bg-cover bg-center opacity-30"
                        style={{ backgroundImage: `url(${background_image})` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/80" />
                </>
            )}

            <div className="relative z-10 text-center text-white">
                {/* Title */}
                <h2 className="text-2xl md:text-4xl font-black mb-8 uppercase tracking-wider">
                    {title || 'العرض ينتهي قريباً!'}
                </h2>

                {/* Countdown */}
                {timeLeft && (
                    <div className="flex justify-center gap-4 md:gap-8">
                        <TimeUnit value={timeLeft.days} label="يوم" />
                        <Separator />
                        <TimeUnit value={timeLeft.hours} label="ساعة" />
                        <Separator />
                        <TimeUnit value={timeLeft.minutes} label="دقيقة" />
                        <Separator />
                        <TimeUnit value={timeLeft.seconds} label="ثانية" />
                    </div>
                )}

                {/* CTA */}
                {link && (
                    <Link
                        href={link}
                        className="inline-block mt-8 px-8 py-3 bg-white text-black font-bold rounded-full hover:bg-gray-100 transition-colors"
                    >
                        تسوق الآن
                    </Link>
                )}
            </div>
        </div>
    );

    return (
        <section className="py-8">
            <div className="container mx-auto px-4">
                {content}
            </div>
        </section>
    );
}

function TimeUnit({ value, label }: { value: number; label: string }) {
    return (
        <div className="text-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 md:p-6 min-w-[70px] md:min-w-[100px]">
                <span className="text-3xl md:text-5xl font-black tabular-nums">
                    {value.toString().padStart(2, '0')}
                </span>
            </div>
            <span className="block mt-2 text-sm md:text-base opacity-80">{label}</span>
        </div>
    );
}

function Separator() {
    return (
        <div className="flex items-center text-3xl md:text-5xl font-bold opacity-50">:</div>
    );
}

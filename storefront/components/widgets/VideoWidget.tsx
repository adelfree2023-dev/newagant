'use client';
import { BaseWidget } from '@/types/widget';
export default function VideoWidget({ widget }: { widget: BaseWidget }) {
    return (
        <section className="py-12 bg-black">
            <div className="container mx-auto px-4">
                <div className="aspect-video bg-gray-800 rounded-xl flex items-center justify-center text-white">
                    <span>Video Player</span>
                </div>
            </div>
        </section>
    );
}

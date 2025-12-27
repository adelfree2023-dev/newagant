'use client';
import { BaseWidget } from '@/types/widget';
export default function CustomHtmlWidget({ widget }: { widget: BaseWidget }) {
    return (
        <section className="py-8">
            <div className="container mx-auto px-4" dangerouslySetInnerHTML={{ __html: widget.settings?.html || '<p>Custom content</p>' }} />
        </section>
    );
}

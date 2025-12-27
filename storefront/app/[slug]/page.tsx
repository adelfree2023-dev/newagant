import { notFound } from 'next/navigation';
import { storeApi } from '@/lib/api';

// Metadata generator for SEO
export async function generateMetadata({ params }: { params: { slug: string } }) {
    try {
        const page = await storeApi.pages.getBySlug(params.slug);
        if (!page) return { title: 'Page Not Found' };
        return {
            title: page.meta_title || page.title,
            description: page.meta_description || ''
        };
    } catch (e) {
        return { title: 'Page Not Found' };
    }
}

export default async function DynamicPage({ params }: { params: { slug: string } }) {
    let page;
    try {
        page = await storeApi.pages.getBySlug(params.slug);
        if (!page) notFound();
    } catch (e) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header / Title Section */}
            <div className="bg-white border-b border-gray-100">
                <div className="container mx-auto px-4 py-12 text-center">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">{page.title}</h1>
                    <div className="w-16 h-1 bg-indigo-600 mx-auto rounded-full"></div>
                </div>
            </div>

            {/* Content Section */}
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm p-8 md:p-12">
                    <article
                        className="prose prose-lg max-w-none prose-headings:font-bold prose-a:text-indigo-600 hover:prose-a:text-indigo-500"
                        dangerouslySetInnerHTML={{ __html: page.content || '' }}
                    />
                </div>
            </div>
        </div>
    );
}

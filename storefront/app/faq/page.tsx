'use client';
import { useEffect, useState } from 'react';
import { storeApi } from '@/lib/api';
import { motion } from 'framer-motion';
import { HelpCircle } from 'lucide-react';

export default function FAQPage() {
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        storeApi.pages.get().then(pages => {
            setContent(pages.faq || ''); // Handling FAQ as text for now as per admin editor
            setLoading(false);
        });
    }, []);

    // Future enhancement: Parse JSON if FAQ becomes structured

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4" dir="rtl">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-16 h-16 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <HelpCircle className="w-8 h-8" />
                    </motion.div>
                    <h1 className="text-4xl font-bold text-gray-900">الأسئلة الشائعة</h1>
                </div>
                <div className="bg-white rounded-3xl shadow-sm p-8 md:p-12 min-h-[300px]">
                    {loading ? <div className="animate-pulse h-4 bg-gray-100 w-1/2 rounded"></div> :
                        <div className="prose prose-lg text-gray-600 whitespace-pre-line">{content || 'لا توجد أسئلة مضافة.'}</div>}
                </div>
            </div>
        </div>
    );
}

'use client';

import { useEffect, useState } from 'react';
import { storeApi } from '@/lib/api';
import { motion } from 'framer-motion';
import { MessageSquare } from 'lucide-react';

export default function ContactPage() {
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const pages = await storeApi.pages.get();
                setContent(pages.contact || '');
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8" dir="rtl">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6"
                    >
                        <MessageSquare className="w-8 h-8" />
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl font-bold text-gray-900"
                    >
                        اتصل بنا
                    </motion.h1>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-3xl shadow-sm p-8 md:p-12 min-h-[400px]"
                >
                    {loading ? (
                        <div className="space-y-4 animate-pulse">
                            <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                            <div className="h-4 bg-gray-100 rounded w-full"></div>
                        </div>
                    ) : (
                        <div className="prose prose-lg max-w-none text-gray-600 leading-relaxed whitespace-pre-line">
                            {content || 'لا توجد معلومات اتصال مضافة.'}
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}

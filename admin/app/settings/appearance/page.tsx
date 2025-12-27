'use client';

import { useState, useEffect } from 'react';
import { adminApi } from '@/lib/api';
import { Check, Palette, Layout, MousePointerClick, Loader2 } from 'lucide-react';
import { toast, Toaster } from 'sonner';

const THEMES = [
    {
        id: 'modern',
        name: 'العصري (Modern)',
        description: 'تصميم حديث وأنيق يركز على الصور الكبيرة والتجربة البصرية. مثالي للأزياء والمتاجر العصرية.',
        colors: ['#4f46e5', '#ffffff', '#f3f4f6'],
        features: ['هيدر شفاف', 'صور كبيرة', 'قائمة جانبية للموبايل']
    },
    {
        id: 'classic',
        name: 'الكلاسيكي (Classic)',
        description: 'تصميم تقليدي موثوق مشابه لأمازون. يركز على عرض كمية كبيرة من البيانات والمنتجات.',
        colors: ['#131921', '#febd69', '#ffffff'],
        features: ['شريط علوي داكن', 'قائمة أقسام أفقية', 'تركيز على البحث']
    }
];

export default function AppearancePage() {
    const [currentTheme, setCurrentTheme] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadSettings();
    }, []);

    async function loadSettings() {
        try {
            const res = await adminApi.settings.get();
            setCurrentTheme(res.data?.theme_id || 'modern');
        } catch (error) {
            toast.error('فشل تحميل الإعدادات');
        } finally {
            setLoading(false);
        }
    }

    const selectTheme = async (themeId: string) => {
        setSaving(true);
        setCurrentTheme(themeId); // Optimistic update
        try {
            // We reuse settings update endpoint, assuming it accepts theme_id at root or inside config
            // Adjust payload structure based on your API
            await adminApi.settings.update({ theme_id: themeId });
            toast.success('تم تغيير تصميم المتجر بنجاح!');
        } catch (error) {
            toast.error('فشل تغيير التصميم');
            // Revert on error if needed, or just reload
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <Toaster position="top-center" richColors />

            <div className="flex items-center gap-4 mb-8">
                <div className="bg-purple-100 p-3 rounded-xl">
                    <Palette className="w-8 h-8 text-purple-600" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">مظهر المتجر</h1>
                    <p className="text-gray-500 mt-1">اختر التصميم الذي يناسب هوية علامتك التجارية.</p>
                </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {THEMES.map((theme) => {
                    const isActive = currentTheme === theme.id;
                    return (
                        <div
                            key={theme.id}
                            className={`group relative bg-white rounded-2xl  overflow-hidden transition-all duration-300 ${isActive ? 'ring-4 ring-purple-500 shadow-xl scale-[1.02]' : 'border border-gray-200 hover:shadow-lg hover:-translate-y-1'}`}
                        >
                            {/* Theme Preview (Placeholder for now) */}
                            <div className={`h-40 ${theme.id === 'modern' ? 'bg-gradient-to-br from-indigo-500 to-purple-600' : 'bg-gradient-to-br from-gray-800 to-gray-900'} flex items-center justify-center`}>
                                <Layout className="w-16 h-16 text-white opacity-20" />
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                                    <button
                                        onClick={() => selectTheme(theme.id)}
                                        className="bg-white text-gray-900 px-6 py-2 rounded-full font-bold transform translate-y-4 group-hover:translate-y-0 transition-all flex items-center gap-2"
                                    >
                                        <MousePointerClick className="w-4 h-4" />
                                        تفعيل
                                    </button>
                                </div>
                            </div>

                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-900">{theme.name}</h3>
                                        {isActive && <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded-full">نشط حالياً</span>}
                                    </div>
                                    <div className="flex -space-x-2 space-x-reverse">
                                        {theme.colors.map(color => (
                                            <div key={color} className="w-6 h-6 rounded-full border border-white shadow-sm" style={{ backgroundColor: color }}></div>
                                        ))}
                                    </div>
                                </div>

                                <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                                    {theme.description}
                                </p>

                                <div className="space-y-2">
                                    {theme.features.map(feat => (
                                        <div key={feat} className="flex items-center gap-2 text-xs text-gray-600">
                                            <Check className="w-3 h-3 text-green-500" />
                                            {feat}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

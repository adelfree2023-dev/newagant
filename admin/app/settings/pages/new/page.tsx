'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminApi } from '@/lib/api';
import { Save, ArrowRight, Loader2 } from 'lucide-react';
import { toast, Toaster } from 'sonner';

export default function NewPage() {
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        content: ''
    });

    const generateSlug = (text: string) => {
        return text
            .toLowerCase()
            .replace(/[^\w\s-]/g, '') // Remove special chars
            .replace(/\s+/g, '-')     // Replace spaces with -
            .replace(/--+/g, '-')     // Replace multiple - with single -
            .trim();
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const title = e.target.value;
        // Only auto-generate slug if it hasn't been manually edited
        if (!formData.slug || formData.slug === generateSlug(formData.title)) {
            setFormData(prev => ({ ...prev, title, slug: generateSlug(title) }));
        } else {
            setFormData(prev => ({ ...prev, title }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await adminApi.pages.create(formData);
            toast.success('تم إنشاء الصفحة بنجاح');
            setTimeout(() => router.push('/settings/pages'), 1000);
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'فشل إنشاء الصفحة');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <Toaster position="top-center" richColors />

            <div className="flex items-center gap-4 mb-8">
                <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full">
                    <ArrowRight className="w-6 h-6 text-gray-600" />
                </button>
                <h1 className="text-2xl font-bold text-gray-900">إنشاء صفحة جديدة</h1>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-900">عنوان الصفحة</label>
                        <input
                            type="text"
                            required
                            value={formData.title}
                            onChange={handleTitleChange}
                            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="مثال: سياسة الخصوصية"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-900">رابط الصفحة (Slug)</label>
                        <div className="flex items-center">
                            <span className="bg-gray-50 border border-l-0 border-gray-200 p-3 rounded-r-lg text-gray-500 text-sm">
                                /
                            </span>
                            <input
                                type="text"
                                required
                                value={formData.slug}
                                onChange={(e) => setFormData({ ...formData, slug: generateSlug(e.target.value) })}
                                className="w-full p-3 border border-gray-200 rounded-l-lg focus:ring-2 focus:ring-indigo-500 outline-none dir-ltr font-mono text-sm"
                                placeholder="privacy-policy"
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-900">محتوى الصفحة (HTML)</label>
                    <textarea
                        required
                        value={formData.content}
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        className="w-full h-96 p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-sm"
                        placeholder="<h1>عنوان رئيسي</h1><p>اكتب محتوى الصفحة هنا...</p>"
                    />
                    <p className="text-xs text-gray-500">
                        * يمكنك كتابة HTML مباشرة أو نص عادي. (سيتم إضافة محرر مرئي قريباً)
                    </p>
                </div>

                <div className="flex justify-end pt-4 border-t">
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 font-bold"
                    >
                        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        نشر الصفحة
                    </button>
                </div>
            </form>
        </div>
    );
}

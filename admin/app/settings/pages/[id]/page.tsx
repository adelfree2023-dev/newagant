'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { adminApi } from '@/lib/api';
import { Save, ArrowRight, Loader2, Trash2 } from 'lucide-react';
import { toast, Toaster } from 'sonner';

export default function EditPage() {
    const router = useRouter();
    const params = useParams();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        content: '',
        is_published: true
    });

    useEffect(() => {
        loadPage();
    }, []);

    async function loadPage() {
        try {
            const res = await adminApi.pages.get(params.id as string);
            setFormData(res.data);
        } catch (error) {
            toast.error('فشل تحميل بيانات الصفحة');
            router.push('/settings/pages');
        } finally {
            setLoading(false);
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await adminApi.pages.update(params.id as string, formData);
            toast.success('تم تحديث الصفحة بنجاح');
            setTimeout(() => router.push('/settings/pages'), 1000);
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'فشل تحديث الصفحة');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <Toaster position="top-center" richColors />

            <div className="flex items-center gap-4 mb-8">
                <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full">
                    <ArrowRight className="w-6 h-6 text-gray-600" />
                </button>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-gray-900">تعديل الصفحة</h1>
                    <p className="text-gray-500 text-sm">/{formData.slug}</p>
                </div>
                <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 cursor-pointer bg-white border border-gray-200 px-4 py-2 rounded-lg">
                        <input
                            type="checkbox"
                            checked={formData.is_published}
                            onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                            className="rounded text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-sm font-medium text-gray-700">نشر الصفحة</span>
                    </label>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-900">عنوان الصفحة</label>
                    <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-900">محتوى الصفحة (HTML)</label>
                    <textarea
                        required
                        value={formData.content}
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        className="w-full h-96 p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-sm"
                    />
                    <p className="text-xs text-gray-500">
                        * يمكنك كتابة HTML مباشرة أو نص عادي.
                    </p>
                </div>

                <div className="flex justify-end pt-4 border-t">
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 font-bold"
                    >
                        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        حفظ التعديلات
                    </button>
                </div>
            </form>
        </div>
    );
}

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { adminApi } from '@/lib/api';
import { Plus, Edit, Trash2, ExternalLink, FileText, Check, X, Loader2 } from 'lucide-react';
import { toast, Toaster } from 'sonner';

export default function PagesList() {
    const [pages, setPages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadPages();
    }, []);

    async function loadPages() {
        try {
            const res = await adminApi.pages.list(); // You'll need to update adminApi definition
            setPages(res.data);
        } catch (error) {
            toast.error('فشل تحميل الصفحات');
        } finally {
            setLoading(false);
        }
    }

    const deletePage = async (id: string) => {
        if (!confirm('هل أنت متأكد من حذف هذه الصفحة؟')) return;
        try {
            await adminApi.pages.delete(id);
            toast.success('تم حذف الصفحة');
            setPages(prev => prev.filter(p => p.id !== id));
        } catch (error) {
            toast.error('فشل الحذف');
        }
    };

    if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <Toaster position="top-center" richColors />

            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">صفحات المتجر</h1>
                    <p className="text-gray-500 mt-1">أنشئ صفحات تعريفية غير محدودة (من نحن، سياسات، عروض...)</p>
                </div>
                <Link
                    href="/settings/pages/new"
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    صفحة جديدة
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {pages.length === 0 ? (
                    <div className="text-center py-20">
                        <FileText className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-gray-900">لا توجد صفحات بعد</h3>
                        <p className="text-gray-500 mb-6">ابدأ بإنشاء أول صفحة لمتجرك</p>
                        <Link href="/settings/pages/new" className="text-indigo-600 font-medium hover:underline">إنشاء صفحة الآن</Link>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-gray-50 text-gray-600 text-sm">
                            <tr>
                                <th className="p-4 text-right">العنوان</th>
                                <th className="p-4 text-right">الرابط (Slug)</th>
                                <th className="p-4 text-right">الحالة</th>
                                <th className="p-4 text-right">تاريخ الإنشاء</th>
                                <th className="p-4 text-left">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {pages.map((page) => (
                                <tr key={page.id} className="hover:bg-gray-50 group">
                                    <td className="p-4 font-medium text-gray-900">
                                        <div className="flex items-center gap-2">
                                            <FileText className="w-4 h-4 text-gray-400" />
                                            {page.title}
                                        </div>
                                    </td>
                                    <td className="p-4 font-mono text-sm text-gray-500" dir="ltr">/{page.slug}</td>
                                    <td className="p-4">
                                        {page.is_published ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                                                <Check className="w-3 h-3" /> منشور
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
                                                <X className="w-3 h-3" /> مسودة
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4 text-sm text-gray-500">
                                        {new Date(page.created_at).toLocaleDateString('ar-EG')}
                                    </td>
                                    <td className="p-4 text-left">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <a
                                                href={`http://localhost:3000/${page.slug}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                                                title="عرض"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                            </a>
                                            <Link
                                                href={`/settings/pages/${page.id}`}
                                                className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg"
                                                title="تعديل"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </Link>
                                            <button
                                                onClick={() => deletePage(page.id)}
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                                title="حذف"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

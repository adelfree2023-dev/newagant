'use client';

import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/api';
import { Plus, Edit2, Trash2, Folder, Loader2 } from 'lucide-react';
import { toast, Toaster } from 'sonner';

interface Category {
    id: string;
    name: string;
    name_ar?: string;
    slug: string;
    products_count: number;
    is_active: boolean;
}

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

    // Form State
    const [formData, setFormData] = useState({ name: '', slug: '', is_active: true });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadCategories();
    }, []);

    async function loadCategories() {
        try {
            setLoading(true);
            const res = await adminApi.categories.list();
            setCategories(res.data.categories || []);
        } catch (error) {
            toast.error('فشل تحميل الأقسام');
        } finally {
            setLoading(false);
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (editingCategory) {
                await adminApi.categories.update(editingCategory.id, formData);
                toast.success('تم تحديث القسم بنجاح');
            } else {
                await adminApi.categories.create(formData);
                toast.success('تم إضافة القسم بنجاح');
            }
            setShowModal(false);
            setEditingCategory(null);
            setFormData({ name: '', slug: '', is_active: true });
            loadCategories();
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'حدث خطأ ما');
        } finally {
            setSubmitting(false);
        }
    }

    async function handleDelete(id: string) {
        if (!confirm('هل أنت متأكد من حذف هذا القسم؟')) return;
        try {
            await adminApi.categories.delete(id);
            toast.success('تم الحذف بنجاح');
            loadCategories();
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'فشل الحذف');
        }
    }

    const openEdit = (cat: Category) => {
        setEditingCategory(cat);
        setFormData({ name: cat.name, slug: cat.slug, is_active: cat.is_active });
        setShowModal(true);
    };

    return (
        <div className="p-8">
            <Toaster richColors position="top-center" />

            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">أقسام المتجر</h1>
                    <p className="text-gray-500 mt-1">نظم منتجاتك في أقسام ليسهل العثور عليها</p>
                </div>
                <button
                    onClick={() => { setEditingCategory(null); setFormData({ name: '', slug: '', is_active: true }); setShowModal(true); }}
                    className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-black transition-all"
                >
                    <Plus className="w-5 h-5" />
                    إضافة قسم جديد
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center h-64 items-center"><Loader2 className="animate-spin" /></div>
            ) : categories.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                    <Folder className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900">لا توجد أقسام</h3>
                    <p className="text-gray-500 mb-6">ابدأ بإضافة أول قسم لمتجرك</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {categories.map(cat => (
                        <div key={cat.id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-2xl">
                                    📁
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => openEdit(cat)} className="p-2 hover:bg-gray-100 rounded-lg text-blue-600"><Edit2 className="w-4 h-4" /></button>
                                    <button onClick={() => handleDelete(cat.id)} className="p-2 hover:bg-red-50 rounded-lg text-red-600"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-1">{cat.name}</h3>
                            <p className="text-sm text-gray-500 mb-4">{cat.products_count} منتج</p>
                            <span className={`px-2 py-1 rounded-md text-xs font-medium ${cat.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                {cat.is_active ? 'نشط' : 'غير نشط'}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
                        <h2 className="text-xl font-bold mb-6">{editingCategory ? 'تعديل القسم' : 'إضافة قسم جديد'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">اسم القسم</label>
                                <input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">الرابط (Slug)</label>
                                <input
                                    value={formData.slug}
                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    required
                                />
                            </div>
                            <label className="flex items-center gap-2 pt-2">
                                <input
                                    type="checkbox"
                                    checked={formData.is_active}
                                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                    className="w-5 h-5 rounded text-blue-600"
                                />
                                <span className="text-sm font-medium">نشط</span>
                            </label>

                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2 bg-gray-100 rounded-lg">إلغاء</button>
                                <button type="submit" disabled={submitting} className="flex-1 py-2 bg-gray-900 text-white rounded-lg disabled:opacity-50">
                                    {submitting ? 'جاري الحفظ...' : 'حفظ'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

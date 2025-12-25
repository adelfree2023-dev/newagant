'use client';

/**
 * Admin Categories Management Page
 * صفحة إدارة الفئات
 * 
 * يجب وضعه في: admin/app/categories/page.tsx
 */

import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/api';
import Image from 'next/image';

interface Category {
    id: string;
    name: string;
    name_ar?: string;
    slug: string;
    description?: string;
    image?: string;
    parent_id?: string;
    parent_name?: string;
    sort_order: number;
    products_count: number;
    is_active: boolean;
    created_at: string;
}

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [draggedItem, setDraggedItem] = useState<Category | null>(null);

    useEffect(() => {
        loadCategories();
    }, []);

    async function loadCategories() {
        try {
            setLoading(true);
            const result = await adminApi.categories.getAll(true); // include inactive
            if (result.data) {
                setCategories(result.data.categories || result.data);
            }
        } catch (error) {
            console.error('Error loading categories:', error);
        } finally {
            setLoading(false);
        }
    }

    async function deleteCategory(id: string) {
        const category = categories.find(c => c.id === id);
        if (!category) return;

        if (category.products_count > 0) {
            alert(`لا يمكن حذف هذه الفئة لأنها تحتوي على ${category.products_count} منتج`);
            return;
        }

        if (!confirm('هل أنت متأكد من حذف هذه الفئة؟')) return;

        try {
            await adminApi.categories.delete(id);
            setCategories(categories.filter(c => c.id !== id));
        } catch (error) {
            console.error('Error deleting category:', error);
        }
    }

    async function toggleActive(category: Category) {
        try {
            await adminApi.categories.update(category.id, { is_active: !category.is_active });
            setCategories(categories.map(c =>
                c.id === category.id ? { ...c, is_active: !c.is_active } : c
            ));
        } catch (error) {
            console.error('Error updating category:', error);
        }
    }

    async function updateOrder(categoryId: string, newOrder: number) {
        try {
            await adminApi.categories.update(categoryId, { sort_order: newOrder });
        } catch (error) {
            console.error('Error updating order:', error);
        }
    }

    const handleDragStart = (e: React.DragEvent, category: Category) => {
        setDraggedItem(category);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent, targetCategory: Category) => {
        e.preventDefault();

        if (!draggedItem || draggedItem.id === targetCategory.id) return;

        const newCategories = [...categories];
        const draggedIndex = newCategories.findIndex(c => c.id === draggedItem.id);
        const targetIndex = newCategories.findIndex(c => c.id === targetCategory.id);

        newCategories.splice(draggedIndex, 1);
        newCategories.splice(targetIndex, 0, draggedItem);

        // Update sort_order
        newCategories.forEach((cat, index) => {
            cat.sort_order = index;
            if (cat.id === draggedItem.id || cat.id === targetCategory.id) {
                updateOrder(cat.id, index);
            }
        });

        setCategories(newCategories);
        setDraggedItem(null);
    };

    // Get parent categories (categories without parent_id)
    const parentCategories = categories.filter(c => !c.parent_id);

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900">إدارة الفئات</h1>
                <button
                    onClick={() => { setEditingCategory(null); setShowForm(true); }}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                    ➕ إضافة فئة
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-xl p-4 shadow-sm">
                    <p className="text-sm text-gray-500">إجمالي الفئات</p>
                    <p className="text-2xl font-bold">{categories.length}</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm">
                    <p className="text-sm text-gray-500">فئات نشطة</p>
                    <p className="text-2xl font-bold text-green-600">
                        {categories.filter(c => c.is_active).length}
                    </p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm">
                    <p className="text-sm text-gray-500">إجمالي المنتجات</p>
                    <p className="text-2xl font-bold text-blue-600">
                        {categories.reduce((sum, c) => sum + c.products_count, 0)}
                    </p>
                </div>
            </div>

            {/* Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                <p className="text-blue-800 text-sm">
                    💡 <strong>تلميح:</strong> يمكنك سحب وإفلات الفئات لتغيير ترتيبها
                </p>
            </div>

            {/* Categories List */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                    </div>
                ) : categories.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        <span className="text-4xl block mb-2">📁</span>
                        لا توجد فئات
                    </div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-4 py-3 text-right text-sm font-medium text-gray-500 w-12"></th>
                                <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">الفئة</th>
                                <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">الرابط</th>
                                <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">الأب</th>
                                <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">المنتجات</th>
                                <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">الحالة</th>
                                <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {categories.map((category) => (
                                <tr
                                    key={category.id}
                                    className="hover:bg-gray-50 cursor-move"
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, category)}
                                    onDragOver={handleDragOver}
                                    onDrop={(e) => handleDrop(e, category)}
                                >
                                    <td className="px-4 py-4 text-gray-400">
                                        ⋮⋮
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                                {category.image ? (
                                                    <Image
                                                        src={category.image}
                                                        alt={category.name}
                                                        width={48}
                                                        height={48}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-2xl">
                                                        📁
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-medium">{category.name}</p>
                                                {category.name_ar && (
                                                    <p className="text-sm text-gray-500">{category.name_ar}</p>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                                            /{category.slug}
                                        </code>
                                    </td>
                                    <td className="px-4 py-4 text-sm text-gray-500">
                                        {category.parent_name || '—'}
                                    </td>
                                    <td className="px-4 py-4 font-medium">
                                        {category.products_count}
                                    </td>
                                    <td className="px-4 py-4">
                                        {category.is_active ? (
                                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">نشط</span>
                                        ) : (
                                            <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">متوقف</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => { setEditingCategory(category); setShowForm(true); }}
                                                className="p-1 hover:bg-gray-100 rounded"
                                                title="تعديل"
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                onClick={() => toggleActive(category)}
                                                className="p-1 hover:bg-gray-100 rounded"
                                                title={category.is_active ? 'إلغاء التفعيل' : 'تفعيل'}
                                            >
                                                {category.is_active ? '⏸️' : '▶️'}
                                            </button>
                                            <button
                                                onClick={() => deleteCategory(category.id)}
                                                className="p-1 hover:bg-red-100 rounded text-red-600"
                                                title="حذف"
                                                disabled={category.products_count > 0}
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Category Form Modal */}
            {showForm && (
                <CategoryForm
                    category={editingCategory}
                    parentCategories={parentCategories}
                    onClose={() => { setShowForm(false); setEditingCategory(null); }}
                    onSave={() => { loadCategories(); setShowForm(false); setEditingCategory(null); }}
                />
            )}
        </div>
    );
}

// ==================== Category Form ====================

interface CategoryFormProps {
    category: Category | null;
    parentCategories: Category[];
    onClose: () => void;
    onSave: () => void;
}

function CategoryForm({ category, parentCategories, onClose, onSave }: CategoryFormProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: category?.name || '',
        name_ar: category?.name_ar || '',
        slug: category?.slug || '',
        description: category?.description || '',
        parent_id: category?.parent_id || '',
        image: category?.image || '',
        is_active: category?.is_active ?? true,
    });

    const generateSlug = () => {
        const slug = formData.name
            .toLowerCase()
            .replace(/[^a-z0-9\u0621-\u064A]+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
        setFormData({ ...formData, slug });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const data = {
                ...formData,
                parent_id: formData.parent_id || null,
            };

            if (category) {
                await adminApi.categories.update(category.id, data);
            } else {
                await adminApi.categories.create(data);
            }

            onSave();
        } catch (error) {
            console.error('Error saving category:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-lg w-full">
                <div className="p-6 border-b flex items-center justify-between">
                    <h2 className="text-xl font-bold">
                        {category ? 'تعديل الفئة' : 'إضافة فئة جديدة'}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Names */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">الاسم (إنجليزي) *</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                onBlur={() => !formData.slug && generateSlug()}
                                required
                                className="w-full px-4 py-2 border rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">الاسم (عربي)</label>
                            <input
                                type="text"
                                value={formData.name_ar}
                                onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                                className="w-full px-4 py-2 border rounded-lg"
                            />
                        </div>
                    </div>

                    {/* Slug */}
                    <div>
                        <label className="block text-sm font-medium mb-1">الرابط (Slug) *</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={formData.slug}
                                onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
                                required
                                className="flex-1 px-4 py-2 border rounded-lg font-mono text-sm"
                            />
                            <button
                                type="button"
                                onClick={generateSlug}
                                className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                            >
                                توليد
                            </button>
                        </div>
                    </div>

                    {/* Parent Category */}
                    <div>
                        <label className="block text-sm font-medium mb-1">الفئة الأب</label>
                        <select
                            value={formData.parent_id}
                            onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })}
                            className="w-full px-4 py-2 border rounded-lg"
                        >
                            <option value="">بدون (فئة رئيسية)</option>
                            {parentCategories.filter(p => p.id !== category?.id).map((parent) => (
                                <option key={parent.id} value={parent.id}>
                                    {parent.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium mb-1">الوصف</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={2}
                            className="w-full px-4 py-2 border rounded-lg"
                        />
                    </div>

                    {/* Image URL */}
                    <div>
                        <label className="block text-sm font-medium mb-1">رابط الصورة</label>
                        <input
                            type="url"
                            value={formData.image}
                            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                            className="w-full px-4 py-2 border rounded-lg"
                            placeholder="https://..."
                        />
                    </div>

                    {/* Active */}
                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={formData.is_active}
                            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                            className="rounded text-primary-600"
                        />
                        <span>نشط</span>
                    </label>

                    <div className="flex gap-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200"
                        >
                            إلغاء
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:bg-gray-300"
                        >
                            {loading ? 'جاري الحفظ...' : 'حفظ'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

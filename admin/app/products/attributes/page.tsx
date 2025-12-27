'use client';

import { useState, useEffect } from 'react';
import { Plus, Tag, Trash2, Edit } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { toast, Toaster } from 'sonner';

export default function AttributesPage() {
    const [attributes, setAttributes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    // Form State
    const [formData, setFormData] = useState({ name: '', code: '', type: 'text', options: [] });

    useEffect(() => {
        loadAttributes();
    }, []);

    async function loadAttributes() {
        try {
            // Assuming adminApi has attributes.list() - we will need to add it or call fetch directly
            // For now using fetch to be safe as updated api client might not be compiled yet
            const res = await fetch('http://localhost:8000/api/attributes', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const json = await res.json();
            if (json.success) setAttributes(json.data);
        } catch (error) {
            toast.error('فشل تحميل الخصائص');
        } finally {
            setLoading(false);
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:8000/api/attributes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                toast.success('تم إنشاء الخاصية بنجاح');
                setShowForm(false);
                loadAttributes();
                setFormData({ name: '', code: '', type: 'text', options: [] });
            }
        } catch (error) {
            toast.error('حدث خطأ');
        }
    }

    return (
        <div className="p-6">
            <Toaster position="top-center" richColors />

            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">خصائص المنتجات</h1>
                    <p className="text-gray-500">قم بإضافة خصائص مثل اللون، المقاس، سنة الصنع لتصفية المنتجات.</p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-700"
                >
                    <Plus className="w-5 h-5" />
                    إضافة خاصية
                </button>
            </div>

            {/* Creation Form */}
            {showForm && (
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-lg mb-8 animate-in fade-in slide-in-from-top-4">
                    <h3 className="font-bold mb-4">بيانات الخاصية الجديدة</h3>
                    <form onSubmit={handleSubmit} className="grid md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">الاسم (عربي)</label>
                            <input
                                required
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                placeholder="مثال: اللون"
                                className="w-full p-2 border rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">الكود (إنجليزي)</label>
                            <input
                                required
                                value={formData.code}
                                onChange={e => setFormData({ ...formData, code: e.target.value })}
                                placeholder="example: color"
                                className="w-full p-2 border rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">النوع</label>
                            <select
                                value={formData.type}
                                onChange={e => setFormData({ ...formData, type: e.target.value })}
                                className="w-full p-2 border rounded-lg"
                            >
                                <option value="text">نص (Text)</option>
                                <option value="select">قائمة (Select)</option>
                                <option value="color">لون (Color)</option>
                            </select>
                        </div>
                        <div className="col-span-full flex gap-3 mt-4">
                            <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-lg">حفظ</button>
                            <button type="button" onClick={() => setShowForm(false)} className="bg-gray-100 text-gray-600 px-6 py-2 rounded-lg">إلغاء</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Attributes List */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full text-right">
                    <thead className="bg-gray-50 text-gray-500 text-sm">
                        <tr>
                            <th className="p-4">الاسم</th>
                            <th className="p-4">الكود</th>
                            <th className="p-4">النوع</th>
                            <th className="p-4 text-left">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {attributes.map((attr: any) => (
                            <tr key={attr.id} className="hover:bg-gray-50">
                                <td className="p-4 font-medium">{attr.name}</td>
                                <td className="p-4 font-mono text-sm text-gray-500">{attr.code}</td>
                                <td className="p-4">
                                    <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs px-2">{attr.type}</span>
                                </td>
                                <td className="p-4 flex justify-end gap-2">
                                    <button className="p-2 hover:bg-gray-100 rounded-lg text-blue-600"><Edit className="w-4 h-4" /></button>
                                    <button className="p-2 hover:bg-gray-100 rounded-lg text-red-600"><Trash2 className="w-4 h-4" /></button>
                                </td>
                            </tr>
                        ))}
                        {attributes.length === 0 && !loading && (
                            <tr>
                                <td colSpan={4} className="p-8 text-center text-gray-400">لا توجد خصائص مضافة بعد.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

'use client';

import { useState, useEffect } from 'react';
import { adminApi } from '@/lib/api';
import { Loader2 } from 'lucide-react';

interface Attribute {
    id: string;
    name: string;
    code: string;
    type: 'text' | 'select' | 'color';
    options?: { id: string, value: string, label: string }[];
}

export default function ProductAttributesEditor({ productId }: { productId: string }) {
    const [attributes, setAttributes] = useState<Attribute[]>([]);
    const [values, setValues] = useState<Record<string, string>>({}); // attributeId -> value
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, [productId]);

    async function loadData() {
        try {
            // 1. Load All Attributes Definition
            const attrRes = await fetch('http://localhost:8000/api/attributes', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const attrJson = await attrRes.json();

            // 2. Load Existing Values for Product
            const valRes = await fetch(`http://localhost:8000/api/attributes/product/${productId}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const valJson = await valRes.json();

            if (attrJson.success) setAttributes(attrJson.data);

            if (valJson.success) {
                const valMap: Record<string, string> = {};
                valJson.data.forEach((v: any) => {
                    valMap[v.attribute_id] = v.value;
                });
                setValues(valMap);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    const handleChange = (attributeId: string, value: string) => {
        setValues(prev => ({ ...prev, [attributeId]: value }));
    };

    const handleSave = async () => {
        try {
            await fetch(`http://localhost:8000/api/attributes/product/${productId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ attributes: values })
            });
            alert('تم حفظ الخصائص بنجاح');
        } catch (err) {
            alert('فشل الحفظ');
        }
    }

    if (loading) return <div className="p-4"><Loader2 className="animate-spin" /></div>;

    if (attributes.length === 0) return (
        <div className="p-4 text-gray-500 text-sm border rounded bg-gray-50">
            لا توجد خصائص معرفة في النظام. قم بإضافتها من صفحة الخصائص أولاً.
        </div>
    );

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-200 mt-6">
            <h3 className="font-bold text-lg mb-4">خصائص المنتج (المواصفات)</h3>
            <div className="grid md:grid-cols-2 gap-4">
                {attributes.map(attr => (
                    <div key={attr.id}>
                        <label className="block text-sm font-medium mb-1 text-gray-700">
                            {attr.name} <span className="text-xs text-gray-400">({attr.code})</span>
                        </label>

                        {attr.type === 'select' ? (
                            <select
                                value={values[attr.id] || ''}
                                onChange={(e) => handleChange(attr.id, e.target.value)}
                                className="w-full p-2 border rounded-lg bg-white"
                            >
                                <option value="">-- اختر --</option>
                                {attr.options?.map(opt => (
                                    <option key={opt.id} value={opt.value}>{opt.label || opt.value}</option>
                                ))}
                            </select>
                        ) : (
                            <input
                                type="text"
                                value={values[attr.id] || ''}
                                onChange={(e) => handleChange(attr.id, e.target.value)}
                                className="w-full p-2 border rounded-lg"
                                placeholder={`أدخل ${attr.name}`}
                            />
                        )}
                    </div>
                ))}
            </div>
            <div className="mt-4 border-t pt-4 flex justify-end">
                <button
                    onClick={handleSave}
                    className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700"
                >
                    حفظ المواصفات
                </button>
            </div>
        </div>
    );
}

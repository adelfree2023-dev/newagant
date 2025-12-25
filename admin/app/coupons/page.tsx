'use client';

/**
 * Admin Coupons Management Page
 * صفحة إدارة الكوبونات
 * 
 * يجب وضعه في: admin/app/coupons/page.tsx
 */

import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/api';

interface Coupon {
    id: string;
    code: string;
    discount_type: 'percentage' | 'fixed';
    discount_value: number;
    min_order_value?: number;
    max_uses?: number;
    used_count: number;
    expires_at?: string;
    is_active: boolean;
    created_at: string;
}

export default function CouponsPage() {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

    useEffect(() => {
        loadCoupons();
    }, []);

    async function loadCoupons() {
        try {
            setLoading(true);
            const result = await adminApi.coupons.getAll();
            if (result.data) {
                setCoupons(result.data.coupons || result.data);
            }
        } catch (error) {
            console.error('Error loading coupons:', error);
        } finally {
            setLoading(false);
        }
    }

    async function deleteCoupon(id: string) {
        if (!confirm('هل أنت متأكد من حذف هذا الكوبون؟')) return;

        try {
            await adminApi.coupons.delete(id);
            setCoupons(coupons.filter(c => c.id !== id));
        } catch (error) {
            console.error('Error deleting coupon:', error);
        }
    }

    async function toggleActive(coupon: Coupon) {
        try {
            await adminApi.coupons.update(coupon.id, { is_active: !coupon.is_active });
            setCoupons(coupons.map(c =>
                c.id === coupon.id ? { ...c, is_active: !c.is_active } : c
            ));
        } catch (error) {
            console.error('Error updating coupon:', error);
        }
    }

    const isExpired = (date?: string) => {
        if (!date) return false;
        return new Date(date) < new Date();
    };

    const formatDate = (date?: string) => {
        if (!date) return 'بدون انتهاء';
        return new Date(date).toLocaleDateString('ar-SA');
    };

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900">إدارة الكوبونات</h1>
                <button
                    onClick={() => { setEditingCoupon(null); setShowForm(true); }}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                    ➕ إضافة كوبون
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl p-4 shadow-sm">
                    <p className="text-sm text-gray-500">إجمالي الكوبونات</p>
                    <p className="text-2xl font-bold">{coupons.length}</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm">
                    <p className="text-sm text-gray-500">نشطة</p>
                    <p className="text-2xl font-bold text-green-600">
                        {coupons.filter(c => c.is_active && !isExpired(c.expires_at)).length}
                    </p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm">
                    <p className="text-sm text-gray-500">منتهية</p>
                    <p className="text-2xl font-bold text-red-600">
                        {coupons.filter(c => isExpired(c.expires_at)).length}
                    </p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm">
                    <p className="text-sm text-gray-500">إجمالي الاستخدام</p>
                    <p className="text-2xl font-bold text-blue-600">
                        {coupons.reduce((sum, c) => sum + c.used_count, 0)}
                    </p>
                </div>
            </div>

            {/* Coupons Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                    </div>
                ) : coupons.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        <span className="text-4xl block mb-2">🎟️</span>
                        لا توجد كوبونات
                    </div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">الكود</th>
                                <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">الخصم</th>
                                <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">الحد الأدنى</th>
                                <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">الاستخدام</th>
                                <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">الانتهاء</th>
                                <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">الحالة</th>
                                <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {coupons.map((coupon) => (
                                <tr key={coupon.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-4">
                                        <span className="font-mono font-bold bg-gray-100 px-2 py-1 rounded">
                                            {coupon.code}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 font-medium">
                                        {coupon.discount_type === 'percentage'
                                            ? `${coupon.discount_value}%`
                                            : `${coupon.discount_value} ر.س`
                                        }
                                    </td>
                                    <td className="px-4 py-4 text-sm text-gray-500">
                                        {coupon.min_order_value
                                            ? `${coupon.min_order_value} ر.س`
                                            : 'بدون حد'
                                        }
                                    </td>
                                    <td className="px-4 py-4">
                                        <span className="text-sm">
                                            {coupon.used_count}
                                            {coupon.max_uses && ` / ${coupon.max_uses}`}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 text-sm">
                                        <span className={isExpired(coupon.expires_at) ? 'text-red-600' : 'text-gray-500'}>
                                            {formatDate(coupon.expires_at)}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4">
                                        {isExpired(coupon.expires_at) ? (
                                            <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">منتهي</span>
                                        ) : coupon.is_active ? (
                                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">نشط</span>
                                        ) : (
                                            <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">متوقف</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => { setEditingCoupon(coupon); setShowForm(true); }}
                                                className="p-1 hover:bg-gray-100 rounded"
                                                title="تعديل"
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                onClick={() => toggleActive(coupon)}
                                                className="p-1 hover:bg-gray-100 rounded"
                                                title={coupon.is_active ? 'إيقاف' : 'تفعيل'}
                                            >
                                                {coupon.is_active ? '⏸️' : '▶️'}
                                            </button>
                                            <button
                                                onClick={() => deleteCoupon(coupon.id)}
                                                className="p-1 hover:bg-red-100 rounded text-red-600"
                                                title="حذف"
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

            {/* Coupon Form Modal */}
            {showForm && (
                <CouponForm
                    coupon={editingCoupon}
                    onClose={() => { setShowForm(false); setEditingCoupon(null); }}
                    onSave={() => { loadCoupons(); setShowForm(false); setEditingCoupon(null); }}
                />
            )}
        </div>
    );
}

// ==================== Coupon Form ====================

interface CouponFormProps {
    coupon: Coupon | null;
    onClose: () => void;
    onSave: () => void;
}

function CouponForm({ coupon, onClose, onSave }: CouponFormProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        code: coupon?.code || '',
        discount_type: coupon?.discount_type || 'percentage',
        discount_value: coupon?.discount_value?.toString() || '',
        min_order_value: coupon?.min_order_value?.toString() || '',
        max_uses: coupon?.max_uses?.toString() || '',
        expires_at: coupon?.expires_at?.split('T')[0] || '',
        is_active: coupon?.is_active ?? true,
    });

    const generateCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 8; i++) {
            code += chars[Math.floor(Math.random() * chars.length)];
        }
        setFormData({ ...formData, code });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const data = {
                code: formData.code.toUpperCase(),
                discount_type: formData.discount_type,
                discount_value: parseFloat(formData.discount_value),
                min_order_value: formData.min_order_value ? parseFloat(formData.min_order_value) : null,
                max_uses: formData.max_uses ? parseInt(formData.max_uses) : null,
                expires_at: formData.expires_at || null,
                is_active: formData.is_active,
            };

            if (coupon) {
                await adminApi.coupons.update(coupon.id, data);
            } else {
                await adminApi.coupons.create(data);
            }

            onSave();
        } catch (error) {
            console.error('Error saving coupon:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-lg w-full">
                <div className="p-6 border-b flex items-center justify-between">
                    <h2 className="text-xl font-bold">
                        {coupon ? 'تعديل الكوبون' : 'إنشاء كوبون جديد'}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Code */}
                    <div>
                        <label className="block text-sm font-medium mb-1">كود الكوبون *</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={formData.code}
                                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                required
                                maxLength={20}
                                className="flex-1 px-4 py-2 border rounded-lg font-mono uppercase"
                                placeholder="SAVE20"
                            />
                            <button
                                type="button"
                                onClick={generateCode}
                                className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                            >
                                🎲 توليد
                            </button>
                        </div>
                    </div>

                    {/* Discount Type & Value */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">نوع الخصم</label>
                            <select
                                value={formData.discount_type}
                                onChange={(e) => setFormData({ ...formData, discount_type: e.target.value as any })}
                                className="w-full px-4 py-2 border rounded-lg"
                            >
                                <option value="percentage">نسبة مئوية (%)</option>
                                <option value="fixed">مبلغ ثابت (ر.س)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">قيمة الخصم *</label>
                            <input
                                type="number"
                                value={formData.discount_value}
                                onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                                required
                                min="0"
                                max={formData.discount_type === 'percentage' ? 100 : undefined}
                                className="w-full px-4 py-2 border rounded-lg"
                            />
                        </div>
                    </div>

                    {/* Min Order */}
                    <div>
                        <label className="block text-sm font-medium mb-1">الحد الأدنى للطلب (اختياري)</label>
                        <input
                            type="number"
                            value={formData.min_order_value}
                            onChange={(e) => setFormData({ ...formData, min_order_value: e.target.value })}
                            min="0"
                            className="w-full px-4 py-2 border rounded-lg"
                            placeholder="100"
                        />
                    </div>

                    {/* Max Uses & Expiry */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">الحد الأقصى للاستخدام</label>
                            <input
                                type="number"
                                value={formData.max_uses}
                                onChange={(e) => setFormData({ ...formData, max_uses: e.target.value })}
                                min="1"
                                className="w-full px-4 py-2 border rounded-lg"
                                placeholder="غير محدود"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">تاريخ الانتهاء</label>
                            <input
                                type="date"
                                value={formData.expires_at}
                                onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                                min={new Date().toISOString().split('T')[0]}
                                className="w-full px-4 py-2 border rounded-lg"
                            />
                        </div>
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

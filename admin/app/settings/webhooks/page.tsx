'use client';

/**
 * Admin Webhooks Management Page
 * صفحة إدارة الـ Webhooks
 * 
 * يجب وضعه في: admin/app/settings/webhooks/page.tsx
 */

import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/api';

interface Webhook {
    id: string;
    url: string;
    events: string[];
    secret?: string;
    is_active: boolean;
    last_triggered_at?: string;
    last_status?: number;
    failure_count: number;
    created_at: string;
}

const AVAILABLE_EVENTS = [
    { value: 'order.created', label: 'طلب جديد', icon: '📦' },
    { value: 'order.confirmed', label: 'تأكيد طلب', icon: '✅' },
    { value: 'order.shipped', label: 'شحن طلب', icon: '🚚' },
    { value: 'order.delivered', label: 'توصيل طلب', icon: '🎉' },
    { value: 'order.cancelled', label: 'إلغاء طلب', icon: '❌' },
    { value: 'product.created', label: 'منتج جديد', icon: '🆕' },
    { value: 'product.updated', label: 'تحديث منتج', icon: '✏️' },
    { value: 'product.low_stock', label: 'مخزون منخفض', icon: '⚠️' },
    { value: 'product.out_of_stock', label: 'نفاد المخزون', icon: '🚫' },
    { value: 'customer.created', label: 'عميل جديد', icon: '👤' },
];

export default function WebhooksPage() {
    const [webhooks, setWebhooks] = useState<Webhook[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingWebhook, setEditingWebhook] = useState<Webhook | null>(null);
    const [testResult, setTestResult] = useState<{ id: string; success: boolean; message: string } | null>(null);

    useEffect(() => {
        loadWebhooks();
    }, []);

    async function loadWebhooks() {
        try {
            setLoading(true);
            const result = await adminApi.webhooks.getAll();
            if (result.data) {
                setWebhooks(result.data.webhooks || result.data);
            }
        } catch (error) {
            console.error('Error loading webhooks:', error);
        } finally {
            setLoading(false);
        }
    }

    async function deleteWebhook(id: string) {
        if (!confirm('هل أنت متأكد من حذف هذا الـ Webhook؟')) return;

        try {
            await adminApi.webhooks.delete(id);
            setWebhooks(webhooks.filter(w => w.id !== id));
        } catch (error) {
            console.error('Error deleting webhook:', error);
        }
    }

    async function toggleActive(webhook: Webhook) {
        try {
            await adminApi.webhooks.update(webhook.id, { is_active: !webhook.is_active });
            setWebhooks(webhooks.map(w =>
                w.id === webhook.id ? { ...w, is_active: !w.is_active } : w
            ));
        } catch (error) {
            console.error('Error updating webhook:', error);
        }
    }

    async function testWebhook(webhook: Webhook) {
        try {
            setTestResult({ id: webhook.id, success: false, message: 'جاري الاختبار...' });
            const result = await adminApi.webhooks.test(webhook.id);
            setTestResult({
                id: webhook.id,
                success: result.data?.success || false,
                message: result.data?.message || result.error || 'خطأ',
            });
        } catch (error) {
            setTestResult({
                id: webhook.id,
                success: false,
                message: 'فشل الاختبار',
            });
        }
    }

    const getEventLabels = (events: string[]) => {
        return events.map(e => {
            const event = AVAILABLE_EVENTS.find(ae => ae.value === e);
            return event ? `${event.icon} ${event.label}` : e;
        });
    };

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Webhooks</h1>
                    <p className="text-gray-500 text-sm">إرسال إشعارات تلقائية للأنظمة الخارجية</p>
                </div>
                <button
                    onClick={() => { setEditingWebhook(null); setShowForm(true); }}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                    ➕ إضافة Webhook
                </button>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                <h3 className="font-medium text-blue-800 mb-2">💡 ما هي الـ Webhooks؟</h3>
                <p className="text-blue-700 text-sm">
                    Webhooks تسمح بإرسال بيانات تلقائياً لخدمات خارجية عند حدوث أحداث معينة في متجرك.
                    مثال: إرسال إشعار لتطبيق المحاسبة عند إنشاء طلب جديد.
                </p>
            </div>

            {/* Webhooks List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="bg-white rounded-xl p-8 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                    </div>
                ) : webhooks.length === 0 ? (
                    <div className="bg-white rounded-xl p-8 text-center">
                        <span className="text-4xl block mb-2">🔗</span>
                        <p className="text-gray-500">لا توجد Webhooks مُعدّة</p>
                    </div>
                ) : (
                    webhooks.map((webhook) => (
                        <div key={webhook.id} className="bg-white rounded-xl shadow-sm p-6">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className={`w-3 h-3 rounded-full ${webhook.is_active ? 'bg-green-500' : 'bg-gray-300'
                                            }`}></span>
                                        <code className="text-sm bg-gray-100 px-2 py-1 rounded break-all">
                                            {webhook.url}
                                        </code>
                                    </div>

                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {getEventLabels(webhook.events).map((label, i) => (
                                            <span key={i} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                                {label}
                                            </span>
                                        ))}
                                    </div>

                                    {/* Status */}
                                    <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
                                        {webhook.last_triggered_at && (
                                            <span>
                                                آخر تشغيل: {new Date(webhook.last_triggered_at).toLocaleString('ar-SA')}
                                            </span>
                                        )}
                                        {webhook.last_status && (
                                            <span className={webhook.last_status < 400 ? 'text-green-600' : 'text-red-600'}>
                                                الحالة: {webhook.last_status}
                                            </span>
                                        )}
                                        {webhook.failure_count > 0 && (
                                            <span className="text-red-600">
                                                ⚠️ {webhook.failure_count} فشل
                                            </span>
                                        )}
                                    </div>

                                    {/* Test Result */}
                                    {testResult?.id === webhook.id && (
                                        <div className={`mt-3 p-2 rounded text-sm ${testResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                            {testResult.message}
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 mr-4">
                                    <button
                                        onClick={() => testWebhook(webhook)}
                                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200"
                                    >
                                        🧪 اختبار
                                    </button>
                                    <button
                                        onClick={() => { setEditingWebhook(webhook); setShowForm(true); }}
                                        className="p-2 hover:bg-gray-100 rounded"
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        onClick={() => toggleActive(webhook)}
                                        className="p-2 hover:bg-gray-100 rounded"
                                    >
                                        {webhook.is_active ? '⏸️' : '▶️'}
                                    </button>
                                    <button
                                        onClick={() => deleteWebhook(webhook.id)}
                                        className="p-2 hover:bg-red-100 rounded text-red-600"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Webhook Form Modal */}
            {showForm && (
                <WebhookForm
                    webhook={editingWebhook}
                    onClose={() => { setShowForm(false); setEditingWebhook(null); }}
                    onSave={() => { loadWebhooks(); setShowForm(false); setEditingWebhook(null); }}
                />
            )}
        </div>
    );
}

// ==================== Webhook Form ====================

interface WebhookFormProps {
    webhook: Webhook | null;
    onClose: () => void;
    onSave: () => void;
}

function WebhookForm({ webhook, onClose, onSave }: WebhookFormProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        url: webhook?.url || '',
        events: webhook?.events || [],
        secret: '',
        is_active: webhook?.is_active ?? true,
    });

    const toggleEvent = (event: string) => {
        setFormData({
            ...formData,
            events: formData.events.includes(event)
                ? formData.events.filter(e => e !== event)
                : [...formData.events, event],
        });
    };

    const generateSecret = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let secret = 'whsec_';
        for (let i = 0; i < 32; i++) {
            secret += chars[Math.floor(Math.random() * chars.length)];
        }
        setFormData({ ...formData, secret });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.events.length === 0) {
            alert('يجب اختيار حدث واحد على الأقل');
            return;
        }

        setLoading(true);

        try {
            const data = {
                url: formData.url,
                events: formData.events,
                secret: formData.secret || undefined,
                is_active: formData.is_active,
            };

            if (webhook) {
                await adminApi.webhooks.update(webhook.id, data);
            } else {
                await adminApi.webhooks.create(data);
            }

            onSave();
        } catch (error) {
            console.error('Error saving webhook:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b flex items-center justify-between">
                    <h2 className="text-xl font-bold">
                        {webhook ? 'تعديل Webhook' : 'إنشاء Webhook جديد'}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* URL */}
                    <div>
                        <label className="block text-sm font-medium mb-1">عنوان URL *</label>
                        <input
                            type="url"
                            value={formData.url}
                            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                            required
                            className="w-full px-4 py-2 border rounded-lg font-mono text-sm"
                            placeholder="https://example.com/webhook"
                        />
                    </div>

                    {/* Secret */}
                    <div>
                        <label className="block text-sm font-medium mb-1">المفتاح السري (اختياري)</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={formData.secret}
                                onChange={(e) => setFormData({ ...formData, secret: e.target.value })}
                                className="flex-1 px-4 py-2 border rounded-lg font-mono text-sm"
                                placeholder="whsec_..."
                            />
                            <button
                                type="button"
                                onClick={generateSecret}
                                className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                            >
                                🔑 توليد
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            يُستخدم للتحقق من صحة الطلبات الواردة
                        </p>
                    </div>

                    {/* Events */}
                    <div>
                        <label className="block text-sm font-medium mb-2">الأحداث *</label>
                        <div className="grid grid-cols-2 gap-2">
                            {AVAILABLE_EVENTS.map((event) => (
                                <label
                                    key={event.value}
                                    className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-colors ${formData.events.includes(event.value)
                                            ? 'border-primary-500 bg-primary-50'
                                            : 'border-gray-200 hover:bg-gray-50'
                                        }`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={formData.events.includes(event.value)}
                                        onChange={() => toggleEvent(event.value)}
                                        className="rounded text-primary-600"
                                    />
                                    <span className="text-sm">
                                        {event.icon} {event.label}
                                    </span>
                                </label>
                            ))}
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

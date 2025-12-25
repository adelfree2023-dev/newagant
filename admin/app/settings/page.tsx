'use client';

/**
 * Admin General Settings Page
 * صفحة الإعدادات العامة
 * 
 * يجب وضعه في: admin/app/settings/page.tsx
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { adminApi } from '@/lib/api';

interface StoreSettings {
    store_name: string;
    store_name_ar: string;
    logo_url?: string;
    favicon_url?: string;
    email: string;
    phone: string;
    whatsapp?: string;
    address?: string;
    currency: string;
    timezone: string;
    tax_rate: number;
    tax_included: boolean;
    free_shipping_threshold?: number;
    default_shipping_cost: number;
    meta_title?: string;
    meta_description?: string;
    google_analytics_id?: string;
    facebook_pixel_id?: string;
}

const settingsGroups = [
    { key: 'general', label: 'عام', icon: '⚙️', href: '/settings' },
    { key: 'security', label: 'الأمان', icon: '🔐', href: '/settings/security' },
    { key: 'webhooks', label: 'Webhooks', icon: '🔗', href: '/settings/webhooks' },
    { key: 'shipping', label: 'الشحن', icon: '🚚', href: '/settings/shipping' },
    { key: 'payment', label: 'الدفع', icon: '💳', href: '/settings/payment' },
    { key: 'notifications', label: 'الإشعارات', icon: '🔔', href: '/settings/notifications' },
];

export default function SettingsPage() {
    const [settings, setSettings] = useState<StoreSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('store');

    useEffect(() => {
        loadSettings();
    }, []);

    async function loadSettings() {
        try {
            setLoading(true);
            const result = await adminApi.settings.get();
            if (result.data) {
                setSettings(result.data);
            }
        } catch (error) {
            console.error('Error loading settings:', error);
            // Mock data for development
            setSettings({
                store_name: 'متجري',
                store_name_ar: 'متجري',
                email: 'info@mystore.com',
                phone: '+966500000000',
                currency: 'SAR',
                timezone: 'Asia/Riyadh',
                tax_rate: 15,
                tax_included: true,
                free_shipping_threshold: 200,
                default_shipping_cost: 25,
            });
        } finally {
            setLoading(false);
        }
    }

    async function saveSettings() {
        if (!settings) return;

        setSaving(true);
        try {
            await adminApi.settings.update(settings);
            alert('تم حفظ الإعدادات بنجاح');
        } catch (error) {
            console.error('Error saving settings:', error);
            alert('فشل في حفظ الإعدادات');
        } finally {
            setSaving(false);
        }
    }

    const handleChange = (field: keyof StoreSettings, value: any) => {
        if (settings) {
            setSettings({ ...settings, [field]: value });
        }
    };

    if (loading) {
        return (
            <div className="p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-64 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900">الإعدادات</h1>
                <button
                    onClick={saveSettings}
                    disabled={saving}
                    className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-300"
                >
                    {saving ? 'جاري الحفظ...' : '💾 حفظ التغييرات'}
                </button>
            </div>

            <div className="flex gap-6">
                {/* Sidebar */}
                <div className="w-64 flex-shrink-0">
                    <nav className="bg-white rounded-xl shadow-sm p-4 space-y-1">
                        {settingsGroups.map((group) => (
                            <Link
                                key={group.key}
                                href={group.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${group.key === 'general'
                                        ? 'bg-primary-50 text-primary-700'
                                        : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                <span>{group.icon}</span>
                                <span>{group.label}</span>
                            </Link>
                        ))}
                    </nav>
                </div>

                {/* Main Content */}
                <div className="flex-1 space-y-6">
                    {/* Store Info */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="text-lg font-bold mb-4">معلومات المتجر</h2>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">اسم المتجر (إنجليزي)</label>
                                <input
                                    type="text"
                                    value={settings?.store_name || ''}
                                    onChange={(e) => handleChange('store_name', e.target.value)}
                                    className="w-full px-4 py-2 border rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">اسم المتجر (عربي)</label>
                                <input
                                    type="text"
                                    value={settings?.store_name_ar || ''}
                                    onChange={(e) => handleChange('store_name_ar', e.target.value)}
                                    className="w-full px-4 py-2 border rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">البريد الإلكتروني</label>
                                <input
                                    type="email"
                                    value={settings?.email || ''}
                                    onChange={(e) => handleChange('email', e.target.value)}
                                    className="w-full px-4 py-2 border rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">رقم الهاتف</label>
                                <input
                                    type="tel"
                                    value={settings?.phone || ''}
                                    onChange={(e) => handleChange('phone', e.target.value)}
                                    className="w-full px-4 py-2 border rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">واتساب</label>
                                <input
                                    type="tel"
                                    value={settings?.whatsapp || ''}
                                    onChange={(e) => handleChange('whatsapp', e.target.value)}
                                    className="w-full px-4 py-2 border rounded-lg"
                                    placeholder="+966500000000"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">العنوان</label>
                                <input
                                    type="text"
                                    value={settings?.address || ''}
                                    onChange={(e) => handleChange('address', e.target.value)}
                                    className="w-full px-4 py-2 border rounded-lg"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Regional Settings */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="text-lg font-bold mb-4">الإعدادات الإقليمية</h2>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">العملة</label>
                                <select
                                    value={settings?.currency || 'SAR'}
                                    onChange={(e) => handleChange('currency', e.target.value)}
                                    className="w-full px-4 py-2 border rounded-lg"
                                >
                                    <option value="SAR">ريال سعودي (SAR)</option>
                                    <option value="AED">درهم إماراتي (AED)</option>
                                    <option value="KWD">دينار كويتي (KWD)</option>
                                    <option value="EGP">جنيه مصري (EGP)</option>
                                    <option value="USD">دولار أمريكي (USD)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">المنطقة الزمنية</label>
                                <select
                                    value={settings?.timezone || 'Asia/Riyadh'}
                                    onChange={(e) => handleChange('timezone', e.target.value)}
                                    className="w-full px-4 py-2 border rounded-lg"
                                >
                                    <option value="Asia/Riyadh">الرياض (GMT+3)</option>
                                    <option value="Asia/Dubai">دبي (GMT+4)</option>
                                    <option value="Asia/Kuwait">الكويت (GMT+3)</option>
                                    <option value="Africa/Cairo">القاهرة (GMT+2)</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Tax & Shipping */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="text-lg font-bold mb-4">الضريبة والشحن</h2>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">نسبة الضريبة (%)</label>
                                <input
                                    type="number"
                                    value={settings?.tax_rate || 15}
                                    onChange={(e) => handleChange('tax_rate', parseFloat(e.target.value))}
                                    min="0"
                                    max="100"
                                    className="w-full px-4 py-2 border rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">سعر الشحن الافتراضي</label>
                                <input
                                    type="number"
                                    value={settings?.default_shipping_cost || 25}
                                    onChange={(e) => handleChange('default_shipping_cost', parseFloat(e.target.value))}
                                    min="0"
                                    className="w-full px-4 py-2 border rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">الحد الأدنى للشحن المجاني</label>
                                <input
                                    type="number"
                                    value={settings?.free_shipping_threshold || ''}
                                    onChange={(e) => handleChange('free_shipping_threshold', e.target.value ? parseFloat(e.target.value) : null)}
                                    min="0"
                                    placeholder="200"
                                    className="w-full px-4 py-2 border rounded-lg"
                                />
                            </div>
                            <div className="flex items-center">
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={settings?.tax_included || false}
                                        onChange={(e) => handleChange('tax_included', e.target.checked)}
                                        className="rounded text-primary-600"
                                    />
                                    <span>الأسعار شاملة الضريبة</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* SEO & Tracking */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="text-lg font-bold mb-4">SEO والتتبع</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">عنوان الموقع (Meta Title)</label>
                                <input
                                    type="text"
                                    value={settings?.meta_title || ''}
                                    onChange={(e) => handleChange('meta_title', e.target.value)}
                                    className="w-full px-4 py-2 border rounded-lg"
                                    placeholder="متجر | أفضل المنتجات بأسعار منافسة"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">وصف الموقع (Meta Description)</label>
                                <textarea
                                    value={settings?.meta_description || ''}
                                    onChange={(e) => handleChange('meta_description', e.target.value)}
                                    className="w-full px-4 py-2 border rounded-lg"
                                    rows={2}
                                    placeholder="تسوق أفضل المنتجات بأسعار منافسة مع شحن سريع لجميع مناطق المملكة"
                                />
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Google Analytics ID</label>
                                    <input
                                        type="text"
                                        value={settings?.google_analytics_id || ''}
                                        onChange={(e) => handleChange('google_analytics_id', e.target.value)}
                                        className="w-full px-4 py-2 border rounded-lg font-mono text-sm"
                                        placeholder="G-XXXXXXXXXX"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Facebook Pixel ID</label>
                                    <input
                                        type="text"
                                        value={settings?.facebook_pixel_id || ''}
                                        onChange={(e) => handleChange('facebook_pixel_id', e.target.value)}
                                        className="w-full px-4 py-2 border rounded-lg font-mono text-sm"
                                        placeholder="XXXXXXXXXXXXXXX"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

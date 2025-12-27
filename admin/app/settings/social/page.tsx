'use client';

import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/api';
import { Save, Loader2, MessageCircle, Phone, Facebook } from 'lucide-react';
import { toast, Toaster } from 'sonner';

export default function SocialSettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [config, setConfig] = useState({
        whatsapp: { enabled: true, number: '' },
        messenger: { enabled: false, username: '' },
        phone: { enabled: true, number: '' }
    });

    useEffect(() => {
        loadSettings();
    }, []);

    async function loadSettings() {
        try {
            const res = await adminApi.settings.get();
            if (res.data?.social_floating) {
                // Merge with defaults to ensure structure
                setConfig(prev => ({ ...prev, ...res.data.social_floating }));
            }
        } catch (error) {
            toast.error('فشل تحميل الإعدادات');
        } finally {
            setLoading(false);
        }
    }

    async function handleSave() {
        setSaving(true);
        try {
            // Get current settings first to avoid overwriting other stuff (handled by backend merge ideally, but good practice)
            // Actually our backend route merges with existing settings, so we just send the update.
            const updatePayload = {
                social_floating: config
            };

            await adminApi.settings.update(updatePayload);
            toast.success('تم حفظ إعدادات التواصل بنجاح');
        } catch (error) {
            toast.error('فشل الحفظ');
        } finally {
            setSaving(false);
        }
    }

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <Toaster richColors position="top-center" />

            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">زر التواصل العائم</h1>
                    <p className="text-gray-500 mt-1">أيقونات تظهر للعميل في أسفل الشاشة للتواصل السريع</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-black transition-all disabled:opacity-50"
                >
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    حفظ التغييرات
                </button>
            </div>

            <div className="grid gap-6">
                {/* WhatsApp */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col md:flex-row gap-6 items-start">
                    <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <MessageCircle className="w-6 h-6" />
                    </div>
                    <div className="flex-1 w-full">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-900">WhatsApp</h3>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={config.whatsapp.enabled}
                                    onChange={e => setConfig({ ...config, whatsapp: { ...config.whatsapp, enabled: e.target.checked } })}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                            </label>
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">رقم واتساب (مع مفتاح الدولة)</label>
                            <input
                                type="text"
                                placeholder="966500000000"
                                value={config.whatsapp.number}
                                onChange={e => setConfig({ ...config, whatsapp: { ...config.whatsapp, number: e.target.value } })}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none dir-ltr text-left"
                            />
                            <p className="text-xs text-gray-400">بدون علامة +</p>
                        </div>
                    </div>
                </div>

                {/* Messenger */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col md:flex-row gap-6 items-start">
                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Facebook className="w-6 h-6" />
                    </div>
                    <div className="flex-1 w-full">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-900">Facebook Messenger</h3>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={config.messenger.enabled}
                                    onChange={e => setConfig({ ...config, messenger: { ...config.messenger, enabled: e.target.checked } })}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">اسم المستخدم (Username)</label>
                            <input
                                type="text"
                                placeholder="page.username"
                                value={config.messenger.username}
                                onChange={e => setConfig({ ...config, messenger: { ...config.messenger, username: e.target.value } })}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dir-ltr text-left"
                            />
                            <p className="text-xs text-gray-400">اسم المستخدم الخاص بصفحتك على فيسبوك</p>
                        </div>
                    </div>
                </div>

                {/* Phone */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col md:flex-row gap-6 items-start">
                    <div className="w-12 h-12 bg-gray-100 text-gray-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Phone className="w-6 h-6" />
                    </div>
                    <div className="flex-1 w-full">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-900">اتصال هاتفي</h3>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={config.phone.enabled}
                                    onChange={e => setConfig({ ...config, phone: { ...config.phone, enabled: e.target.checked } })}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-600"></div>
                            </label>
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">رقم الهاتف</label>
                            <input
                                type="text"
                                placeholder="0500000000"
                                value={config.phone.number}
                                onChange={e => setConfig({ ...config, phone: { ...config.phone, number: e.target.value } })}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-gray-500 outline-none dir-ltr text-left"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

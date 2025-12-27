'use client';

import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/api';
import { Save, Loader2, Layout, Type, Image as ImageIcon, CreditCard, Facebook, Instagram, Twitter } from 'lucide-react';
import { toast, Toaster } from 'sonner';

export default function AppearanceSettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Default Layout Config
    const [layout, setLayout] = useState({
        top_bar: {
            enabled: true,
            left_text: '920000000 📞',
            right_text: '🚚 شحن مجاني للطلبات فوق 200 ر.س'
        },
        features_bar: {
            enabled: true,
            items: [
                { icon: 'Truck', title: 'شحن مجاني', desc: 'للطلبات فوق 200 ر.س' },
                { icon: 'RefreshCw', title: 'إرجاع سهل', desc: 'خلال 14 يوم' },
                { icon: 'ShieldCheck', title: 'منتجات أصلية', desc: 'ضمان الجودة 100%' },
                { icon: 'Headphones', title: 'دعم 24/7', desc: 'للرد على استفساراتكم' }
            ]
        },
        footer: {
            description: 'متجرك الإلكتروني الموثوق لأفضل المنتجات بأسعار منافسة.',
            social: {
                twitter: '',
                instagram: '',
                facebook: ''
            },
            payment_methods: {
                visa: true,
                mastercard: true,
                mada: true,
                apple_pay: true,
                cod: true
            }
        }
    });

    useEffect(() => {
        loadSettings();
    }, []);

    async function loadSettings() {
        try {
            const res = await adminApi.settings.get();
            if (res.data?.layout) {
                // Merge carefully to keep structure
                setLayout(prev => ({ ...prev, ...res.data.layout }));
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
            await adminApi.settings.update({ layout });
            toast.success('تم حفظ المظهر بنجاح');
        } catch (error) {
            toast.error('فشل الحفظ');
        } finally {
            setSaving(false);
        }
    }

    const updateFeature = (index: number, key: string, value: string) => {
        const newItems = [...layout.features_bar.items];
        newItems[index] = { ...newItems[index], [key]: value };
        setLayout({ ...layout, features_bar: { ...layout.features_bar, items: newItems } });
    };

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-8">
            <Toaster richColors position="top-center" />

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">تخصيص المظهر</h1>
                    <p className="text-gray-500 mt-1">تحكم في شرائط العرض والفوتر والأيقونات</p>
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

            {/* Top Bar Section */}
            <section className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <Layout className="w-5 h-5 text-gray-400" /> الشريط العلوي (Top Bar)
                    </h2>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={layout.top_bar.enabled}
                            onChange={e => setLayout({ ...layout, top_bar: { ...layout.top_bar, enabled: e.target.checked } })}
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-blue-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                        <span className="mr-3 text-sm font-medium text-gray-700">{layout.top_bar.enabled ? 'مفعل' : 'مخفي'}</span>
                    </label>
                </div>

                {layout.top_bar.enabled && (
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">النص الأيمن (مثل الشحن)</label>
                            <input
                                type="text"
                                value={layout.top_bar.right_text}
                                onChange={e => setLayout({ ...layout, top_bar: { ...layout.top_bar, right_text: e.target.value } })}
                                className="w-full px-4 py-2 border rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">النص الأيسر (مثل الهاتف)</label>
                            <input
                                type="text"
                                value={layout.top_bar.left_text}
                                onChange={e => setLayout({ ...layout, top_bar: { ...layout.top_bar, left_text: e.target.value } })}
                                className="w-full px-4 py-2 border rounded-lg dir-ltr text-right"
                            />
                        </div>
                    </div>
                )}
            </section>

            {/* Features Bar Section */}
            <section className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <Type className="w-5 h-5 text-gray-400" /> شريط المميزات (Features Bar)
                    </h2>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={layout.features_bar.enabled}
                            onChange={e => setLayout({ ...layout, features_bar: { ...layout.features_bar, enabled: e.target.checked } })}
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-blue-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                    </label>
                </div>

                {layout.features_bar.enabled && (
                    <div className="space-y-4">
                        {layout.features_bar.items.map((item, idx) => (
                            <div key={idx} className="flex gap-4 items-start bg-gray-50 p-4 rounded-xl">
                                <span className="mt-2 text-sm font-bold text-gray-400">#{idx + 1}</span>
                                <div className="grid md:grid-cols-3 gap-4 flex-1">
                                    <input
                                        placeholder="العنوان (مثال: شحن مجاني)"
                                        value={item.title}
                                        onChange={e => updateFeature(idx, 'title', e.target.value)}
                                        className="px-3 py-2 border rounded-lg"
                                    />
                                    <input
                                        placeholder="الوصف (مثال: للطلبات فوق 200)"
                                        value={item.desc}
                                        onChange={e => updateFeature(idx, 'desc', e.target.value)}
                                        className="px-3 py-2 border rounded-lg"
                                    />
                                    <input
                                        placeholder="اسم الأيقونة (Truck, Shield...)"
                                        value={item.icon}
                                        onChange={e => updateFeature(idx, 'icon', e.target.value)}
                                        className="px-3 py-2 border rounded-lg dir-ltr"
                                    />
                                </div>
                            </div>
                        ))}
                        <p className="text-xs text-gray-500 mt-2">* الأيقونات المدعومة: Truck, RefreshCw, ShieldCheck, Headphones, CreditCard, Tag</p>
                    </div>
                )}
            </section>

            {/* Footer Section */}
            <section className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <ImageIcon className="w-5 h-5 text-gray-400" /> تذييل الصفحة (Footer)
                    </h2>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">وصف المتجر</label>
                        <textarea
                            value={layout.footer.description}
                            onChange={e => setLayout({ ...layout, footer: { ...layout.footer, description: e.target.value } })}
                            className="w-full px-4 py-2 border rounded-lg h-24 resize-none"
                        />
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-bold text-sm text-gray-700">روابط التواصل الاجتماعي</h3>
                        <div className="relative">
                            <Twitter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                placeholder="رابط تويتر (X)"
                                value={layout.footer.social.twitter}
                                onChange={e => setLayout({ ...layout, footer: { ...layout.footer, social: { ...layout.footer.social, twitter: e.target.value } } })}
                                className="w-full pr-10 pl-4 py-2 border rounded-lg dir-ltr"
                            />
                        </div>
                        <div className="relative">
                            <Instagram className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                placeholder="رابط انستجرام"
                                value={layout.footer.social.instagram}
                                onChange={e => setLayout({ ...layout, footer: { ...layout.footer, social: { ...layout.footer.social, instagram: e.target.value } } })}
                                className="w-full pr-10 pl-4 py-2 border rounded-lg dir-ltr"
                            />
                        </div>
                        <div className="relative">
                            <Facebook className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                placeholder="رابط فيسبوك"
                                value={layout.footer.social.facebook}
                                onChange={e => setLayout({ ...layout, footer: { ...layout.footer, social: { ...layout.footer.social, facebook: e.target.value } } })}
                                className="w-full pr-10 pl-4 py-2 border rounded-lg dir-ltr"
                            />
                        </div>
                    </div>
                </div>

                <div className="mt-8">
                    <h3 className="font-bold text-sm text-gray-700 mb-4 flex items-center gap-2">
                        <CreditCard className="w-4 h-4" /> طرق الدفع المقبولة (Icons)
                    </h3>
                    <div className="flex gap-4 flex-wrap">
                        {Object.entries(layout.footer.payment_methods).map(([key, val]) => (
                            <label key={key} className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-lg cursor-pointer border hover:border-blue-500 transition-colors">
                                <input
                                    type="checkbox"
                                    checked={val as boolean}
                                    onChange={e => setLayout({
                                        ...layout,
                                        footer: {
                                            ...layout.footer,
                                            payment_methods: {
                                                ...layout.footer.payment_methods,
                                                [key]: e.target.checked
                                            }
                                        }
                                    })}
                                    className="rounded text-blue-600"
                                />
                                <span className="capitalize font-medium">{key.replace('_', ' ')}</span>
                            </label>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}

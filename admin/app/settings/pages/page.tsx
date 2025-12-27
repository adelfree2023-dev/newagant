'use client';

import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/api';
import { Save, Loader2, Info, Truck, RotateCcw, MessageSquare, HelpCircle } from 'lucide-react';
import { toast, Toaster } from 'sonner';

export default function PagesEditor() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('about');

    // Content State
    const [content, setContent] = useState({
        about: '',
        shipping: '',
        returns: '',
        contact: '',
        faq: [] // Future: Array of Q&A
    });

    // Load Data
    useEffect(() => {
        async function load() {
            try {
                const res = await adminApi.pages.get();
                if (res.data) {
                    setContent(prev => ({ ...prev, ...res.data }));
                }
            } catch (error) {
                toast.error('فشل تحميل محتوى الصفحات');
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    // Save Data
    const handleSave = async () => {
        setSaving(true);
        try {
            await adminApi.pages.update(content);
            toast.success('تم حفظ التعديلات بنجاح');
        } catch (error) {
            toast.error('حدث خطأ أثناء الحفظ');
        } finally {
            setSaving(false);
        }
    };

    const tabs = [
        { id: 'about', label: 'من نحن', icon: Info },
        { id: 'shipping', label: 'الشحن والتوصيل', icon: Truck },
        { id: 'returns', label: 'الاسترجاع', icon: RotateCcw },
        { id: 'contact', label: 'اتصل بنا', icon: MessageSquare },
        { id: 'faq', label: 'الأسئلة الشائعة', icon: HelpCircle },
    ];

    if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin w-8 h-8" /></div>;

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <Toaster position="top-center" richColors />

            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">إدارة صفحات المتجر</h1>
                    <p className="text-gray-500 mt-1">تحكم في محتوى الصفحات التعريفية (من نحن، الشحن، الاسترجاع...)</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-black transition-all disabled:opacity-50"
                >
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    حفظ التعديلات
                </button>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
                {/* Sidebar Tabs */}
                <div className="w-full md:w-64 flex flex-col gap-2">
                    {tabs.map(tab => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-right transition-all ${activeTab === tab.id
                                        ? 'bg-blue-50 text-blue-600 font-bold shadow-sm'
                                        : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                <Icon className="w-5 h-5" />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Editor Area */}
                <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 min-h-[500px]">
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            محتوى الصفحة ({tabs.find(t => t.id === activeTab)?.label})
                        </label>
                        <textarea
                            value={content[activeTab as keyof typeof content] as string || ''}
                            onChange={(e) => setContent({ ...content, [activeTab]: e.target.value })}
                            className="w-full h-96 p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none font-sans text-lg leading-relaxed"
                            placeholder="اكتب المحتوى هنا..."
                        ></textarea>
                        <p className="text-xs text-gray-400 mt-2">
                            * يدعم كتابة النصوص البسيطة حالياً. سيتم إضافة محرر متطور قريباً.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

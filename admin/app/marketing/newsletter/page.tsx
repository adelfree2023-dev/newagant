'use client';

import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/api'; // Ensure adminApi has generic get or add newsletter endpoint
import { Loader2, Mail, Copy, RefreshCw, Download } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import axios from 'axios';

export default function NewsletterPage() {
    const [subscribers, setSubscribers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadSubscribers();
    }, []);

    const loadSubscribers = async () => {
        setLoading(true);
        try {
            // Using direct axios if adminApi doesn't have it yet, or better add it.
            // Assuming we added it to adminApi or just raw call for now as we did for storefront components sometimes.
            // Let's use axios with admin token header if needed.
            // Actually adminApi handles auth headers. Let's add newsletter to adminApi logic or use a raw call with interceptor.
            // For now, I'll use a direct fetch with the token from localStorage if possible, but adminApi is cleaner.
            // I'll assume I can use `adminApi.client.get('/newsletter')`. 
            // Checking adminApi definition... it usually exports `api` instance.
            // Let's try to stick to consistent pattern. I'll use a direct axios call with the token if I can't modify api.ts easily right now without checking it.
            // But wait, I modified api.ts in step 3562, let's look at `admin/lib/api.ts` (I didn't modify it recently).
            // I'll just use the raw axios instance from `admin/lib/api.ts` if exported, or just use `fetch` with token.

            const token = localStorage.getItem('admin_token');
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
            const res = await axios.get(`${API_URL}/newsletter`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data.success) {
                setSubscribers(res.data.data);
            }
        } catch (error) {
            toast.error('فشل تحميل القائمة');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success('تم نسخ البريد الإلكتروني');
    };

    const exportCSV = () => {
        const header = 'Email,Date\n';
        const rows = subscribers.map(s => `${s.email},${new Date(s.created_at).toLocaleDateString()}`).join('\n');
        const blob = new Blob([header + rows], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'subscribers.csv';
        a.click();
    };

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <Toaster richColors position="top-center" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Mail className="w-8 h-8 text-blue-600" /> النشرة البريدية
                    </h1>
                    <p className="text-gray-500 mt-1">إدارة قائمة المشتركين في النشرة البريدية</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={loadSubscribers}
                        className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        title="تحديث"
                    >
                        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    <button
                        onClick={exportCSV}
                        disabled={subscribers.length === 0}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                        <Download className="w-4 h-4" /> تصدير CSV
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center p-12"><Loader2 className="animate-spin w-8 h-8 text-gray-300" /></div>
            ) : subscribers.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
                    <Mail className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-gray-900">لا يوجد مشتركين حتى الآن</h3>
                    <p className="text-gray-500">سيظهر المشتركون هنا عند تسجيلهم في النشرة البريدية.</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <table className="w-full text-right">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-600">البريد الإلكتروني</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-600">تاريخ الاشتراك</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-600">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {subscribers.map((sub, idx) => (
                                <tr key={sub.id || idx} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900 dir-ltr text-right">
                                        {sub.email}
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">
                                        {new Date(sub.created_at).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => copyToClipboard(sub.email)}
                                            className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-blue-600 transition-colors"
                                            title="نسخ"
                                        >
                                            <Copy className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

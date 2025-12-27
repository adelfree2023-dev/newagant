'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Package, Truk, CheckCircle, Clock } from 'lucide-react';
import { toast, Toaster } from 'sonner';

// Import api client 
// Note: We need to add `orders.track` to storeApi in lib/api.ts
import { storeApi } from '@/lib/api';

export default function TrackOrderPage() {
    const [orderId, setOrderId] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<any>(null);

    const handleTrack = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setStatus(null);

        try {
            const res = await storeApi.orders.track(orderId);
            setStatus(res);
        } catch (error) {
            toast.error('لم يتم العثور على طلب بهذا الرقم');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4" dir="rtl">
            <Toaster position="top-center" richColors />
            <div className="max-w-xl mx-auto">
                <div className="text-center mb-12">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Package className="w-8 h-8" />
                    </motion.div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">تتبع طلبك</h1>
                    <p className="text-gray-500">أدخل رقم الطلب لمعرفة حالته الحالية</p>
                </div>

                <div className="bg-white rounded-3xl shadow-sm p-8">
                    <form onSubmit={handleTrack} className="flex gap-4 mb-8">
                        <input
                            type="text"
                            placeholder="رقم الطلب (مثال: 123)"
                            value={orderId}
                            onChange={(e) => setOrderId(e.target.value)}
                            className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                            required
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-all disabled:opacity-50"
                        >
                            {loading ? '...' : 'تتبع'}
                        </button>
                    </form>

                    {status && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="border-t pt-8">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <p className="text-sm text-gray-500">رقم الطلب</p>
                                    <p className="font-bold text-lg">#{status.id}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">تاريخ الطلب</p>
                                    <p className="font-bold text-lg">{status.date}</p>
                                </div>
                            </div>

                            {/* Status Steps */}
                            <div className="space-y-6">
                                <Step title="تم استلام الطلب" active={true} completed={true} />
                                <Step title="جاري التجهيز" active={true} completed={true} />
                                <Step title="تم الشحن" active={true} completed={false} />
                                <Step title="تم التوصيل" active={false} completed={false} />
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
}

function Step({ title, active, completed }: any) {
    return (
        <div className="flex items-center gap-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${completed ? 'bg-green-500 border-green-500 text-white' :
                active ? 'bg-blue-500 border-blue-500 text-white' : 'border-gray-200 text-gray-300'
                }`}>
                {completed ? <CheckCircle className="w-5 h-5" /> : active ? <Clock className="w-5 h-5" /> : <div className="w-2 h-2 bg-gray-300 rounded-full" />}
            </div>
            <p className={`font-medium ${active || completed ? 'text-gray-900' : 'text-gray-400'}`}>{title}</p>
        </div>
    );
}

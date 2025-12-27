'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { User, Lock, ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast, Toaster } from 'sonner';

export default function LoginPage() {
    const { login, loading } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirect = searchParams.get('redirect') || '/';

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const res = await login(email, password);
            if (res.success) {
                toast.success('تم تسجيل الدخول بنجاح');
                router.push(redirect);
            } else {
                toast.error(res.error || 'فشل تسجيل الدخول');
            }
        } catch (err) {
            toast.error('حدث خطأ غير متوقع');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 bg-[url('https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&q=80')] bg-cover bg-center" dir="rtl">
            <div className="absolute inset-0 bg-white/90 backdrop-blur-sm"></div>
            <Toaster position="top-center" richColors />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 w-full max-w-md relative z-10"
            >
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">مرحباً بعودتك 👋</h1>
                    <p className="text-gray-500">سجل دخولك لمتابعة طلباتك</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">البريد الإلكتروني</label>
                        <div className="relative">
                            <User className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pr-12 pl-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                placeholder="name@example.com"
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">كلمة المرور</label>
                        <div className="relative">
                            <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pr-12 pl-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" className="rounded text-blue-600" />
                            <span>تذكرني</span>
                        </label>
                        <a href="#" className="text-blue-600 hover:underline">نسيت كلمة المرور؟</a>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-all shadow-lg hover:shadow-xl translate-y-0 hover:-translate-y-1 disabled:opacity-50 disabled:translate-y-0 flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : 'دخول'}
                    </button>

                    <div className="text-center text-sm text-gray-500">
                        ليس لديك حساب؟ <Link href="/register" className="text-blue-600 font-bold hover:underline">سجل الآن</Link>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}

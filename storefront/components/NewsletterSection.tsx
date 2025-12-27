'use client';

import { useState } from 'react';
import axios from 'axios';
import { Mail, Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function NewsletterSection() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [subscribed, setSubscribed] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Using direct axios or add to api.ts. Direct is fine for this single component for now.
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
            await axios.post(`${API_URL}/newsletter/subscribe`, { email });

            setSubscribed(true);
            toast.success('تم الاشتراك في النشرة البريدية بنجاح');
            setEmail('');
        } catch (error) {
            toast.error('حدث خطأ أثناء الاشتراك');
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="bg-gray-100 py-16">
            <div className="max-w-7xl mx-auto px-4">
                <div className="bg-gray-900 rounded-3xl p-8 md:p-12 text-center md:text-start flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
                    {/* Background Pattern */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>

                    <div className="relative z-10 md:w-1/2">
                        <h2 className="text-3xl font-bold text-white mb-2">اشترك في نشرتنا البريدية</h2>
                        <p className="text-gray-400">احصل على آخر العروض والتخفيضات مباشرة في بريدك الإلكتروني.</p>
                    </div>

                    <div className="relative z-10 w-full md:w-1/2">
                        {subscribed ? (
                            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex items-center justify-center gap-2 text-green-400">
                                <CheckCircle className="w-6 h-6" />
                                <span className="font-bold">شكراً لاشتراكك معنا!</span>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="flex gap-2">
                                <div className="relative flex-1">
                                    <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="أدخل بريدك الإلكتروني"
                                        className="w-full pr-12 pl-4 py-4 rounded-xl bg-white/10 border border-white/10 text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-8 py-4 bg-white text-gray-900 font-bold rounded-xl hover:bg-gray-100 transition-colors disabled:opacity-50 min-w-[120px] flex items-center justify-center"
                                >
                                    {loading ? <Loader2 className="animate-spin" /> : 'اشترك'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}

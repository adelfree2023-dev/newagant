'use client';

/**
 * Upgrade Page - Admin Panel
 * Shown when a tenant tries to use a feature/theme not available in their plan
 */

import { useState, useEffect } from 'react';
import { ArrowRight, Check, Crown, Zap, Building2 } from 'lucide-react';

interface Plan {
    id: string;
    name: string;
    name_ar: string;
    price: number;
    features: string[];
}

const PLANS: Plan[] = [
    {
        id: 'basic',
        name: 'Basic',
        name_ar: 'الأساسية',
        price: 99,
        features: [
            '100 منتج',
            '20 تصنيف',
            '3 موظفين',
            'نطاق مخصص',
            'تحليلات أساسية',
            '7 ثيمات متاحة'
        ]
    },
    {
        id: 'pro',
        name: 'Pro',
        name_ar: 'الاحترافية',
        price: 299,
        features: [
            '500 منتج',
            '50 تصنيف',
            '10 موظفين',
            'جميع الثيمات',
            'تحليلات متقدمة',
            'API Access',
            'دعم أولوية'
        ]
    },
    {
        id: 'enterprise',
        name: 'Enterprise',
        name_ar: 'المؤسسية',
        price: 999,
        features: [
            'منتجات غير محدودة',
            'تصنيفات غير محدودة',
            'موظفين غير محدودين',
            'جميع الثيمات المميزة',
            'دعم مخصص 24/7',
            'تخصيص كامل'
        ]
    }
];

export default function UpgradePage() {
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
    const [blockedTheme, setBlockedTheme] = useState<string | null>(null);

    useEffect(() => {
        // Get blocked theme from URL params if redirected from theme selection
        const params = new URLSearchParams(window.location.search);
        const theme = params.get('theme');
        if (theme) setBlockedTheme(theme);
    }, []);

    const handleUpgrade = (planId: string) => {
        setSelectedPlan(planId);
        // In production: redirect to payment gateway
        alert(`سيتم توجيهك لإتمام الاشتراك في باقة ${planId}`);
    };

    const getIcon = (planId: string) => {
        switch (planId) {
            case 'basic': return <Zap className="w-8 h-8 text-blue-500" />;
            case 'pro': return <Crown className="w-8 h-8 text-yellow-500" />;
            case 'enterprise': return <Building2 className="w-8 h-8 text-purple-500" />;
            default: return null;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-16 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
                        ترقية الباقة
                    </h1>
                    {blockedTheme && (
                        <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4 max-w-md mx-auto mb-6">
                            <p className="text-yellow-200">
                                ثيم <strong className="text-yellow-400">{blockedTheme}</strong> يتطلب باقة أعلى
                            </p>
                        </div>
                    )}
                    <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                        اختر الباقة المناسبة لاحتياجات متجرك وافتح جميع المميزات
                    </p>
                </div>

                {/* Plans Grid */}
                <div className="grid md:grid-cols-3 gap-8">
                    {PLANS.map((plan, i) => (
                        <div
                            key={plan.id}
                            className={`relative bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border transition-all duration-300 hover:scale-105 ${plan.id === 'pro'
                                    ? 'border-yellow-500/50 ring-2 ring-yellow-500/30'
                                    : 'border-slate-700/50 hover:border-slate-600'
                                }`}
                        >
                            {/* Popular Badge */}
                            {plan.id === 'pro' && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-500 to-orange-500 text-black text-sm font-bold px-4 py-1 rounded-full">
                                    الأكثر شيوعاً
                                </div>
                            )}

                            {/* Icon */}
                            <div className="mb-6">
                                {getIcon(plan.id)}
                            </div>

                            {/* Name & Price */}
                            <h3 className="text-2xl font-bold text-white mb-2">{plan.name_ar}</h3>
                            <div className="flex items-baseline gap-1 mb-6">
                                <span className="text-4xl font-black text-white">{plan.price}</span>
                                <span className="text-slate-400">ريال/شهرياً</span>
                            </div>

                            {/* Features */}
                            <ul className="space-y-3 mb-8">
                                {plan.features.map((feature, fi) => (
                                    <li key={fi} className="flex items-center gap-3 text-slate-300">
                                        <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            {/* CTA Button */}
                            <button
                                onClick={() => handleUpgrade(plan.id)}
                                className={`w-full py-3 px-6 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${plan.id === 'pro'
                                        ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-black hover:from-yellow-400 hover:to-orange-400'
                                        : 'bg-slate-700 text-white hover:bg-slate-600'
                                    }`}
                            >
                                اشترك الآن
                                <ArrowRight className="w-5 h-5 rotate-180" />
                            </button>
                        </div>
                    ))}
                </div>

                {/* Bottom Note */}
                <p className="text-center text-slate-500 mt-12">
                    جميع الباقات تشمل ضمان استرداد الأموال خلال 14 يوم
                </p>
            </div>
        </div>
    );
}

'use client';

import { useState, useEffect } from 'react';
import { Palette, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const THEMES = [
    { name: 'أزرق', color: '#2563EB', class: 'bg-blue-600' },
    { name: 'أحمر', color: '#DC2626', class: 'bg-red-600' },
    { name: 'أخضر', color: '#059669', class: 'bg-emerald-600' },
    { name: 'ذهبي', color: '#D97706', class: 'bg-amber-600' },
    { name: 'أسود', color: '#111827', class: 'bg-gray-900' },
];

export default function ThemeSwitcher() {
    const [open, setOpen] = useState(false);
    const [activeTheme, setActiveTheme] = useState(THEMES[0].color);

    useEffect(() => {
        // Load theme from local storage
        const savedTheme = localStorage.getItem('theme_color');
        if (savedTheme) {
            applyTheme(savedTheme);
        }
    }, []);

    const applyTheme = (color: string) => {
        setActiveTheme(color);
        document.documentElement.style.setProperty('--primary-color', color);

        // HACK: Also update Tailwind colors if using CSS variables mapping or force refresh
        // For this implementation, we assume global.css maps primary-* to --primary-color
        // Or we rely on component inline styles for critical parts.

        // Let's assume we want to save this
        localStorage.setItem('theme_color', color);
    };

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="fixed top-1/2 left-0 z-50 p-3 bg-white shadow-lg rounded-r-xl border border-gray-200 hover:bg-gray-50 transition-colors"
                title="تغيير ألوان المتجر"
            >
                <Palette className="w-5 h-5 text-gray-600" />
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ x: -300 }}
                        animate={{ x: 0 }}
                        exit={{ x: -300 }}
                        className="fixed top-0 left-0 h-full w-64 bg-white shadow-2xl z-[60] p-6 border-r"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="font-bold text-lg">تخصيص المظهر</h3>
                            <button onClick={() => setOpen(false)} className="p-1 hover:bg-gray-100 rounded-full">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">لون المتجر الرئيسي</label>
                                <div className="grid grid-cols-5 gap-2">
                                    {THEMES.map((theme) => (
                                        <button
                                            key={theme.name}
                                            onClick={() => applyTheme(theme.color)}
                                            className={`w-8 h-8 rounded-full ${theme.class} ring-2 ring-offset-2 transition-all ${activeTheme === theme.color ? 'ring-gray-400 scale-110' : 'ring-transparent opacity-80 hover:opacity-100'}`}
                                            title={theme.name}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="p-4 bg-gray-50 rounded-lg text-xs text-gray-500">
                                <p>هذه الإعدادات تحفظ في متصفحك وتبقى عند عودتك للمتجر.</p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Backdrop */}
            {open && (
                <div onClick={() => setOpen(false)} className="fixed inset-0 bg-black/20 z-[55]" />
            )}
        </>
    );
}

'use client';

import Link from 'next/link';
import { useStoreConfig } from '@/context/StoreConfigContext';
import { Facebook, Twitter, Instagram, CreditCard } from 'lucide-react';

export default function Footer() {
    const { config } = useStoreConfig();
    const footer = config?.settings?.layout?.footer;
    const social = footer?.social;
    const payments = footer?.payment_methods;

    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-gray-900 text-white pt-12 pb-6">
            <div className="max-w-7xl mx-auto px-4">
                <div className="grid md:grid-cols-4 gap-8 mb-8">
                    {/* About */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-2xl">🏪</span>
                            <span className="font-bold text-lg">{config?.name || 'المتجر'}</span>
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            {footer?.description || 'متجرك الإلكتروني الموثوق لأفضل المنتجات بأسعار منافسة وشحن سريع لجميع مناطق المملكة.'}
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-bold mb-4">روابط سريعة</h4>
                        <ul className="space-y-2 text-gray-400 text-sm">
                            <li><Link href="/products" className="hover:text-white transition-colors">المنتجات</Link></li>
                            <li><Link href="/offers" className="hover:text-white transition-colors">العروض</Link></li>
                            <li><Link href="/about" className="hover:text-white transition-colors">من نحن</Link></li>
                            <li><Link href="/contact" className="hover:text-white transition-colors">اتصل بنا</Link></li>
                        </ul>
                    </div>

                    {/* Customer Service */}
                    <div>
                        <h4 className="font-bold mb-4">خدمة العملاء</h4>
                        <ul className="space-y-2 text-gray-400 text-sm">
                            <li><Link href="/track-order" className="hover:text-white transition-colors">تتبع طلبك</Link></li>
                            <li><Link href="/faq" className="hover:text-white transition-colors">الأسئلة الشائعة</Link></li>
                            <li><Link href="/shipping" className="hover:text-white transition-colors">سياسة الشحن</Link></li>
                            <li><Link href="/returns" className="hover:text-white transition-colors">سياسة الإرجاع</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="font-bold mb-4">تواصل معنا</h4>
                        <ul className="space-y-2 text-gray-400 text-sm">
                            <li className="dir-ltr text-right">📞 920000000</li>
                            <li>📧 support@store.com</li>
                            <li>📍 الرياض، المملكة العربية السعودية</li>
                        </ul>
                        <div className="flex gap-3 mt-4">
                            {social?.twitter && (
                                <a href={social.twitter} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-[#1DA1F2] transition-colors">
                                    <Twitter className="w-5 h-5" />
                                </a>
                            )}
                            {social?.facebook && (
                                <a href={social.facebook} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-[#4267B2] transition-colors">
                                    <Facebook className="w-5 h-5" />
                                </a>
                            )}
                            {social?.instagram && (
                                <a href={social.instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-[#E1306C] transition-colors">
                                    <Instagram className="w-5 h-5" />
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                {/* Payment Methods */}
                {(payments?.visa || payments?.mastercard || payments?.apple_pay) && (
                    <div className="border-t border-gray-800 pt-6 mb-6">
                        <div className="flex items-center justify-center gap-4 text-2xl">
                            {payments?.visa && <span title="Visa" className="opacity-80 hover:opacity-100">💳</span>}
                            {payments?.mastercard && <span title="Mastercard" className="opacity-80 hover:opacity-100">💳</span>}
                            {payments?.mada && <span title="Mada" className="opacity-80 hover:opacity-100">💳</span>}
                            {payments?.apple_pay && <span title="Apple Pay" className="opacity-80 hover:opacity-100"></span>}
                            {payments?.cod && <span title="Cash on Delivery" className="opacity-80 hover:opacity-100">💵</span>}
                        </div>
                    </div>
                )}

                {/* Copyright */}
                <div className="text-center text-gray-500 text-sm border-t border-gray-800 pt-6">
                    <p>© {currentYear} {config?.name || 'المتجر'}. جميع الحقوق محفوظة.</p>
                    <p className="mt-1">
                        <Link href="/terms" className="hover:text-white transition-colors">الشروط والأحكام</Link>
                        {' • '}
                        <Link href="/privacy" className="hover:text-white transition-colors">سياسة الخصوصية</Link>
                    </p>
                </div>
            </div>
        </footer>
    );
}

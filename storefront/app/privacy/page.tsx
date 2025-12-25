'use client'

import { Shield, Eye, Lock, FileText, Mail, Calendar } from 'lucide-react'

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero */}
            <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-16">
                <div className="container mx-auto px-4 text-center">
                    <Shield className="w-14 h-14 mx-auto mb-4 opacity-80" />
                    <h1 className="text-4xl font-bold mb-2">سياسة الخصوصية</h1>
                    <p className="text-xl text-white/80">حماية بياناتك أولوية قصوى</p>
                </div>
            </section>

            <section className="py-12">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
                        <Calendar className="w-4 h-4" />
                        <span>آخر تحديث: ديسمبر 2024</span>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm p-8 space-y-8">
                        {/* Intro */}
                        <div>
                            <p className="text-gray-600 leading-relaxed">
                                نحن في متجرنا نقدر خصوصيتك ونلتزم بحماية بياناتك الشخصية. توضح هذه السياسة كيفية جمع واستخدام وحماية معلوماتك.
                            </p>
                        </div>

                        {/* Section 1 */}
                        <div>
                            <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900 mb-4">
                                <Eye className="w-5 h-5 text-primary-600" />
                                المعلومات التي نجمعها
                            </h2>
                            <ul className="space-y-2 text-gray-600">
                                <li>• <strong>معلومات الحساب:</strong> الاسم، البريد الإلكتروني، رقم الهاتف</li>
                                <li>• <strong>عناوين الشحن:</strong> العنوان التفصيلي لتوصيل الطلبات</li>
                                <li>• <strong>معلومات الدفع:</strong> تتم معالجتها عبر بوابات دفع آمنة ولا نخزنها</li>
                                <li>• <strong>سجل الطلبات:</strong> تاريخ مشترياتك لتحسين تجربتك</li>
                                <li>• <strong>بيانات التصفح:</strong> Cookies لتحسين أداء الموقع</li>
                            </ul>
                        </div>

                        {/* Section 2 */}
                        <div>
                            <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900 mb-4">
                                <FileText className="w-5 h-5 text-primary-600" />
                                كيف نستخدم معلوماتك
                            </h2>
                            <ul className="space-y-2 text-gray-600">
                                <li>• معالجة وتوصيل طلباتك</li>
                                <li>• إرسال تحديثات حالة الطلب</li>
                                <li>• تقديم دعم العملاء</li>
                                <li>• إرسال العروض والتخفيضات (بموافقتك)</li>
                                <li>• تحسين خدماتنا وتجربة المستخدم</li>
                            </ul>
                        </div>

                        {/* Section 3 */}
                        <div>
                            <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900 mb-4">
                                <Lock className="w-5 h-5 text-primary-600" />
                                حماية البيانات
                            </h2>
                            <ul className="space-y-2 text-gray-600">
                                <li>• تشفير SSL لجميع البيانات المنقولة</li>
                                <li>• خوادم آمنة محمية بجدران نارية</li>
                                <li>• وصول محدود للموظفين المخولين فقط</li>
                                <li>• مراجعة أمنية دورية</li>
                                <li>• الامتثال لمعايير PCI-DSS للدفع الإلكتروني</li>
                            </ul>
                        </div>

                        {/* Section 4 */}
                        <div>
                            <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900 mb-4">
                                <Shield className="w-5 h-5 text-primary-600" />
                                حقوقك
                            </h2>
                            <ul className="space-y-2 text-gray-600">
                                <li>• الوصول إلى بياناتك الشخصية</li>
                                <li>• تصحيح أو تحديث معلوماتك</li>
                                <li>• حذف حسابك وبياناتك</li>
                                <li>• إلغاء الاشتراك في الرسائل التسويقية</li>
                                <li>• رفض مشاركة بياناتك مع أطراف ثالثة</li>
                            </ul>
                        </div>

                        {/* Contact */}
                        <div className="bg-gray-50 rounded-xl p-6">
                            <h3 className="flex items-center gap-2 font-bold text-gray-900 mb-3">
                                <Mail className="w-5 h-5" />
                                للتواصل معنا بخصوص الخصوصية
                            </h3>
                            <p className="text-gray-600">
                                البريد الإلكتروني: <a href="mailto:privacy@store.com" className="text-primary-600 hover:underline">privacy@store.com</a>
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

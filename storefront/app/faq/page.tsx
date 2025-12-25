'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Search, HelpCircle } from 'lucide-react'

const faqCategories = [
    {
        title: 'الطلبات والشحن',
        items: [
            { q: 'كيف أتتبع طلبي؟', a: 'يمكنك تتبع طلبك من خلال صفحة "تتبع الطلب" أو من حسابك الشخصي. ستحتاج رقم الطلب والبريد الإلكتروني.' },
            { q: 'ما هي مدة التوصيل؟', a: 'التوصيل داخل الرياض: 1-2 يوم عمل. باقي المناطق: 3-5 أيام عمل.' },
            { q: 'هل يمكنني تغيير عنوان التوصيل؟', a: 'نعم، يمكنك تغيير العنوان قبل شحن الطلب من خلال التواصل مع خدمة العملاء.' },
            { q: 'هل تتوفر خدمة التوصيل المجاني؟', a: 'نعم، التوصيل مجاني للطلبات فوق 200 ريال داخل المملكة.' },
        ]
    },
    {
        title: 'الدفع',
        items: [
            { q: 'ما طرق الدفع المتاحة؟', a: 'نقبل: بطاقات الائتمان (فيزا، ماستركارد)، مدى، Apple Pay، الدفع عند الاستلام، تمارا (تقسيط).' },
            { q: 'هل الدفع آمن؟', a: 'نعم، جميع المعاملات مشفرة بتقنية SSL ونستخدم بوابات دفع موثوقة ومعتمدة.' },
            { q: 'هل يمكنني الدفع عند الاستلام؟', a: 'نعم، متاح الدفع عند الاستلام برسوم إضافية 15 ريال.' },
        ]
    },
    {
        title: 'الإرجاع والاستبدال',
        items: [
            { q: 'ما سياسة الإرجاع؟', a: 'يمكنك إرجاع المنتج خلال 14 يوم من الاستلام بشرط أن يكون بحالته الأصلية مع الفاتورة.' },
            { q: 'كيف أطلب استرجاع مبلغ؟', a: 'تواصل معنا عبر صفحة اتصل بنا أو الواتساب، وسنرتب لاستلام المنتج وإرجاع المبلغ خلال 5-7 أيام عمل.' },
            { q: 'هل يمكنني استبدال المنتج؟', a: 'نعم، يمكنك استبدال المنتج بمقاس أو لون آخر خلال 14 يوم من الاستلام.' },
        ]
    },
    {
        title: 'الحساب والعضوية',
        items: [
            { q: 'كيف أنشئ حساب؟', a: 'اضغط على "تسجيل" وأدخل بياناتك، أو يمكنك التسجيل أثناء إتمام الطلب.' },
            { q: 'نسيت كلمة المرور', a: 'اضغط على "نسيت كلمة المرور" في صفحة تسجيل الدخول وسنرسل لك رابط إعادة تعيين.' },
            { q: 'ما فوائد إنشاء حساب؟', a: 'تتبع الطلبات، حفظ العناوين، قائمة المفضلة، وعروض حصرية للأعضاء.' },
        ]
    },
]

export default function FAQPage() {
    const [searchQuery, setSearchQuery] = useState('')
    const [openItems, setOpenItems] = useState<string[]>([])

    const toggleItem = (id: string) => {
        setOpenItems(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero */}
            <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-20">
                <div className="container mx-auto px-4 text-center">
                    <HelpCircle className="w-16 h-16 mx-auto mb-4 opacity-80" />
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">الأسئلة الشائعة</h1>
                    <p className="text-xl text-white/80 mb-8">ابحث عن إجابات لأسئلتك</p>
                    <div className="max-w-md mx-auto relative">
                        <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="ابحث في الأسئلة..."
                            className="w-full pr-12 pl-4 py-4 rounded-xl text-gray-900 focus:ring-4 focus:ring-white/30 outline-none"
                        />
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="py-16">
                <div className="container mx-auto px-4 max-w-4xl">
                    {faqCategories.map((category, catIndex) => (
                        <div key={catIndex} className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">{category.title}</h2>
                            <div className="space-y-3">
                                {category.items
                                    .filter(item =>
                                        !searchQuery ||
                                        item.q.includes(searchQuery) ||
                                        item.a.includes(searchQuery)
                                    )
                                    .map((item, itemIndex) => {
                                        const id = `${catIndex}-${itemIndex}`
                                        const isOpen = openItems.includes(id)
                                        return (
                                            <div key={id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                                                <button
                                                    onClick={() => toggleItem(id)}
                                                    className="w-full p-5 flex items-center justify-between text-right hover:bg-gray-50 transition"
                                                >
                                                    <span className="font-medium text-gray-900">{item.q}</span>
                                                    {isOpen ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                                                </button>
                                                {isOpen && (
                                                    <div className="px-5 pb-5">
                                                        <p className="text-gray-600 leading-relaxed">{item.a}</p>
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    )
}

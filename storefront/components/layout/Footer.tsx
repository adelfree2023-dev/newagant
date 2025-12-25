import Link from 'next/link'
import { Facebook, Twitter, Instagram, Youtube, Phone, Mail, MapPin } from 'lucide-react'

export default function Footer() {
    return (
        <footer className="bg-dark-200 text-gray-300 mt-16">
            {/* Newsletter */}
            <div className="bg-primary-500 py-8">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div>
                            <h3 className="text-white text-xl font-bold">اشترك في نشرتنا البريدية</h3>
                            <p className="text-primary-100">احصل على أحدث العروض والخصومات</p>
                        </div>
                        <div className="flex w-full md:w-auto">
                            <input
                                type="email"
                                placeholder="البريد الإلكتروني"
                                className="flex-grow md:w-80 px-4 py-3 rounded-r-lg focus:outline-none text-gray-900"
                                dir="ltr"
                            />
                            <button className="bg-secondary-500 text-white px-6 py-3 rounded-l-lg font-bold hover:bg-secondary-600 transition">
                                اشترك
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Footer */}
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* About */}
                    <div>
                        <h3 className="text-white text-lg font-bold mb-4">عن المتجر</h3>
                        <p className="text-gray-400 mb-4">
                            نقدم لكم أفضل المنتجات بأسعار تنافسية مع خدمة توصيل سريعة لجميع مناطق المملكة.
                        </p>
                        <div className="flex gap-3">
                            <a href="#" className="w-10 h-10 bg-dark-100 rounded-full flex items-center justify-center hover:bg-primary-500 transition">
                                <Facebook className="w-5 h-5" />
                            </a>
                            <a href="#" className="w-10 h-10 bg-dark-100 rounded-full flex items-center justify-center hover:bg-primary-500 transition">
                                <Twitter className="w-5 h-5" />
                            </a>
                            <a href="#" className="w-10 h-10 bg-dark-100 rounded-full flex items-center justify-center hover:bg-primary-500 transition">
                                <Instagram className="w-5 h-5" />
                            </a>
                            <a href="#" className="w-10 h-10 bg-dark-100 rounded-full flex items-center justify-center hover:bg-primary-500 transition">
                                <Youtube className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-white text-lg font-bold mb-4">روابط سريعة</h3>
                        <ul className="space-y-2">
                            <li><Link href="/about" className="hover:text-primary-400 transition">من نحن</Link></li>
                            <li><Link href="/contact" className="hover:text-primary-400 transition">اتصل بنا</Link></li>
                            <li><Link href="/faq" className="hover:text-primary-400 transition">الأسئلة الشائعة</Link></li>
                            <li><Link href="/shipping" className="hover:text-primary-400 transition">سياسة الشحن</Link></li>
                            <li><Link href="/returns" className="hover:text-primary-400 transition">سياسة الإرجاع</Link></li>
                            <li><Link href="/privacy" className="hover:text-primary-400 transition">سياسة الخصوصية</Link></li>
                        </ul>
                    </div>

                    {/* Categories */}
                    <div>
                        <h3 className="text-white text-lg font-bold mb-4">الأقسام</h3>
                        <ul className="space-y-2">
                            <li><Link href="/category/electronics" className="hover:text-primary-400 transition">إلكترونيات</Link></li>
                            <li><Link href="/category/fashion" className="hover:text-primary-400 transition">أزياء</Link></li>
                            <li><Link href="/category/home" className="hover:text-primary-400 transition">المنزل والمطبخ</Link></li>
                            <li><Link href="/category/beauty" className="hover:text-primary-400 transition">الجمال والعناية</Link></li>
                            <li><Link href="/category/sports" className="hover:text-primary-400 transition">الرياضة</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="text-white text-lg font-bold mb-4">تواصل معنا</h3>
                        <ul className="space-y-3">
                            <li className="flex items-center gap-3">
                                <Phone className="w-5 h-5 text-primary-400" />
                                <span dir="ltr">+966 920 000 000</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail className="w-5 h-5 text-primary-400" />
                                <span>support@store.com</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-primary-400 flex-shrink-0 mt-1" />
                                <span>الرياض، المملكة العربية السعودية</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-gray-700 py-4">
                <div className="container mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-gray-500">
                        © 2025 المتجر - جميع الحقوق محفوظة
                    </p>
                    <div className="flex items-center gap-4">
                        <img src="https://via.placeholder.com/48x30?text=VISA" alt="Visa" className="h-6" />
                        <img src="https://via.placeholder.com/48x30?text=MC" alt="Mastercard" className="h-6" />
                        <img src="https://via.placeholder.com/48x30?text=Mada" alt="Mada" className="h-6" />
                        <img src="https://via.placeholder.com/48x30?text=STC" alt="STC Pay" className="h-6" />
                    </div>
                </div>
            </div>
        </footer>
    )
}

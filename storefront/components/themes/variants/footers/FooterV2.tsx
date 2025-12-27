'use client';
import Link from 'next/link';

export default function FooterV2() {
    return (
        <footer className="bg-[#232f3e] text-white mt-8 py-8 animate-in slide-in-from-bottom-2 duration-500">
            <div className="container mx-auto px-4 text-center">
                <button className="bg-[#37475a] w-full py-4 rounded-sm text-sm font-bold mb-8 hover:bg-[#485769] transition">
                    العودة إلى الأعلى
                </button>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-sm text-gray-300 text-right">
                    <div>
                        <h4 className="font-bold text-white mb-2">اعرفنا</h4>
                        <ul className="space-y-1"><li>معلومات عن المتجر</li><li>وظائف</li></ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-white mb-2">تسوق معنا</h4>
                        <ul className="space-y-1"><li>حسابك</li><li>مشترياتك</li></ul>
                    </div>
                    <div className="col-span-2">
                        <p>© 2025 Classic Footer V2 - Optimized for Information</p>
                    </div>
                </div>
            </div>
        </footer>
    )
}

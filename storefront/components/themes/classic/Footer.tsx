export default function Footer() {
    return (
        <div className="bg-[#232f3e] text-white py-12 text-center mt-auto">
            <a href="#" className="block bg-[#37475a] py-4 hover:bg-[#485769] transition mb-8 text-sm font-medium">
                العودة إلى الأعلى
            </a>

            <div className="container mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 mb-12 text-sm text-gray-300">
                <div>
                    <h3 className="font-bold text-white mb-4">اعرف المزيد عنا</h3>
                    <ul className="space-y-2">
                        <li><a href="#" className="hover:underline">معلومات عن المتجر</a></li>
                        <li><a href="#" className="hover:underline">وظائف</a></li>
                    </ul>
                </div>
                <div>
                    <h3 className="font-bold text-white mb-4">تسوق معنا</h3>
                    <ul className="space-y-2">
                        <li><a href="#" className="hover:underline">حسابك</a></li>
                        <li><a href="#" className="hover:underline">مشترياتك</a></li>
                    </ul>
                </div>
            </div>

            <div className="border-t border-gray-600 pt-8 text-xs text-gray-400">
                &copy; 1996-{new Date().getFullYear()}، Amazon.com, Inc. أو الشركات التابعة لها
            </div>
        </div>
    );
}

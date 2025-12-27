'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingCart, Menu, Search, MapPin, ChevronDown } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useStoreConfig } from '@/context/StoreConfigContext';

export default function Header() {
    const { config } = useStoreConfig();
    const { cart } = useCart();
    const [searchQuery, setSearchQuery] = useState('');
    const cartItemsCount = cart.items.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <header className="flex flex-col text-white">
            {/* Upper Dark Bar */}
            <div className="bg-[#131921] px-4 py-2 flex items-center justify-between gap-4">
                {/* Logo */}
                <Link href="/" className="flex items-center hover:border border-white p-1 rounded-sm">
                    <span className="text-xl font-bold tracking-tight">{config?.store_name || 'Store'}</span>
                </Link>

                {/* Location Picker (Fake) */}
                <div className="hidden md:flex items-center gap-1 hover:border border-white p-2 rounded-sm cursor-pointer text-xs">
                    <MapPin className="w-4 h-4" />
                    <div>
                        <div className="text-gray-300">التوصيل إلى</div>
                        <div className="font-bold">المملكة العربية السعودية</div>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="flex-1 max-w-2xl bg-white rounded-md flex overflow-hidden h-10">
                    <div className="bg-gray-100 text-gray-600 px-3 flex items-center text-xs border-r border-gray-300 cursor-pointer hover:bg-gray-200">
                        الكل <ChevronDown className="w-3 h-3 mr-1" />
                    </div>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1 px-3 text-black focus:outline-none"
                    />
                    <button className="bg-[#febd69] hover:bg-[#f3a847] px-4 flex items-center justify-center text-black">
                        <Search className="w-5 h-5" />
                    </button>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-4 text-xs">
                    <div className="hover:border border-white p-2 rounded-sm cursor-pointer">
                        <div className="text-gray-300">مرحباً، سجل دخولك</div>
                        <div className="font-bold cursor-pointer">الحساب والقوائم</div>
                    </div>

                    <Link href="/cart" className="flex items-end gap-1 hover:border border-white p-2 rounded-sm relative">
                        <div className="relative">
                            <ShoppingCart className="w-8 h-8" />
                            <span className="absolute -top-1 -right-1 text-[#f08804] font-bold text-base w-5 h-5 flex items-center justify-center">
                                {cartItemsCount}
                            </span>
                        </div>
                        <span className="font-bold text-sm hidden sm:block mb-1">السلة</span>
                    </Link>
                </div>
            </div>

            {/* Lower Dark Bar (Navigation) */}
            <div className="bg-[#232f3e] px-4 py-1.5 flex items-center gap-4 text-sm font-medium overflow-x-auto text-white">
                <button className="flex items-center gap-1 hover:border border-white p-1 rounded-sm whitespace-nowrap">
                    <Menu className="w-5 h-5" />
                    <span className="font-bold">الكل</span>
                </button>

                {['عروض اليوم', 'خدمة العملاء', 'الكتب', 'الإلكترونيات', 'المنزل'].map(item => (
                    <Link key={item} href="#" className="hover:border border-white p-1 rounded-sm whitespace-nowrap">
                        {item}
                    </Link>
                ))}
            </div>
        </header>
    );
}

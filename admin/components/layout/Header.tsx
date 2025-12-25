'use client'

import { Bell, Search, User, ChevronDown } from 'lucide-react'

export default function Header() {
    return (
        <header className="h-16 bg-white border-b px-6 flex items-center justify-between sticky top-0 z-30">
            {/* Search */}
            <div className="flex-1 max-w-md">
                <div className="relative">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="ابحث..."
                        className="w-full pr-10 pl-4 py-2 bg-gray-100 border-0 rounded-lg 
                     focus:bg-white focus:ring-2 focus:ring-primary-500 outline-none"
                    />
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
                {/* Notifications */}
                <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                </button>

                {/* User Menu */}
                <div className="flex items-center gap-3 pr-4 border-r">
                    <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-primary-600" />
                    </div>
                    <div className="hidden sm:block">
                        <p className="text-sm font-medium text-gray-900">مدير المتجر</p>
                        <p className="text-xs text-gray-500">admin@store.com</p>
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                </div>
            </div>
        </header>
    )
}

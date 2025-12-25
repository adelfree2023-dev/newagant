import type { Metadata } from 'next'
import './globals.css'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'

export const metadata: Metadata = {
    title: 'لوحة التحكم | المتجر',
    description: 'إدارة متجرك الإلكتروني',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="ar" dir="rtl">
            <body className="bg-gray-50 min-h-screen">
                <div className="flex">
                    <Sidebar />
                    <div className="flex-1 mr-64">
                        <Header />
                        <main className="p-6">
                            {children}
                        </main>
                    </div>
                </div>
            </body>
        </html>
    )
}

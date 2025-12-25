import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export const metadata: Metadata = {
    title: 'المتجر | تسوق الآن',
    description: 'أفضل العروض والمنتجات بأسعار مميزة',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="ar" dir="rtl">
            <body className="min-h-screen bg-gray-50 flex flex-col">
                <Header />
                <main className="flex-grow">
                    {children}
                </main>
                <Footer />
            </body>
        </html>
    )
}

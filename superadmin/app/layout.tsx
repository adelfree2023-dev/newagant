'use client';

import './globals.css'
// Auth temporarily disabled - will be re-enabled in Phase 3
// import { AuthProvider } from '@/context/AuthContext'
import { usePathname } from 'next/navigation'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'

function LayoutContent({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isLoginPage = pathname === '/login';

    if (isLoginPage) {
        return <>{children}</>;
    }

    return (
        <div className="flex">
            <Sidebar />
            <div className="flex-1 mr-64">
                <Header />
                <main className="p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="ar" dir="rtl">
            <head>
                <title>Super Admin | CoreFlex</title>
                <meta name="description" content="إدارة منصة CoreFlex" />
                <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap" rel="stylesheet" />
            </head>
            <body className="bg-gray-100 min-h-screen font-tajawal">
                {/* AuthProvider disabled temporarily - Phase 3 will re-enable */}
                <LayoutContent>{children}</LayoutContent>
            </body>
        </html>
    )
}

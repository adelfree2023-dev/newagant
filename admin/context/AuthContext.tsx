'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    tenant_id?: string;
    store_name?: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    // Check auth on mount
    useEffect(() => {
        const storedToken = localStorage.getItem('admin_token');
        if (storedToken) {
            validateToken(storedToken);
        } else {
            setIsLoading(false);
            if (pathname !== '/login') {
                router.push('/login');
            }
        }
    }, []);

    const validateToken = async (storedToken: string) => {
        try {
            const res = await fetch(`${API_URL}/api/auth/me`, {
                headers: { 'Authorization': `Bearer ${storedToken}` }
            });
            
            if (res.ok) {
                const data = await res.json();
                if (data.user && (data.user.role === 'admin' || data.user.role === 'tenant_admin')) {
                    setUser(data.user);
                    setToken(storedToken);
                } else {
                    // Not an admin
                    localStorage.removeItem('admin_token');
                    router.push('/login');
                }
            } else {
                localStorage.removeItem('admin_token');
                if (pathname !== '/login') {
                    router.push('/login');
                }
            }
        } catch (error) {
            console.error('Auth validation error:', error);
            localStorage.removeItem('admin_token');
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
        try {
            const res = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();

            if (res.ok && data.token) {
                // Check if user is admin
                if (data.user.role !== 'admin' && data.user.role !== 'tenant_admin') {
                    return { success: false, error: 'ليس لديك صلاحيات الوصول لهذه اللوحة' };
                }

                localStorage.setItem('admin_token', data.token);
                setToken(data.token);
                setUser(data.user);
                router.push('/dashboard');
                return { success: true };
            } else {
                return { success: false, error: data.message || 'بيانات الدخول غير صحيحة' };
            }
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: 'خطأ في الاتصال بالخادم' };
        }
    };

    const logout = () => {
        localStorage.removeItem('admin_token');
        setToken(null);
        setUser(null);
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{
            user,
            token,
            isLoading,
            isAuthenticated: !!user && !!token,
            login,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

// Protected route wrapper
export function ProtectedRoute({ children }: { children: ReactNode }) {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!isLoading && !isAuthenticated && pathname !== '/login') {
            router.push('/login');
        }
    }, [isLoading, isAuthenticated, pathname, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">جاري التحميل...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated && pathname !== '/login') {
        return null;
    }

    return <>{children}</>;
}

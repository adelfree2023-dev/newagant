'use client';

/**
 * CoreFlex Auth Context
 * الإصدار: 2.1.0
 * 
 * سياق المصادقة - يجب وضعه في: storefront/context/AuthContext.tsx
 */

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { authApi, User } from '@/lib/api';

// Types
interface AuthContextType {
    user: User | null;
    loading: boolean;
    error: string | null;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
    logout: () => Promise<void>;
    updateProfile: (data: Partial<User>) => Promise<boolean>;
    clearError: () => void;
    requireAuth: (redirectPath?: string) => void;
}

interface RegisterData {
    name: string;
    email: string;
    password: string;
    phone?: string;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Check if user is logged in on mount
    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            setLoading(true);
            const response = await authApi.getProfile();
            if (response.data) {
                setUser(response.data);
            }
        } catch (err) {
            // User not logged in, that's okay
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
        try {
            setError(null);
            setLoading(true);

            const response = await authApi.login(email, password);

            if (response.error) {
                setError(response.error);
                return { success: false, error: response.error };
            }

            if (response.data) {
                setUser(response.data.user);
                return { success: true };
            }

            return { success: false, error: 'حدث خطأ غير متوقع' };
        } catch (err) {
            setError('حدث خطأ أثناء تسجيل الدخول');
            return { success: false, error: 'حدث خطأ أثناء تسجيل الدخول' };
        } finally {
            setLoading(false);
        }
    }, []);

    const register = useCallback(async (data: RegisterData): Promise<{ success: boolean; error?: string }> => {
        try {
            setError(null);
            setLoading(true);

            const response = await authApi.register(data);

            if (response.error) {
                setError(response.error);
                return { success: false, error: response.error };
            }

            if (response.data) {
                setUser(response.data.user);
                return { success: true };
            }

            return { success: false, error: 'حدث خطأ غير متوقع' };
        } catch (err) {
            setError('حدث خطأ أثناء التسجيل');
            return { success: false, error: 'حدث خطأ أثناء التسجيل' };
        } finally {
            setLoading(false);
        }
    }, []);

    const logout = useCallback(async () => {
        try {
            await authApi.logout();
        } finally {
            setUser(null);
            // Optionally redirect to home
            if (typeof window !== 'undefined') {
                window.location.href = '/';
            }
        }
    }, []);

    const updateProfile = useCallback(async (data: Partial<User>): Promise<boolean> => {
        try {
            setError(null);

            const response = await authApi.updateProfile(data);

            if (response.error) {
                setError(response.error);
                return false;
            }

            if (response.data) {
                setUser(response.data);
                return true;
            }

            return false;
        } catch (err) {
            setError('حدث خطأ أثناء تحديث البيانات');
            return false;
        }
    }, []);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    const requireAuth = useCallback((redirectPath?: string) => {
        const path = redirectPath || window.location.pathname;
        if (!user && !loading) {
            window.location.href = `/login?redirect=${encodeURIComponent(path)}`;
        }
    }, [user, loading]);

    const value: AuthContextType = {
        user,
        loading,
        error,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateProfile,
        clearError,
        requireAuth,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

// Hook to use auth context
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

// HOC for protected routes
export function withAuth<P extends object>(
    WrappedComponent: React.ComponentType<P>,
    redirectTo: string = '/login'
) {
    return function WithAuthComponent(props: P) {
        const { isAuthenticated, loading } = useAuth();

        useEffect(() => {
            if (!loading && !isAuthenticated) {
                const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
                window.location.href = `${redirectTo}?redirect=${encodeURIComponent(currentPath)}`;
            }
        }, [isAuthenticated, loading]);

        if (loading) {
            return (
                <div className="flex items-center justify-center min-h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
            );
        }

        if (!isAuthenticated) {
            return null;
        }

        return <WrappedComponent {...props} />;
    };
}

export default AuthContext;

'use client';

/**
 * CoreFlex Protected Route Component
 * الإصدار: 2.1.0
 * 
 * مكون الحماية - يجب وضعه في: storefront/components/ProtectedRoute.tsx
 */

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRole?: 'customer' | 'admin' | 'superadmin';
    redirectTo?: string;
    fallback?: React.ReactNode;
}

export function ProtectedRoute({
    children,
    requiredRole,
    redirectTo = '/login',
    fallback,
}: ProtectedRouteProps) {
    const { user, loading, isAuthenticated } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!loading) {
            // Not authenticated
            if (!isAuthenticated) {
                const redirectUrl = `${redirectTo}?redirect=${encodeURIComponent(pathname)}`;
                router.push(redirectUrl);
                return;
            }

            // Check role if required
            if (requiredRole && user?.role !== requiredRole) {
                // User doesn't have required role
                router.push('/unauthorized');
                return;
            }
        }
    }, [isAuthenticated, loading, user, requiredRole, router, pathname, redirectTo]);

    // Show loading state
    if (loading) {
        return fallback || <LoadingSpinner />;
    }

    // Not authenticated
    if (!isAuthenticated) {
        return fallback || <LoadingSpinner />;
    }

    // Check role
    if (requiredRole && user?.role !== requiredRole) {
        return fallback || <LoadingSpinner />;
    }

    return <>{children}</>;
}

// Loading spinner component
function LoadingSpinner() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-gray-600">جاري التحميل...</p>
            </div>
        </div>
    );
}

// Guest only route (for login/register pages)
interface GuestRouteProps {
    children: React.ReactNode;
    redirectTo?: string;
}

export function GuestRoute({ children, redirectTo = '/' }: GuestRouteProps) {
    const { isAuthenticated, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && isAuthenticated) {
            router.push(redirectTo);
        }
    }, [isAuthenticated, loading, router, redirectTo]);

    if (loading) {
        return <LoadingSpinner />;
    }

    if (isAuthenticated) {
        return <LoadingSpinner />;
    }

    return <>{children}</>;
}

// Admin only route
interface AdminRouteProps {
    children: React.ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
    return (
        <ProtectedRoute requiredRole="admin" redirectTo="/login">
            {children}
        </ProtectedRoute>
    );
}

// Super Admin only route
export function SuperAdminRoute({ children }: AdminRouteProps) {
    return (
        <ProtectedRoute requiredRole="superadmin" redirectTo="/login">
            {children}
        </ProtectedRoute>
    );
}

export default ProtectedRoute;

'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { UserRole } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requireAuth?: boolean;
  fallbackPath?: string;
}

export const ProtectedRoute = ({ 
  children, 
  allowedRoles = [], 
  requireAuth = true,
  fallbackPath = '/unauthorized'
}: ProtectedRouteProps) => {
  const { user, appUser, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      // If authentication is required but user is not authenticated
      if (requireAuth && !user) {
        router.push('/login');
        return;
      }

      // If user is authenticated but no app user data found (no role assigned)
      if (user && !appUser) {
        router.push('/unauthorized');
        return;
      }

      // If specific roles are required but user doesn't have the required role
      if (allowedRoles.length > 0 && appUser && !allowedRoles.includes(appUser.role)) {
        router.push(fallbackPath);
        return;
      }
    }
  }, [user, appUser, loading, requireAuth, allowedRoles, router, fallbackPath]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Don't render children if user doesn't meet requirements
  if (requireAuth && !user) {
    return null;
  }

  if (user && !appUser) {
    return null;
  }

  if (allowedRoles.length > 0 && appUser && !allowedRoles.includes(appUser.role)) {
    return null;
  }

  return <>{children}</>;
};

interface PermissionGateProps {
  children: React.ReactNode;
  permission: string;
  resourceType?: string;
  fallback?: React.ReactNode;
}

export const PermissionGate = ({ 
  children, 
  permission, 
  resourceType, 
  fallback = null 
}: PermissionGateProps) => {
  const { canPerformAction } = useAuth();

  if (canPerformAction(permission, resourceType)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
};

interface MenuGateProps {
  children: React.ReactNode;
  menuItem: string;
}

export const MenuGate = ({ children, menuItem }: MenuGateProps) => {
  const { canAccessMenu } = useAuth();

  if (canAccessMenu(menuItem)) {
    return <>{children}</>;
  }

  return null;
};
'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useSession, signOut as nextAuthSignOut } from 'next-auth/react'

// Define user roles
export type UserRole = 'super_admin' | 'cs_support' | 'cs_representative' | 'advertiser' | 'retention'

// Enhanced user interface with role information
export interface AppUser {
  id: string
  email: string
  name: string
  role: UserRole
  isActive: boolean
  assignedAdsCodes?: string[]
  createdAt: string
  permissions: {
    canManageUsers: boolean
    canViewAllData: boolean
    canEditData: boolean
    canDeleteData: boolean
    canAccessAdsSpend: boolean
    canAccessLTVRetensi: boolean
  }
}

// Permission matrix for each role
export const rolePermissions = {
  super_admin: {
    menus: ['dashboard', 'data_master', 'data_prospek', 'outbound_leads', 'ads_spend', 'ltv_retensi', 'laporan', 'user_management'],
    actions: {
      users: ['create', 'read', 'update', 'delete', 'assign_ads_codes'],
      prospects: ['create', 'read', 'update', 'delete', 'export'],
      ads: ['create', 'read', 'update', 'delete', 'assign_codes', 'manage_budget'],
      reports: ['view_all', 'export', 'create_custom']
    }
  },
  cs_support: {
    menus: ['dashboard'],
    actions: {
      prospects: ['read_own', 'update_own'],
      reports: ['view_basic']
    }
  },
  cs_representative: {
    menus: ['dashboard', 'data_prospek', 'laporan'],
    actions: {
      prospects: ['read', 'update', 'convert'],
      reports: ['view_all', 'export']
    }
  },
  advertiser: {
    menus: ['dashboard', 'data_prospek', 'ads_spend'],
    actions: {
      prospects: ['read'],
      ads: ['read_assigned', 'manage_assigned_budget'],
      reports: ['view_ads']
    }
  },
  retention: {
    menus: ['ltv_retensi', 'laporan'],
    actions: {
      retention: ['read', 'analyze', 'report'],
      reports: ['view_retention']
    }
  }
}

// Demo users for testing (since we don't have a users table yet)
export const demoUsers: AppUser[] = [
  {
    id: '1',
    email: 'admin@demo.com',
    name: 'Super Admin',
    role: 'super_admin',
    isActive: true,
    assignedAdsCodes: [],
    createdAt: '2024-01-01',
    permissions: {
      canManageUsers: true,
      canViewAllData: true,
      canEditData: true,
      canDeleteData: true,
      canAccessAdsSpend: true,
      canAccessLTVRetensi: true
    }
  },
  {
    id: '2',
    email: 'support@demo.com',
    name: 'CS Support Agent',
    role: 'cs_support',
    isActive: true,
    assignedAdsCodes: [],
    createdAt: '2024-01-01',
    permissions: {
      canManageUsers: false,
      canViewAllData: false,
      canEditData: false,
      canDeleteData: false,
      canAccessAdsSpend: false,
      canAccessLTVRetensi: false
    }
  },
  {
    id: '3',
    email: 'representative@demo.com',
    name: 'CS Representative',
    role: 'cs_representative',
    isActive: true,
    assignedAdsCodes: [],
    createdAt: '2024-01-01',
    permissions: {
      canManageUsers: false,
      canViewAllData: true,
      canEditData: true,
      canDeleteData: false,
      canAccessAdsSpend: false,
      canAccessLTVRetensi: false
    }
  },
  {
    id: '4',
    email: 'advertiser@demo.com',
    name: 'Advertiser Manager',
    role: 'advertiser',
    isActive: true,
    assignedAdsCodes: ['ADS001', 'ADS002'],
    createdAt: '2024-01-01',
    permissions: {
      canManageUsers: false,
      canViewAllData: false,
      canEditData: false,
      canDeleteData: false,
      canAccessAdsSpend: true,
      canAccessLTVRetensi: false
    }
  },
  {
    id: '5',
    email: 'retention@demo.com',
    name: 'Retention Specialist',
    role: 'retention',
    isActive: true,
    assignedAdsCodes: [],
    createdAt: '2024-01-01',
    permissions: {
      canManageUsers: false,
      canViewAllData: false,
      canEditData: false,
      canDeleteData: false,
      canAccessAdsSpend: false,
      canAccessLTVRetensi: true
    }
  }
]

interface AuthContextType {
  user: any | null
  appUser: AppUser | null
  session: any | null
  loading: boolean
  signOut: () => Promise<void>
  hasPermission: (permission: string) => boolean
  canAccessMenu: (menuItem: string) => boolean
  canPerformAction: (action: string, resourceType?: string) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: session, status } = useSession()
  const [appUser, setAppUser] = useState<AppUser | null>(null)
  const [loadingAppUser, setLoadingAppUser] = useState(true)
  const loading = status === 'loading' || loadingAppUser

  // Function to get user role data from demo users or database
  const getUserRoleData = async (email: string): Promise<AppUser | null> => {
    try {
      // First, try to find in demo users
      const demoUser = demoUsers.find(u => u.email === email && u.isActive)
      if (demoUser) {
        return demoUser
      }

      // In a real application, you would query your users table here:
      // const { data, error } = await supabase
      //   .from('users')
      //   .select('*')
      //   .eq('email', email)
      //   .eq('is_active', true)
      //   .single()
      
      // For now, return null if not found in demo users
      return null
    } catch (error) {
      console.error('Error getting user role data:', error)
      return null
    }
  }

  useEffect(() => {
    const loadUserData = async () => {
      if (status === 'loading') {
        return // Wait for session to load first
      }

      setLoadingAppUser(true)
      if (session?.user?.email) {
        const userData = await getUserRoleData(session.user.email)
        setAppUser(userData)
      } else {
        setAppUser(null)
      }
      setLoadingAppUser(false)
    }
    
    loadUserData()
  }, [session, status])

  const signOut = async () => {
    await nextAuthSignOut({ callbackUrl: '/login' })
    setAppUser(null)
  }

  // Permission checking functions
  const hasPermission = (permission: string): boolean => {
    if (!appUser) return false
    
    const userPermissions = rolePermissions[appUser.role]
    if (!userPermissions) return false
    
    // Check if user has the specific permission
    return Object.values(userPermissions.actions).some(actions => 
      Array.isArray(actions) && actions.includes(permission)
    )
  }

  const canAccessMenu = (menuItem: string): boolean => {
    if (!appUser) return false
    
    const userPermissions = rolePermissions[appUser.role]
    return userPermissions?.menus.includes(menuItem) || false
  }

  const canPerformAction = (action: string, resourceType?: string): boolean => {
    if (!appUser) return false
    
    const userPermissions = rolePermissions[appUser.role]
    if (!userPermissions) return false
    
    if (resourceType) {
      const resourceActions = userPermissions.actions[resourceType]
      return Array.isArray(resourceActions) && resourceActions.includes(action)
    }
    
    // Check across all resource types
    return Object.values(userPermissions.actions).some(actions => 
      Array.isArray(actions) && actions.includes(action)
    )
  }

  return (
    <AuthContext.Provider
      value={{
        user: session?.user || null,
        appUser,
        session,
        loading,
        signOut,
        hasPermission,
        canAccessMenu,
        canPerformAction,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
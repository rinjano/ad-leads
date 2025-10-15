'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { 
  Home, Database, Users, FileText, Settings, User, LogOut, 
  Target, Bell, MoreVertical, DollarSign, Send, TrendingUp
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/contexts/AuthContext'
import { useEffect } from 'react'
import { MenuGate } from '@/components/ProtectedRoute'

const menuItems = [
  { name: 'Dashboard', href: '/dashboard', icon: Home, badge: null, menuKey: 'dashboard' },
  { name: 'Data Master', href: '/data-master', icon: Database, badge: null, menuKey: 'data_master' },
  { name: 'Data Prospek', href: '/data-prospek', icon: Users, badge: null, menuKey: 'data_prospek' },
  { name: 'Outbound Leads', href: '/outbound-leads', icon: Send, badge: null, menuKey: 'outbound_leads' },
  { name: 'Ads Spend', href: '/ads-spend', icon: DollarSign, badge: null, menuKey: 'ads_spend' },
  { name: 'LTV & Retensi', href: '/ltv-retensi', icon: TrendingUp, badge: null, menuKey: 'ltv_retensi' },
  { name: 'Laporan', href: '/laporan', icon: FileText, badge: null, menuKey: 'laporan' },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, appUser, loading, signOut } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  const handleSignOut = async () => {
    await signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const userEmail = user.email || 'user@example.com'
  const userName = appUser?.name || user.user_metadata?.full_name || userEmail.split('@')[0]
  const userRole = appUser?.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'User'
  const userInitials = userName.split(' ').map(n => n[0]).join('').toUpperCase()

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-slate-100 animate-fade-in">
      {/* AssistLeads CRM & Lead Management Sidebar */}
      <div className="w-72 bg-white shadow-xl border-r border-slate-200">
        <div className="flex flex-col h-full">
          {/* Enhanced Header */}
          <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-blue-600 to-blue-500">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">AssistLeads</h1>
                <p className="text-xs text-blue-100">CRM & Lead Management</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 p-4">
            <nav className="space-y-1">
              {menuItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <MenuGate key={item.name} menuItem={item.menuKey}>
                    <Button
                      variant={isActive ? "secondary" : "ghost"}
                      size="default"
                      className={`w-full justify-start text-left h-12 transition-all duration-200 group ${
                        isActive 
                          ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm' 
                          : 'hover:bg-slate-50 hover:text-slate-900'
                      }`}
                      asChild
                    >
                      <Link href={item.href} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <item.icon className={`h-5 w-5 transition-colors ${
                            isActive ? 'text-blue-600' : 'text-slate-500 group-hover:text-slate-700'
                          }`} />
                          <span className="font-medium">{item.name}</span>
                        </div>
                        {item.badge && (
                          <Badge 
                            variant={item.badge === 'Hot' ? 'destructive' : isActive ? 'default' : 'secondary'} 
                            className="text-xs font-semibold"
                          >
                            {item.badge}
                          </Badge>
                        )}
                      </Link>
                    </Button>
                  </MenuGate>
                )
              })}
            </nav>
          </div>

          {/* Enhanced User Profile */}
          <div className="p-4 border-t border-slate-200 bg-slate-50">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start h-14 hover:bg-white hover:shadow-sm">
                  <Avatar className="h-10 w-10 mr-3 ring-2 ring-blue-500 ring-offset-2">
                    <AvatarFallback className="bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-left flex-1">
                    <div className="text-sm font-semibold text-slate-900">{userName}</div>
                    <div className="text-xs text-slate-500">{userRole}</div>
                  </div>
                  <MoreVertical className="h-4 w-4 text-slate-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{userName}</p>
                    <p className="text-xs leading-none text-muted-foreground">{userEmail}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Preferences</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Bell className="mr-2 h-4 w-4" />
                  <span>Notifications</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  )
}
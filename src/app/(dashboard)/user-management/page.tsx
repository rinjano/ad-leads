'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { UserTab } from '@/components/UserTab'
import { useAuth } from '@/contexts/AuthContext'
import { Shield, Users, AlertCircle } from 'lucide-react'

export default function UserManagementPage() {
  const { data: session, status } = useSession()
  const { canAccessMenu } = useAuth()
  const router = useRouter()

  // Check if user can access this page
  useEffect(() => {
    if (status === 'loading') return

    if (!session || !canAccessMenu('user_management')) {
      router.push('/unauthorized')
      return
    }
  }, [session, status, canAccessMenu, router])

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!session || !canAccessMenu('user_management')) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
            <Users className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">User Management</h1>
            <p className="text-slate-600">Kelola pengguna sistem dan hak akses mereka</p>
          </div>
        </div>

        {/* Role Info Card */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-lg text-blue-900">Role-Based Access Control</CardTitle>
            </div>
            <CardDescription className="text-blue-700">
              Sistem ini menggunakan kontrol akses berbasis peran untuk memastikan setiap pengguna hanya dapat mengakses data yang relevan dengan tugasnya.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-red-100 text-red-800">Super Admin</Badge>
                </div>
                <p className="text-sm text-slate-600">Akses penuh ke semua fitur dan data sistem</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-orange-100 text-orange-800">CS Support</Badge>
                </div>
                <p className="text-sm text-slate-600">Melihat data prospek yang dibuat sendiri</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-green-100 text-green-800">CS Representative</Badge>
                </div>
                <p className="text-sm text-slate-600">Mengelola prospek dan melihat laporan lengkap</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-purple-100 text-purple-800">Advertiser</Badge>
                </div>
                <p className="text-sm text-slate-600">Melihat data kode ads yang di-assign dan laporan terkait</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-pink-100 text-pink-800">Retention</Badge>
                </div>
                <p className="text-sm text-slate-600">Menganalisis data retensi dan laporan LTV</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Management Tabs */}
      <UserTab />
    </div>
  )
}
'use client'

import { useRouter } from 'next/navigation'
import { 
  Users, Calendar, Target, Search, Bell,
  TrendingUp, PieChart, BarChart3, Award, MapPin,
  AlertTriangle, Shield, Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'
import { useEffect, useState } from 'react'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { useDashboard } from '@/hooks/useDashboard'



const statsCards = [
  { 
    title: 'Prospek Hari Ini', 
    value: '127', 
    change: '+0%',
    trend: 'neutral',
    description: 'Prospek masuk hari ini', 
    subDescription: '+0% dari kemarin',
    icon: Users,
    color: 'bg-gradient-to-r from-blue-500 to-blue-600',
    lightColor: 'bg-blue-50',
    textColor: 'text-blue-600'
  },
  { 
    title: 'Leads Hari Ini', 
    value: '34', 
    change: '+0%',
    trend: 'neutral',
    description: 'Leads masuk hari ini', 
    subDescription: '+0% dari kemarin',
    icon: Target,
    color: 'bg-gradient-to-r from-green-500 to-green-600',
    lightColor: 'bg-green-50',
    textColor: 'text-green-600'
  },
  { 
    title: 'Prospek Bulan Ini', 
    value: '4,287', 
    change: '+0%',
    trend: 'neutral',
    description: 'Total prospek bulan ini', 
    subDescription: '+0% dari bulan lalu',
    icon: Users,
    color: 'bg-gradient-to-r from-purple-500 to-purple-600',
    lightColor: 'bg-purple-50',
    textColor: 'text-purple-600'
  },
  { 
    title: 'Leads Bulan Ini', 
    value: '842', 
    change: '+0%',
    trend: 'neutral',
    description: 'Total leads bulan ini', 
    subDescription: '+0% dari bulan lalu',
    icon: Target,
    color: 'bg-gradient-to-r from-orange-500 to-orange-600',
    lightColor: 'bg-orange-50',
    textColor: 'text-orange-600'
  },
  { 
    title: 'CTR Leads', 
    value: '19.6%', 
    change: '+0%',
    trend: 'neutral',
    description: 'Conversion rate leads', 
    subDescription: '+0% dari kemarin',
    icon: TrendingUp,
    color: 'bg-gradient-to-r from-indigo-500 to-indigo-600',
    lightColor: 'bg-indigo-50',
    textColor: 'text-indigo-600'
  },
  { 
    title: 'Total Spam', 
    value: '127', 
    change: '+0%',
    trend: 'neutral',
    description: 'Spam terdeteksi', 
    subDescription: '+0% dari kemarin',
    icon: Shield,
    color: 'bg-gradient-to-r from-red-500 to-red-600',
    lightColor: 'bg-red-50',
    textColor: 'text-red-600'
  },
]

// Data untuk chart dan tabel
const trendData = [
  { day: 'Sen', prospek: 145, leads: 32 },
  { day: 'Sel', prospek: 167, leads: 41 },
  { day: 'Rab', prospek: 123, leads: 28 },
  { day: 'Kam', prospek: 189, leads: 45 },
  { day: 'Jum', prospek: 156, leads: 38 },
  { day: 'Sab', prospek: 178, leads: 42 },
  { day: 'Min', prospek: 127, leads: 34 }
]

const sumberLeadsData = [
  { name: 'Facebook Ads', value: 42, color: '#3B82F6' },
  { name: 'Google Ads', value: 32, color: '#10B981' },
  { name: 'Instagram', value: 18, color: '#8B5CF6' },
  { name: 'WhatsApp', value: 8, color: '#F59E0B' }
]

const kodeAdsData = [
  { name: 'FB001', value: 28, color: '#3B82F6' },
  { name: 'GG002', value: 23, color: '#10B981' },
  { name: 'IG004', value: 19, color: '#8B5CF6' },
  { name: 'FB003', value: 15, color: '#F59E0B' },
  { name: 'Others', value: 15, color: '#6B7280' }
]

const topLayanan = [
  { name: 'Healthcare Premium', leads: 89, ctr: '28.0%' },
  { name: 'Medical Equipment', leads: 76, ctr: '25.0%' },
  { name: 'Consultation Service', leads: 64, ctr: '22.0%' }
]

const topKota = [
  { name: 'Jakarta', leads: 145, ctr: '26.2%' },
  { name: 'Surabaya', leads: 98, ctr: '21.4%' },
  { name: 'Bandung', leads: 87, ctr: '21.8%' }
]

const topCS = [
  { name: 'Sarah Johnson', leads: 89, ctr: '28.0%' },
  { name: 'Michael Chen', leads: 76, ctr: '25.0%' },
  { name: 'Lisa Wong', leads: 64, ctr: '22.0%' }
]

export default function DashboardPage() {
  const { user, appUser, loading, signOut } = useAuth()
  const router = useRouter()
  
  // State untuk filter waktu
  const [selectedFilter, setSelectedFilter] = useState('today')
  const [showCustomDate, setShowCustomDate] = useState(false)
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')

  // Fetch dashboard data
  const { data: dashboardData, isLoading: loadingDashboard, error: errorDashboard, refetch } = useDashboard(
    selectedFilter,
    customStartDate,
    customEndDate
  )

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  // Refetch when filter changes
  useEffect(() => {
    if (selectedFilter === 'custom' && customStartDate && customEndDate) {
      refetch()
    } else if (selectedFilter !== 'custom') {
      refetch()
    }
  }, [selectedFilter, customStartDate, customEndDate, refetch])

  // Handle filter change
  const handleFilterChange = (e) => {
    const value = e.target.value
    setSelectedFilter(value)
    setShowCustomDate(value === 'custom')
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/login')
  }

  if (loading || loadingDashboard) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <div className="text-lg">Loading dashboard...</div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  if (errorDashboard) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">Gagal memuat data dashboard</p>
          <Button onClick={() => refetch()}>Coba Lagi</Button>
        </div>
      </div>
    )
  }

  const userEmail = user.email || 'user@example.com'
  const getEmailUsername = (email) => {
    const atIndex = email.indexOf('@')
    return atIndex > -1 ? email.substring(0, atIndex) : 'user'
  }
  const userName = appUser?.name || user.user_metadata?.full_name || getEmailUsername(userEmail)

  // Prepare stats cards with database data
  const stats = dashboardData?.stats
  const trendData = dashboardData?.trendData || []
  const topLayanan = dashboardData?.topLayanan || []
  const topKota = dashboardData?.topKota || []
  const topCS = dashboardData?.topCS || []

  const statsCards = [
    { 
      title: 'Prospek Hari Ini', 
      value: stats?.totalProspek.toString() || '0', 
      change: stats?.prospekChange || '+0%',
      trend: parseFloat(stats?.prospekChange || '0') > 0 ? 'up' : parseFloat(stats?.prospekChange || '0') < 0 ? 'down' : 'neutral',
      description: selectedFilter === 'today' ? 'Prospek masuk hari ini' : 'Total prospek periode ini', 
      subDescription: selectedFilter === 'today' ? stats?.prospekChange + ' dari kemarin' : stats?.prospekChange + ' dari periode sebelumnya',
      icon: Users,
      color: 'bg-gradient-to-r from-blue-500 to-blue-600',
      lightColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    { 
      title: 'Leads Hari Ini', 
      value: stats?.totalLeads.toString() || '0', 
      change: stats?.leadsChange || '+0%',
      trend: parseFloat(stats?.leadsChange || '0') > 0 ? 'up' : parseFloat(stats?.leadsChange || '0') < 0 ? 'down' : 'neutral',
      description: selectedFilter === 'today' ? 'Leads masuk hari ini' : 'Total leads periode ini', 
      subDescription: selectedFilter === 'today' ? stats?.leadsChange + ' dari kemarin' : stats?.leadsChange + ' dari periode sebelumnya',
      icon: Target,
      color: 'bg-gradient-to-r from-green-500 to-green-600',
      lightColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    { 
      title: 'CTR Leads', 
      value: stats?.ctrLeads || '0%', 
      change: '+0%',
      trend: 'neutral',
      description: 'Conversion rate leads', 
      subDescription: 'Persentase konversi',
      icon: TrendingUp,
      color: 'bg-gradient-to-r from-indigo-500 to-indigo-600',
      lightColor: 'bg-indigo-50',
      textColor: 'text-indigo-600'
    },
    { 
      title: 'Total Spam', 
      value: stats?.totalSpam.toString() || '0', 
      change: stats?.spamChange || '+0%',
      trend: parseFloat(stats?.spamChange || '0') > 0 ? 'up' : parseFloat(stats?.spamChange || '0') < 0 ? 'down' : 'neutral',
      description: 'Spam terdeteksi', 
      subDescription: stats?.spamChange + ' dari periode sebelumnya',
      icon: Shield,
      color: 'bg-gradient-to-r from-red-500 to-red-600',
      lightColor: 'bg-red-50',
      textColor: 'text-red-600'
    },
  ]

  return (
    <ProtectedRoute allowedRoles={['super_admin', 'cs_support', 'cs_representative', 'advertiser']}>
      <>
        {/* Enhanced Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Dashboard Overview</h1>
            <p className="text-slate-600 mt-1">Welcome back, {userName}! Here's your sales performance today.</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input 
                placeholder="Search leads, companies..." 
                className="pl-10 w-64 bg-slate-50 border-slate-200"
              />
            </div>
            <Button variant="outline" size="sm">
              <Bell className="w-4 h-4 mr-2" />
              <Badge variant="destructive" className="w-5 h-5 text-xs p-0 ml-1">3</Badge>
            </Button>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              System Online
            </Badge>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-8">
        {/* Filter Waktu */}
        <div className="bg-white shadow-lg rounded-2xl border border-slate-200 overflow-hidden">
          <div className="p-6">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-slate-500" />
              <span className="text-sm font-medium text-slate-700">Periode:</span>
              <select 
                value={selectedFilter} 
                onChange={handleFilterChange}
                className="text-sm border border-slate-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white hover:bg-slate-50 transition-colors"
              >
                <option value="today">Hari Ini</option>
                <option value="yesterday">Kemarin</option>
                <option value="thisweek">Minggu Ini</option>
                <option value="thismonth">Bulan Ini</option>
                <option value="lastmonth">Bulan Lalu</option>
                <option value="custom">Custom</option>
              </select>
              
              {/* Custom Date Range Inputs */}
              {showCustomDate && (
                <div className="flex items-center gap-2 ml-2">
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="text-sm border border-slate-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    placeholder="Dari tanggal"
                  />
                  <span className="text-slate-500 text-sm">s/d</span>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="text-sm border border-slate-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    placeholder="Sampai tanggal"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statsCards.map((stat, index) => (
              <Card key={index} className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 animate-slide-in bg-white" style={{ animationDelay: `${index * 100}ms` }}>
                <CardContent className="p-6">
                  {/* Icon di kanan atas */}
                  <div className="flex justify-end mb-4">
                    <div className={`w-10 h-10 ${stat.lightColor} rounded-lg flex items-center justify-center`}>
                      <stat.icon className={`w-5 h-5 ${stat.textColor}`} />
                    </div>
                  </div>
                  
                  {/* Value (angka besar) */}
                  <div className="mb-2">
                    <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
                  </div>
                  
                  {/* Description (teks utama) */}
                  <div className="mb-3">
                    <p className="text-sm font-medium text-slate-600">{stat.description}</p>
                  </div>
                  
                  {/* Persentase perubahan */}
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="outline" 
                      className={`text-xs px-2 py-1 ${
                        stat.trend === 'neutral' 
                          ? 'bg-slate-50 text-slate-600 border-slate-300' 
                          : stat.trend === 'up' 
                            ? 'bg-green-50 text-green-600 border-green-300' 
                            : 'bg-red-50 text-red-600 border-red-300'
                      }`}
                    >
                      {stat.change}
                    </Badge>
                    <span className="text-xs text-slate-500">{stat.subDescription}</span>
                  </div>
                  
                  <div className={`absolute bottom-0 left-0 w-full h-1 ${stat.color}`}></div>
                </CardContent>
              </Card>
            ))}
          </div>



        {/* Charts & Analysis Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Trend Chart */}
          <Card className="bg-white shadow-lg border-slate-200 hover:shadow-xl transition-shadow duration-200">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-200 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold text-slate-900">Tren 7 Hari Terakhir</CardTitle>
                    <p className="text-sm text-slate-600 mt-1">Grafik perkembangan prospek dan leads</p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
            <div className="h-64 flex items-end justify-between space-x-2">
              {trendData.map((item, index) => (
                <div key={index} className="flex flex-col items-center flex-1 space-y-2">
                  <div className="flex flex-col items-center space-y-1 w-full">
                    {/* Prospek Bar */}
                    <div className="w-full flex flex-col items-center">
                      <div 
                        className="w-6 bg-gradient-to-t from-blue-500 to-blue-400 rounded-t"
                        style={{ height: `${Math.min((item.prospek / 200) * 120, 120)}px` }}
                      ></div>
                      <span className="text-xs text-gray-500 mt-1">{item.prospek}</span>
                    </div>
                    
                    {/* Leads Bar */}
                    <div className="w-full flex flex-col items-center">
                      <div 
                        className="w-6 bg-gradient-to-t from-green-500 to-green-400 rounded-t"
                        style={{ height: `${Math.min((item.leads / 50) * 80, 80)}px` }}
                      ></div>
                      <span className="text-xs text-gray-500 mt-1">{item.leads}</span>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-gray-600">{item.day}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center space-x-4 mt-4 pt-4 border-t">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span className="text-sm text-gray-600">Prospek</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span className="text-sm text-gray-600">Leads</span>
              </div>
            </div>
            </CardContent>
          </Card>

          {/* Distribusi Sumber Leads */}
          <Card className="bg-white shadow-lg border-slate-200 hover:shadow-xl transition-shadow duration-200">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-slate-200 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <PieChart className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold text-slate-900">Distribusi Sumber Leads</CardTitle>
                    <p className="text-sm text-slate-600 mt-1">Persentase leads berdasarkan sumber</p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <svg width="200" height="200" viewBox="0 0 200 200" className="transform -rotate-90">
                {(() => {
                  let currentAngle = 0;
                  const total = sumberLeadsData.reduce((sum, item) => sum + item.value, 0);
                  
                  return sumberLeadsData.map((item, index) => {
                    const percentage = (item.value / total) * 100;
                    const angle = (item.value / total) * 360;
                    const x1 = 100 + 80 * Math.cos((currentAngle * Math.PI) / 180);
                    const y1 = 100 + 80 * Math.sin((currentAngle * Math.PI) / 180);
                    const x2 = 100 + 80 * Math.cos(((currentAngle + angle) * Math.PI) / 180);
                    const y2 = 100 + 80 * Math.sin(((currentAngle + angle) * Math.PI) / 180);
                    
                    const largeArc = angle > 180 ? 1 : 0;
                    const pathData = `M 100 100 L ${x1} ${y1} A 80 80 0 ${largeArc} 1 ${x2} ${y2} Z`;
                    
                    currentAngle += angle;
                    
                    return (
                      <path
                        key={index}
                        d={pathData}
                        fill={item.color}
                        className="hover:opacity-80 transition-opacity cursor-pointer"
                      >
                        <title>{`${item.name}: ${percentage.toFixed(1)}%`}</title>
                      </path>
                    );
                  });
                })()}
              </svg>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {sumberLeadsData.map((item, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-sm text-gray-600">{item.name}</span>
                  <span className="text-sm font-semibold text-gray-800">{item.value}%</span>
                </div>
              ))}
            </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Tables & Quality Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
          {/* Top 3 Layanan */}
          <Card className="bg-white shadow-lg border-slate-200 hover:shadow-xl transition-shadow duration-200">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 border-b border-slate-200 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Award className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold text-slate-900">Top 3 Layanan</CardTitle>
                    <p className="text-sm text-slate-600 mt-1">Layanan terbaik berdasarkan CTR</p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
            <div className="space-y-3">
              {topLayanan.length > 0 ? topLayanan.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{item.name}</p>
                    <p className="text-xs text-gray-500">{item.leads} leads</p>
                  </div>
                  <span className="text-sm font-bold text-orange-600">{item.ctr}</span>
                </div>
              )) : (
                <div className="text-center text-gray-500 py-4">
                  Tidak ada data layanan
                </div>
              )}
            </div>
            </CardContent>
          </Card>

          {/* Top 3 Kota */}
          <Card className="bg-white shadow-lg border-slate-200 hover:shadow-xl transition-shadow duration-200">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 border-b border-slate-200 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <MapPin className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold text-slate-900">Top 3 Kota</CardTitle>
                    <p className="text-sm text-slate-600 mt-1">Kota dengan leads terbanyak</p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
            <div className="space-y-3">
              {topKota.length > 0 ? topKota.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{item.name}</p>
                    <p className="text-xs text-gray-500">{item.leads} leads</p>
                  </div>
                  <span className="text-sm font-bold text-blue-600">{item.ctr}</span>
                </div>
              )) : (
                <div className="text-center text-gray-500 py-4">
                  Tidak ada data kota
                </div>
              )}
            </div>
            </CardContent>
          </Card>

          {/* Top 3 CS */}
          <Card className="bg-white shadow-lg border-slate-200 hover:shadow-xl transition-shadow duration-200">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-slate-200 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Users className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold text-slate-900">Top 3 CS</CardTitle>
                    <p className="text-sm text-slate-600 mt-1">Customer Service terbaik</p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
            <div className="space-y-3">
              {topCS.length > 0 ? topCS.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{item.name}</p>
                    <p className="text-xs text-gray-500">{item.leads} leads</p>
                  </div>
                  <span className="text-sm font-bold text-green-600">{item.ctr}</span>
                </div>
              )) : (
                <div className="text-center text-gray-500 py-4">
                  Tidak ada data CS
                </div>
              )}
            </div>
            </CardContent>
          </Card>

          {/* Quality Metrics */}
          <Card className="bg-white shadow-lg border-slate-200 hover:shadow-xl transition-shadow duration-200">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-violet-50 border-b border-slate-200 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <Shield className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold text-slate-900">Kualitas Leads</CardTitle>
                    <p className="text-sm text-slate-600 mt-1">Metrik kualitas dan spam</p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                <div>
                  <p className="text-sm font-medium text-green-800">CTR Hari Ini</p>
                  <p className="text-xs text-green-600">Conversion rate</p>
                </div>
                <span className="text-lg font-bold text-green-600">{stats?.ctrLeads || '0%'}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                <div>
                  <div className="flex items-center space-x-1">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <p className="text-sm font-medium text-red-800">Spam Detected</p>
                  </div>
                  <p className="text-xs text-red-600">Periode ini</p>
                </div>
                <span className="text-lg font-bold text-red-600">{stats?.totalSpam || 0}</span>
              </div>
            </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Distribusi Kode Ads */}
          <Card className="bg-white shadow-lg border-slate-200 hover:shadow-xl transition-shadow duration-200">
            <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-slate-200 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <BarChart3 className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold text-slate-900">Distribusi Kode Ads</CardTitle>
                    <p className="text-sm text-slate-600 mt-1">Performa iklan berdasarkan kode</p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
            <div className="space-y-3">
              {kodeAdsData.map((item, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-700 w-12">{item.name}</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-4 relative">
                    <div 
                      className="h-4 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${item.value}%`, 
                        backgroundColor: item.color 
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold text-gray-800 w-8">{item.value}%</span>
                </div>
              ))}
            </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
    </ProtectedRoute>
  )
}

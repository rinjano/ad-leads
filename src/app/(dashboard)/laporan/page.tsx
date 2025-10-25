'use client'

// Updated: Added Organik grouping feature for sumber leads
import React, { useState, useEffect, useMemo } from 'react'
import { 
  FileText, 
  BarChart3, 
  TrendingUp, 
  Download, 
  Calendar, 
  Filter,
  Search,
  Users,
  Target,
  DollarSign,
  Activity,
  PieChart,
  LineChart,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  Loader2,
  AlertTriangle,
  Lock
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useSumberLeadsLaporan } from '@/hooks/useSumberLeadsLaporan'
import { useLaporanSummary } from '@/hooks/useLaporanSummary'
import { useKodeAdsLaporan } from '@/hooks/useKodeAdsLaporan'
import { useLayananLaporan } from '@/hooks/useLayananLaporan'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'
import { useTipeFaskesLaporan } from '@/hooks/useTipeFaskesLaporan'
import { useKotaLaporan } from '@/hooks/useKotaLaporan'
import { useCsPerformance } from '@/hooks/useCsPerformance'
import { DynamicPieChart } from '@/components/DynamicPieChart'
import { useMonthlyAdsSpend } from '@/hooks/useMonthlyAdsSpend'
import { useAuth } from '@/contexts/AuthContext'
import { useLayananMaster } from '@/hooks/useLayananMaster'
import { formatCurrency } from '@/lib/utils'

export default function LaporanPage() {
  const { canAccessMenu, appUser, loading: authLoading } = useAuth()

  // Check if user can access laporan menu
  const canAccessLaporan = canAccessMenu('laporan')

  const [dateRange, setDateRange] = useState('thismonth')
  const [showCustomDate, setShowCustomDate] = useState(false)

  // State untuk filter tahun rekap bulanan
  const currentYear = new Date().getFullYear()
  const [selectedYear, setSelectedYear] = useState(() => {
    // Coba ambil tahun terbaru dari data, fallback ke tahun sekarang
    // getAvailableYears belum bisa dipanggil di sini, jadi default currentYear
    return currentYear
  })

  // State untuk filter kode ads, sumber leads, layanan
  const [selectedAdsCode, setSelectedAdsCode] = useState("")
  const [selectedLeadSource, setSelectedLeadSource] = useState("")
  const [selectedLayanan, setSelectedLayanan] = useState("")
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')

  // Handle date range change
  const handleDateRangeChange = (e) => {
    const value = e.target.value
    setDateRange(value)
    setShowCustomDate(value === 'custom')
  }

  // Fetch Summary data from database
  const { data: summaryData, isLoading: summaryLoading, error: summaryError, refetch: refetchSummary } = useLaporanSummary(
    dateRange,
    customStartDate,
    customEndDate
  )

  // Fetch Sumber Leads data from database
  const { data: sumberLeadsData, isLoading: sumberLeadsLoading, error: sumberLeadsError, refetch: refetchSumberLeads } = useSumberLeadsLaporan(
    dateRange,
    customStartDate,
    customEndDate
  )

  // Fetch Kode Ads data from database
  const { data: kodeAdsLaporanData, isLoading: kodeAdsLoading, error: kodeAdsError, refetch: refetchKodeAds } = useKodeAdsLaporan(
    dateRange,
    customStartDate,
    customEndDate
  )

  // Fetch Layanan data dari database untuk tab lain
  const { data: layananLaporanData, isLoading: layananLoading, error: layananError, refetch: refetchLayanan } = useLayananLaporan(
    dateRange,
    customStartDate,
    customEndDate
  )

  // State filter layanan untuk performa CS (khusus tab CS)
  const [selectedLayananCS, setSelectedLayananCS] = useState('all')
  
  // State untuk pagination Kota/Kabupaten
  const [kotaCurrentPage, setKotaCurrentPage] = useState(1)
  const [kotaItemsPerPage, setKotaItemsPerPage] = useState('10')
  const { data: layananListDataCS, isLoading: layananListLoadingCS } = useLayananMaster()

  // Fetch Tipe Faskes data from database
  const { data: tipeFaskesLaporanData, isLoading: tipeFaskesLoading, error: tipeFaskesError, refetch: refetchTipeFaskes } = useTipeFaskesLaporan(
    dateRange,
    customStartDate,
    customEndDate
  )

  // Fetch Kota data from database
  const { data: kotaLaporanData, isLoading: kotaLoading, error: kotaError, refetch: refetchKota } = useKotaLaporan(
    dateRange,
    customStartDate,
    customEndDate
  )

  // (duplikat dihapus, gunakan hanya variabel di atas untuk filter CS)

  // Fetch CS Performance data dari database dengan filter layanan
  const { data: csPerformanceData, isLoading: csLoading, error: csError, refetch: refetchCs } = useCsPerformance(
    dateRange,
    customStartDate,
    customEndDate,
    selectedLayananCS === 'all' ? '' : selectedLayananCS
  )

  // Fetch Monthly Ads Spend data from database
  const { data: monthlyAdsSpendData, isLoading: monthlyAdsSpendLoading, error: monthlyAdsSpendError, refetch: refetchMonthlyAdsSpend } = useMonthlyAdsSpend(
    dateRange,
    customStartDate,
    customEndDate
  )

  // Process sumber leads data from API with colors
  const processedKodeAdsData = useMemo(() => {
    const colorClasses = ['blue', 'green', 'purple', 'orange', 'indigo', 'emerald', 'pink', 'teal']
    
    if (!kodeAdsLaporanData?.data || kodeAdsLaporanData.data.length === 0) {
      return []
    }
    
    return kodeAdsLaporanData.data.slice(0, 8).map((item, index) => ({
      ...item,
      color: colorClasses[index % colorClasses.length]
    }))
  }, [kodeAdsLaporanData])

  // Process layanan data from API with colors
  const layananData = useMemo(() => {
    const colorClasses = ['blue', 'green', 'purple', 'orange', 'indigo', 'emerald', 'pink', 'teal']
    
    if (!layananLaporanData?.data || layananLaporanData.data.length === 0) {
      return []
    }
    
    return layananLaporanData.data.map((item, index) => ({
      ...item,
      name: item.layanan,
      ctr: item.ctrLeads,
      color: colorClasses[index % colorClasses.length]
    }))
  }, [layananLaporanData])

  // Process tipe faskes data from API with colors
  const tipeFaskesData = useMemo(() => {
    const colorClasses = ['blue', 'green', 'purple', 'orange', 'indigo', 'emerald', 'pink', 'teal']
    
    if (!tipeFaskesLaporanData?.data || tipeFaskesLaporanData.data.length === 0) {
      return []
    }
    
    return tipeFaskesLaporanData.data.map((item, index) => ({
      ...item,
      name: item.label,
      ctr: item.ctrLeads,
      color: colorClasses[index % colorClasses.length]
    }))
  }, [tipeFaskesLaporanData])

  // Process kota data from API with colors
  const kotaData = useMemo(() => {
    const colorClasses = ['blue', 'green', 'purple', 'orange', 'indigo', 'emerald', 'pink', 'teal']
    
    if (!kotaLaporanData?.data || kotaLaporanData.data.length === 0) {
      return []
    }
    
    return kotaLaporanData.data.map((item, index) => ({
      ...item,
      name: item.kota,
      ctr: item.ctrLeads,
      color: colorClasses[index % colorClasses.length]
    }))
  }, [kotaLaporanData])

  // Process CS performance data from API (no color assignment, color handled in table row)
  const processedCsData = useMemo(() => {
    if (!csPerformanceData?.data || csPerformanceData.data.length === 0) {
      return []
    }
    return csPerformanceData.data
  }, [csPerformanceData])

  // Process sumber leads data from API with colors and grouping
  const processedLeadSources = useMemo(() => {
    const colorClasses = ['blue', 'green', 'purple', 'orange', 'indigo', 'emerald', 'pink', 'teal']
    
    if (!sumberLeadsData?.data || sumberLeadsData.data.length === 0) {
      return []
    }
    
    return sumberLeadsData.data.map((item, index) => ({
      ...item,
      color: colorClasses[index % colorClasses.length]
    }))
  }, [sumberLeadsData])

  // Extract organik lead sources from breakdown
  const organikLeadSources = useMemo(() => {
    return sumberLeadsData?.breakdown?.organik || []
  }, [sumberLeadsData])

  // State for accordion expansions
  const [expandedOrganikSources, setExpandedOrganikSources] = useState(false)
  const [expandedAdsCode, setExpandedAdsCode] = useState<string | null>(null)

  // Toggle functions for accordions
  const toggleOrganikSourcesAccordion = () => {
    setExpandedOrganikSources(!expandedOrganikSources)
  }

  const toggleAdsCodeAccordion = (kode: string) => {
    setExpandedAdsCode(expandedAdsCode === kode ? null : kode)
  }

  // Fungsi untuk pagination Kota/Kabupaten
  const kotaTotalItems = kotaData.length
  const kotaItemsPerPageNum = parseInt(kotaItemsPerPage)
  const kotaTotalPages = Math.ceil(kotaTotalItems / kotaItemsPerPageNum)
  const kotaStartIndex = (kotaCurrentPage - 1) * kotaItemsPerPageNum
  const kotaEndIndex = kotaStartIndex + kotaItemsPerPageNum
  const kotaCurrentData = kotaData.slice(kotaStartIndex, kotaEndIndex)

  // Fungsi navigasi halaman Kota/Kabupaten
  const kotaHandlePageChange = (page) => {
    setKotaCurrentPage(page)
  }

  const kotaHandleItemsPerPageChange = (value) => {
    setKotaItemsPerPage(value)
    setKotaCurrentPage(1) // Reset ke halaman pertama
  }

  // Data untuk Performas CS
  const csData = processedCsData

  const [searchTerm, setSearchTerm] = useState('')

  // Fungsi untuk mendapatkan tahun-tahun yang tersedia di database
  const getAvailableYears = () => {
    if (!monthlyAdsSpendData) return []
    const years = [...new Set(monthlyAdsSpendData.map(item => item.year))]
    return years.sort((a, b) => b - a) // Urutkan descending
  }

  // Fungsi untuk mendapatkan bulan-bulan yang ada data di tahun tertentu
  const getAvailableMonthsInYear = (year) => {
    if (!monthlyAdsSpendData) return []
    const currentYear = new Date().getFullYear()
    const currentMonth = new Date().getMonth() + 1 // getMonth() returns 0-11, so add 1

    const monthsWithData = monthlyAdsSpendData
      .filter(item => item.year === year)
      .map(item => item.month)
    
    const uniqueMonths = [...new Set(monthsWithData)]
    
    const monthOrder = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
                       'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
    
    let availableMonths = monthOrder.filter(month => uniqueMonths.includes(month))
    
    // Jika tahun yang dipilih adalah tahun berjalan, hanya tampilkan sampai bulan saat ini
    if (year === currentYear) {
      availableMonths = availableMonths.filter((month, index) => {
        return monthOrder.indexOf(month) < currentMonth
      })
    }
    
    return availableMonths
  }

  // Fungsi untuk filter data berdasarkan Tahun, Kode Ads, Sumber Leads dan Layanan
  const getFilteredMonthlyData = () => {
    if (!monthlyAdsSpendData) return []
    let filtered = monthlyAdsSpendData
    
    // Filter by year
    filtered = filtered.filter(item => item.year === selectedYear)
    
    if (selectedAdsCode) {
      filtered = filtered.filter(item => item.kodeAds === selectedAdsCode)
    }
    
    if (selectedLeadSource) {
      filtered = filtered.filter(item => item.sumberLeads === selectedLeadSource)
    }

    if (selectedLayanan) {
      filtered = filtered.filter(item => 
        item.layanan && item.layanan.split(', ').includes(selectedLayanan)
      )
    }
    
    // Aggregate by month
    const aggregated = filtered.reduce((acc, item) => {
      const existing = acc.find(a => a.month === item.month && a.year === item.year)
      if (existing) {
        existing.budgetSpent += item.budgetSpent
        existing.prospek += item.prospek
        existing.leads += item.leads
        existing.costPerLead = existing.budgetSpent / existing.leads
        existing.ctrLeads = (existing.leads / existing.prospek) * 100
      } else {
        acc.push({ ...item })
      }
      return acc
    }, [])
    
    // Filter hanya bulan yang tersedia di tahun yang dipilih
    const availableMonths = getAvailableMonthsInYear(selectedYear)
    const filteredByAvailableMonths = aggregated.filter(item => availableMonths.includes(item.month))
    
    // Sort by month chronologically
    const monthOrder = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
                       'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
    
    return filteredByAvailableMonths.sort((a, b) => {
      return monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month)
    })
  }

  // Fungsi untuk menghitung total rekap
  const calculateMonthlyTotals = (data) => {
    return data.reduce((totals, item) => {
      totals.budgetSpent += item.budgetSpent
      totals.prospek += item.prospek
      totals.leads += item.leads
      totals.customer += item.customer || 0
      totals.totalNilaiLangganan += item.totalNilaiLangganan || 0
      return totals
    }, {
      budgetSpent: 0,
      prospek: 0,
      leads: 0,
      customer: 0,
      totalNilaiLangganan: 0,
      costPerLead: 0,
      ctrLeads: 0
    })
  }

  // Get unique values for filters
  const uniqueAdsCodes = useMemo(() => {
    if (!monthlyAdsSpendData) return []
    return [...new Set(monthlyAdsSpendData.map(item => item.kodeAds).filter(code => code && code !== 'Unknown'))]
  }, [monthlyAdsSpendData])

  const uniqueLeadSources = useMemo(() => {
    if (!monthlyAdsSpendData) return []
    return [...new Set(monthlyAdsSpendData.map(item => item.sumberLeads).filter(source => source && source !== 'Unknown'))]
  }, [monthlyAdsSpendData])

  const uniqueLayanan = useMemo(() => {
    if (!monthlyAdsSpendData) return []
    const allLayanan = monthlyAdsSpendData.flatMap(item => 
      item.layanan ? item.layanan.split(', ').filter(l => l.trim()) : []
    )
    return [...new Set(allLayanan)].filter(layanan => layanan && layanan !== 'Unknown')
  }, [monthlyAdsSpendData])

  // Summary stats dari database atau default values
  const summaryStats = (() => {
    if (csData && csData.length > 0) {
      // Calculate summary stats from csData
      const totalProspek = csData.reduce((sum, cs) => sum + (cs.prospek || 0), 0)
      const totalLeads = csData.reduce((sum, cs) => sum + (cs.leads || 0), 0)
      const totalCustomer = csData.reduce((sum, cs) => sum + (cs.customer || 0), 0)
      const totalNilaiLangganan = csData.reduce((sum, cs) => sum + (cs.totalNilaiLangganan || 0), 0)
      const ctrLeads = totalProspek > 0 ? ((totalLeads / totalProspek) * 100) : 0
      const ctrCustomer = totalLeads > 0 ? ((totalCustomer / totalLeads) * 100) : 0

      return [
        {
          title: "Total Prospek",
          value: totalProspek.toLocaleString(),
          change: "+0%",
          trend: "up",
          icon: Users,
          color: "blue"
        },
        {
          title: "Total Leads",
          value: totalLeads.toString(),
          change: "+0%",
          trend: "up",
          icon: Target,
          color: "green"
        },
        {
          title: "CTR Leads",
          value: ctrLeads.toFixed(1) + "%",
          change: "+0%",
          trend: "up",
          icon: TrendingUp,
          color: "purple"
        },
        {
          title: "Total Spam",
          value: "0",
          change: "0%",
          trend: "down",
          icon: Activity,
          color: "orange"
        }
      ]
    }

    return [
      {
        title: "Total Prospek",
        value: "0",
        change: "+0%",
        trend: "up",
        icon: Users,
        color: "blue"
      },
      {
        title: "Total Leads",
        value: "0",
        change: "+0%",
        trend: "up",
        icon: Target,
        color: "green"
      },
      {
        title: "CTR Leads",
        value: "0%",
        change: "+0%",
        trend: "up",
        icon: TrendingUp,
        color: "purple"
      },
      {
        title: "Total Spam",
        value: "0",
        change: "0%",
        trend: "down",
        icon: Activity,
        color: "orange"
      }
    ]
  })()

  const recentReports = [
    {
      id: 1,
      name: "Laporan Lead Bulanan",
      type: "PDF",
      date: "28 Sep 2025",
      size: "2.4 MB",
      status: "completed"
    },
    {
      id: 2,
      name: "Analisis Konversi Q3",
      type: "Excel",
      date: "25 Sep 2025", 
      size: "1.8 MB",
      status: "completed"
    },
    {
      id: 3,
      name: "Dashboard Mingguan",
      type: "PDF",
      date: "21 Sep 2025",
      size: "892 KB",
      status: "completed"
    }
  ]

  const chartTypes = [
    { id: 'leads', name: 'Lead Analytics', icon: Users, description: 'Analisis performa lead dan konversi' },
    { id: 'sales', name: 'Sales Report', icon: TrendingUp, description: 'Laporan penjualan dan revenue' },
    { id: 'conversion', name: 'Conversion Funnel', icon: Target, description: 'Analisis conversion rate dan funnel' },
    { id: 'activity', name: 'Activity Report', icon: Activity, description: 'Laporan aktivitas tim dan performance' }
  ]

  return (
    <div className="space-y-6 p-6">
      {/* Role-based Access Control */}
      {authLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-3 text-slate-600">Memverifikasi akses...</span>
        </div>
      ) : !canAccessLaporan ? (
        <div className="bg-white shadow-lg rounded-2xl border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Lock className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Akses Ditolak</h1>
                <p className="text-sm text-slate-600">Anda tidak memiliki izin untuk mengakses halaman ini</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 text-red-700">
                  <AlertTriangle className="h-5 w-5" />
                  <div>
                    <p className="font-medium">Izin Diperlukan</p>
                    <p className="text-sm mt-1">
                      {appUser?.role === 'cs_support' 
                        ? 'Sebagai CS Support, Anda hanya dapat mengakses Dashboard untuk melihat data prospek Anda sendiri.'
                        : appUser?.role === 'advertiser'
                        ? 'Sebagai Advertiser, Anda dapat mengakses Dashboard, Data Prospek, dan Ads Spend untuk kode iklan yang ditugaskan.'
                        : 'Akses ke halaman Laporan memerlukan role yang sesuai. Silakan hubungi administrator untuk informasi lebih lanjut.'
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <>
        
        {/* Header Section */}
        <div className="bg-white shadow-lg rounded-2xl border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">Laporan & Analytics</h1>
                  <p className="text-sm text-slate-600">Kelola dan analisis data bisnis Anda</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white">
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </Button>
              </div>
            </div>
          </div>

          {/* Filter Periode */}
          <div className="p-6">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-slate-500" />
              <span className="text-sm font-medium text-slate-700">Periode:</span>
              <select 
                value={dateRange} 
                onChange={handleDateRangeChange}
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

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {summaryLoading ? (
            // Loading state
            Array.from({ length: 4 }).map((_, index) => (
              <Card key={index} className="bg-white shadow-lg border-slate-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-center h-24">
                    <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : summaryError ? (
            // Error state
            <div className="col-span-full">
              <Card className="bg-red-50 border-red-200">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 text-red-700">
                    <AlertTriangle className="h-5 w-5" />
                    <p>Gagal memuat data summary. Silakan coba lagi.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            summaryStats.map((stat, index) => (
              <Card key={index} className="bg-white shadow-lg border-slate-200 hover:shadow-xl transition-shadow duration-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-slate-600">{stat.title}</p>
                      <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                      <div className="flex items-center gap-1">
                        {stat.trend === 'up' ? (
                          <ArrowUpRight className="h-4 w-4 text-green-500" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4 text-red-500" />
                        )}
                        <span className={`text-sm font-medium ${
                          stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {stat.change}
                        </span>
                      </div>
                    </div>
                    <div className={
                      stat.color === 'blue' ? 'p-3 rounded-lg bg-blue-100' :
                      stat.color === 'green' ? 'p-3 rounded-lg bg-green-100' :
                      stat.color === 'purple' ? 'p-3 rounded-lg bg-purple-100' :
                      stat.color === 'orange' ? 'p-3 rounded-lg bg-orange-100' :
                      'p-3 rounded-lg bg-slate-100'
                    }>
                      <stat.icon className={
                        stat.color === 'blue' ? 'h-6 w-6 text-blue-600' :
                        stat.color === 'green' ? 'h-6 w-6 text-green-600' :
                        stat.color === 'purple' ? 'h-6 w-6 text-purple-600' :
                        stat.color === 'orange' ? 'h-6 w-6 text-orange-600' :
                        'h-6 w-6 text-slate-600'
                      } />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="sumber-leads" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-8 bg-slate-50 border-b-2 border-slate-200 p-0 rounded-none shadow-sm">
            <TabsTrigger 
              value="sumber-leads"
              className="flex items-center justify-center gap-2 py-4 px-4 font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:font-bold transition-all duration-200 border-b-2 border-transparent"
            >
              <Target className="h-4 w-4" />
              <span className="hidden md:inline">Sumber Leads</span>
            </TabsTrigger>
            <TabsTrigger 
              value="kode-ads"
              className="flex items-center justify-center gap-2 py-4 px-4 font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:font-bold transition-all duration-200 border-b-2 border-transparent"
            >
              <BarChart3 className="h-4 w-4" />
              <span className="hidden md:inline">Kode Ads</span>
            </TabsTrigger>
            <TabsTrigger 
              value="layanan"
              className="flex items-center justify-center gap-2 py-4 px-4 font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:font-bold transition-all duration-200 border-b-2 border-transparent"
            >
              <Activity className="h-4 w-4" />
              <span className="hidden md:inline">Layanan</span>
            </TabsTrigger>
            <TabsTrigger 
              value="tipe-faskes"
              className="flex items-center justify-center gap-2 py-4 px-4 font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:font-bold transition-all duration-200 border-b-2 border-transparent"
            >
              <Users className="h-4 w-4" />
              <span className="hidden md:inline">Tipe Faskes</span>
            </TabsTrigger>
            <TabsTrigger 
              value="kota-kabupaten"
              className="flex items-center justify-center gap-2 py-4 px-4 font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:font-bold transition-all duration-200 border-b-2 border-transparent"
            >
              <Calendar className="h-4 w-4" />
              <span className="hidden md:inline">Kota/Kabupaten</span>
            </TabsTrigger>
            <TabsTrigger 
              value="performas-cs"
              className="flex items-center justify-center gap-2 py-4 px-4 font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:font-bold transition-all duration-200 border-b-2 border-transparent"
            >
              <TrendingUp className="h-4 w-4" />
              <span className="hidden md:inline">Performas CS</span>
            </TabsTrigger>
            <TabsTrigger 
              value="ltv-retensi"
              className="flex items-center justify-center gap-2 py-4 px-4 font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:font-bold transition-all duration-200 border-b-2 border-transparent"
            >
              <LineChart className="h-4 w-4" />
              <span className="hidden md:inline">LTV & Retensi</span>
            </TabsTrigger>
            <TabsTrigger 
              value="rekap-bulanan-ads"
              className="flex items-center justify-center gap-2 py-4 px-4 font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:font-bold transition-all duration-200 border-b-2 border-transparent"
            >
              <DollarSign className="h-4 w-4" />
              <span className="hidden md:inline">Rekap Bulanan Ads Spend</span>
            </TabsTrigger>
          </TabsList>

          {/* Sumber Leads Tab */}
          <TabsContent value="sumber-leads">
            {sumberLeadsLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-3 text-slate-600">Memuat data Sumber Leads...</span>
              </div>
            ) : sumberLeadsError ? (
              <div className="flex flex-col items-center justify-center h-64">
                <AlertTriangle className="h-12 w-12 text-orange-500 mb-4" />
                <p className="text-slate-600 mb-4">Gagal memuat data Sumber Leads</p>
                <Button onClick={() => refetchSumberLeads()} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Coba Lagi
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Tabel Performance Sumber Leads */}
                <Card className="bg-white shadow-lg border-slate-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-blue-600" />
                      Performance Sumber Leads
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-slate-50 border-b-2 border-slate-200">
                            <TableHead className="font-semibold text-slate-700 py-4 px-4 text-left">Sumber Leads</TableHead>
                            <TableHead className="font-semibold text-slate-700 py-4 px-4 text-left">Prospek</TableHead>
                            <TableHead className="font-semibold text-slate-700 py-4 px-4 text-left">Leads</TableHead>
                            <TableHead className="font-semibold text-slate-700 py-4 px-4 text-left">Customer</TableHead>
                            <TableHead className="font-semibold text-slate-700 py-4 px-4 text-left">Total Nilai Langganan</TableHead>
                            <TableHead className="font-semibold text-slate-700 py-4 px-4 text-left">CTR Leads</TableHead>
                            <TableHead className="font-semibold text-slate-700 py-4 px-4 text-left">CTR Customer</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {processedLeadSources && processedLeadSources.length > 0 ? (
                            processedLeadSources.map((source, index) => (
                          <React.Fragment key={source.name}>
                            {/* Main Row */}
                            <TableRow 
                              className={`hover:bg-slate-50 border-b border-slate-100 transition-colors duration-200 ${
                                source.name === 'Organik' ? 'cursor-pointer' : ''
                              }`}
                              onClick={source.name === 'Organik' ? toggleOrganikSourcesAccordion : undefined}
                            >
                              <TableCell className="py-4 px-4">
                                <div className="flex items-center gap-2">
                                  <Badge 
                                    variant="outline" 
                                    className={`text-xs rounded-full font-medium px-3 py-1 ${
                                      source.name.toLowerCase().includes('facebook') 
                                        ? 'border-blue-300 bg-blue-50 text-blue-700'
                                        : source.name.toLowerCase().includes('google')
                                        ? 'border-green-300 bg-green-50 text-green-700'
                                        : source.name.toLowerCase().includes('instagram')
                                        ? 'border-pink-300 bg-pink-50 text-pink-700'
                                        : source.name.toLowerCase().includes('tiktok')
                                        ? 'border-purple-300 bg-purple-50 text-purple-700'
                                        : source.name === 'Organik'
                                        ? 'border-slate-300 bg-slate-50 text-slate-700'
                                        : 'border-gray-300 bg-gray-50 text-gray-700'
                                    }`}
                                  >
                                    {source.name}
                                  </Badge>
                                  {source.name === 'Organik' && (
                                    expandedOrganikSources ? 
                                      <ChevronDown className="h-4 w-4 text-slate-500 transition-transform duration-200" /> : 
                                      <ChevronRight className="h-4 w-4 text-slate-500 transition-transform duration-200" />
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="py-4 px-4 text-sm text-slate-900 font-medium">
                                {source.prospek.toLocaleString()}
                              </TableCell>
                              <TableCell className="py-4 px-4 text-sm text-slate-900 font-medium">
                                {source.leads}
                              </TableCell>
                              <TableCell className="py-4 px-4 text-sm text-slate-900 font-medium">
                                <div className="flex items-center gap-1">
                                  <Users className="h-4 w-4 text-blue-500" />
                                  <span className="font-bold text-blue-600">{source.customer || 0}</span>
                                </div>
                              </TableCell>
                              <TableCell className="py-4 px-4 text-sm text-slate-900 font-medium">
                                <div className="font-bold text-green-600">{formatCurrency(source.totalNilaiLangganan || 0)}</div>
                                <div className="text-xs text-slate-500">total nilai</div>
                              </TableCell>
                              <TableCell className="py-4 px-4">
                                <div className="flex items-center gap-2">
                                  <div className="w-16 h-2 bg-slate-200 rounded-full">
                                    <div 
                                      className={`h-2 rounded-full ${
                                        source.name.toLowerCase().includes('facebook') 
                                          ? 'bg-blue-500'
                                          : source.name.toLowerCase().includes('google')
                                          ? 'bg-green-500'
                                          : source.name.toLowerCase().includes('instagram')
                                          ? 'bg-pink-500'
                                          : source.name.toLowerCase().includes('tiktok')
                                          ? 'bg-purple-500'
                                          : source.name === 'Organik'
                                          ? 'bg-slate-500'
                                          : 'bg-gray-500'
                                      }`}
                                      style={{width: `${Math.min(source.ctr * 2.4, 100)}%`}}
                                    ></div>
                                  </div>
                                  <span 
                                    className={`text-sm font-bold ${
                                      source.name.toLowerCase().includes('facebook') 
                                        ? 'text-blue-600'
                                        : source.name.toLowerCase().includes('google')
                                        ? 'text-green-600'
                                        : source.name.toLowerCase().includes('instagram')
                                        ? 'text-pink-600'
                                        : source.name.toLowerCase().includes('tiktok')
                                        ? 'text-purple-600'
                                        : source.name === 'Organik'
                                        ? 'text-slate-600'
                                        : 'text-gray-600'
                                    }`}
                                  >
                                    {source.ctr.toFixed(1)}%
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="py-4 px-4">
                                <div className="flex items-center gap-2">
                                  <div className="w-16 h-2 bg-slate-200 rounded-full">
                                    <div 
                                      className={`h-2 rounded-full ${
                                        source.name.toLowerCase().includes('facebook') 
                                          ? 'bg-blue-500'
                                          : source.name.toLowerCase().includes('google')
                                          ? 'bg-green-500'
                                          : source.name.toLowerCase().includes('instagram')
                                          ? 'bg-pink-500'
                                          : source.name.toLowerCase().includes('tiktok')
                                          ? 'bg-purple-500'
                                          : source.name === 'Organik'
                                          ? 'bg-slate-500'
                                          : 'bg-gray-500'
                                      }`}
                                      style={{width: `${Math.min(((source.customer || 0) / (source.leads || 1)) * 100 * 2, 100)}%`}}
                                    ></div>
                                  </div>
                                  <span 
                                    className={`text-sm font-bold ${
                                      source.name.toLowerCase().includes('facebook') 
                                        ? 'text-blue-600'
                                        : source.name.toLowerCase().includes('google')
                                        ? 'text-green-600'
                                        : source.name.toLowerCase().includes('instagram')
                                        ? 'text-pink-600'
                                        : source.name.toLowerCase().includes('tiktok')
                                        ? 'text-purple-600'
                                        : source.name === 'Organik'
                                        ? 'text-slate-600'
                                        : 'text-gray-600'
                                    }`}
                                  >
                                    {source.leads > 0 ? (((source.customer || 0) / source.leads) * 100).toFixed(1) : '0.0'}%
                                  </span>
                                </div>
                              </TableCell>
                            </TableRow>

                            {/* Accordion untuk Organik */}
                            {source.name === 'Organik' && expandedOrganikSources && (
                              <TableRow className="bg-slate-50 border-b border-slate-200">
                                <TableCell colSpan={7} className="py-0 px-0">
                                  <div className="px-8 py-4">
                                    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
                                      <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center">
                                        <Target className="h-4 w-4 mr-2 text-slate-600" />
                                        Detail Sumber Leads Organik
                                      </h4>
                                      <div className="space-y-2">
                                        {organikLeadSources.length === 0 ? (
                                          <div className="p-3 bg-slate-50 rounded-lg text-sm text-slate-500">
                                            Tidak ada detail sumber leads organik untuk periode ini.
                                          </div>
                                        ) : (
                                        organikLeadSources.map((organikSource, orgIndex) => {
                                          // Gunakan CTR dari backend jika tersedia, fallback ke perhitungan lokal
                                          const organikCtrLeads = typeof organikSource.ctr === 'number'
                                            ? organikSource.ctr
                                            : (organikSource.prospek > 0 
                                              ? ((organikSource.leads / organikSource.prospek) * 100) 
                                              : 0)
                                          const organikCtrCustomer = typeof organikSource.ctrCustomer === 'number'
                                            ? organikSource.ctrCustomer
                                            : (organikSource.leads > 0 
                                              ? (((organikSource.customer || 0) / organikSource.leads) * 100) 
                                              : 0)

                                          // Assign colors based on index
                                          const colorClasses = [
                                            { badge: 'border-orange-300 bg-orange-50 text-orange-700', text: 'text-orange-600' },
                                            { badge: 'border-purple-300 bg-purple-50 text-purple-700', text: 'text-purple-600' },
                                            { badge: 'border-indigo-300 bg-indigo-50 text-indigo-700', text: 'text-indigo-600' },
                                            { badge: 'border-emerald-300 bg-emerald-50 text-emerald-700', text: 'text-emerald-600' },
                                            { badge: 'border-cyan-300 bg-cyan-50 text-cyan-700', text: 'text-cyan-600' },
                                            { badge: 'border-rose-300 bg-rose-50 text-rose-700', text: 'text-rose-600' },
                                          ]
                                          const colorClass = colorClasses[orgIndex % colorClasses.length]

                                          return (
                                          <div key={organikSource.id || organikSource.name} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                                            <div className="flex-1">
                                              <div className="flex items-center gap-2">
                                                <Badge 
                                                  variant="outline" 
                                                  className={`text-xs rounded-full font-medium px-2 py-1 ${colorClass.badge}`}
                                                >
                                                  {organikSource.name}
                                                </Badge>
                                              </div>
                                            </div>
                                            <div className="flex items-center gap-4 text-xs">
                                              <div className="text-center">
                                                <p className="text-slate-500">Prospek</p>
                                                <p className="font-bold text-slate-900">{organikSource.prospek.toLocaleString()}</p>
                                              </div>
                                              <div className="text-center">
                                                <p className="text-slate-500">Leads</p>
                                                <p className={`font-bold ${colorClass.text}`}>
                                                  {organikSource.leads}
                                                </p>
                                              </div>
                                              <div className="text-center">
                                                <p className="text-slate-500">Customer</p>
                                                <p className="font-bold text-blue-600">{organikSource.customer || 0}</p>
                                              </div>
                                              <div className="text-center">
                                                <p className="text-slate-500">Total Nilai</p>
                                                <p className="font-bold text-green-600 text-xs">{formatCurrency(organikSource.totalNilaiLangganan || 0)}</p>
                                              </div>
                                              <div className="text-center">
                                                <p className="text-slate-500">CTR Leads</p>
                                                <p className="font-bold text-green-600">{organikCtrLeads.toFixed(1)}%</p>
                                              </div>
                                              <div className="text-center">
                                                <p className="text-slate-500">CTR Customer</p>
                                                <p className="font-bold text-blue-600">{organikCtrCustomer.toFixed(1)}%</p>
                                              </div>
                                            </div>
                                          </div>
                                          )
                                        })
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </TableCell>
                              </TableRow>
                            )}
                          </React.Fragment>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={7} className="py-8 text-center text-slate-500">
                                Tidak ada data sumber leads untuk periode ini
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>

              {/* Pie Chart Distribusi Sumber Leads */}
              <Card className="bg-white shadow-lg border-slate-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5 text-purple-600" />
                    Distribusi Sumber Leads
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {processedLeadSources && processedLeadSources.length > 0 ? (
                    <>
                      {/* Pie Chart Visual */}
                      <div className="relative h-64 flex items-center justify-center mb-6">
                        <svg width="200" height="200" viewBox="0 0 200 200" className="transform -rotate-90">
                          {(() => {
                            const totalLeads = processedLeadSources.reduce((sum, source) => sum + source.leads, 0)
                            if (totalLeads === 0) return null
                            
                            let currentOffset = 0
                            const colors = ['#64748b', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16']
                            
                            return processedLeadSources.map((source, index) => {
                              const percentage = (source.leads / totalLeads) * 100
                              const circumference = 2 * Math.PI * 80
                              const strokeLength = (percentage / 100) * circumference
                              const strokeDasharray = `${strokeLength} ${circumference}`
                              const strokeDashoffset = -currentOffset
                              currentOffset += strokeLength
                              
                              return (
                                <circle
                                  key={source.id}
                                  cx="100"
                                  cy="100"
                                  r="80"
                                  fill="none"
                                  stroke={colors[index % colors.length]}
                                  strokeWidth="20"
                                  strokeDasharray={strokeDasharray}
                                  strokeDashoffset={strokeDashoffset}
                                  className="transition-all duration-300 hover:stroke-width-[24]"
                                />
                              )
                            })
                          })()}
                        </svg>
                        
                        {/* Center label */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <p className="text-2xl font-bold text-slate-900">
                              {processedLeadSources.reduce((sum, source) => sum + source.leads, 0)}
                            </p>
                            <p className="text-sm text-slate-600">Total Leads</p>
                          </div>
                        </div>
                      </div>

                      {/* Legend */}
                      <div className="space-y-3">
                        {processedLeadSources.map((source, index) => {
                          const totalLeads = processedLeadSources.reduce((sum, s) => sum + s.leads, 0)
                          const percentage = totalLeads > 0 ? ((source.leads / totalLeads) * 100).toFixed(0) : '0'
                          const colors = ['slate', 'green', 'orange', 'purple', 'pink', 'cyan', 'lime']
                          const color = colors[index % colors.length]
                          
                          return (
                            <div key={source.id} className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full bg-${color}-500`}></div>
                                <span className="text-sm text-slate-700">{source.name}</span>
                              </div>
                              <div className="text-right">
                                <span className={`text-sm font-bold text-${color}-600`}>
                                  {source.leads} ({percentage}%)
                                </span>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-slate-500">
                      <PieChart className="h-12 w-12 mb-2" />
                      <p>Tidak ada data untuk ditampilkan</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            )}
          </TabsContent>

          {/* Kode Ads Tab */}
          <TabsContent value="kode-ads">
            {kodeAdsLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-3 text-slate-600">Memuat data Kode Ads...</span>
              </div>
            ) : kodeAdsError ? (
              <div className="flex flex-col items-center justify-center h-64">
                <AlertTriangle className="h-12 w-12 text-orange-500 mb-4" />
                <p className="text-slate-600 mb-4">Gagal memuat data Kode Ads</p>
                <Button onClick={() => refetchKodeAds()} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Coba Lagi
                </Button>
              </div>
            ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Tabel Laporan Performance Kode Ads */}
              <Card className="bg-white shadow-lg border-slate-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-green-600" />
                    Performance Kode Ads
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50 border-b-2 border-slate-200">
                          <TableHead className="font-semibold text-slate-700 py-4 px-4 text-left">Kode Ads</TableHead>
                          <TableHead className="font-semibold text-slate-700 py-4 px-4 text-left">Prospek</TableHead>
                          <TableHead className="font-semibold text-slate-700 py-4 px-4 text-left">Leads</TableHead>
                          <TableHead className="font-semibold text-slate-700 py-4 px-4 text-left">CTR Leads</TableHead>
                          <TableHead className="font-semibold text-slate-700 py-4 px-4 text-left">CTR Customer</TableHead>
                          <TableHead className="font-semibold text-slate-700 py-4 px-4 text-left">Customer</TableHead>
                          <TableHead className="font-semibold text-slate-700 py-4 px-4 text-left">Total Nilai Langganan</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {kodeAdsLaporanData?.data && kodeAdsLaporanData.data.length > 0 ? (
                          kodeAdsLaporanData.data.map((kodeAds, index) => {
                            const colors = ['blue', 'green', 'orange', 'purple', 'indigo', 'emerald', 'pink', 'teal']
                            const color = colors[index % colors.length]
                            
                            return (
                              <React.Fragment key={kodeAds.id}>
                                {/* Main Row */}
                                <TableRow 
                                  className="hover:bg-slate-50 border-b border-slate-100 transition-colors duration-200 cursor-pointer"
                                  onClick={() => toggleAdsCodeAccordion(kodeAds.kode)}
                                >
                                  <TableCell className="py-4 px-4">
                                    <div className="flex items-center gap-2">
                                      <Badge variant="outline" className={`text-xs rounded-full border-${color}-300 bg-${color}-50 text-${color}-700 font-medium px-3 py-1 font-mono`}>
                                        {kodeAds.kode}
                                      </Badge>
                                      {expandedAdsCode === kodeAds.kode ? 
                                        <ChevronDown className="h-4 w-4 text-slate-500 transition-transform duration-200" /> : 
                                        <ChevronRight className="h-4 w-4 text-slate-500 transition-transform duration-200" />
                                      }
                                    </div>
                                  </TableCell>
                                  <TableCell className="py-4 px-4 text-sm text-slate-900 font-medium">{kodeAds.prospek}</TableCell>
                                  <TableCell className="py-4 px-4 text-sm text-slate-900 font-medium">{kodeAds.leads}</TableCell>
                                  <TableCell className="py-4 px-4">
                                    <div className="flex items-center gap-2">
                                      <div className="w-16 h-2 bg-slate-200 rounded-full">
                                        <div 
                                          className={`h-2 bg-${color}-500 rounded-full`}
                                          style={{width: `${Math.min(kodeAds.ctr * 2.4, 100)}%`}}
                                        ></div>
                                      </div>
                                      <span className={`text-sm font-bold text-${color}-600`}>{kodeAds.ctr.toFixed(1)}%</span>
                                    </div>
                                  </TableCell>
                                  <TableCell className="py-4 px-4">
                                    <div className="flex items-center gap-2">
                                      <div className="w-16 h-2 bg-slate-200 rounded-full">
                                        <div 
                                          className="h-2 bg-green-500 rounded-full"
                                          style={{width: `${Math.min(kodeAds.ctrCustomer * 2, 100)}%`}}
                                        ></div>
                                      </div>
                                      <span className="text-sm font-bold text-green-600">
                                        {kodeAds.ctrCustomer.toFixed(1)}%
                                      </span>
                                    </div>
                                  </TableCell>
                                  <TableCell className="py-4 px-4 text-sm text-slate-900 font-medium">
                                    <div className="flex items-center gap-1">
                                      <Users className={`h-4 w-4 text-${color}-500`} />
                                      <span className={`font-bold text-${color}-600`}>{kodeAds.customer}</span>
                                    </div>
                                  </TableCell>
                                  <TableCell className="py-4 px-4 text-sm text-slate-900 font-medium">
                                    <div className="font-bold text-green-600">{formatCurrency(kodeAds.totalNilaiLangganan)}</div>
                                    <div className="text-xs text-slate-500">total nilai</div>
                                  </TableCell>
                                </TableRow>

                                {/* Accordion for ID Ads */}
                                {expandedAdsCode === kodeAds.kode && kodeAds.idAds && kodeAds.idAds.length > 0 && (
                                  <TableRow className={`bg-${color}-50 border-b border-${color}-200`}>
                                    <TableCell colSpan={7} className="py-0 px-0">
                                      <div className="px-8 py-4">
                                        <div className={`bg-white rounded-lg shadow-sm border border-${color}-200 p-4`}>
                                          <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center">
                                            <Target className={`h-4 w-4 mr-2 text-${color}-600`} />
                                            Detail ID Ads untuk Kode {kodeAds.kode}
                                          </h4>
                                          <div className="space-y-2">
                                            {kodeAds.idAds.map((ad) => (
                                              <div key={ad.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                                                <div className="flex-1">
                                                  <p className="text-sm font-medium text-slate-900 font-mono">{ad.id}</p>
                                                </div>
                                                <div className="flex items-center gap-3 text-xs">
                                                  <div className="text-center">
                                                    <p className="text-slate-500">Prospek</p>
                                                    <p className="font-bold text-slate-900">{ad.prospek}</p>
                                                  </div>
                                                  <div className="text-center">
                                                    <p className="text-slate-500">Leads</p>
                                                    <p className={`font-bold text-${color}-600`}>{ad.leads}</p>
                                                  </div>
                                                  <div className="text-center">
                                                    <p className="text-slate-500">CTR Leads</p>
                                                    <p className="font-bold text-green-600">{ad.ctr}</p>
                                                  </div>
                                                  <div className="text-center">
                                                    <p className="text-slate-500">CTR Customer</p>
                                                    <p className="font-bold text-green-600">{ad.ctrCustomer}</p>
                                                  </div>
                                                  <div className="text-center">
                                                    <p className="text-slate-500">Customer</p>
                                                    <p className={`font-bold text-${color}-600`}>{ad.customer}</p>
                                                  </div>
                                                  <div className="text-center">
                                                    <p className="text-slate-500">Nilai Langganan</p>
                                                    <p className="font-bold text-green-600">{formatCurrency(ad.totalNilaiLangganan)}</p>
                                                  </div>
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                )}
                              </React.Fragment>
                            )
                          })
                        ) : (
                          <TableRow>
                            <TableCell colSpan={7} className="py-8 text-center text-slate-500">
                              Tidak ada data kode ads untuk periode ini
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              {/* Pie Chart Distribusi Kode Ads */}
              <Card className="bg-white shadow-lg border-slate-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5 text-purple-600" />
                    Distribusi Kode Ads
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {processedKodeAdsData && processedKodeAdsData.length > 0 ? (
                    <DynamicPieChart
                      data={processedKodeAdsData.map((item, index) => ({
                        label: item.kode || 'Unknown',
                        value: item.leads,
                        color: item.color
                      }))}
                      totalLabel="Total Leads"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-64">
                      <p className="text-slate-500">No data available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            )}
          </TabsContent>

          {/* Layanan Tab */}
          <TabsContent value="layanan">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Tabel Laporan Layanan */}
              <Card className="bg-white shadow-lg border-slate-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-purple-600" />
                    Performance Layanan
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50 border-b-2 border-slate-200">
                          <TableHead className="font-semibold text-slate-700 py-4 px-4 text-left">Layanan</TableHead>
                          <TableHead className="font-semibold text-slate-700 py-4 px-4 text-left">Leads</TableHead>
                          <TableHead className="font-semibold text-slate-700 py-4 px-4 text-left">Customer</TableHead>
                          <TableHead className="font-semibold text-slate-700 py-4 px-4 text-left">Total Nilai Langganan</TableHead>
                          <TableHead className="font-semibold text-slate-700 py-4 px-4 text-left">CTR Customer</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {layananData.map((layanan, index) => (
                          <TableRow key={layanan.name} className="hover:bg-slate-50 border-b border-slate-100 transition-colors duration-200">
                            <TableCell className="py-4 px-4">
                              <Badge 
                                variant="outline" 
                                className={`text-xs rounded-full font-medium px-3 py-1 ${
                                  layanan.color === 'blue' 
                                    ? 'border-blue-300 bg-blue-50 text-blue-700'
                                    : layanan.color === 'green'
                                    ? 'border-green-300 bg-green-50 text-green-700'
                                    : layanan.color === 'purple'
                                    ? 'border-purple-300 bg-purple-50 text-purple-700'
                                    : layanan.color === 'orange'
                                    ? 'border-orange-300 bg-orange-50 text-orange-700'
                                    : layanan.color === 'indigo'
                                    ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
                                    : layanan.color === 'emerald'
                                    ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                                    : layanan.color === 'pink'
                                    ? 'border-pink-300 bg-pink-50 text-pink-700'
                                    : layanan.color === 'teal'
                                    ? 'border-teal-300 bg-teal-50 text-teal-700'
                                    : 'border-slate-300 bg-slate-50 text-slate-700'
                                }`}
                              >
                                {layanan.name}
                              </Badge>
                            </TableCell>
                            <TableCell className="py-4 px-4 text-sm text-slate-900 font-medium">
                              {layanan.leads}
                            </TableCell>
                            <TableCell className="py-4 px-4 text-sm text-slate-900 font-medium">
                              <div className="flex items-center gap-1">
                                <Users className="h-4 w-4 text-blue-500" />
                                <span className="font-bold text-blue-600">{layanan.customer}</span>
                              </div>
                            </TableCell>
                            <TableCell className="py-4 px-4 text-sm text-slate-900 font-medium">
                              <div className="font-bold text-green-600">{formatCurrency(layanan.totalNilaiLangganan)}</div>
                              <div className="text-xs text-slate-500">total nilai</div>
                            </TableCell>
                            <TableCell className="py-4 px-4">
                              <div className="flex items-center gap-2">
                                <div className="w-16 h-2 bg-slate-200 rounded-full">
                                  <div 
                                    className={`h-2 rounded-full ${
                                      layanan.color === 'blue' ? 'bg-blue-500'
                                      : layanan.color === 'green' ? 'bg-green-500'
                                      : layanan.color === 'purple' ? 'bg-purple-500'
                                      : layanan.color === 'orange' ? 'bg-orange-500'
                                      : layanan.color === 'indigo' ? 'bg-indigo-500'
                                      : layanan.color === 'emerald' ? 'bg-emerald-500'
                                      : layanan.color === 'pink' ? 'bg-pink-500'
                                      : layanan.color === 'teal' ? 'bg-teal-500'
                                      : 'bg-slate-500'
                                    }`}
                                    style={{width: `${Math.min(((layanan.customer / layanan.leads) * 100) * 2, 100)}%`}}
                                  ></div>
                                </div>
                                <span 
                                  className={`text-sm font-bold ${
                                    layanan.color === 'blue' ? 'text-blue-600'
                                    : layanan.color === 'green' ? 'text-green-600'
                                    : layanan.color === 'purple' ? 'text-purple-600'
                                    : layanan.color === 'orange' ? 'text-orange-600'
                                    : layanan.color === 'indigo' ? 'text-indigo-600'
                                    : layanan.color === 'emerald' ? 'text-emerald-600'
                                    : layanan.color === 'pink' ? 'text-pink-600'
                                    : layanan.color === 'teal' ? 'text-teal-600'
                                    : 'text-slate-600'
                                  }`}
                                >
                                  {((layanan.customer / layanan.leads) * 100).toFixed(1)}%
                                </span>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              {/* Pie Chart Distribusi Layanan */}
              <Card className="bg-white shadow-lg border-slate-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5 text-green-600" />
                    Distribusi Layanan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {layananData && layananData.length > 0 ? (
                    <DynamicPieChart
                      data={layananData.map((item) => ({
                        label: item.name,
                        value: item.leads,
                        color: item.color
                      }))}
                      totalLabel="Total Leads"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-64">
                      <p className="text-slate-500">No data available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tipe Faskes Tab */}
          <TabsContent value="tipe-faskes">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Tabel Laporan Tipe Faskes */}
              <Card className="bg-white shadow-lg border-slate-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    Performance Tipe Faskes
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50 border-b-2 border-slate-200">
                          <TableHead className="font-semibold text-slate-700 py-4 px-4 text-left">Tipe Faskes</TableHead>
                          <TableHead className="font-semibold text-slate-700 py-4 px-4 text-left">Prospek</TableHead>
                          <TableHead className="font-semibold text-slate-700 py-4 px-4 text-left">Leads</TableHead>
                          <TableHead className="font-semibold text-slate-700 py-4 px-4 text-left">Customer</TableHead>
                          <TableHead className="font-semibold text-slate-700 py-4 px-4 text-left">Total Nilai Langganan</TableHead>
                          <TableHead className="font-semibold text-slate-700 py-4 px-4 text-left">CTR Leads</TableHead>
                          <TableHead className="font-semibold text-slate-700 py-4 px-4 text-left">CTR Customer</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {tipeFaskesData.map((tipe, index) => (
                          <TableRow key={tipe.name} className="hover:bg-slate-50 border-b border-slate-100 transition-colors duration-200">
                            <TableCell className="py-4 px-4">
                              <Badge 
                                variant="outline" 
                                className={`text-xs rounded-full font-medium px-3 py-1 ${
                                  tipe.color === 'blue' 
                                    ? 'border-blue-300 bg-blue-50 text-blue-700'
                                    : tipe.color === 'green'
                                    ? 'border-green-300 bg-green-50 text-green-700'
                                    : tipe.color === 'purple'
                                    ? 'border-purple-300 bg-purple-50 text-purple-700'
                                    : tipe.color === 'orange'
                                    ? 'border-orange-300 bg-orange-50 text-orange-700'
                                    : tipe.color === 'indigo'
                                    ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
                                    : tipe.color === 'emerald'
                                    ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                                    : tipe.color === 'pink'
                                    ? 'border-pink-300 bg-pink-50 text-pink-700'
                                    : tipe.color === 'teal'
                                    ? 'border-teal-300 bg-teal-50 text-teal-700'
                                    : 'border-slate-300 bg-slate-50 text-slate-700'
                                }`}
                              >
                                {tipe.name}
                              </Badge>
                            </TableCell>
                            <TableCell className="py-4 px-4 text-sm text-slate-900 font-medium">
                              {tipe.prospek.toLocaleString()}
                            </TableCell>
                            <TableCell className="py-4 px-4 text-sm text-slate-900 font-medium">
                              {tipe.leads}
                            </TableCell>
                            <TableCell className="py-4 px-4 text-sm text-slate-900 font-medium">
                              <div className="flex items-center gap-1">
                                <Users className="h-4 w-4 text-blue-500" />
                                <span className="font-bold text-blue-600">{tipe.customer}</span>
                              </div>
                            </TableCell>
                            <TableCell className="py-4 px-4 text-sm text-slate-900 font-medium">
                              <div className="font-bold text-green-600">{formatCurrency(tipe.totalNilaiLangganan)}</div>
                              <div className="text-xs text-slate-500">total nilai</div>
                            </TableCell>
                            <TableCell className="py-4 px-4">
                              <div className="flex items-center gap-2">
                                <div className="w-16 h-2 bg-slate-200 rounded-full">
                                  <div 
                                    className={`h-2 rounded-full ${
                                      tipe.color === 'blue' ? 'bg-blue-500'
                                      : tipe.color === 'green' ? 'bg-green-500'
                                      : tipe.color === 'purple' ? 'bg-purple-500'
                                      : tipe.color === 'orange' ? 'bg-orange-500'
                                      : tipe.color === 'indigo' ? 'bg-indigo-500'
                                      : tipe.color === 'emerald' ? 'bg-emerald-500'
                                      : tipe.color === 'pink' ? 'bg-pink-500'
                                      : tipe.color === 'teal' ? 'bg-teal-500'
                                      : 'bg-slate-500'
                                    }`}
                                    style={{width: `${Math.min(tipe.ctr * 3, 100)}%`}}
                                  ></div>
                                </div>
                                <span 
                                  className={`text-sm font-bold ${
                                    tipe.color === 'blue' ? 'text-blue-600'
                                    : tipe.color === 'green' ? 'text-green-600'
                                    : tipe.color === 'purple' ? 'text-purple-600'
                                    : tipe.color === 'orange' ? 'text-orange-600'
                                    : tipe.color === 'indigo' ? 'text-indigo-600'
                                    : tipe.color === 'emerald' ? 'text-emerald-600'
                                    : tipe.color === 'pink' ? 'text-pink-600'
                                    : tipe.color === 'teal' ? 'text-teal-600'
                                    : 'text-slate-600'
                                  }`}
                                >
                                  {tipe.ctr.toFixed(1)}%
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="py-4 px-4">
                              <div className="flex items-center gap-2">
                                <div className="w-16 h-2 bg-slate-200 rounded-full">
                                  <div 
                                    className={`h-2 rounded-full ${
                                      tipe.color === 'blue' ? 'bg-blue-500'
                                      : tipe.color === 'green' ? 'bg-green-500'
                                      : tipe.color === 'purple' ? 'bg-purple-500'
                                      : tipe.color === 'orange' ? 'bg-orange-500'
                                      : tipe.color === 'indigo' ? 'bg-indigo-500'
                                      : tipe.color === 'emerald' ? 'bg-emerald-500'
                                      : tipe.color === 'pink' ? 'bg-pink-500'
                                      : tipe.color === 'teal' ? 'bg-teal-500'
                                      : 'bg-slate-500'
                                    }`}
                                    style={{width: `${Math.min(((tipe.customer / tipe.leads) * 100) * 2, 100)}%`}}
                                  ></div>
                                </div>
                                <span 
                                  className={`text-sm font-bold ${
                                    tipe.color === 'blue' ? 'text-blue-600'
                                    : tipe.color === 'green' ? 'text-green-600'
                                    : tipe.color === 'purple' ? 'text-purple-600'
                                    : tipe.color === 'orange' ? 'text-orange-600'
                                    : tipe.color === 'indigo' ? 'text-indigo-600'
                                    : tipe.color === 'emerald' ? 'text-emerald-600'
                                    : tipe.color === 'pink' ? 'text-pink-600'
                                    : tipe.color === 'teal' ? 'text-teal-600'
                                    : 'text-slate-600'
                                  }`}
                                >
                                  {((tipe.customer / tipe.leads) * 100).toFixed(1)}%
                                </span>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              {/* Pie Chart Distribusi Tipe Faskes */}
              <Card className="bg-white shadow-lg border-slate-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5 text-orange-600" />
                    Distribusi Tipe Faskes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {tipeFaskesData && tipeFaskesData.length > 0 ? (
                    <DynamicPieChart
                      data={tipeFaskesData.map((item) => ({
                        label: item.name,
                        value: item.leads,
                        color: item.color
                      }))}
                      totalLabel="Total Leads"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-64">
                      <p className="text-slate-500">No data available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Kota/Kabupaten Tab */}
          <TabsContent value="kota-kabupaten">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Tabel Laporan Kota/Kabupaten */}
              <Card className="bg-white shadow-lg border-slate-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-orange-600" />
                    Performance Kota/Kabupaten
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50 border-b-2 border-slate-200">
                          <TableHead className="font-semibold text-slate-700 py-4 px-4 text-left">Kota/Kabupaten</TableHead>
                          <TableHead className="font-semibold text-slate-700 py-4 px-4 text-left">Leads</TableHead>
                          <TableHead className="font-semibold text-slate-700 py-4 px-4 text-left">Customer</TableHead>
                          <TableHead className="font-semibold text-slate-700 py-4 px-4 text-left">Total Nilai Langganan</TableHead>
                          <TableHead className="font-semibold text-slate-700 py-4 px-4 text-left">CTR Leads</TableHead>
                          <TableHead className="font-semibold text-slate-700 py-4 px-4 text-left">CTR Customer</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {kotaCurrentData.map((kota, index) => {
                          const colorClasses = {
                            blue: { badge: 'border-blue-300 bg-blue-50 text-blue-700', bar: 'bg-blue-500', text: 'text-blue-600' },
                            green: { badge: 'border-green-300 bg-green-50 text-green-700', bar: 'bg-green-500', text: 'text-green-600' },
                            purple: { badge: 'border-purple-300 bg-purple-50 text-purple-700', bar: 'bg-purple-500', text: 'text-purple-600' },
                            orange: { badge: 'border-orange-300 bg-orange-50 text-orange-700', bar: 'bg-orange-500', text: 'text-orange-600' },
                            indigo: { badge: 'border-indigo-300 bg-indigo-50 text-indigo-700', bar: 'bg-indigo-500', text: 'text-indigo-600' },
                            emerald: { badge: 'border-emerald-300 bg-emerald-50 text-emerald-700', bar: 'bg-emerald-500', text: 'text-emerald-600' },
                            pink: { badge: 'border-pink-300 bg-pink-50 text-pink-700', bar: 'bg-pink-500', text: 'text-pink-600' },
                            teal: { badge: 'border-teal-300 bg-teal-50 text-teal-700', bar: 'bg-teal-500', text: 'text-teal-600' },
                            red: { badge: 'border-red-300 bg-red-50 text-red-700', bar: 'bg-red-500', text: 'text-red-600' },
                            cyan: { badge: 'border-cyan-300 bg-cyan-50 text-cyan-700', bar: 'bg-cyan-500', text: 'text-cyan-600' },
                            amber: { badge: 'border-amber-300 bg-amber-50 text-amber-700', bar: 'bg-amber-500', text: 'text-amber-600' },
                            lime: { badge: 'border-lime-300 bg-lime-50 text-lime-700', bar: 'bg-lime-500', text: 'text-lime-600' },
                            violet: { badge: 'border-violet-300 bg-violet-50 text-violet-700', bar: 'bg-violet-500', text: 'text-violet-600' },
                            rose: { badge: 'border-rose-300 bg-rose-50 text-rose-700', bar: 'bg-rose-500', text: 'text-rose-600' },
                            sky: { badge: 'border-sky-300 bg-sky-50 text-sky-700', bar: 'bg-sky-500', text: 'text-sky-600' },
                            slate: { badge: 'border-slate-300 bg-slate-50 text-slate-700', bar: 'bg-slate-500', text: 'text-slate-600' },
                            neutral: { badge: 'border-neutral-300 bg-neutral-50 text-neutral-700', bar: 'bg-neutral-500', text: 'text-neutral-600' },
                            stone: { badge: 'border-stone-300 bg-stone-50 text-stone-700', bar: 'bg-stone-500', text: 'text-stone-600' }
                          }
                          const colors = colorClasses[kota.color] || colorClasses.blue
                          
                          return (
                            <TableRow key={index} className="hover:bg-slate-50 border-b border-slate-100 transition-colors duration-200">
                              <TableCell className="py-4 px-4">
                                <Badge variant="outline" className={`text-xs rounded-full ${colors.badge} font-medium px-3 py-1`}>
                                  {kota.name}
                                </Badge>
                              </TableCell>
                              <TableCell className="py-4 px-4 text-sm text-slate-900 font-medium">{kota.leads}</TableCell>
                              <TableCell className="py-4 px-4 text-sm text-slate-900 font-medium">
                                <div className="flex items-center gap-1">
                                  <Users className="h-4 w-4 text-blue-500" />
                                  <span className="font-bold text-blue-600">{kota.customer || 0}</span>
                                </div>
                              </TableCell>
                              <TableCell className="py-4 px-4 text-sm text-slate-900 font-medium">
                                <div className="font-bold text-green-600">{formatCurrency(kota.totalNilaiLangganan || 0)}</div>
                                <div className="text-xs text-slate-500">total nilai</div>
                              </TableCell>
                              <TableCell className="py-4 px-4">
                                <div className="flex items-center gap-2">
                                  <div className="w-16 h-2 bg-slate-200 rounded-full">
                                    <div 
                                      className={`h-2 ${colors.bar} rounded-full transition-all duration-300`}
                                      style={{width: `${Math.min(kota.ctr * 4, 100)}%`}}
                                    ></div>
                                  </div>
                                  <span className={`text-sm font-bold ${colors.text}`}>{kota.ctr}%</span>
                                </div>
                              </TableCell>
                              <TableCell className="py-4 px-4">
                                <div className="flex items-center gap-2">
                                  <div className="w-16 h-2 bg-slate-200 rounded-full">
                                    <div 
                                      className="h-2 bg-green-500 rounded-full transition-all duration-300"
                                      style={{width: `${Math.min(((kota.customer || 0) / (kota.leads || 1)) * 100 * 2, 100)}%`}}
                                    ></div>
                                  </div>
                                  <span className="text-sm font-bold text-green-600">
                                    {kota.leads > 0 ? (((kota.customer || 0) / kota.leads) * 100).toFixed(1) : '0.0'}%
                                  </span>
                                </div>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Pagination Controls */}
                  <div className="px-6 py-4 border-t border-slate-200 bg-slate-50">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      {/* Items per page selector */}
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-600">Tampilkan</span>
                        <select 
                          value={kotaItemsPerPage} 
                          onChange={(e) => kotaHandleItemsPerPageChange(e.target.value)}
                          className="px-3 py-1 border border-slate-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="5">5</option>
                          <option value="10">10</option>
                          <option value="15">15</option>
                          <option value="20">20</option>
                        </select>
                        <span className="text-sm text-slate-600">data</span>
                      </div>

                      {/* Page info */}
                      <div className="text-sm text-slate-600">
                        Menampilkan {kotaStartIndex + 1} - {Math.min(kotaEndIndex, kotaTotalItems)} dari {kotaTotalItems} data
                      </div>

                      {/* Navigation buttons */}
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => kotaHandlePageChange(1)}
                          disabled={kotaCurrentPage === 1}
                          className="px-3 py-1 text-sm border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          ««
                        </button>
                        <button 
                          onClick={() => kotaHandlePageChange(kotaCurrentPage - 1)}
                          disabled={kotaCurrentPage === 1}
                          className="px-3 py-1 text-sm border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          ‹
                        </button>
                        
                        {/* Page numbers */}
                        {Array.from({ length: kotaTotalPages }, (_, i) => i + 1).map((page) => (
                          <button
                            key={page}
                            onClick={() => kotaHandlePageChange(page)}
                            className={`px-3 py-1 text-sm border rounded-md transition-colors ${
                              page === kotaCurrentPage
                                ? 'bg-blue-500 text-white border-blue-500'
                                : 'border-slate-300 hover:bg-slate-50'
                            }`}
                          >
                            {page}
                          </button>
                        ))}
                        
                        <button 
                          onClick={() => kotaHandlePageChange(kotaCurrentPage + 1)}
                          disabled={kotaCurrentPage === kotaTotalPages}
                          className="px-3 py-1 text-sm border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          ›
                        </button>
                        <button 
                          onClick={() => kotaHandlePageChange(kotaTotalPages)}
                          disabled={kotaCurrentPage === kotaTotalPages}
                          className="px-3 py-1 text-sm border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          »»
                        </button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Bar Chart Top 10 Kota/Kabupaten */}
              <Card className="bg-white shadow-lg border-slate-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-green-600" />
                    Top 10 Kota/Kabupaten (Berdasarkan Leads)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {kotaData.slice(0, 10).map((kota, index) => {
                      const maxLeads = Math.max(...kotaData.map(k => k.leads))
                      const widthPercentage = (kota.leads / maxLeads) * 100
                      const colors = {
                        blue: 'from-blue-500 to-blue-600',
                        green: 'from-green-500 to-green-600',
                        purple: 'from-purple-500 to-purple-600',
                        orange: 'from-orange-500 to-orange-600',
                        indigo: 'from-indigo-500 to-indigo-600',
                        emerald: 'from-emerald-500 to-emerald-600',
                        pink: 'from-pink-500 to-pink-600',
                        teal: 'from-teal-500 to-teal-600',
                        red: 'from-red-500 to-red-600',
                        cyan: 'from-cyan-500 to-cyan-600'
                      }
                      
                      return (
                        <div key={index} className="flex items-center gap-4">
                          <div className="w-20 text-right">
                            <span className="text-sm font-medium text-slate-700">{kota.name}</span>
                          </div>
                          <div className="flex-1 relative">
                            <div className="w-full h-6 bg-slate-200 rounded-full overflow-hidden">
                              <div 
                                className={`h-full bg-gradient-to-r ${colors[kota.color] || 'from-slate-500 to-slate-600'} rounded-full flex items-center justify-end pr-2 transition-all duration-500`}
                                style={{width: `${widthPercentage}%`}}
                              >
                                <span className="text-xs font-bold text-white">{kota.leads}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  
                  {/* Chart Summary */}
                  <div className="mt-6 p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg border border-slate-200">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Total Leads (Top 10)</span>
                      <span className="font-bold text-slate-900">{kotaData.slice(0, 10).reduce((sum, kota) => sum + kota.leads, 0).toLocaleString()} leads</span>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-1">
                      <span className="text-slate-600">Rata-rata CTR</span>
                      <span className="font-bold text-blue-600">{(kotaData.slice(0, 10).reduce((sum, kota) => sum + kota.ctr, 0) / 10).toFixed(1)}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Performas CS Tab */}
          <TabsContent value="performas-cs">
              {/* Filter Layanan */}
              <div className="mb-4 flex items-center gap-4">
                <label htmlFor="filter-layanan-cs" className="text-sm font-medium text-slate-700">Filter Layanan:</label>
                <Select
                  value={selectedLayananCS}
                  onValueChange={setSelectedLayananCS}
                  disabled={layananListLoadingCS}
                >
                  <SelectTrigger className="w-56" id="filter-layanan-cs">
                    <SelectValue placeholder="Semua Layanan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Layanan</SelectItem>
                    {layananListDataCS?.data?.map((layanan) => (
                      <SelectItem key={layanan.nama} value={layanan.id?.toString() || `layanan-${layanan.nama}`}>{layanan.nama}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {csLoading ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                  <span className="ml-3 text-slate-600">Memuat data Performas CS...</span>
                </div>
              ) : csError ? (
                <div className="flex flex-col items-center justify-center h-64">
                  <AlertTriangle className="h-12 w-12 text-orange-500 mb-4" />
                  <p className="text-slate-600 mb-4">Gagal memuat data Performas CS</p>
                  <Button onClick={() => refetchCs()} variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Coba Lagi
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Tabel Performas CS */}
                  <Card className="bg-white shadow-lg border-slate-200">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-purple-600" />
                        Performance CS
                      </CardTitle>
                      <p className="text-sm text-slate-600">Performa Customer Service berdasarkan konversi leads</p>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-slate-50 border-b-2 border-slate-200">
                              <TableHead className="font-semibold text-slate-700 py-4 px-4 text-left">CS Name</TableHead>
                              <TableHead className="font-semibold text-slate-700 py-4 px-4 text-left">Prospek</TableHead>
                              <TableHead className="font-semibold text-slate-700 py-4 px-4 text-left">Leads</TableHead>
                              <TableHead className="font-semibold text-slate-700 py-4 px-4 text-left">CTR Leads</TableHead>
                              <TableHead className="font-semibold text-slate-700 py-4 px-4 text-left">Customer</TableHead>
                              <TableHead className="font-semibold text-slate-700 py-4 px-4 text-left">Total Nilai Langganan</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {csData && csData.length > 0 ? (
                              csData.map((cs, index) => {
                                const colors = ['blue', 'green', 'purple', 'orange', 'indigo', 'emerald', 'pink', 'teal']
                                const color = colors[index % colors.length]
                                
                                return (
                                  <TableRow key={cs.name} className="hover:bg-slate-50 border-b border-slate-100 transition-colors duration-200">
                                    <TableCell className="py-4 px-4">
                                      <Badge 
                                        variant="outline" 
                                        className={`text-xs rounded-full font-medium px-3 py-1 ${
                                          color === 'blue' 
                                            ? 'border-blue-300 bg-blue-50 text-blue-700'
                                            : color === 'green'
                                            ? 'border-green-300 bg-green-50 text-green-700'
                                            : color === 'purple'
                                            ? 'border-purple-300 bg-purple-50 text-purple-700'
                                            : color === 'orange'
                                            ? 'border-orange-300 bg-orange-50 text-orange-700'
                                            : color === 'indigo'
                                            ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
                                            : color === 'emerald'
                                            ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                                            : color === 'pink'
                                            ? 'border-pink-300 bg-pink-50 text-pink-700'
                                            : color === 'teal'
                                            ? 'border-teal-300 bg-teal-50 text-teal-700'
                                            : 'border-slate-300 bg-slate-50 text-slate-700'
                                        }`}
                                      >
                                        {cs.name}
                                      </Badge>
                                    </TableCell>
                                    <TableCell className="py-4 px-4 text-sm text-slate-900 font-medium">
                                      {cs.prospek.toLocaleString()}
                                    </TableCell>
                                    <TableCell className="py-4 px-4 text-sm text-slate-900 font-medium">
                                      {cs.leads}
                                    </TableCell>
                                    <TableCell className="py-4 px-4">
                                      <div className="flex items-center gap-2">
                                        <div className="w-16 h-2 bg-slate-200 rounded-full">
                                          <div 
                                            className={`h-2 rounded-full ${
                                              color === 'blue' ? 'bg-blue-500'
                                              : color === 'green' ? 'bg-green-500'
                                              : color === 'purple' ? 'bg-purple-500'
                                              : color === 'orange' ? 'bg-orange-500'
                                              : color === 'indigo' ? 'bg-indigo-500'
                                              : color === 'emerald' ? 'bg-emerald-500'
                                              : color === 'pink' ? 'bg-pink-500'
                                              : color === 'teal' ? 'bg-teal-500'
                                              : 'bg-slate-500'
                                            }`}
                                            style={{width: `${Math.min(cs.ctr * 3, 100)}%`}}
                                          ></div>
                                        </div>
                                        <span 
                                          className={`text-sm font-bold ${
                                            color === 'blue' ? 'text-blue-600'
                                            : color === 'green' ? 'text-green-600'
                                            : color === 'purple' ? 'text-purple-600'
                                            : color === 'orange' ? 'text-orange-600'
                                            : color === 'indigo' ? 'text-indigo-600'
                                            : color === 'emerald' ? 'text-emerald-600'
                                            : color === 'pink' ? 'text-pink-600'
                                            : color === 'teal' ? 'text-teal-600'
                                            : 'text-slate-600'
                                          }`}
                                        >
                                          {cs.ctr.toFixed(1)}%
                                        </span>
                                      </div>
                                    </TableCell>
                                    <TableCell className="py-4 px-4 text-sm text-slate-900 font-medium">
                                      <div className="flex items-center gap-1">
                                        <Users className="h-4 w-4 text-blue-500" />
                                        <span className="font-bold text-blue-600">{cs.customer}</span>
                                      </div>
                                    </TableCell>
                                    <TableCell className="py-4 px-4 text-sm text-slate-900 font-medium">
                                      <div className="font-bold text-green-600">{formatCurrency(cs.totalNilaiLangganan)}</div>
                                      <div className="text-xs text-slate-500">total nilai</div>
                                    </TableCell>
                                  </TableRow>
                                )
                              })
                            ) : (
                              <TableRow>
                                <TableCell colSpan={6} className="py-8 text-center text-slate-500">
                                  Tidak ada data performas CS untuk periode ini
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Chart Distribusi CS Performance */}
                  <Card className="bg-white shadow-lg border-slate-200">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <PieChart className="h-5 w-5 text-green-600" />
                        Distribusi Performance CS
                      </CardTitle>
                      <p className="text-sm text-slate-600">Perbandingan performa CS berdasarkan total nilai langganan</p>
                    </CardHeader>
                    <CardContent>
                      {csData && csData.length > 0 ? (
                        <>
                          {/* Pie Chart Visual */}
                          <div className="relative h-64 flex items-center justify-center mb-6">
                            <svg width="200" height="200" viewBox="0 0 200 200" className="transform -rotate-90">
                              {(() => {
                                const totalLeads = csData.reduce((sum, cs) => sum + cs.leads, 0)
                                if (totalLeads === 0) return null
                                
                                let currentOffset = 0
                                const colors = ['#64748b', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#ef4444']
                                
                                return csData.slice(0, 8).map((cs, index) => {
                                  const percentage = (cs.leads / totalLeads) * 100
                                  const circumference = 2 * Math.PI * 80
                                  const strokeLength = (percentage / 100) * circumference
                                  const strokeDasharray = `${strokeLength} ${circumference}`
                                  const strokeDashoffset = -currentOffset
                                  currentOffset += strokeLength
                                  
                                  return (
                                    <circle
                                      key={cs.name}
                                      cx="100"
                                      cy="100"
                                      r="80"
                                      fill="none"
                                      stroke={colors[index % colors.length]}
                                      strokeWidth="20"
                                      strokeDasharray={strokeDasharray}
                                      strokeDashoffset={strokeDashoffset}
                                      className="transition-all duration-300 hover:stroke-width-[24]"
                                    />
                                  )
                                })
                              })()}
                            </svg>
                            
                            {/* Center label */}
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="text-center">
                                <p className="text-2xl font-bold text-slate-900">
                                  {csData.reduce((sum, cs) => sum + cs.leads, 0)}
                                </p>
                                <p className="text-sm text-slate-600">Total Leads</p>
                              </div>
                            </div>
                          </div>

                          {/* Legend */}
                          <div className="space-y-3">
                            {csData.slice(0, 8).map((cs, index) => {
                              const totalLeads = csData.reduce((sum, cs) => sum + cs.leads, 0)
                              const percentage = totalLeads > 0 ? ((cs.leads / totalLeads) * 100).toFixed(0) : '0'
                              const colors = ['slate', 'green', 'orange', 'purple', 'pink', 'cyan', 'lime', 'red']
                              const color = colors[index % colors.length]
                              
                              return (
                                <div key={cs.name} className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <div className={`w-3 h-3 rounded-full bg-${color}-500`}></div>
                                    <span className="text-sm text-slate-700">{cs.name}</span>
                                  </div>
                                  <div className="text-right">
                                    <span className={`text-sm font-bold text-${color}-600`}>
                                      {cs.leads} ({percentage}%)
                                    </span>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-64 text-slate-500">
                          <PieChart className="h-12 w-12 mb-2" />
                          <p>Tidak ada data untuk ditampilkan</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
          </TabsContent>

          {/* LTV & Retensi Tab */}
          <TabsContent value="ltv-retensi">
            <div className="space-y-6">
              {/* LTV & Retensi Insights Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg hover:shadow-xl transition-shadow duration-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-emerald-100">Rata-rata LTV</p>
                        <p className="text-2xl font-bold">Rp 2.850K</p>
                        <div className="flex items-center gap-1">
                          <ArrowUpRight className="h-4 w-4 text-emerald-200" />
                          <span className="text-sm font-medium text-emerald-100">+12.4% dari bulan lalu</span>
                        </div>
                      </div>
                      <div className="p-3 rounded-lg bg-emerald-400 bg-opacity-30">
                        <TrendingUp className="h-6 w-6 text-emerald-100" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg hover:shadow-xl transition-shadow duration-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-blue-100">Retention Rate</p>
                        <p className="text-2xl font-bold">78.5%</p>
                        <div className="flex items-center gap-1">
                          <ArrowUpRight className="h-4 w-4 text-blue-200" />
                          <span className="text-sm font-medium text-blue-100">+5.2% dari bulan lalu</span>
                        </div>
                      </div>
                      <div className="p-3 rounded-lg bg-blue-400 bg-opacity-30">
                        <Users className="h-6 w-6 text-blue-100" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-purple-500 to-violet-600 text-white shadow-lg hover:shadow-xl transition-shadow duration-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-purple-100">Churn Rate</p>
                        <p className="text-2xl font-bold">5.8%</p>
                        <div className="flex items-center gap-1">
                          <ArrowDownRight className="h-4 w-4 text-purple-200" />
                          <span className="text-sm font-medium text-purple-100">-2.1% dari bulan lalu</span>
                        </div>
                      </div>
                      <div className="p-3 rounded-lg bg-purple-400 bg-opacity-30">
                        <Activity className="h-6 w-6 text-purple-100" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg hover:shadow-xl transition-shadow duration-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-orange-100">Customer At Risk</p>
                        <p className="text-2xl font-bold">127</p>
                        <div className="flex items-center gap-1">
                          <ArrowUpRight className="h-4 w-4 text-orange-200" />
                          <span className="text-sm font-medium text-orange-100">+8 customer</span>
                        </div>
                      </div>
                      <div className="p-3 rounded-lg bg-orange-400 bg-opacity-30">
                        <Eye className="h-6 w-6 text-orange-100" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Top Customer Growth & Segmentation */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Customer berdasarkan Pertumbuhan LTV */}
                <Card className="bg-white shadow-lg border-slate-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-emerald-600" />
                      Top Customer - Pertumbuhan LTV
                    </CardTitle>
                    <p className="text-sm text-slate-600">Customer dengan pertumbuhan LTV tertinggi dalam 3 bulan terakhir</p>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-slate-50 border-b-2 border-slate-200">
                            <TableHead className="font-semibold text-slate-700 py-4 px-4 text-left">Customer</TableHead>
                            <TableHead className="font-semibold text-slate-700 py-4 px-4 text-left">LTV Saat Ini</TableHead>
                            <TableHead className="font-semibold text-slate-700 py-4 px-4 text-left">Growth</TableHead>
                            <TableHead className="font-semibold text-slate-700 py-4 px-4 text-left">Trend</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow className="hover:bg-slate-50 border-b border-slate-100 transition-colors duration-200">
                            <TableCell className="py-4 px-4">
                              <div>
                                <p className="font-medium text-slate-900">RS Mitra Keluarga</p>
                                <p className="text-xs text-slate-500">Jakarta Barat</p>
                              </div>
                            </TableCell>
                            <TableCell className="py-4 px-4 text-sm text-slate-900 font-medium">Rp 8.450K</TableCell>
                            <TableCell className="py-4 px-4">
                              <Badge variant="outline" className="text-xs rounded-full border-emerald-300 bg-emerald-50 text-emerald-700 font-medium px-3 py-1">
                                +45.2%
                              </Badge>
                            </TableCell>
                            <TableCell className="py-4 px-4">
                              <div className="flex items-center gap-2">
                                <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                                <span className="text-xs font-medium text-emerald-600">Sangat Baik</span>
                              </div>
                            </TableCell>
                          </TableRow>
                          <TableRow className="hover:bg-slate-50 border-b border-slate-100 transition-colors duration-200">
                            <TableCell className="py-4 px-4">
                              <div>
                                <p className="font-medium text-slate-900">RSUD Cipto Mangunkusumo</p>
                                <p className="text-xs text-slate-500">Jakarta Pusat</p>
                              </div>
                            </TableCell>
                            <TableCell className="py-4 px-4 text-sm text-slate-900 font-medium">Rp 6.280K</TableCell>
                            <TableCell className="py-4 px-4">
                              <Badge variant="outline" className="text-xs rounded-full border-emerald-300 bg-emerald-50 text-emerald-700 font-medium px-3 py-1">
                                +38.7%
                              </Badge>
                            </TableCell>
                            <TableCell className="py-4 px-4">
                              <div className="flex items-center gap-2">
                                <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                                <span className="text-xs font-medium text-emerald-600">Baik</span>
                              </div>
                            </TableCell>
                          </TableRow>
                          <TableRow className="hover:bg-slate-50 border-b border-slate-100 transition-colors duration-200">
                            <TableCell className="py-4 px-4">
                              <div>
                                <p className="font-medium text-slate-900">RS Siloam Karawaci</p>
                                <p className="text-xs text-slate-500">Tangerang</p>
                              </div>
                            </TableCell>
                            <TableCell className="py-4 px-4 text-sm text-slate-900 font-medium">Rp 5.890K</TableCell>
                            <TableCell className="py-4 px-4">
                              <Badge variant="outline" className="text-xs rounded-full border-blue-300 bg-blue-50 text-blue-700 font-medium px-3 py-1">
                                +32.1%
                              </Badge>
                            </TableCell>
                            <TableCell className="py-4 px-4">
                              <div className="flex items-center gap-2">
                                <ArrowUpRight className="h-4 w-4 text-blue-500" />
                                <span className="text-xs font-medium text-blue-600">Positif</span>
                              </div>
                            </TableCell>
                          </TableRow>
                          <TableRow className="hover:bg-slate-50 border-b border-slate-100 transition-colors duration-200">
                            <TableCell className="py-4 px-4">
                              <div>
                                <p className="font-medium text-slate-900">RS Husada Utama</p>
                                <p className="text-xs text-slate-500">Surabaya</p>
                              </div>
                            </TableCell>
                            <TableCell className="py-4 px-4 text-sm text-slate-900 font-medium">Rp 4.750K</TableCell>
                            <TableCell className="py-4 px-4">
                              <Badge variant="outline" className="text-xs rounded-full border-blue-300 bg-blue-50 text-blue-700 font-medium px-3 py-1">
                                +28.4%
                              </Badge>
                            </TableCell>
                            <TableCell className="py-4 px-4">
                              <div className="flex items-center gap-2">
                                <ArrowUpRight className="h-4 w-4 text-blue-500" />
                                <span className="text-xs font-medium text-blue-600">Stabil</span>
                              </div>
                            </TableCell>
                          </TableRow>
                          <TableRow className="hover:bg-slate-50 border-b border-slate-100 transition-colors duration-200">
                            <TableCell className="py-4 px-4">
                              <div>
                                <p className="font-medium text-slate-900">RS Hermina Bekasi</p>
                                <p className="text-xs text-slate-500">Bekasi</p>
                              </div>
                            </TableCell>
                            <TableCell className="py-4 px-4 text-sm text-slate-900 font-medium">Rp 4.120K</TableCell>
                            <TableCell className="py-4 px-4">
                              <Badge variant="outline" className="text-xs rounded-full border-orange-300 bg-orange-50 text-orange-700 font-medium px-3 py-1">
                                +25.6%
                              </Badge>
                            </TableCell>
                            <TableCell className="py-4 px-4">
                              <div className="flex items-center gap-2">
                                <ArrowUpRight className="h-4 w-4 text-orange-500" />
                                <span className="text-xs font-medium text-orange-600">Moderate</span>
                              </div>
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>

                {/* Segmentasi Customer berdasarkan LTV */}
                <Card className="bg-white shadow-lg border-slate-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChart className="h-5 w-5 text-purple-600" />
                      Segmentasi Customer LTV
                    </CardTitle>
                    <p className="text-sm text-slate-600">Distribusi customer berdasarkan kelompok nilai LTV</p>
                  </CardHeader>
                  <CardContent>
                    {/* Pie Chart Visual */}
                    <div className="relative h-56 flex items-center justify-center mb-6">
                      <svg width="180" height="180" viewBox="0 0 180 180" className="transform -rotate-90">
                        {/* High LTV (> 5M) - 35% */}
                        <circle
                          cx="90"
                          cy="90"
                          r="70"
                          fill="none"
                          stroke="#059669"
                          strokeWidth="20"
                          strokeDasharray="154 286"
                          strokeDashoffset="0"
                          className="transition-all duration-300 hover:stroke-width-[24]"
                        />
                        {/* Medium LTV (2-5M) - 45% */}
                        <circle
                          cx="90"
                          cy="90"
                          r="70"
                          fill="none"
                          stroke="#3b82f6"
                          strokeWidth="20"
                          strokeDasharray="198 242"
                          strokeDashoffset="-154"
                          className="transition-all duration-300 hover:stroke-width-[24]"
                        />
                        {/* Low LTV (< 2M) - 20% */}
                        <circle
                          cx="90"
                          cy="90"
                          r="70"
                          fill="none"
                          stroke="#f59e0b"
                          strokeWidth="20"
                          strokeDasharray="88 352"
                          strokeDashoffset="-352"
                          className="transition-all duration-300 hover:stroke-width-[24]"
                        />
                      </svg>
                      
                      {/* Center label */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <p className="text-xl font-bold text-slate-900">342</p>
                          <p className="text-xs text-slate-600">Total Customer</p>
                        </div>
                      </div>
                    </div>

                    {/* Legend & Stats */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-emerald-600 rounded-full"></div>
                          <span className="text-sm text-emerald-800 font-medium">High LTV (&gt; Rp 5M)</span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-bold text-emerald-800">120 (35%)</span>
                          <p className="text-xs text-emerald-600">Avg: Rp 7.2M</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          <span className="text-sm text-blue-800 font-medium">Medium LTV (Rp 2-5M)</span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-bold text-blue-800">154 (45%)</span>
                          <p className="text-xs text-blue-600">Avg: Rp 3.1M</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                          <span className="text-sm text-orange-800 font-medium">Low LTV (&lt; Rp 2M)</span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-bold text-orange-800">68 (20%)</span>
                          <p className="text-xs text-orange-600">Avg: Rp 1.2M</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Analisis Tren Retensi & Churn Prediction */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Tren Retensi per Kategori */}
                <Card className="bg-white shadow-lg border-slate-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <LineChart className="h-5 w-5 text-indigo-600" />
                      Tren Retensi per Kategori Produk
                    </CardTitle>
                    <p className="text-sm text-slate-600">Retention rate customer berdasarkan kategori layanan</p>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-slate-50 border-b-2 border-slate-200">
                            <TableHead className="font-semibold text-slate-700 py-4 px-4 text-left">Kategori Layanan</TableHead>
                            <TableHead className="font-semibold text-slate-700 py-4 px-4 text-left">Retention 3M</TableHead>
                            <TableHead className="font-semibold text-slate-700 py-4 px-4 text-left">Retention 6M</TableHead>
                            <TableHead className="font-semibold text-slate-700 py-4 px-4 text-left">Retention 12M</TableHead>
                            <TableHead className="font-semibold text-slate-700 py-4 px-4 text-left">Trend</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow className="hover:bg-slate-50 border-b border-slate-100 transition-colors duration-200">
                            <TableCell className="py-4 px-4">
                              <Badge variant="outline" className="text-xs rounded-full border-purple-300 bg-purple-50 text-purple-700 font-medium px-3 py-1">
                                Medical Equipment
                              </Badge>
                            </TableCell>
                            <TableCell className="py-4 px-4">
                              <div className="flex items-center gap-2">
                                <div className="w-12 h-2 bg-slate-200 rounded-full">
                                  <div className="w-10 h-2 bg-emerald-500 rounded-full"></div>
                                </div>
                                <span className="text-sm font-bold text-emerald-600">87.3%</span>
                              </div>
                            </TableCell>
                            <TableCell className="py-4 px-4">
                              <div className="flex items-center gap-2">
                                <div className="w-12 h-2 bg-slate-200 rounded-full">
                                  <div className="w-9 h-2 bg-emerald-500 rounded-full"></div>
                                </div>
                                <span className="text-sm font-bold text-emerald-600">82.1%</span>
                              </div>
                            </TableCell>
                            <TableCell className="py-4 px-4">
                              <div className="flex items-center gap-2">
                                <div className="w-12 h-2 bg-slate-200 rounded-full">
                                  <div className="w-9 h-2 bg-emerald-500 rounded-full"></div>
                                </div>
                                <span className="text-sm font-bold text-emerald-600">78.5%</span>
                              </div>
                            </TableCell>
                            <TableCell className="py-4 px-4">
                              <div className="flex items-center gap-1">
                                <ArrowUpRight className="h-3 w-3 text-emerald-500" />
                                <span className="text-xs font-medium text-emerald-600">+2.1%</span>
                              </div>
                            </TableCell>
                          </TableRow>
                          <TableRow className="hover:bg-slate-50 border-b border-slate-100 transition-colors duration-200">
                            <TableCell className="py-4 px-4">
                              <Badge variant="outline" className="text-xs rounded-full border-blue-300 bg-blue-50 text-blue-700 font-medium px-3 py-1">
                                Konsultasi Medis
                              </Badge>
                            </TableCell>
                            <TableCell className="py-4 px-4">
                              <div className="flex items-center gap-2">
                                <div className="w-12 h-2 bg-slate-200 rounded-full">
                                  <div className="w-8 h-2 bg-blue-500 rounded-full"></div>
                                </div>
                                <span className="text-sm font-bold text-blue-600">79.8%</span>
                              </div>
                            </TableCell>
                            <TableCell className="py-4 px-4">
                              <div className="flex items-center gap-2">
                                <div className="w-12 h-2 bg-slate-200 rounded-full">
                                  <div className="w-8 h-2 bg-blue-500 rounded-full"></div>
                                </div>
                                <span className="text-sm font-bold text-blue-600">74.2%</span>
                              </div>
                            </TableCell>
                            <TableCell className="py-4 px-4">
                              <div className="flex items-center gap-2">
                                <div className="w-12 h-2 bg-slate-200 rounded-full">
                                  <div className="w-7 h-2 bg-blue-500 rounded-full"></div>
                                </div>
                                <span className="text-sm font-bold text-blue-600">69.3%</span>
                              </div>
                            </TableCell>
                            <TableCell className="py-4 px-4">
                              <div className="flex items-center gap-1">
                                <ArrowUpRight className="h-3 w-3 text-blue-500" />
                                <span className="text-xs font-medium text-blue-600">+1.5%</span>
                              </div>
                            </TableCell>
                          </TableRow>
                          <TableRow className="hover:bg-slate-50 border-b border-slate-100 transition-colors duration-200">
                            <TableCell className="py-4 px-4">
                              <Badge variant="outline" className="text-xs rounded-full border-green-300 bg-green-50 text-green-700 font-medium px-3 py-1">
                                Lab & Diagnostik
                              </Badge>
                            </TableCell>
                            <TableCell className="py-4 px-4">
                              <div className="flex items-center gap-2">
                                <div className="w-12 h-2 bg-slate-200 rounded-full">
                                  <div className="w-7 h-2 bg-green-500 rounded-full"></div>
                                </div>
                                <span className="text-sm font-bold text-green-600">71.6%</span>
                              </div>
                            </TableCell>
                            <TableCell className="py-4 px-4">
                              <div className="flex items-center gap-2">
                                <div className="w-12 h-2 bg-slate-200 rounded-full">
                                  <div className="w-6 h-2 bg-green-500 rounded-full"></div>
                                </div>
                                <span className="text-sm font-bold text-green-600">67.3%</span>
                              </div>
                            </TableCell>
                            <TableCell className="py-4 px-4">
                              <div className="flex items-center gap-2">
                                <div className="w-12 h-2 bg-slate-200 rounded-full">
                                  <div className="w-6 h-2 bg-green-500 rounded-full"></div>
                                </div>
                                <span className="text-sm font-bold text-green-600">63.1%</span>
                              </div>
                            </TableCell>
                            <TableCell className="py-4 px-4">
                              <div className="flex items-center gap-1">
                                <ArrowDownRight className="h-3 w-3 text-orange-500" />
                                <span className="text-xs font-medium text-orange-600">-0.8%</span>
                              </div>
                            </TableCell>
                          </TableRow>
                          <TableRow className="hover:bg-slate-50 border-b border-slate-100 transition-colors duration-200">
                            <TableCell className="py-4 px-4">
                              <Badge variant="outline" className="text-xs rounded-full border-indigo-300 bg-indigo-50 text-indigo-700 font-medium px-3 py-1">
                                Homecare Services
                              </Badge>
                            </TableCell>
                            <TableCell className="py-4 px-4">
                              <div className="flex items-center gap-2">
                                <div className="w-12 h-2 bg-slate-200 rounded-full">
                                  <div className="w-6 h-2 bg-indigo-500 rounded-full"></div>
                                </div>
                                <span className="text-sm font-bold text-indigo-600">68.4%</span>
                              </div>
                            </TableCell>
                            <TableCell className="py-4 px-4">
                              <div className="flex items-center gap-2">
                                <div className="w-12 h-2 bg-slate-200 rounded-full">
                                  <div className="w-6 h-2 bg-indigo-500 rounded-full"></div>
                                </div>
                                <span className="text-sm font-bold text-indigo-600">62.8%</span>
                              </div>
                            </TableCell>
                            <TableCell className="py-4 px-4">
                              <div className="flex items-center gap-2">
                                <div className="w-12 h-2 bg-slate-200 rounded-full">
                                  <div className="w-5 h-2 bg-indigo-500 rounded-full"></div>
                                </div>
                                <span className="text-sm font-bold text-indigo-600">57.2%</span>
                              </div>
                            </TableCell>
                            <TableCell className="py-4 px-4">
                              <div className="flex items-center gap-1">
                                <ArrowUpRight className="h-3 w-3 text-indigo-500" />
                                <span className="text-xs font-medium text-indigo-600">+0.3%</span>
                              </div>
                            </TableCell>
                          </TableRow>
                          <TableRow className="hover:bg-slate-50 border-b border-slate-100 transition-colors duration-200">
                            <TableCell className="py-4 px-4">
                              <Badge variant="outline" className="text-xs rounded-full border-orange-300 bg-orange-50 text-orange-700 font-medium px-3 py-1">
                                Telemedicine
                              </Badge>
                            </TableCell>
                            <TableCell className="py-4 px-4">
                              <div className="flex items-center gap-2">
                                <div className="w-12 h-2 bg-slate-200 rounded-full">
                                  <div className="w-5 h-2 bg-orange-500 rounded-full"></div>
                                </div>
                                <span className="text-sm font-bold text-orange-600">58.2%</span>
                              </div>
                            </TableCell>
                            <TableCell className="py-4 px-4">
                              <div className="flex items-center gap-2">
                                <div className="w-12 h-2 bg-slate-200 rounded-full">
                                  <div className="w-5 h-2 bg-orange-500 rounded-full"></div>
                                </div>
                                <span className="text-sm font-bold text-orange-600">51.9%</span>
                              </div>
                            </TableCell>
                            <TableCell className="py-4 px-4">
                              <div className="flex items-center gap-2">
                                <div className="w-12 h-2 bg-slate-200 rounded-full">
                                  <div className="w-4 h-2 bg-red-500 rounded-full"></div>
                                </div>
                                <span className="text-sm font-bold text-red-600">45.7%</span>
                              </div>
                            </TableCell>
                            <TableCell className="py-4 px-4">
                              <div className="flex items-center gap-1">
                                <ArrowDownRight className="h-3 w-3 text-red-500" />
                                <span className="text-xs font-medium text-red-600">-1.2%</span>
                              </div>
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>

                {/* Prediksi Customer Rawan Churn */}
                <Card className="bg-white shadow-lg border-slate-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="h-5 w-5 text-red-600" />
                      Prediksi Customer Rawan Churn
                    </CardTitle>
                    <p className="text-sm text-slate-600">Customer dengan probabilitas tinggi tidak perpanjang langganan</p>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-slate-50 border-b-2 border-slate-200">
                            <TableHead className="font-semibold text-slate-700 py-4 px-4 text-left">Customer</TableHead>
                            <TableHead className="font-semibold text-slate-700 py-4 px-4 text-left">Risk Level</TableHead>
                            <TableHead className="font-semibold text-slate-700 py-4 px-4 text-left">Last Activity</TableHead>
                            <TableHead className="font-semibold text-slate-700 py-4 px-4 text-left">Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow className="hover:bg-slate-50 border-b border-slate-100 transition-colors duration-200">
                            <TableCell className="py-4 px-4">
                              <div>
                                <p className="font-medium text-slate-900">RS Harapan Kita</p>
                                <p className="text-xs text-slate-500">Jakarta Barat • LTV: Rp 3.2M</p>
                              </div>
                            </TableCell>
                            <TableCell className="py-4 px-4">
                              <Badge variant="outline" className="text-xs rounded-full border-red-300 bg-red-50 text-red-700 font-medium px-3 py-1">
                                High Risk (89%)
                              </Badge>
                            </TableCell>
                            <TableCell className="py-4 px-4 text-sm text-slate-600">45 hari lalu</TableCell>
                            <TableCell className="py-4 px-4">
                              <Button size="sm" variant="outline" className="text-xs h-7 px-2 border-red-300 text-red-600 hover:bg-red-50">
                                <RefreshCw className="h-3 w-3 mr-1" />
                                Follow Up
                              </Button>
                            </TableCell>
                          </TableRow>
                          <TableRow className="hover:bg-slate-50 border-b border-slate-100 transition-colors duration-200">
                            <TableCell className="py-4 px-4">
                              <div>
                                <p className="font-medium text-slate-900">Klinik Kimia Farma</p>
                                <p className="text-xs text-slate-500">Bandung • LTV: Rp 1.8M</p>
                              </div>
                            </TableCell>
                            <TableCell className="py-4 px-4">
                              <Badge variant="outline" className="text-xs rounded-full border-red-300 bg-red-50 text-red-700 font-medium px-3 py-1">
                                High Risk (82%)
                              </Badge>
                            </TableCell>
                            <TableCell className="py-4 px-4 text-sm text-slate-600">38 hari lalu</TableCell>
                            <TableCell className="py-4 px-4">
                              <Button size="sm" variant="outline" className="text-xs h-7 px-2 border-red-300 text-red-600 hover:bg-red-50">
                                <RefreshCw className="h-3 w-3 mr-1" />
                                Follow Up
                              </Button>
                            </TableCell>
                          </TableRow>
                          <TableRow className="hover:bg-slate-50 border-b border-slate-100 transition-colors duration-200">
                            <TableCell className="py-4 px-4">
                              <div>
                                <p className="font-medium text-slate-900">Lab ProSehat</p>
                                <p className="text-xs text-slate-500">Surabaya • LTV: Rp 2.4M</p>
                              </div>
                            </TableCell>
                            <TableCell className="py-4 px-4">
                              <Badge variant="outline" className="text-xs rounded-full border-orange-300 bg-orange-50 text-orange-700 font-medium px-3 py-1">
                                Medium Risk (67%)
                              </Badge>
                            </TableCell>
                            <TableCell className="py-4 px-4 text-sm text-slate-600">28 hari lalu</TableCell>
                            <TableCell className="py-4 px-4">
                              <Button size="sm" variant="outline" className="text-xs h-7 px-2 border-orange-300 text-orange-600 hover:bg-orange-50">
                                <RefreshCw className="h-3 w-3 mr-1" />
                                Monitor
                              </Button>
                            </TableCell>
                          </TableRow>
                          <TableRow className="hover:bg-slate-50 border-b border-slate-100 transition-colors duration-200">
                            <TableCell className="py-4 px-4">
                              <div>
                                <p className="font-medium text-slate-900">RS Bunda Margonda</p>
                                <p className="text-xs text-slate-500">Depok • LTV: Rp 4.1M</p>
                              </div>
                            </TableCell>
                            <TableCell className="py-4 px-4">
                              <Badge variant="outline" className="text-xs rounded-full border-orange-300 bg-orange-50 text-orange-700 font-medium px-3 py-1">
                                Medium Risk (58%)
                              </Badge>
                            </TableCell>
                            <TableCell className="py-4 px-4 text-sm text-slate-600">21 hari lalu</TableCell>
                            <TableCell className="py-4 px-4">
                              <Button size="sm" variant="outline" className="text-xs h-7 px-2 border-orange-300 text-orange-600 hover:bg-orange-50">
                                <RefreshCw className="h-3 w-3 mr-1" />
                                Monitor
                              </Button>
                            </TableCell>
                          </TableRow>
                          <TableRow className="hover:bg-slate-50 border-b border-slate-100 transition-colors duration-200">
                            <TableCell className="py-4 px-4">
                              <div>
                                <p className="font-medium text-slate-900">Apotek K24 Kemang</p>
                                <p className="text-xs text-slate-500">Jakarta Selatan • LTV: Rp 1.5M</p>
                              </div>
                            </TableCell>
                            <TableCell className="py-4 px-4">
                              <Badge variant="outline" className="text-xs rounded-full border-yellow-300 bg-yellow-50 text-yellow-700 font-medium px-3 py-1">
                                Low Risk (34%)
                              </Badge>
                            </TableCell>
                            <TableCell className="py-4 px-4 text-sm text-slate-600">15 hari lalu</TableCell>
                            <TableCell className="py-4 px-4">
                              <Button size="sm" variant="outline" className="text-xs h-7 px-2 border-yellow-300 text-yellow-600 hover:bg-yellow-50">
                                <Eye className="h-3 w-3 mr-1" />
                                Watch
                              </Button>
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Komparasi LTV & Export Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Komparasi LTV Antar Produk */}
                <Card className="lg:col-span-2 bg-white shadow-lg border-slate-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-blue-600" />
                      Komparasi LTV Antar Produk/Layanan
                    </CardTitle>
                    <p className="text-sm text-slate-600">Perbandingan rata-rata LTV customer berdasarkan kategori layanan</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="w-32 text-right">
                          <span className="text-sm font-medium text-slate-700">Medical Equipment</span>
                        </div>
                        <div className="flex-1 relative">
                          <div className="w-full h-8 bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-8 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-end pr-3 transition-all duration-500" style={{width: '95%'}}>
                              <span className="text-xs font-bold text-white">Rp 7.8M</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-32 text-right">
                          <span className="text-sm font-medium text-slate-700">Konsultasi Medis</span>
                        </div>
                        <div className="flex-1 relative">
                          <div className="w-full h-8 bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-end pr-3 transition-all duration-500" style={{width: '72%'}}>
                              <span className="text-xs font-bold text-white">Rp 5.9M</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-32 text-right">
                          <span className="text-sm font-medium text-slate-700">Lab & Diagnostik</span>
                        </div>
                        <div className="flex-1 relative">
                          <div className="w-full h-8 bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-8 bg-gradient-to-r from-purple-500 to-violet-600 rounded-full flex items-center justify-end pr-3 transition-all duration-500" style={{width: '58%'}}>
                              <span className="text-xs font-bold text-white">Rp 4.7M</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-32 text-right">
                          <span className="text-sm font-medium text-slate-700">Homecare Services</span>
                        </div>
                        <div className="flex-1 relative">
                          <div className="w-full h-8 bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-end pr-3 transition-all duration-500" style={{width: '45%'}}>
                              <span className="text-xs font-bold text-white">Rp 3.7M</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-32 text-right">
                          <span className="text-sm font-medium text-slate-700">Telemedicine</span>
                        </div>
                        <div className="flex-1 relative">
                          <div className="w-full h-8 bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-8 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-end pr-3 transition-all duration-500" style={{width: '32%'}}>
                              <span className="text-xs font-bold text-white">Rp 2.6M</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Chart Summary */}
                    <div className="mt-6 p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg border border-slate-200">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">Rata-rata LTV Keseluruhan</span>
                        <span className="font-bold text-slate-900">Rp 4.9M</span>
                      </div>
                      <div className="flex items-center justify-between text-sm mt-1">
                        <span className="text-slate-600">Best Performing Category</span>
                        <span className="font-bold text-emerald-600">Medical Equipment (+18.2%)</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Export Laporan */}
                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-blue-800">
                      <Download className="h-5 w-5" />
                      Export Laporan LTV & Retensi
                    </CardTitle>
                    <p className="text-sm text-blue-600">Download laporan insight tambahan</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button className="w-full bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white">
                      <Download className="h-4 w-4 mr-2" />
                      Laporan Top Customer Growth (Excel)
                    </Button>
                    
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-500 hover:from-blue-700 hover:to-indigo-600 text-white">
                      <Download className="h-4 w-4 mr-2" />
                      Segmentasi Customer LTV (PDF)
                    </Button>
                    
                    <Button className="w-full bg-gradient-to-r from-purple-600 to-violet-500 hover:from-purple-700 hover:to-violet-600 text-white">
                      <Download className="h-4 w-4 mr-2" />
                      Analisis Churn Prediction (Excel)
                    </Button>
                    
                    <Button className="w-full bg-gradient-to-r from-orange-600 to-red-500 hover:from-orange-700 hover:to-red-600 text-white">
                      <Download className="h-4 w-4 mr-2" />
                      Komparasi LTV Lengkap (PDF)
                    </Button>

                    <div className="mt-4 p-3 bg-blue-100 rounded-lg border border-blue-200">
                      <p className="text-xs text-blue-700">
                        <strong>Info:</strong> Laporan akan berisi data detail yang tidak tersedia di dashboard utama LTV & Retensi.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Rekap Bulanan Ads Spend Tab */}
          <TabsContent value="rekap-bulanan-ads">
            <div className="space-y-6">
              {/* Filter Section */}
              <Card className="bg-white shadow-lg border-slate-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Filter className="h-5 w-5 text-blue-600" />
                    Filter Data
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Tahun
                      </label>
                      <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-sm focus:border-blue-500 focus:ring-blue-500"
                      >
                        {getAvailableYears().map((year) => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Kode Ads
                      </label>
                      <select
                        value={selectedAdsCode}
                        onChange={(e) => setSelectedAdsCode(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-sm focus:border-blue-500 focus:ring-blue-500"
                      >
                        <option value="">Semua Kode Ads</option>
                        {uniqueAdsCodes.map((code) => (
                          <option key={code} value={code}>{code}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Sumber Leads
                      </label>
                      <select
                        value={selectedLeadSource}
                        onChange={(e) => setSelectedLeadSource(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-sm focus:border-blue-500 focus:ring-blue-500"
                      >
                        <option value="">Semua Sumber Leads</option>
                        {uniqueLeadSources.map((source) => (
                          <option key={source} value={source}>{source}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Layanan
                      </label>
                      <select
                        value={selectedLayanan}
                        onChange={(e) => setSelectedLayanan(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-sm focus:border-blue-500 focus:ring-blue-500"
                      >
                        <option value="">Semua Layanan</option>
                        {uniqueLayanan.map((layanan) => (
                          <option key={layanan} value={layanan}>{layanan}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="mt-4 p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-600">
                      <strong>Info:</strong> Data menampilkan rekap bulanan tahun {selectedYear} dari {selectedAdsCode || 'semua Kode Ads'}, {selectedLeadSource || 'semua Sumber Leads'}, dan {selectedLayanan || 'semua Layanan'} secara gabungan per bulan.
                      {(() => {
                        const currentYear = new Date().getFullYear()
                        const currentMonth = new Date().getMonth() + 1
                        const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
                                          'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
                        
                        if (selectedYear === currentYear) {
                          return ` Menampilkan data dari Januari sampai ${monthNames[currentMonth - 1]} ${currentYear}.`
                        } else {
                          const availableMonths = getAvailableMonthsInYear(selectedYear)
                          if (availableMonths.length > 0) {
                            const lastMonth = availableMonths[availableMonths.length - 1]
                            return ` Menampilkan data dari Januari sampai ${lastMonth} ${selectedYear}.`
                          }
                        }
                        return ""
                      })()}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Monthly Summary Table */}
              <Card className="bg-white shadow-lg border-slate-200 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-200 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <BarChart3 className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">Rekap Bulanan Ads Spend</h3>
                        <p className="text-sm text-slate-600">Laporan performa iklan per bulan</p>
                      </div>
                    </div>
                    <div className="text-sm text-slate-500">
                      {selectedAdsCode || selectedLeadSource || selectedLayanan ? 
                        `Filter: ${selectedAdsCode ? selectedAdsCode : 'Semua'} - ${selectedLeadSource ? selectedLeadSource : 'Semua'} - ${selectedLayanan ? selectedLayanan : 'Semua'}` :
                        'Menampilkan: Semua Data'
                      }
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gradient-to-r from-slate-50 to-slate-100 border-b-2 border-slate-200">
                        <TableHead className="py-4 px-6 text-left font-semibold text-slate-700 border-r border-slate-200 min-w-[120px]">Bulan</TableHead>
                        <TableHead className="py-4 px-6 text-right font-semibold text-slate-700 border-r border-slate-200 min-w-[140px]">Budget Spent</TableHead>
                        <TableHead className="py-4 px-6 text-center font-semibold text-slate-700 border-r border-slate-200 min-w-[100px]">Prospek</TableHead>
                        <TableHead className="py-4 px-6 text-center font-semibold text-slate-700 border-r border-slate-200 min-w-[100px]">Leads</TableHead>
                        <TableHead className="py-4 px-6 text-center font-semibold text-slate-700 border-r border-slate-200 min-w-[100px]">Customer</TableHead>
                        <TableHead className="py-4 px-6 text-right font-semibold text-slate-700 border-r border-slate-200 min-w-[140px]">Cost Per Leads</TableHead>
                        <TableHead className="py-4 px-6 text-right font-semibold text-slate-700 border-r border-slate-200 min-w-[160px]">Total Nilai Langganan</TableHead>
                        <TableHead className="py-4 px-6 text-center font-semibold text-slate-700 border-r border-slate-200 min-w-[120px]">CTR Leads</TableHead>
                        <TableHead className="py-4 px-6 text-center font-semibold text-slate-700 min-w-[120px]">CTR Customer</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(() => {
                        const filteredData = getFilteredMonthlyData()
                        const totals = calculateMonthlyTotals(filteredData)
                        totals.costPerLead = totals.leads > 0 ? totals.budgetSpent / totals.leads : 0
                        totals.ctrLeads = totals.prospek > 0 ? (totals.leads / totals.prospek) * 100 : 0

                        return (
                          <>
                            {filteredData.map((item, index) => (
                              <TableRow key={index} className="hover:bg-slate-50 border-b border-slate-100 transition-colors duration-200">
                                <TableCell className="py-4 px-6 border-r border-slate-100">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-semibold text-sm">
                                      {item.month.substring(0, 3)}
                                    </div>
                                    <div className="font-medium text-slate-900">{item.month} {item.year}</div>
                                  </div>
                                </TableCell>
                                <TableCell className="py-4 px-6 border-r border-slate-100 text-right">
                                  <span className="font-medium text-slate-900">
                                    Rp {item.budgetSpent.toLocaleString('id-ID')}
                                  </span>
                                </TableCell>
                                <TableCell className="py-4 px-6 border-r border-slate-100 text-center">
                                  <div className="font-medium text-blue-600 bg-blue-50 rounded-full px-3 py-1 inline-block">
                                    {item.prospek.toLocaleString('id-ID')}
                                  </div>
                                </TableCell>
                                <TableCell className="py-4 px-6 border-r border-slate-100 text-center">
                                  <div className="font-medium text-green-600 bg-green-50 rounded-full px-3 py-1 inline-block">
                                    {item.leads.toLocaleString('id-ID')}
                                  </div>
                                </TableCell>
                                <TableCell className="py-4 px-6 border-r border-slate-100 text-center">
                                  <div className="flex items-center justify-center gap-2">
                                    <Users className="h-4 w-4 text-blue-500" />
                                    <div className="font-medium text-blue-600 bg-blue-50 rounded-full px-3 py-1 inline-block">
                                      {item.customer ? item.customer.toLocaleString('id-ID') : '-'}
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell className="py-4 px-6 border-r border-slate-100 text-right">
                                  <span className="font-medium text-slate-900">
                                    Rp {item.costPerLead.toLocaleString('id-ID', { maximumFractionDigits: 0 })}
                                  </span>
                                </TableCell>
                                <TableCell className="py-4 px-6 border-r border-slate-100 text-right">
                                  <div className="font-medium text-green-600">
                                    {item.totalNilaiLangganan ? formatCurrency(item.totalNilaiLangganan) : '-'}
                                  </div>
                                  <div className="text-xs text-slate-500">total nilai</div>
                                </TableCell>
                                <TableCell className="py-4 px-6 border-r border-slate-100 text-center">
                                  <div className="flex items-center justify-center gap-2">
                                    <div className="w-16 h-2 bg-slate-200 rounded-full">
                                      <div 
                                        className="h-2 bg-purple-500 rounded-full transition-all duration-300"
                                        style={{width: `${Math.min(item.ctrLeads * 3.3, 100)}%`}}
                                      ></div>
                                    </div>
                                    <span className="text-sm font-bold text-purple-600">{item.ctrLeads.toFixed(1)}%</span>
                                  </div>
                                </TableCell>
                                <TableCell className="py-4 px-6 text-center">
                                  <div className="flex items-center justify-center gap-2">
                                    <div className="w-16 h-2 bg-slate-200 rounded-full">
                                      <div 
                                        className="h-2 bg-green-500 rounded-full transition-all duration-300"
                                        style={{width: `${Math.min(((item.customer || 0) / (item.leads || 1)) * 100 * 2, 100)}%`}}
                                      ></div>
                                    </div>
                                    <span className="text-sm font-bold text-green-600">
                                      {item.leads > 0 ? (((item.customer || 0) / item.leads) * 100).toFixed(1) : '0.0'}%
                                    </span>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                            
                            {/* Rekap Row */}
                            <TableRow className="bg-gradient-to-r from-indigo-50 to-purple-50 border-t-2 border-indigo-200 font-bold">
                              <TableCell className="py-6 px-6 border-r border-indigo-200">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                                    ∑
                                  </div>
                                  <div className="text-lg font-bold text-indigo-900">REKAP TOTAL</div>
                                </div>
                              </TableCell>
                              <TableCell className="py-6 px-6 border-r border-indigo-200 text-right">
                                <span className="text-lg font-bold text-indigo-900">
                                  Rp {totals.budgetSpent.toLocaleString('id-ID')}
                                </span>
                              </TableCell>
                              <TableCell className="py-6 px-6 border-r border-indigo-200 text-center">
                                <div className="text-lg font-bold text-blue-700 bg-blue-100 rounded-full px-4 py-2 inline-block">
                                  {totals.prospek.toLocaleString('id-ID')}
                                </div>
                              </TableCell>
                              <TableCell className="py-6 px-6 border-r border-indigo-200 text-center">
                                <div className="text-lg font-bold text-green-700 bg-green-100 rounded-full px-4 py-2 inline-block">
                                  {totals.leads.toLocaleString('id-ID')}
                                </div>
                              </TableCell>
                              <TableCell className="py-6 px-6 border-r border-indigo-200 text-center">
                                <div className="flex items-center justify-center gap-2">
                                  <Users className="h-5 w-5 text-blue-600" />
                                  <div className="text-lg font-bold text-blue-700 bg-blue-100 rounded-full px-4 py-2 inline-block">
                                    {totals.customer.toLocaleString('id-ID')}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="py-6 px-6 border-r border-indigo-200 text-right">
                                <span className="text-lg font-bold text-indigo-900">
                                  Rp {totals.costPerLead.toLocaleString('id-ID', { maximumFractionDigits: 0 })}
                                </span>
                              </TableCell>
                              <TableCell className="py-6 px-6 border-r border-indigo-200 text-right">
                                <div className="text-lg font-bold text-green-700">
                                  {formatCurrency(totals.totalNilaiLangganan)}
                                </div>
                                <div className="text-xs text-slate-600 font-medium">total nilai</div>
                              </TableCell>
                              <TableCell className="py-6 px-6 border-r border-indigo-200 text-center">
                                <div className="flex items-center justify-center gap-2">
                                  <div className="w-20 h-3 bg-slate-300 rounded-full">
                                    <div 
                                      className="h-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-300"
                                      style={{width: `${Math.min(totals.ctrLeads * 3.3, 100)}%`}}
                                    ></div>
                                  </div>
                                  <span className="text-lg font-bold text-purple-700">{totals.ctrLeads.toFixed(1)}%</span>
                                </div>
                              </TableCell>
                              <TableCell className="py-6 px-6 text-center">
                                <div className="flex items-center justify-center gap-2">
                                  <div className="w-20 h-3 bg-slate-300 rounded-full">
                                    <div 
                                      className="h-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-300"
                                      style={{width: `${Math.min(((totals.customer || 0) / (totals.leads || 1)) * 100 * 2, 100)}%`}}
                                    ></div>
                                  </div>
                                  <span className="text-lg font-bold text-green-700">
                                    {totals.leads > 0 ? (((totals.customer || 0) / totals.leads) * 100).toFixed(1) : '0.0'}%
                                  </span>
                                </div>
                              </TableCell>
                            </TableRow>
                          </>
                        )
                      })()}
                    </TableBody>
                  </Table>
                </div>

                {/* Table Footer */}
                <div className="bg-slate-50 border-t border-slate-200 px-6 py-4">
                  <div className="flex items-center justify-between text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>
                        Data period: {(() => {
                          const availableMonths = getAvailableMonthsInYear(selectedYear)
                          if (availableMonths.length > 0) {
                            const firstMonth = availableMonths[0]
                            const lastMonth = availableMonths[availableMonths.length - 1]
                            return `${firstMonth} ${selectedYear} - ${lastMonth} ${selectedYear}`
                          }
                          return `Tahun ${selectedYear}`
                        })()}
                      </span>
                    </div>
                    <div className="text-slate-500">
                      Terakhir diperbarui: {new Date().toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "long", 
                        year: "numeric"
                      })}
                    </div>
                  </div>
                </div>
              </Card>

              {/* Key Insights */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Best Month Performance */}
                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-800">
                      <TrendingUp className="h-5 w-5" />
                      Performa Terbaik
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      const filteredData = getFilteredMonthlyData()
                      if (filteredData.length === 0) {
                        return <p className="text-sm text-slate-500">Tidak ada data</p>
                      }
                      const bestMonth = filteredData.reduce((best, current) => 
                        current.ctrLeads > best.ctrLeads ? current : best
                      )
                      return (
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm text-green-600 mb-1">Bulan Terbaik</p>
                            <p className="font-bold text-green-900">{bestMonth.month}</p>
                          </div>
                          <div>
                            <p className="text-sm text-green-600 mb-1">CTR Leads</p>
                            <p className="text-2xl font-bold text-green-900">{bestMonth.ctrLeads.toFixed(1)}%</p>
                          </div>
                          <div>
                            <p className="text-sm text-green-600 mb-1">Total Leads</p>
                            <p className="text-lg font-bold text-green-900">{bestMonth.leads.toLocaleString('id-ID')}</p>
                          </div>
                        </div>
                      )
                    })()}
                  </CardContent>
                </Card>

                {/* Budget Efficiency */}
                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-blue-800">
                      <DollarSign className="h-5 w-5" />
                      Efisiensi Budget
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      const filteredData = getFilteredMonthlyData()
                      if (filteredData.length === 0) {
                        return <p className="text-sm text-slate-500">Tidak ada data</p>
                      }
                      const mostEfficient = filteredData.reduce((best, current) => 
                        current.costPerLead < best.costPerLead ? current : best
                      )
                      return (
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm text-blue-600 mb-1">Paling Efisien</p>
                            <p className="font-bold text-blue-900">{mostEfficient.month}</p>
                          </div>
                          <div>
                            <p className="text-sm text-blue-600 mb-1">Cost Per Lead</p>
                            <p className="text-xl font-bold text-blue-900">
                              Rp {mostEfficient.costPerLead.toLocaleString('id-ID', { maximumFractionDigits: 0 })}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-blue-600 mb-1">Budget Spent</p>
                            <p className="text-lg font-bold text-blue-900">
                              Rp {mostEfficient.budgetSpent.toLocaleString('id-ID')}
                            </p>
                          </div>
                        </div>
                      )
                    })()}
                  </CardContent>
                </Card>

                {/* Total Summary */}
                <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-purple-800">
                      <BarChart3 className="h-5 w-5" />
                      Ringkasan Total
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      const filteredData = getFilteredMonthlyData()
                      const totals = calculateMonthlyTotals(filteredData)
                      if (filteredData.length === 0) {
                        return <p className="text-sm text-slate-500">Tidak ada data</p>
                      }
                      totals.avgCostPerLead = totals.leads > 0 ? totals.budgetSpent / totals.leads : 0
                      totals.avgCTRLeads = totals.prospek > 0 ? (totals.leads / totals.prospek) * 100 : 0
                      return (
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm text-purple-600 mb-1">Total Budget Spent</p>
                            <p className="text-lg font-bold text-purple-900">
                              Rp {totals.budgetSpent.toLocaleString('id-ID')}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-purple-600 mb-1">Total Leads</p>
                            <p className="text-xl font-bold text-purple-900">{totals.leads.toLocaleString('id-ID')}</p>
                          </div>
                          <div>
                            <p className="text-sm text-purple-600 mb-1">Total Customer</p>
                            <p className="text-lg font-bold text-blue-900">{totals.customer.toLocaleString('id-ID')}</p>
                          </div>
                          <div>
                            <p className="text-sm text-purple-600 mb-1">Total Nilai Langganan</p>
                            <p className="text-lg font-bold text-green-900">{formatCurrency(totals.totalNilaiLangganan)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-purple-600 mb-1">Rata-rata CTR</p>
                            <p className="text-lg font-bold text-purple-900">{totals.avgCTRLeads.toFixed(1)}%</p>
                          </div>
                        </div>
                      )
                    })()}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        </>
      )}
    </div>
  )
}
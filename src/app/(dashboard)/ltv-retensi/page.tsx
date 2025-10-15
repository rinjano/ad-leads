'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Calendar,
  Filter,
  Download,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  RefreshCw,
  Package,
  Target,
  BarChart3,
  Search,
  X,
  Eye,
  FileText
} from 'lucide-react'

// Interface untuk data LTV & Retensi
interface CustomerLTVData {
  id: string
  name: string
  email: string
  phone: string
  subscriptions: SubscriptionData[]
  totalLTV: number
  totalDuration: number
  renewalCount: number
  firstSubscriptionDate: string
  lastSubscriptionDate: string
  overallStatus: 'active' | 'expired' | 'mixed'
}

interface SubscriptionData {
  id: string
  serviceId: string
  serviceName: string
  productId: string
  productName: string
  transactionValue: number
  subscriptionDuration: number
  durationType: 'months' | 'years'
  conversionDate: string
  startDate: string
  endDate: string
  status: 'active' | 'expired'
  isRenewal: boolean
  originalSubscriptionId?: string
}

// Data dummy customer dengan subscription lengkap (dari halaman data-prospek)
const dummyCustomerLTVData: CustomerLTVData[] = [
  {
    id: '1',
    name: 'PT Teknologi Maju',
    email: 'admin@teknologimaju.com',
    phone: '021-1234567',
    totalLTV: 15000000,
    totalDuration: 30,
    renewalCount: 2,
    firstSubscriptionDate: '2024-01-15',
    lastSubscriptionDate: '2025-01-15',
    overallStatus: 'active',
    subscriptions: [
      {
        id: 'sub-1-1',
        serviceId: '1',
        serviceName: 'Digital Marketing',
        productId: '1',
        productName: 'SEO Premium',
        transactionValue: 5000000,
        subscriptionDuration: 12,
        durationType: 'months',
        conversionDate: '2024-01-15',
        startDate: '2024-01-15',
        endDate: '2025-01-15',
        status: 'active',
        isRenewal: false
      },
      {
        id: 'sub-1-2',
        serviceId: '2',
        serviceName: 'Web Development',
        productId: '3',
        productName: 'Website Corporate',
        transactionValue: 8000000,
        subscriptionDuration: 6,
        durationType: 'months',
        conversionDate: '2024-03-20',
        startDate: '2024-03-20',
        endDate: '2024-09-20',
        status: 'expired',
        isRenewal: false
      },
      {
        id: 'sub-1-3',
        serviceId: '2',
        serviceName: 'Web Development',
        productId: '3',
        productName: 'Website Corporate',
        transactionValue: 2000000,
        subscriptionDuration: 6,
        durationType: 'months',
        conversionDate: '2024-09-25',
        startDate: '2024-09-25',
        endDate: '2025-03-25',
        status: 'active',
        isRenewal: true,
        originalSubscriptionId: 'sub-1-2'
      }
    ]
  },
  {
    id: '2',
    name: 'CV Digital Sukses',
    email: 'info@digitalsukses.co.id',
    phone: '021-9876543',
    totalLTV: 7500000,
    totalDuration: 18,
    renewalCount: 1,
    firstSubscriptionDate: '2024-02-10',
    lastSubscriptionDate: '2024-08-10',
    overallStatus: 'expired',
    subscriptions: [
      {
        id: 'sub-2-1',
        serviceId: '1',
        serviceName: 'Digital Marketing',
        productId: '2',
        productName: 'Social Media Management',
        transactionValue: 3000000,
        subscriptionDuration: 6,
        durationType: 'months',
        conversionDate: '2024-02-10',
        startDate: '2024-02-10',
        endDate: '2024-08-10',
        status: 'expired',
        isRenewal: false
      },
      {
        id: 'sub-2-2',
        serviceId: '3',
        serviceName: 'Sistem Informasi',
        productId: '5',
        productName: 'ERP Basic',
        transactionValue: 4500000,
        subscriptionDuration: 12,
        durationType: 'months',
        conversionDate: '2024-04-15',
        startDate: '2024-04-15',
        endDate: '2025-04-15',
        status: 'active',
        isRenewal: false
      }
    ]
  },
  {
    id: '3',
    name: 'Startup Inovasi',
    email: 'hello@startupinovasi.id',
    phone: '021-5551234',
    totalLTV: 12000000,
    totalDuration: 24,
    renewalCount: 3,
    firstSubscriptionDate: '2023-12-01',
    lastSubscriptionDate: '2024-12-01',
    overallStatus: 'active',
    subscriptions: [
      {
        id: 'sub-3-1',
        serviceId: '1',
        serviceName: 'Digital Marketing',
        productId: '1',
        productName: 'SEO Premium',
        transactionValue: 3000000,
        subscriptionDuration: 6,
        durationType: 'months',
        conversionDate: '2023-12-01',
        startDate: '2023-12-01',
        endDate: '2024-06-01',
        status: 'expired',
        isRenewal: false
      },
      {
        id: 'sub-3-2',
        serviceId: '1',
        serviceName: 'Digital Marketing',
        productId: '1',
        productName: 'SEO Premium',
        transactionValue: 3000000,
        subscriptionDuration: 6,
        durationType: 'months',
        conversionDate: '2024-06-05',
        startDate: '2024-06-05',
        endDate: '2024-12-05',
        status: 'expired',
        isRenewal: true,
        originalSubscriptionId: 'sub-3-1'
      },
      {
        id: 'sub-3-3',
        serviceId: '1',
        serviceName: 'Digital Marketing',
        productId: '1',
        productName: 'SEO Premium',
        transactionValue: 3500000,
        subscriptionDuration: 12,
        durationType: 'months',
        conversionDate: '2024-12-01',
        startDate: '2024-12-01',
        endDate: '2025-12-01',
        status: 'active',
        isRenewal: true,
        originalSubscriptionId: 'sub-3-2'
      },
      {
        id: 'sub-3-4',
        serviceId: '2',
        serviceName: 'Web Development',
        productId: '4',
        productName: 'Landing Page',
        transactionValue: 2500000,
        subscriptionDuration: 6,
        durationType: 'months',
        conversionDate: '2024-08-15',
        startDate: '2024-08-15',
        endDate: '2025-02-15',
        status: 'active',
        isRenewal: false
      }
    ]
  }
]

// Master data untuk filter
const masterServices = [
  { id: '1', name: 'Digital Marketing' },
  { id: '2', name: 'Web Development' },
  { id: '3', name: 'Sistem Informasi' }
]

const masterProducts = [
  { id: '1', name: 'SEO Premium', serviceId: '1' },
  { id: '2', name: 'Social Media Management', serviceId: '1' },
  { id: '3', name: 'Website Corporate', serviceId: '2' },
  { id: '4', name: 'Landing Page', serviceId: '2' },
  { id: '5', name: 'ERP Basic', serviceId: '3' }
]

export default function LTVRetensiPage() {
  const [customerData, setCustomerData] = useState<CustomerLTVData[]>(dummyCustomerLTVData)
  const [filteredData, setFilteredData] = useState<CustomerLTVData[]>(dummyCustomerLTVData)
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  
  // Search and pagination states
  const [searchTerm, setSearchTerm] = useState('')
  const [itemsPerPage, setItemsPerPage] = useState('25')
  const [currentPage, setCurrentPage] = useState(1)
  
  // Filter panel state
  const [showFilterPanel, setShowFilterPanel] = useState(false)
  
  // Filter states
  const [filters, setFilters] = useState({
    period: 'all',
    service: 'all', 
    product: 'all',
    status: 'all'
  })
  
  const [appliedFilters, setAppliedFilters] = useState({
    period: 'all',
    service: 'all',
    product: 'all', 
    status: 'all'
  })

  // Helper functions
  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  const getStatusBadge = (status: 'active' | 'expired' | 'mixed') => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Aktif</Badge>
      case 'expired':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Expired</Badge>
      case 'mixed':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Mixed</Badge>
      default:
        return <Badge variant="secondary">-</Badge>
    }
  }

  const toggleRowExpansion = (customerId: string) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(customerId)) {
      newExpanded.delete(customerId)
    } else {
      newExpanded.add(customerId)
    }
    setExpandedRows(newExpanded)
  }

  // Filter functions
  const applyFilters = () => {
    setAppliedFilters({ ...filters })
    setShowFilterPanel(false)
    setCurrentPage(1)
  }

  const resetFilters = () => {
    const resetState = {
      period: 'all',
      service: 'all', 
      product: 'all',
      status: 'all'
    }
    setFilters(resetState)
    setAppliedFilters(resetState)
    setCurrentPage(1)
  }

  const closeFilterPanel = () => {
    setShowFilterPanel(false)
    // Reset filter state to applied filters when closing without applying
    setFilters({ ...appliedFilters })
  }

  // Check for active filters and unsaved changes
  const hasActiveFilters = Object.values(appliedFilters).some(value => value !== "" && value !== "all")
  const hasUnsavedChanges = JSON.stringify(filters) !== JSON.stringify(appliedFilters)

  // Filter and paginate data
  useEffect(() => {
    let filtered = customerData

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(customer =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone.includes(searchTerm)
      )
    }

    // Status filter
    if (appliedFilters.status !== 'all') {
      filtered = filtered.filter(customer => customer.overallStatus === appliedFilters.status)
    }

    // Service filter
    if (appliedFilters.service !== 'all') {
      filtered = filtered.filter(customer =>
        customer.subscriptions.some(sub => sub.serviceId === appliedFilters.service)
      )
    }

    // Product filter
    if (appliedFilters.product !== 'all') {
      filtered = filtered.filter(customer =>
        customer.subscriptions.some(sub => sub.productId === appliedFilters.product)
      )
    }

    // Period filter
    if (appliedFilters.period !== 'all') {
      const now = new Date()
      const filterDate = new Date()
      
      switch (appliedFilters.period) {
        case '7days':
          filterDate.setDate(now.getDate() - 7)
          break
        case '30days':
          filterDate.setDate(now.getDate() - 30)
          break
        case '90days':
          filterDate.setDate(now.getDate() - 90)
          break
        case '1year':
          filterDate.setFullYear(now.getFullYear() - 1)
          break
      }
      
      if (appliedFilters.period !== 'all') {
        filtered = filtered.filter(customer =>
          new Date(customer.lastSubscriptionDate) >= filterDate
        )
      }
    }

    setFilteredData(filtered)
  }, [customerData, searchTerm, appliedFilters])

  // Calculate summary stats
  const totalCustomers = filteredData.length
  const totalLTV = filteredData.reduce((sum, customer) => sum + customer.totalLTV, 0)
  const averageLTV = totalCustomers > 0 ? totalLTV / totalCustomers : 0
  const activeCustomers = filteredData.filter(c => c.overallStatus === 'active').length

  // Pagination
  const totalPages = Math.ceil(filteredData.length / parseInt(itemsPerPage))
  const startIndex = (currentPage - 1) * parseInt(itemsPerPage)
  const endIndex = startIndex + parseInt(itemsPerPage)
  const paginatedData = filteredData.slice(startIndex, endIndex)

  // Reset to first page when search or filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, itemsPerPage, appliedFilters])

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-blue-100">
        <CardHeader>
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-slate-900">LTV & Retensi Customer</CardTitle>
              <CardDescription className="text-slate-600">
                Analisis nilai customer dan tingkat retensi pelanggan
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Content */}
      <div className="w-full">

        {/* Search and Filter Controls */}
        <Card className="border-0 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              {/* Left group: Items per page + Search + Filter */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 flex-1">
                {/* Items per page */}
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-sm text-slate-600 whitespace-nowrap">Tampilkan:</span>
                  <Select value={itemsPerPage} onValueChange={setItemsPerPage}>
                    <SelectTrigger className="w-20 h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                  <span className="text-sm text-slate-600 whitespace-nowrap">baris</span>
                </div>

                {/* Search and Filter Group */}
                <div className="flex items-center gap-3 flex-1 max-w-lg">
                  {/* Search */}
                  <div className="relative flex-1 min-w-0">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                    <Input
                      placeholder="Cari customer, email, telepon..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-slate-50 border-slate-200 h-10 w-full focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  {/* Filter Button */}
                  <Button 
                    variant="outline"
                    onClick={() => setShowFilterPanel(!showFilterPanel)}
                    className={`h-10 px-4 whitespace-nowrap shrink-0 transition-all duration-200 ${
                      hasActiveFilters 
                        ? 'border-blue-500 text-blue-600 bg-blue-50 shadow-md' 
                        : 'border-slate-300 hover:border-blue-400 hover:bg-blue-50'
                    }`}
                  >
                    <Filter className="mr-2 h-4 w-4" />
                    Filter
                    {hasActiveFilters && (
                      <span className="ml-2 bg-blue-600 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center animate-pulse">
                        {Object.values(appliedFilters).filter(v => v !== "" && v !== "all").length}
                      </span>
                    )}
                  </Button>
                </div>
              </div>

              {/* Right group: Export button */}
              <div className="flex items-center gap-3">
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 flex items-center gap-2 h-10">
                  <Download className="h-4 w-4" />
                  Export Data
                </Button>
              </div>
            </div>

            {/* Filter Panel */}
            {showFilterPanel && (
              <div className="filter-panel mt-4 p-6 bg-slate-50 border border-slate-200 rounded-xl shadow-lg">
                <div className="space-y-6">
                  {/* Filter Header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">Filter Data LTV & Retensi</h3>
                      <p className="text-sm text-slate-600 mt-1">
                        {hasUnsavedChanges ? 
                          '⚠️ Ada perubahan yang belum diterapkan' : 
                          'Sesuaikan filter sesuai kebutuhan Anda'}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={closeFilterPanel}
                      className="h-8 w-8 p-0 hover:bg-slate-200 rounded-full"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Filter Options */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Period Filter */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Periode
                      </label>
                      <Select value={filters.period} onValueChange={(value) => setFilters(prev => ({...prev, period: value}))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Semua Periode</SelectItem>
                          <SelectItem value="7days">7 Hari Terakhir</SelectItem>
                          <SelectItem value="30days">30 Hari Terakhir</SelectItem>
                          <SelectItem value="90days">90 Hari Terakhir</SelectItem>
                          <SelectItem value="1year">1 Tahun Terakhir</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Service Filter */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Layanan
                      </label>
                      <Select value={filters.service} onValueChange={(value) => setFilters(prev => ({...prev, service: value}))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Semua Layanan</SelectItem>
                          {masterServices.map((service) => (
                            <SelectItem key={service.id} value={service.id}>
                              {service.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Product Filter */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Produk
                      </label>
                      <Select value={filters.product} onValueChange={(value) => setFilters(prev => ({...prev, product: value}))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Semua Produk</SelectItem>
                          {masterProducts.map((product) => (
                            <SelectItem key={product.id} value={product.id}>
                              {product.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Status Filter */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Status Langganan
                      </label>
                      <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({...prev, status: value}))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Semua Status</SelectItem>
                          <SelectItem value="active">Aktif</SelectItem>
                          <SelectItem value="expired">Expired</SelectItem>
                          <SelectItem value="mixed">Mixed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Filter Actions */}
                  <div className="flex items-center gap-3 pt-4 border-t border-slate-200">
                    <Button 
                      onClick={applyFilters}
                      className={`transition-all duration-200 ${
                        hasUnsavedChanges 
                          ? 'bg-blue-600 hover:bg-blue-700 shadow-md' 
                          : 'bg-slate-400 cursor-not-allowed'
                      }`}
                      disabled={!hasUnsavedChanges}
                    >
                      <Filter className="mr-2 h-4 w-4" />
                      Terapkan Filter
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      onClick={resetFilters}
                      className="hover:bg-red-50 hover:border-red-300 hover:text-red-600"
                    >
                      Reset Filter
                    </Button>
                    
                    <div className="flex-1" />
                    
                    <Button 
                      variant="ghost" 
                      onClick={closeFilterPanel}
                      className="hover:bg-slate-100"
                    >
                      Tutup
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Summary Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5" />
                Total Customer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalCustomers}</div>
              <p className="text-blue-100 text-sm mt-1">Customer terdaftar</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="h-5 w-5" />
                Customer Aktif
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{activeCustomers}</div>
              <p className="text-green-100 text-sm mt-1">Masih berlangganan</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Total LTV
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatRupiah(totalLTV)}</div>
              <p className="text-purple-100 text-sm mt-1">Nilai keseluruhan</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Rata-rata LTV
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatRupiah(averageLTV)}</div>
              <p className="text-orange-100 text-sm mt-1">Per customer</p>
            </CardContent>
          </Card>
        </div>

        {/* Data Table */}
        <Card className="border-0 shadow-lg mt-6">
          <div className="p-6 pb-0">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  Data LTV & Retensi Customer
                </h2>
                <p className="text-sm text-slate-600">Kelola dan analisis nilai customer serta tingkat retensi pelanggan</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-sm text-slate-500">
                  Total: <span className="font-medium text-slate-900">{filteredData.length}</span> customer
                </div>
              </div>
            </div>
          </div>

          {/* Table Content */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200 hover:bg-gradient-to-r hover:from-slate-50 hover:to-slate-100">
                  <TableHead className="py-4 px-6 text-left font-semibold text-slate-700 border-r border-slate-200 last:border-r-0 w-12">
                    <div className="flex items-center justify-center">
                      <span></span>
                    </div>
                  </TableHead>
                  <TableHead className="py-4 px-6 text-left font-semibold text-slate-700 border-r border-slate-200 last:border-r-0">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-slate-500" />
                      <span>Customer</span>
                    </div>
                  </TableHead>
                  <TableHead className="py-4 px-6 text-left font-semibold text-slate-700 border-r border-slate-200 last:border-r-0">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-slate-500" />
                      <span>Layanan Aktif</span>
                    </div>
                  </TableHead>
                  <TableHead className="py-4 px-6 text-left font-semibold text-slate-700 border-r border-slate-200 last:border-r-0">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-slate-500" />
                      <span>Total LTV</span>
                    </div>
                  </TableHead>
                  <TableHead className="py-4 px-6 text-left font-semibold text-slate-700 border-r border-slate-200 last:border-r-0">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-slate-500" />
                      <span>Total Durasi</span>
                    </div>
                  </TableHead>
                  <TableHead className="py-4 px-6 text-left font-semibold text-slate-700 border-r border-slate-200 last:border-r-0">
                    <div className="flex items-center gap-2">
                      <RefreshCw className="h-4 w-4 text-slate-500" />
                      <span>Perpanjangan</span>
                    </div>
                  </TableHead>
                  <TableHead className="py-4 px-6 text-left font-semibold text-slate-700 border-r border-slate-200 last:border-r-0">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-slate-500" />
                      <span>Status</span>
                    </div>
                  </TableHead>
                  <TableHead className="py-4 px-6 text-left font-semibold text-slate-700 border-r border-slate-200 last:border-r-0">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-slate-500" />
                      <span>Periode Terakhir</span>
                    </div>
                  </TableHead>
                  <TableHead className="py-4 px-6 text-center font-semibold text-slate-700">
                    <div className="flex items-center justify-center gap-2">
                      <span>Aksi</span>
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.length > 0 ? (
                  paginatedData.map((customer, index) => (
                    <>
                      {/* Main Row */}
                      <TableRow key={customer.id} className="transition-all duration-200 hover:bg-slate-50 border-b border-slate-100 last:border-b-0">
                        <TableCell className="py-4 px-6 border-r border-slate-100 last:border-r-0">
                          <div 
                            onClick={() => toggleRowExpansion(customer.id)}
                            className="flex items-center justify-center cursor-pointer hover:bg-slate-100 rounded p-1"
                          >
                            {expandedRows.has(customer.id) ? (
                              <ChevronDown className="h-4 w-4 text-slate-500" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-slate-500" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="py-4 px-6 border-r border-slate-100 last:border-r-0">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                              {customer.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-semibold text-slate-900">{customer.name}</div>
                              <div className="text-sm text-slate-500">{customer.email}</div>
                              <div className="text-xs text-slate-500">{customer.phone}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-4 px-6 border-r border-slate-100 last:border-r-0">
                          <div className="space-y-1">
                            {customer.subscriptions
                              .filter(sub => sub.status === 'active')
                              .slice(0, 2)
                              .map((sub) => (
                                <Badge 
                                  key={sub.id}
                                  variant="secondary" 
                                  className="text-xs rounded-full bg-blue-50 text-blue-700 border-blue-200 font-medium px-3 py-1 mr-1 mb-1"
                                >
                                  {sub.serviceName} - {sub.productName}
                                </Badge>
                              ))}
                            {customer.subscriptions.filter(sub => sub.status === 'active').length > 2 && (
                              <div className="text-xs text-slate-500 mt-1">
                                +{customer.subscriptions.filter(sub => sub.status === 'active').length - 2} layanan lainnya
                              </div>
                            )}
                            {customer.subscriptions.filter(sub => sub.status === 'active').length === 0 && (
                              <Badge variant="outline" className="text-xs rounded-full border-slate-300 bg-slate-50 text-slate-700 font-medium px-3 py-1">
                                Tidak ada layanan aktif
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="py-4 px-6 border-r border-slate-100 last:border-r-0">
                          <div className="font-bold text-lg text-slate-900">
                            {formatRupiah(customer.totalLTV)}
                          </div>
                        </TableCell>
                        <TableCell className="py-4 px-6 border-r border-slate-100 last:border-r-0">
                          <div className="text-slate-700 font-medium">
                            {customer.totalDuration} bulan
                          </div>
                        </TableCell>
                        <TableCell className="py-4 px-6 border-r border-slate-100 last:border-r-0">
                          <div className="flex items-center gap-2">
                            <RefreshCw className="h-4 w-4 text-blue-600" />
                            <span className="font-medium text-slate-900">{customer.renewalCount}x</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-4 px-6 border-r border-slate-100 last:border-r-0">
                          {getStatusBadge(customer.overallStatus)}
                        </TableCell>
                        <TableCell className="py-4 px-6 border-r border-slate-100 last:border-r-0">
                          <div>
                            <div className="text-sm font-medium text-slate-900">
                              {formatDate(customer.firstSubscriptionDate)}
                            </div>
                            <div className="text-xs text-slate-500">
                              s/d {formatDate(customer.lastSubscriptionDate)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-4 px-6">
                          <div className="flex items-center justify-center gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => toggleRowExpansion(customer.id)}
                              className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600 rounded-lg"
                              title="Lihat Detail Riwayat"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>

                      {/* Expanded Row - Subscription History */}
                      {expandedRows.has(customer.id) && (
                        <TableRow>
                          <TableCell colSpan={9} className="bg-slate-50 p-6">
                            <div className="space-y-4">
                              <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                Riwayat Langganan & Transaksi
                              </h4>
                              
                              <div className="grid gap-3">
                                {customer.subscriptions
                                  .sort((a, b) => new Date(b.conversionDate).getTime() - new Date(a.conversionDate).getTime())
                                  .map((subscription) => (
                                    <div
                                      key={subscription.id}
                                      className="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-sm transition-shadow"
                                    >
                                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <div>
                                          <div className="text-sm font-medium text-slate-900">
                                            {subscription.serviceName}
                                          </div>
                                          <div className="text-sm text-slate-600">
                                            {subscription.productName}
                                          </div>
                                          {subscription.isRenewal && (
                                            <Badge variant="secondary" className="mt-1 text-xs bg-orange-50 text-orange-700 border-orange-200">
                                              Perpanjangan
                                            </Badge>
                                          )}
                                        </div>
                                        
                                        <div>
                                          <div className="text-sm font-semibold text-slate-900">
                                            {formatRupiah(subscription.transactionValue)}
                                          </div>
                                          <div className="text-xs text-slate-600">
                                            {subscription.subscriptionDuration} {subscription.durationType === 'months' ? 'bulan' : 'tahun'}
                                          </div>
                                        </div>
                                        
                                        <div>
                                          <div className="text-sm text-slate-900">
                                            {formatDate(subscription.startDate)}
                                          </div>
                                          <div className="text-xs text-slate-600">
                                            s/d {formatDate(subscription.endDate)}
                                          </div>
                                        </div>
                                        
                                        <div className="flex justify-end items-center">
                                          {subscription.status === 'active' ? (
                                            <Badge className="bg-green-100 text-green-800 border-green-200">
                                              Aktif
                                            </Badge>
                                          ) : (
                                            <Badge className="bg-red-100 text-red-800 border-red-200">
                                              Expired
                                            </Badge>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                          <Users className="h-8 w-8 text-slate-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-slate-900 mb-1">Tidak ada data customer</h3>
                          <p className="text-slate-500 mb-4">Data tidak ditemukan atau belum ada customer yang sesuai dengan filter</p>
                          <Button
                            variant="outline"
                            onClick={resetFilters}
                            className="hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600"
                          >
                            Reset Filter
                          </Button>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {filteredData.length > 0 && (
            <div className="flex flex-col lg:flex-row justify-between items-center py-6 px-6 bg-slate-50 border-t border-slate-200 gap-4">
              <div className="text-sm text-slate-600 order-2 lg:order-1">
                Menampilkan <span className="font-medium">{startIndex + 1}</span> hingga <span className="font-medium">{Math.min(endIndex, filteredData.length)}</span> dari <span className="font-medium">{filteredData.length}</span> data
              </div>
              
              <div className="flex items-center gap-2 order-1 lg:order-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center px-3 py-2 h-9 text-sm disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Sebelumnya
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let page;
                    if (totalPages <= 5) {
                      page = i + 1;
                    } else if (currentPage <= 3) {
                      page = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      page = totalPages - 4 + i;
                    } else {
                      page = currentPage - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className={`w-9 h-9 rounded-full text-sm font-medium ${
                          currentPage === page 
                            ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white border-blue-600 hover:from-blue-700 hover:to-blue-600' 
                            : 'hover:bg-slate-100'
                        }`}
                      >
                        {page}
                      </Button>
                    );
                  })}
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="flex items-center px-3 py-2 h-9 text-sm disabled:opacity-50"
                >
                  Selanjutnya
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
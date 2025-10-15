'use client'

import React, { useState, useEffect } from 'react'
import { 
  Send, 
  Phone, 
  Mail, 
  MessageSquare,
  Calendar, 
  Filter,
  Search,
  Plus,
  MoreHorizontal,
  UserCheck,
  Clock,
  Eye,
  Edit3,
  Download,
  RefreshCw,
  Target,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Building2,
  MapPin,
  User,
  Package,
  Bell,
  History,
  X,
  Save,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Upload,
  FileSpreadsheet,
  Trash2,
  ExternalLink,
  CheckSquare
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

// Outbound Lead Interface sesuai spesifikasi
interface OutboundLead {
  id: number
  tanggalHubungiPertama: string
  namaFaskes: string
  noKontakFaskes: string
  kotaKabupaten: string
  statusKontakAwal: 'sedang-dihubungi' | 'berhasil-dihubungi' | 'no-respon' | 'nomor-salah'
  hasilKontakAwal?: 'no-respon' | 'menolak' | 'sudah-pakai-assist' | 'sudah-pakai-rme-lain' | 'nomor-diblock' | 'nomor-tidak-aktif'
  riwayatFollowUp: {
    id: number
    tanggal: string
    catatan?: string
  }[]
  hasilAkhir?: 'leads' | 'tidak-tertarik'
  rmeYangDigunakan: string
  // Fields khusus jika Hasil Akhir = Leads
  varianProduk?: string
  namaPIC?: string
  posisiPIC?: string
  noWhatsAppPIC?: string
  catatan?: string
  // Additional fields
  createdAt: string
  updatedAt: string
  createdBy: string
}

// Data Master
const statusKontakAwalOptions = [
  { value: 'sedang-dihubungi', label: 'Sedang dihubungi' },
  { value: 'berhasil-dihubungi', label: 'Berhasil dihubungi' },
  { value: 'no-respon', label: 'No Respon' },
  { value: 'nomor-salah', label: 'Nomor Salah' }
]

const hasilKontakAwalOptions = [
  { value: 'no-respon', label: 'No Respon' },
  { value: 'menolak', label: 'Menolak' },
  { value: 'sudah-pakai-assist', label: 'Sudah pakai Assist' },
  { value: 'sudah-pakai-rme-lain', label: 'Sudah Pakai RME Lain' },
  { value: 'nomor-diblock', label: 'Nomor diblock' },
  { value: 'nomor-tidak-aktif', label: 'Nomor tidak Aktif' }
]

const hasilAkhirOptions = [
  { value: 'leads', label: 'Leads' },
  { value: 'tidak-tertarik', label: 'Tidak Tertarik' }
]

const varianProdukOptions = [
  { value: 'assist-basic', label: 'ASSIST Basic' },
  { value: 'assist-premium', label: 'ASSIST Premium' },
  { value: 'assist-enterprise', label: 'ASSIST Enterprise' },
  { value: 'telemedicine-basic', label: 'Telemedicine Basic' },
  { value: 'telemedicine-premium', label: 'Telemedicine Premium' }
]

const kotaKabupatenOptions = [
  'Jakarta', 'Bandung', 'Surabaya', 'Medan', 'Semarang', 'Makassar', 
  'Palembang', 'Yogyakarta', 'Solo', 'Malang', 'Bogor', 'Depok',
  'Tangerang', 'Bekasi', 'Balikpapan', 'Pontianak'
]

export default function OutboundLeadsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [kotaFilter, setKotaFilter] = useState('')
  const [hasilAkhirFilter, setHasilAkhirFilter] = useState('')
  const [varianProdukFilter, setVarianProdukFilter] = useState('')
  const [selectedRows, setSelectedRows] = useState<number[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingLead, setEditingLead] = useState<OutboundLead | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedLead, setSelectedLead] = useState<OutboundLead | null>(null)
  const [showFollowUpModal, setShowFollowUpModal] = useState(false)
  const [followUpLead, setFollowUpLead] = useState<OutboundLead | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  
  // Notification state
  const [notification, setNotification] = useState<{
    show: boolean
    type: 'success' | 'error' | 'info'
    message: string
  }>({
    show: false,
    type: 'success',
    message: ''
  })

  // Form states
  const [formData, setFormData] = useState({
    tanggalHubungiPertama: new Date().toISOString().split('T')[0],
    namaFaskes: '',
    noKontakFaskes: '',
    kotaKabupaten: '',
    statusKontakAwal: '' as OutboundLead['statusKontakAwal'] | '',
    hasilKontakAwal: '' as OutboundLead['hasilKontakAwal'] | '',
    hasilAkhir: '' as OutboundLead['hasilAkhir'] | '',
    rmeYangDigunakan: '',
    varianProduk: '',
    namaPIC: '',
    posisiPIC: '',
    noWhatsAppPIC: '',
    catatan: ''
  })

  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  // Follow-up form
  const [followUpForm, setFollowUpForm] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    catatan: ''
  })

  // Notification helper
  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setNotification({
      show: true,
      type,
      message
    })
    
    // Auto hide after 5 seconds
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }))
    }, 5000)
  }

  const hideNotification = () => {
    setNotification(prev => ({ ...prev, show: false }))
  }

  // Sample data
  const [outboundLeads, setOutboundLeads] = useState<OutboundLead[]>([
    {
      id: 1,
      tanggalHubungiPertama: "2025-01-15",
      namaFaskes: "RS Husada Jakarta",
      noKontakFaskes: "021-5555-0001",
      kotaKabupaten: "Jakarta",
      statusKontakAwal: "berhasil-dihubungi",
      hasilKontakAwal: "sudah-pakai-rme-lain",
      riwayatFollowUp: [
        { id: 1, tanggal: "2025-01-20", catatan: "Tertarik dengan produk A" },
        { id: 2, tanggal: "2025-01-25", catatan: "Meminta presentasi detail" }
      ],
      hasilAkhir: "leads",
      rmeYangDigunakan: "SIMRS Khanza",
      varianProduk: "assist-premium",
      namaPIC: "Dr. Sarah Wijaya",
      posisiPIC: "Direktur IT",
      noWhatsAppPIC: "08123456789",
      catatan: "Faskes ini sangat potensial, butuh follow up intensif",
      createdAt: "2025-01-15T08:00:00Z",
      updatedAt: "2025-01-25T14:30:00Z",
      createdBy: "Admin 1"
    },
    {
      id: 2,
      tanggalHubungiPertama: "2025-01-18",
      namaFaskes: "Klinik Sehat Bandung",
      noKontakFaskes: "022-7777-0002",
      kotaKabupaten: "Bandung",
      statusKontakAwal: "berhasil-dihubungi",
      hasilKontakAwal: "no-respon",
      riwayatFollowUp: [
        { id: 1, tanggal: "2025-01-22", catatan: "Perlu diskusi dengan manajemen" }
      ],
      hasilAkhir: "tidak-tertarik",
      rmeYangDigunakan: "Manual/Paper Based",
      createdAt: "2025-01-18T09:15:00Z",
      updatedAt: "2025-01-22T16:45:00Z",
      createdBy: "Admin 2"
    },
    {
      id: 3,
      tanggalHubungiPertama: "2025-01-20",
      namaFaskes: "RS Prima Surabaya",
      noKontakFaskes: "031-8888-0003",
      kotaKabupaten: "Surabaya",
      statusKontakAwal: "berhasil-dihubungi",
      hasilKontakAwal: "sudah-pakai-assist",
      riwayatFollowUp: [
        { id: 1, tanggal: "2025-01-25", catatan: "Sudah menggunakan ASSIST, tertarik upgrade" }
      ],
      hasilAkhir: "leads",
      rmeYangDigunakan: "ASSIST Basic",
      varianProduk: "assist-enterprise",
      namaPIC: "Dr. Lisa Maharani",
      posisiPIC: "Chief Medical Officer",
      noWhatsAppPIC: "08345678901",
      catatan: "Existing customer, interested in upgrade to premium features",
      createdAt: "2025-01-20T10:30:00Z",
      updatedAt: "2025-01-25T11:20:00Z",
      createdBy: "Sales 2"
    }
  ])

  // Helper functions
  const getStatusBadge = (status: string, type: 'kontakAwal' | 'hasilKontak' | 'hasilAkhir') => {
    const configs = {
      kontakAwal: {
        'sedang-dihubungi': { label: 'Sedang dihubungi', className: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
        'berhasil-dihubungi': { label: 'Berhasil dihubungi', className: 'bg-green-100 text-green-800 border-green-300' },
        'no-respon': { label: 'No Respon', className: 'bg-gray-100 text-gray-800 border-gray-300' },
        'nomor-salah': { label: 'Nomor Salah', className: 'bg-red-100 text-red-800 border-red-300' }
      },
      hasilKontak: {
        'no-respon': { label: 'No Respon', className: 'bg-gray-100 text-gray-800 border-gray-300' },
        'menolak': { label: 'Menolak', className: 'bg-red-100 text-red-800 border-red-300' },
        'sudah-pakai-assist': { label: 'Sudah pakai Assist', className: 'bg-blue-100 text-blue-800 border-blue-300' },
        'sudah-pakai-rme-lain': { label: 'Sudah Pakai RME Lain', className: 'bg-purple-100 text-purple-800 border-purple-300' },
        'nomor-diblock': { label: 'Nomor diblock', className: 'bg-red-100 text-red-800 border-red-300' },
        'nomor-tidak-aktif': { label: 'Nomor tidak Aktif', className: 'bg-gray-100 text-gray-800 border-gray-300' }
      },
      hasilAkhir: {
        'leads': { label: 'Leads', className: 'bg-green-100 text-green-800 border-green-300' },
        'tidak-tertarik': { label: 'Tidak Tertarik', className: 'bg-red-100 text-red-800 border-red-300' }
      }
    }
    
    let config: { label: string; className: string } | undefined
    
    if (type === 'kontakAwal') {
      config = configs.kontakAwal[status as keyof typeof configs.kontakAwal]
    } else if (type === 'hasilKontak') {
      config = configs.hasilKontak[status as keyof typeof configs.hasilKontak]
    } else if (type === 'hasilAkhir') {
      config = configs.hasilAkhir[status as keyof typeof configs.hasilAkhir]
    }
    
    if (!config) return null
    
    return (
      <Badge className={`${config.className} text-xs font-medium`}>
        {config.label}
      </Badge>
    )
  }

  const getVarianProdukLabel = (value: string) => {
    const option = varianProdukOptions.find(opt => opt.value === value)
    return option ? option.label : value
  }

  // Filter data
  const filteredLeads = outboundLeads.filter(lead => {
    const matchesSearch = searchTerm === '' || 
      lead.namaFaskes.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.kotaKabupaten.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.namaPIC && lead.namaPIC.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesStatus = statusFilter === '' || lead.statusKontakAwal === statusFilter
    const matchesKota = kotaFilter === '' || lead.kotaKabupaten === kotaFilter
    const matchesHasilAkhir = hasilAkhirFilter === '' || lead.hasilAkhir === hasilAkhirFilter
    const matchesVarianProduk = varianProdukFilter === '' || lead.varianProduk === varianProdukFilter
    
    return matchesSearch && matchesStatus && matchesKota && matchesHasilAkhir && matchesVarianProduk
  })

  // Pagination
  const totalPages = Math.ceil(filteredLeads.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedLeads = filteredLeads.slice(startIndex, startIndex + itemsPerPage)

  // Form validation
  const validateForm = () => {
    const errors: Record<string, string> = {}
    
    if (!formData.namaFaskes.trim()) errors.namaFaskes = 'Nama Faskes wajib diisi'
    if (!formData.noKontakFaskes.trim()) errors.noKontakFaskes = 'No Kontak wajib diisi'
    if (!formData.kotaKabupaten) errors.kotaKabupaten = 'Kota/Kabupaten wajib dipilih'
    if (!formData.statusKontakAwal) errors.statusKontakAwal = 'Status Kontak Awal wajib dipilih'
    // Hasil Kontak Awal dan Hasil Akhir tidak wajib diisi
    if (!formData.rmeYangDigunakan.trim()) errors.rmeYangDigunakan = 'RME yang digunakan wajib diisi'
    
    // Validation khusus untuk leads
    if (formData.hasilAkhir === 'leads') {
      if (!formData.varianProduk) errors.varianProduk = 'Varian Produk wajib dipilih untuk leads'
      if (!formData.namaPIC?.trim()) errors.namaPIC = 'Nama PIC wajib diisi untuk leads'
      if (!formData.posisiPIC?.trim()) errors.posisiPIC = 'Posisi PIC wajib diisi untuk leads'
      if (!formData.noWhatsAppPIC?.trim()) errors.noWhatsAppPIC = 'No WhatsApp PIC wajib diisi untuk leads'
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // CRUD Operations
  const handleAddLead = () => {
    if (!validateForm()) return
    
    const newId = Math.max(...outboundLeads.map(l => l.id)) + 1
    const newLead: OutboundLead = {
      id: newId,
      tanggalHubungiPertama: formData.tanggalHubungiPertama,
      namaFaskes: formData.namaFaskes,
      noKontakFaskes: formData.noKontakFaskes,
      kotaKabupaten: formData.kotaKabupaten,
      statusKontakAwal: formData.statusKontakAwal as OutboundLead['statusKontakAwal'],
      hasilKontakAwal: formData.hasilKontakAwal ? formData.hasilKontakAwal as OutboundLead['hasilKontakAwal'] : undefined,
      riwayatFollowUp: [],
      hasilAkhir: formData.hasilAkhir ? formData.hasilAkhir as OutboundLead['hasilAkhir'] : undefined,
      rmeYangDigunakan: formData.rmeYangDigunakan,
      varianProduk: formData.hasilAkhir === 'leads' ? formData.varianProduk : undefined,
      namaPIC: formData.hasilAkhir === 'leads' ? formData.namaPIC : undefined,
      posisiPIC: formData.hasilAkhir === 'leads' ? formData.posisiPIC : undefined,
      noWhatsAppPIC: formData.hasilAkhir === 'leads' ? formData.noWhatsAppPIC : undefined,
      catatan: formData.catatan || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: "Current User" // Should come from auth context
    }
    
    setOutboundLeads([...outboundLeads, newLead])
    setShowAddModal(false)
    resetForm()
    showNotification('Data outbound leads berhasil ditambahkan.', 'success')
  }

  const handleEditLead = () => {
    if (!editingLead || !validateForm()) return
    
    setOutboundLeads(outboundLeads.map(lead => 
      lead.id === editingLead.id 
        ? {
            ...lead,
            tanggalHubungiPertama: formData.tanggalHubungiPertama,
            namaFaskes: formData.namaFaskes,
            noKontakFaskes: formData.noKontakFaskes,
            kotaKabupaten: formData.kotaKabupaten,
            statusKontakAwal: formData.statusKontakAwal as OutboundLead['statusKontakAwal'],
            hasilKontakAwal: formData.hasilKontakAwal ? formData.hasilKontakAwal as OutboundLead['hasilKontakAwal'] : undefined,
            hasilAkhir: formData.hasilAkhir ? formData.hasilAkhir as OutboundLead['hasilAkhir'] : undefined,
            rmeYangDigunakan: formData.rmeYangDigunakan,
            varianProduk: formData.hasilAkhir === 'leads' ? formData.varianProduk : undefined,
            namaPIC: formData.hasilAkhir === 'leads' ? formData.namaPIC : undefined,
            posisiPIC: formData.hasilAkhir === 'leads' ? formData.posisiPIC : undefined,
            noWhatsAppPIC: formData.hasilAkhir === 'leads' ? formData.noWhatsAppPIC : undefined,
            catatan: formData.catatan || undefined,
            updatedAt: new Date().toISOString()
          }
        : lead
    ))
    
    setShowEditModal(false)
    setEditingLead(null)
    resetForm()
    showNotification('Data outbound leads berhasil diperbarui.', 'success')
  }

  const handleDeleteLead = (id: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus lead ini?')) {
      setOutboundLeads(outboundLeads.filter(lead => lead.id !== id))
      showNotification('Data outbound leads berhasil dihapus.', 'success')
    }
  }

  const handleBulkDelete = () => {
    if (selectedRows.length === 0) {
      showNotification('Silakan pilih lead yang akan dihapus', 'error')
      return
    }
    
    if (confirm(`Apakah Anda yakin ingin menghapus ${selectedRows.length} lead?`)) {
      setOutboundLeads(outboundLeads.filter(lead => !selectedRows.includes(lead.id)))
      setSelectedRows([])
      showNotification(`${selectedRows.length} data outbound leads berhasil dihapus.`, 'success')
    }
  }

  const resetForm = () => {
    setFormData({
      tanggalHubungiPertama: new Date().toISOString().split('T')[0],
      namaFaskes: '',
      noKontakFaskes: '',
      kotaKabupaten: '',
      statusKontakAwal: '',
      hasilKontakAwal: '',
      hasilAkhir: '',
      rmeYangDigunakan: '',
      varianProduk: '',
      namaPIC: '',
      posisiPIC: '',
      noWhatsAppPIC: '',
      catatan: ''
    })
    setFormErrors({})
  }

  const openEditModal = (lead: OutboundLead) => {
    setEditingLead(lead)
    setFormData({
      tanggalHubungiPertama: lead.tanggalHubungiPertama,
      namaFaskes: lead.namaFaskes,
      noKontakFaskes: lead.noKontakFaskes,
      kotaKabupaten: lead.kotaKabupaten,
      statusKontakAwal: lead.statusKontakAwal,
      hasilKontakAwal: lead.hasilKontakAwal,
      hasilAkhir: lead.hasilAkhir,
      rmeYangDigunakan: lead.rmeYangDigunakan,
      varianProduk: lead.varianProduk || '',
      namaPIC: lead.namaPIC || '',
      posisiPIC: lead.posisiPIC || '',
      noWhatsAppPIC: lead.noWhatsAppPIC || '',
      catatan: lead.catatan || ''
    })
    setShowEditModal(true)
  }

  // Follow-up operations
  const handleAddFollowUp = () => {
    if (!followUpLead || !followUpForm.catatan.trim()) {
      showNotification('Catatan follow-up wajib diisi', 'error')
      return
    }

    const newFollowUpId = followUpLead.riwayatFollowUp.length > 0 
      ? Math.max(...followUpLead.riwayatFollowUp.map(f => f.id)) + 1 
      : 1

    const newFollowUp = {
      id: newFollowUpId,
      tanggal: followUpForm.tanggal,
      catatan: followUpForm.catatan
    }

    setOutboundLeads(outboundLeads.map(lead => 
      lead.id === followUpLead.id 
        ? { ...lead, riwayatFollowUp: [...lead.riwayatFollowUp, newFollowUp] }
        : lead
    ))

    setShowFollowUpModal(false)
    setFollowUpLead(null)
    setFollowUpForm({
      tanggal: new Date().toISOString().split('T')[0],
      catatan: ''
    })
    showNotification('Follow-up berhasil ditambahkan!', 'success')
  }

  // Export functionality
  const handleExportCSV = () => {
    const csvContent = [
      // Header
      ['Tanggal Hubungi Pertama', 'Nama Faskes', 'No Kontak', 'Kota/Kabupaten', 'Status Kontak Awal', 'Hasil Kontak Awal', 'Hasil Akhir', 'RME Yang Digunakan', 'Varian Produk', 'Nama PIC', 'Posisi PIC', 'No WhatsApp PIC', 'Catatan'].join(','),
      // Data
      ...filteredLeads.map(lead => [
        lead.tanggalHubungiPertama,
        lead.namaFaskes,
        lead.noKontakFaskes,
        lead.kotaKabupaten,
        statusKontakAwalOptions.find(opt => opt.value === lead.statusKontakAwal)?.label || lead.statusKontakAwal,
        hasilKontakAwalOptions.find(opt => opt.value === lead.hasilKontakAwal)?.label || lead.hasilKontakAwal,
        hasilAkhirOptions.find(opt => opt.value === lead.hasilAkhir)?.label || lead.hasilAkhir,
        lead.rmeYangDigunakan,
        lead.varianProduk ? getVarianProdukLabel(lead.varianProduk) : '',
        lead.namaPIC || '',
        lead.posisiPIC || '',
        lead.noWhatsAppPIC || '',
        lead.catatan || ''
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'outbound-leads.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6 p-6">
      {/* Notification Toast */}
      {notification.show && (
        <div className={`fixed top-4 right-4 z-50 max-w-md transform transition-all duration-300 ease-in-out ${
          notification.show ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
        }`}>
          <div className={`rounded-lg shadow-lg border-l-4 p-4 ${
            notification.type === 'success' 
              ? 'bg-white border-green-400' 
              : notification.type === 'error'
              ? 'bg-white border-red-400'
              : 'bg-white border-blue-400'
          }`}>
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {notification.type === 'success' && (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                )}
                {notification.type === 'error' && (
                  <AlertCircle className="h-5 w-5 text-red-500" />
                )}
                {notification.type === 'info' && (
                  <Bell className="h-5 w-5 text-blue-500" />
                )}
              </div>
              <div className="ml-3 flex-1">
                <p className={`text-sm font-medium ${
                  notification.type === 'success' 
                    ? 'text-green-800' 
                    : notification.type === 'error'
                    ? 'text-red-800'
                    : 'text-blue-800'
                }`}>
                  {notification.message}
                </p>
              </div>
              <div className="ml-4 flex-shrink-0 flex">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={hideNotification}
                  className="h-6 w-6 p-0 hover:bg-slate-100"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="bg-white shadow-lg rounded-2xl border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Send className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Outbound Leads Management</h1>
                <p className="text-slate-600">Kelola dan pantau aktivitas outbound leads campaign</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {selectedRows.length > 0 && (
                <Button 
                  variant="destructive" 
                  onClick={handleBulkDelete}
                  className="px-4 py-2 gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Hapus ({selectedRows.length})
                </Button>
              )}
              <Button variant="outline" className="px-6 py-2 border-slate-300 text-slate-700 hover:bg-slate-50 gap-2">
                <Upload className="w-4 h-4" />
                Import Excel
              </Button>
              <Button 
                variant="outline" 
                onClick={handleExportCSV}
                className="px-6 py-2 border-slate-300 text-slate-700 hover:bg-slate-50 gap-2"
              >
                <FileSpreadsheet className="w-4 h-4" />
                Export CSV
              </Button>
              <Button 
                onClick={() => setShowAddModal(true)}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Lead
              </Button>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 items-end">
            {/* Search */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Pencarian
              </label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <Input 
                  placeholder="Cari faskes, kota, PIC..." 
                  className="pl-10 bg-white border-slate-300 focus:border-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Status Kontak
              </label>
              <select 
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-sm focus:border-blue-500"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">Semua Status</option>
                {statusKontakAwalOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            {/* Hasil Akhir Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Hasil Akhir
              </label>
              <select 
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-sm focus:border-blue-500"
                value={hasilAkhirFilter}
                onChange={(e) => setHasilAkhirFilter(e.target.value)}
              >
                <option value="">Semua Hasil</option>
                {hasilAkhirOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            {/* Kota Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Kota/Kabupaten
              </label>
              <select 
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-sm focus:border-blue-500"
                value={kotaFilter}
                onChange={(e) => setKotaFilter(e.target.value)}
              >
                <option value="">Semua Kota</option>
                {kotaKabupatenOptions.map(kota => (
                  <option key={kota} value={kota}>{kota}</option>
                ))}
              </select>
            </div>

            {/* Clear Filters */}
            <div>
              {(searchTerm || statusFilter || kotaFilter || hasilAkhirFilter || varianProdukFilter) && (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('');
                    setKotaFilter('');
                    setHasilAkhirFilter('');
                    setVarianProdukFilter('');
                  }}
                  className="w-full gap-2"
                >
                  <X className="w-4 h-4" />
                  Clear
                </Button>
              )}
            </div>
          </div>
          
          {/* Summary */}
          <div className="mt-4 text-sm text-slate-600">
            Showing {paginatedLeads.length} of {filteredLeads.length} leads
            {filteredLeads.length !== outboundLeads.length && ` (filtered from ${outboundLeads.length} total)`}
          </div>
        </div>

        {/* Table Section */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200 hover:bg-gradient-to-r hover:from-slate-50 hover:to-slate-100">
                <TableHead className="py-4 px-6 text-left font-semibold text-slate-700 border-r border-slate-200 last:border-r-0">
                  <input
                    type="checkbox"
                    checked={selectedRows.length === paginatedLeads.length && paginatedLeads.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedRows(paginatedLeads.map(lead => lead.id))
                      } else {
                        setSelectedRows([])
                      }
                    }}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                </TableHead>
                <TableHead className="py-4 px-6 text-left font-semibold text-slate-700 border-r border-slate-200 last:border-r-0">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-slate-500" />
                    <span>Tanggal Hubungi Pertama</span>
                  </div>
                </TableHead>
                <TableHead className="py-4 px-6 text-left font-semibold text-slate-700 border-r border-slate-200 last:border-r-0">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-slate-500" />
                    <span>Nama Faskes</span>
                  </div>
                </TableHead>
                <TableHead className="py-4 px-6 text-left font-semibold text-slate-700 border-r border-slate-200 last:border-r-0">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-slate-500" />
                    <span>No Kontak</span>
                  </div>
                </TableHead>
                <TableHead className="py-4 px-6 text-left font-semibold text-slate-700 border-r border-slate-200 last:border-r-0">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-slate-500" />
                    <span>Kota/Kabupaten</span>
                  </div>
                </TableHead>
                <TableHead className="py-4 px-6 text-left font-semibold text-slate-700 border-r border-slate-200 last:border-r-0">
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-slate-500" />
                    <span>Status Kontak Awal</span>
                  </div>
                </TableHead>
                <TableHead className="py-4 px-6 text-left font-semibold text-slate-700 border-r border-slate-200 last:border-r-0">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-slate-500" />
                    <span>Hasil Kontak Awal</span>
                  </div>
                </TableHead>
                <TableHead className="py-4 px-6 text-left font-semibold text-slate-700 border-r border-slate-200 last:border-r-0">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-slate-500" />
                    <span>Hasil Akhir</span>
                  </div>
                </TableHead>
                <TableHead className="py-4 px-6 text-left font-semibold text-slate-700 border-r border-slate-200 last:border-r-0">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-slate-500" />
                    <span>RME Yang Digunakan</span>
                  </div>
                </TableHead>
                <TableHead className="py-4 px-6 text-left font-semibold text-slate-700 border-r border-slate-200 last:border-r-0">
                  <div className="flex items-center gap-2">
                    <History className="h-4 w-4 text-slate-500" />
                    <span>Follow Up</span>
                  </div>
                </TableHead>
                <TableHead className="py-4 px-6 text-left font-semibold text-slate-700 border-r border-slate-200 last:border-r-0">
                  <div className="flex items-center gap-2">
                    <span>Aksi</span>
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedLeads.map((lead) => (
                <TableRow key={lead.id} className="transition-all duration-200 hover:bg-slate-50 border-b border-slate-100 last:border-b-0">
                  {/* Checkbox */}
                  <TableCell className="py-4 px-6 border-r border-slate-100 last:border-r-0">
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(lead.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedRows([...selectedRows, lead.id])
                        } else {
                          setSelectedRows(selectedRows.filter(id => id !== lead.id))
                        }
                      }}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </TableCell>

                  {/* Tanggal Hubungi Pertama */}
                  <TableCell className="py-4 px-6 border-r border-slate-100 last:border-r-0">
                    <div className="text-slate-700">{lead.tanggalHubungiPertama}</div>
                  </TableCell>

                  {/* Nama Faskes */}
                  <TableCell className="py-4 px-6 border-r border-slate-100 last:border-r-0">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {lead.namaFaskes.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">{lead.namaFaskes}</div>
                        <div className="text-sm text-slate-500">ID: {lead.id}</div>
                      </div>
                    </div>
                  </TableCell>

                  {/* No Kontak */}
                  <TableCell className="py-4 px-6 border-r border-slate-100 last:border-r-0">
                    <a 
                      href={`tel:${lead.noKontakFaskes}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-green-600 hover:text-green-700 transition-colors"
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      <span className="text-sm">{lead.noKontakFaskes}</span>
                    </a>
                  </TableCell>

                  {/* Kota/Kabupaten */}
                  <TableCell className="py-4 px-6 border-r border-slate-100 last:border-r-0">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-slate-400" />
                      <span className="text-sm text-slate-700">{lead.kotaKabupaten}</span>
                    </div>
                  </TableCell>

                  {/* Status Kontak Awal */}
                  <TableCell className="py-4 px-6 border-r border-slate-100 last:border-r-0">
                    {getStatusBadge(lead.statusKontakAwal, 'kontakAwal')}
                  </TableCell>

                  {/* Hasil Kontak Awal */}
                  <TableCell className="py-4 px-6 border-r border-slate-100 last:border-r-0">
                    {lead.hasilKontakAwal ? getStatusBadge(lead.hasilKontakAwal, 'hasilKontak') : (
                      <span className="text-slate-400 text-sm">-</span>
                    )}
                  </TableCell>

                  {/* Hasil Akhir */}
                  <TableCell className="py-4 px-6 border-r border-slate-100 last:border-r-0">
                    <div className="space-y-2">
                      {lead.hasilAkhir ? getStatusBadge(lead.hasilAkhir, 'hasilAkhir') : (
                        <span className="text-slate-400 text-sm">-</span>
                      )}
                      {lead.hasilAkhir === 'leads' && lead.varianProduk && (
                        <div className="text-xs text-slate-500">
                          {getVarianProdukLabel(lead.varianProduk)}
                        </div>
                      )}
                    </div>
                  </TableCell>

                  {/* RME Yang Digunakan */}
                  <TableCell className="py-4 px-6 border-r border-slate-100 last:border-r-0">
                    <div className="text-sm text-slate-700">{lead.rmeYangDigunakan}</div>
                  </TableCell>

                  {/* Follow Up */}
                  <TableCell className="py-4 px-6 border-r border-slate-100 last:border-r-0">
                    <div className="space-y-1">
                      <div className="text-xs text-slate-500">
                        {lead.riwayatFollowUp.length} follow-up(s)
                      </div>
                      {lead.riwayatFollowUp.length > 0 && (
                        <div className="text-xs text-slate-600">
                          Latest: {lead.riwayatFollowUp[lead.riwayatFollowUp.length - 1].tanggal}
                        </div>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setFollowUpLead(lead)
                          setShowFollowUpModal(true)
                        }}
                        className="h-6 px-2 text-xs"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Add
                      </Button>
                    </div>
                  </TableCell>

                  {/* Aksi */}
                  <TableCell className="py-4 px-6 border-r border-slate-100 last:border-r-0">
                    <div className="flex items-center gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => {
                          setSelectedLead(lead)
                          setShowDetailModal(true)
                        }}
                        className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => openEditModal(lead)}
                        className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                        title="Edit Lead"
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDeleteLead(lead.id)}
                        className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                        title="Delete Lead"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
            <div className="text-sm text-slate-600">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Add Lead Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Tambah Lead Baru</h2>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    setShowAddModal(false)
                    resetForm()
                  }}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 pb-2 border-b">Informasi Dasar</h3>
                  
                  {/* Tanggal Hubungi Pertama */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tanggal Hubungi Pertama <span className="text-red-500">*</span>
                    </label>
                    <Input 
                      type="date"
                      value={formData.tanggalHubungiPertama}
                      onChange={(e) => setFormData({ ...formData, tanggalHubungiPertama: e.target.value })}
                      className={`${formErrors.tanggalHubungiPertama ? 'border-red-500' : ''}`}
                    />
                    {formErrors.tanggalHubungiPertama && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.tanggalHubungiPertama}</p>
                    )}
                  </div>

                  {/* Nama Faskes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nama Faskes <span className="text-red-500">*</span>
                    </label>
                    <Input 
                      placeholder="Masukkan nama faskes"
                      value={formData.namaFaskes}
                      onChange={(e) => setFormData({ ...formData, namaFaskes: e.target.value })}
                      className={`${formErrors.namaFaskes ? 'border-red-500' : ''}`}
                    />
                    {formErrors.namaFaskes && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.namaFaskes}</p>
                    )}
                  </div>

                  {/* No Kontak */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      No Kontak Faskes <span className="text-red-500">*</span>
                    </label>
                    <Input 
                      placeholder="Masukkan nomor kontak"
                      value={formData.noKontakFaskes}
                      onChange={(e) => setFormData({ ...formData, noKontakFaskes: e.target.value })}
                      className={`${formErrors.noKontakFaskes ? 'border-red-500' : ''}`}
                    />
                    {formErrors.noKontakFaskes && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.noKontakFaskes}</p>
                    )}
                  </div>

                  {/* Kota/Kabupaten */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kota/Kabupaten <span className="text-red-500">*</span>
                    </label>
                    <select 
                      value={formData.kotaKabupaten}
                      onChange={(e) => setFormData({ ...formData, kotaKabupaten: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg bg-white ${formErrors.kotaKabupaten ? 'border-red-500' : 'border-gray-300'}`}
                    >
                      <option value="">Pilih kota/kabupaten</option>
                      {kotaKabupatenOptions.map(kota => (
                        <option key={kota} value={kota}>{kota}</option>
                      ))}
                    </select>
                    {formErrors.kotaKabupaten && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.kotaKabupaten}</p>
                    )}
                  </div>

                  {/* RME Yang Digunakan */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      RME Yang Digunakan <span className="text-red-500">*</span>
                    </label>
                    <Input 
                      placeholder="e.g., SIMRS Khanza, Manual, dll"
                      value={formData.rmeYangDigunakan}
                      onChange={(e) => setFormData({ ...formData, rmeYangDigunakan: e.target.value })}
                      className={`${formErrors.rmeYangDigunakan ? 'border-red-500' : ''}`}
                    />
                    {formErrors.rmeYangDigunakan && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.rmeYangDigunakan}</p>
                    )}
                  </div>
                </div>

                {/* Contact Status & Results */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 pb-2 border-b">Status & Hasil Kontak</h3>
                  
                  {/* Status Kontak Awal */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status Kontak Awal <span className="text-red-500">*</span>
                    </label>
                    <select 
                      value={formData.statusKontakAwal}
                      onChange={(e) => setFormData({ ...formData, statusKontakAwal: e.target.value as OutboundLead['statusKontakAwal'] })}
                      className={`w-full px-3 py-2 border rounded-lg bg-white ${formErrors.statusKontakAwal ? 'border-red-500' : 'border-gray-300'}`}
                    >
                      <option value="">Pilih status kontak</option>
                      {statusKontakAwalOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                    {formErrors.statusKontakAwal && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.statusKontakAwal}</p>
                    )}
                  </div>

                  {/* Hasil Kontak Awal */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hasil Kontak Awal
                    </label>
                    <select 
                      value={formData.hasilKontakAwal}
                      onChange={(e) => setFormData({ ...formData, hasilKontakAwal: e.target.value as OutboundLead['hasilKontakAwal'] })}
                      className={`w-full px-3 py-2 border rounded-lg bg-white ${formErrors.hasilKontakAwal ? 'border-red-500' : 'border-gray-300'}`}
                    >
                      <option value="">Pilih hasil kontak</option>
                      {hasilKontakAwalOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                    {formErrors.hasilKontakAwal && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.hasilKontakAwal}</p>
                    )}
                  </div>

                  {/* Hasil Akhir */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hasil Akhir
                    </label>
                    <select 
                      value={formData.hasilAkhir}
                      onChange={(e) => setFormData({ ...formData, hasilAkhir: e.target.value as OutboundLead['hasilAkhir'] })}
                      className={`w-full px-3 py-2 border rounded-lg bg-white ${formErrors.hasilAkhir ? 'border-red-500' : 'border-gray-300'}`}
                    >
                      <option value="">Pilih hasil akhir</option>
                      {hasilAkhirOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                    {formErrors.hasilAkhir && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.hasilAkhir}</p>
                    )}
                  </div>

                  {/* Fields khusus untuk Leads */}
                  {formData.hasilAkhir === 'leads' && (
                    <>
                      {/* Varian Produk */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Varian Produk <span className="text-red-500">*</span>
                        </label>
                        <select 
                          value={formData.varianProduk}
                          onChange={(e) => setFormData({ ...formData, varianProduk: e.target.value })}
                          className={`w-full px-3 py-2 border rounded-lg bg-white ${formErrors.varianProduk ? 'border-red-500' : 'border-gray-300'}`}
                        >
                          <option value="">Pilih varian produk</option>
                          {varianProdukOptions.map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                        {formErrors.varianProduk && (
                          <p className="text-red-500 text-xs mt-1">{formErrors.varianProduk}</p>
                        )}
                      </div>

                      {/* Nama PIC */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nama PIC <span className="text-red-500">*</span>
                        </label>
                        <Input 
                          placeholder="Masukkan nama PIC"
                          value={formData.namaPIC}
                          onChange={(e) => setFormData({ ...formData, namaPIC: e.target.value })}
                          className={`${formErrors.namaPIC ? 'border-red-500' : ''}`}
                        />
                        {formErrors.namaPIC && (
                          <p className="text-red-500 text-xs mt-1">{formErrors.namaPIC}</p>
                        )}
                      </div>

                      {/* Posisi PIC */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Posisi PIC <span className="text-red-500">*</span>
                        </label>
                        <Input 
                          placeholder="e.g., Direktur IT, Manager"
                          value={formData.posisiPIC}
                          onChange={(e) => setFormData({ ...formData, posisiPIC: e.target.value })}
                          className={`${formErrors.posisiPIC ? 'border-red-500' : ''}`}
                        />
                        {formErrors.posisiPIC && (
                          <p className="text-red-500 text-xs mt-1">{formErrors.posisiPIC}</p>
                        )}
                      </div>

                      {/* No WhatsApp PIC */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          No WhatsApp PIC <span className="text-red-500">*</span>
                        </label>
                        <Input 
                          placeholder="08xxxxxxxxxx"
                          value={formData.noWhatsAppPIC}
                          onChange={(e) => setFormData({ ...formData, noWhatsAppPIC: e.target.value })}
                          className={`${formErrors.noWhatsAppPIC ? 'border-red-500' : ''}`}
                        />
                        {formErrors.noWhatsAppPIC && (
                          <p className="text-red-500 text-xs mt-1">{formErrors.noWhatsAppPIC}</p>
                        )}
                      </div>
                    </>
                  )}

                  {/* Catatan */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Catatan
                    </label>
                    <textarea 
                      placeholder="Catatan tambahan..."
                      value={formData.catatan}
                      onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none"
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 mt-8 pt-6 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowAddModal(false)
                    resetForm()
                  }}
                >
                  Batal
                </Button>
                <Button onClick={handleAddLead} className="gap-2">
                  <Save className="w-4 h-4" />
                  Simpan Lead
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Lead Modal */}
      {showEditModal && editingLead && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Edit Lead - {editingLead.namaFaskes}</h2>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    setShowEditModal(false)
                    setEditingLead(null)
                    resetForm()
                  }}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Same form fields as Add Modal */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 pb-2 border-b">Informasi Dasar</h3>
                  
                  {/* Tanggal Hubungi Pertama */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tanggal Hubungi Pertama <span className="text-red-500">*</span>
                    </label>
                    <Input 
                      type="date"
                      value={formData.tanggalHubungiPertama}
                      onChange={(e) => setFormData({ ...formData, tanggalHubungiPertama: e.target.value })}
                      className={`${formErrors.tanggalHubungiPertama ? 'border-red-500' : ''}`}
                    />
                    {formErrors.tanggalHubungiPertama && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.tanggalHubungiPertama}</p>
                    )}
                  </div>

                  {/* Nama Faskes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nama Faskes <span className="text-red-500">*</span>
                    </label>
                    <Input 
                      placeholder="Masukkan nama faskes"
                      value={formData.namaFaskes}
                      onChange={(e) => setFormData({ ...formData, namaFaskes: e.target.value })}
                      className={`${formErrors.namaFaskes ? 'border-red-500' : ''}`}
                    />
                    {formErrors.namaFaskes && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.namaFaskes}</p>
                    )}
                  </div>

                  {/* No Kontak */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      No Kontak Faskes <span className="text-red-500">*</span>
                    </label>
                    <Input 
                      placeholder="Masukkan nomor kontak"
                      value={formData.noKontakFaskes}
                      onChange={(e) => setFormData({ ...formData, noKontakFaskes: e.target.value })}
                      className={`${formErrors.noKontakFaskes ? 'border-red-500' : ''}`}
                    />
                    {formErrors.noKontakFaskes && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.noKontakFaskes}</p>
                    )}
                  </div>

                  {/* Kota/Kabupaten */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kota/Kabupaten <span className="text-red-500">*</span>
                    </label>
                    <select 
                      value={formData.kotaKabupaten}
                      onChange={(e) => setFormData({ ...formData, kotaKabupaten: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg bg-white ${formErrors.kotaKabupaten ? 'border-red-500' : 'border-gray-300'}`}
                    >
                      <option value="">Pilih kota/kabupaten</option>
                      {kotaKabupatenOptions.map(kota => (
                        <option key={kota} value={kota}>{kota}</option>
                      ))}
                    </select>
                    {formErrors.kotaKabupaten && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.kotaKabupaten}</p>
                    )}
                  </div>

                  {/* RME Yang Digunakan */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      RME Yang Digunakan <span className="text-red-500">*</span>
                    </label>
                    <Input 
                      placeholder="e.g., SIMRS Khanza, Manual, dll"
                      value={formData.rmeYangDigunakan}
                      onChange={(e) => setFormData({ ...formData, rmeYangDigunakan: e.target.value })}
                      className={`${formErrors.rmeYangDigunakan ? 'border-red-500' : ''}`}
                    />
                    {formErrors.rmeYangDigunakan && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.rmeYangDigunakan}</p>
                    )}
                  </div>
                </div>

                {/* Contact Status & Results */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 pb-2 border-b">Status & Hasil Kontak</h3>
                  
                  {/* Status Kontak Awal */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status Kontak Awal <span className="text-red-500">*</span>
                    </label>
                    <select 
                      value={formData.statusKontakAwal}
                      onChange={(e) => setFormData({ ...formData, statusKontakAwal: e.target.value as OutboundLead['statusKontakAwal'] })}
                      className={`w-full px-3 py-2 border rounded-lg bg-white ${formErrors.statusKontakAwal ? 'border-red-500' : 'border-gray-300'}`}
                    >
                      <option value="">Pilih status kontak</option>
                      {statusKontakAwalOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                    {formErrors.statusKontakAwal && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.statusKontakAwal}</p>
                    )}
                  </div>

                  {/* Hasil Kontak Awal */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hasil Kontak Awal
                    </label>
                    <select 
                      value={formData.hasilKontakAwal}
                      onChange={(e) => setFormData({ ...formData, hasilKontakAwal: e.target.value as OutboundLead['hasilKontakAwal'] })}
                      className={`w-full px-3 py-2 border rounded-lg bg-white ${formErrors.hasilKontakAwal ? 'border-red-500' : 'border-gray-300'}`}
                    >
                      <option value="">Pilih hasil kontak</option>
                      {hasilKontakAwalOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                    {formErrors.hasilKontakAwal && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.hasilKontakAwal}</p>
                    )}
                  </div>

                  {/* Hasil Akhir */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hasil Akhir
                    </label>
                    <select 
                      value={formData.hasilAkhir}
                      onChange={(e) => setFormData({ ...formData, hasilAkhir: e.target.value as OutboundLead['hasilAkhir'] })}
                      className={`w-full px-3 py-2 border rounded-lg bg-white ${formErrors.hasilAkhir ? 'border-red-500' : 'border-gray-300'}`}
                    >
                      <option value="">Pilih hasil akhir</option>
                      {hasilAkhirOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                    {formErrors.hasilAkhir && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.hasilAkhir}</p>
                    )}
                  </div>

                  {/* Fields khusus untuk Leads */}
                  {formData.hasilAkhir === 'leads' && (
                    <>
                      {/* Varian Produk */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Varian Produk <span className="text-red-500">*</span>
                        </label>
                        <select 
                          value={formData.varianProduk}
                          onChange={(e) => setFormData({ ...formData, varianProduk: e.target.value })}
                          className={`w-full px-3 py-2 border rounded-lg bg-white ${formErrors.varianProduk ? 'border-red-500' : 'border-gray-300'}`}
                        >
                          <option value="">Pilih varian produk</option>
                          {varianProdukOptions.map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                        {formErrors.varianProduk && (
                          <p className="text-red-500 text-xs mt-1">{formErrors.varianProduk}</p>
                        )}
                      </div>

                      {/* Nama PIC */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nama PIC <span className="text-red-500">*</span>
                        </label>
                        <Input 
                          placeholder="Masukkan nama PIC"
                          value={formData.namaPIC}
                          onChange={(e) => setFormData({ ...formData, namaPIC: e.target.value })}
                          className={`${formErrors.namaPIC ? 'border-red-500' : ''}`}
                        />
                        {formErrors.namaPIC && (
                          <p className="text-red-500 text-xs mt-1">{formErrors.namaPIC}</p>
                        )}
                      </div>

                      {/* Posisi PIC */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Posisi PIC <span className="text-red-500">*</span>
                        </label>
                        <Input 
                          placeholder="e.g., Direktur IT, Manager"
                          value={formData.posisiPIC}
                          onChange={(e) => setFormData({ ...formData, posisiPIC: e.target.value })}
                          className={`${formErrors.posisiPIC ? 'border-red-500' : ''}`}
                        />
                        {formErrors.posisiPIC && (
                          <p className="text-red-500 text-xs mt-1">{formErrors.posisiPIC}</p>
                        )}
                      </div>

                      {/* No WhatsApp PIC */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          No WhatsApp PIC <span className="text-red-500">*</span>
                        </label>
                        <Input 
                          placeholder="08xxxxxxxxxx"
                          value={formData.noWhatsAppPIC}
                          onChange={(e) => setFormData({ ...formData, noWhatsAppPIC: e.target.value })}
                          className={`${formErrors.noWhatsAppPIC ? 'border-red-500' : ''}`}
                        />
                        {formErrors.noWhatsAppPIC && (
                          <p className="text-red-500 text-xs mt-1">{formErrors.noWhatsAppPIC}</p>
                        )}
                      </div>
                    </>
                  )}

                  {/* Catatan */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Catatan
                    </label>
                    <textarea 
                      placeholder="Catatan tambahan..."
                      value={formData.catatan}
                      onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none"
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 mt-8 pt-6 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowEditModal(false)
                    setEditingLead(null)
                    resetForm()
                  }}
                >
                  Batal
                </Button>
                <Button onClick={handleEditLead} className="gap-2">
                  <Save className="w-4 h-4" />
                  Update Lead
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedLead && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedLead.namaFaskes}</h2>
                  <p className="text-sm text-gray-600">{selectedLead.kotaKabupaten}</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    setShowDetailModal(false)
                    setSelectedLead(null)
                  }}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Basic Information */}
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4 pb-2 border-b">Informasi Dasar</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-700">Tanggal Hubungi Pertama:</span>
                        <span>{selectedLead.tanggalHubungiPertama}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-700">No Kontak:</span>
                        <a href={`tel:${selectedLead.noKontakFaskes}`} className="text-blue-600 hover:underline">
                          {selectedLead.noKontakFaskes}
                        </a>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-700">RME Yang Digunakan:</span>
                        <span>{selectedLead.rmeYangDigunakan}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4 pb-2 border-b">Status Kontak</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-700">Status Kontak Awal:</span>
                        {getStatusBadge(selectedLead.statusKontakAwal, 'kontakAwal')}
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-700">Hasil Kontak Awal:</span>
                        {getStatusBadge(selectedLead.hasilKontakAwal, 'hasilKontak')}
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-700">Hasil Akhir:</span>
                        {getStatusBadge(selectedLead.hasilAkhir, 'hasilAkhir')}
                      </div>
                    </div>
                  </div>

                  {/* Lead Information (if applicable) */}
                  {selectedLead.hasilAkhir === 'leads' && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-4 pb-2 border-b">Informasi Lead</h3>
                      <div className="space-y-3">
                        {selectedLead.varianProduk && (
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-700">Varian Produk:</span>
                            <span>{getVarianProdukLabel(selectedLead.varianProduk)}</span>
                          </div>
                        )}
                        {selectedLead.namaPIC && (
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-700">Nama PIC:</span>
                            <span>{selectedLead.namaPIC}</span>
                          </div>
                        )}
                        {selectedLead.posisiPIC && (
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-700">Posisi PIC:</span>
                            <span>{selectedLead.posisiPIC}</span>
                          </div>
                        )}
                        {selectedLead.noWhatsAppPIC && (
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-700">WhatsApp PIC:</span>
                            <a 
                              href={`https://wa.me/${selectedLead.noWhatsAppPIC.replace(/^0/, '62')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-green-600 hover:underline"
                            >
                              {selectedLead.noWhatsAppPIC}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {selectedLead.catatan && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-4 pb-2 border-b">Catatan</h3>
                      <p className="text-gray-700">{selectedLead.catatan}</p>
                    </div>
                  )}
                </div>

                {/* Follow-up History */}
                <div>
                  <div className="flex items-center justify-between mb-4 pb-2 border-b">
                    <h3 className="font-semibold text-gray-900">Riwayat Follow-up</h3>
                    <Button 
                      size="sm"
                      onClick={() => {
                        setFollowUpLead(selectedLead)
                        setShowFollowUpModal(true)
                      }}
                      className="gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add Follow-up
                    </Button>
                  </div>
                  
                  {selectedLead.riwayatFollowUp.length > 0 ? (
                    <div className="space-y-4">
                      {selectedLead.riwayatFollowUp.map((followUp) => (
                        <div key={followUp.id} className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <span className="text-sm font-medium text-gray-900">{followUp.tanggal}</span>
                          </div>
                          {followUp.catatan && (
                            <p className="text-sm text-gray-700">{followUp.catatan}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <History className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">Belum ada follow-up</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8 pt-6 border-t">
                <Button 
                  variant="outline"
                  onClick={() => openEditModal(selectedLead)}
                  className="gap-2"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit Lead
                </Button>
                <Button 
                  onClick={() => {
                    setShowDetailModal(false)
                    setSelectedLead(null)
                  }}
                >
                  Tutup
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Follow-up Modal */}
      {showFollowUpModal && followUpLead && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
            <div className="border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">Tambah Follow-up</h2>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    setShowFollowUpModal(false)
                    setFollowUpLead(null)
                    setFollowUpForm({
                      tanggal: new Date().toISOString().split('T')[0],
                      catatan: ''
                    })
                  }}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <p className="text-sm text-gray-600 mt-1">{followUpLead.namaFaskes}</p>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tanggal Follow-up <span className="text-red-500">*</span>
                  </label>
                  <Input 
                    type="date"
                    value={followUpForm.tanggal}
                    onChange={(e) => setFollowUpForm({ ...followUpForm, tanggal: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Catatan <span className="text-red-500">*</span>
                  </label>
                  <textarea 
                    placeholder="Masukkan catatan follow-up..."
                    value={followUpForm.catatan}
                    onChange={(e) => setFollowUpForm({ ...followUpForm, catatan: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none"
                    rows={4}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowFollowUpModal(false)
                    setFollowUpLead(null)
                    setFollowUpForm({
                      tanggal: new Date().toISOString().split('T')[0],
                      catatan: ''
                    })
                  }}
                >
                  Batal
                </Button>
                <Button onClick={handleAddFollowUp} className="gap-2">
                  <Save className="w-4 h-4" />
                  Simpan Follow-up
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
'use client'

import React, { useState, useEffect } from 'react'
import { X, Save, Plus, Minus, Building2, Calendar, Phone, Mail, User, Package, FileText, AlertCircle, Clock, History, ChevronDown, ChevronRight } from 'lucide-react'

interface FollowUp {
  id: string
  tanggal: string
  catatan: string
}

interface HistoryLog {
  id: string
  timestamp: string
  action: string
  details: string
  user: string
}

interface OutboundLeadFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: any) => void
}

export default function OutboundLeadForm({ isOpen, onClose, onSubmit }: OutboundLeadFormProps) {
  const [formData, setFormData] = useState({
    namaFaskes: '',
    kota: '',
    noKontakFaskes: '',
    tanggalHubungiAwal: '',
    followUps: [] as FollowUp[],
    layanan: '',
    statusAkhir: '',
    rmeBefore: '',
    rmeAfter: '',
    namaPIC: '',
    posisiPIC: '',
    waPIC: '',
    catatan: ''
  })

  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [showValidationAlert, setShowValidationAlert] = useState(false)
  const [isFormValid, setIsFormValid] = useState(false)
  const [showRME, setShowRME] = useState(false)
  const [historyLogs, setHistoryLogs] = useState<HistoryLog[]>([])
  const [showHistory, setShowHistory] = useState(false)

  // Data master options
  const kotaOptions = [
    'Jakarta', 'Surabaya', 'Bandung', 'Medan', 'Bekasi', 'Tangerang', 'Depok', 'Semarang',
    'Palembang', 'Makassar', 'Batam', 'Bogor', 'Pekanbaru', 'Bandar Lampung', 'Malang'
  ]

  // Data layanan untuk dropdown
  const layananOptions = [
    { id: 1, name: "Konsultasi Medis" },
    { id: 2, name: "Medical Check-up" },
    { id: 3, name: "Vaksinasi" }
  ]

  const statusOptions = [
    'New', 'Contacted', 'Interested', 'Follow Up', 'Proposal Sent', 
    'Negotiation', 'Closed Won', 'Closed Lost', 'Pending', 'Not Interested'
  ]

  const quickNoteTemplates = [
    'Tertarik dengan layanan, perlu follow up minggu depan',
    'Sudah ada vendor lain, namun terbuka untuk diskusi',
    'Budget sedang dalam review, akan konfirmasi bulan depan',
    'Meminta proposal detail terlebih dahulu',
    'Akan diskusi dengan tim internal dulu'
  ]

  // Validation function
  const validateForm = () => {
    const errors: string[] = []
    const fieldLabels = {
      namaFaskes: "Nama Faskes",
      kota: "Kota", 
      noKontakFaskes: "No Kontak Faskes",
      tanggalHubungiAwal: "Tanggal Hubungi Awal",
      layanan: "Layanan",
      statusAkhir: "Status Akhir",
      namaPIC: "Nama PIC",
      posisiPIC: "Posisi PIC",
      waPIC: "WhatsApp PIC"
    }

    // Required fields validation
    const requiredFields = ['namaFaskes', 'kota', 'noKontakFaskes', 'tanggalHubungiAwal', 'statusAkhir', 'namaPIC', 'posisiPIC', 'waPIC']
    
    requiredFields.forEach(field => {
      if (!formData[field] || (typeof formData[field] === 'string' && formData[field].trim() === '')) {
        errors.push(fieldLabels[field])
      }
    })

    // Product selection validation
    if (!formData.layanan) {
      errors.push(fieldLabels.layanan)
    }

    // Phone number validation
    if (formData.noKontakFaskes && formData.noKontakFaskes.trim() !== '') {
      const phoneRegex = /^[+]?[\d\s\-()]{8,15}$/
      if (!phoneRegex.test(formData.noKontakFaskes.trim())) {
        errors.push("Format No Kontak Faskes tidak valid")
      }
    }

    // WhatsApp validation
    if (formData.waPIC && formData.waPIC.trim() !== '') {
      const waRegex = /^[+]?[\d\s\-()]{8,15}$/
      if (!waRegex.test(formData.waPIC.trim())) {
        errors.push("Format WhatsApp PIC tidak valid")
      }
    }

    // Follow up validation
    formData.followUps.forEach((fu, index) => {
      if (!fu.tanggal || fu.tanggal.trim() === '') {
        errors.push(`Tanggal Follow Up ${index + 1}`)
      }
    })

    return errors
  }



  // Form validation check
  useEffect(() => {
    const errors = validateForm()
    setIsFormValid(errors.length === 0)
  }, [formData])

  const handleFormDataChange = (key: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }))

    if (showValidationAlert) {
      setShowValidationAlert(false)
    }
  }

  const addFollowUp = () => {
    const newFollowUp: FollowUp = {
      id: Date.now().toString(),
      tanggal: '',
      catatan: ''
    }
    setFormData(prev => ({
      ...prev,
      followUps: [...prev.followUps, newFollowUp]
    }))
  }

  const removeFollowUp = (id: string) => {
    setFormData(prev => ({
      ...prev,
      followUps: prev.followUps.filter(fu => fu.id !== id)
    }))
  }

  const updateFollowUp = (id: string, field: 'tanggal' | 'catatan', value: string) => {
    setFormData(prev => ({
      ...prev,
      followUps: prev.followUps.map(fu => 
        fu.id === id ? { ...fu, [field]: value } : fu
      )
    }))
  }

  const handleLayananChange = (layananId: string) => {
    setFormData(prev => ({
      ...prev,
      layanan: layananId
    }))
  }

  const addQuickNote = (template: string) => {
    const currentNote = formData.catatan
    const newNote = currentNote ? `${currentNote}\n${template}` : template
    handleFormDataChange('catatan', newNote)
  }

  const handleSubmit = () => {
    const errors = validateForm()
    
    if (errors.length > 0) {
      setValidationErrors(errors)
      setShowValidationAlert(true)
      return
    }

    // Add to history log
    const newLog: HistoryLog = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      action: 'CREATE',
      details: `Outbound lead "${formData.namaFaskes}" berhasil ditambahkan`,
      user: 'Current User'
    }
    setHistoryLogs(prev => [newLog, ...prev])

    // Submit form
    onSubmit(formData)
    
    // Reset form
    setFormData({
      namaFaskes: '',
      kota: '',
      noKontakFaskes: '',
      tanggalHubungiAwal: '',
      followUps: [],
      layanan: '',
      statusAkhir: '',
      rmeBefore: '',
      rmeAfter: '',
      namaPIC: '',
      posisiPIC: '',
      waPIC: '',
      catatan: ''
    })
    
    setShowValidationAlert(false)
    setValidationErrors([])
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Form Tambah Outbound Lead</h1>
            <p className="text-gray-600 mt-1">Lengkapi informasi lead baru dengan detail yang akurat</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 max-w-6xl mx-auto">
            {/* Validation Alert */}
            {showValidationAlert && validationErrors.length > 0 && (
              <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg shadow-md">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Form belum lengkap
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>Field berikut wajib diisi: <span className="font-semibold">{validationErrors.join(', ')}</span></p>
                    </div>
                    <div className="mt-3">
                      <button
                        type="button"
                        onClick={() => setShowValidationAlert(false)}
                        className="text-sm text-red-800 hover:text-red-900 font-medium underline focus:outline-none"
                      >
                        Tutup peringatan
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <form className="bg-white shadow rounded-lg p-6 space-y-8">
              {/* Basic Information */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Informasi Dasar Faskes</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nama Faskes *
                    </label>
                    <input
                      type="text"
                      value={formData.namaFaskes}
                      onChange={(e) => handleFormDataChange('namaFaskes', e.target.value)}
                      placeholder="Masukkan nama fasilitas kesehatan"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kota *
                    </label>
                    <select
                      value={formData.kota}
                      onChange={(e) => handleFormDataChange('kota', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Pilih kota</option>
                      {kotaOptions.map((kota) => (
                        <option key={kota} value={kota}>{kota}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      No Kontak Faskes *
                    </label>
                    <input
                      type="text"
                      value={formData.noKontakFaskes}
                      onChange={(e) => handleFormDataChange('noKontakFaskes', e.target.value)}
                      placeholder="Contoh: +628123456789"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Initial Contact */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Kontak Awal</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tanggal Hubungi Awal *
                    </label>
                    <input
                      type="date"
                      value={formData.tanggalHubungiAwal}
                      onChange={(e) => handleFormDataChange('tanggalHubungiAwal', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Follow Up Section */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Follow Up Schedule</h2>
                <div className="space-y-4">
                  {formData.followUps.map((followUp, index) => (
                    <div key={followUp.id} className="bg-gray-50 p-4 rounded-lg border">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="text-sm font-medium text-gray-700">Follow Up {index + 1}</h3>
                        <button
                          type="button"
                          onClick={() => removeFollowUp(followUp.id)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tanggal Follow Up *
                          </label>
                          <input
                            type="date"
                            value={followUp.tanggal}
                            onChange={(e) => updateFollowUp(followUp.id, 'tanggal', e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Catatan Follow Up
                          </label>
                          <textarea
                            value={followUp.catatan}
                            onChange={(e) => updateFollowUp(followUp.id, 'catatan', e.target.value)}
                            placeholder="Masukkan catatan untuk follow up ini..."
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            rows={2}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addFollowUp}
                    className="flex items-center gap-2 px-4 py-2 text-blue-600 border border-blue-300 rounded-md hover:bg-blue-50 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Tambah Follow Up
                  </button>
                </div>
              </div>

              {/* Layanan Selection */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Layanan</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pilih Layanan *
                    </label>
                    <select
                      value={formData.layanan}
                      onChange={(e) => handleLayananChange(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">-- Pilih Layanan --</option>
                      {layananOptions.map((layanan) => (
                        <option key={layanan.id} value={layanan.id.toString()}>
                          {layanan.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Status Lead</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status Akhir *
                    </label>
                    <select
                      value={formData.statusAkhir}
                      onChange={(e) => handleFormDataChange('statusAkhir', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Pilih status</option>
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* RME Before/After */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 border-b pb-2 flex-1">RME (Revenue Monthly Estimate)</h2>
                  <button
                    type="button"
                    onClick={() => setShowRME(!showRME)}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    {showRME ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    {showRME ? 'Sembunyikan' : 'Tampilkan'}
                  </button>
                </div>
                {showRME && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        RME Before
                      </label>
                      <input
                        type="text"
                        value={formData.rmeBefore}
                        onChange={(e) => handleFormDataChange('rmeBefore', e.target.value)}
                        placeholder="Estimasi revenue sebelum implementasi"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        RME After
                      </label>
                      <input
                        type="text"
                        value={formData.rmeAfter}
                        onChange={(e) => handleFormDataChange('rmeAfter', e.target.value)}
                        placeholder="Estimasi revenue setelah implementasi"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* PIC Information */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Informasi PIC</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nama PIC *
                    </label>
                    <input
                      type="text"
                      value={formData.namaPIC}
                      onChange={(e) => handleFormDataChange('namaPIC', e.target.value)}
                      placeholder="Nama person in charge"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Posisi PIC *
                    </label>
                    <input
                      type="text"
                      value={formData.posisiPIC}
                      onChange={(e) => handleFormDataChange('posisiPIC', e.target.value)}
                      placeholder="Jabatan atau posisi"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      WhatsApp PIC *
                    </label>
                    <input
                      type="text"
                      value={formData.waPIC}
                      onChange={(e) => handleFormDataChange('waPIC', e.target.value)}
                      placeholder="Contoh: +628123456789"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Catatan</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Catatan Lead
                    </label>
                    <textarea
                      value={formData.catatan}
                      onChange={(e) => handleFormDataChange('catatan', e.target.value)}
                      placeholder="Masukkan catatan tentang lead ini..."
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={4}
                    />
                  </div>
                  
                  {/* Quick Note Templates */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Template Catatan Cepat
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {quickNoteTemplates.map((template, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => addQuickNote(template)}
                          className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
                        >
                          {template.substring(0, 30)}...
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>



              {/* History Log */}
              {historyLogs.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900 border-b pb-2 flex-1">Riwayat Perubahan</h2>
                    <button
                      type="button"
                      onClick={() => setShowHistory(!showHistory)}
                      className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      <History className="w-4 h-4" />
                      {showHistory ? 'Sembunyikan' : 'Tampilkan'}
                    </button>
                  </div>
                  {showHistory && (
                    <div className="bg-gray-50 rounded-lg p-4 max-h-40 overflow-y-auto">
                      {historyLogs.map((log) => (
                        <div key={log.id} className="text-sm text-gray-600 mb-2 last:mb-0">
                          <span className="font-medium">{new Date(log.timestamp).toLocaleString()}</span>
                          {' - '}
                          <span className="text-blue-600">{log.action}</span>
                          {' - '}
                          {log.details}
                          <span className="text-gray-500"> ({log.user})</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </form>
          </div>

          {/* Sticky Submit Button */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end gap-3 shadow-lg">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors duration-200"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!isFormValid}
              className={`px-6 py-2 rounded-md transition-all duration-200 shadow-md ${
                isFormValid 
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800' 
                  : 'bg-gray-400 text-gray-200 cursor-not-allowed'
              }`}
            >
              <Save className="w-4 h-4 inline mr-2" />
              Tambah Lead
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
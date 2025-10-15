'use client'

import React, { useState, useMemo } from 'react'
import { 
  X, 
  Save, 
  Building2, 
  Clock, 
  Package, 
  Users, 
  FileText, 
  Plus,
  Minus,
  CheckCircle2
} from 'lucide-react'

// Interfaces
interface FollowUp {
  date: string
  note: string
  status: string
}

interface PICInfo {
  nama: string
  posisi: string
  whatsapp: string
}

interface FormData {
  namaFaskes: string
  kota: string
  noKontakFaskes: string
  tanggalHubungiAwal: string
  followUp: FollowUp[]
  produkPilihan: string[]
  statusAkhir: string
  pic: PICInfo
  catatan: string
  reminder: string
}

interface ValidationErrors {
  [key: string]: string
}

interface OutboundLeadFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: any) => void
}

export default function OutboundLeadForm({ isOpen, onClose, onSubmit }: OutboundLeadFormProps) {
  const [formData, setFormData] = useState<FormData>({
    namaFaskes: '',
    kota: '',
    noKontakFaskes: '',
    tanggalHubungiAwal: '',
    followUp: [{ date: '', note: '', status: '' }],
    produkPilihan: [],
    statusAkhir: '',
    pic: { nama: '', posisi: '', whatsapp: '' },
    catatan: '',
    reminder: ''
  })

  // Available products
  const availableProducts = [
    'SIMRS Basic',
    'SIMRS Advanced', 
    'Laboratory Information System',
    'Radiology Information System',
    'Pharmacy Management System',
    'Electronic Medical Records'
  ]

  // Status options
  const statusOptions = [
    { value: 'interested', label: 'Interested' },
    { value: 'not-interested', label: 'Not Interested' },
    { value: 'follow-up', label: 'Follow Up' },
    { value: 'closed', label: 'Closed' },
    { value: 'converted', label: 'Converted' }
  ]

  // Cities
  const cities = [
    'Jakarta', 'Surabaya', 'Bandung', 'Medan', 'Semarang', 
    'Makassar', 'Palembang', 'Tangerang', 'Depok', 'Bekasi'
  ]

  // Form validation with useMemo to prevent infinite re-renders
  const validateForm = useMemo(() => {
    const errors: ValidationErrors = {}

    if (!formData.namaFaskes.trim()) {
      errors.namaFaskes = 'Nama Faskes wajib diisi'
    }
    if (!formData.kota.trim()) {
      errors.kota = 'Kota wajib diisi'
    }
    if (!formData.noKontakFaskes.trim()) {
      errors.noKontakFaskes = 'No Kontak wajib diisi'
    }
    if (!formData.tanggalHubungiAwal) {
      errors.tanggalHubungiAwal = 'Tanggal wajib diisi'
    }
    if (!formData.statusAkhir) {
      errors.statusAkhir = 'Status wajib dipilih'
    }
    if (!formData.pic.nama.trim()) {
      errors.picNama = 'Nama PIC wajib diisi'
    }

    return errors
  }, [formData])

  const isFormValid = Object.keys(validateForm).length === 0

  // Handlers
  const handleProductToggle = (product: string) => {
    setFormData(prev => ({
      ...prev,
      produkPilihan: prev.produkPilihan.includes(product)
        ? prev.produkPilihan.filter(p => p !== product)
        : [...prev.produkPilihan, product]
    }))
  }

  const addFollowUp = () => {
    setFormData(prev => ({
      ...prev,
      followUp: [...prev.followUp, { date: '', note: '', status: '' }]
    }))
  }

  const removeFollowUp = (index: number) => {
    setFormData(prev => ({
      ...prev,
      followUp: prev.followUp.filter((_, i) => i !== index)
    }))
  }

  const updateFollowUp = (index: number, field: keyof FollowUp, value: string) => {
    setFormData(prev => ({
      ...prev,
      followUp: prev.followUp.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isFormValid) {
      onSubmit(formData)
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        
        {/* Success Preview */}
        {Object.keys(validateForm).length === 0 && formData.namaFaskes && formData.kota && formData.noKontakFaskes ? (
          <div className="p-6 bg-green-50 border-l-4 border-green-500 m-6 rounded-lg shadow-md">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <CheckCircle2 className="h-5 w-5 text-green-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">Form siap untuk disimpan</h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>Semua field wajib sudah terisi dengan benar.</p>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        <div className="flex-1 overflow-y-auto">
          <div className="p-6 max-w-6xl mx-auto">
            
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Form Tambah Outbound Lead</h1>
                  <p className="text-gray-600 mt-1">Lengkapi informasi outbound lead baru dengan detail yang akurat</p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Validation Alert */}
            {Object.keys(validateForm).length > 0 && (
              <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg shadow-md">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Form belum lengkap</h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>Field berikut wajib diisi: <span className="font-semibold">{Object.values(validateForm).join(', ')}</span></p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white shadow rounded-lg p-6">

              <form onSubmit={handleSubmit} className="space-y-8">
                
                {/* Basic Information Section */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Informasi Faskes</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nama Faskes <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.namaFaskes}
                        onChange={(e) => setFormData(prev => ({ ...prev, namaFaskes: e.target.value }))}
                        placeholder="Contoh: RS Husada Jakarta"
                        className={`w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          validateForm.namaFaskes ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                        }`}
                      />
                      {validateForm.namaFaskes && <p className="text-xs text-red-500 mt-1">{validateForm.namaFaskes}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Kota <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.kota}
                        onChange={(e) => setFormData(prev => ({ ...prev, kota: e.target.value }))}
                        className={`w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          validateForm.kota ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                        }`}
                      >
                        <option value="">Pilih Kota</option>
                        {cities.map(city => (
                          <option key={city} value={city}>{city}</option>
                        ))}
                      </select>
                      {validateForm.kota && <p className="text-xs text-red-500 mt-1">{validateForm.kota}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        No Kontak Faskes <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        value={formData.noKontakFaskes}
                        onChange={(e) => setFormData(prev => ({ ...prev, noKontakFaskes: e.target.value }))}
                        placeholder="Contoh: 021-123456"
                        className={`w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          validateForm.noKontakFaskes ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                        }`}
                      />
                      {validateForm.noKontakFaskes && <p className="text-xs text-red-500 mt-1">{validateForm.noKontakFaskes}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tanggal Hubungi Awal <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={formData.tanggalHubungiAwal}
                        onChange={(e) => setFormData(prev => ({ ...prev, tanggalHubungiAwal: e.target.value }))}
                        className={`w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          validateForm.tanggalHubungiAwal ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                        }`}
                      />
                      {validateForm.tanggalHubungiAwal && <p className="text-xs text-red-500 mt-1">{validateForm.tanggalHubungiAwal}</p>}
                    </div>
                  </div>
                </div>

                {/* Follow Up Section */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Follow Up Timeline</h2>
                  <div className="space-y-4">
                    {formData.followUp.map((followUp, index) => (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end p-4 bg-gray-50 rounded-md">
                        <div className="md:col-span-3">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tanggal Follow Up
                          </label>
                          <input
                            type="date"
                            value={followUp.date}
                            onChange={(e) => updateFollowUp(index, 'date', e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                                              <div className="md:col-span-5">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Catatan Follow Up
                          </label>
                          <input
                            type="text"
                            value={followUp.note}
                            onChange={(e) => updateFollowUp(index, 'note', e.target.value)}
                            placeholder="Catatan follow up..."
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div className="md:col-span-3">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Status
                          </label>
                          <select
                            value={followUp.status}
                            onChange={(e) => updateFollowUp(index, 'status', e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="">Pilih Status</option>
                            {statusOptions.map(status => (
                              <option key={status.value} value={status.value}>{status.label}</option>
                            ))}
                          </select>
                        </div>
                      <div className="md:col-span-1">
                        {formData.followUp.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeFollowUp(index)}
                            className="p-2 text-red-600 hover:text-red-800 focus:outline-none"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addFollowUp}
                        className="mt-4 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Tambah Follow Up
                      </button>
                    </div>
                </div>                {/* Products Section */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Produk Pilihan</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {availableProducts.map(product => (
                      <label
                        key={product}
                        className="flex items-center p-4 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50"
                      >
                        <input
                          type="checkbox"
                          checked={formData.produkPilihan.includes(product)}
                          onChange={() => handleProductToggle(product)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-3 text-sm text-gray-700">{product}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Status Section */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Status Akhir</h2>
                  <select
                    value={formData.statusAkhir}
                    onChange={(e) => setFormData(prev => ({ ...prev, statusAkhir: e.target.value }))}
                    className={`w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      validateForm.statusAkhir ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                    }`}
                  >
                    <option value="">Pilih Status</option>
                    {statusOptions.map(status => (
                      <option key={status.value} value={status.value}>{status.label}</option>
                    ))}
                  </select>
                  {validateForm.statusAkhir && <p className="text-xs text-red-500 mt-1">{validateForm.statusAkhir}</p>}
                </div>

                {/* PIC Section */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Informasi PIC</h2>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nama PIC <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.pic.nama}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          pic: { ...prev.pic, nama: e.target.value }
                        }))}
                        placeholder="Nama lengkap PIC"
                        className={`w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          validateForm.picNama ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                        }`}
                      />
                      {validateForm.picNama && <p className="text-xs text-red-500 mt-1">{validateForm.picNama}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Posisi PIC
                      </label>
                      <input
                        type="text"
                        value={formData.pic.posisi}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          pic: { ...prev.pic, posisi: e.target.value }
                        }))}
                        placeholder="Posisi/jabatan PIC"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        WhatsApp PIC
                      </label>
                      <input
                        type="tel"
                        value={formData.pic.whatsapp}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          pic: { ...prev.pic, whatsapp: e.target.value }
                        }))}
                        placeholder="08xxxxxxxxxx"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Informasi Tambahan</h2>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Catatan
                      </label>
                      <textarea
                        value={formData.catatan}
                        onChange={(e) => setFormData(prev => ({ ...prev, catatan: e.target.value }))}
                        placeholder="Catatan tambahan..."
                        rows={4}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">Catatan khusus untuk lead ini</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Reminder
                      </label>
                      <input
                        type="datetime-local"
                        value={formData.reminder}
                        onChange={(e) => setFormData(prev => ({ ...prev, reminder: e.target.value }))}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">Atur pengingat untuk follow up berikutnya</p>
                    </div>
                  </div>
                </div>
              </form>

              {/* Sticky Submit Button */}
              <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end gap-4 shadow-lg">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!isFormValid}
              className={`px-8 py-2 text-sm font-medium text-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 inline-flex items-center transition-all duration-200 ${
                isFormValid 
                  ? 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg' 
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              <Save className="w-4 h-4 mr-2" />
              Simpan Lead
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
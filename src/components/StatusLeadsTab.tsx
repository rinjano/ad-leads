'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { PlusCircle, Search, Flag, Edit3, Trash2 } from 'lucide-react'
import { useStatusLeads, useCreateStatusLeads, useUpdateStatusLeads, useDeleteStatusLeads } from '@/hooks/useStatusLeads'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { statusLeadsSchema, type StatusLeadsInput } from '@/lib/validations/status-leads'

export function StatusLeadsTab() {
  const [showModal, setShowModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingStatusLeads, setEditingStatusLeads] = useState<any>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [statusLeadsToDelete, setStatusLeadsToDelete] = useState<any>(null)

  // Fetch status leads data
  const { data: statusLeadsList = [], isLoading } = useStatusLeads()
  const createMutation = useCreateStatusLeads()
  const updateMutation = useUpdateStatusLeads()
  const deleteMutation = useDeleteStatusLeads()

  // Form for create
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<StatusLeadsInput>({
    resolver: zodResolver(statusLeadsSchema) as any,
  })

  // Form for edit
  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    reset: resetEdit,
    setValue: setValueEdit,
    formState: { errors: errorsEdit },
  } = useForm<StatusLeadsInput>({
    resolver: zodResolver(statusLeadsSchema) as any,
  })

  const filteredStatusLeads = statusLeadsList.filter((status: any) =>
    status.nama.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const openModal = () => {
    reset({
      nama: '',
    })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    reset()
  }

  const onSubmit = async (data: StatusLeadsInput) => {
    await createMutation.mutateAsync(data)
    closeModal()
  }

  const openEditModal = (statusLeads: any) => {
    setEditingStatusLeads(statusLeads)
    setValueEdit('nama', statusLeads.nama)
    setShowEditModal(true)
  }

  const closeEditModal = () => {
    setShowEditModal(false)
    setEditingStatusLeads(null)
    resetEdit()
  }

  const onEditSubmit = async (data: StatusLeadsInput) => {
    if (editingStatusLeads) {
      await updateMutation.mutateAsync({ id: editingStatusLeads.id, data })
      closeEditModal()
    }
  }

  const openDeleteModal = (statusLeads: any) => {
    setStatusLeadsToDelete(statusLeads)
    setShowDeleteModal(true)
  }

  const closeDeleteModal = () => {
    setShowDeleteModal(false)
    setStatusLeadsToDelete(null)
  }

  const handleDelete = async () => {
    if (statusLeadsToDelete) {
      await deleteMutation.mutateAsync(statusLeadsToDelete.id)
      closeDeleteModal()
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-slate-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Cari status leads..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-slate-50 border-slate-200 h-10 w-full focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
        </div>
        <Button
          className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white"
          onClick={openModal}
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Tambah Status Leads
        </Button>
      </div>

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/50" onClick={closeModal}>
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-6 text-gray-800">Tambah Status Leads Baru</h3>
            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Status Leads <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  placeholder="Masukkan nama status leads"
                  {...register('nama')}
                  className="border-gray-300 focus:border-blue-500"
                />
                {errors.nama && <p className="text-xs text-red-500 mt-1">{errors.nama.message}</p>}
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={closeModal}>
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white"
                >
                  {createMutation.isPending ? 'Menyimpan...' : 'Simpan'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingStatusLeads && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              closeEditModal()
            }
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 max-h-[90vh] overflow-auto">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-slate-200 p-6">
              <h3 className="text-xl font-bold text-slate-900 mb-1">Edit Status Leads</h3>
              <p className="text-sm text-slate-600">Perbarui informasi status leads</p>
            </div>
            <form onSubmit={handleSubmitEdit(onEditSubmit)} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Status Leads <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="Masukkan nama status leads"
                    {...registerEdit('nama')}
                    className="w-full border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                  {errorsEdit.nama && <p className="text-red-600 text-sm mt-1">{errorsEdit.nama.message}</p>}
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={closeEditModal}>
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white"
                >
                  {updateMutation.isPending ? 'Menyimpan...' : 'Simpan'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && statusLeadsToDelete && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              closeDeleteModal()
            }
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4">
            <div className="p-6 pb-4">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-slate-900">Konfirmasi Hapus Data</h2>
                  <p className="text-sm text-slate-600 mt-1">Tindakan ini tidak dapat dibatalkan</p>
                </div>
              </div>
            </div>
            <div className="px-6 pb-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-slate-900 mb-2">Apakah Anda yakin ingin menghapus status leads ini?</p>
                <div className="bg-white border border-red-200 rounded-lg p-3">
                  <p className="font-semibold text-slate-900">{statusLeadsToDelete.nama}</p>
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={closeDeleteModal}>
                  Batal
                </Button>
                <Button
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                  className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {deleteMutation.isPending ? 'Menghapus...' : 'Hapus Data'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white shadow-lg rounded-2xl border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Flag className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Data Status Leads</h3>
                <p className="text-sm text-slate-600">Kelola status perjalanan leads</p>
              </div>
            </div>
            <div className="text-sm text-slate-500">
              Total: <span className="font-medium text-slate-900">{filteredStatusLeads.length}</span> status leads
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                <TableHead className="py-4 px-6 text-left font-semibold text-slate-700">
                  <div className="flex items-center gap-2">
                    <Flag className="h-4 w-4 text-slate-500" />
                    <span>Nama Status</span>
                  </div>
                </TableHead>
                <TableHead className="py-4 px-6 text-left font-semibold text-slate-700">
                  Tanggal Dibuat
                </TableHead>
                <TableHead className="py-4 px-6 text-center font-semibold text-slate-700">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStatusLeads.length > 0 ? (
                filteredStatusLeads.map((statusLeads: any) => (
                  <TableRow key={statusLeads.id} className="hover:bg-slate-50 border-b border-slate-100">
                    <TableCell className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {statusLeads.nama.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{statusLeads.nama}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-6 text-slate-700">
                      {new Date(statusLeads.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </TableCell>
                    <TableCell className="py-4 px-6">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditModal(statusLeads)}
                          className="h-8 w-8 p-0 rounded-lg hover:bg-yellow-50 hover:text-yellow-600"
                          title="Edit Status Leads"
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDeleteModal(statusLeads)}
                          className="h-8 w-8 p-0 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-700"
                          title="Hapus Status Leads"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-500">
                      <div className="p-4 bg-slate-100 rounded-full mb-4">
                        <Flag className="h-8 w-8 text-slate-400" />
                      </div>
                      <p className="text-lg font-medium text-slate-600 mb-1">Tidak ada status leads ditemukan</p>
                      <p className="text-sm text-slate-500">Coba ubah kata kunci pencarian atau tambah status leads baru</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <Flag className="h-4 w-4" />
              <span>
                Menampilkan {filteredStatusLeads.length > 0 ? '1' : '0'} hingga {filteredStatusLeads.length} dari{' '}
                {filteredStatusLeads.length} status leads
              </span>
            </div>
            {filteredStatusLeads.length > 0 && (
              <div className="text-slate-500">Terakhir diperbarui: {new Date().toLocaleDateString('id-ID')}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

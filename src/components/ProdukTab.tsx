'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PlusCircle, Search, Package, Edit3, Trash2 } from 'lucide-react';
import { useProduk, useCreateProduk, useUpdateProduk, useDeleteProduk } from '@/hooks/useProduk';
import { useLayanan } from '@/hooks/useLayanan';

interface Produk {
  id: number;
  nama: string;
  deskripsi: string | null;
  layananId: number;
  layanan: {
    id: number;
    nama: string;
  };
  createdAt: string;
  updatedAt: string;
}

export function ProdukTab() {
  const { data: produkList = [], isLoading } = useProduk();
  const { data: layananList = [] } = useLayanan();
  const createProduk = useCreateProduk();
  const updateProduk = useUpdateProduk();
  const deleteProduk = useDeleteProduk();

  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProduk, setEditingProduk] = useState<Produk | null>(null);
  const [produkToDelete, setProdukToDelete] = useState<Produk | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    nama: '',
    deskripsi: '',
    layananId: 0,
  });

  const filteredProduk = useMemo(() => {
    return produkList.filter((produk) =>
      produk.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      produk.layanan.nama.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [produkList, searchTerm]);

  const handleOpenAddModal = () => {
    setFormData({
      nama: '',
      deskripsi: '',
      layananId: 0,
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (produk: Produk) => {
    setEditingProduk(produk);
    setFormData({
      nama: produk.nama,
      deskripsi: produk.deskripsi || '',
      layananId: produk.layananId,
    });
    setShowEditModal(true);
  };

  const handleOpenDeleteModal = (produk: Produk) => {
    setProdukToDelete(produk);
    setShowDeleteModal(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama || !formData.layananId) {
      return;
    }

    const submitData: any = {
      nama: formData.nama,
      layananId: formData.layananId,
    };

    if (formData.deskripsi) {
      submitData.deskripsi = formData.deskripsi;
    }

    await createProduk.mutateAsync(submitData);
    setShowModal(false);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduk || !formData.nama || !formData.layananId) {
      return;
    }

    const submitData: any = {
      nama: formData.nama,
      layananId: formData.layananId,
    };

    if (formData.deskripsi) {
      submitData.deskripsi = formData.deskripsi;
    }

    await updateProduk.mutateAsync({ id: editingProduk.id, data: submitData });
    setShowEditModal(false);
    setEditingProduk(null);
  };

  const handleDelete = async () => {
    if (!produkToDelete) return;
    await deleteProduk.mutateAsync(produkToDelete.id);
    setShowDeleteModal(false);
    setProdukToDelete(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-slate-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Cari produk atau layanan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-slate-50 border-slate-200 h-10 w-full focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
        </div>
        <Button
          className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white"
          onClick={handleOpenAddModal}
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Tambah Produk
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white shadow-lg rounded-2xl border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Package className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Data Produk</h3>
                <p className="text-sm text-slate-600">Kelola produk layanan</p>
              </div>
            </div>
            <div className="text-sm text-slate-500">
              Total: <span className="font-medium text-slate-900">{filteredProduk.length}</span> produk
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                <TableHead className="py-4 px-6 text-left font-semibold text-slate-700">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-slate-500" />
                    <span>Nama Produk</span>
                  </div>
                </TableHead>
                <TableHead className="py-4 px-6 text-left font-semibold text-slate-700">
                  Layanan
                </TableHead>
                <TableHead className="py-4 px-6 text-left font-semibold text-slate-700">
                  Deskripsi
                </TableHead>
                <TableHead className="py-4 px-6 text-left font-semibold text-slate-700">
                  Tanggal Dibuat
                </TableHead>
                <TableHead className="py-4 px-6 text-center font-semibold text-slate-700">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProduk.length > 0 ? (
                filteredProduk.map((produk) => (
                  <TableRow key={produk.id} className="hover:bg-slate-50 border-b border-slate-100">
                    <TableCell className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
                          {produk.nama.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{produk.nama}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-6">
                      <div className="text-slate-700">{produk.layanan.nama}</div>
                    </TableCell>
                    <TableCell className="py-4 px-6">
                      <div className="text-slate-600 text-sm max-w-xs truncate">
                        {produk.deskripsi || '-'}
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-6 text-slate-700">
                      {new Date(produk.createdAt).toLocaleDateString('id-ID', {
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
                          onClick={() => handleOpenEditModal(produk)}
                          className="h-8 w-8 p-0 rounded-lg hover:bg-yellow-50 hover:text-yellow-600"
                          title="Edit Produk"
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDeleteModal(produk)}
                          className="h-8 w-8 p-0 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-700"
                          title="Hapus Produk"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-500">
                      <div className="p-4 bg-slate-100 rounded-full mb-4">
                        <Package className="h-8 w-8 text-slate-400" />
                      </div>
                      <p className="text-lg font-medium text-slate-600 mb-1">Tidak ada produk ditemukan</p>
                      <p className="text-sm text-slate-500">Coba ubah kata kunci pencarian atau tambah produk baru</p>
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
              <Package className="h-4 w-4" />
              <span>
                Menampilkan {filteredProduk.length > 0 ? '1' : '0'} hingga {filteredProduk.length} dari{' '}
                {filteredProduk.length} produk
              </span>
            </div>
            {filteredProduk.length > 0 && (
              <div className="text-slate-500">Terakhir diperbarui: {new Date().toLocaleDateString('id-ID')}</div>
            )}
          </div>
        </div>
      </div>

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/50" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-6 text-gray-800">Tambah Produk Baru</h3>
            <form className="space-y-4" onSubmit={handleCreate} noValidate>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Layanan <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.layananId}
                  onChange={(e) => setFormData({ ...formData, layananId: parseInt(e.target.value) })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  required
                >
                  <option value={0}>Pilih layanan...</option>
                  {layananList.map((layanan) => (
                    <option key={layanan.id} value={layanan.id}>
                      {layanan.nama}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Nama Produk <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  placeholder="Masukkan nama produk"
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  className="border-gray-300 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Deskripsi
                </label>
                <textarea
                  placeholder="Masukkan deskripsi produk"
                  value={formData.deskripsi}
                  onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={createProduk.isPending}
                  className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white"
                >
                  {createProduk.isPending ? 'Menyimpan...' : 'Simpan'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingProduk && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowEditModal(false);
              setEditingProduk(null);
            }
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 max-h-[90vh] overflow-auto">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-slate-200 p-6">
              <h3 className="text-xl font-bold text-slate-900 mb-1">Edit Produk</h3>
              <p className="text-sm text-slate-600">Perbarui informasi produk</p>
            </div>
            <form onSubmit={handleUpdate} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Layanan <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.layananId}
                    onChange={(e) => setFormData({ ...formData, layananId: parseInt(e.target.value) })}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    required
                  >
                    <option value={0}>Pilih layanan...</option>
                    {layananList.map((layanan) => (
                      <option key={layanan.id} value={layanan.id}>
                        {layanan.nama}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Nama Produk <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="Masukkan nama produk"
                    value={formData.nama}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                    className="w-full border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Deskripsi
                  </label>
                  <textarea
                    placeholder="Masukkan deskripsi produk"
                    value={formData.deskripsi}
                    onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingProduk(null);
                  }}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={updateProduk.isPending}
                  className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white"
                >
                  {updateProduk.isPending ? 'Menyimpan...' : 'Simpan'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && produkToDelete && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowDeleteModal(false);
              setProdukToDelete(null);
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
                <p className="text-slate-900 mb-2">Apakah Anda yakin ingin menghapus produk ini?</p>
                <div className="bg-white border border-red-200 rounded-lg p-3">
                  <p className="font-semibold text-slate-900">{produkToDelete.nama}</p>
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setProdukToDelete(null);
                  }}
                >
                  Batal
                </Button>
                <Button
                  onClick={handleDelete}
                  disabled={deleteProduk.isPending}
                  className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {deleteProduk.isPending ? 'Menghapus...' : 'Hapus Data'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useMemo } from 'react';
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
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Data Produk
          </h2>
          <p className="text-slate-600 mt-1">Kelola data produk layanan</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          + Tambah Produk
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Cari produk atau layanan..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold">Nama Produk</th>
              <th className="px-6 py-4 text-left text-sm font-semibold">Layanan</th>
              <th className="px-6 py-4 text-left text-sm font-semibold">Deskripsi</th>
              <th className="px-6 py-4 text-left text-sm font-semibold">Tanggal Dibuat</th>
              <th className="px-6 py-4 text-left text-sm font-semibold">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredProduk.map((produk) => (
              <tr key={produk.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 text-sm text-slate-900 font-medium">{produk.nama}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{produk.layanan.nama}</td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {produk.deskripsi || '-'}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {new Date(produk.createdAt).toLocaleDateString('id-ID')}
                </td>
                <td className="px-6 py-4">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleOpenEditModal(produk)}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleOpenDeleteModal(produk)}
                      className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors text-sm"
                    >
                      Hapus
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Tambah Produk Baru
            </h3>
            <form onSubmit={handleCreate}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Layanan <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.layananId}
                  onChange={(e) => setFormData({ ...formData, layananId: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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

              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Nama Produk <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Masukkan nama produk"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Deskripsi
                </label>
                <textarea
                  value={formData.deskripsi}
                  onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Masukkan deskripsi produk"
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={createProduk.isPending}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50"
                >
                  {createProduk.isPending ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingProduk && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Edit Produk
            </h3>
            <form onSubmit={handleUpdate}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Layanan <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.layananId}
                  onChange={(e) => setFormData({ ...formData, layananId: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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

              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Nama Produk <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Masukkan nama produk"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Deskripsi
                </label>
                <textarea
                  value={formData.deskripsi}
                  onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Masukkan deskripsi produk"
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingProduk(null);
                  }}
                  className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={updateProduk.isPending}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50"
                >
                  {updateProduk.isPending ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && produkToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4 text-red-600">Konfirmasi Hapus</h3>
            <p className="text-slate-600 mb-6">
              Apakah Anda yakin ingin menghapus produk <strong>{produkToDelete.nama}</strong>?
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setProdukToDelete(null);
                }}
                className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteProduk.isPending}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {deleteProduk.isPending ? 'Menghapus...' : 'Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

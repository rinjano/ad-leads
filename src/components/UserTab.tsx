'use client';

import { useState, useMemo } from 'react';
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser } from '@/hooks/useUsers';
import { useKodeAds } from '@/hooks/useKodeAds';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  userKodeAds: {
    id: number;
    kodeAds: {
      id: number;
      kode: string;
      status: string;
    };
  }[];
}

export function UserTab() {
  const { data: users = [], isLoading } = useUsers();
  const { data: kodeAdsList = [] } = useKodeAds();
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();

  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: '',
    kodeAdsIds: [] as number[],
  });

  const filteredUsers = useMemo(() => {
    return users.filter((user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  const handleOpenAddModal = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: '',
      kodeAdsIds: [],
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      kodeAdsIds: user.userKodeAds.map((uk) => uk.kodeAds.id),
    });
    setShowEditModal(true);
  };

  const handleOpenDeleteModal = (user: User) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password || !formData.role) {
      return;
    }

    const submitData: any = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: formData.role,
    };

    if (formData.role === 'advertiser' && formData.kodeAdsIds.length > 0) {
      submitData.kodeAdsIds = formData.kodeAdsIds;
    }

    await createUser.mutateAsync(submitData);
    setShowModal(false);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser || !formData.name || !formData.email || !formData.role) {
      return;
    }

    const submitData: any = {
      name: formData.name,
      email: formData.email,
      role: formData.role,
    };

    if (formData.password) {
      submitData.password = formData.password;
    }

    if (formData.role === 'advertiser') {
      submitData.kodeAdsIds = formData.kodeAdsIds;
    } else {
      submitData.kodeAdsIds = [];
    }

    await updateUser.mutateAsync({ id: editingUser.id, data: submitData });
    setShowEditModal(false);
    setEditingUser(null);
  };

  const handleDelete = async () => {
    if (!userToDelete) return;
    await deleteUser.mutateAsync(userToDelete.id);
    setShowDeleteModal(false);
    setUserToDelete(null);
  };

  const handleKodeAdsToggle = (kodeAdsId: number) => {
    setFormData((prev) => {
      const isSelected = prev.kodeAdsIds.includes(kodeAdsId);
      return {
        ...prev,
        kodeAdsIds: isSelected
          ? prev.kodeAdsIds.filter((id) => id !== kodeAdsId)
          : [...prev.kodeAdsIds, kodeAdsId],
      };
    });
  };

  const getRoleBadgeColor = (role: string) => {
    const roleMap: Record<string, string> = {
      admin: 'bg-purple-100 text-purple-800',
      user: 'bg-blue-100 text-blue-800',
      cs_representative: 'bg-green-100 text-green-800',
      advertiser: 'bg-orange-100 text-orange-800',
      cs_support: 'bg-cyan-100 text-cyan-800',
      retention_specialist: 'bg-pink-100 text-pink-800',
    };
    return roleMap[role] || 'bg-gray-100 text-gray-800';
  };

  const getRoleLabel = (role: string) => {
    const roleLabels: Record<string, string> = {
      admin: 'Super Admin',
      user: 'User',
      cs_representative: 'CS Representative',
      advertiser: 'Advertiser',
      cs_support: 'CS Support',
      retention_specialist: 'Retention',
    };
    return roleLabels[role] || role;
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
            User Management
          </h2>
          <p className="text-slate-600 mt-1">Kelola data user sistem</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          + Tambah User Baru
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Cari user..."
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
              <th className="px-6 py-4 text-left text-sm font-semibold">Nama Lengkap</th>
              <th className="px-6 py-4 text-left text-sm font-semibold">E-mail</th>
              <th className="px-6 py-4 text-left text-sm font-semibold">Role</th>
              <th className="px-6 py-4 text-left text-sm font-semibold">Kode Ads</th>
              <th className="px-6 py-4 text-left text-sm font-semibold">Tanggal Dibuat</th>
              <th className="px-6 py-4 text-left text-sm font-semibold">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 text-sm text-slate-900">{user.name}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{user.email}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                    {getRoleLabel(user.role)}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {user.role === 'advertiser' && user.userKodeAds.length > 0
                    ? user.userKodeAds.map((uk) => uk.kodeAds.kode).join(', ')
                    : '-'}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {new Date(user.createdAt).toLocaleDateString('id-ID')}
                </td>
                <td className="px-6 py-4">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleOpenEditModal(user)}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleOpenDeleteModal(user)}
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
              Tambah User Baru
            </h3>
            <form onSubmit={handleCreate}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Masukkan nama lengkap"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  E-mail
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Masukkan e-mail"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Masukkan password"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value, kodeAdsIds: [] })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Pilih Role</option>
                  <option value="admin">Super Admin</option>
                  <option value="cs_support">CS Support</option>
                  <option value="cs_representative">CS Representative</option>
                  <option value="advertiser">Advertiser</option>
                  <option value="retention_specialist">Retention</option>
                </select>
              </div>

              {formData.role === 'advertiser' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Kode Ads
                  </label>
                  <div className="border border-slate-300 rounded-lg p-3 max-h-48 overflow-y-auto">
                    {kodeAdsList.length === 0 ? (
                      <p className="text-sm text-slate-500">Tidak ada kode ads tersedia</p>
                    ) : (
                      kodeAdsList
                        .filter((ka) => ka.status === 'aktif')
                        .map((kodeAds) => (
                          <label key={kodeAds.id} className="flex items-center mb-2 cursor-pointer hover:bg-slate-50 p-2 rounded">
                            <input
                              type="checkbox"
                              checked={formData.kodeAdsIds.includes(kodeAds.id)}
                              onChange={() => handleKodeAdsToggle(kodeAds.id)}
                              className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                            />
                            <span className="text-sm text-slate-700">{kodeAds.kode}</span>
                          </label>
                        ))
                    )}
                  </div>
                </div>
              )}

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
                  disabled={createUser.isPending}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50"
                >
                  {createUser.isPending ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Edit User
            </h3>
            <form onSubmit={handleUpdate}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Masukkan nama lengkap"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  E-mail
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Masukkan e-mail"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Password (kosongkan jika tidak ingin mengubah)
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Masukkan password baru"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => {
                    const newRole = e.target.value;
                    setFormData({ 
                      ...formData, 
                      role: newRole,
                      kodeAdsIds: newRole === 'advertiser' ? formData.kodeAdsIds : []
                    });
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Pilih Role</option>
                  <option value="admin">Super Admin</option>
                  <option value="cs_support">CS Support</option>
                  <option value="cs_representative">CS Representative</option>
                  <option value="advertiser">Advertiser</option>
                  <option value="retention_specialist">Retention</option>
                </select>
              </div>

              {formData.role === 'advertiser' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Kode Ads
                  </label>
                  <div className="border border-slate-300 rounded-lg p-3 max-h-48 overflow-y-auto">
                    {kodeAdsList.length === 0 ? (
                      <p className="text-sm text-slate-500">Tidak ada kode ads tersedia</p>
                    ) : (
                      kodeAdsList
                        .filter((ka) => ka.status === 'aktif')
                        .map((kodeAds) => (
                          <label key={kodeAds.id} className="flex items-center mb-2 cursor-pointer hover:bg-slate-50 p-2 rounded">
                            <input
                              type="checkbox"
                              checked={formData.kodeAdsIds.includes(kodeAds.id)}
                              onChange={() => handleKodeAdsToggle(kodeAds.id)}
                              className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                            />
                            <span className="text-sm text-slate-700">{kodeAds.kode}</span>
                          </label>
                        ))
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingUser(null);
                  }}
                  className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={updateUser.isPending}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50"
                >
                  {updateUser.isPending ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && userToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4 text-red-600">Konfirmasi Hapus</h3>
            <p className="text-slate-600 mb-6">
              Apakah Anda yakin ingin menghapus user <strong>{userToDelete.name}</strong>?
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setUserToDelete(null);
                }}
                className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteUser.isPending}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {deleteUser.isPending ? 'Menghapus...' : 'Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

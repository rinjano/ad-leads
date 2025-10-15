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
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Search, Users, Edit3, Trash2 } from 'lucide-react';
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
            placeholder="Cari user..."
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
          Tambah User
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white shadow-lg rounded-2xl border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Data User</h3>
                <p className="text-sm text-slate-600">Kelola user sistem</p>
              </div>
            </div>
            <div className="text-sm text-slate-500">
              Total: <span className="font-medium text-slate-900">{filteredUsers.length}</span> user
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                <TableHead className="py-4 px-6 text-left font-semibold text-slate-700">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-slate-500" />
                    <span>Nama Lengkap</span>
                  </div>
                </TableHead>
                <TableHead className="py-4 px-6 text-left font-semibold text-slate-700">
                  E-mail
                </TableHead>
                <TableHead className="py-4 px-6 text-left font-semibold text-slate-700">
                  Role
                </TableHead>
                <TableHead className="py-4 px-6 text-left font-semibold text-slate-700">
                  Kode Ads
                </TableHead>
                <TableHead className="py-4 px-6 text-left font-semibold text-slate-700">
                  Tanggal Dibuat
                </TableHead>
                <TableHead className="py-4 px-6 text-center font-semibold text-slate-700">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <TableRow key={user.id} className="hover:bg-slate-50 border-b border-slate-100">
                    <TableCell className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
                          {user.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{user.name}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-6">
                      <div className="text-slate-700">{user.email}</div>
                    </TableCell>
                    <TableCell className="py-4 px-6">
                      <Badge className={getRoleBadgeColor(user.role)}>
                        {getRoleLabel(user.role)}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-4 px-6">
                      <div className="text-slate-600 text-sm">
                        {user.role === 'advertiser' && user.userKodeAds.length > 0
                          ? user.userKodeAds.map((uk) => uk.kodeAds.kode).join(', ')
                          : '-'}
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-6 text-slate-700">
                      {new Date(user.createdAt).toLocaleDateString('id-ID', {
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
                          onClick={() => handleOpenEditModal(user)}
                          className="h-8 w-8 p-0 rounded-lg hover:bg-yellow-50 hover:text-yellow-600"
                          title="Edit User"
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDeleteModal(user)}
                          className="h-8 w-8 p-0 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-700"
                          title="Hapus User"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-500">
                      <div className="p-4 bg-slate-100 rounded-full mb-4">
                        <Users className="h-8 w-8 text-slate-400" />
                      </div>
                      <p className="text-lg font-medium text-slate-600 mb-1">Tidak ada user ditemukan</p>
                      <p className="text-sm text-slate-500">Coba ubah kata kunci pencarian atau tambah user baru</p>
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
              <Users className="h-4 w-4" />
              <span>
                Menampilkan {filteredUsers.length > 0 ? '1' : '0'} hingga {filteredUsers.length} dari{' '}
                {filteredUsers.length} user
              </span>
            </div>
            {filteredUsers.length > 0 && (
              <div className="text-slate-500">Terakhir diperbarui: {new Date().toLocaleDateString('id-ID')}</div>
            )}
          </div>
        </div>
      </div>

      {/* Add Modal */}
      {showModal && (
        <div 
          className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowModal(false)}
        >
          <div 
            className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-xl font-bold text-slate-900 mb-1">Tambah User Baru</h3>
              <p className="text-sm text-slate-600">Lengkapi informasi user di bawah ini</p>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Nama Lengkap
                </label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Masukkan nama lengkap"
                  className="w-full"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  E-mail
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Masukkan e-mail"
                  className="w-full"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Password
                </label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Masukkan password"
                  className="w-full"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value, kodeAdsIds: [] })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
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
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Kode Ads <span className="text-slate-500 font-normal">(pilih satu atau lebih)</span>
                  </label>
                  <div className="border border-slate-300 rounded-lg p-3 max-h-48 overflow-y-auto bg-slate-50">
                    {kodeAdsList.length === 0 ? (
                      <p className="text-sm text-slate-500 text-center py-2">Tidak ada kode ads tersedia</p>
                    ) : (
                      kodeAdsList
                        .filter((ka) => ka.status === 'aktif')
                        .map((kodeAds) => (
                          <label 
                            key={kodeAds.id} 
                            className="flex items-center mb-2 last:mb-0 cursor-pointer hover:bg-white p-2 rounded transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={formData.kodeAdsIds.includes(kodeAds.id)}
                              onChange={() => handleKodeAdsToggle(kodeAds.id)}
                              className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                            />
                            <span className="text-sm text-slate-700 font-medium">{kodeAds.kode}</span>
                          </label>
                        ))
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowModal(false)}
                  className="px-4"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={createUser.isPending}
                  className="px-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white"
                >
                  {createUser.isPending ? 'Menyimpan...' : 'Simpan'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingUser && (
        <div 
          className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => {
            setShowEditModal(false);
            setEditingUser(null);
          }}
        >
          <div 
            className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-slate-200 p-6">
              <h3 className="text-xl font-bold text-slate-900 mb-1">Edit User</h3>
              <p className="text-sm text-slate-600">Perbarui informasi user</p>
            </div>

            <form onSubmit={handleUpdate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Nama Lengkap
                </label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Masukkan nama lengkap"
                  className="w-full"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  E-mail
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Masukkan e-mail"
                  className="w-full"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Password <span className="text-slate-500 font-normal">(kosongkan jika tidak ingin mengubah)</span>
                </label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Masukkan password baru"
                  className="w-full"
                />
              </div>

              <div>
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
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
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
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Kode Ads <span className="text-slate-500 font-normal">(pilih satu atau lebih)</span>
                  </label>
                  <div className="border border-slate-300 rounded-lg p-3 max-h-48 overflow-y-auto bg-slate-50">
                    {kodeAdsList.length === 0 ? (
                      <p className="text-sm text-slate-500 text-center py-2">Tidak ada kode ads tersedia</p>
                    ) : (
                      kodeAdsList
                        .filter((ka) => ka.status === 'aktif')
                        .map((kodeAds) => (
                          <label 
                            key={kodeAds.id} 
                            className="flex items-center mb-2 last:mb-0 cursor-pointer hover:bg-white p-2 rounded transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={formData.kodeAdsIds.includes(kodeAds.id)}
                              onChange={() => handleKodeAdsToggle(kodeAds.id)}
                              className="mr-3 h-4 w-4 text-green-600 focus:ring-green-500 border-slate-300 rounded"
                            />
                            <span className="text-sm text-slate-700 font-medium">{kodeAds.kode}</span>
                          </label>
                        ))
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingUser(null);
                  }}
                  className="px-4"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={updateUser.isPending}
                  className="px-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                >
                  {updateUser.isPending ? 'Menyimpan...' : 'Simpan'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && userToDelete && (
        <div 
          className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => {
            setShowDeleteModal(false);
            setUserToDelete(null);
          }}
        >
          <div 
            className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center text-center mb-6">
              <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Konfirmasi Hapus User</h3>
              <p className="text-slate-600">
                Apakah Anda yakin ingin menghapus user ini? Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                  {userToDelete.name.substring(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 truncate">{userToDelete.name}</p>
                  <p className="text-sm text-slate-600 truncate">{userToDelete.email}</p>
                  <div className="mt-1">
                    <Badge className={getRoleBadgeColor(userToDelete.role)}>
                      {getRoleLabel(userToDelete.role)}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowDeleteModal(false);
                  setUserToDelete(null);
                }}
                className="flex-1"
              >
                Batal
              </Button>
              <Button
                onClick={handleDelete}
                disabled={deleteUser.isPending}
                className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {deleteUser.isPending ? 'Menghapus...' : 'Hapus'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

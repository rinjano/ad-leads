import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

interface Layanan {
  id: number;
  nama: string;
}

export interface Produk {
  id: number;
  nama: string;
  deskripsi: string | null;
  layananId: number;
  layanan: Layanan;
  createdAt: string;
  updatedAt: string;
}

export interface ProdukInput {
  nama: string;
  deskripsi?: string;
  layananId: number;
}

// Fetch all produk
export function useProduk() {
  return useQuery<Produk[]>({
    queryKey: ['produk'],
    queryFn: async () => {
      const response = await fetch('/api/produk');
      if (!response.ok) {
        throw new Error('Gagal mengambil data produk');
      }
      return response.json();
    },
    staleTime: 1000 * 60, // 1 minute
  });
}

// Create produk
export function useCreateProduk() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ProdukInput) => {
      const response = await fetch('/api/produk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Gagal menambahkan produk');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['produk'] });
      toast.success('Produk berhasil ditambahkan');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal menambahkan produk');
    },
  });
}

// Update produk
export function useUpdateProduk() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: ProdukInput }) => {
      const response = await fetch(`/api/produk/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Gagal memperbarui produk');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['produk'] });
      toast.success('Produk berhasil diperbarui');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal memperbarui produk');
    },
  });
}

// Delete produk
export function useDeleteProduk() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/produk/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Gagal menghapus produk');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['produk'] });
      toast.success('Produk berhasil dihapus');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal menghapus produk');
    },
  });
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Types
interface KonversiCustomer {
  id?: number;
  prospekId: number;
  tanggalKonversi: string;
  totalNilaiTransaksi: number;
  keterangan?: string;
  items: KonversiCustomerItem[];
}

interface KonversiCustomerItem {
  layananId: number;
  produkId: number;
  nilaiTransaksi: number;
  durasiLangganan: number;
  tipeDurasi: string;
}

// Fetch all konversi customer
export const useKonversiCustomer = () => {
  return useQuery({
    queryKey: ['konversi-customer'],
    queryFn: async () => {
      const response = await fetch('/api/konversi-customer');
      if (!response.ok) {
        throw new Error('Failed to fetch konversi customer');
      }
      return response.json();
    },
    staleTime: 1000 * 60, // 1 minute
  });
};

// Fetch konversi customer by prospek ID
export const useKonversiByProspekId = (prospekId: number | undefined | null) => {
  return useQuery({
    queryKey: ['konversi-customer', prospekId],
    queryFn: async () => {
      if (!prospekId) return [];
      const response = await fetch(`/api/konversi-customer?prospekId=${prospekId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch konversi customer');
      }
      const data = await response.json();
      return data; // Returns array
    },
    enabled: !!prospekId,
    staleTime: 1000 * 60,
  });
};

// Fetch single konversi customer by ID
export const useKonversiCustomerById = (id: number) => {
  return useQuery({
    queryKey: ['konversi-customer', id],
    queryFn: async () => {
      const response = await fetch(`/api/konversi-customer/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch konversi customer');
      }
      return response.json();
    },
    enabled: !!id,
    staleTime: 1000 * 60,
  });
};

// Create konversi customer
export const useCreateKonversi = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: KonversiCustomer) => {
      const response = await fetch('/api/konversi-customer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create konversi customer');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['konversi-customer'] });
      queryClient.invalidateQueries({ queryKey: ['prospek'] });
    },
  });
};

// Update konversi customer
export const useUpdateKonversi = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: KonversiCustomer }) => {
      const response = await fetch(`/api/konversi-customer/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update konversi customer');
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['konversi-customer'] });
      queryClient.invalidateQueries({ queryKey: ['konversi-customer', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['prospek'] });
    },
  });
};

// Delete konversi customer
export const useDeleteKonversi = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/konversi-customer/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete konversi customer');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['konversi-customer'] });
      queryClient.invalidateQueries({ queryKey: ['prospek'] });
    },
  });
};

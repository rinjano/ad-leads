import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Types
export interface Prospek {
  id?: number;
  tanggalProspek: string | Date;
  sumberLeads: string;
  kodeAds?: string | null;
  idAds?: string | null;
  namaProspek: string;
  noWhatsApp: string;
  email?: string | null;
  statusLeads: string;
  bukanLeads?: string | null;
  keteranganBukanLeads?: string | null;
  layananAssist: string;
  namaFaskes: string;
  tipeFaskes: string;
  provinsi: string;
  kota: string;
  picLeads: string;
  keterangan?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

// Fetch all prospek
export const useProspek = () => {
  return useQuery({
    queryKey: ['prospek'],
    queryFn: async () => {
      const response = await fetch('/api/prospek');
      if (!response.ok) {
        throw new Error('Failed to fetch prospek');
      }
      return response.json();
    },
    staleTime: 60000, // 1 minute
  });
};

// Fetch single prospek by ID
export const useProspekById = (id: number | null) => {
  return useQuery({
    queryKey: ['prospek', id],
    queryFn: async () => {
      if (!id) return null;
      const response = await fetch(`/api/prospek/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch prospek');
      }
      return response.json();
    },
    enabled: !!id,
    staleTime: 60000, // 1 minute
  });
};

// Create new prospek
export const useCreateProspek = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Prospek) => {
      const response = await fetch('/api/prospek', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create prospek');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch prospek list
      queryClient.invalidateQueries({ queryKey: ['prospek'] });
    },
  });
};

// Update prospek
export const useUpdateProspek = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Prospek }) => {
      const response = await fetch(`/api/prospek/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update prospek');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch prospek list
      queryClient.invalidateQueries({ queryKey: ['prospek'] });
    },
  });
};

// Delete prospek
export const useDeleteProspek = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/prospek/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete prospek');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch prospek list
      queryClient.invalidateQueries({ queryKey: ['prospek'] });
    },
  });
};

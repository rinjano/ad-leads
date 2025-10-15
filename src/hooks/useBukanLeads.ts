import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import type { BukanLeadsInput } from '@/lib/validations/bukan-leads'

// Fetch all bukan leads
export function useBukanLeads() {
  return useQuery({
    queryKey: ['bukan-leads'],
    queryFn: async () => {
      const response = await fetch('/api/bukan-leads')
      if (!response.ok) {
        throw new Error('Failed to fetch bukan leads')
      }
      return response.json()
    },
  })
}

// Create bukan leads
export function useCreateBukanLeads() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: BukanLeadsInput) => {
      const response = await fetch('/api/bukan-leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create bukan leads')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bukan-leads'] })
      toast.success('Kategori bukan leads berhasil ditambahkan')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal menambahkan kategori bukan leads')
    },
  })
}

// Update bukan leads
export function useUpdateBukanLeads() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: BukanLeadsInput }) => {
      const response = await fetch(`/api/bukan-leads/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update bukan leads')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bukan-leads'] })
      toast.success('Kategori bukan leads berhasil diperbarui')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal memperbarui kategori bukan leads')
    },
  })
}

// Delete bukan leads
export function useDeleteBukanLeads() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/bukan-leads/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete bukan leads')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bukan-leads'] })
      toast.success('Kategori bukan leads berhasil dihapus')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal menghapus kategori bukan leads')
    },
  })
}

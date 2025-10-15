import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import type { SumberLeadsInput } from '@/lib/validations/sumber-leads'

export interface SumberLeads {
  id: number
  nama: string
  deskripsi: string | null
  createdAt: string
  updatedAt: string
}

// Fetch all sumber leads
export function useSumberLeads() {
  return useQuery({
    queryKey: ['sumber-leads'],
    queryFn: async () => {
      const response = await fetch('/api/sumber-leads')
      if (!response.ok) {
        throw new Error('Failed to fetch sumber leads')
      }
      const data = await response.json()
      return data.data as SumberLeads[]
    },
  })
}

// Create sumber leads
export function useCreateSumberLeads() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: SumberLeadsInput) => {
      const response = await fetch('/api/sumber-leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Failed to create sumber leads')
      }

      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sumber-leads'] })
      toast.success('Sumber leads berhasil ditambahkan')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

// Update sumber leads
export function useUpdateSumberLeads() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: SumberLeadsInput }) => {
      const response = await fetch(`/api/sumber-leads/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Failed to update sumber leads')
      }

      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sumber-leads'] })
      toast.success('Sumber leads berhasil diperbarui')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

// Delete sumber leads
export function useDeleteSumberLeads() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/sumber-leads/${id}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Failed to delete sumber leads')
      }

      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sumber-leads'] })
      toast.success('Sumber leads berhasil dihapus')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

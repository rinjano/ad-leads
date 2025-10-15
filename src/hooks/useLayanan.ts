import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import type { LayananInput } from '@/lib/validations/layanan'

export interface Layanan {
  id: number
  nama: string
  createdAt: string
  updatedAt: string
}

// Fetch all layanan
export function useLayanan() {
  return useQuery({
    queryKey: ['layanan'],
    queryFn: async () => {
      const response = await fetch('/api/layanan')
      if (!response.ok) {
        throw new Error('Failed to fetch layanan')
      }
      const data = await response.json()
      return data.data as Layanan[]
    },
  })
}

// Create layanan
export function useCreateLayanan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: LayananInput) => {
      const response = await fetch('/api/layanan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Failed to create layanan')
      }

      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['layanan'] })
      toast.success('Layanan berhasil ditambahkan')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

// Update layanan
export function useUpdateLayanan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: LayananInput }) => {
      const response = await fetch(`/api/layanan/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Failed to update layanan')
      }

      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['layanan'] })
      toast.success('Layanan berhasil diperbarui')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

// Delete layanan
export function useDeleteLayanan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/layanan/${id}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Failed to delete layanan')
      }

      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['layanan'] })
      toast.success('Layanan berhasil dihapus')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import type { TipeFaskesInput } from '@/lib/validations/tipe-faskes'

export interface TipeFaskes {
  id: number
  nama: string
  deskripsi: string | null
  createdAt: string
  updatedAt: string
}

// Fetch all tipe faskes
export function useTipeFaskes() {
  return useQuery({
    queryKey: ['tipe-faskes'],
    queryFn: async () => {
      const response = await fetch('/api/tipe-faskes')
      if (!response.ok) {
        throw new Error('Failed to fetch tipe faskes')
      }
      const data = await response.json()
      return data.data as TipeFaskes[]
    },
  })
}

// Create tipe faskes
export function useCreateTipeFaskes() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: TipeFaskesInput) => {
      const response = await fetch('/api/tipe-faskes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Failed to create tipe faskes')
      }

      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tipe-faskes'] })
      toast.success('Tipe faskes berhasil ditambahkan')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

// Update tipe faskes
export function useUpdateTipeFaskes() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: TipeFaskesInput }) => {
      const response = await fetch(`/api/tipe-faskes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Failed to update tipe faskes')
      }

      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tipe-faskes'] })
      toast.success('Tipe faskes berhasil diperbarui')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

// Delete tipe faskes
export function useDeleteTipeFaskes() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/tipe-faskes/${id}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Failed to delete tipe faskes')
      }

      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tipe-faskes'] })
      toast.success('Tipe faskes berhasil dihapus')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

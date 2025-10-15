import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import type { KodeAdsInput } from '@/lib/validations/kode-ads'

export interface KodeAds {
  id: number
  kode: string
  status: string
  createdAt: string
  updatedAt: string
}

// Fetch all kode ads
export function useKodeAds() {
  return useQuery({
    queryKey: ['kode-ads'],
    queryFn: async () => {
      const response = await fetch('/api/kode-ads')
      if (!response.ok) {
        throw new Error('Failed to fetch kode ads')
      }
      const data = await response.json()
      return data.data as KodeAds[]
    },
  })
}

// Create kode ads
export function useCreateKodeAds() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: KodeAdsInput) => {
      const response = await fetch('/api/kode-ads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Failed to create kode ads')
      }

      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kode-ads'] })
      toast.success('Kode ads berhasil ditambahkan')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

// Update kode ads
export function useUpdateKodeAds() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: KodeAdsInput }) => {
      const response = await fetch(`/api/kode-ads/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Failed to update kode ads')
      }

      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kode-ads'] })
      toast.success('Kode ads berhasil diperbarui')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

// Delete kode ads
export function useDeleteKodeAds() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/kode-ads/${id}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Failed to delete kode ads')
      }

      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kode-ads'] })
      toast.success('Kode ads berhasil dihapus')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

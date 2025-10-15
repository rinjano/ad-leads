import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import type { StatusLeadsInput } from '@/lib/validations/status-leads'

// Fetch all status leads
export function useStatusLeads() {
  return useQuery({
    queryKey: ['status-leads'],
    queryFn: async () => {
      const response = await fetch('/api/status-leads')
      if (!response.ok) {
        throw new Error('Failed to fetch status leads')
      }
      return response.json()
    },
  })
}

// Create status leads
export function useCreateStatusLeads() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: StatusLeadsInput) => {
      const response = await fetch('/api/status-leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create status leads')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['status-leads'] })
      toast.success('Status leads berhasil ditambahkan')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal menambahkan status leads')
    },
  })
}

// Update status leads
export function useUpdateStatusLeads() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: StatusLeadsInput }) => {
      const response = await fetch(`/api/status-leads/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update status leads')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['status-leads'] })
      toast.success('Status leads berhasil diperbarui')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal memperbarui status leads')
    },
  })
}

// Delete status leads
export function useDeleteStatusLeads() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/status-leads/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete status leads')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['status-leads'] })
      toast.success('Status leads berhasil dihapus')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal menghapus status leads')
    },
  })
}

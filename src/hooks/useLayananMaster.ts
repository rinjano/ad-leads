import { useQuery } from '@tanstack/react-query'

export interface LayananMasterData {
  id: number
  nama: string
  createdAt: string
  updatedAt: string
}

interface LayananMasterResponse {
  success: boolean
  data: LayananMasterData[]
  message?: string
}

export function useLayananMaster() {
  return useQuery<LayananMasterResponse>({
    queryKey: ['layananMaster'],
    queryFn: async () => {
      const response = await fetch('/api/layanan')

      if (!response.ok) {
        throw new Error('Failed to fetch layanan master data')
      }

      return response.json()
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}
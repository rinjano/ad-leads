import { useQuery } from '@tanstack/react-query'

export interface SumberLeadsLaporanData {
  id: number
  name: string
  prospek: number
  leads: number
  customer: number
  totalNilaiLangganan: number
  ctr: number
  ctrCustomer: number
}

interface SumberLeadsLaporanResponse {
  success: boolean
  data: SumberLeadsLaporanData[]
  filter: string
  dateRange: {
    start: string | null
    end: string | null
  }
}

export function useSumberLeadsLaporan(
  filter: string = 'thismonth',
  startDate?: string,
  endDate?: string
) {
  return useQuery<SumberLeadsLaporanResponse>({
    queryKey: ['sumberLeadsLaporan', filter, startDate, endDate],
    queryFn: async () => {
      const params = new URLSearchParams({ filter })
      
      if (filter === 'custom' && startDate && endDate) {
        params.append('startDate', startDate)
        params.append('endDate', endDate)
      }

      const response = await fetch(`/api/laporan/sumber-leads?${params}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch sumber leads laporan data')
      }
      
      return response.json()
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

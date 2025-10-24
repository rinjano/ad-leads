import { useQuery } from '@tanstack/react-query'

export interface CsPerformanceData {
  name: string
  prospek: number
  leads: number
  ctr: number
  customer: number
  totalNilaiLangganan: number
}

interface CsPerformanceResponse {
  success: boolean
  data: CsPerformanceData[]
  filter: string
  dateRange: {
    start: string | null
    end: string | null
  }
}

export function useCsPerformance(
  filter: string = 'thismonth',
  startDate?: string,
  endDate?: string
) {
  return useQuery<CsPerformanceResponse>({
    queryKey: ['csPerformance', filter, startDate, endDate],
    queryFn: async () => {
      const params = new URLSearchParams({ filter })

      if (filter === 'custom' && startDate && endDate) {
        params.append('startDate', startDate)
        params.append('endDate', endDate)
      }

      const response = await fetch(`/api/laporan/cs-performance?${params}`)

      if (!response.ok) {
        throw new Error('Failed to fetch CS performance data')
      }

      return response.json()
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
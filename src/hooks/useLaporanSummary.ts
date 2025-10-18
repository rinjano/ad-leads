import { useQuery } from '@tanstack/react-query'

export interface LaporanSummaryData {
  totalProspek: number
  totalLeads: number
  ctrLeads: number
  totalSpam: number
}

interface LaporanSummaryResponse {
  success: boolean
  data: LaporanSummaryData
  filter: string
  dateRange: {
    start: string | null
    end: string | null
  }
}

export function useLaporanSummary(
  filter: string = 'thismonth',
  startDate?: string,
  endDate?: string
) {
  return useQuery<LaporanSummaryResponse>({
    queryKey: ['laporanSummary', filter, startDate, endDate],
    queryFn: async () => {
      const params = new URLSearchParams({ filter })
      
      if (filter === 'custom' && startDate && endDate) {
        params.append('startDate', startDate)
        params.append('endDate', endDate)
      }

      const response = await fetch(`/api/laporan/summary?${params}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch laporan summary data')
      }
      
      return response.json()
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

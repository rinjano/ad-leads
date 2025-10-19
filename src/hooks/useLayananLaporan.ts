import { useQuery } from '@tanstack/react-query'

export interface LayananLaporanData {
  id: number
  layanan: string
  prospek: number
  leads: number
  customer: number
  totalNilaiLangganan: number
  ctrLeads: number
  ctrCustomer: number
}

interface LayananLaporanResponse {
  success: boolean
  data: LayananLaporanData[]
  filter: string
  dateRange: {
    start: string | null
    end: string | null
  }
}

export function useLayananLaporan(
  filter: string = 'thismonth',
  startDate?: string,
  endDate?: string,
  provinsi?: string,
  sumber?: string
) {
  return useQuery<LayananLaporanResponse>({
    queryKey: ['layananLaporan', filter, startDate, endDate, provinsi, sumber],
    queryFn: async () => {
      const params = new URLSearchParams({ filter })
      
      if (filter === 'custom' && startDate && endDate) {
        params.append('startDate', startDate)
        params.append('endDate', endDate)
      }

      if (provinsi && provinsi !== 'null' && provinsi !== '') {
        params.append('provinsi', provinsi)
      }

      if (sumber && sumber !== 'null' && sumber !== '') {
        params.append('sumber', sumber)
      }

      const response = await fetch(`/api/laporan/layanan?${params}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch layanan laporan data')
      }
      
      return response.json()
    },
    // Force fresh data
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: 'always',
    refetchOnReconnect: 'always',
  })
}

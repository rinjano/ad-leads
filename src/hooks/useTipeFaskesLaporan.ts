import { useQuery } from '@tanstack/react-query'

export interface TipeFaskesLaporanData {
  label: string
  prospek: number
  leads: number
  customer: number
  totalNilaiLangganan: number
  ctrLeads: number
  ctrCustomer: number
}

interface TipeFaskesLaporanResponse {
  success: boolean
  data: TipeFaskesLaporanData[]
  filter: string
  dateRange: {
    start: string | null
    end: string | null
  }
}

export function useTipeFaskesLaporan(
  filter: string = 'thismonth',
  startDate?: string,
  endDate?: string,
  provinsi?: string,
  layanan?: string
) {
  return useQuery<TipeFaskesLaporanResponse>({
    queryKey: ['tipeFaskesLaporan', filter, startDate, endDate, provinsi, layanan],
    queryFn: async () => {
      const params = new URLSearchParams({ filter })
      
      if (filter === 'custom' && startDate && endDate) {
        params.append('startDate', startDate)
        params.append('endDate', endDate)
      }

      if (provinsi && provinsi !== 'null' && provinsi !== '') {
        params.append('provinsi', provinsi)
      }

      if (layanan && layanan !== 'null' && layanan !== '') {
        params.append('layanan', layanan)
      }

      const response = await fetch(`/api/laporan/tipe-faskes?${params}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch tipe faskes laporan data')
      }
      
      return response.json()
    },
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: 'always',
    refetchOnReconnect: 'always',
  })
}

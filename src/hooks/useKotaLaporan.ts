import { useQuery } from '@tanstack/react-query'

export interface KotaLaporanData {
  kota: string
  prospek: number
  leads: number
  customer: number
  totalNilaiLangganan: number
  ctrLeads: number
  ctrCustomer: number
}

interface KotaLaporanResponse {
  success: boolean
  data: KotaLaporanData[]
  filter: string
  dateRange: {
    start: string | null
    end: string | null
  }
}

export function useKotaLaporan(
  filter: string = 'thismonth',
  startDate?: string,
  endDate?: string,
  layanan?: string,
  sumber?: string
) {
  return useQuery<KotaLaporanResponse>({
    queryKey: ['kotaLaporan', filter, startDate, endDate, layanan, sumber],
    queryFn: async () => {
      const params = new URLSearchParams({ filter })
      
      if (filter === 'custom' && startDate && endDate) {
        params.append('startDate', startDate)
        params.append('endDate', endDate)
      }

      if (layanan && layanan !== 'null' && layanan !== '') {
        params.append('layanan', layanan)
      }

      if (sumber && sumber !== 'null' && sumber !== '') {
        params.append('sumber', sumber)
      }

      const response = await fetch(`/api/laporan/kota-kabupaten?${params}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch kota laporan data')
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

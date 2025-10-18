import { useQuery } from '@tanstack/react-query'

export interface IdAdsData {
  id: string
  prospek: number
  leads: number
  customer: number
  totalNilaiLangganan: number
  ctr: string
  ctrCustomer: string
}

export interface KodeAdsLaporanData {
  id: number
  kode: string
  prospek: number
  leads: number
  customer: number
  totalNilaiLangganan: number
  ctr: number
  ctrCustomer: number
  idAds: IdAdsData[]
}

interface KodeAdsLaporanResponse {
  success: boolean
  data: KodeAdsLaporanData[]
  filter: string
  dateRange: {
    start: string | null
    end: string | null
  }
}

export function useKodeAdsLaporan(
  filter: string = 'thismonth',
  startDate?: string,
  endDate?: string
) {
  return useQuery<KodeAdsLaporanResponse>({
    queryKey: ['kodeAdsLaporan', filter, startDate, endDate],
    queryFn: async () => {
      const params = new URLSearchParams({ filter })
      
      if (filter === 'custom' && startDate && endDate) {
        params.append('startDate', startDate)
        params.append('endDate', endDate)
      }

      const response = await fetch(`/api/laporan/kode-ads?${params}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch kode ads laporan data')
      }
      
      return response.json()
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

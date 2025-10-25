import { useQuery } from '@tanstack/react-query'

interface MonthlyAdsSpendData {
  month: string
  year: number
  kodeAds: string
  sumberLeads: string
  layanan: string
  prospek: number
  leads: number
  customer: number
  totalNilaiLangganan: number
  budgetSpent: number
  ctrLeads: number
  ctrCustomer: number
  costPerLead: number
}

export function useMonthlyAdsSpend(
  dateRange: string = 'thismonth',
  customStartDate?: string,
  customEndDate?: string,
  bypassDateFilter?: boolean
) {
  return useQuery({
    queryKey: ['monthly-ads-spend', dateRange, customStartDate, customEndDate, bypassDateFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        ...(bypassDateFilter ? { bypassDateFilter: 'true' } : {
          dateRange,
          ...(customStartDate && { customStartDate }),
          ...(customEndDate && { customEndDate })
        })
      })

      const response = await fetch(`/api/laporan/monthly-ads-spend?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch monthly ads spend data')
      }

      const result = await response.json()
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch data')
      }

      return result.data as MonthlyAdsSpendData[]
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}
import { useQuery } from '@tanstack/react-query';

// Interface untuk data LTV & Retensi
export interface CustomerLTVData {
  id: string
  name: string
  email: string
  phone: string
  subscriptions: SubscriptionData[]
  totalLTV: number
  totalDuration: number
  renewalCount: number
  firstSubscriptionDate: string | Date
  lastSubscriptionDate: string | Date
  overallStatus: 'active' | 'expired' | 'mixed'
}

export interface SubscriptionData {
  id: number
  konversiId: number
  serviceId: number
  serviceName: string
  productId: number
  productName: string
  transactionValue: number
  subscriptionDuration: number
  durationType: 'months' | 'years'
  conversionDate: string | Date
  startDate: string | Date
  endDate: string | Date
  status: 'active' | 'expired'
  isRenewal: boolean
  originalSubscriptionId?: string
}

// Hook to fetch LTV & Retensi data
export function useLTVRetensi() {
  return useQuery<CustomerLTVData[]>({
    queryKey: ['ltv-retensi'],
    queryFn: async () => {
      const response = await fetch('/api/ltv-retensi');
      if (!response.ok) {
        throw new Error('Failed to fetch LTV & Retensi data');
      }
      return response.json();
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
}

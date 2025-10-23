import { useQuery } from '@tanstack/react-query';

export interface AdsSpendItem {
  id: number;
  kodeAds: string;
  kodeAdsId: number;
  channel: string;
  sumberLeadsId: number;
  budget: number;
  budgetSpent: number;
  sisaBudget: number;
  prospek: number;
  leads: number;
  costPerLead: number;
  ctrLeads: number;
  jumlahCustomer: number;
  totalAdsSpend: number;
  costPerCustomer: number;
  totalNilaiLangganan: number;
  roi: number;
  lastEditBy?: string;
  lastEditDate?: string;
  budgetHistory?: any[];
  spentHistory?: any[];
  layanan?: string; // Menambahkan properti layanan untuk menghindari error
}

export interface AdsSpendTotals {
  totalProspek: number;
  totalLeads: number;
  totalBudget: number;
  totalAdsSpend: number;
  sisaBudget: number;
  avgCostPerLead: number;
  avgCTRLeads: number;
  totalCustomer: number;
  avgCostPerCustomer: number;
  totalNilaiLangganan: number;
  avgROI: number;
}

export interface AdsSpendResponse {
  success: boolean;
  data: AdsSpendItem[];
  totals: AdsSpendTotals;
  filter: {
    type: string;
    year?: string;
    month?: string;
    startDate?: string;
    endDate?: string;
  };
}

export function useAdsSpend(
  filter: string = 'current-month',
  year?: number,
  month?: number,
  startDate?: string,
  endDate?: string
) {
  console.log('useAdsSpend called with:', { filter, year, month, startDate, endDate }); // Debug log

  return useQuery<AdsSpendResponse>({
    queryKey: ['adsSpend', filter, year, month, startDate, endDate],
    queryFn: async () => {
      let url = `/api/ads-spend?filter=${filter}`;
      
      if (filter === 'year-month' && year && month) {
        url += `&year=${year}&month=${month}`;
      }
      
      if (filter === 'custom' && startDate && endDate) {
        url += `&startDate=${startDate}&endDate=${endDate}`;
      }

      console.log('Fetching data from URL:', url); // Debug log

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch ads spend data');
      }

      const data = await response.json();
      console.log('API response:', data); // Debug log

      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

import { useQuery } from '@tanstack/react-query';

export interface DashboardStats {
  totalProspek: number;
  totalLeads: number;
  totalSpam: number;
  ctrLeads: string;
  prospekChange: string;
  leadsChange: string;
  spamChange: string;
}

export interface TrendData {
  day: string;
  prospek: number;
  leads: number;
}

export interface TopItem {
  name: string;
  leads: number;
  ctr: string;
}

export interface KodeAdsItem {
  name: string;
  value: number;
  count: number;
}

export interface DashboardData {
  stats: DashboardStats;
  trendData: TrendData[];
  topLayanan: TopItem[];
  topKota: TopItem[];
  topCS: TopItem[];
  kodeAdsData: KodeAdsItem[];
}

export function useDashboard(filter: string = 'today', startDate?: string, endDate?: string) {
  return useQuery<DashboardData>({
    queryKey: ['dashboard', filter, startDate, endDate],
    queryFn: async () => {
      let url = `/api/dashboard?filter=${filter}`;
      if (filter === 'custom' && startDate && endDate) {
        url += `&startDate=${startDate}&endDate=${endDate}`;
      }
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }
      return response.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

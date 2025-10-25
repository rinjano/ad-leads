"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { 
  Search, 
  Plus, 
  Eye, 
  DollarSign, 
  TrendingUp, 
  Target, 
  Users, 
  Calendar,
  ArrowUp,
  ArrowDown,
  Filter,
  ChevronDown,
  X,
  Edit3,
  Wallet,
  Calculator,
  Coins,
  PlusCircle,
  Star,
  Percent,
  CreditCard,
  Shield,
  UsersRound,
  Receipt,
  Loader2
} from "lucide-react";
import { useAdsSpend } from "@/hooks/useAdsSpend";

// Data bulan sebelumnya untuk perbandingan (hardcoded untuk demo)
const previousMonthData = {
  totalProspek: 680,
  totalLeads: 185,
  totalBudget: 15000000,
  totalAdsSpend: 8200000,
  sisaBudget: 6800000,
  avgCostPerLead: 44324,
  avgCTRLeads: 27.2,
  totalCustomer: 125,
  avgCostPerCustomer: 65600,
  totalNilaiLangganan: 28750000,
  avgROI: 182.1
};

// Updated History interface to align with AdsBudgetHistory model
interface History {
  type: string;
  amount: number;
  note?: string;
  createdBy?: string;
  createdAt: string | Date;
}

export default function AdsSpendPage() {
  // Filter waktu style laporan
  const [dateRange, setDateRange] = useState('thismonth');
  const [showCustomDate, setShowCustomDate] = useState(false);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedKodeAds, setSelectedKodeAds] = useState("");
  const [selectedChannel, setSelectedChannel] = useState("");
  const [selectedLayanan, setSelectedLayanan] = useState("");
  const [layananList, setLayananList] = useState<any[]>([]);
  
  // Modal states
  const [showAddBudgetModal, setShowAddBudgetModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showUpdateBudgetSpentModal, setShowUpdateBudgetSpentModal] = useState(false);
  const [selectedAds, setSelectedAds] = useState<any>(null);
  const [newBudgetAmount, setNewBudgetAmount] = useState("");
  const [newBudgetNote, setNewBudgetNote] = useState("");
  const [newBudgetSpent, setNewBudgetSpent] = useState("");
  const [includePPN, setIncludePPN] = useState(false);
  const [currentDate, setCurrentDate] = useState("");
  const [budgetTimestamp, setBudgetTimestamp] = useState("");
  const [spendingTimestamp, setSpendingTimestamp] = useState("");

  // Set current date on client side only
  useEffect(() => {
    setCurrentDate(new Date().toLocaleDateString("id-ID"));
  }, []);

  // Initialize budget timestamp when modal opens
  useEffect(() => {
    if (showAddBudgetModal) {
      const now = new Date();
      setBudgetTimestamp(now.toISOString().split('T')[0]);
    }
  }, [showAddBudgetModal]);

  // Fetch layanan data from API
  useEffect(() => {
    const fetchLayanan = async () => {
      try {
        const response = await fetch('/api/layanan');
        const data = await response.json();
        if (data.success) {
          setLayananList(data.data || []);
        }
      } catch (error) {
        console.error('Error fetching layanan:', error);
      }
    };
    fetchLayanan();
  }, []);


  // Handle date range change
  const handleDateRangeChange = (e) => {
    const value = e.target.value
    setDateRange(value)
    setShowCustomDate(value === 'custom')
  }

  // Map laporan-style dateRange to API filter
  const getApiFilter = (range: string) => {
    switch (range) {
      case 'today': return 'today';
      case 'yesterday': return 'yesterday';
      case 'thisweek': return 'this-week';
      case 'thismonth': return 'current-month';
      case 'lastmonth': return 'year-month';
      case 'custom': return 'custom';
      default: return 'current-month';
    }
  };

  // For 'lastmonth', calculate year and month
  const [lastMonthYear, setLastMonthYear] = useState<number | undefined>(undefined);
  const [lastMonth, setLastMonth] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (dateRange === 'lastmonth') {
      const now = new Date();
      const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      setLastMonthYear(prevMonth.getFullYear());
      setLastMonth(prevMonth.getMonth() + 1); // JS month is 0-based
    } else {
      setLastMonthYear(undefined);
      setLastMonth(undefined);
    }
  }, [dateRange]);

  // Compose filter params for useAdsSpend
  const apiFilter = getApiFilter(dateRange);
  const adsSpendQuery = useAdsSpend(
    apiFilter,
    apiFilter === 'year-month' ? lastMonthYear : undefined,
    apiFilter === 'year-month' ? lastMonth : undefined,
    apiFilter === 'custom' ? customStartDate : undefined,
    apiFilter === 'custom' ? customEndDate : undefined
  );
  const { data: adsSpendResponse, isLoading, error, refetch } = adsSpendQuery;

  // Auto refetch on filter change (match laporan)
  useEffect(() => {
    console.log('Filter changed:', { apiFilter, customStartDate, customEndDate }); // Debug log
    if (apiFilter === 'custom' && customStartDate && customEndDate) {
      refetch();
    } else if (apiFilter !== 'custom') {
      refetch();
    }
  }, [apiFilter, customStartDate, customEndDate, refetch]);

  // Debug log to verify API response
  useEffect(() => {
    console.log('API Response Data:', adsSpendResponse); // Debug log to verify API response
  }, [adsSpendResponse]);

  // Debug log for filter parameters
  useEffect(() => {
    console.log('Filter Parameters:', { apiFilter, customStartDate, customEndDate }); // Debug log for filter parameters
  }, [apiFilter, customStartDate, customEndDate]);

  const adsSpendData = adsSpendResponse?.data || [];
  const totals = adsSpendResponse?.totals || {
    totalProspek: 0,
    totalLeads: 0,
    totalBudget: 0,
    totalAdsSpend: 0,
    sisaBudget: 0,
    avgCostPerLead: 0,
    avgCTRLeads: 0,
    totalCustomer: 0,
    avgCostPerCustomer: 0,
    totalNilaiLangganan: 0,
    avgROI: 0,
  };

  // Filter data based on search term and selected filters using useMemo
  const filteredData = useMemo(() => {
    if (!adsSpendData || adsSpendData.length === 0) return [];
    let filtered = adsSpendData;
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(ads =>
        ads.kodeAds.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ads.channel.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ads.jumlahCustomer.toString().includes(searchTerm) ||
        ads.totalAdsSpend.toString().includes(searchTerm) ||
        ads.roi.toFixed(1).includes(searchTerm)
      );
    }
    
    // Filter by selected kode ads
    if (selectedKodeAds) {
      filtered = filtered.filter(ads => ads.kodeAds === selectedKodeAds);
    }
    
    // Filter by selected channel
    if (selectedChannel) {
      filtered = filtered.filter(ads => ads.channel === selectedChannel);
    }
    
    // Filter by selected layanan
    if (selectedLayanan) {
      filtered = filtered.filter(ads => 
        ads.layanan?.toLowerCase().includes(selectedLayanan.toLowerCase())
      );
    }
    
    return filtered;
  }, [searchTerm, selectedKodeAds, selectedChannel, selectedLayanan, adsSpendData]);

  // Calculate percentage changes
  const prospekChange = previousMonthData.totalProspek > 0 
    ? ((totals.totalProspek - previousMonthData.totalProspek) / previousMonthData.totalProspek) * 100 
    : 0;
  
  const leadsChange = previousMonthData.totalLeads > 0 
    ? ((totals.totalLeads - previousMonthData.totalLeads) / previousMonthData.totalLeads) * 100 
    : 0;
  
  const budgetSpentChange = previousMonthData.totalAdsSpend > 0 
    ? ((totals.totalAdsSpend - previousMonthData.totalAdsSpend) / previousMonthData.totalAdsSpend) * 100 
    : 0;
  
  const costPerLeadChange = previousMonthData.avgCostPerLead > 0 
    ? ((totals.avgCostPerLead - previousMonthData.avgCostPerLead) / previousMonthData.avgCostPerLead) * 100 
    : 0;

  const totalBudgetChange = previousMonthData.totalBudget > 0 
    ? ((totals.totalBudget - previousMonthData.totalBudget) / previousMonthData.totalBudget) * 100 
    : 0;

  const sisaBudgetChange = previousMonthData.sisaBudget > 0 
    ? ((totals.sisaBudget - previousMonthData.sisaBudget) / previousMonthData.sisaBudget) * 100 
    : 0;

  const ctrLeadsChange = previousMonthData.avgCTRLeads > 0 
    ? ((totals.avgCTRLeads - previousMonthData.avgCTRLeads) / previousMonthData.avgCTRLeads) * 100 
    : 0;
    
  // Calculate percentage changes untuk kolom baru
  const customerChange = previousMonthData.totalCustomer > 0 
    ? ((totals.totalCustomer - previousMonthData.totalCustomer) / previousMonthData.totalCustomer) * 100 
    : 0;
  
  const adsSpendChange = previousMonthData.totalAdsSpend > 0 
    ? ((totals.totalAdsSpend - previousMonthData.totalAdsSpend) / previousMonthData.totalAdsSpend) * 100 
    : 0;
  
  const costPerCustomerChange = previousMonthData.avgCostPerCustomer > 0 
    ? ((totals.avgCostPerCustomer - previousMonthData.avgCostPerCustomer) / previousMonthData.avgCostPerCustomer) * 100 
    : 0;
  
  const nilaiLanggananChange = previousMonthData.totalNilaiLangganan > 0 
    ? ((totals.totalNilaiLangganan - previousMonthData.totalNilaiLangganan) / previousMonthData.totalNilaiLangganan) * 100 
    : 0;

  const roiChange = previousMonthData.avgROI > 0 
    ? ((totals.avgROI - previousMonthData.avgROI) / previousMonthData.avgROI) * 100 
    : 0;

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format input currency with Rp prefix and thousand separators
  const formatInputCurrency = (value) => {
    // Remove all non-numeric characters
    const numericValue = value.toString().replace(/[^0-9]/g, '');
    if (!numericValue) return '';
    
    // Add thousand separators
    const formatted = parseInt(numericValue).toLocaleString('id-ID');
    return `Rp ${formatted}`;
  };

  // Parse currency input to get numeric value
  const parseCurrencyInput = (value) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    return numericValue ? parseInt(numericValue) : 0;
  };

  // Handle currency input change
  const handleCurrencyInputChange = (value, setter) => {
    // Allow only numbers
    const numericOnly = value.replace(/[^0-9]/g, '');
    setter(numericOnly);
  };

  // Handle add budget
  const handleAddBudget = (ads: any) => {
    setSelectedAds(ads);
    setShowAddBudgetModal(true);
  };

  const submitAddBudget = async () => {
    if (!newBudgetAmount || !selectedAds) return;

    try {
      // Get current periode (YYYY-MM)
      const now = new Date();
      const periode = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

      // Hitung total budget baru (budget lama + budget baru yang ditambahkan)
      // Pastikan convert ke number untuk menghindari string concatenation
      const currentBudget = parseFloat(selectedAds.budget) || 0;
      const additionalBudget = parseFloat(newBudgetAmount) || 0;
      const totalBudget = currentBudget + additionalBudget;

      console.log('Debug Add Budget:', {
        currentBudget,
        additionalBudget,
        totalBudget,
        selectedAds_budget: selectedAds.budget,
        typeof_currentBudget: typeof currentBudget,
        typeof_additionalBudget: typeof additionalBudget
      });

      const response = await fetch('/api/ads-budget', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          kodeAdsId: selectedAds.kodeAdsId,
          sumberLeadsId: selectedAds.sumberLeadsId,
          budget: totalBudget, // Kirim total budget (lama + baru)
          spent: selectedAds.totalAdsSpend || 0,
          periode,
          createdBy: 'Admin', // TODO: Get from session
          budgetTimestamp: budgetTimestamp, // Send custom timestamp
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert(`Budget berhasil ditambahkan! Total budget sekarang: Rp ${totalBudget.toLocaleString('id-ID')}`);
        setShowAddBudgetModal(false);
        setNewBudgetAmount("");
        setNewBudgetNote("");
        setBudgetTimestamp("");
        setSelectedAds(null);
        // Refresh data
        refetch();
      } else {
        alert(`Gagal menambahkan budget: ${data.error}`);
      }
    } catch (error) {
      console.error('Error adding budget:', error);
      alert('Terjadi kesalahan saat menambahkan budget');
    }
  };

  // Handle detail modal
  const handleShowDetail = (ads: any) => {
    setSelectedAds(ads);
    setShowDetailModal(true);
  };

  // Handle update budget spent
  const handleUpdateBudgetSpent = (ads: any) => {
    setSelectedAds(ads);
    setNewBudgetSpent(ads.totalAdsSpent?.toString() || '0');
    setIncludePPN(false);
    const now = new Date();
    setSpendingTimestamp(now.toISOString().split('T')[0]);
    setShowUpdateBudgetSpentModal(true);
  };

  const submitUpdateBudgetSpent = async () => {
    if (!newBudgetSpent || !selectedAds) return;

    try {
      // Gunakan nilai inputan sebagai total spending baru (bukan ditambahkan dengan spending lama)
      const newTotalSpent = parseFloat(newBudgetSpent) || 0;
      
      // Calculate dengan PPN jika diperlukan
      const totalSpent = includePPN ? newTotalSpent + (newTotalSpent * 0.11) : newTotalSpent;

      console.log('Debug Update Spending:', {
        newTotalSpent,
        totalSpent,
        includePPN,
        selectedAds_budgetSpent: selectedAds.budgetSpent,
        typeof_newTotalSpent: typeof newTotalSpent
      });

      // If budgetId exists, update. Otherwise create new budget entry
      const url = selectedAds.budgetId ? '/api/ads-budget' : '/api/ads-budget';
      const method = selectedAds.budgetId ? 'PUT' : 'POST';

      // Get current periode (YYYY-MM)
      const now = new Date();
      const periode = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

      const body = selectedAds.budgetId
        ? {
            id: selectedAds.budgetId,
            spent: totalSpent,  // Kirim total spending baru (bukan tambahan)
            spendingTimestamp, // Kirim waktu spending
            updatedBy: 'Admin', // TODO: Get from session
          }
        : {
            kodeAdsId: selectedAds.kodeAdsId,
            sumberLeadsId: selectedAds.sumberLeadsId,
            budget: parseFloat(selectedAds.budget) || 0,
            spent: totalSpent,  // Kirim total spending baru (bukan tambahan)
            spendingTimestamp, // Kirim waktu spending
            periode,
            createdBy: 'Admin', // TODO: Get from session
          };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (data.success) {
        const ppnInfo = includePPN ? ' (termasuk PPN 11%)' : '';
        alert(`Spending berhasil diupdate${ppnInfo}! Total spending sekarang: Rp ${totalSpent.toLocaleString('id-ID')}`);
        setShowUpdateBudgetSpentModal(false);
        setNewBudgetSpent("");
        setIncludePPN(false);
        setSpendingTimestamp("");
        setSelectedAds(null);
        // Refresh data
        refetch();
      } else {
        alert(`Gagal mengupdate budget spent: ${data.error}`);
      }
    } catch (error) {
      console.error('Error updating budget spent:', error);
      alert('Terjadi kesalahan saat mengupdate budget spent');
    }
  };

  // Get unique kode ads and channels for filter using useMemo
  const uniqueKodeAds = useMemo(() => {
    if (!adsSpendData || adsSpendData.length === 0) return [];
    return [...new Set(adsSpendData.map(ads => ads.kodeAds))];
  }, [adsSpendData]);

  const uniqueChannels = useMemo(() => {
    if (!adsSpendData || adsSpendData.length === 0) return [];
    return [...new Set(adsSpendData.map(ads => ads.channel))];
  }, [adsSpendData]);

  // Generate year options (last 3 years and next 2 years)
  const currentYear = new Date().getFullYear();
  const yearOptions = [];
  for (let i = currentYear - 3; i <= currentYear + 2; i++) {
    yearOptions.push(i);
  }

  // Month names
  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  // Loading state
  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Card className="bg-white shadow-lg border-slate-200">
          <CardContent className="p-12">
            <div className="flex flex-col items-center justify-center text-slate-500">
              <Loader2 className="h-12 w-12 animate-spin text-purple-600 mb-4" />
              <p className="text-lg font-medium">Memuat data ads spend...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6 space-y-6">
        <Card className="bg-white shadow-lg border-slate-200">
          <CardContent className="p-12">
            <div className="flex flex-col items-center justify-center text-red-500">
              <X className="h-12 w-12 mb-4" />
              <p className="text-lg font-medium mb-2">Gagal memuat data ads spend</p>
              <p className="text-sm text-slate-600">{error instanceof Error ? error.message : 'Unknown error'}</p>
              <Button
                onClick={() => refetch()}
                className="mt-4"
                variant="outline"
              >
                Coba Lagi
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <Card className="bg-white shadow-lg border-slate-200">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <DollarSign className="h-8 w-8 text-purple-600" />
            Ads Spend
          </CardTitle>
          <CardDescription className="text-gray-600">
            Kelola budget dan analisis performa iklan
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Filter Waktu style laporan */}
      <Card className="bg-white shadow-lg border-slate-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-slate-500" />
            <span className="text-sm font-medium text-slate-700">Periode:</span>
            <select
              value={dateRange}
              onChange={handleDateRangeChange}
              className="text-sm border border-slate-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white hover:bg-slate-50 transition-colors"
            >
              <option value="today">Hari Ini</option>
              <option value="yesterday">Kemarin</option>
              <option value="thisweek">Minggu Ini</option>
              <option value="thismonth">Bulan Ini</option>
              <option value="lastmonth">Bulan Lalu</option>
              <option value="custom">Custom</option>
            </select>
            {showCustomDate && (
              <div className="flex items-center gap-2 ml-2">
                <Input
                  type="date"
                  value={customStartDate}
                  onChange={e => setCustomStartDate(e.target.value)}
                  className="text-sm border border-slate-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  placeholder="Dari tanggal"
                />
                <span className="text-slate-500 text-sm">s/d</span>
                <Input
                  type="date"
                  value={customEndDate}
                  onChange={e => setCustomEndDate(e.target.value)}
                  className="text-sm border border-slate-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  placeholder="Sampai tanggal"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Report Cards */}
      <div className="space-y-6">
        {/* Baris 1: Performance Metrics */}
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Metrik Performa
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Jumlah Prospek */}
            <Card className="bg-white shadow-lg border-slate-200 hover:shadow-xl transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-600 mb-1">Jumlah Prospek</p>
                    <p className="text-xl font-bold text-slate-900 mb-2">{totals.totalProspek.toLocaleString()}</p>
                    <div className="flex items-center">
                      {prospekChange >= 0 ? (
                        <ArrowUp className="h-3 w-3 text-green-500 mr-1" />
                      ) : (
                        <ArrowDown className="h-3 w-3 text-red-500 mr-1" />
                      )}
                      <span className={`text-xs font-medium ${prospekChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {Math.abs(prospekChange).toFixed(1)}%
                      </span>
                      <span className="text-xs text-slate-500 ml-1">vs bulan lalu</span>
                    </div>
                  </div>
                  <div className="p-2.5 bg-blue-100 rounded-lg">
                    <UsersRound className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Jumlah Leads */}
            <Card className="bg-white shadow-lg border-slate-200 hover:shadow-xl transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-600 mb-1">Jumlah Leads</p>
                    <p className="text-xl font-bold text-slate-900 mb-2">{totals.totalLeads.toLocaleString()}</p>
                    <div className="flex items-center">
                      {leadsChange >= 0 ? (
                        <ArrowUp className="h-3 w-3 text-green-500 mr-1" />
                      ) : (
                        <ArrowDown className="h-3 w-3 text-red-500 mr-1" />
                      )}
                      <span className={`text-xs font-medium ${leadsChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {Math.abs(leadsChange).toFixed(1)}%
                      </span>
                      <span className="text-xs text-slate-500 ml-1">vs bulan lalu</span>
                    </div>
                  </div>
                  <div className="p-2.5 bg-amber-100 rounded-lg">
                    <Star className="h-5 w-5 text-amber-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cost Per Lead */}
            <Card className="bg-white shadow-lg border-slate-200 hover:shadow-xl transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-600 mb-1">Cost Per Lead</p>
                    <p className="text-xl font-bold text-slate-900 mb-2">{formatCurrency(totals.avgCostPerLead)}</p>
                    <div className="flex items-center">
                      {costPerLeadChange <= 0 ? (
                        <ArrowDown className="h-3 w-3 text-green-500 mr-1" />
                      ) : (
                        <ArrowUp className="h-3 w-3 text-red-500 mr-1" />
                      )}
                      <span className={`text-xs font-medium ${costPerLeadChange <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {Math.abs(costPerLeadChange).toFixed(1)}%
                      </span>
                      <span className="text-xs text-slate-500 ml-1">vs bulan lalu</span>
                    </div>
                  </div>
                  <div className="p-2.5 bg-green-100 rounded-lg">
                    <Coins className="h-5 w-5 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* CTR Leads */}
            <Card className="bg-white shadow-lg border-slate-200 hover:shadow-xl transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-600 mb-1">CTR Leads</p>
                    <p className="text-xl font-bold text-slate-900 mb-2">{totals.avgCTRLeads.toFixed(1)}%</p>
                    <div className="flex items-center">
                      {ctrLeadsChange >= 0 ? (
                        <ArrowUp className="h-3 w-3 text-green-500 mr-1" />
                      ) : (
                        <ArrowDown className="h-3 w-3 text-red-500 mr-1" />
                      )}
                      <span className={`text-xs font-medium ${ctrLeadsChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {Math.abs(ctrLeadsChange).toFixed(1)}%
                      </span>
                      <span className="text-xs text-slate-500 ml-1">vs bulan lalu</span>
                    </div>
                  </div>
                  <div className="p-2.5 bg-purple-100 rounded-lg">
                    <Percent className="h-5 w-5 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Baris 2: Budget Overview */}
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Wallet className="h-5 w-5 text-indigo-600" />
            Ikhtisar Budget
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Total Budget */}
            <Card className="bg-white shadow-lg border-slate-200 hover:shadow-xl transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-600 mb-1">Total Budget</p>
                    <p className="text-xl font-bold text-slate-900 mb-2">{formatCurrency(totals.totalBudget)}</p>
                    <div className="flex items-center">
                      {totalBudgetChange >= 0 ? (
                        <ArrowUp className="h-3 w-3 text-green-500 mr-1" />
                      ) : (
                        <ArrowDown className="h-3 w-3 text-red-500 mr-1" />
                      )}
                      <span className={`text-xs font-medium ${totalBudgetChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {Math.abs(totalBudgetChange).toFixed(1)}%
                      </span>
                      <span className="text-xs text-slate-500 ml-1">vs bulan lalu</span>
                    </div>
                  </div>
                  <div className="p-2.5 bg-indigo-100 rounded-lg">
                    <Wallet className="h-5 w-5 text-indigo-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Total Ads Spend */}
            <Card className="bg-white shadow-lg border-slate-200 hover:shadow-xl transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-600 mb-1">Total Ads Spend</p>
                    <p className="text-xl font-bold text-slate-900 mb-2">{formatCurrency(totals.totalAdsSpend)}</p>
                    <div className="flex items-center">
                      {adsSpendChange >= 0 ? (
                        <ArrowUp className="h-3 w-3 text-orange-500 mr-1" />
                      ) : (
                        <ArrowDown className="h-3 w-3 text-green-500 mr-1" />
                      )}
                      <span className={`text-xs font-medium ${adsSpendChange >= 0 ? 'text-orange-600' : 'text-green-600'}`}>
                        {Math.abs(adsSpendChange).toFixed(1)}%
                      </span>
                      <span className="text-xs text-slate-500 ml-1">vs bulan lalu</span>
                    </div>
                  </div>
                  <div className="p-2.5 bg-orange-100 rounded-lg">
                    <CreditCard className="h-5 w-5 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sisa Budget */}
            <Card className="bg-white shadow-lg border-slate-200 hover:shadow-xl transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-600 mb-1">Sisa Budget</p>
                    <p className="text-xl font-bold text-slate-900 mb-2">{formatCurrency(totals.sisaBudget)}</p>
                    <div className="flex items-center">
                      {sisaBudgetChange >= 0 ? (
                        <ArrowUp className="h-3 w-3 text-green-500 mr-1" />
                      ) : (
                        <ArrowDown className="h-3 w-3 text-red-500 mr-1" />
                      )}
                      <span className={`text-xs font-medium ${sisaBudgetChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {Math.abs(sisaBudgetChange).toFixed(1)}%
                      </span>
                      <span className="text-xs text-slate-500 ml-1">vs bulan lalu</span>
                    </div>
                  </div>
                  <div className="p-2.5 bg-emerald-100 rounded-lg">
                    <Shield className="h-5 w-5 text-emerald-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Baris 3: Analytics Tambahan */}
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Receipt className="h-5 w-5 text-purple-600" />
            Analytics Tambahan
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Total Customer */}
            <Card className="bg-white shadow-lg border-slate-200 hover:shadow-xl transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-600 mb-1">Total Customer</p>
                    <p className="text-xl font-bold text-slate-900 mb-2">{totals.totalCustomer.toLocaleString()}</p>
                    <div className="flex items-center">
                      {customerChange >= 0 ? (
                        <ArrowUp className="h-3 w-3 text-green-500 mr-1" />
                      ) : (
                        <ArrowDown className="h-3 w-3 text-red-500 mr-1" />
                      )}
                      <span className={`text-xs font-medium ${customerChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {Math.abs(customerChange).toFixed(1)}%
                      </span>
                      <span className="text-xs text-slate-500 ml-1">vs bulan lalu</span>
                    </div>
                  </div>
                  <div className="p-2.5 bg-blue-100 rounded-lg">
                    <UsersRound className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Total Ads Spend */}
            <Card className="bg-white shadow-lg border-slate-200 hover:shadow-xl transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-600 mb-1">Total Ads Spend</p>
                    <p className="text-xl font-bold text-slate-900 mb-2">{formatCurrency(totals.totalAdsSpend)}</p>
                    <div className="flex items-center">
                      {adsSpendChange >= 0 ? (
                        <ArrowUp className="h-3 w-3 text-orange-500 mr-1" />
                      ) : (
                        <ArrowDown className="h-3 w-3 text-green-500 mr-1" />
                      )}
                      <span className={`text-xs font-medium ${adsSpendChange >= 0 ? 'text-orange-600' : 'text-green-600'}`}>
                        {Math.abs(adsSpendChange).toFixed(1)}%
                      </span>
                      <span className="text-xs text-slate-500 ml-1">vs bulan lalu</span>
                    </div>
                  </div>
                  <div className="p-2.5 bg-orange-100 rounded-lg">
                    <DollarSign className="h-5 w-5 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Avg Cost Per Customer */}
            <Card className="bg-white shadow-lg border-slate-200 hover:shadow-xl transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-600 mb-1">Avg Cost/Customer</p>
                    <p className="text-xl font-bold text-slate-900 mb-2">{formatCurrency(totals.avgCostPerCustomer)}</p>
                    <div className="flex items-center">
                      {costPerCustomerChange <= 0 ? (
                        <ArrowDown className="h-3 w-3 text-green-500 mr-1" />
                      ) : (
                        <ArrowUp className="h-3 w-3 text-red-500 mr-1" />
                      )}
                      <span className={`text-xs font-medium ${costPerCustomerChange <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {Math.abs(costPerCustomerChange).toFixed(1)}%
                      </span>
                      <span className="text-xs text-slate-500 ml-1">vs bulan lalu</span>
                    </div>
                  </div>
                  <div className="p-2.5 bg-green-100 rounded-lg">
                    <Calculator className="h-5 w-5 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Avg LTV */}
            <Card className="bg-white shadow-lg border-slate-200 hover:shadow-xl transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-600 mb-1">Total Nilai Langganan</p>
                    <p className="text-xl font-bold text-slate-900 mb-2">{formatCurrency(totals.totalNilaiLangganan)}</p>
                    <div className="flex items-center">
                      {nilaiLanggananChange >= 0 ? (
                        <ArrowUp className="h-3 w-3 text-green-500 mr-1" />
                      ) : (
                        <ArrowDown className="h-3 w-3 text-red-500 mr-1" />
                      )}
                      <span className={`text-xs font-medium ${nilaiLanggananChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {Math.abs(nilaiLanggananChange).toFixed(1)}%
                      </span>
                      <span className="text-xs text-slate-500 ml-1">vs bulan lalu</span>
                    </div>
                  </div>
                  <div className="p-2.5 bg-purple-100 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Avg ROI */}
            <Card className="bg-white shadow-lg border-slate-200 hover:shadow-xl transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-600 mb-1">Avg ROI</p>
                    <p className="text-xl font-bold text-slate-900 mb-2">{totals.avgROI.toFixed(1)}%</p>
                    <div className="flex items-center">
                      {roiChange >= 0 ? (
                        <ArrowUp className="h-3 w-3 text-green-500 mr-1" />
                      ) : (
                        <ArrowDown className="h-3 w-3 text-red-500 mr-1" />
                      )}
                      <span className={`text-xs font-medium ${roiChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {Math.abs(roiChange).toFixed(1)}%
                      </span>
                      <span className="text-xs text-slate-500 ml-1">vs bulan lalu</span>
                    </div>
                  </div>
                  <div className="p-2.5 bg-emerald-100 rounded-lg">
                    <Target className="h-5 w-5 text-emerald-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Cari kode ads atau channel..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-slate-50 border-slate-200 h-10 w-full focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
        </div>
        
        <select
          value={selectedKodeAds}
          onChange={(e) => setSelectedKodeAds(e.target.value)}
          className="px-3 py-2 border border-slate-300 rounded-lg bg-white text-sm focus:border-blue-500 focus:ring-blue-500 min-w-[150px]"
        >
          <option value="">Semua Kode Ads</option>
          {uniqueKodeAds.map((kode: string) => (
            <option key={kode} value={kode}>{kode}</option>
          ))}
        </select>
        
        <select
          value={selectedChannel}
          onChange={(e) => setSelectedChannel(e.target.value)}
          className="px-3 py-2 border border-slate-300 rounded-lg bg-white text-sm focus:border-blue-500 focus:ring-blue-500 min-w-[150px]"
        >
          <option value="">Semua Channel</option>
          {uniqueChannels.map((channel: string) => (
            <option key={channel} value={channel}>{channel}</option>
          ))}
        </select>
        
        <select
          value={selectedLayanan}
          onChange={(e) => setSelectedLayanan(e.target.value)}
          className="px-3 py-2 border border-slate-300 rounded-lg bg-white text-sm focus:border-blue-500 focus:ring-blue-500 min-w-[150px]"
        >
          <option value="">Semua Layanan</option>
          {layananList.map((layanan: any) => (
            <option key={layanan.id} value={layanan.nama}>{layanan.nama}</option>
          ))}
        </select>
      </div>



      {/* Ads Spend Table */}
      <Card className="bg-white shadow-lg border-slate-200 overflow-hidden">
        {/* Table Header */}
        <div className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Data Ads Spend</h3>
                <p className="text-sm text-slate-600">Kelola budget dan performa iklan</p>
              </div>
            </div>
            <div className="text-sm text-slate-500">
              Total: <span className="font-medium text-slate-900">{filteredData.length}</span> kombinasi
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200 hover:bg-gradient-to-r hover:from-slate-50 hover:to-slate-100">
                <TableHead className="py-4 px-6 text-left font-semibold text-slate-700 border-r border-slate-200 last:border-r-0">
                  <div className="flex items-center gap-2">
                    <span>Kode Ads</span>
                  </div>
                </TableHead>
                <TableHead className="py-4 px-6 text-left font-semibold text-slate-700 border-r border-slate-200 last:border-r-0">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-slate-500" />
                    <span>Sumber Leads</span>
                  </div>
                </TableHead>
                <TableHead className="py-4 px-6 text-right font-semibold text-slate-700 border-r border-slate-200 last:border-r-0">
                  <div className="flex items-center justify-end gap-2">
                    <span>Budget</span>
                  </div>
                </TableHead>
                <TableHead className="py-4 px-6 text-right font-semibold text-slate-700 border-r border-slate-200 last:border-r-0">
                  <div className="flex items-center justify-end gap-2">
                    <DollarSign className="h-4 w-4 text-slate-500" />
                    <span>Total Ads Spend</span>
                  </div>
                </TableHead>
                <TableHead className="py-4 px-6 text-right font-semibold text-slate-700 border-r border-slate-200 last:border-r-0">
                  <div className="flex items-center justify-end gap-2">
                    <span>Sisa Budget</span>
                  </div>
                </TableHead>
                <TableHead className="py-4 px-6 text-center font-semibold text-slate-700 border-r border-slate-200 last:border-r-0">
                  <div className="flex items-center justify-center gap-2">
                    <Users className="h-4 w-4 text-slate-500" />
                    <span>Prospek</span>
                  </div>
                </TableHead>
                <TableHead className="py-4 px-6 text-center font-semibold text-slate-700 border-r border-slate-200 last:border-r-0">
                  <div className="flex items-center justify-center gap-2">
                    <Target className="h-4 w-4 text-slate-500" />
                    <span>Leads</span>
                  </div>
                </TableHead>
                <TableHead className="py-4 px-6 text-right font-semibold text-slate-700 border-r border-slate-200 last:border-r-0">
                  <div className="flex items-center justify-end gap-2">
                    <span>Cost Per Lead</span>
                  </div>
                </TableHead>
                <TableHead className="py-4 px-6 text-center font-semibold text-slate-700 border-r border-slate-200 last:border-r-0">
                  <div className="flex items-center justify-center gap-2">
                    <span>CTR Leads</span>
                  </div>
                </TableHead>
                {/* Kolom baru untuk analytics */}
                <TableHead className="py-4 px-6 text-center font-semibold text-slate-700 border-r border-slate-200 last:border-r-0">
                  <div className="flex items-center justify-center gap-2">
                    <UsersRound className="h-4 w-4 text-slate-500" />
                    <span>Jumlah Customer</span>
                  </div>
                </TableHead>
                <TableHead className="py-4 px-6 text-right font-semibold text-slate-700 border-r border-slate-200 last:border-r-0">
                  <div className="flex items-center justify-end gap-2">
                    <Calculator className="h-4 w-4 text-slate-500" />
                    <span>Cost Per Customer</span>
                  </div>
                </TableHead>
                <TableHead className="py-4 px-6 text-right font-semibold text-slate-700 border-r border-slate-200 last:border-r-0">
                  <div className="flex items-center justify-end gap-2">
                    <TrendingUp className="h-4 w-4 text-slate-500" />
                    <span>Total Nilai Langganan</span>
                  </div>
                </TableHead>
                <TableHead className="py-4 px-6 text-center font-semibold text-slate-700 border-r border-slate-200 last:border-r-0">
                  <div className="flex items-center justify-center gap-2">
                    <Percent className="h-4 w-4 text-slate-500" />
                    <span>ROI (%)</span>
                  </div>
                </TableHead>
                <TableHead className="py-4 px-6 text-center font-semibold text-slate-700 border-r border-slate-200 last:border-r-0">
                  <div className="flex items-center justify-center gap-2">
                    <Users className="h-4 w-4 text-slate-500" />
                    <span>Last Edit By</span>
                  </div>
                </TableHead>
                <TableHead className="py-4 px-6 text-center font-semibold text-slate-700">
                  <div className="flex items-center justify-center gap-2">
                    <span>Aksi</span>
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length > 0 ? (
                filteredData.map((ads) => {
                  // Perhitungan field yang diperlukan
                  const sisaBudget = ads.budget - ads.totalAdsSpend;
                  const costPerLead = ads.leads > 0 ? ads.totalAdsSpend / ads.leads : 0;
                  const ctrLeads = ads.prospek > 0 ? (ads.leads / ads.prospek) * 100 : 0;
                  
                  return (
                    <TableRow key={ads.id} className="transition-all duration-200 hover:bg-slate-50 border-b border-slate-100 last:border-b-0">
                      <TableCell className="py-4 px-6 border-r border-slate-100 last:border-r-0">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                            {ads.kodeAds.charAt(0)}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900">{ads.kodeAds}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 px-6 border-r border-slate-100 last:border-r-0">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                          <div>
                            <div className="font-medium text-slate-900">{ads.channel}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 px-6 border-r border-slate-100 last:border-r-0 text-right">
                        <div className="font-medium text-slate-900">{formatCurrency(ads.budget)}</div>
                      </TableCell>
                      <TableCell className="py-4 px-6 border-r border-slate-100 last:border-r-0 text-right">
                        <div className="font-semibold text-slate-900">{formatCurrency(ads.totalAdsSpend)}</div>
                      </TableCell>
                      <TableCell className="py-4 px-6 border-r border-slate-100 last:border-r-0 text-right">
                        <div className={`font-medium ${sisaBudget > 0 ? 'text-green-600' : sisaBudget < 0 ? 'text-red-600' : 'text-slate-500'}`}>
                          {formatCurrency(sisaBudget)}
                        </div>
                      </TableCell>
                      <TableCell className="py-4 px-6 border-r border-slate-100 last:border-r-0 text-center">
                        <div className="font-medium text-slate-900">{ads.prospek.toLocaleString()}</div>
                      </TableCell>
                      <TableCell className="py-4 px-6 border-r border-slate-100 last:border-r-0 text-center">
                        <div className="font-medium text-slate-900">{ads.leads.toLocaleString()}</div>
                      </TableCell>
                      <TableCell className="py-4 px-6 border-r border-slate-100 last:border-r-0 text-right">
                        <div className="font-medium text-slate-900">{formatCurrency(costPerLead)}</div>
                      </TableCell>
                      <TableCell className="py-4 px-6 border-r border-slate-100 last:border-r-0 text-center">
                        <div className="font-medium text-slate-900">{ctrLeads.toFixed(1)}%</div>
                      </TableCell>
                      {/* Kolom baru untuk analytics */}
                      <TableCell className="py-4 px-6 border-r border-slate-100 last:border-r-0 text-center">
                        <div className="font-bold text-blue-600 text-lg">{ads.jumlahCustomer.toLocaleString()}</div>
                        <div className="text-xs text-slate-500">customers</div>
                      </TableCell>
                      <TableCell className="py-4 px-6 border-r border-slate-100 last:border-r-0 text-right">
                        <div className="font-semibold text-orange-600">{formatCurrency(ads.costPerCustomer)}</div>
                        <div className="text-xs text-slate-500">per customer</div>
                      </TableCell>
                      <TableCell className="py-4 px-6 border-r border-slate-100 last:border-r-0 text-right">
                        <div className="font-semibold text-green-600">{formatCurrency(ads.totalNilaiLangganan)}</div>
                        <div className="text-xs text-slate-500">total nilai</div>
                      </TableCell>
                      <TableCell className="py-4 px-6 border-r border-slate-100 last:border-r-0 text-center">
                        <div className="font-bold text-xl text-slate-900 mb-1">{ads.roi.toFixed(1)}%</div>
                        <div className={`text-xs px-2 py-1 rounded-full ${
                          ads.roi >= 300 ? 'bg-green-100 text-green-700' :
                          ads.roi >= 200 ? 'bg-blue-100 text-blue-700' :
                          ads.roi >= 100 ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {ads.roi >= 300 ? 'Excellent' :
                           ads.roi >= 200 ? 'Good' :
                           ads.roi >= 100 ? 'Average' : 'Poor'}
                        </div>
                      </TableCell>
                      <TableCell className="py-4 px-6 border-r border-slate-100 last:border-r-0 text-center">
                        <div className="flex flex-col items-center">
                          <div className="font-medium text-slate-900 text-sm">{ads.lastEditBy || 'System'}</div>
                          <div className="text-xs text-slate-500 mt-1">
                            {ads.lastEditDate ? new Date(ads.lastEditDate).toLocaleDateString("id-ID", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric"
                            }) : '-'}
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell className="py-4 px-6">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAddBudget(ads)}
                            className="h-8 w-8 p-0 bg-green-50 text-green-600 border-green-200 hover:bg-green-100 hover:border-green-300 transition-all duration-200 relative group"
                            title="Tambah Budget"
                          >
                            <div className="relative">
                              <Wallet className="h-4 w-4" />
                              <PlusCircle className="h-2 w-2 absolute -top-1 -right-1 bg-green-50 rounded-full" />
                            </div>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUpdateBudgetSpent(ads)}
                            className="h-8 w-8 p-0 bg-red-50 text-red-600 border-red-200 hover:bg-red-100 hover:border-red-300 transition-all duration-200"
                            title="Edit Spending"
                          >
                            <Calculator className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleShowDetail(ads)}
                            className="h-8 w-8 p-0 bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100 hover:border-orange-300 transition-all duration-200"
                            title="Lihat Detail & Histori"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={16} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-500">
                      <div className="p-4 bg-slate-100 rounded-full mb-4">
                        <DollarSign className="h-8 w-8 text-slate-400" />
                      </div>
                      <p className="text-lg font-medium text-slate-600 mb-1">Tidak ada data ads spend ditemukan</p>
                      <p className="text-sm text-slate-500">Coba ubah filter atau kata kunci pencarian</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Table Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              <span>
                Menampilkan {filteredData.length} kombinasi
              </span>
            </div>
            {filteredData.length > 0 && currentDate && (
              <div className="text-slate-500">
                Terakhir diperbarui: {currentDate}
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Add Budget Modal */}
      {showAddBudgetModal && selectedAds && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white shadow-lg w-full max-w-md border-slate-200 rounded-2xl">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-200 p-6">
              <h3 className="text-xl font-bold text-slate-900 mb-1">Tambah Budget</h3>
              <p className="text-sm text-slate-600">Kode Ads: {selectedAds.kodeAds}</p>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Jumlah Budget Tambahan <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  value={newBudgetAmount ? formatInputCurrency(newBudgetAmount) : ''}
                  onChange={(e) => handleCurrencyInputChange(e.target.value, setNewBudgetAmount)}
                  placeholder="Rp 0"
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Catatan
                </label>
                <Input
                  value={newBudgetNote}
                  onChange={(e) => setNewBudgetNote(e.target.value)}
                  placeholder="Catatan penambahan budget (opsional)"
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Waktu Penambahan Budget <span className="text-red-500">*</span>
                </label>
                <Input
                  type="date"
                  value={budgetTimestamp}
                  onChange={(e) => setBudgetTimestamp(e.target.value)}
                  className="w-full"
                  required
                />
                <p className="text-xs text-slate-500 mt-1">
                  Pilih waktu kapan budget ini ditambahkan
                </p>
              </div>
              
              <div className="bg-slate-50 rounded-lg p-4">
                <div className="text-sm">
                  <div className="flex justify-between mb-2">
                    <span className="text-slate-600">Budget Saat Ini:</span>
                    <span className="font-medium">{formatCurrency(parseFloat(selectedAds.budget) || 0)}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-slate-600">Tambahan:</span>
                    <span className="font-medium text-blue-600">
                      {newBudgetAmount ? formatCurrency(parseFloat(newBudgetAmount)) : formatCurrency(0)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-slate-600 font-medium">Total Budget Baru:</span>
                    <span className="font-bold text-green-600">
                      {formatCurrency((parseFloat(selectedAds.budget) || 0) + (parseFloat(newBudgetAmount) || 0))}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 p-6 bg-slate-50 rounded-b-2xl">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowAddBudgetModal(false);
                  setNewBudgetAmount("");
                  setNewBudgetNote("");
                  setBudgetTimestamp("");
                  setSelectedAds(null);
                }}
                className="px-6 py-2 border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                Batal
              </Button>
              <Button 
                onClick={submitAddBudget}
                disabled={!newBudgetAmount}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white"
              >
                Tambah Budget
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Update Budget Spent Modal */}
      {showUpdateBudgetSpentModal && selectedAds && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white shadow-lg w-full max-w-md border-slate-200 rounded-2xl">
            <div className="bg-gradient-to-r from-red-50 to-rose-50 border-b border-slate-200 p-6">
              <h3 className="text-xl font-bold text-slate-900 mb-1">Update Spending</h3>
              <p className="text-sm text-slate-600">Kode Ads: {selectedAds.kodeAds}</p>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Total Spending <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  value={newBudgetSpent ? formatInputCurrency(newBudgetSpent) : ''}
                  onChange={(e) => handleCurrencyInputChange(e.target.value, setNewBudgetSpent)}
                  placeholder="Rp 0"
                  className="w-full"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Masukkan total spending terbaru (bukan tambahan)
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Waktu Spending <span className="text-red-500">*</span>
                </label>
                <Input
                  type="date"
                  value={spendingTimestamp}
                  onChange={(e) => setSpendingTimestamp(e.target.value)}
                  className="w-full"
                  required
                />
                <p className="text-xs text-slate-500 mt-1">
                  Pilih tanggal kapan spending iklan ini dilakukan
                </p>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <input
                  type="checkbox"
                  id="ppn-checkbox"
                  checked={includePPN}
                  onChange={(e) => setIncludePPN(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <label htmlFor="ppn-checkbox" className="text-sm font-medium text-slate-700">
                  Termasuk PPN 11%
                </label>
                <div className="ml-auto text-xs text-slate-500">
                  (otomatis menambah 11%)
                </div>
              </div>
              
              <div className="bg-slate-50 rounded-lg p-4">
                <div className="text-sm">
                  <div className="flex justify-between mb-2">
                    <span className="text-slate-600">Spending Saat Ini:</span>
                    <span className="font-medium">{formatCurrency(parseFloat(selectedAds.budgetSpent) || 0)}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-slate-600">Total Spending Baru:</span>
                    <span className="font-medium text-green-600">
                      {newBudgetSpent ? formatCurrency(parseFloat(newBudgetSpent)) : formatCurrency(0)}
                    </span>
                  </div>
                  {includePPN && newBudgetSpent && (
                    <div className="flex justify-between mb-2">
                      <span className="text-slate-600">PPN 11%:</span>
                      <span className="font-medium text-orange-600">
                        {formatCurrency(parseFloat(newBudgetSpent) * 0.11)}
                      </span>
                    </div>
                  )}
                  {includePPN && newBudgetSpent && (
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-slate-600 font-medium">Total dengan PPN:</span>
                      <span className="font-bold text-red-600">
                        {formatCurrency(parseFloat(newBudgetSpent) + (parseFloat(newBudgetSpent) * 0.11))}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 p-6 bg-slate-50 rounded-b-2xl">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowUpdateBudgetSpentModal(false);
                  setNewBudgetSpent("");
                  setIncludePPN(false);
                  setSpendingTimestamp("");
                  setSelectedAds(null);
                }}
                className="px-6 py-2 border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                Batal
              </Button>
              <Button 
                onClick={submitUpdateBudgetSpent}
                disabled={!newBudgetSpent}
                className="px-6 py-2 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white"
              >
                Update Spending
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedAds && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white shadow-lg w-full max-w-7xl border-slate-200 max-h-[95vh] overflow-auto mx-2 sm:mx-4 rounded-2xl">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-slate-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-1">Detail Ads Spend</h3>
                  <p className="text-sm text-slate-600">Kode Ads: {selectedAds.kodeAds}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDetailModal(false)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Performance Summary */}
              <div>
                <h4 className="text-lg font-semibold text-slate-900 mb-4">Ringkasan Performa</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="text-sm text-blue-600 mb-1">Total Prospek</div>
                    <div className="text-2xl font-bold text-blue-900">{selectedAds.prospek.toLocaleString()}</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="text-sm text-green-600 mb-1">Total Leads</div>
                    <div className="text-2xl font-bold text-green-900">{selectedAds.leads.toLocaleString()}</div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="text-sm text-purple-600 mb-1">Cost Per Lead</div>
                    <div className="text-xl font-bold text-purple-900">
                      {formatCurrency(selectedAds.leads > 0 ? selectedAds.budgetSpent / selectedAds.leads : 0)}
                    </div>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-4">
                    <div className="text-sm text-orange-600 mb-1">CTR Leads</div>
                    <div className="text-xl font-bold text-orange-900">
                      {((selectedAds.leads / selectedAds.prospek) * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Budget Information */}
              <div>
                <h4 className="text-lg font-semibold text-slate-900 mb-4">Informasi Budget</h4>
                <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Total Budget:</span>
                    <span className="font-medium">{formatCurrency(selectedAds.budget)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Budget Spent:</span>
                    <span className="font-medium">{formatCurrency(selectedAds.budgetSpent)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-slate-600 font-medium">Sisa Budget:</span>
                    <span className={`font-bold ${(selectedAds.budget - selectedAds.budgetSpent) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(selectedAds.budget - selectedAds.budgetSpent)}
                    </span>
                  </div>
                </div>
              </div>

              {/* History Section - Two Columns */}
              <div className="overflow-x-auto">
                <h4 className="text-xl font-semibold text-slate-900 mb-6 text-center">Riwayat Transaksi</h4>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 min-w-[800px] xl:min-w-0">
                  
                  {/* Left Column - Budget History */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200 min-w-[380px] xl:min-w-0">
                    <h5 className="text-lg font-semibold text-green-800 mb-4 flex items-center gap-2">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Wallet className="h-4 w-4 text-green-600" />
                      </div>
                      History Tambah Budget

                    </h5>
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                      {selectedAds?.budgetHistory && selectedAds.budgetHistory.length > 0 ? (
                        selectedAds.budgetHistory.map((history, index) => (
                        <div key={index} className="bg-white p-4 rounded-lg shadow-sm border border-green-100 hover:shadow-md transition-shadow">
                          <div className="space-y-3">
                            {/* Header with note and amount */}
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-slate-900 text-sm mb-2 break-words">{history.note}</div>
                              </div>
                              <div className="text-right ml-4 flex-shrink-0">
                                <div className="text-xs text-slate-500 mb-1">Budget Ditambah</div>
                                <div className="font-bold text-green-600 text-lg bg-green-50 px-3 py-1 rounded">
                                  +{formatCurrency(history.amount)}
                                </div>
                              </div>
                            </div>
                            
                            {/* Footer with timestamp and user */}
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-slate-500 pt-2 border-t border-slate-100">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3 flex-shrink-0" />
                                <span className="break-all">
                                  {new Date(history.createdAt).toLocaleDateString("id-ID", {
                                    day: "2-digit",
                                    month: "short", 
                                    year: "numeric"
                                  })} {new Date(history.createdAt).toLocaleTimeString("id-ID", {
                                    hour: "2-digit",
                                    minute: "2-digit"
                                  })}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Users className="h-3 w-3 flex-shrink-0" />
                                <span className="font-medium">{history.createdBy}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                      ) : (
                        <div className="bg-white p-6 rounded-lg text-center text-slate-500">
                          <Wallet className="h-8 w-8 mx-auto mb-2 text-slate-400" />
                          <p className="text-sm">Belum ada riwayat penambahan budget</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column - Spent History */}
                  <div className="bg-gradient-to-br from-red-50 to-rose-50 p-4 rounded-xl border border-red-200 min-w-[380px] xl:min-w-0">
                    <h5 className="text-lg font-semibold text-red-800 mb-4 flex items-center gap-2">
                      <div className="p-2 bg-red-100 rounded-lg">
                        <Wallet className="h-4 w-4 text-red-600" />
                      </div>
                      History Update Spent
                    </h5>
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                      {selectedAds?.spentHistory && selectedAds.spentHistory.length > 0 ? (
                        selectedAds.spentHistory.map((history, index) => (
                        <div key={index} className="bg-white p-4 rounded-lg shadow-sm border border-red-100 hover:shadow-md transition-shadow">
                          <div className="space-y-3">
                            {/* Header with spending details */}
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-slate-900 text-sm mb-2 break-words">
                                  {history.note || 'Update spending iklan'}
                                </div>
                                {/* Total spending info */}
                                <div className="text-xs text-slate-600 mb-1">
                                  Total Spending: <span className="font-semibold text-red-600">{formatCurrency(history.totalSpent || selectedAds.budgetSpent)}</span>
                                </div>
                                {/* Spending timestamp if available */}
                                {history.spendingTimestamp && (
                                  <div className="text-xs text-slate-600">
                                    Waktu Spending: <span className="font-medium text-blue-600">
                                      {new Date(history.spendingTimestamp).toLocaleDateString("id-ID", {
                                        day: "2-digit",
                                        month: "long", 
                                        year: "numeric"
                                      })}
                                    </span>
                                  </div>
                                )}
                              </div>
                              <div className="text-right ml-4 flex-shrink-0">
                                <div className="text-xs text-slate-500 mb-1">Spending Ditambah</div>
                                <div className="font-bold text-lg text-red-600 bg-red-50 px-3 py-1 rounded">
                                  +{formatCurrency(history.amount)}
                                </div>
                              </div>
                            </div>
                            
                            {/* Footer with timestamp and user */}
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-slate-500 pt-2 border-t border-slate-100">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3 flex-shrink-0" />
                                <span className="break-all">
                                  Update: {new Date(history.createdAt).toLocaleDateString("id-ID", {
                                    day: "2-digit",
                                    month: "short", 
                                    year: "numeric"
                                  })} {new Date(history.createdAt).toLocaleTimeString("id-ID", {
                                    hour: "2-digit",
                                    minute: "2-digit"
                                  })}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Users className="h-3 w-3 flex-shrink-0" />
                                <span className="font-medium">{history.createdBy}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                      ) : (
                        <div className="bg-white p-6 rounded-lg text-center text-slate-500">
                          <Calculator className="h-8 w-8 mx-auto mb-2 text-slate-400" />
                          <p className="text-sm">Belum ada riwayat update spending</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
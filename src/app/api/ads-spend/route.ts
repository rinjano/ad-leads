import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'current-month';
    const year = searchParams.get('year');
    const month = searchParams.get('month');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Calculate date range based on filter
    const now = new Date();
    let dateFilter: any = {};

    switch (filter) {
      case 'current-month':
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        dateFilter = {
          tanggalProspek: {
            gte: startOfMonth,
          },
        };
        break;
      case 'year-month':
        if (year && month) {
          const startOfSelectedMonth = new Date(parseInt(year), parseInt(month) - 1, 1);
          const endOfSelectedMonth = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);
          dateFilter = {
            tanggalProspek: {
              gte: startOfSelectedMonth,
              lte: endOfSelectedMonth,
            },
          };
        }
        break;
      case 'custom':
        if (startDate && endDate) {
          dateFilter = {
            tanggalProspek: {
              gte: new Date(startDate),
              lte: new Date(endDate),
            },
          };
        }
        break;
      case 'all-time':
        // No date filter
        break;
    }

    // Get all prospek with related data
    const allProspek = await prisma.prospek.findMany({
      where: dateFilter,
      include: {
        konversi_customer: {
          include: {
            konversi_customer_item: {
              include: {
                layanan: true,
              },
            },
          },
        },
      },
    });

    // Get status "Leads" ID
    const statusLeads = await prisma.statusLeads.findFirst({
      where: { nama: 'Leads' },
    });

    // Get all kode ads and sumber leads
    const kodeAdsList = await prisma.kodeAds.findMany();
    const sumberLeadsList = await prisma.sumberLeads.findMany();

    // Filter only ads channels (containing "ads" in name)
    const adsChannels = sumberLeadsList.filter(sl => 
      sl.nama.toLowerCase().includes('ads')
    );

    // Get current periode (YYYY-MM format)
    const currentPeriode = now.toISOString().slice(0, 7); // "2025-10"

    // Get all ads budgets for current periode
    const adsBudgets = await prisma.adsBudget.findMany({
      where: {
        periode: currentPeriode,
      },
    });

    // Create a map for quick lookup
    const budgetMap = new Map<string, any>();
    adsBudgets.forEach(budget => {
      const key = `${budget.kodeAdsId}_${budget.sumberLeadsId}`;
      budgetMap.set(key, budget);
    });

    // Group prospek by kodeAdsId and sumberLeadsId combination
    const adsSpendMap = new Map<string, any>();

    allProspek.forEach(prospek => {
      if (!prospek.kodeAdsId || !prospek.sumberLeadsId) return;

      // Check if sumber leads is an ads channel
      const sumberLeads = sumberLeadsList.find(sl => sl.id === prospek.sumberLeadsId);
      if (!sumberLeads || !sumberLeads.nama.toLowerCase().includes('ads')) return;

      const key = `${prospek.kodeAdsId}_${prospek.sumberLeadsId}`;
      
      if (!adsSpendMap.has(key)) {
        adsSpendMap.set(key, {
          kodeAdsId: prospek.kodeAdsId,
          sumberLeadsId: prospek.sumberLeadsId,
          prospek: [],
          leads: [],
          customers: [],
        });
      }

      const data = adsSpendMap.get(key);
      data.prospek.push(prospek);

      // Check if it's a lead
      if (statusLeads && prospek.statusLeadsId === statusLeads.id) {
        data.leads.push(prospek);
      }

      // Check if it's a customer
      if (prospek.konversi_customer && prospek.konversi_customer.length > 0) {
        data.customers.push(prospek);
      }
    });

    // Transform map to array with calculated metrics
    const adsSpendData = Array.from(adsSpendMap.values()).map((data, index) => {
      const kodeAds = kodeAdsList.find(k => k.id === data.kodeAdsId);
      const sumberLeads = sumberLeadsList.find(sl => sl.id === data.sumberLeadsId);

      const totalProspek = data.prospek.length;
      const totalLeads = data.leads.length;
      const totalCustomers = data.customers.length;

      // Calculate total nilai langganan from konversi_customer_item
      let totalNilaiLangganan = 0;
      // Collect unique layanan from customers
      const layananSet = new Set<string>();
      data.customers.forEach((customer: any) => {
        customer.konversi_customer.forEach((konversi: any) => {
          konversi.konversi_customer_item.forEach((item: any) => {
            totalNilaiLangganan += item.nilaiTransaksi;
            // Add layanan name if exists
            if (item.layanan && item.layanan.nama) {
              layananSet.add(item.layanan.nama);
            }
          });
        });
      });
      
      // Convert set to array and join with comma
      const layananList = Array.from(layananSet).join(', ') || '-';

      // Get budget data from ads_budget table
      const budgetKey = `${data.kodeAdsId}_${data.sumberLeadsId}`;
      const budgetData = budgetMap.get(budgetKey);
      
      // Use real budget data if exists, otherwise use 0 (no budget set)
      const budget = budgetData ? budgetData.budget : 0;
      const spent = budgetData ? budgetData.spent : 0;

      const costPerLead = totalLeads > 0 ? spent / totalLeads : 0;
      const ctrLeads = totalProspek > 0 ? (totalLeads / totalProspek) * 100 : 0;
      const costPerCustomer = totalCustomers > 0 ? spent / totalCustomers : 0;
      const roi = costPerCustomer > 0 && totalCustomers > 0 
        ? ((totalNilaiLangganan / totalCustomers - costPerCustomer) / costPerCustomer) * 100 
        : 0;

      // Get actual history from database
      let budgetHistory: any[] = [];
      let spentHistory: any[] = [];
      
      if (budgetData) {
        // Get budget history from JSON field
        budgetHistory = ((budgetData.budgetHistory as any[]) || []).sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        
        // Get spend history from JSON field
        spentHistory = ((budgetData.spentHistory as any[]) || []).sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }

      return {
        id: index + 1,
        kodeAds: kodeAds?.kode || 'Unknown',
        kodeAdsId: data.kodeAdsId,
        channel: sumberLeads?.nama || 'Unknown',
        sumberLeadsId: data.sumberLeadsId,
        layanan: layananList,
        budget: budget,
        budgetSpent: spent,
        sisaBudget: budget - spent,
        totalAdsSpend: spent,
        prospek: totalProspek,
        leads: totalLeads,
        costPerLead,
        ctrLeads,
        jumlahCustomer: totalCustomers,
        costPerCustomer,
        totalNilaiLangganan,
        roi,
        budgetId: budgetData?.id || null,
        budgetHistory: budgetHistory,
        spentHistory: spentHistory,
      };
    });

    // Calculate totals
    const totalProspek = adsSpendData.reduce((sum, item) => sum + item.prospek, 0);
    const totalLeads = adsSpendData.reduce((sum, item) => sum + item.leads, 0);
    const totalBudget = adsSpendData.reduce((sum, item) => sum + item.budget, 0);
    const totalAdsSpend = adsSpendData.reduce((sum, item) => sum + item.totalAdsSpend, 0);
    const sisaBudget = totalBudget - totalAdsSpend;
    const avgCostPerLead = totalLeads > 0 ? totalAdsSpend / totalLeads : 0;
    const avgCTRLeads = totalProspek > 0 ? (totalLeads / totalProspek) * 100 : 0;
    const totalCustomer = adsSpendData.reduce((sum, item) => sum + item.jumlahCustomer, 0);
    const avgCostPerCustomer = totalCustomer > 0 ? totalAdsSpend / totalCustomer : 0;
    const totalNilaiLangganan = adsSpendData.reduce((sum, item) => sum + item.totalNilaiLangganan, 0);
    const avgROI = adsSpendData.length > 0 
      ? adsSpendData.reduce((sum, item) => sum + item.roi, 0) / adsSpendData.length 
      : 0;

    return NextResponse.json({
      success: true,
      data: adsSpendData,
      totals: {
        totalProspek,
        totalLeads,
        totalBudget,
        totalAdsSpend,
        sisaBudget,
        avgCostPerLead,
        avgCTRLeads,
        totalCustomer,
        avgCostPerCustomer,
        totalNilaiLangganan,
        avgROI,
      },
      filter: {
        type: filter,
        year,
        month,
        startDate,
        endDate,
      },
    });
  } catch (error) {
    console.error('Error fetching ads spend data:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch ads spend data', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

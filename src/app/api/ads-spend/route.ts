import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = session.user.role;
    const userKodeAds = session.user.kodeAds || [];

    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'current-month';
    const year = searchParams.get('year');
    const month = searchParams.get('month');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Base filter for role-based access
    let baseFilter: any = {};

    // NOTE: Removed role-based filtering to show all kode ads
    // All users can see all ads spend data, UI will handle action permissions
    // Super admin, CS support, CS representative, and retention see all data (no additional filter)

    // Calculate date range based on filter (using tanggalJadiLeads for leads)
    const now = new Date();
    let prospekFilter: any = { ...baseFilter };
    let leadsFilter: any = { ...baseFilter };

    switch (filter) {
      case 'today': {
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        prospekFilter = {
          tanggalProspek: {
            gte: today,
          },
        };
        leadsFilter = {
          tanggalJadiLeads: {
            not: null,
            gte: today,
          },
        };
        break;
      }
      case 'yesterday': {
        const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        prospekFilter = {
          tanggalProspek: {
            gte: yesterday,
            lt: today,
          },
        };
        leadsFilter = {
          tanggalJadiLeads: {
            not: null,
            gte: yesterday,
            lt: today,
          },
        };
        break;
      }
      case 'thismonth':
      case 'current-month': {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        prospekFilter = {
          tanggalProspek: {
            gte: startOfMonth,
          },
        };
        leadsFilter = {
          tanggalJadiLeads: {
            not: null,
            gte: startOfMonth,
          },
        };
        break;
      }
      case 'this-week': {
        // Calculate start of current week (Sunday)
        const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - currentDay);
        startOfWeek.setHours(0, 0, 0, 0); // Set to beginning of day
        
        prospekFilter = {
          tanggalProspek: {
            gte: startOfWeek,
          },
        };
        leadsFilter = {
          tanggalJadiLeads: {
            not: null,
            gte: startOfWeek,
          },
        };
        break;
      }
      case 'lastmonth':
      case 'last-month': {
        // Calculate last month date range
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        prospekFilter = {
          tanggalProspek: {
            gte: lastMonth,
            lt: thisMonth,
          },
        };
        leadsFilter = {
          tanggalJadiLeads: {
            not: null,
            gte: lastMonth,
            lt: thisMonth,
          },
        };
        break;
      }
      case 'year-month': {
        // Handle specific year and month filter (used for "Bulan lalu")
        if (year && month) {
          const startOfMonth = new Date(parseInt(year), parseInt(month) - 1, 1); // Month is 0-based
          const endOfMonth = new Date(parseInt(year), parseInt(month), 1); // Start of next month
          
          prospekFilter = {
            tanggalProspek: {
              gte: startOfMonth,
              lt: endOfMonth,
            },
          };
          leadsFilter = {
            tanggalJadiLeads: {
              not: null,
              gte: startOfMonth,
              lt: endOfMonth,
            },
          };
        }
        break;
      }
      case 'custom': {
        // Handle custom date range filter
        if (startDate && endDate) {
          const start = new Date(startDate);
          const end = new Date(endDate);
          // Set end date to end of day
          end.setHours(23, 59, 59, 999);
          
          prospekFilter = {
            tanggalProspek: {
              gte: start,
              lte: end,
            },
          };
          leadsFilter = {
            tanggalJadiLeads: {
              not: null,
              gte: start,
              lte: end,
            },
          };
        }
        break;
      }
    }

    // Get all leads with related data (filter by tanggalJadiLeads)
    const allLeads = await prisma.prospek.findMany({
      where: leadsFilter,
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

    // Calculate periode based on leads filter (same logic as /laporan)
    let budgetPeriode: string | undefined;
    if (leadsFilter.tanggalJadiLeads) {
      if (leadsFilter.tanggalJadiLeads.gte) {
        const startDate = leadsFilter.tanggalJadiLeads.gte;
        budgetPeriode = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}`;
      }
    }

    // Get all ads budgets for the calculated periode
    const adsBudgets = await prisma.adsBudget.findMany({
      where: budgetPeriode ? {
        periode: budgetPeriode,
      } : {},
    });

    // Create a map for quick lookup
    const budgetMap = new Map<string, any>();
    adsBudgets.forEach(budget => {
      const key = `${budget.kodeAdsId}_${budget.sumberLeadsId}`;
      budgetMap.set(key, budget);
    });

    // Group prospek by kodeAdsId and sumberLeadsId combination
    const adsSpendMap = new Map<string, any>();

    allLeads.forEach(prospek => {
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
      // Since allLeads already contains only leads, add to both prospek and leads
      data.prospek.push(prospek);
      data.leads.push(prospek);

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
    const totalBudget = adsSpendData.reduce((sum, item) => sum + item.budget, 0);
    const totalAdsSpend = adsSpendData.reduce((sum, item) => sum + item.totalAdsSpend, 0);
    const sisaBudget = totalBudget - totalAdsSpend;
    const totalCustomer = adsSpendData.reduce((sum, item) => sum + item.jumlahCustomer, 0);
    const totalNilaiLangganan = adsSpendData.reduce((sum, item) => sum + item.totalNilaiLangganan, 0);
    const avgROI = adsSpendData.length > 0 
      ? adsSpendData.reduce((sum, item) => sum + item.roi, 0) / adsSpendData.length 
      : 0;

    // Pindahkan deklarasi totalProspek dan totalLeads ke bagian awal
    const totalProspek = await prisma.prospek.count({ where: prospekFilter });
    const totalLeads = await prisma.prospek.count({ where: leadsFilter });

    // Hitung avgCostPerLead dan avgCTRLeads setelah deklarasi
    const avgCostPerLead = totalLeads > 0 ? totalAdsSpend / totalLeads : 0;
    const avgCTRLeads = totalProspek > 0 ? (totalLeads / totalProspek) * 100 : 0;

    // Deklarasi avgCostPerCustomer
    const avgCostPerCustomer = totalCustomer > 0 ? totalAdsSpend / totalCustomer : 0;

    // Tambahkan totalProspek dan totalLeads ke respons
    return NextResponse.json({
      success: true,
      data: adsSpendData,
      totals: {
        totalProspek,
        totalLeads,
        ctrLeads: avgCTRLeads,
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

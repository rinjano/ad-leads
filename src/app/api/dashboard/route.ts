import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';

// GET - Fetch dashboard statistics
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = session.user.role;
    const userKodeAds = session.user.kodeAds || [];

    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'today';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Base filter for role-based access
    let baseFilter: any = {};

    // Apply role-based filtering
    if (userRole === 'cs_support') {
      // CS Support can only see prospects they created
      baseFilter.createdBy = session.user.name;
    } else if (userRole === 'advertiser' && userKodeAds.length > 0) {
      // Advertiser can only see prospects from their assigned kode ads
      baseFilter.kodeAdsId = {
        in: userKodeAds.map(kode => parseInt(kode.replace(/\D/g, ''))) // Extract IDs from kode strings
      };
    }
    // Super admin, CS representative, and retention see all data (no additional filter)

    // Get status "Leads" ID from database first
    const statusLeads = await prisma.statusLeads.findFirst({
      where: {
        nama: 'Leads'
      }
    });

    const leadsStatusId = statusLeads?.id;

    // Pisahkan filter prospek dan leads
    const now = new Date();
    let prospekFilter: any = { ...baseFilter };
    let leadsFilter: any = { ...baseFilter };
    switch (filter) {
      case 'today': {
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        prospekFilter = {
          tanggalProspek: {
            gte: startOfToday,
          },
        };
        leadsFilter = {
          tanggalJadiLeads: {
            gte: startOfToday,
          },
        };
        break;
      }
      case 'yesterday': {
        const startOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
        const endOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        prospekFilter = {
          tanggalProspek: {
            gte: startOfYesterday,
            lt: endOfYesterday,
          },
        };
        leadsFilter = {
          tanggalJadiLeads: {
            gte: startOfYesterday,
            lt: endOfYesterday,
          },
        };
        break;
      }
      case 'thisweek': {
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        prospekFilter = {
          tanggalProspek: {
            gte: startOfWeek,
          },
        };
        leadsFilter = {
          tanggalJadiLeads: {
            gte: startOfWeek,
          },
        };
        break;
      }
      case 'thismonth': {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        prospekFilter = {
          tanggalProspek: {
            gte: startOfMonth,
          },
        };
        leadsFilter = {
          tanggalJadiLeads: {
            gte: startOfMonth,
          },
        };
        break;
      }
      case 'lastmonth': {
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        prospekFilter = {
          tanggalProspek: {
            gte: startOfLastMonth,
            lt: endOfLastMonth,
          },
        };
        leadsFilter = {
          tanggalJadiLeads: {
            gte: startOfLastMonth,
            lt: endOfLastMonth,
          },
        };
        break;
      }
      case 'custom': {
        if (startDate && endDate) {
          const start = new Date(startDate);
          const end = new Date(endDate);

          prospekFilter = {
            tanggalProspek: {
              gte: start,
              lte: end,
            },
          };

          // For leads in custom range: prospects that were either
          // 1. Created in the date range AND have become leads, OR
          // 2. Converted to leads in the date range
          leadsFilter = {
            OR: [
              // Created in date range AND became leads
              {
                tanggalProspek: {
                  gte: start,
                  lte: end,
                },
                OR: [
                  { tanggalJadiLeads: { not: null } },
                  { statusLeadsId: leadsStatusId }
                ]
              },
              // OR converted to leads in date range
              {
                tanggalJadiLeads: {
                  gte: start,
                  lte: end,
                }
              }
            ]
          };
        }
        break;
      }
    }

    // Fetch all prospek data (prospek hari ini)
    const allProspek = await prisma.prospek.findMany({
      where: prospekFilter,
      include: {
        konversi_customer: true,
      },
    });

    // Fetch all leads data (leads hari ini) - use leadsFilter which handles the date logic properly
    const allLeads = await prisma.prospek.findMany({
      where: leadsFilter,
      include: {
        konversi_customer: true,
      },
    });

    // Calculate statistics
  // Untuk statistik prospek hari ini, totalProspek = jumlah prospek baru hari ini
  const totalProspek = allProspek.length;
  // Untuk statistik leads hari ini, totalLeads = jumlah leads baru hari ini
  const totalLeads = allLeads.length;
  // Spam tetap dihitung dari prospek hari ini
  const totalSpam = allProspek.filter(p => p.bukanLeadsId !== null).length;
  const ctrLeads = totalProspek > 0 ? ((totalLeads / totalProspek) * 100).toFixed(1) : '0.0';

    // Get previous period for comparison
    let previousDateFilter: any = {};
    let previousTotalProspek = 0;
    let previousTotalLeads = 0;
    let previousTotalSpam = 0;

    if (filter === 'today') {
      const startOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
      const endOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      previousDateFilter = {
        tanggalProspek: {
          gte: startOfYesterday,
          lt: endOfYesterday,
        },
      };
    } else if (filter === 'thismonth') {
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      previousDateFilter = {
        tanggalProspek: {
          gte: startOfLastMonth,
          lt: endOfLastMonth,
        },
      };
    }

    if (Object.keys(previousDateFilter).length > 0) {
      const previousProspek = await prisma.prospek.findMany({
        where: previousDateFilter,
      });
      previousTotalProspek = previousProspek.length;
      // Count leads: prospek yang pernah jadi leads (punya tanggalJadiLeads) ATAU status saat ini adalah Leads
      previousTotalLeads = previousProspek.filter(p => 
        p.tanggalJadiLeads !== null || (leadsStatusId && p.statusLeadsId === leadsStatusId)
      ).length;
      previousTotalSpam = previousProspek.filter(p => p.bukanLeadsId !== null).length;
    }

    // Calculate percentage changes
    const prospekChangeNum = previousTotalProspek > 0 
      ? ((totalProspek - previousTotalProspek) / previousTotalProspek) * 100
      : 0;
    const leadsChangeNum = previousTotalLeads > 0 
      ? ((totalLeads - previousTotalLeads) / previousTotalLeads) * 100
      : 0;
    const spamChangeNum = previousTotalSpam > 0 
      ? ((totalSpam - previousTotalSpam) / previousTotalSpam) * 100
      : 0;

    const prospekChange = prospekChangeNum.toFixed(1);
    const leadsChange = leadsChangeNum.toFixed(1);
    const spamChange = spamChangeNum.toFixed(1);

    // Get 7-day trend data (berdasarkan tanggalJadiLeads)
    const trendData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);

      // Jumlah leads yang tanggalJadiLeads pada hari tsb
      const dayLeads = await prisma.prospek.count({
        where: {
          tanggalJadiLeads: {
            gte: startOfDay,
            lt: endOfDay,
          },
        },
      });

      // Count customers (prospek with konversi_customer)
      const dayCustomers = await prisma.konversi_customer.count({
        where: {
          tanggalKonversi: {
            gte: startOfDay,
            lt: endOfDay,
          },
        },
      });

      const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
      trendData.push({
        day: dayNames[date.getDay()],
        leads: dayLeads,
        customer: dayCustomers,
      });
    }

    // Get top services (layanan)
    const prospekWithLayanan = await prisma.prospek.findMany({
      where: {
        ...leadsFilter, // Use leads filter to get only leads
        layananAssistId: {
          not: null,
        },
      },
    });

    const layananCount: { [key: string]: number } = {};
    prospekWithLayanan.forEach(p => {
      if (p.layananAssistId) {
        const layananIds = p.layananAssistId.split(',');
        layananIds.forEach(id => {
          const trimmedId = id.trim();
          layananCount[trimmedId] = (layananCount[trimmedId] || 0) + 1;
        });
      }
    });

    const layananList = await prisma.layanan.findMany();
    const topLayanan = Object.entries(layananCount)
      .map(([id, count]) => {
        const layanan = layananList.find(l => l.id.toString() === id);
        const ctr = totalProspek > 0 ? ((count / totalProspek) * 100).toFixed(1) : '0.0';
        return {
          name: layanan?.nama || 'Unknown',
          leads: count,
          ctr: `${ctr}%`,
        };
      })
      .sort((a, b) => b.leads - a.leads)
      .slice(0, 3);

    // Get top cities
    const cityCount: { [key: string]: number } = {};
    allLeads.forEach(p => {
      if (p.kota) {
        cityCount[p.kota] = (cityCount[p.kota] || 0) + 1;
      }
    });

    const topKota = Object.entries(cityCount)
      .map(([kota, count]) => {
        const ctr = totalProspek > 0 ? ((count / totalProspek) * 100).toFixed(1) : '0.0';
        return {
          name: kota,
          leads: count,
          ctr: `${ctr}%`,
        };
      })
      .sort((a, b) => b.leads - a.leads)
      .slice(0, 3);

    // Get top CS (picLeads)
    const csCount: { [key: string]: number } = {};
    allLeads.forEach(p => {
      if (p.picLeads) {
        csCount[p.picLeads] = (csCount[p.picLeads] || 0) + 1;
      }
    });

    const topCS = Object.entries(csCount)
      .map(([cs, count]) => {
        const ctr = totalProspek > 0 ? ((count / totalProspek) * 100).toFixed(1) : '0.0';
        return {
          name: cs,
          leads: count,
          ctr: `${ctr}%`,
        };
      })
      .sort((a, b) => b.leads - a.leads)
      .slice(0, 3);

    // Get kode ads distribution
    const kodeAdsCount: { [key: string]: number } = {};
    const prospekWithKodeAds = allProspek.filter(p => p.kodeAdsId !== null);
    
    prospekWithKodeAds.forEach(p => {
      if (p.kodeAdsId) {
        kodeAdsCount[p.kodeAdsId.toString()] = (kodeAdsCount[p.kodeAdsId.toString()] || 0) + 1;
      }
    });

    const kodeAdsList = await prisma.kodeAds.findMany();
    const totalKodeAdsProspek = prospekWithKodeAds.length;
    
    const kodeAdsData = Object.entries(kodeAdsCount)
      .map(([id, count]) => {
        const kodeAds = kodeAdsList.find(k => k.id.toString() === id);
        const percentage = totalKodeAdsProspek > 0 ? ((count / totalKodeAdsProspek) * 100).toFixed(1) : '0.0';
        return {
          name: kodeAds?.kode || 'Unknown',
          value: parseFloat(percentage),
          count: count,
        };
      })
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // Top 5 kode ads

    return NextResponse.json({
      stats: {
        totalProspek,
        totalLeads,
        totalSpam,
        ctrLeads: `${ctrLeads}%`,
        prospekChange: `${prospekChangeNum >= 0 ? '+' : ''}${prospekChange}%`,
        leadsChange: `${leadsChangeNum >= 0 ? '+' : ''}${leadsChange}%`,
        spamChange: `${spamChangeNum >= 0 ? '+' : ''}${spamChange}%`,
      },
      trendData,
      topLayanan,
      topKota,
      topCS,
      kodeAdsData,
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET - Fetch dashboard statistics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'today';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Calculate date ranges based on filter
    const now = new Date();
    let dateFilter: any = {};

    switch (filter) {
      case 'today':
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        dateFilter = {
          tanggalProspek: {
            gte: startOfToday,
          },
        };
        break;
      case 'yesterday':
        const startOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
        const endOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        dateFilter = {
          tanggalProspek: {
            gte: startOfYesterday,
            lt: endOfYesterday,
          },
        };
        break;
      case 'thisweek':
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        dateFilter = {
          tanggalProspek: {
            gte: startOfWeek,
          },
        };
        break;
      case 'thismonth':
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        dateFilter = {
          tanggalProspek: {
            gte: startOfMonth,
          },
        };
        break;
      case 'lastmonth':
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        dateFilter = {
          tanggalProspek: {
            gte: startOfLastMonth,
            lt: endOfLastMonth,
          },
        };
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
    }

    // Fetch all prospek data with status leads info
    const allProspek = await prisma.prospek.findMany({
      where: dateFilter,
      include: {
        konversi_customer: true,
      },
    });

    // Get status "Leads" ID from database
    const statusLeads = await prisma.statusLeads.findFirst({
      where: {
        nama: 'Leads'
      }
    });

    const leadsStatusId = statusLeads?.id;

    // Calculate statistics
    const totalProspek = allProspek.length;
    const totalLeads = leadsStatusId 
      ? allProspek.filter(p => p.statusLeadsId === leadsStatusId).length 
      : 0;
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
      previousTotalLeads = leadsStatusId 
        ? previousProspek.filter(p => p.statusLeadsId === leadsStatusId).length 
        : 0;
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

    // Get 7-day trend data
    const trendData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);

      const dayProspek = await prisma.prospek.count({
        where: {
          tanggalProspek: {
            gte: startOfDay,
            lt: endOfDay,
          },
        },
      });

      const dayLeads = leadsStatusId ? await prisma.prospek.count({
        where: {
          tanggalProspek: {
            gte: startOfDay,
            lt: endOfDay,
          },
          statusLeadsId: leadsStatusId,
        },
      }) : 0;

      const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
      trendData.push({
        day: dayNames[date.getDay()],
        prospek: dayProspek,
        leads: dayLeads,
      });
    }

    // Get top services (layanan)
    const prospekWithLayanan = leadsStatusId ? await prisma.prospek.findMany({
      where: {
        ...dateFilter,
        statusLeadsId: leadsStatusId,
        layananAssistId: {
          not: null,
        },
      },
    }) : [];

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
    allProspek.forEach(p => {
      if (p.kota && leadsStatusId && p.statusLeadsId === leadsStatusId) {
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
    allProspek.forEach(p => {
      if (p.picLeads && leadsStatusId && p.statusLeadsId === leadsStatusId) {
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
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

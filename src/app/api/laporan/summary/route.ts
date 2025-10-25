import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth'
import { prisma } from '@/lib/prisma'
import { getLaporanDateFilter } from '@/lib/laporan-date-filter'

export async function GET(request: NextRequest) {
  try {
    // Get session for role-based access control
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const filter = searchParams.get('filter') || 'thismonth'
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Base filter for role-based access control (KONSISTEN)
    let baseFilter: any = {}
    if (session.user.role === 'cs_support') {
      // CS Support hanya bisa lihat prospek yang dia pegang (picLeads)
      baseFilter.picLeads = session.user.name
    } else if (session.user.role === 'advertiser' && session.user.kodeAds?.length > 0) {
      // Advertiser hanya bisa lihat prospek dari kodeAds yang dia pegang
      baseFilter.kodeAdsId = {
        in: session.user.kodeAds
      }
    }
    // Super admin, CS representative, retention: lihat semua data

    // Gunakan utility filter yang konsisten
    const now = new Date();
    // Jangan pernah masukkan filter waktu ke baseFilter
    const prospekFilter = {
      ...baseFilter,
      ...getLaporanDateFilter({ type: 'prospek', periode: filter, startDate, endDate, now })
    };

    // Get status leads ID for "Leads"
    const statusLeads = await prisma.statusLeads.findFirst({
      where: { nama: 'Leads' }
    })
    const leadsStatusId = statusLeads?.id

    // Custom leads filter agar sama dengan dashboard
    let leadsFilter: any = { ...baseFilter };
    if (filter === 'custom' && startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      leadsFilter = {
        ...baseFilter,
        OR: [
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
          {
            tanggalJadiLeads: {
              gte: start,
              lte: end,
            }
          }
        ]
      };
    } else {
      leadsFilter = {
        ...baseFilter,
        ...getLaporanDateFilter({ type: 'leads', periode: filter, startDate, endDate, now })
      };
    }

    // Get total prospek count (berdasarkan tanggalProspek)
    const totalProspek = await prisma.prospek.count({
      where: prospekFilter
    })
    // Get total leads count (menggunakan filter baru)
    const totalLeads = await prisma.prospek.count({
      where: leadsFilter
    })

    // Calculate CTR Leads percentage
    const ctrLeads = totalProspek > 0
      ? parseFloat(((totalLeads / totalProspek) * 100).toFixed(1))
      : 0

    // Get bukan leads ID for "Spam"
    const bukanLeadsSpam = await prisma.bukanLeads.findFirst({
      where: { nama: 'Spam' }
    })
    const spamId = bukanLeadsSpam?.id

    // Count spam (where bukanLeadsId matches "Spam")
    const totalSpam = spamId ? await prisma.prospek.count({
      where: {
        ...prospekFilter,
        bukanLeadsId: spamId
      }
    }) : 0

    return NextResponse.json({
      success: true,
      data: {
        totalProspek,
        totalLeads,
        ctrLeads: totalProspek > 0 ? parseFloat(((totalLeads / totalProspek) * 100).toFixed(1)) : 0,
        totalSpam
      },
      filter,
      dateRange: {
        start: startDate,
        end: endDate
      }
    })

  } catch (error) {
    console.error('Error fetching summary data:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch summary data',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

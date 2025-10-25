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

    // Base filter for role-based access control
    let baseFilter: any = {}
    if (session.user.role === 'cs_support') {
      baseFilter.picLeads = session.user.name
    } else if (session.user.role === 'advertiser' && session.user.kodeAds?.length > 0) {
      baseFilter.kodeAdsId = {
        in: session.user.kodeAds
      }
    }

    // Apply date filtering
    const now = new Date()
    const dateFilter = getLaporanDateFilter({ 
      type: 'prospek', 
      periode: filter, 
      startDate, 
      endDate, 
      now 
    })

    // Get total prospek count
    const totalProspek = await prisma.prospek.count({
      where: {
        ...baseFilter,
        ...dateFilter
      }
    })
    
    // Get total leads count
    const totalLeads = await prisma.prospek.count({
      where: {
        ...baseFilter,
        tanggalJadiLeads: { not: null },
        ...getLaporanDateFilter({ 
          type: 'leads', 
          periode: filter, 
          startDate, 
          endDate, 
          now 
        })
      }
    })

    // Get spam count
    const bukanLeadsSpam = await prisma.bukanLeads.findFirst({
      where: { nama: 'Spam' }
    })
    const totalSpam = bukanLeadsSpam?.id ? await prisma.prospek.count({
      where: {
        ...baseFilter,
        bukanLeadsId: bukanLeadsSpam.id,
        ...dateFilter
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

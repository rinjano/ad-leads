import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth'
import { prisma } from '@/lib/prisma'

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

    // Apply role-based filtering
    if (session.user.role === 'cs_support') {
      // CS Support can only see their own prospects
      baseFilter.createdBy = session.user.email
    } else if (session.user.role === 'advertiser' && session.user.kodeAds?.length > 0) {
      // Advertiser can only see prospects from their assigned kode ads
      baseFilter.kodeAds = {
        in: session.user.kodeAds
      }
    }
    // Super admin, CS representative, and retention see all data (no additional filter)

    // Calculate date range based on filter
    const now = new Date()
    // Pisahkan filter prospek dan leads
    let prospekFilter: any = { ...baseFilter }
    let leadsFilter: any = { ...baseFilter }
    if (filter === 'custom' && startDate && endDate) {
      prospekFilter = {
        tanggalProspek: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      }
      leadsFilter = {
        tanggalJadiLeads: {
          not: null,
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      }
    } else {
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      switch (filter) {
        case 'today':
          prospekFilter = {
            tanggalProspek: {
              gte: today
            }
          }
          leadsFilter = {
            tanggalJadiLeads: {
              not: null,
              gte: today
            }
          }
          break
        case 'yesterday': {
          const yesterday = new Date(today)
          yesterday.setDate(today.getDate() - 1)
          prospekFilter = {
            tanggalProspek: {
              gte: yesterday,
              lt: today
            }
          }
          leadsFilter = {
            tanggalJadiLeads: {
              not: null,
              gte: yesterday,
              lt: today
            }
          }
          break;
        }
        case 'thisweek': {
          const startOfWeek = new Date(today)
          startOfWeek.setDate(today.getDate() - today.getDay())
          prospekFilter = {
            tanggalProspek: {
              gte: startOfWeek
            }
          }
          leadsFilter = {
            tanggalJadiLeads: {
              not: null,
              gte: startOfWeek
            }
          }
          break;
        }
        case 'thismonth': {
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
          prospekFilter = {
            tanggalProspek: {
              gte: startOfMonth
            }
          }
          leadsFilter = {
            tanggalJadiLeads: {
              not: null,
              gte: startOfMonth
            }
          }
          break;
        }
        case 'lastmonth': {
          const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
          const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)
          prospekFilter = {
            tanggalProspek: {
              gte: startOfLastMonth,
              lte: endOfLastMonth
            }
          }
          leadsFilter = {
            tanggalJadiLeads: {
              not: null,
              gte: startOfLastMonth,
              lte: endOfLastMonth
            }
          }
          break;
        }
      }
    }

    // Get total prospek count (berdasarkan tanggalProspek)
    const totalProspek = await prisma.prospek.count({
      where: prospekFilter
    })
    // Get total leads count (berdasarkan tanggalJadiLeads)
    const totalLeads = await prisma.prospek.count({
      where: leadsFilter
    })

    // Get status leads ID for "Leads"
    const statusLeads = await prisma.statusLeads.findFirst({
      where: { nama: 'Leads' }
    })
    const leadsStatusId = statusLeads?.id

    // totalLeads sudah dihitung di atas (berdasarkan tanggalJadiLeads)
    // Jika ingin tetap hitung statusLeadsId, tambahkan filter tambahan jika perlu

    // Calculate CTR Leads percentage
    const ctrLeads = totalLeads > 0 
      ? 100
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

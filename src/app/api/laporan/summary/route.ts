import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const filter = searchParams.get('filter') || 'thismonth'
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Calculate date range based on filter
    const now = new Date()
    let dateFilter: any = {}

    if (filter === 'custom' && startDate && endDate) {
      dateFilter = {
        tanggalProspek: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      }
    } else {
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      
      switch (filter) {
        case 'today':
          dateFilter = {
            tanggalProspek: {
              gte: today
            }
          }
          break
        case 'yesterday':
          const yesterday = new Date(today)
          yesterday.setDate(yesterday.getDate() - 1)
          dateFilter = {
            tanggalProspek: {
              gte: yesterday,
              lt: today
            }
          }
          break
        case 'thisweek':
          const startOfWeek = new Date(today)
          startOfWeek.setDate(today.getDate() - today.getDay())
          dateFilter = {
            tanggalProspek: {
              gte: startOfWeek
            }
          }
          break
        case 'thismonth':
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
          dateFilter = {
            tanggalProspek: {
              gte: startOfMonth
            }
          }
          break
        case 'lastmonth':
          const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
          const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)
          dateFilter = {
            tanggalProspek: {
              gte: startOfLastMonth,
              lte: endOfLastMonth
            }
          }
          break
      }
    }

    // Get total prospek count
    const totalProspek = await prisma.prospek.count({
      where: dateFilter
    })

    // Get status leads ID for "Leads"
    const statusLeads = await prisma.statusLeads.findFirst({
      where: { nama: 'Leads' }
    })
    const leadsStatusId = statusLeads?.id

    // Count leads (where statusLeadsId matches "Leads")
    const totalLeads = leadsStatusId ? await prisma.prospek.count({
      where: {
        ...dateFilter,
        statusLeadsId: leadsStatusId
      }
    }) : 0

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
        ...dateFilter,
        bukanLeadsId: spamId
      }
    }) : 0

    return NextResponse.json({
      success: true,
      data: {
        totalProspek,
        totalLeads,
        ctrLeads,
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

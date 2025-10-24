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
        case 'yesterday': {
          const yesterday = new Date(today)
          yesterday.setDate(today.getDate() - 1)
          dateFilter = {
            tanggalProspek: {
              gte: yesterday,
              lt: today
            }
          }
          break
        }
        case 'thisweek': {
          const startOfWeek = new Date(today)
          startOfWeek.setDate(today.getDate() - today.getDay())
          dateFilter = {
            tanggalProspek: {
              gte: startOfWeek
            }
          }
          break
        }
        case 'thismonth': {
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
          dateFilter = {
            tanggalProspek: {
              gte: startOfMonth
            }
          }
          break
        }
        case 'lastmonth': {
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
    }

    // Get all prospects with their CS representatives and conversion data
    const prospects = await prisma.prospek.findMany({
      where: dateFilter,
      include: {
        konversi_customer: {
          select: {
            totalNilaiTransaksi: true
          }
        }
      }
    })

    // Group by picLeads (CS representative)
    const csPerformanceMap = new Map<string, {
      name: string
      prospek: number
      leads: number
      customer: number
      totalNilaiLangganan: number
    }>()

    prospects.forEach(prospek => {
      const csName = prospek.picLeads || 'Unknown CS'
      
      if (!csPerformanceMap.has(csName)) {
        csPerformanceMap.set(csName, {
          name: csName,
          prospek: 0,
          leads: 0,
          customer: 0,
          totalNilaiLangganan: 0
        })
      }

      const csData = csPerformanceMap.get(csName)!
      
      // Count prospects
      csData.prospek += 1
      
      // Count leads (prospects that became leads)
      if (prospek.tanggalJadiLeads) {
        csData.leads += 1
      }
      
      // Count customers and sum transaction values
      if (prospek.konversi_customer.length > 0) {
        csData.customer += 1
        csData.totalNilaiLangganan += prospek.konversi_customer.reduce(
          (sum, conversion) => sum + conversion.totalNilaiTransaksi, 
          0
        )
      }
    })

    // Convert to array and calculate CTR
    const csPerformanceData = Array.from(csPerformanceMap.values()).map(cs => ({
      ...cs,
      ctr: cs.prospek > 0 ? parseFloat(((cs.leads / cs.prospek) * 100).toFixed(1)) : 0
    }))

    // Sort by total subscription value descending
    csPerformanceData.sort((a, b) => b.totalNilaiLangganan - a.totalNilaiLangganan)

    return NextResponse.json({
      success: true,
      data: csPerformanceData,
      filter,
      dateRange: {
        start: startDate,
        end: endDate
      }
    })

  } catch (error) {
    console.error('Error fetching CS performance data:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch CS performance data',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

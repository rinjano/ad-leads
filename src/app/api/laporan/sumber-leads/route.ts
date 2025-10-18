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

    // Get all prospek with filters
    const allProspek = await prisma.prospek.findMany({
      where: dateFilter,
      include: {
        konversi_customer: {
          include: {
            konversi_customer_item: true
          }
        }
      }
    })

    // Get all sumber leads data
    const allSumberLeads = await prisma.sumberLeads.findMany()
    const sumberLeadsMapById = new Map(allSumberLeads.map(sl => [sl.id, sl]))

    // Get status leads ID for "Leads"
    const statusLeads = await prisma.statusLeads.findFirst({
      where: { nama: 'Leads' }
    })
    const leadsStatusId = statusLeads?.id

    // Group by sumber leads and calculate statistics
    const sumberLeadsMap = new Map<string, {
      id: number
      name: string
      prospek: number
      leads: number
      customer: number
      totalNilaiLangganan: number
    }>()

    allProspek.forEach(prospek => {
      const sumberLeads = sumberLeadsMapById.get(prospek.sumberLeadsId)
      const sumberName = sumberLeads?.nama || 'Unknown'
      const sumberId = sumberLeads?.id || 0
      
      if (!sumberLeadsMap.has(sumberName)) {
        sumberLeadsMap.set(sumberName, {
          id: sumberId,
          name: sumberName,
          prospek: 0,
          leads: 0,
          customer: 0,
          totalNilaiLangganan: 0
        })
      }

      const data = sumberLeadsMap.get(sumberName)!
      data.prospek++
      
      // Count leads (statusLeadsId matches "Leads")
      if (leadsStatusId && prospek.statusLeadsId === leadsStatusId) {
        data.leads++
      }

      // Count customer and total nilai langganan from konversi_customer
      if (prospek.konversi_customer && prospek.konversi_customer.length > 0) {
        data.customer++
        
        // Calculate total nilai langganan from all conversion items
        prospek.konversi_customer.forEach(konversi => {
          if (konversi.konversi_customer_item && konversi.konversi_customer_item.length > 0) {
            konversi.konversi_customer_item.forEach(item => {
              data.totalNilaiLangganan += item.nilaiTransaksi || 0
            })
          }
        })
      }
    })

    // Convert map to array and calculate CTR
    const sumberLeadsData = Array.from(sumberLeadsMap.values()).map(data => ({
      ...data,
      ctr: data.prospek > 0 ? (data.leads / data.prospek) * 100 : 0,
      ctrCustomer: data.leads > 0 ? (data.customer / data.leads) * 100 : 0
    }))

    // Sort by prospek count descending
    sumberLeadsData.sort((a, b) => b.prospek - a.prospek)

    return NextResponse.json({
      success: true,
      data: sumberLeadsData,
      filter,
      dateRange: {
        start: startDate,
        end: endDate
      }
    })

  } catch (error) {
    console.error('Error fetching sumber leads data:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch sumber leads data',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

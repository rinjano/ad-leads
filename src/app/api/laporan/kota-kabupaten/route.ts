import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const filter = searchParams.get('filter') || 'thismonth'
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const layanan = searchParams.get('layanan')
    const sumber = searchParams.get('sumber')

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

    // Build where clause
    const where: any = { ...dateFilter }

    if (layanan && layanan !== 'null' && layanan !== '') {
      where.layananAssistId = {
        contains: layanan,
        mode: 'insensitive'
      }
    }

    if (sumber && sumber !== 'null' && sumber !== '') {
      where.sumberLeadsId = parseInt(sumber)
    }

    // Get all prospek with filters
    const allProspek = await prisma.prospek.findMany({
      where,
      include: {
        konversi_customer: {
          include: {
            konversi_customer_item: true
          }
        }
      }
    })

    // Get status leads ID for "Leads"
    const statusLeads = await prisma.statusLeads.findFirst({
      where: { nama: 'Leads' }
    })
    const leadsStatusId = statusLeads?.id

    // Group by kota and calculate statistics
    const kotaMap = new Map<string, {
      kota: string
      prospek: Set<number>
      leads: Set<number>
      customer: Set<number>
      totalNilaiLangganan: number
    }>()

    allProspek.forEach(prospek => {
      const prospekId = prospek.id
      const kota = prospek.kota || 'Unknown'

      if (!prospek.kota) {
        // Skip if no kota info
        return
      }

      if (!kotaMap.has(kota)) {
        kotaMap.set(kota, {
          kota,
          prospek: new Set(),
          leads: new Set(),
          customer: new Set(),
          totalNilaiLangganan: 0
        })
      }

      const data = kotaMap.get(kota)!
      const isLead = leadsStatusId && prospek.statusLeadsId === leadsStatusId
      const hasCustomer = prospek.konversi_customer && prospek.konversi_customer.length > 0

      data.prospek.add(prospekId)
      
      if (isLead) {
        data.leads.add(prospekId)
      }
      
      if (hasCustomer) {
        data.customer.add(prospekId)
        
        // Add total nilai from conversions
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
    const kotaDataRaw = Array.from(kotaMap.values()).map(data => {
      const prospekCount = data.prospek.size
      const leadsCount = data.leads.size
      const customerCount = data.customer.size
      
      return {
        kota: data.kota,
        prospek: prospekCount,
        leads: leadsCount,
        customer: customerCount,
        totalNilaiLangganan: data.totalNilaiLangganan,
        ctrLeads: prospekCount > 0 ? (leadsCount / prospekCount) * 100 : 0,
        ctrCustomer: leadsCount > 0 ? (customerCount / leadsCount) * 100 : 0
      }
    })

    // Sort by prospek count descending
    kotaDataRaw.sort((a, b) => b.prospek - a.prospek)

    return NextResponse.json({
      success: true,
      data: kotaDataRaw,
      filter,
      dateRange: {
        start: startDate,
        end: endDate
      }
    })

  } catch (error) {
    console.error('Error fetching kota laporan data:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch kota laporan data',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

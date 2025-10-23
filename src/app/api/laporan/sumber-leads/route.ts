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
    // Pisahkan filter prospek dan leads
    let prospekFilter: any = {}
    let leadsFilter: any = {}
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

    // Get all prospek (berdasarkan tanggalProspek)
    const allProspek = await prisma.prospek.findMany({
      where: prospekFilter,
      include: {
        konversi_customer: {
          include: {
            konversi_customer_item: true
          }
        }
      }
    })
    // Get all leads (berdasarkan tanggalJadiLeads)
    const allLeads = await prisma.prospek.findMany({
      where: leadsFilter,
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

    // Inisialisasi map sumber leads dari semua sumber leads yang muncul di prospek maupun leads
    const sumberLeadsMap = new Map<string, {
      id: number
      name: string
      prospek: number
      leads: number
      customer: number
      totalNilaiLangganan: number
    }>()

    // Masukkan semua sumber leads yang muncul di prospek
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
    })
    // Masukkan semua sumber leads yang muncul di leads (jika belum ada di map)
    allLeads.forEach(lead => {
      const sumberLeads = sumberLeadsMapById.get(lead.sumberLeadsId)
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
    })

    // Hitung prospek per sumber dari allProspek
    allProspek.forEach(prospek => {
      const sumberLeads = sumberLeadsMapById.get(prospek.sumberLeadsId)
      const sumberName = sumberLeads?.nama || 'Unknown'
      if (sumberLeadsMap.has(sumberName)) {
        const data = sumberLeadsMap.get(sumberName)!
        data.prospek++
        // Count customer and total nilai langganan from konversi_customer
        if (prospek.konversi_customer && prospek.konversi_customer.length > 0) {
          data.customer++
          prospek.konversi_customer.forEach(konversi => {
            if (konversi.konversi_customer_item && konversi.konversi_customer_item.length > 0) {
              konversi.konversi_customer_item.forEach(item => {
                data.totalNilaiLangganan += item.nilaiTransaksi || 0
              })
            }
          })
        }
      }
    })
    // Hitung leads per sumber dari allLeads
    allLeads.forEach(prospek => {
      const sumberLeads = sumberLeadsMapById.get(prospek.sumberLeadsId)
      const sumberName = sumberLeads?.nama || 'Unknown'
      if (sumberLeadsMap.has(sumberName)) {
        sumberLeadsMap.get(sumberName)!.leads++
      }
    })

    // Convert map to array and calculate CTR
    const sumberLeadsDataRaw = Array.from(sumberLeadsMap.values()).map(data => ({
      ...data,
      ctr: data.prospek > 0 ? (data.leads / data.prospek) * 100 : 0,
      ctrCustomer: data.leads > 0 ? (data.customer / data.leads) * 100 : 0
    }))

    // Group non-ads sources into 'Organik' and keep 'ads' sources separate
  const adsItems = sumberLeadsDataRaw.filter(item => item.name.toLowerCase().includes('ads'))
  const organikItems = sumberLeadsDataRaw.filter(item => !item.name.toLowerCase().includes('ads'))

    let groupedData: typeof sumberLeadsDataRaw
    if (organikItems.length > 0) {
      const organikTotal = organikItems.reduce((acc, item) => {
        acc.prospek += item.prospek || 0
        acc.leads += item.leads || 0
        acc.customer += item.customer || 0
        acc.totalNilaiLangganan += item.totalNilaiLangganan || 0
        return acc
      }, { id: -1, name: 'Organik', prospek: 0, leads: 0, customer: 0, totalNilaiLangganan: 0, ctr: 0, ctrCustomer: 0 }) as any

      // Recompute CTRs for Organik
      organikTotal.ctr = organikTotal.prospek > 0 ? (organikTotal.leads / organikTotal.prospek) * 100 : 0
      organikTotal.ctrCustomer = organikTotal.leads > 0 ? (organikTotal.customer / organikTotal.leads) * 100 : 0

      // Organik first, then ads items
      groupedData = [organikTotal, ...adsItems]
    } else {
      groupedData = adsItems
    }

    // Sort by prospek count descending for consistency inside each group
    groupedData.sort((a, b) => b.prospek - a.prospek)

    // Sort organik breakdown for consistent display (desc by prospek)
    const organikBreakdown = organikItems.sort((a, b) => b.prospek - a.prospek)

    return NextResponse.json({
      success: true,
      data: groupedData,
      breakdown: {
        organik: organikBreakdown
      },
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

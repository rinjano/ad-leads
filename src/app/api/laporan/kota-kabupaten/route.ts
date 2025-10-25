import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const filter = searchParams.get('filter') || 'thismonth'
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const layanan = searchParams.get('layanan')
    const sumber = searchParams.get('sumber')

    // Build base filter for role-based access
    let baseFilter: any = {}
    if (session.user.role === 'cs_support') {
      baseFilter.createdBy = session.user.id
    } else if (session.user.role === 'advertiser' && session.user.kodeAds) {
      baseFilter.kodeAdsId = { in: session.user.kodeAds }
    }

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

    // Build where clause for prospek and leads
    const prospekWhere: any = { ...prospekFilter, ...baseFilter }
    const leadsWhere: any = { ...leadsFilter, ...baseFilter }

    if (layanan && layanan !== 'null' && layanan !== '') {
      prospekWhere.layananAssistId = {
        contains: layanan,
        mode: 'insensitive'
      }
      leadsWhere.layananAssistId = {
        contains: layanan,
        mode: 'insensitive'
      }
    }

    if (sumber && sumber !== 'null' && sumber !== '') {
      prospekWhere.sumberLeadsId = parseInt(sumber)
      leadsWhere.sumberLeadsId = parseInt(sumber)
    }

    // Get all prospek with filters
    const allProspek = await prisma.prospek.findMany({
      where: prospekWhere,
      include: {
        konversi_customer: {
          include: {
            konversi_customer_item: true
          }
        }
      }
    })

    // Get all leads with filters
    const allLeads = await prisma.prospek.findMany({
      where: leadsWhere,
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

    // Process prospek
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
      data.prospek.add(prospekId)
    })

    // Process leads
    allLeads.forEach(lead => {
      const leadId = lead.id
      const kota = lead.kota || 'Unknown'

      if (!lead.kota) {
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
      const hasCustomer = lead.konversi_customer && lead.konversi_customer.length > 0

      data.leads.add(leadId)
      
      if (hasCustomer) {
        data.customer.add(leadId)
        
        // Add total nilai from conversions
        lead.konversi_customer.forEach(konversi => {
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

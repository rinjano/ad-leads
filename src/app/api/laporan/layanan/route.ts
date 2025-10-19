import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const filter = searchParams.get('filter') || 'thismonth'
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const provinsi = searchParams.get('provinsi')
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

    // Build where clause for prospek
    const prospekWhere: any = { ...dateFilter }

    if (sumber && sumber !== 'null' && sumber !== '') {
      prospekWhere.sumberLeadsId = parseInt(sumber)
    }

    // Get status leads ID for "Leads"
    const statusLeads = await prisma.statusLeads.findFirst({
      where: { nama: 'Leads' }
    })
    const leadsStatusId = statusLeads?.id

    // Get all layanan master data for name lookup
    const allLayananMaster = await prisma.layanan.findMany()
    const layananById = new Map(allLayananMaster.map(l => [l.id.toString(), l.nama]))
    const layananByName = new Map(allLayananMaster.map(l => [l.nama, l.id]))

    // Group by layanan and calculate statistics
    const layananMap = new Map<string, {
      layanan: string
      prospek: Set<number> // Use Set to avoid duplicate counting
      leads: Set<number>
      customer: Set<number>
      totalNilaiLangganan: number
    }>()

    // ===== APPROACH 1: Get all prospek with their layanan from layananAssistId =====
    const allProspek = await prisma.prospek.findMany({
      where: prospekWhere,
      include: {
        konversi_customer: {
          include: {
            konversi_customer_item: {
              include: {
                layanan: true
              }
            }
          }
        }
      }
    })

    // Process prospek data
    allProspek.forEach(prospek => {
      const prospekId = prospek.id
      const isLead = leadsStatusId && prospek.statusLeadsId === leadsStatusId ? true : false
      const hasCustomer = prospek.konversi_customer && prospek.konversi_customer.length > 0

      // CASE 1: Prospek with conversions - group by layanan from konversi_customer_item
      if (prospek.konversi_customer && prospek.konversi_customer.length > 0) {
        prospek.konversi_customer.forEach(konversi => {
          if (konversi.konversi_customer_item && konversi.konversi_customer_item.length > 0) {
            konversi.konversi_customer_item.forEach(item => {
              const layananName = item.layanan?.nama || 'Unknown'
              
              if (!layananMap.has(layananName)) {
                layananMap.set(layananName, {
                  layanan: layananName,
                  prospek: new Set(),
                  leads: new Set(),
                  customer: new Set(),
                  totalNilaiLangganan: 0
                })
              }
              
              const data = layananMap.get(layananName)!
              data.prospek.add(prospekId)
              
              if (isLead) {
                data.leads.add(prospekId)
              }
              
              if (hasCustomer) {
                data.customer.add(prospekId)
              }
              
              data.totalNilaiLangganan += item.nilaiTransaksi || 0
            })
          }
        })
      } else if (prospek.layananAssistId) {
        // CASE 2: Prospek without conversions - use layananAssistId as fallback
        // layananAssistId might contain multiple services separated by comma or might be IDs
        const layananItems = prospek.layananAssistId
          .split(',')
          .map((s: string) => s.trim())
          .filter((s: string) => s.length > 0)
        
        layananItems.forEach((layananItem: string) => {
          // Try to resolve as ID first, then as name
          let layananName = layananItem
          
          // If it looks like an ID (all digits), try to resolve it
          if (/^\d+$/.test(layananItem) && layananById.has(layananItem)) {
            layananName = layananById.get(layananItem)!
          }
          // Otherwise treat it as a name directly
          
          if (!layananMap.has(layananName)) {
            layananMap.set(layananName, {
              layanan: layananName,
              prospek: new Set(),
              leads: new Set(),
              customer: new Set(),
              totalNilaiLangganan: 0
            })
          }
          
          const data = layananMap.get(layananName)!
          data.prospek.add(prospekId)
          
          if (isLead) {
            data.leads.add(prospekId)
          }
          
          if (hasCustomer) {
            data.customer.add(prospekId)
          }
        })
      }
    })

    // Convert map to array and calculate CTR
    const layananDataRaw = Array.from(layananMap.values()).map(data => {
      const prospekCount = data.prospek.size
      const leadsCount = data.leads.size
      const customerCount = data.customer.size
      
      return {
        layanan: data.layanan,
        prospek: prospekCount,
        leads: leadsCount,
        customer: customerCount,
        totalNilaiLangganan: data.totalNilaiLangganan,
        ctrLeads: prospekCount > 0 ? (leadsCount / prospekCount) * 100 : 0,
        ctrCustomer: leadsCount > 0 ? (customerCount / leadsCount) * 100 : 0
      }
    })

    // Sort by prospek count descending
    layananDataRaw.sort((a, b) => b.prospek - a.prospek)

    return NextResponse.json({
      success: true,
      data: layananDataRaw,
      filter,
      dateRange: {
        start: startDate,
        end: endDate
      }
    })

  } catch (error) {
    console.error('Error fetching laporan layanan data:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch laporan layanan data',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

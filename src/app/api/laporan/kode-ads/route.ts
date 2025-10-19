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

    // Get all kode ads
    const allKodeAds = await prisma.kodeAds.findMany()
    const kodeAdsMapById = new Map(allKodeAds.map(ka => [ka.id, ka]))

    // Get status leads ID for "Leads"
    const statusLeads = await prisma.statusLeads.findFirst({
      where: { nama: 'Leads' }
    })
    const leadsStatusId = statusLeads?.id

    // Group by kode ads and calculate statistics
    const kodeAdsMap = new Map<string, {
      id: number
      kode: string
      prospek: number
      leads: number
      customer: number
      totalNilaiLangganan: number
      idAds: Map<string, {
        id: string
        prospek: number
        leads: number
        customer: number
        totalNilaiLangganan: number
      }>
    }>()

    allProspek.forEach(prospek => {
      // Skip if no kode ads
      if (!prospek.kodeAdsId) return

      const kodeAds = kodeAdsMapById.get(prospek.kodeAdsId)
      const kodeAdsCode = kodeAds?.kode || 'Unknown'
      const kodeAdsId = kodeAds?.id || 0
      
      if (!kodeAdsMap.has(kodeAdsCode)) {
        kodeAdsMap.set(kodeAdsCode, {
          id: kodeAdsId,
          kode: kodeAdsCode,
          prospek: 0,
          leads: 0,
          customer: 0,
          totalNilaiLangganan: 0,
          idAds: new Map()
        })
      }

      const data = kodeAdsMap.get(kodeAdsCode)!
      data.prospek++
      
      // Count leads: prospek yang pernah jadi leads (punya tanggalJadiLeads) ATAU status saat ini adalah Leads
      if (prospek.tanggalJadiLeads !== null || (leadsStatusId && prospek.statusLeadsId === leadsStatusId)) {
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

      // Group by ID Ads if available
      if (prospek.idAds) {
        const idAdsKey = prospek.idAds
        
        if (!data.idAds.has(idAdsKey)) {
          data.idAds.set(idAdsKey, {
            id: idAdsKey,
            prospek: 0,
            leads: 0,
            customer: 0,
            totalNilaiLangganan: 0
          })
        }

        const idAdsData = data.idAds.get(idAdsKey)!
        idAdsData.prospek++

        // Count leads for this ID Ads: prospek yang pernah jadi leads ATAU status saat ini adalah Leads
        if (prospek.tanggalJadiLeads !== null || (leadsStatusId && prospek.statusLeadsId === leadsStatusId)) {
          idAdsData.leads++
        }

        // Count customer for this ID Ads
        if (prospek.konversi_customer && prospek.konversi_customer.length > 0) {
          idAdsData.customer++
          
          // Calculate total nilai langganan for this ID Ads
          prospek.konversi_customer.forEach(konversi => {
            if (konversi.konversi_customer_item && konversi.konversi_customer_item.length > 0) {
              konversi.konversi_customer_item.forEach(item => {
                idAdsData.totalNilaiLangganan += item.nilaiTransaksi || 0
              })
            }
          })
        }
      }
    })

    // Convert map to array and calculate CTR
    const kodeAdsData = Array.from(kodeAdsMap.values()).map(data => ({
      id: data.id,
      kode: data.kode,
      prospek: data.prospek,
      leads: data.leads,
      customer: data.customer,
      totalNilaiLangganan: data.totalNilaiLangganan,
      ctr: data.prospek > 0 ? (data.leads / data.prospek) * 100 : 0,
      ctrCustomer: data.leads > 0 ? (data.customer / data.leads) * 100 : 0,
      idAds: Array.from(data.idAds.values()).map(idAds => ({
        id: idAds.id,
        prospek: idAds.prospek,
        leads: idAds.leads,
        customer: idAds.customer,
        totalNilaiLangganan: idAds.totalNilaiLangganan,
        ctr: idAds.prospek > 0 ? ((idAds.leads / idAds.prospek) * 100).toFixed(1) + '%' : '0.0%',
        ctrCustomer: idAds.leads > 0 ? ((idAds.customer / idAds.leads) * 100).toFixed(1) + '%' : '0.0%'
      }))
    }))

    // Sort by prospek count descending
    kodeAdsData.sort((a, b) => b.prospek - a.prospek)

    return NextResponse.json({
      success: true,
      data: kodeAdsData,
      filter,
      dateRange: {
        start: startDate,
        end: endDate
      }
    })

  } catch (error) {
    console.error('Error fetching kode ads data:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch kode ads data',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

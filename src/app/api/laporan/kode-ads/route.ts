import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { getLaporanDateFilter } from '@/lib/laporan-date-filter'

export async function GET(request: NextRequest) {
  try {
    // Get session for role-based access control
    const session = await auth()
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

    // Apply role-based filtering (KONSISTEN)
    if (session.user.role === 'cs_support') {
      // CS Support hanya bisa lihat prospek yang dia pegang (picLeads)
      baseFilter.picLeads = session.user.name
    // } else if (session.user.role === 'advertiser' && session.user.kodeAds?.length > 0) {
    //   // Advertiser hanya bisa lihat prospek dari kodeAds yang dia pegang
    //   baseFilter.kodeAdsId = {
    //     in: session.user.kodeAds
    //   }
    }
    // Super admin, CS representative, retention: lihat semua data

    // Gunakan utility filter yang konsisten
    const now = new Date();
    const prospekFilter = {
      ...baseFilter,
      ...getLaporanDateFilter({ type: 'prospek', periode: filter, startDate, endDate, now })
    };
    const leadsFilter = {
      ...baseFilter,
      ...getLaporanDateFilter({ type: 'leads', periode: filter, startDate, endDate, now })
    };

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

    // Get all kode ads
    const allKodeAds = await prisma.kodeAds.findMany()
    const kodeAdsMapById = new Map(allKodeAds.map(ka => [ka.id, ka]))

    // Get status leads ID for "Leads"
    const statusLeads = await prisma.statusLeads.findFirst({
      where: { nama: 'Leads' }
    })
    const leadsStatusId = statusLeads?.id

    // Inisialisasi map kode ads dari semua kode ads yang muncul di prospek maupun leads
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

    // Jika ada prospek hari ini, inisialisasi dari prospek. Jika tidak, inisialisasi hanya dari leads.
    if (allProspek.length > 0) {
      allProspek.forEach(prospek => {
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
      })
    } else {
      allLeads.forEach(lead => {
        if (!lead.kodeAdsId) return
        const kodeAds = kodeAdsMapById.get(lead.kodeAdsId)
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
      })
    }
    // Masukkan semua kode ads yang muncul di leads (jika belum ada di map)
    allLeads.forEach(lead => {
      if (!lead.kodeAdsId) return
      const kodeAds = kodeAdsMapById.get(lead.kodeAdsId)
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
    })

    // Hitung prospek per kode ads dari allProspek (hanya tanggalProspek sesuai filter)
    allProspek.forEach(prospek => {
      if (!prospek.kodeAdsId) return
      const kodeAds = kodeAdsMapById.get(prospek.kodeAdsId)
      const kodeAdsCode = kodeAds?.kode || 'Unknown'
      if (kodeAdsMap.has(kodeAdsCode)) {
        const data = kodeAdsMap.get(kodeAdsCode)!
        // Prospek hanya dihitung jika tanggalProspek sesuai filter (sudah difilter di allProspek)
        data.prospek++
        // Count customer and total nilai langganan dari konversi_customer
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
        // Group by ID Ads jika ada (prospek)
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
          // Count customer for this ID Ads
          if (prospek.konversi_customer && prospek.konversi_customer.length > 0) {
            idAdsData.customer++
            prospek.konversi_customer.forEach(konversi => {
              if (konversi.konversi_customer_item && konversi.konversi_customer_item.length > 0) {
                konversi.konversi_customer_item.forEach(item => {
                  idAdsData.totalNilaiLangganan += item.nilaiTransaksi || 0
                })
              }
            })
          }
        }
      }
    })
    // Hitung leads per kode ads dari allLeads
    allLeads.forEach(lead => {
      if (!lead.kodeAdsId) return
      const kodeAds = kodeAdsMapById.get(lead.kodeAdsId)
      const kodeAdsCode = kodeAds?.kode || 'Unknown'
      if (kodeAdsMap.has(kodeAdsCode)) {
        const data = kodeAdsMap.get(kodeAdsCode)!
        data.leads++
        // Count customer and total nilai langganan from konversi_customer
        if (lead.konversi_customer && lead.konversi_customer.length > 0) {
          data.customer++
          lead.konversi_customer.forEach(konversi => {
            if (konversi.konversi_customer_item && konversi.konversi_customer_item.length > 0) {
              konversi.konversi_customer_item.forEach(item => {
                data.totalNilaiLangganan += item.nilaiTransaksi || 0
              })
            }
          })
        }
        // Group by ID Ads if available (dari leads)
        if (lead.idAds) {
          const idAdsKey = lead.idAds
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
          idAdsData.leads++
          // Count customer for this ID Ads
          if (lead.konversi_customer && lead.konversi_customer.length > 0) {
            idAdsData.customer++
            lead.konversi_customer.forEach(konversi => {
              if (konversi.konversi_customer_item && konversi.konversi_customer_item.length > 0) {
                konversi.konversi_customer_item.forEach(item => {
                  idAdsData.totalNilaiLangganan += item.nilaiTransaksi || 0
                })
              }
            })
          }
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

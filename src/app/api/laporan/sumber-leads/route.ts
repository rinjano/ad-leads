import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth'
import { prisma } from '@/lib/prisma'
import { getLaporanDateFilter } from '@/lib/laporan-date-filter'

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

    // Apply role-based filtering (KONSISTEN)
    if (session.user.role === 'cs_support') {
      // CS Support hanya bisa lihat prospek yang dia pegang (picLeads)
      baseFilter.picLeads = session.user.name
    } else if (session.user.role === 'advertiser' && session.user.kodeAds?.length > 0) {
      // Advertiser hanya bisa lihat prospek dari kodeAds yang dia pegang
      baseFilter.kodeAdsId = {
        in: session.user.kodeAds
      }
    }
    // Super admin, CS representative, retention: lihat semua data

    // Gunakan utility filter yang konsisten
    const now = new Date();
    // Jangan pernah masukkan filter waktu ke baseFilter
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

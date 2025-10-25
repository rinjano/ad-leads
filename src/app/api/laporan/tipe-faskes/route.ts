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
    const provinsi = searchParams.get('provinsi')
    const layanan = searchParams.get('layanan')

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
    const prospekFilter = {
      ...baseFilter,
      ...getLaporanDateFilter({ type: 'prospek', periode: filter, startDate, endDate, now })
    };
    const leadsFilter = {
      ...baseFilter,
      ...getLaporanDateFilter({ type: 'leads', periode: filter, startDate, endDate, now })
    };

    // Build where clause
    const where: any = { ...prospekFilter }

    if (provinsi && provinsi !== 'null' && provinsi !== '') {
      where.provinsi = provinsi
    }

    if (layanan && layanan !== 'null' && layanan !== '') {
      where.layananAssistId = {
        contains: layanan,
        mode: 'insensitive'
      }
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

    // Get all TipeFaskes for name lookup
    const allTipeFaskes = await prisma.tipeFaskes.findMany()
    const tipeFaskesById = new Map(allTipeFaskes.map(t => [t.id, t.nama]))

    // Ambil semua prospek dan leads sesuai filter
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

    // Inisialisasi tipeFaskesMap dari semua tipe faskes yang muncul di prospek maupun leads
    const tipeFaskesMap = new Map<number, {
      tipeFaskesId: number
      label: string
      prospek: Set<number>
      leads: Set<number>
      customer: Set<number>
      totalNilaiLangganan: number
    }>()

    // Dari prospek
    allProspek.forEach(prospek => {
      const tipeFaskesId = prospek.tipeFaskesId
      const label = tipeFaskesId && tipeFaskesById.has(tipeFaskesId) 
        ? tipeFaskesById.get(tipeFaskesId)!
        : prospek.namaFaskes || 'Unknown'
      if (!tipeFaskesId && !prospek.namaFaskes) return
      const keyId = tipeFaskesId || 0
      if (!tipeFaskesMap.has(keyId)) {
        tipeFaskesMap.set(keyId, {
          tipeFaskesId: tipeFaskesId || 0,
          label,
          prospek: new Set(),
          leads: new Set(),
          customer: new Set(),
          totalNilaiLangganan: 0
        })
      }
    })
    // Dari leads
    allLeads.forEach(prospek => {
      const tipeFaskesId = prospek.tipeFaskesId
      const label = tipeFaskesId && tipeFaskesById.has(tipeFaskesId) 
        ? tipeFaskesById.get(tipeFaskesId)!
        : prospek.namaFaskes || 'Unknown'
      if (!tipeFaskesId && !prospek.namaFaskes) return
      const keyId = tipeFaskesId || 0
      if (!tipeFaskesMap.has(keyId)) {
        tipeFaskesMap.set(keyId, {
          tipeFaskesId: tipeFaskesId || 0,
          label,
          prospek: new Set(),
          leads: new Set(),
          customer: new Set(),
          totalNilaiLangganan: 0
        })
      }
    })

    // Dari prospek
    allProspek.forEach(prospek => {
      const prospekId = prospek.id
      const tipeFaskesId = prospek.tipeFaskesId
      const label = tipeFaskesId && tipeFaskesById.has(tipeFaskesId) 
        ? tipeFaskesById.get(tipeFaskesId)!
        : prospek.namaFaskes || 'Unknown'
      if (!tipeFaskesId && !prospek.namaFaskes) return
      const keyId = tipeFaskesId || 0
      const data = tipeFaskesMap.get(keyId)!
      const isLead = prospek.tanggalJadiLeads !== null || (leadsStatusId && prospek.statusLeadsId === leadsStatusId)
      const hasCustomer = prospek.konversi_customer && prospek.konversi_customer.length > 0
      data.prospek.add(prospekId)
      if (isLead) {
        data.leads.add(prospekId)
      }
      if (hasCustomer) {
        data.customer.add(prospekId)
        prospek.konversi_customer.forEach(konversi => {
          if (konversi.konversi_customer_item && konversi.konversi_customer_item.length > 0) {
            konversi.konversi_customer_item.forEach(item => {
              data.totalNilaiLangganan += item.nilaiTransaksi || 0
            })
          }
        })
      }
    })
    // Dari leads
    allLeads.forEach(prospek => {
      const prospekId = prospek.id
      const tipeFaskesId = prospek.tipeFaskesId
      const label = tipeFaskesId && tipeFaskesById.has(tipeFaskesId) 
        ? tipeFaskesById.get(tipeFaskesId)!
        : prospek.namaFaskes || 'Unknown'
      if (!tipeFaskesId && !prospek.namaFaskes) return
      const keyId = tipeFaskesId || 0
      const data = tipeFaskesMap.get(keyId)!
      const isLead = true
      const hasCustomer = prospek.konversi_customer && prospek.konversi_customer.length > 0
      data.leads.add(prospekId)
      if (hasCustomer) {
        data.customer.add(prospekId)
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
    const tipeFaskesDataRaw = Array.from(tipeFaskesMap.values()).map(data => {
      const prospekCount = data.prospek.size
      const leadsCount = data.leads.size
      const customerCount = data.customer.size
      
      return {
        label: data.label,
        prospek: prospekCount,
        leads: leadsCount,
        customer: customerCount,
        totalNilaiLangganan: data.totalNilaiLangganan,
        ctrLeads: prospekCount > 0 ? (leadsCount / prospekCount) * 100 : 0,
        ctrCustomer: leadsCount > 0 ? (customerCount / leadsCount) * 100 : 0
      }
    })

    // Sort by prospek count descending
    tipeFaskesDataRaw.sort((a, b) => b.prospek - a.prospek)

    return NextResponse.json({
      success: true,
      data: tipeFaskesDataRaw,
      filter,
      dateRange: {
        start: startDate,
        end: endDate
      }
    })

  } catch (error) {
    console.error('Error fetching tipe faskes laporan data:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch tipe faskes laporan data',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

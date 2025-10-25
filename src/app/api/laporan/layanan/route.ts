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
    const sumber = searchParams.get('sumber')

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

    // Build where clause for prospek
    const prospekWhere: any = { ...prospekFilter }

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

    // Ambil semua prospek dan leads sesuai filter
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
    const allLeads = await prisma.prospek.findMany({
      where: leadsFilter,
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

    // Inisialisasi layananMap dari semua layanan yang muncul di prospek maupun leads
    allProspek.forEach(prospek => {
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
            })
          }
        })
      } else if (prospek.layananAssistId) {
        const layananItems = prospek.layananAssistId
          .split(',')
          .map((s: string) => s.trim())
          .filter((s: string) => s.length > 0)
        layananItems.forEach((layananItem: string) => {
          let layananName = layananItem
          if (/^\d+$/.test(layananItem) && layananById.has(layananItem)) {
            layananName = layananById.get(layananItem)!
          }
          if (!layananMap.has(layananName)) {
            layananMap.set(layananName, {
              layanan: layananName,
              prospek: new Set(),
              leads: new Set(),
              customer: new Set(),
              totalNilaiLangganan: 0
            })
          }
        })
      }
    })
    allLeads.forEach(prospek => {
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
            })
          }
        })
      } else if (prospek.layananAssistId) {
        const layananItems = prospek.layananAssistId
          .split(',')
          .map((s: string) => s.trim())
          .filter((s: string) => s.length > 0)
        layananItems.forEach((layananItem: string) => {
          let layananName = layananItem
          if (/^\d+$/.test(layananItem) && layananById.has(layananItem)) {
            layananName = layananById.get(layananItem)!
          }
          if (!layananMap.has(layananName)) {
            layananMap.set(layananName, {
              layanan: layananName,
              prospek: new Set(),
              leads: new Set(),
              customer: new Set(),
              totalNilaiLangganan: 0
            })
          }
        })
      }
    })

    // Process prospek data
    allProspek.forEach(prospek => {
      const prospekId = prospek.id
      const isLead = prospek.tanggalJadiLeads !== null || (leadsStatusId && prospek.statusLeadsId === leadsStatusId)
      const hasCustomer = prospek.konversi_customer && prospek.konversi_customer.length > 0
      if (prospek.konversi_customer && prospek.konversi_customer.length > 0) {
        prospek.konversi_customer.forEach(konversi => {
          if (konversi.konversi_customer_item && konversi.konversi_customer_item.length > 0) {
            konversi.konversi_customer_item.forEach(item => {
              const layananName = item.layanan?.nama || 'Unknown'
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
        const layananItems = prospek.layananAssistId
          .split(',')
          .map((s: string) => s.trim())
          .filter((s: string) => s.length > 0)
        layananItems.forEach((layananItem: string) => {
          let layananName = layananItem
          if (/^\d+$/.test(layananItem) && layananById.has(layananItem)) {
            layananName = layananById.get(layananItem)!
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
    // Process leads data
    allLeads.forEach(prospek => {
      const prospekId = prospek.id
      const isLead = true
      const hasCustomer = prospek.konversi_customer && prospek.konversi_customer.length > 0
      if (prospek.konversi_customer && prospek.konversi_customer.length > 0) {
        prospek.konversi_customer.forEach(konversi => {
          if (konversi.konversi_customer_item && konversi.konversi_customer_item.length > 0) {
            konversi.konversi_customer_item.forEach(item => {
              const layananName = item.layanan?.nama || 'Unknown'
              const data = layananMap.get(layananName)!
              data.leads.add(prospekId)
              if (hasCustomer) {
                data.customer.add(prospekId)
              }
              data.totalNilaiLangganan += item.nilaiTransaksi || 0
            })
          }
        })
      } else if (prospek.layananAssistId) {
        const layananItems = prospek.layananAssistId
          .split(',')
          .map((s: string) => s.trim())
          .filter((s: string) => s.length > 0)
        layananItems.forEach((layananItem: string) => {
          let layananName = layananItem
          if (/^\d+$/.test(layananItem) && layananById.has(layananItem)) {
            layananName = layananById.get(layananItem)!
          }
          const data = layananMap.get(layananName)!
          data.leads.add(prospekId)
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

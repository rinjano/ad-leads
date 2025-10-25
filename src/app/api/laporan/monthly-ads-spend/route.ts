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

    const { searchParams } = new URL(request.url)
    const dateRange = searchParams.get('dateRange') || 'thismonth'
    const customStartDate = searchParams.get('customStartDate')
    const customEndDate = searchParams.get('customEndDate')

    // Build base filter for role-based access
    let baseFilter: any = {}
    if (session.user.role === 'cs_support') {
      baseFilter.createdBy = session.user.id
    } else if (session.user.role === 'advertiser' && session.user.kodeAds) {
      baseFilter.kodeAdsId = { in: session.user.kodeAds }
    }

    // Build date filter
    let dateFilter: any = {}
    const now = new Date()

    if (dateRange === 'custom' && customStartDate && customEndDate) {
      dateFilter = {
        tanggalProspek: {
          gte: new Date(customStartDate),
          lte: new Date(customEndDate)
        }
      }
    } else {
      switch (dateRange) {
        case 'today':
          dateFilter = {
            tanggalProspek: {
              gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
              lt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
            }
          }
          break
        case 'yesterday':
          const yesterday = new Date(now)
          yesterday.setDate(yesterday.getDate() - 1)
          dateFilter = {
            tanggalProspek: {
              gte: new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate()),
              lt: new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate() + 1)
            }
          }
          break
        case 'thisweek':
          const startOfWeek = new Date(now)
          startOfWeek.setDate(now.getDate() - now.getDay())
          dateFilter = {
            tanggalProspek: {
              gte: startOfWeek,
              lte: now
            }
          }
          break
        case 'thismonth':
          dateFilter = {
            tanggalProspek: {
              gte: new Date(now.getFullYear(), now.getMonth(), 1),
              lte: now
            }
          }
          break
        case 'lastmonth':
          const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
          const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)
          dateFilter = {
            tanggalProspek: {
              gte: lastMonth,
              lte: endOfLastMonth
            }
          }
          break
        default:
          dateFilter = {
            tanggalProspek: {
              gte: new Date(now.getFullYear(), now.getMonth(), 1),
              lte: now
            }
          }
      }
    }

    // Get all prospects with related data - only include ads-related prospects
    const prospects = await prisma.prospek.findMany({
      where: {
        ...dateFilter,
        kodeAdsId: {
          not: null
        },
        ...baseFilter
      },
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

    // Get kode ads and sumber leads maps
    const allKodeAds = await prisma.kodeAds.findMany()
    const kodeAdsMap = new Map(allKodeAds.map(ka => [ka.id, ka.kode]))

    const allSumberLeads = await prisma.sumberLeads.findMany()
    const sumberLeadsMap = new Map(allSumberLeads.map(sl => [sl.id, sl.nama]))

    // Group by month, year, kode_ads, and sumber_leads
    const monthlyDataMap = new Map<string, {
      month: string
      year: number
      kodeAds: string
      sumberLeads: string
      layanan: string[]
      prospek: number
      leads: number
      customer: number
      totalNilaiLangganan: number
      budgetSpent: number
    }>()

    prospects.forEach(prospek => {
      const month = new Date(prospek.tanggalProspek).toLocaleDateString('id-ID', { month: 'long' })
      const year = new Date(prospek.tanggalProspek).getFullYear()
      const kodeAds = kodeAdsMap.get(prospek.kodeAdsId) || 'Unknown'
      const sumberLeads = sumberLeadsMap.get(prospek.sumberLeadsId) || 'Unknown'
      const key = `${month}-${year}-${kodeAds}-${sumberLeads}`

      if (!monthlyDataMap.has(key)) {
        monthlyDataMap.set(key, {
          month,
          year,
          kodeAds,
          sumberLeads,
          layanan: [],
          prospek: 0,
          leads: 0,
          customer: 0,
          totalNilaiLangganan: 0,
          budgetSpent: 0 // We'll need to get this from ads_budget table
        })
      }

      const data = monthlyDataMap.get(key)!

      // Count prospects
      data.prospek += 1

      // Count leads
      if (prospek.tanggalJadiLeads) {
        data.leads += 1
      }

      // Count customers and sum transaction values
      if (prospek.konversi_customer.length > 0) {
        data.customer += 1
        data.totalNilaiLangganan += prospek.konversi_customer.reduce(
          (sum, conversion) => sum + conversion.totalNilaiTransaksi,
          0
        )
        
        // Collect unique layanan names
        const layananNames = prospek.konversi_customer.flatMap(conversion => 
          conversion.konversi_customer_item.map(item => item.layanan.nama)
        )
        const uniqueLayanan = [...new Set(layananNames)]
        data.layanan = [...new Set([...data.layanan, ...uniqueLayanan])]
      }
    })

    // Get budget data from ads_budget table
    const budgetData = await prisma.adsBudget.findMany({
      where: {
        updatedAt: dateFilter.tanggalProspek ? {
          gte: dateFilter.tanggalProspek.gte,
          lte: dateFilter.tanggalProspek.lte
        } : undefined
      }
    })

    // Add budget data to monthly data
    budgetData.forEach(budget => {
      const month = new Date(budget.updatedAt).toLocaleDateString('id-ID', { month: 'long' })
      const year = new Date(budget.updatedAt).getFullYear()
      const kodeAds = kodeAdsMap.get(budget.kodeAdsId) || 'Unknown'
      const sumberLeads = sumberLeadsMap.get(budget.sumberLeadsId) || 'Unknown'
      const key = `${month}-${year}-${kodeAds}-${sumberLeads}`

      if (monthlyDataMap.has(key)) {
        const data = monthlyDataMap.get(key)!
        data.budgetSpent += budget.spent
      }
    })    // Convert to array and calculate additional metrics
    const monthlyData = Array.from(monthlyDataMap.values()).map(item => ({
      month: item.month,
      year: item.year,
      kodeAds: item.kodeAds,
      sumberLeads: item.sumberLeads,
      layanan: item.layanan.join(', '), // Join layanan names with comma
      prospek: item.prospek,
      leads: item.leads,
      customer: item.customer,
      totalNilaiLangganan: item.totalNilaiLangganan,
      budgetSpent: item.budgetSpent,
      ctrLeads: item.prospek > 0 ? parseFloat(((item.leads / item.prospek) * 100).toFixed(1)) : 0,
      ctrCustomer: item.leads > 0 ? parseFloat(((item.customer / item.leads) * 100).toFixed(1)) : 0,
      costPerLead: item.leads > 0 ? Math.round(item.budgetSpent / item.leads) : 0
    }))

    // Sort by year and month descending
    monthlyData.sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year
      const monthOrder = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
                         'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
      return monthOrder.indexOf(b.month) - monthOrder.indexOf(a.month)
    })

    return NextResponse.json({
      success: true,
      data: monthlyData
    })

  } catch (error) {
    console.error('Error fetching monthly ads spend data:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch monthly ads spend data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
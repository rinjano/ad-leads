import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const dateRange = searchParams.get('dateRange') || 'thismonth'
    const customStartDate = searchParams.get('customStartDate')
    const customEndDate = searchParams.get('customEndDate')
    const bypassDateFilter = searchParams.get('bypassDateFilter') === 'true'

    // Build base filter for role-based access
    let baseFilter: any = {}
    // TEMPORARY: Skip role-based filtering for testing
    // if (session.user.role === 'cs_support') {
    //   baseFilter.createdBy = session.user.id
    // } else if (session.user.role === 'advertiser' && session.user.kodeAds) {
    //   baseFilter.kodeAdsId = { in: session.user.kodeAds }
    // }

    // Compute a canonical start/end for the requested dateRange (used for both
    // tanggalProspek and tanggalJadiLeads filtering). We use an exclusive end
    // (endDate is the first day after the range) which simplifies comparisons.
    let rangeStart: Date | undefined
    let rangeEnd: Date | undefined
    if (!bypassDateFilter) {
      const now = new Date()
      if (dateRange === 'custom' && customStartDate && customEndDate) {
        rangeStart = new Date(customStartDate)
        // make end exclusive by adding one day to customEndDate
        rangeEnd = new Date(new Date(customEndDate).getTime() + 24 * 60 * 60 * 1000)
      } else {
        switch (dateRange) {
          case 'today':
            rangeStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
            rangeEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
            break
          case 'yesterday':
            const yesterday = new Date(now)
            yesterday.setDate(yesterday.getDate() - 1)
            rangeStart = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate())
            rangeEnd = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate() + 1)
            break
          case 'thisweek':
            const startOfWeek = new Date(now)
            startOfWeek.setDate(now.getDate() - now.getDay())
            rangeStart = new Date(startOfWeek.getFullYear(), startOfWeek.getMonth(), startOfWeek.getDate())
            rangeEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
            break
          case 'thismonth':
            rangeStart = new Date(now.getFullYear(), now.getMonth(), 1)
            rangeEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1)
            break
          case 'lastmonth':
            const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
            rangeStart = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1)
            rangeEnd = new Date(now.getFullYear(), now.getMonth(), 1)
            break
          default:
            rangeStart = new Date(now.getFullYear(), now.getMonth(), 1)
            rangeEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1)
        }
      }
    }

    // Get prospects/leads with related data. Previously the query applied the
    // date filter only to `tanggalJadiLeads`, which makes the `prospek` count
    // effectively equal to leads (only counting rows with tanggalJadiLeads).
    // We want `prospek` to count records by `tanggalProspek` (prospect date)
    // while `leads` stays counted by `tanggalJadiLeads` (lead conversion date).
    // To support both in a single dataset we fetch rows that have kodeAdsId and
    // whose `tanggalProspek` OR `tanggalJadiLeads` falls inside the requested
    // range. When bypassDateFilter is true we fetch all records with a kode.
    const dateFilterClause: any = {}
    if (!bypassDateFilter && rangeStart && rangeEnd) {
      dateFilterClause.OR = [
        { tanggalProspek: { gte: rangeStart, lt: rangeEnd } },
        { tanggalJadiLeads: { gte: rangeStart, lt: rangeEnd } }
      ]
    }

    const allLeads = await prisma.prospek.findMany({
      where: {
        kodeAdsId: { not: null },
        ...dateFilterClause,
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

    // Filter only ads channels (containing "ads" in name) - sama seperti /ads-spend
    const allSumberLeads = await prisma.sumberLeads.findMany()
    const adsChannels = allSumberLeads.filter(sl =>
      sl.nama.toLowerCase().includes('ads')
    )

    // Get kode ads and sumber leads maps
    const allKodeAds = await prisma.kodeAds.findMany()
    const kodeAdsMap = new Map(allKodeAds.map(ka => [ka.id, ka.kode]))
    const sumberLeadsMap = new Map(allSumberLeads.map(sl => [sl.id, sl.nama]))

    // Group by month, year, kode_ads, and sumber_leads - sama seperti /ads-spend
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

    allLeads.forEach(prospek => {
      // Check if sumber leads is an ads channel - sama seperti /ads-spend
      if (!adsChannels.some(sl => sl.id === prospek.sumberLeadsId)) return

      // Use tanggalJadiLeads for grouping month/year when present; otherwise
      // fall back to tanggalProspek so unconverted prospects are grouped in the
      // month they were created.
      const dateForGrouping = prospek.tanggalJadiLeads || prospek.tanggalProspek
      const month = new Date(dateForGrouping).toLocaleDateString('id-ID', { month: 'long' })
      const year = new Date(dateForGrouping).getFullYear()
      const kodeAds = (kodeAdsMap.get(prospek.kodeAdsId!) as string) || 'Unknown'
      const sumberLeads = (sumberLeadsMap.get(prospek.sumberLeadsId!) as string) || 'Unknown'
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
          budgetSpent: 0
        })
      }

      const data = monthlyDataMap.get(key)!

      // Count prospects by tanggalProspek (exists and inside range when range set)
      const prospekDate = prospek.tanggalProspek
      const inProspekRange = prospekDate && (!rangeStart || (new Date(prospekDate) >= rangeStart && new Date(prospekDate) < rangeEnd))
      if (inProspekRange) data.prospek += 1

      // Count leads by tanggalJadiLeads
      const leadDate = prospek.tanggalJadiLeads
      const inLeadRange = leadDate && (!rangeStart || (new Date(leadDate) >= rangeStart && new Date(leadDate) < rangeEnd))
      if (inLeadRange) data.leads += 1

      // Count customers and sum transaction values
      if (prospek.konversi_customer.length > 0) {
        data.customer += 1
        data.totalNilaiLangganan += prospek.konversi_customer.reduce(
          (sum, conversion) => sum + conversion.totalNilaiTransaksi,
          0
        )

        // Collect unique layanan names from conversions
        const layananNames = prospek.konversi_customer.flatMap(conversion =>
          conversion.konversi_customer_item.map(item => item.layanan.nama)
        )
        const uniqueLayanan = Array.from(new Set(layananNames)) as string[]
        data.layanan = Array.from(new Set([...data.layanan, ...uniqueLayanan])) as string[]
      }

      // Also collect layanan from layananAssistId field (for prospects without conversions)
      if (prospek.layananAssistId) {
        const assistLayanan = prospek.layananAssistId.split(',').map(l => l.trim()).filter(l => l)
        data.layanan = Array.from(new Set([...data.layanan, ...assistLayanan])) as string[]
      }
    })

    // Get budget data from ads_budget table - ambil semua periode jika bypassDateFilter
    const budgetData = await prisma.adsBudget.findMany({
      where: bypassDateFilter ? {} : {
        // For a period-specific query, use the computed rangeStart (we use the
        // month of rangeStart as the periode value in format YYYY-MM)
        periode: rangeStart ? `${rangeStart.getFullYear()}-${String(rangeStart.getMonth() + 1).padStart(2, '0')}` : undefined
      }
    })

    // Add budget data to monthly data
    // Hanya tambahkan spent jika kombinasi kodeAdsId & sumberLeadsId ada di data leads/prospek bulan itu
    budgetData.forEach(budget => {
      // Parse periode field (format: YYYY-MM) to get month and year
      const [yearStr, monthStr] = budget.periode.split('-');
      const year = parseInt(yearStr);
      const monthIndex = parseInt(monthStr) - 1; // JavaScript months are 0-indexed
      // Create a date object for the first day of the month to get the month name
      const monthDate = new Date(year, monthIndex, 1);
      const month = monthDate.toLocaleDateString('id-ID', { month: 'long' });
      const kodeAds = kodeAdsMap.get(budget.kodeAdsId) || 'Unknown'
      const sumberLeads = sumberLeadsMap.get(budget.sumberLeadsId) || 'Unknown'
      const key = `${month}-${year}-${kodeAds}-${sumberLeads}`
      // Hanya tambahkan spent jika key ada di monthlyDataMap (artinya ada leads/prospek)
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
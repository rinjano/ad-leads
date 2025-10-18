import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET - Fetch LTV & Retensi data
export async function GET() {
  try {
    // Fetch all conversions with related data
    const konversiList = await prisma.konversi_customer.findMany({
      include: {
        prospek: true,
        konversi_customer_item: {
          include: {
            layanan: true,
            produk: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Group by prospekId to calculate LTV
    const customerMap = new Map();

    konversiList.forEach((konversi) => {
      const prospekId = konversi.prospekId;
      
      if (!customerMap.has(prospekId)) {
        customerMap.set(prospekId, {
          prospekId: prospekId,
          prospek: konversi.prospek,
          conversions: [],
          totalLTV: 0,
          totalDuration: 0,
          renewalCount: 0,
          subscriptions: []
        });
      }

      const customerData = customerMap.get(prospekId);
      customerData.conversions.push(konversi);
      customerData.totalLTV += konversi.totalNilaiTransaksi || 0;

      // Process each subscription item
      konversi.konversi_customer_item.forEach((item) => {
        const durationInMonths = item.tipeDurasi === 'years' 
          ? item.durasiLangganan * 12 
          : item.durasiLangganan;
        
        customerData.totalDuration += durationInMonths;

        // Calculate end date
        const startDate = new Date(konversi.tanggalKonversi);
        const endDate = new Date(startDate);
        if (item.tipeDurasi === 'years') {
          endDate.setFullYear(endDate.getFullYear() + item.durasiLangganan);
        } else {
          endDate.setMonth(endDate.getMonth() + item.durasiLangganan);
        }

        // Check if subscription is still active
        const now = new Date();
        const status = endDate > now ? 'active' : 'expired';

        customerData.subscriptions.push({
          id: item.id,
          konversiId: konversi.id,
          serviceId: item.layananId,
          serviceName: item.layanan?.nama || '',
          productId: item.produkId,
          productName: item.produk?.nama || '',
          transactionValue: item.nilaiTransaksi,
          subscriptionDuration: item.durasiLangganan,
          durationType: item.tipeDurasi,
          conversionDate: konversi.tanggalKonversi,
          startDate: startDate,
          endDate: endDate,
          status: status,
          isRenewal: false, // Will be calculated later
        });
      });
    });

    // Convert map to array and calculate renewal info
    const customersData = Array.from(customerMap.values()).map((customerData) => {
      // Sort subscriptions by date
      const sortedSubs = customerData.subscriptions.sort(
        (a, b) => new Date(a.conversionDate).getTime() - new Date(b.conversionDate).getTime()
      );

      // Track renewals by service+product combination
      const serviceProductMap = new Map();
      let renewalCount = 0;

      sortedSubs.forEach((sub, index) => {
        const key = `${sub.serviceId}-${sub.productId}`;
        
        if (serviceProductMap.has(key)) {
          sub.isRenewal = true;
          renewalCount++;
        }
        
        serviceProductMap.set(key, sub.id);
      });

      customerData.renewalCount = renewalCount;

      // Determine overall status
      const activeCount = sortedSubs.filter(s => s.status === 'active').length;
      const expiredCount = sortedSubs.filter(s => s.status === 'expired').length;
      
      let overallStatus: 'active' | 'expired' | 'mixed' = 'expired';
      if (activeCount > 0 && expiredCount === 0) {
        overallStatus = 'active';
      } else if (activeCount > 0 && expiredCount > 0) {
        overallStatus = 'mixed';
      }

      // Get first and last subscription dates
      const firstSubscriptionDate = sortedSubs.length > 0 
        ? sortedSubs[0].startDate 
        : new Date();
      const lastSubscriptionDate = sortedSubs.length > 0 
        ? sortedSubs[sortedSubs.length - 1].endDate 
        : new Date();

      return {
        id: customerData.prospekId.toString(),
        name: customerData.prospek.namaFaskes || customerData.prospek.namaProspek,
        email: customerData.prospek.email || '',
        phone: customerData.prospek.noWhatsApp,
        subscriptions: sortedSubs,
        totalLTV: customerData.totalLTV,
        totalDuration: customerData.totalDuration,
        renewalCount: customerData.renewalCount,
        firstSubscriptionDate: firstSubscriptionDate,
        lastSubscriptionDate: lastSubscriptionDate,
        overallStatus: overallStatus,
      };
    });

    return NextResponse.json(customersData);
  } catch (error) {
    console.error('Error fetching LTV & Retensi data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch LTV & Retensi data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

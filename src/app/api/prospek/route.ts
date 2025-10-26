import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';

// GET - Fetch all prospek
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = session.user.role;
    const userKodeAds = session.user.kodeAds || [];

    // Base filter for role-based access
    let baseFilter: any = {};

    // Apply role-based filtering
    if (userRole === 'cs_support') {
      // CS Support can only see prospects they created
      baseFilter.createdBy = session.user.name;
    }
    // Advertiser, Super admin, CS representative, and retention see all data (no additional filter)

    const prospekList = await prisma.prospek.findMany({
      where: baseFilter,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(prospekList);
  } catch (error) {
    console.error('Error fetching prospek:', error);
    return NextResponse.json(
      { error: 'Failed to fetch prospek' },
      { status: 500 }
    );
  }
}

// POST - Create new prospek
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    console.log('Received prospek data:', body);

    const {
      tanggalProspek,
      tanggalJadiLeads,
      sumberLeads,
      kodeAds,
      idAds,
      namaProspek,
      noWhatsApp,
      email,
      statusLeads,
      bukanLeads,
      keteranganBukanLeads,
      layananAssist,
      namaFaskes,
      tipeFaskes,
      provinsi,
      kota,
      picLeads,
      keterangan,
    } = body;

    // Validation - layananAssist, namaFaskes, tipeFaskes, provinsi, kota sekarang optional
    if (!tanggalProspek || !sumberLeads || !namaProspek || !noWhatsApp || !statusLeads || !picLeads) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Find IDs from master data by name
    const sumberLeadsRecord = await prisma.sumberLeads.findFirst({
      where: { nama: sumberLeads },
    });
    
    let kodeAdsRecord = null;
    if (kodeAds && kodeAds.trim() !== '') {
      kodeAdsRecord = await prisma.kodeAds.findFirst({
        where: { kode: kodeAds },
      });
    }

    const statusLeadsRecord = await prisma.statusLeads.findFirst({
      where: { nama: statusLeads },
    });

    let bukanLeadsRecord = null;
    if (bukanLeads && bukanLeads.trim() !== '') {
      bukanLeadsRecord = await prisma.bukanLeads.findFirst({
        where: { nama: bukanLeads },
      });
    }

    // Optional fields - only fetch if provided and not empty
    // layananAssist now supports comma-separated values for multi-select
    let layananAssistValue = null;
    if (layananAssist && layananAssist.trim() !== '') {
      // layananAssist is already comma-separated string from frontend
      // We store it directly as string (nama, not ID)
      layananAssistValue = layananAssist;
    }

    let tipeFaskesRecord = null;
    if (tipeFaskes && tipeFaskes.trim() !== '') {
      tipeFaskesRecord = await prisma.tipeFaskes.findFirst({
        where: { nama: tipeFaskes },
      });
    }

    if (!sumberLeadsRecord) {
      return NextResponse.json({ error: 'Sumber Leads not found' }, { status: 400 });
    }
    if (!statusLeadsRecord) {
      return NextResponse.json({ error: 'Status Leads not found' }, { status: 400 });
    }
    // Tipe Faskes validation only if provided
    if (tipeFaskes && tipeFaskes.trim() !== '' && !tipeFaskesRecord) {
      return NextResponse.json({ error: 'Tipe Faskes not found' }, { status: 400 });
    }

    // Create prospek
    const newProspek = await prisma.prospek.create({
      data: {
        tanggalProspek: new Date(tanggalProspek),
        tanggalJadiLeads: tanggalJadiLeads && tanggalJadiLeads.trim() !== '' ? new Date(tanggalJadiLeads) : null,
        sumberLeadsId: sumberLeadsRecord.id,
        kodeAdsId: kodeAdsRecord?.id || null,
        idAds: idAds || null,
        namaProspek,
        noWhatsApp,
        email: email || null,
        statusLeadsId: statusLeadsRecord.id,
        bukanLeadsId: bukanLeadsRecord?.id || null,
        keteranganBukanLeads: keteranganBukanLeads || null,
        layananAssistId: layananAssistValue || null,
        namaFaskes: namaFaskes && namaFaskes.trim() !== '' ? namaFaskes : null,
        tipeFaskesId: tipeFaskesRecord?.id || null,
        provinsi: provinsi && provinsi.trim() !== '' ? provinsi : null,
        kota: kota && kota.trim() !== '' ? kota : null,
        picLeads,
        keterangan: keterangan || null,
        createdBy: session.user.name,
      },
    });

    console.log('Created prospek:', newProspek);
    return NextResponse.json(newProspek, { status: 201 });
  } catch (error) {
    console.error('Error creating prospek:', error);
    return NextResponse.json(
      { error: 'Failed to create prospek', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

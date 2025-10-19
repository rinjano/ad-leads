import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET - Fetch single prospek by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const prospekId = parseInt(id);

    if (isNaN(prospekId)) {
      return NextResponse.json(
        { error: 'Invalid prospek ID' },
        { status: 400 }
      );
    }

    const prospek = await prisma.prospek.findUnique({
      where: { id: prospekId },
    });

    if (!prospek) {
      return NextResponse.json(
        { error: 'Prospek not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(prospek);
  } catch (error) {
    console.error('Error fetching prospek:', error);
    return NextResponse.json(
      { error: 'Failed to fetch prospek' },
      { status: 500 }
    );
  }
}

// PUT - Update prospek
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const prospekId = parseInt(id);

    if (isNaN(prospekId)) {
      return NextResponse.json(
        { error: 'Invalid prospek ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    console.log('Received update data:', body);

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

    // Update prospek
    const updatedProspek = await prisma.prospek.update({
      where: { id: prospekId },
      data: {
        tanggalProspek: new Date(tanggalProspek),
        // Only update tanggalJadiLeads if it's explicitly provided
        // If undefined/not provided, keep existing value (don't reset to null)
        ...(tanggalJadiLeads !== undefined && {
          tanggalJadiLeads: tanggalJadiLeads && tanggalJadiLeads.trim() !== '' ? new Date(tanggalJadiLeads) : null
        }),
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
      },
    });

    console.log('Updated prospek:', updatedProspek);
    return NextResponse.json(updatedProspek);
  } catch (error) {
    console.error('Error updating prospek:', error);
    return NextResponse.json(
      { error: 'Failed to update prospek', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// DELETE - Remove prospek
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const prospekId = parseInt(id);

    if (isNaN(prospekId)) {
      return NextResponse.json(
        { error: 'Invalid prospek ID' },
        { status: 400 }
      );
    }

    await prisma.prospek.delete({
      where: { id: prospekId },
    });

    console.log('Deleted prospek:', prospekId);
    return NextResponse.json(
      { message: 'Prospek deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting prospek:', error);
    return NextResponse.json(
      { error: 'Failed to delete prospek' },
      { status: 500 }
    );
  }
}

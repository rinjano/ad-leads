import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET - Fetch all konversi customer or by prospekId
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const prospekId = searchParams.get('prospekId');

    const where = prospekId ? { prospekId: parseInt(prospekId) } : {};

    const konversiList = await prisma.konversi_customer.findMany({
      where,
      include: {
        konversi_customer_item: {
          include: {
            layanan: true,
            produk: true,
          },
        },
        prospek: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(konversiList);
  } catch (error) {
    console.error('Error fetching konversi customer:', error);
    return NextResponse.json(
      { error: 'Failed to fetch konversi customer' },
      { status: 500 }
    );
  }
}

// POST - Create new konversi customer
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Received konversi data:', body);

    const {
      prospekId,
      tanggalKonversi,
      totalNilaiTransaksi,
      keterangan,
      items,
    } = body;

    // Validation
    if (!prospekId || !tanggalKonversi || !totalNilaiTransaksi || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create konversi customer with items
    const newKonversi = await prisma.konversi_customer.create({
      data: {
        prospekId: parseInt(prospekId),
        tanggalKonversi: new Date(tanggalKonversi),
        totalNilaiTransaksi: parseFloat(totalNilaiTransaksi),
        keterangan: keterangan || null,
        updatedAt: new Date(),
        konversi_customer_item: {
          create: items.map((item: any) => ({
            layananId: parseInt(item.layananId),
            produkId: parseInt(item.produkId),
            nilaiTransaksi: parseFloat(item.nilaiTransaksi),
            durasiLangganan: parseInt(item.durasiLangganan),
            tipeDurasi: item.tipeDurasi,
            updatedAt: new Date(),
          })),
        },
      },
      include: {
        konversi_customer_item: true,
      },
    });

    console.log('Created konversi customer:', newKonversi);
    return NextResponse.json(newKonversi, { status: 201 });
  } catch (error) {
    console.error('Error creating konversi customer:', error);
    return NextResponse.json(
      { error: 'Failed to create konversi customer', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET - Fetch single konversi customer by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const konversiId = parseInt(id);

    if (isNaN(konversiId)) {
      return NextResponse.json(
        { error: 'Invalid konversi ID' },
        { status: 400 }
      );
    }

    const konversi = await prisma.konversi_customer.findUnique({
      where: { id: konversiId },
      include: {
        konversi_customer_item: {
          include: {
            layanan: true,
            produk: true,
          },
        },
        prospek: true,
      },
    });

    if (!konversi) {
      return NextResponse.json(
        { error: 'Konversi customer not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(konversi);
  } catch (error) {
    console.error('Error fetching konversi customer:', error);
    return NextResponse.json(
      { error: 'Failed to fetch konversi customer' },
      { status: 500 }
    );
  }
}

// PUT - Update konversi customer
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const konversiId = parseInt(id);

    if (isNaN(konversiId)) {
      return NextResponse.json(
        { error: 'Invalid konversi ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    console.log('Received update data:', body);

    const {
      tanggalKonversi,
      totalNilaiTransaksi,
      keterangan,
      items,
    } = body;

    // Validation
    if (!tanggalKonversi || !totalNilaiTransaksi || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Delete existing items first
    await prisma.konversi_customer_item.deleteMany({
      where: { konversiCustomerId: konversiId },
    });

    // Update konversi customer with new items
    const updatedKonversi = await prisma.konversi_customer.update({
      where: { id: konversiId },
      data: {
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

    console.log('Updated konversi customer:', updatedKonversi);
    return NextResponse.json(updatedKonversi);
  } catch (error) {
    console.error('Error updating konversi customer:', error);
    return NextResponse.json(
      { error: 'Failed to update konversi customer', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// DELETE - Remove konversi customer
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const konversiId = parseInt(id);

    if (isNaN(konversiId)) {
      return NextResponse.json(
        { error: 'Invalid konversi ID' },
        { status: 400 }
      );
    }

    // Delete items first due to foreign key constraint
    await prisma.konversi_customer_item.deleteMany({
      where: { konversiCustomerId: konversiId },
    });

    // Then delete the konversi customer
    await prisma.konversi_customer.delete({
      where: { id: konversiId },
    });

    console.log('Deleted konversi customer:', konversiId);
    return NextResponse.json(
      { message: 'Konversi customer deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting konversi customer:', error);
    return NextResponse.json(
      { error: 'Failed to delete konversi customer' },
      { status: 500 }
    );
  }
}

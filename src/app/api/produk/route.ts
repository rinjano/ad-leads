import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { produkSchema } from '@/lib/validations/produk';

// GET - Get all produk with layanan data
export async function GET() {
  try {
    const produk = await prisma.produk.findMany({
      include: {
        layanan: {
          select: {
            id: true,
            nama: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(produk, { status: 200 });
  } catch (error) {
    console.error('Error fetching produk:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data produk' },
      { status: 500 }
    );
  }
}

// POST - Create new produk
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = produkSchema.parse(body);

    // Check if layanan exists
    const layanan = await prisma.layanan.findUnique({
      where: { id: validatedData.layananId },
    });

    if (!layanan) {
      return NextResponse.json(
        { error: 'Layanan tidak ditemukan' },
        { status: 404 }
      );
    }

    // Create produk
    const produk = await prisma.produk.create({
      data: {
        nama: validatedData.nama,
        deskripsi: validatedData.deskripsi || null,
        layananId: validatedData.layananId,
      },
      include: {
        layanan: {
          select: {
            id: true,
            nama: true,
          },
        },
      },
    });

    return NextResponse.json(produk, { status: 201 });
  } catch (error: any) {
    console.error('Error creating produk:', error);
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Data tidak valid', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Gagal membuat produk' },
      { status: 500 }
    );
  }
}

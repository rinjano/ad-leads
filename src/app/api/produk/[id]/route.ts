import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { produkSchema } from '@/lib/validations/produk';

// GET - Get single produk by ID
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const produkId = parseInt(id);

    if (isNaN(produkId)) {
      return NextResponse.json(
        { error: 'ID produk tidak valid' },
        { status: 400 }
      );
    }

    const produk = await prisma.produk.findUnique({
      where: { id: produkId },
      include: {
        layanan: {
          select: {
            id: true,
            nama: true,
          },
        },
      },
    });

    if (!produk) {
      return NextResponse.json(
        { error: 'Produk tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json(produk, { status: 200 });
  } catch (error) {
    console.error('Error fetching produk:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data produk' },
      { status: 500 }
    );
  }
}

// PUT - Update produk
export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const produkId = parseInt(id);

    if (isNaN(produkId)) {
      return NextResponse.json(
        { error: 'ID produk tidak valid' },
        { status: 400 }
      );
    }

    const body = await request.json();
    
    // Validate input
    const validatedData = produkSchema.parse(body);

    // Check if produk exists
    const existingProduk = await prisma.produk.findUnique({
      where: { id: produkId },
    });

    if (!existingProduk) {
      return NextResponse.json(
        { error: 'Produk tidak ditemukan' },
        { status: 404 }
      );
    }

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

    // Update produk
    const updatedProduk = await prisma.produk.update({
      where: { id: produkId },
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

    return NextResponse.json(updatedProduk, { status: 200 });
  } catch (error: any) {
    console.error('Error updating produk:', error);
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Data tidak valid', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Gagal memperbarui produk' },
      { status: 500 }
    );
  }
}

// DELETE - Delete produk
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const produkId = parseInt(id);

    if (isNaN(produkId)) {
      return NextResponse.json(
        { error: 'ID produk tidak valid' },
        { status: 400 }
      );
    }

    // Check if produk exists
    const existingProduk = await prisma.produk.findUnique({
      where: { id: produkId },
    });

    if (!existingProduk) {
      return NextResponse.json(
        { error: 'Produk tidak ditemukan' },
        { status: 404 }
      );
    }

    // Delete produk
    await prisma.produk.delete({
      where: { id: produkId },
    });

    return NextResponse.json(
      { message: 'Produk berhasil dihapus' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting produk:', error);
    return NextResponse.json(
      { error: 'Gagal menghapus produk' },
      { status: 500 }
    );
  }
}

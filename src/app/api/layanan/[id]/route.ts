import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { layananSchema } from '@/lib/validations/layanan'

// GET - Get layanan by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params
    const id = parseInt(idParam)

    if (isNaN(id)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid ID',
        },
        { status: 400 }
      )
    }

    const layanan = await prisma.layanan.findUnique({
      where: { id },
    })

    if (!layanan) {
      return NextResponse.json(
        {
          success: false,
          message: 'Layanan tidak ditemukan',
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: layanan,
    })
  } catch (error: any) {
    console.error('Error fetching layanan:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch layanan',
        error: error.message,
      },
      { status: 500 }
    )
  }
}

// PUT - Update layanan
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params
    const id = parseInt(idParam)

    if (isNaN(id)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid ID',
        },
        { status: 400 }
      )
    }

    const body = await request.json()

    // Validate input
    const validatedData = layananSchema.parse(body)

    // Check if layanan exists
    const existing = await prisma.layanan.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          message: 'Layanan tidak ditemukan',
        },
        { status: 404 }
      )
    }

    // Check if nama already used by another layanan
    const duplicate = await prisma.layanan.findFirst({
      where: {
        nama: validatedData.nama,
        NOT: { id },
      },
    })

    if (duplicate) {
      return NextResponse.json(
        {
          success: false,
          message: 'Layanan dengan nama ini sudah ada',
        },
        { status: 400 }
      )
    }

    // Update layanan
    const layanan = await prisma.layanan.update({
      where: { id },
      data: validatedData,
    })

    return NextResponse.json({
      success: true,
      message: 'Layanan berhasil diperbarui',
      data: layanan,
    })
  } catch (error: any) {
    console.error('Error updating layanan:', error)

    if (error.name === 'ZodError') {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation error',
          errors: error.errors,
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to update layanan',
        error: error.message,
      },
      { status: 500 }
    )
  }
}

// DELETE - Delete layanan
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params
    const id = parseInt(idParam)

    if (isNaN(id)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid ID',
        },
        { status: 400 }
      )
    }

    // Check if layanan exists
    const existing = await prisma.layanan.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          message: 'Layanan tidak ditemukan',
        },
        { status: 404 }
      )
    }

    // Delete layanan
    await prisma.layanan.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: 'Layanan berhasil dihapus',
    })
  } catch (error: any) {
    console.error('Error deleting layanan:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to delete layanan',
        error: error.message,
      },
      { status: 500 }
    )
  }
}

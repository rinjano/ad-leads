import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { tipeFaskesSchema } from '@/lib/validations/tipe-faskes'

// GET - Get tipe faskes by ID
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

    const tipeFaskes = await prisma.tipeFaskes.findUnique({
      where: { id },
    })

    if (!tipeFaskes) {
      return NextResponse.json(
        {
          success: false,
          message: 'Tipe faskes tidak ditemukan',
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: tipeFaskes,
    })
  } catch (error: any) {
    console.error('Error fetching tipe faskes:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch tipe faskes',
        error: error.message,
      },
      { status: 500 }
    )
  }
}

// PUT - Update tipe faskes
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
    const validatedData = tipeFaskesSchema.parse(body)

    // Check if tipe faskes exists
    const existing = await prisma.tipeFaskes.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          message: 'Tipe faskes tidak ditemukan',
        },
        { status: 404 }
      )
    }

    // Check if nama already used by another tipe faskes
    const duplicate = await prisma.tipeFaskes.findFirst({
      where: {
        nama: validatedData.nama,
        NOT: { id },
      },
    })

    if (duplicate) {
      return NextResponse.json(
        {
          success: false,
          message: 'Tipe faskes dengan nama ini sudah ada',
        },
        { status: 400 }
      )
    }

    // Update tipe faskes
    const tipeFaskes = await prisma.tipeFaskes.update({
      where: { id },
      data: validatedData,
    })

    return NextResponse.json({
      success: true,
      message: 'Tipe faskes berhasil diperbarui',
      data: tipeFaskes,
    })
  } catch (error: any) {
    console.error('Error updating tipe faskes:', error)

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
        message: 'Failed to update tipe faskes',
        error: error.message,
      },
      { status: 500 }
    )
  }
}

// DELETE - Delete tipe faskes
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

    // Check if tipe faskes exists
    const existing = await prisma.tipeFaskes.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          message: 'Tipe faskes tidak ditemukan',
        },
        { status: 404 }
      )
    }

    // Delete tipe faskes
    await prisma.tipeFaskes.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: 'Tipe faskes berhasil dihapus',
    })
  } catch (error: any) {
    console.error('Error deleting tipe faskes:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to delete tipe faskes',
        error: error.message,
      },
      { status: 500 }
    )
  }
}

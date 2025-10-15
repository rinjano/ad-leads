import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { kodeAdsSchema } from '@/lib/validations/kode-ads'

// GET - Get kode ads by ID
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

    const kodeAds = await prisma.kodeAds.findUnique({
      where: { id },
    })

    if (!kodeAds) {
      return NextResponse.json(
        {
          success: false,
          message: 'Kode ads tidak ditemukan',
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: kodeAds,
    })
  } catch (error: any) {
    console.error('Error fetching kode ads:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch kode ads',
        error: error.message,
      },
      { status: 500 }
    )
  }
}

// PUT - Update kode ads
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
    const validatedData = kodeAdsSchema.parse(body)

    // Check if kode ads exists
    const existing = await prisma.kodeAds.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          message: 'Kode ads tidak ditemukan',
        },
        { status: 404 }
      )
    }

    // Check if kode already used by another kode ads
    const duplicate = await prisma.kodeAds.findFirst({
      where: {
        kode: validatedData.kode,
        NOT: { id },
      },
    })

    if (duplicate) {
      return NextResponse.json(
        {
          success: false,
          message: 'Kode ads sudah digunakan',
        },
        { status: 400 }
      )
    }

    // Update kode ads
    const kodeAds = await prisma.kodeAds.update({
      where: { id },
      data: validatedData,
    })

    return NextResponse.json({
      success: true,
      message: 'Kode ads berhasil diperbarui',
      data: kodeAds,
    })
  } catch (error: any) {
    console.error('Error updating kode ads:', error)

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
        message: 'Failed to update kode ads',
        error: error.message,
      },
      { status: 500 }
    )
  }
}

// DELETE - Delete kode ads
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

    // Check if kode ads exists
    const existing = await prisma.kodeAds.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          message: 'Kode ads tidak ditemukan',
        },
        { status: 404 }
      )
    }

    // Delete kode ads
    await prisma.kodeAds.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: 'Kode ads berhasil dihapus',
    })
  } catch (error: any) {
    console.error('Error deleting kode ads:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to delete kode ads',
        error: error.message,
      },
      { status: 500 }
    )
  }
}

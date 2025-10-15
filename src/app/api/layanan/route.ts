import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { layananSchema } from '@/lib/validations/layanan'

// GET - Get all layanan
export async function GET() {
  try {
    const layanan = await prisma.layanan.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    })

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

// POST - Create new layanan
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validatedData = layananSchema.parse(body)

    // Check if layanan already exists
    const existing = await prisma.layanan.findUnique({
      where: { nama: validatedData.nama },
    })

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          message: 'Layanan dengan nama ini sudah ada',
        },
        { status: 400 }
      )
    }

    // Create layanan
    const layanan = await prisma.layanan.create({
      data: validatedData,
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Layanan berhasil ditambahkan',
        data: layanan,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Error creating layanan:', error)

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
        message: 'Failed to create layanan',
        error: error.message,
      },
      { status: 500 }
    )
  }
}

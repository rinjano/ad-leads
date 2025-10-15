import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { tipeFaskesSchema } from '@/lib/validations/tipe-faskes'

// GET - Get all tipe faskes
export async function GET() {
  try {
    const tipeFaskes = await prisma.tipeFaskes.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    })

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

// POST - Create new tipe faskes
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validatedData = tipeFaskesSchema.parse(body)

    // Check if nama already exists
    const existing = await prisma.tipeFaskes.findUnique({
      where: { nama: validatedData.nama },
    })

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          message: 'Tipe faskes dengan nama ini sudah ada',
        },
        { status: 400 }
      )
    }

    // Create tipe faskes
    const tipeFaskes = await prisma.tipeFaskes.create({
      data: validatedData,
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Tipe faskes berhasil ditambahkan',
        data: tipeFaskes,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Error creating tipe faskes:', error)

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
        message: 'Failed to create tipe faskes',
        error: error.message,
      },
      { status: 500 }
    )
  }
}

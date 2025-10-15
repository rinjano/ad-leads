import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { kodeAdsSchema } from '@/lib/validations/kode-ads'

// GET - Get all kode ads
export async function GET() {
  try {
    const kodeAds = await prisma.kodeAds.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    })

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

// POST - Create new kode ads
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validatedData = kodeAdsSchema.parse(body)

    // Check if kode already exists
    const existing = await prisma.kodeAds.findUnique({
      where: { kode: validatedData.kode },
    })

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          message: 'Kode ads sudah ada',
        },
        { status: 400 }
      )
    }

    // Create kode ads
    const kodeAds = await prisma.kodeAds.create({
      data: validatedData,
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Kode ads berhasil ditambahkan',
        data: kodeAds,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Error creating kode ads:', error)

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
        message: 'Failed to create kode ads',
        error: error.message,
      },
      { status: 500 }
    )
  }
}

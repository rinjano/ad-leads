import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sumberLeadsSchema } from '@/lib/validations/sumber-leads'

// GET - Get all sumber leads
export async function GET() {
  try {
    const sumberLeads = await prisma.sumberLeads.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({
      success: true,
      data: sumberLeads,
    })
  } catch (error: any) {
    console.error('Error fetching sumber leads:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch sumber leads',
        error: error.message,
      },
      { status: 500 }
    )
  }
}

// POST - Create new sumber leads
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validatedData = sumberLeadsSchema.parse(body)

    // Check if nama already exists
    const existing = await prisma.sumberLeads.findUnique({
      where: { nama: validatedData.nama },
    })

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          message: 'Sumber leads dengan nama ini sudah ada',
        },
        { status: 400 }
      )
    }

    // Create sumber leads
    const sumberLeads = await prisma.sumberLeads.create({
      data: validatedData,
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Sumber leads berhasil ditambahkan',
        data: sumberLeads,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Error creating sumber leads:', error)

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
        message: 'Failed to create sumber leads',
        error: error.message,
      },
      { status: 500 }
    )
  }
}

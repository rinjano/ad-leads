import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sumberLeadsSchema } from '@/lib/validations/sumber-leads'

// GET - Get sumber leads by ID
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

    const sumberLeads = await prisma.sumberLeads.findUnique({
      where: { id },
    })

    if (!sumberLeads) {
      return NextResponse.json(
        {
          success: false,
          message: 'Sumber leads tidak ditemukan',
        },
        { status: 404 }
      )
    }

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

// PUT - Update sumber leads
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
    const validatedData = sumberLeadsSchema.parse(body)

    // Check if sumber leads exists
    const existing = await prisma.sumberLeads.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          message: 'Sumber leads tidak ditemukan',
        },
        { status: 404 }
      )
    }

    // Check if nama already used by another sumber leads
    const duplicate = await prisma.sumberLeads.findFirst({
      where: {
        nama: validatedData.nama,
        NOT: { id },
      },
    })

    if (duplicate) {
      return NextResponse.json(
        {
          success: false,
          message: 'Sumber leads dengan nama ini sudah ada',
        },
        { status: 400 }
      )
    }

    // Update sumber leads
    const sumberLeads = await prisma.sumberLeads.update({
      where: { id },
      data: validatedData,
    })

    return NextResponse.json({
      success: true,
      message: 'Sumber leads berhasil diperbarui',
      data: sumberLeads,
    })
  } catch (error: any) {
    console.error('Error updating sumber leads:', error)

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
        message: 'Failed to update sumber leads',
        error: error.message,
      },
      { status: 500 }
    )
  }
}

// DELETE - Delete sumber leads
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

    // Check if sumber leads exists
    const existing = await prisma.sumberLeads.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          message: 'Sumber leads tidak ditemukan',
        },
        { status: 404 }
      )
    }

    // Delete sumber leads
    await prisma.sumberLeads.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: 'Sumber leads berhasil dihapus',
    })
  } catch (error: any) {
    console.error('Error deleting sumber leads:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to delete sumber leads',
        error: error.message,
      },
      { status: 500 }
    )
  }
}

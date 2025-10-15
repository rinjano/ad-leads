import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { bukanLeadsSchema } from '@/lib/validations/bukan-leads'

// GET all bukan leads
export async function GET() {
  try {
    const bukanLeads = await prisma.bukanLeads.findMany({
      orderBy: { createdAt: 'desc' }
    })
    
    return NextResponse.json(bukanLeads)
  } catch (error) {
    console.error('Error fetching bukan leads:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bukan leads' },
      { status: 500 }
    )
  }
}

// POST create new bukan leads
export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Validate input
    const validatedData = bukanLeadsSchema.parse(body)
    
    // Check if nama already exists
    const existingBukanLeads = await prisma.bukanLeads.findUnique({
      where: { nama: validatedData.nama }
    })
    
    if (existingBukanLeads) {
      return NextResponse.json(
        { error: 'Kategori bukan leads dengan nama ini sudah ada' },
        { status: 400 }
      )
    }
    
    // Create new bukan leads
    const bukanLeads = await prisma.bukanLeads.create({
      data: {
        nama: validatedData.nama,
        deskripsi: validatedData.deskripsi || null,
      }
    })
    
    return NextResponse.json(bukanLeads, { status: 201 })
  } catch (error: any) {
    console.error('Error creating bukan leads:', error)
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create bukan leads' },
      { status: 500 }
    )
  }
}

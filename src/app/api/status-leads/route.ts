import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { statusLeadsSchema } from '@/lib/validations/status-leads'

// GET all status leads
export async function GET() {
  try {
    const statusLeads = await prisma.statusLeads.findMany({
      orderBy: { createdAt: 'desc' }
    })
    
    return NextResponse.json(statusLeads)
  } catch (error) {
    console.error('Error fetching status leads:', error)
    return NextResponse.json(
      { error: 'Failed to fetch status leads' },
      { status: 500 }
    )
  }
}

// POST create new status leads
export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Validate input
    const validatedData = statusLeadsSchema.parse(body)
    
    // Check if nama already exists
    const existingStatusLeads = await prisma.statusLeads.findUnique({
      where: { nama: validatedData.nama }
    })
    
    if (existingStatusLeads) {
      return NextResponse.json(
        { error: 'Status leads dengan nama ini sudah ada' },
        { status: 400 }
      )
    }
    
    // Create new status leads
    const statusLeads = await prisma.statusLeads.create({
      data: {
        nama: validatedData.nama,
      }
    })
    
    return NextResponse.json(statusLeads, { status: 201 })
  } catch (error: any) {
    console.error('Error creating status leads:', error)
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create status leads' },
      { status: 500 }
    )
  }
}

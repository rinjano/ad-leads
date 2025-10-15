import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { statusLeadsSchema } from '@/lib/validations/status-leads'

// GET status leads by ID
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const statusLeadsId = parseInt(id)
    
    if (isNaN(statusLeadsId)) {
      return NextResponse.json(
        { error: 'Invalid ID' },
        { status: 400 }
      )
    }
    
    const statusLeads = await prisma.statusLeads.findUnique({
      where: { id: statusLeadsId }
    })
    
    if (!statusLeads) {
      return NextResponse.json(
        { error: 'Status leads not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(statusLeads)
  } catch (error) {
    console.error('Error fetching status leads:', error)
    return NextResponse.json(
      { error: 'Failed to fetch status leads' },
      { status: 500 }
    )
  }
}

// PUT update status leads
export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const statusLeadsId = parseInt(id)
    
    if (isNaN(statusLeadsId)) {
      return NextResponse.json(
        { error: 'Invalid ID' },
        { status: 400 }
      )
    }
    
    const body = await request.json()
    const validatedData = statusLeadsSchema.parse(body)
    
    // Check if status leads exists
    const existingStatusLeads = await prisma.statusLeads.findUnique({
      where: { id: statusLeadsId }
    })
    
    if (!existingStatusLeads) {
      return NextResponse.json(
        { error: 'Status leads not found' },
        { status: 404 }
      )
    }
    
    // Check if nama already exists (excluding current record)
    const duplicateNama = await prisma.statusLeads.findFirst({
      where: {
        nama: validatedData.nama,
        NOT: { id: statusLeadsId }
      }
    })
    
    if (duplicateNama) {
      return NextResponse.json(
        { error: 'Status leads dengan nama ini sudah ada' },
        { status: 400 }
      )
    }
    
    // Update status leads
    const updatedStatusLeads = await prisma.statusLeads.update({
      where: { id: statusLeadsId },
      data: {
        nama: validatedData.nama,
      }
    })
    
    return NextResponse.json(updatedStatusLeads)
  } catch (error: any) {
    console.error('Error updating status leads:', error)
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to update status leads' },
      { status: 500 }
    )
  }
}

// DELETE status leads
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const statusLeadsId = parseInt(id)
    
    if (isNaN(statusLeadsId)) {
      return NextResponse.json(
        { error: 'Invalid ID' },
        { status: 400 }
      )
    }
    
    // Check if status leads exists
    const existingStatusLeads = await prisma.statusLeads.findUnique({
      where: { id: statusLeadsId }
    })
    
    if (!existingStatusLeads) {
      return NextResponse.json(
        { error: 'Status leads not found' },
        { status: 404 }
      )
    }
    
    // Delete status leads
    await prisma.statusLeads.delete({
      where: { id: statusLeadsId }
    })
    
    return NextResponse.json({ message: 'Status leads deleted successfully' })
  } catch (error) {
    console.error('Error deleting status leads:', error)
    return NextResponse.json(
      { error: 'Failed to delete status leads' },
      { status: 500 }
    )
  }
}

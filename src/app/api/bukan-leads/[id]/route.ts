import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { bukanLeadsSchema } from '@/lib/validations/bukan-leads'

// GET bukan leads by ID
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const bukanLeadsId = parseInt(id)
    
    if (isNaN(bukanLeadsId)) {
      return NextResponse.json(
        { error: 'Invalid ID' },
        { status: 400 }
      )
    }
    
    const bukanLeads = await prisma.bukanLeads.findUnique({
      where: { id: bukanLeadsId }
    })
    
    if (!bukanLeads) {
      return NextResponse.json(
        { error: 'Bukan leads not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(bukanLeads)
  } catch (error) {
    console.error('Error fetching bukan leads:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bukan leads' },
      { status: 500 }
    )
  }
}

// PUT update bukan leads
export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const bukanLeadsId = parseInt(id)
    
    if (isNaN(bukanLeadsId)) {
      return NextResponse.json(
        { error: 'Invalid ID' },
        { status: 400 }
      )
    }
    
    const body = await request.json()
    const validatedData = bukanLeadsSchema.parse(body)
    
    // Check if bukan leads exists
    const existingBukanLeads = await prisma.bukanLeads.findUnique({
      where: { id: bukanLeadsId }
    })
    
    if (!existingBukanLeads) {
      return NextResponse.json(
        { error: 'Bukan leads not found' },
        { status: 404 }
      )
    }
    
    // Check if nama already exists (excluding current record)
    const duplicateNama = await prisma.bukanLeads.findFirst({
      where: {
        nama: validatedData.nama,
        NOT: { id: bukanLeadsId }
      }
    })
    
    if (duplicateNama) {
      return NextResponse.json(
        { error: 'Kategori bukan leads dengan nama ini sudah ada' },
        { status: 400 }
      )
    }
    
    // Update bukan leads
    const updatedBukanLeads = await prisma.bukanLeads.update({
      where: { id: bukanLeadsId },
      data: {
        nama: validatedData.nama,
        deskripsi: validatedData.deskripsi || null,
      }
    })
    
    return NextResponse.json(updatedBukanLeads)
  } catch (error: any) {
    console.error('Error updating bukan leads:', error)
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to update bukan leads' },
      { status: 500 }
    )
  }
}

// DELETE bukan leads
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const bukanLeadsId = parseInt(id)
    
    if (isNaN(bukanLeadsId)) {
      return NextResponse.json(
        { error: 'Invalid ID' },
        { status: 400 }
      )
    }
    
    // Check if bukan leads exists
    const existingBukanLeads = await prisma.bukanLeads.findUnique({
      where: { id: bukanLeadsId }
    })
    
    if (!existingBukanLeads) {
      return NextResponse.json(
        { error: 'Bukan leads not found' },
        { status: 404 }
      )
    }
    
    // Delete bukan leads
    await prisma.bukanLeads.delete({
      where: { id: bukanLeadsId }
    })
    
    return NextResponse.json({ message: 'Bukan leads deleted successfully' })
  } catch (error) {
    console.error('Error deleting bukan leads:', error)
    return NextResponse.json(
      { error: 'Failed to delete bukan leads' },
      { status: 500 }
    )
  }
}

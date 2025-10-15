import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { userSchema } from '@/lib/validations/user'
import bcrypt from 'bcryptjs'

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const userId = parseInt(id)

    if (isNaN(userId)) {
      return NextResponse.json(
        { error: 'ID user tidak valid' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        userKodeAds: {
          include: {
            kodeAds: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User tidak ditemukan' },
        { status: 404 }
      )
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil data user' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const userId = parseInt(id)

    if (isNaN(userId)) {
      return NextResponse.json(
        { error: 'ID user tidak valid' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const validatedData = userSchema.parse(body)

    // Check if user exists
    const existing = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'User tidak ditemukan' },
        { status: 404 }
      )
    }

    // Check if email already used by another user
    const duplicate = await prisma.user.findFirst({
      where: {
        email: validatedData.email,
        NOT: {
          id: userId,
        },
      },
    })

    if (duplicate) {
      return NextResponse.json(
        { error: 'Email sudah digunakan' },
        { status: 400 }
      )
    }

    // Prepare update data
    const updateData: any = {
      name: validatedData.name,
      email: validatedData.email,
      role: validatedData.role,
    }

    // Hash password if provided
    if (validatedData.password) {
      updateData.password = await bcrypt.hash(validatedData.password, 10)
    }

    // Update user
    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      include: {
        userKodeAds: {
          include: {
            kodeAds: true,
          },
        },
      },
    })

    // Handle kodeAds for advertiser
    if (validatedData.role === 'advertiser' && validatedData.kodeAdsIds !== undefined) {
      // Delete existing kodeAds relations
      await prisma.userKodeAds.deleteMany({
        where: { userId },
      })

      // Create new kodeAds relations
      if (validatedData.kodeAdsIds.length > 0) {
        await prisma.userKodeAds.createMany({
          data: validatedData.kodeAdsIds.map((kodeAdsId) => ({
            userId,
            kodeAdsId,
          })),
        })
      }
    } else if (validatedData.role !== 'advertiser') {
      // If role is not advertiser, remove all kodeAds relations
      await prisma.userKodeAds.deleteMany({
        where: { userId },
      })
    }

    // Fetch updated user with relations
    const updatedUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        userKodeAds: {
          include: {
            kodeAds: true,
          },
        },
      },
    })

    return NextResponse.json(updatedUser)
  } catch (error: any) {
    console.error('Error updating user:', error)
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Data tidak valid', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Gagal memperbarui user' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const userId = parseInt(id)

    if (isNaN(userId)) {
      return NextResponse.json(
        { error: 'ID user tidak valid' },
        { status: 400 }
      )
    }

    // Check if user exists
    const existing = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'User tidak ditemukan' },
        { status: 404 }
      )
    }

    // Delete user (cascade will delete userKodeAds)
    await prisma.user.delete({
      where: { id: userId },
    })

    return NextResponse.json({ message: 'User berhasil dihapus' })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: 'Gagal menghapus user' },
      { status: 500 }
    )
  }
}

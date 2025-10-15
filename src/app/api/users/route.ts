import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { userSchema } from '@/lib/validations/user'
import bcrypt from 'bcryptjs'

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      include: {
        userKodeAds: {
          include: {
            kodeAds: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil data user' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validatedData = userSchema.parse(body)

    // Check if email already exists
    const existing = await prisma.user.findUnique({
      where: { email: validatedData.email },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Email sudah terdaftar' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password || 'password123', 10)

    // Create user with kodeAds if advertiser
    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        role: validatedData.role,
        userKodeAds: validatedData.role === 'advertiser' && validatedData.kodeAdsIds
          ? {
              create: validatedData.kodeAdsIds.map((kodeAdsId) => ({
                kodeAdsId,
              })),
            }
          : undefined,
      },
      include: {
        userKodeAds: {
          include: {
            kodeAds: true,
          },
        },
      },
    })

    return NextResponse.json(user, { status: 201 })
  } catch (error: any) {
    console.error('Error creating user:', error)
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Data tidak valid', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Gagal membuat user' },
      { status: 500 }
    )
  }
}

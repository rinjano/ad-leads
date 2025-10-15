import { NextRequest, NextResponse } from 'next/server'
import { loginSchema } from '@/lib/validations/auth'
import { prisma } from '@/lib/prisma'
import { verifyPassword, generateToken } from '@/lib/auth-utils'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input with Zod
    const validatedData = loginSchema.parse(body)
    
    // Find user by email
    const user = await prisma.user.findUnique({
      where: {
        email: validatedData.email,
      },
    })
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }
    
    // Verify password
    const isValidPassword = await verifyPassword(
      validatedData.password,
      user.password
    )
    
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }
    
    // Generate JWT tokens
    const accessToken = generateToken({
      id: user.id,
      email: user.email,
      companyId: user.companyId || undefined,
    })
    
    const refreshToken = generateToken({
      id: user.id,
      email: user.email,
      companyId: user.companyId || undefined,
    })
    
    // Return user data and tokens (excluding password)
    return NextResponse.json({
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          companyId: user.companyId,
        },
      },
    })
  } catch (error: any) {
    // Handle Zod validation errors
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { registerSchema } from '@/lib/validations/auth'
import { prisma } from '@/lib/prisma'
import { hashPassword, generateToken } from '@/lib/auth-utils'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input with Zod
    const validatedData = registerSchema.parse(body)
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: {
        email: validatedData.email,
      },
    })
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }
    
    // Hash password
    const hashedPassword = await hashPassword(validatedData.password)
    
    // Create user
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        password: hashedPassword,
        name: validatedData.name,
        companyId: validatedData.companyId,
        role: validatedData.role || 'user',
      },
    })
    
    // Generate tokens
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
    }, { status: 201 })
  } catch (error: any) {
    // Handle Zod validation errors
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Register error:', error)
    return NextResponse.json(
      { error: 'An error occurred during registration' },
      { status: 500 }
    )
  }
}

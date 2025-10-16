import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { UserRole, UserStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

interface RegisterRequest {
  firstName: string
  lastName: string
  email: string
  password: string
}

export async function POST(request: NextRequest) {
  try {
    // Following CODING_RULES.md - proper validation and error handling
    const body: RegisterRequest = await request.json()

    if (!body.firstName || !body.lastName || !body.email || !body.password) {
      return NextResponse.json(
        { message: 'All fields are required' },
        { status: 400 }
      )
    }

    // Check if user already exists using Prisma-generated types
    const existingUser = await prisma.user.findUnique({
      where: { email: body.email }
    })

    if (existingUser) {
      return NextResponse.json(
        { message: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Hash password following security best practices
    const hashedPassword = await bcrypt.hash(body.password, 12)

    // Create new user using Prisma-generated types
    const newUser = await prisma.user.create({
      data: {
        email: body.email,
        first_name: body.firstName,
        last_name: body.lastName,
        name: `${body.firstName} ${body.lastName}`,
        role: UserRole.CUSTOMER,
        status: UserStatus.ACTIVE,
        emailVerified: new Date(),
        // TODO: Add password field to User model
        // password_hash: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        role: true,
      }
    })

    return NextResponse.json(
      {
        message: 'User created successfully',
        user: newUser
      },
      { status: 201 }
    )
  } catch (error) {
    // Following CODING_RULES.md - proper error handling
    console.error('Registration error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
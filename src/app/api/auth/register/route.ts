import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { UserRole, UserStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { signUpSchema } from '@/lib/validations/user'
import { ZodError } from 'zod'

export async function POST(request: NextRequest) {
  try {
    
    const body = await request.json()

    
    const validatedData = signUpSchema.parse(body)

    
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    })

    if (existingUser) {
      return NextResponse.json(
        { message: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Hash password following security best practices
    // TODO: Store hashed password once password field is added to User model
    await bcrypt.hash(validatedData.password, 12)

    // Create new user using Prisma-generated types
    const newUser = await prisma.user.create({
      data: {
        email: validatedData.email,
        first_name: validatedData.first_name,
        last_name: validatedData.last_name,
        name: `${validatedData.first_name} ${validatedData.last_name}`,
        phone: validatedData.phone,
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
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          message: 'Validation error',
          errors: error.issues.map((issue) => ({
            field: issue.path.join('.'),
            message: issue.message
          }))
        },
        { status: 400 }
      )
    }

    console.error('Registration error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
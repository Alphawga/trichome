import { z } from 'zod'
import { publicProcedure, protectedProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'
import bcrypt from 'bcryptjs'

// Register a new user
export const register = publicProcedure
  .input(
    z.object({
      email: z.string().email(),
      password: z.string().min(8),
      first_name: z.string().optional(),
      last_name: z.string().optional(),
      phone: z.string().optional(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const existingUser = await ctx.prisma.user.findUnique({
      where: { email: input.email },
    })

    if (existingUser) {
      throw new TRPCError({
        code: 'CONFLICT',
        message: 'User with this email already exists',
      })
    }

    const hashedPassword = await bcrypt.hash(input.password, 10)

    const user = await ctx.prisma.user.create({
      data: {
        email: input.email,
        first_name: input.first_name,
        last_name: input.last_name,
        phone: input.phone,
        name: input.first_name && input.last_name
          ? `${input.first_name} ${input.last_name}`
          : input.email,
      },
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        role: true,
        status: true,
      },
    })

    return { user, message: 'User registered successfully' }
  })

// Get current user profile
export const getProfile = protectedProcedure.query(async ({ ctx }) => {
  const user = await ctx.prisma.user.findUnique({
    where: { id: ctx.user.id },
    select: {
      id: true,
      email: true,
      first_name: true,
      last_name: true,
      name: true,
      phone: true,
      image: true,
      role: true,
      status: true,
      email_verified_at: true,
      phone_verified_at: true,
      last_login_at: true,
      created_at: true,
    },
  })

  if (!user) {
    throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' })
  }

  return user
})

// Update user profile
export const updateProfile = protectedProcedure
  .input(
    z.object({
      first_name: z.string().optional(),
      last_name: z.string().optional(),
      phone: z.string().optional(),
      image: z.string().optional(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const user = await ctx.prisma.user.update({
      where: { id: ctx.user.id },
      data: {
        ...input,
        name: input.first_name && input.last_name
          ? `${input.first_name} ${input.last_name}`
          : undefined,
      },
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        name: true,
        phone: true,
        image: true,
      },
    })

    return { user, message: 'Profile updated successfully' }
  })

// Change password
export const changePassword = protectedProcedure
  .input(
    z.object({
      currentPassword: z.string(),
      newPassword: z.string().min(8),
    })
  )
  .mutation(async ({ input, ctx }) => {
    // Note: This assumes you have a password field in your User model
    // You may need to adjust based on your NextAuth setup
    throw new TRPCError({
      code: 'NOT_IMPLEMENTED',
      message: 'Password change not implemented with NextAuth',
    })
  })

// Verify email
export const verifyEmail = publicProcedure
  .input(z.object({ token: z.string() }))
  .mutation(async ({ input, ctx }) => {
    // Implement email verification logic
    throw new TRPCError({
      code: 'NOT_IMPLEMENTED',
      message: 'Email verification not implemented',
    })
  })

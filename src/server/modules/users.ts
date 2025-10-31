import { z } from 'zod'
import { adminProcedure, staffProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'
import { UserRole, UserStatus } from '@prisma/client'

// Get all users (admin/staff only)
export const getUsers = staffProcedure
  .input(
    z.object({
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(100).default(10),
      role: z.nativeEnum(UserRole).optional(),
      status: z.nativeEnum(UserStatus).optional(),
      search: z.string().optional(),
    })
  )
  .query(async ({ input, ctx }) => {
    const { page, limit, role, status, search } = input
    const skip = (page - 1) * limit

    const where = {
      ...(role && { role }),
      ...(status && { status }),
      ...(search && {
        OR: [
          { email: { contains: search, mode: 'insensitive' as const } },
          { first_name: { contains: search, mode: 'insensitive' as const } },
          { last_name: { contains: search, mode: 'insensitive' as const } },
          { phone: { contains: search } },
        ],
      }),
    }

    const [users, total] = await Promise.all([
      ctx.prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          first_name: true,
          last_name: true,
          phone: true,
          role: true,
          status: true,
          email_verified_at: true,
          last_login_at: true,
          created_at: true,
        },
        orderBy: { created_at: 'desc' },
      }),
      ctx.prisma.user.count({ where }),
    ])

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    }
  })

// Get user by ID (admin/staff only)
export const getUserById = staffProcedure
  .input(z.object({ id: z.string() }))
  .query(async ({ input, ctx }) => {
    const user = await ctx.prisma.user.findUnique({
      where: { id: input.id },
      include: {
        addresses: true,
        orders: {
          take: 5,
          orderBy: { created_at: 'desc' },
        },
        permissions: true,
        _count: {
          select: {
            orders: true,
            wishlist_items: true,
            cart_items: true,
          },
        },
      },
    })

    if (!user) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' })
    }

    return user
  })

// Update user (admin only)
export const updateUser = adminProcedure
  .input(
    z.object({
      id: z.string(),
      first_name: z.string().optional(),
      last_name: z.string().optional(),
      phone: z.string().optional(),
      role: z.nativeEnum(UserRole).optional(),
      status: z.nativeEnum(UserStatus).optional(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const { id, ...data } = input

    const user = await ctx.prisma.user.update({
      where: { id },
      data,
    })

    return { user, message: 'User updated successfully' }
  })

// Delete user (admin only)
export const deleteUser = adminProcedure
  .input(z.object({ id: z.string() }))
  .mutation(async ({ input, ctx }) => {
    await ctx.prisma.user.delete({
      where: { id: input.id },
    })

    return { message: 'User deleted successfully' }
  })

// Get user permissions (admin/staff only)
export const getUserPermissions = staffProcedure
  .input(z.object({ userId: z.string() }))
  .query(async ({ input, ctx }) => {
    const permissions = await ctx.prisma.userPermission.findMany({
      where: { user_id: input.userId },
      orderBy: { granted_at: 'desc' },
    })

    return permissions
  })

// Grant permission to user (admin only)
export const grantPermission = adminProcedure
  .input(
    z.object({
      userId: z.string(),
      permission: z.string(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const permission = await ctx.prisma.userPermission.create({
      data: {
        user_id: input.userId,
        permission: input.permission,
        granted_by: ctx.user.id,
      },
    })

    return { permission, message: 'Permission granted successfully' }
  })

// Revoke permission from user (admin only)
export const revokePermission = adminProcedure
  .input(
    z.object({
      userId: z.string(),
      permission: z.string(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    await ctx.prisma.userPermission.delete({
      where: {
        user_id_permission: {
          user_id: input.userId,
          permission: input.permission,
        },
      },
    })

    return { message: 'Permission revoked successfully' }
  })

// Get user statistics (admin/staff only)
export const getUserStats = staffProcedure.query(async ({ ctx }) => {
  const [total, active, pending, suspended] = await Promise.all([
    ctx.prisma.user.count(),
    ctx.prisma.user.count({ where: { status: 'ACTIVE' } }),
    ctx.prisma.user.count({ where: { status: 'PENDING_VERIFICATION' } }),
    ctx.prisma.user.count({ where: { status: 'SUSPENDED' } }),
  ])

  return {
    total,
    active,
    pending,
    suspended,
  }
})

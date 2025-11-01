import { z } from 'zod'
import { adminProcedure, staffProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'
import { PromotionType, PromotionStatus, PromotionTarget } from '@prisma/client'

// Get all promotions (staff/admin only)
export const getPromotions = staffProcedure
  .input(
    z.object({
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(100).default(50),
      status: z.nativeEnum(PromotionStatus).optional(),
      type: z.nativeEnum(PromotionType).optional(),
      search: z.string().optional(),
    })
  )
  .query(async ({ input, ctx }) => {
    const { page, limit, status, type, search } = input
    const skip = (page - 1) * limit

    const where = {
      ...(status && { status }),
      ...(type && { type }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { code: { contains: search, mode: 'insensitive' as const } },
          { description: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    }

    const [promotions, total] = await Promise.all([
      ctx.prisma.promotion.findMany({
        where,
        skip,
        take: limit,
        include: {
          creator: {
            select: {
              id: true,
              email: true,
              first_name: true,
              last_name: true,
            },
          },
          _count: {
            select: {
              usages: true,
            },
          },
        },
        orderBy: { created_at: 'desc' },
      }),
      ctx.prisma.promotion.count({ where }),
    ])

    return {
      promotions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    }
  })

// Get promotion by ID
export const getPromotionById = staffProcedure
  .input(z.object({ id: z.string() }))
  .query(async ({ input, ctx }) => {
    const promotion = await ctx.prisma.promotion.findUnique({
      where: { id: input.id },
      include: {
        creator: {
          select: {
            id: true,
            email: true,
            first_name: true,
            last_name: true,
          },
        },
        usages: {
          take: 10,
          orderBy: { used_at: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                first_name: true,
                last_name: true,
              },
            },
          },
        },
        _count: {
          select: {
            usages: true,
          },
        },
      },
    })

    if (!promotion) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Promotion not found' })
    }

    return promotion
  })

// Create promotion (admin only)
export const createPromotion = adminProcedure
  .input(
    z.object({
      name: z.string().min(1, 'Name is required'),
      code: z.string().min(1, 'Code is required').toUpperCase(),
      description: z.string().optional(),
      type: z.nativeEnum(PromotionType),
      value: z.number().min(0),
      min_order_value: z.number().min(0).default(0),
      max_discount: z.number().min(0).optional(),
      status: z.nativeEnum(PromotionStatus).default('INACTIVE'),
      target_customers: z.nativeEnum(PromotionTarget).default('ALL'),
      start_date: z.string().or(z.date()),
      end_date: z.string().or(z.date()),
      usage_limit: z.number().min(0).default(0),
      usage_limit_per_user: z.number().min(0).optional(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    // Check if code already exists
    const existing = await ctx.prisma.promotion.findUnique({
      where: { code: input.code },
    })

    if (existing) {
      throw new TRPCError({
        code: 'CONFLICT',
        message: 'A promotion with this code already exists',
      })
    }

    // Validate dates
    const startDate = new Date(input.start_date)
    const endDate = new Date(input.end_date)

    if (endDate <= startDate) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'End date must be after start date',
      })
    }

    const promotion = await ctx.prisma.promotion.create({
      data: {
        name: input.name,
        code: input.code,
        description: input.description,
        type: input.type,
        value: input.value,
        min_order_value: input.min_order_value,
        max_discount: input.max_discount,
        status: input.status,
        target_customers: input.target_customers,
        start_date: startDate,
        end_date: endDate,
        usage_limit: input.usage_limit,
        usage_limit_per_user: input.usage_limit_per_user,
        created_by: ctx.user.id,
      },
    })

    return { promotion, message: 'Promotion created successfully' }
  })

// Update promotion (admin only)
export const updatePromotion = adminProcedure
  .input(
    z.object({
      id: z.string(),
      name: z.string().min(1).optional(),
      code: z.string().min(1).toUpperCase().optional(),
      description: z.string().optional(),
      type: z.nativeEnum(PromotionType).optional(),
      value: z.number().min(0).optional(),
      min_order_value: z.number().min(0).optional(),
      max_discount: z.number().min(0).optional(),
      status: z.nativeEnum(PromotionStatus).optional(),
      target_customers: z.nativeEnum(PromotionTarget).optional(),
      start_date: z.string().or(z.date()).optional(),
      end_date: z.string().or(z.date()).optional(),
      usage_limit: z.number().min(0).optional(),
      usage_limit_per_user: z.number().min(0).optional(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const { id, ...data } = input

    // If updating code, check for conflicts
    if (data.code) {
      const existing = await ctx.prisma.promotion.findFirst({
        where: {
          code: data.code,
          NOT: { id },
        },
      })

      if (existing) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'A promotion with this code already exists',
        })
      }
    }

    // Validate dates if both are provided
    if (data.start_date && data.end_date) {
      const startDate = new Date(data.start_date)
      const endDate = new Date(data.end_date)

      if (endDate <= startDate) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'End date must be after start date',
        })
      }
    }

    const updateData: any = { ...data }
    if (data.start_date) updateData.start_date = new Date(data.start_date)
    if (data.end_date) updateData.end_date = new Date(data.end_date)

    const promotion = await ctx.prisma.promotion.update({
      where: { id },
      data: updateData,
    })

    return { promotion, message: 'Promotion updated successfully' }
  })

// Delete promotion (admin only)
export const deletePromotion = adminProcedure
  .input(z.object({ id: z.string() }))
  .mutation(async ({ input, ctx }) => {
    await ctx.prisma.promotion.delete({
      where: { id: input.id },
    })

    return { message: 'Promotion deleted successfully' }
  })

// Toggle promotion status (admin only)
export const togglePromotionStatus = adminProcedure
  .input(z.object({ id: z.string() }))
  .mutation(async ({ input, ctx }) => {
    const promotion = await ctx.prisma.promotion.findUnique({
      where: { id: input.id },
    })

    if (!promotion) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Promotion not found' })
    }

    const newStatus = promotion.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'

    const updated = await ctx.prisma.promotion.update({
      where: { id: input.id },
      data: { status: newStatus },
    })

    return { promotion: updated, message: `Promotion ${newStatus.toLowerCase()}` }
  })

// Get promotion statistics (staff/admin only)
export const getPromotionStats = staffProcedure.query(async ({ ctx }) => {
  const [total, active, inactive, scheduled, expired] = await Promise.all([
    ctx.prisma.promotion.count(),
    ctx.prisma.promotion.count({ where: { status: 'ACTIVE' } }),
    ctx.prisma.promotion.count({ where: { status: 'INACTIVE' } }),
    ctx.prisma.promotion.count({ where: { status: 'SCHEDULED' } }),
    ctx.prisma.promotion.count({ where: { status: 'EXPIRED' } }),
  ])

  // Get total usage count
  const totalUsage = await ctx.prisma.promotionUsage.count()

  // Get total discount given
  const discountAggregate = await ctx.prisma.promotionUsage.aggregate({
    _sum: {
      discount_amount: true,
    },
  })

  return {
    total,
    active,
    inactive,
    scheduled,
    expired,
    totalUsage,
    totalDiscount: discountAggregate._sum.discount_amount || 0,
  }
})

import { z } from 'zod'
import { publicProcedure, staffProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'
import { ContentType, ContentStatus } from '@prisma/client'

// Get published content by type
export const getContentByType = publicProcedure
  .input(z.object({ type: z.nativeEnum(ContentType) }))
  .query(async ({ input, ctx }) => {
    const now = new Date()

    const content = await ctx.prisma.content.findMany({
      where: {
        type: input.type,
        status: 'PUBLISHED',
        AND: [
          {
            OR: [
              { published_at: { lte: now } },
              { published_at: null },
            ],
          },
          {
            OR: [
              { expires_at: { gte: now } },
              { expires_at: null },
            ],
          },
        ],
      },
      orderBy: { sort_order: 'asc' },
    })

    return content
  })

// Get all content (staff)
export const getAllContent = staffProcedure
  .input(
    z.object({
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(100).default(20),
      type: z.nativeEnum(ContentType).optional(),
      status: z.nativeEnum(ContentStatus).optional(),
    })
  )
  .query(async ({ input, ctx }) => {
    const { page, limit, type, status } = input
    const skip = (page - 1) * limit

    const where = {
      ...(type && { type }),
      ...(status && { status }),
    }

    const [items, total] = await Promise.all([
      ctx.prisma.content.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ sort_order: 'asc' }, { created_at: 'desc' }],
      }),
      ctx.prisma.content.count({ where }),
    ])

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    }
  })

// Get content by ID (staff)
export const getContentById = staffProcedure
  .input(z.object({ id: z.string() }))
  .query(async ({ input, ctx }) => {
    const content = await ctx.prisma.content.findUnique({
      where: { id: input.id },
    })

    if (!content) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Content not found' })
    }

    return content
  })

// Create content (staff)
export const createContent = staffProcedure
  .input(
    z.object({
      type: z.nativeEnum(ContentType),
      title: z.string().min(1),
      subtitle: z.string().optional(),
      description: z.string().optional(),
      content: z.string().optional(),
      button_text: z.string().optional(),
      button_link: z.string().optional(),
      image_url: z.string().optional(),
      video_url: z.string().optional(),
      metadata: z.any().optional(),
      status: z.nativeEnum(ContentStatus).default('DRAFT'),
      sort_order: z.number().int().default(0),
      published_at: z.date().optional(),
      expires_at: z.date().optional(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const content = await ctx.prisma.content.create({
      data: input,
    })

    return { content, message: 'Content created successfully' }
  })

// Update content (staff)
export const updateContent = staffProcedure
  .input(
    z.object({
      id: z.string(),
      type: z.nativeEnum(ContentType).optional(),
      title: z.string().min(1).optional(),
      subtitle: z.string().optional(),
      description: z.string().optional(),
      content: z.string().optional(),
      button_text: z.string().optional(),
      button_link: z.string().optional(),
      image_url: z.string().optional(),
      video_url: z.string().optional(),
      metadata: z.any().optional(),
      status: z.nativeEnum(ContentStatus).optional(),
      sort_order: z.number().int().optional(),
      published_at: z.date().optional(),
      expires_at: z.date().optional(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const { id, ...data } = input

    const content = await ctx.prisma.content.update({
      where: { id },
      data,
    })

    return { content, message: 'Content updated successfully' }
  })

// Delete content (staff)
export const deleteContent = staffProcedure
  .input(z.object({ id: z.string() }))
  .mutation(async ({ input, ctx }) => {
    await ctx.prisma.content.delete({
      where: { id: input.id },
    })

    return { message: 'Content deleted successfully' }
  })

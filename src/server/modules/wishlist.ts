import { z } from 'zod'
import { protectedProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'

// Get user's wishlist
export const getWishlist = protectedProcedure.query(async ({ ctx }) => {
  const wishlistItems = await ctx.prisma.wishlistItem.findMany({
    where: { user_id: ctx.user.id },
    include: {
      product: {
        include: {
          images: {
            where: { is_primary: true },
            take: 1,
          },
          category: {
            select: {
              name: true,
              slug: true,
            },
          },
        },
      },
    },
    orderBy: { created_at: 'desc' },
  })

  return {
    items: wishlistItems,
    count: wishlistItems.length,
  }
})

// Add item to wishlist
export const addToWishlist = protectedProcedure
  .input(z.object({ product_id: z.string() }))
  .mutation(async ({ input, ctx }) => {
    // Check if product exists
    const product = await ctx.prisma.product.findUnique({
      where: { id: input.product_id },
    })

    if (!product) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Product not found' })
    }

    // Check if already in wishlist
    const existing = await ctx.prisma.wishlistItem.findUnique({
      where: {
        user_id_product_id: {
          user_id: ctx.user.id,
          product_id: input.product_id,
        },
      },
    })

    if (existing) {
      return { message: 'Item already in wishlist' }
    }

    const wishlistItem = await ctx.prisma.wishlistItem.create({
      data: {
        user_id: ctx.user.id,
        product_id: input.product_id,
      },
      include: {
        product: {
          include: {
            images: {
              where: { is_primary: true },
              take: 1,
            },
          },
        },
      },
    })

    return { wishlistItem, message: 'Item added to wishlist' }
  })

// Remove item from wishlist
export const removeFromWishlist = protectedProcedure
  .input(z.object({ id: z.string() }))
  .mutation(async ({ ctx, input }) => {
    const wishlistItem = await ctx.prisma.wishlistItem.findUnique({
      where: { id: input.id },
    })

    if (!wishlistItem || wishlistItem.user_id !== ctx.user.id) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Wishlist item not found' })
    }

    await ctx.prisma.wishlistItem.delete({
      where: { id: input.id },
    })

    return { message: 'Item removed from wishlist' }
  })

// Check if product is in wishlist
export const isInWishlist = protectedProcedure
  .input(z.object({ product_id: z.string() }))
  .query(async ({ input, ctx }) => {
    const item = await ctx.prisma.wishlistItem.findUnique({
      where: {
        user_id_product_id: {
          user_id: ctx.user.id,
          product_id: input.product_id,
        },
      },
    })

    return { inWishlist: !!item }
  })

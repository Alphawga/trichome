import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const getCart = protectedProcedure.query(async ({ ctx }) => {
  const cartItems = await ctx.prisma.cartItem.findMany({
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
    orderBy: { created_at: "desc" },
  });

  const total = cartItems.reduce((sum, item) => {
    return sum + Number(item.product.price) * item.quantity;
  }, 0);

  return {
    items: cartItems,
    total,
    count: cartItems.length,
  };
});

// Add item to cart
export const addToCart = protectedProcedure
  .input(
    z.object({
      product_id: z.string(),
      quantity: z.number().int().min(1).default(1),
    }),
  )
  .mutation(async ({ input, ctx }) => {
    // Check if product exists and is available
    const product = await ctx.prisma.product.findUnique({
      where: { id: input.product_id },
    });

    if (!product) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Product not found" });
    }

    if (product.status !== "ACTIVE") {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Product is not available",
      });
    }

    if (product.track_quantity && product.quantity < input.quantity) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Insufficient stock",
      });
    }

    // Check if item already exists in cart
    const existingItem = await ctx.prisma.cartItem.findUnique({
      where: {
        user_id_product_id: {
          user_id: ctx.user.id,
          product_id: input.product_id,
        },
      },
    });

    if (existingItem) {
      // Update quantity
      const cartItem = await ctx.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + input.quantity },
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
      });

      return { cartItem, message: "Cart updated successfully" };
    }

    // Create new cart item
    const cartItem = await ctx.prisma.cartItem.create({
      data: {
        user_id: ctx.user.id,
        product_id: input.product_id,
        quantity: input.quantity,
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
    });

    return { cartItem, message: "Item added to cart" };
  });

// Update cart item quantity
export const updateCartItem = protectedProcedure
  .input(
    z.object({
      id: z.string(),
      quantity: z.number().int().min(1),
    }),
  )
  .mutation(async ({ input, ctx }) => {
    const cartItem = await ctx.prisma.cartItem.findUnique({
      where: { id: input.id },
      include: { product: true },
    });

    if (!cartItem || cartItem.user_id !== ctx.user.id) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Cart item not found",
      });
    }

    if (
      cartItem.product.track_quantity &&
      cartItem.product.quantity < input.quantity
    ) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Insufficient stock",
      });
    }

    const updatedItem = await ctx.prisma.cartItem.update({
      where: { id: input.id },
      data: { quantity: input.quantity },
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
    });

    return { cartItem: updatedItem, message: "Cart item updated" };
  });

// Remove item from cart
export const removeFromCart = protectedProcedure
  .input(z.object({ id: z.string() }))
  .mutation(async ({ input, ctx }) => {
    const cartItem = await ctx.prisma.cartItem.findUnique({
      where: { id: input.id },
    });

    if (!cartItem || cartItem.user_id !== ctx.user.id) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Cart item not found",
      });
    }

    await ctx.prisma.cartItem.delete({
      where: { id: input.id },
    });

    return { message: "Item removed from cart" };
  });

// Clear cart
export const clearCart = protectedProcedure.mutation(async ({ ctx }) => {
  await ctx.prisma.cartItem.deleteMany({
    where: { user_id: ctx.user.id },
  });

  return { message: "Cart cleared" };
});

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

// Merge a guest (localStorage) cart into the authenticated user's cart in one round trip
export const mergeCart = protectedProcedure
  .input(
    z.object({
      toAdd: z.array(
        z.object({
          product_id: z.string(),
          quantity: z.number().int().min(1),
        }),
      ),
      toUpdate: z.array(
        z.object({
          id: z.string(),
          quantity: z.number().int().min(1),
        }),
      ),
    }),
  )
  .mutation(async ({ input, ctx }) => {
    const addProductIds = input.toAdd.map((item) => item.product_id);
    const updateIds = input.toUpdate.map((item) => item.id);

    const [addProducts, updateItems] = await Promise.all([
      addProductIds.length
        ? ctx.prisma.product.findMany({
            where: { id: { in: addProductIds } },
          })
        : Promise.resolve([]),
      updateIds.length
        ? ctx.prisma.cartItem.findMany({
            where: { id: { in: updateIds } },
            include: { product: true },
          })
        : Promise.resolve([]),
    ]);

    const productMap = new Map(
      addProducts.map((product) => [product.id, product]),
    );
    const cartItemMap = new Map(updateItems.map((item) => [item.id, item]));

    for (const item of input.toAdd) {
      const product = productMap.get(item.product_id);
      if (!product) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product not found",
        });
      }
      if (product.status !== "ACTIVE") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Product is not available",
        });
      }
      if (product.track_quantity && product.quantity < item.quantity) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Insufficient stock",
        });
      }
    }

    for (const item of input.toUpdate) {
      const cartItem = cartItemMap.get(item.id);
      if (!cartItem || cartItem.user_id !== ctx.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Cart item not found",
        });
      }
      if (
        cartItem.product.track_quantity &&
        cartItem.product.quantity < item.quantity
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Insufficient stock",
        });
      }
    }

    await ctx.prisma.$transaction([
      ...input.toAdd.map((item) =>
        ctx.prisma.cartItem.upsert({
          where: {
            user_id_product_id: {
              user_id: ctx.user.id,
              product_id: item.product_id,
            },
          },
          create: {
            user_id: ctx.user.id,
            product_id: item.product_id,
            quantity: item.quantity,
          },
          update: {
            quantity: item.quantity,
          },
        }),
      ),
      ...input.toUpdate.map((item) =>
        ctx.prisma.cartItem.update({
          where: { id: item.id },
          data: { quantity: item.quantity },
        }),
      ),
    ]);

    return { message: "Cart merged successfully" };
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

import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { publicProcedure, staffProcedure } from "../trpc";

// Get active stores (public) - for the checkout pickup selector
export const getActiveStores = publicProcedure.query(async ({ ctx }) => {
  const stores = await ctx.prisma.store.findMany({
    where: { is_active: true },
    orderBy: { sort_order: "asc" },
  });

  return { stores };
});

// Get all stores (staff) - paginated admin list
export const getStores = staffProcedure
  .input(
    z.object({
      search: z.string().optional(),
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(500).default(10),
    }),
  )
  .query(async ({ input, ctx }) => {
    const { page, limit, search } = input;
    const skip = (page - 1) * limit;

    const where = {
      ...(search && {
        name: { contains: search, mode: "insensitive" as const },
      }),
    };

    const [stores, total] = await Promise.all([
      ctx.prisma.store.findMany({
        where,
        skip,
        take: limit,
        include: {
          _count: {
            select: { orders: true },
          },
        },
        orderBy: { sort_order: "asc" },
      }),
      ctx.prisma.store.count({ where }),
    ]);

    return {
      stores,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  });

// Get store by ID (staff)
export const getStoreById = staffProcedure
  .input(z.object({ id: z.string() }))
  .query(async ({ input, ctx }) => {
    const store = await ctx.prisma.store.findUnique({
      where: { id: input.id },
      include: {
        _count: {
          select: { orders: true },
        },
      },
    });

    if (!store) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Store not found" });
    }

    return store;
  });

// Create store (staff)
export const createStore = staffProcedure
  .input(
    z.object({
      name: z.string().min(1, "Store name is required"),
      address: z.string().min(1, "Address is required"),
      phone: z.string().optional(),
      opening_hours: z.string().optional(),
      map_url: z.string().optional(),
      is_active: z.boolean().default(true),
      sort_order: z.number().int().default(0),
    }),
  )
  .mutation(async ({ input, ctx }) => {
    const store = await ctx.prisma.store.create({
      data: input,
    });

    return { store, message: "Store created successfully" };
  });

// Update store (staff)
export const updateStore = staffProcedure
  .input(
    z.object({
      id: z.string(),
      name: z.string().min(1).optional(),
      address: z.string().min(1).optional(),
      phone: z.string().optional().nullable(),
      opening_hours: z.string().optional().nullable(),
      map_url: z.string().optional().nullable(),
      is_active: z.boolean().optional(),
      sort_order: z.number().int().optional(),
    }),
  )
  .mutation(async ({ input, ctx }) => {
    const { id, ...data } = input;

    const store = await ctx.prisma.store.findUnique({ where: { id } });

    if (!store) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Store not found" });
    }

    const updatedStore = await ctx.prisma.store.update({
      where: { id },
      data,
    });

    return { store: updatedStore, message: "Store updated successfully" };
  });

// Delete store (staff)
export const deleteStore = staffProcedure
  .input(z.object({ id: z.string() }))
  .mutation(async ({ input, ctx }) => {
    const store = await ctx.prisma.store.findUnique({
      where: { id: input.id },
      include: {
        _count: {
          select: { orders: true },
        },
      },
    });

    if (!store) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Store not found" });
    }

    if (store._count.orders > 0) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: `Cannot delete store with ${store._count.orders} associated order(s). Deactivate it instead.`,
      });
    }

    await ctx.prisma.store.delete({
      where: { id: input.id },
    });

    return { message: "Store deleted successfully" };
  });

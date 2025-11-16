import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { publicProcedure, staffProcedure } from "../trpc";

// Subscribe to newsletter
export const subscribe = publicProcedure
  .input(
    z.object({
      email: z.email(),
      source: z.string().optional().default("website"),
    }),
  )
  .mutation(async ({ input, ctx }) => {
    const existing = await ctx.prisma.newsletter.findUnique({
      where: { email: input.email },
    });

    if (existing) {
      return { message: "You are already subscribed to our newsletter" };
    }

    await ctx.prisma.newsletter.create({
      data: input,
    });

    return { message: "Successfully subscribed to newsletter" };
  });

// Unsubscribe from newsletter
export const unsubscribe = publicProcedure
  .input(z.object({ email: z.email() }))
  .mutation(async ({ input, ctx }) => {
    const existing = await ctx.prisma.newsletter.findUnique({
      where: { email: input.email },
    });

    if (!existing) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Email not found in newsletter list",
      });
    }

    await ctx.prisma.newsletter.delete({
      where: { email: input.email },
    });

    return { message: "Successfully unsubscribed from newsletter" };
  });

// Get all newsletter subscribers (staff)
export const getSubscribers = staffProcedure
  .input(
    z.object({
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(100).default(50),
      search: z.string().optional(),
    }),
  )
  .query(async ({ input, ctx }) => {
    const { page, limit, search } = input;
    const skip = (page - 1) * limit;

    const where = search
      ? {
          email: { contains: search, mode: "insensitive" as const },
        }
      : {};

    const [subscribers, total] = await Promise.all([
      ctx.prisma.newsletter.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: "desc" },
      }),
      ctx.prisma.newsletter.count({ where }),
    ]);

    return {
      subscribers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  });

// Get newsletter statistics (staff)
export const getNewsletterStats = staffProcedure.query(async ({ ctx }) => {
  const total = await ctx.prisma.newsletter.count();

  return { total };
});

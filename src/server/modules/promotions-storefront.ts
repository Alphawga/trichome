import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { resolveActiveProductTagPromotions } from "@/lib/promotions/active-product-tag-promotions";
import {
  calculatePromotionDiscount,
  checkPromotionEligibility,
  getEligibleCodelessPromotions,
} from "@/lib/promotions/promotion-eligibility";
import { syncPromotionStatuses } from "@/lib/promotions/sync-promotion-statuses";
import { publicProcedure } from "../trpc";

// Validate and get promotion by code (public)
export const validatePromoCode = publicProcedure
  .input(
    z.object({
      code: z.string().min(1).toUpperCase(),
      subtotal: z.number().min(0),
      userId: z.string().optional(), // Optional for guest checkout
      state: z.string().optional(),
      city: z.string().optional(),
    }),
  )
  .query(async ({ input, ctx }) => {
    const { code, subtotal, userId, state, city } = input;

    // Find promotion by code
    const promotion = await ctx.prisma.promotion.findUnique({
      where: { code },
    });

    if (!promotion) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Invalid promo code",
      });
    }

    const eligibility = await checkPromotionEligibility(ctx.prisma, promotion, {
      subtotal,
      userId,
      state,
      city,
    });

    if (!eligibility.eligible) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: eligibility.reason,
      });
    }

    const { discountAmount, isFreeShipping } = calculatePromotionDiscount(
      promotion,
      subtotal,
    );

    return {
      promotion: {
        id: promotion.id,
        code: promotion.code,
        name: promotion.name,
        description: promotion.description,
        type: promotion.type,
        value: Number(promotion.value),
        max_discount: promotion.max_discount
          ? Number(promotion.max_discount)
          : null,
      },
      discountAmount,
      isFreeShipping,
    };
  });

// Find every codeless "automatic" promotion eligible for a cart — all of
// them stack together at checkout. A manually typed code (validatePromoCode)
// adds on top of this set rather than replacing it; this procedure only
// ever looks at codeless promotions.
export const getAutoApplyPromotions = publicProcedure
  .input(
    z.object({
      subtotal: z.number().min(0),
      userId: z.string().optional(), // Optional for guest checkout
      state: z.string().optional(),
      city: z.string().optional(),
    }),
  )
  .query(async ({ input, ctx }) => {
    await syncPromotionStatuses(ctx.prisma);

    const { subtotal, userId, state, city } = input;

    const eligible = await getEligibleCodelessPromotions(ctx.prisma, {
      subtotal,
      userId,
      state,
      city,
    });

    return eligible.map(({ promotion, discountAmount, isFreeShipping }) => ({
      promotion: {
        id: promotion.id,
        name: promotion.name,
        description: promotion.description,
        type: promotion.type,
      },
      discountAmount,
      isFreeShipping,
    }));
  });

// Codeless PERCENTAGE/FIXED_AMOUNT promotions flagged to display on the
// product price tag (strikethrough + new price). Logic lives in
// @/lib/promotions/active-product-tag-promotions so the PDP server component
// can reuse it for promotion-aware JSON-LD pricing without going through tRPC.
export const getActiveProductTagPromotions = publicProcedure
  .input(z.object({ userId: z.string().optional() }))
  .query(({ input, ctx }) =>
    resolveActiveProductTagPromotions(ctx.prisma, input.userId),
  );

// Get all promotions flagged to display on the site banner (public)
export const getBannerPromotions = publicProcedure.query(async ({ ctx }) => {
  await syncPromotionStatuses(ctx.prisma);

  const now = new Date();

  const promotions = await ctx.prisma.promotion.findMany({
    where: {
      show_on_banner: true,
      status: "ACTIVE",
      start_date: { lte: now },
      end_date: { gte: now },
    },
    orderBy: { created_at: "desc" },
  });

  return promotions.map((promotion) => ({
    id: promotion.id,
    name: promotion.name,
    description: promotion.description,
    code: promotion.code,
  }));
});

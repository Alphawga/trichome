/**
 * Promotion Eligibility & Discount Calculation
 *
 * Shared by manual code entry (validatePromoCode) and codeless auto-apply
 * (getAutoApplyPromotions) so both checkout paths enforce identical rules.
 * Lives outside src/server/modules because that directory is spread
 * wholesale into the tRPC router — a plain exported function there gets
 * mistaken for a procedure and breaks the router's type.
 */

import type { Promotion } from "@prisma/client";
import type { prisma } from "@/lib/prisma";

interface PromotionEligibilityResult {
  eligible: boolean;
  reason?: string;
}

export async function checkPromotionEligibility(
  db: typeof prisma,
  promotion: Promotion,
  {
    subtotal,
    userId,
    state,
    city,
  }: { subtotal: number; userId?: string; state?: string; city?: string },
): Promise<PromotionEligibilityResult> {
  const now = new Date();

  if (promotion.status !== "ACTIVE") {
    return {
      eligible: false,
      reason: "This promo code is not currently active",
    };
  }

  if (now < promotion.start_date || now > promotion.end_date) {
    return {
      eligible: false,
      reason: "This promo code is not valid at this time",
    };
  }

  if (subtotal < Number(promotion.min_order_value)) {
    return {
      eligible: false,
      reason: `Minimum order value of ₦${Number(promotion.min_order_value).toLocaleString()} required`,
    };
  }

  // Location scoping — an address not yet known simply fails the match
  // rather than throwing, so location-scoped promotions just don't appear
  // until the customer's destination is known.
  if (promotion.applicable_state) {
    if (
      !state ||
      state.trim().toLowerCase() !== promotion.applicable_state.trim().toLowerCase()
    ) {
      return {
        eligible: false,
        reason: "This promotion is not available in your area",
      };
    }

    if (
      promotion.applicable_city &&
      (!city ||
        city.trim().toLowerCase() !== promotion.applicable_city.trim().toLowerCase())
    ) {
      return {
        eligible: false,
        reason: "This promotion is not available in your area",
      };
    }
  }

  if (
    promotion.usage_limit > 0 &&
    promotion.usage_count >= promotion.usage_limit
  ) {
    return {
      eligible: false,
      reason: "This promo code has reached its usage limit",
    };
  }

  if (userId && promotion.usage_limit_per_user) {
    const userUsageCount = await db.promotionUsage.count({
      where: { promotion_id: promotion.id, user_id: userId },
    });

    if (userUsageCount >= promotion.usage_limit_per_user) {
      return {
        eligible: false,
        reason: "You have reached the usage limit for this promo code",
      };
    }
  }

  if (promotion.target_customers === "NEW_CUSTOMERS" && userId) {
    const previousOrders = await db.order.count({
      where: { user_id: userId },
    });

    if (previousOrders > 0) {
      return {
        eligible: false,
        reason: "This promo code is only available for new customers",
      };
    }
  }

  return { eligible: true };
}

export function calculatePromotionDiscount(
  promotion: Pick<Promotion, "type" | "value" | "max_discount">,
  subtotal: number,
): { discountAmount: number; isFreeShipping: boolean } {
  let discountAmount = 0;
  if (promotion.type === "PERCENTAGE") {
    discountAmount = (subtotal * Number(promotion.value)) / 100;
    if (promotion.max_discount) {
      discountAmount = Math.min(discountAmount, Number(promotion.max_discount));
    }
  } else if (promotion.type === "FIXED_AMOUNT") {
    discountAmount = Number(promotion.value);
  } else if (promotion.type === "FREE_SHIPPING") {
    discountAmount = 0;
  }

  discountAmount = Math.min(discountAmount, subtotal);

  return {
    discountAmount,
    isFreeShipping: promotion.type === "FREE_SHIPPING",
  };
}

export interface ResolvedOrderPromotion {
  promotion: Promotion;
  discountAmount: number;
  isFreeShipping: boolean;
}

/**
 * All codeless ("automatic") promotions currently eligible for a cart —
 * every one of them applies simultaneously (stacking), unlike a typed code
 * which is gated behind `code` and resolved separately. Shared by
 * `getAutoApplyPromotions` (display) and `resolveOrderPromotions` (charge).
 */
export async function getEligibleCodelessPromotions(
  db: typeof prisma,
  {
    subtotal,
    userId,
    state,
    city,
  }: { subtotal: number; userId?: string; state?: string; city?: string },
): Promise<ResolvedOrderPromotion[]> {
  const now = new Date();
  const candidates = await db.promotion.findMany({
    where: {
      code: null,
      status: "ACTIVE",
      start_date: { lte: now },
      end_date: { gte: now },
      min_order_value: { lte: subtotal },
    },
    orderBy: { created_at: "desc" },
  });

  const resolved: ResolvedOrderPromotion[] = [];
  for (const promotion of candidates) {
    const eligibility = await checkPromotionEligibility(db, promotion, {
      subtotal,
      userId,
      state,
      city,
    });
    if (!eligibility.eligible) continue;

    const { discountAmount, isFreeShipping } = calculatePromotionDiscount(
      promotion,
      subtotal,
    );
    resolved.push({ promotion, discountAmount, isFreeShipping });
  }

  return resolved;
}

export interface ResolvedOrderPromotions {
  promotions: ResolvedOrderPromotion[];
  totalDiscountAmount: number;
  isFreeShipping: boolean;
}

/**
 * Resolves every promotion that applies to a checkout: all eligible
 * codeless promotions stack together automatically, and a manually typed
 * `promoCode` (if valid) adds on top of that stack — codes never stack
 * with each other, only one can be entered per order. Each promotion's
 * discount is computed independently off the original `subtotal` (additive,
 * not sequentially compounded) and the sum is capped at `subtotal`. Never
 * trust a client-reported discount — this is the sole source of truth for
 * what actually gets charged.
 */
export async function resolveOrderPromotions(
  db: typeof prisma,
  {
    promoCode,
    subtotal,
    userId,
    state,
    city,
  }: {
    promoCode?: string;
    subtotal: number;
    userId?: string;
    state?: string;
    city?: string;
  },
): Promise<ResolvedOrderPromotions> {
  const applied = await getEligibleCodelessPromotions(db, {
    subtotal,
    userId,
    state,
    city,
  });

  if (promoCode) {
    const codedPromotion = await db.promotion.findUnique({
      where: { code: promoCode.toUpperCase() },
    });
    if (codedPromotion) {
      const eligibility = await checkPromotionEligibility(db, codedPromotion, {
        subtotal,
        userId,
        state,
        city,
      });
      if (eligibility.eligible) {
        const { discountAmount, isFreeShipping } = calculatePromotionDiscount(
          codedPromotion,
          subtotal,
        );
        applied.push({ promotion: codedPromotion, discountAmount, isFreeShipping });
      }
    }
  }

  const totalDiscountAmount = Math.min(
    applied.reduce((sum, p) => sum + p.discountAmount, 0),
    subtotal,
  );
  const isFreeShipping = applied.some((p) => p.isFreeShipping);

  return { promotions: applied, totalDiscountAmount, isFreeShipping };
}

/**
 * Promotion Eligibility & Discount Calculation
 *
 * Shared by manual code entry (validatePromoCode) and codeless auto-apply
 * (getAutoApplyPromotion) so both checkout paths enforce identical rules.
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
  { subtotal, userId }: { subtotal: number; userId?: string },
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
 * Resolves the single promotion (if any) that applies to a checkout — by
 * `promotionId` (auto-applied codeless promotion) or `promoCode` (manually
 * typed). `promotionId` is only ever trusted for codeless promotions: a
 * coded promotion's `id` is not a secret (validatePromoCode echoes it back
 * to anyone who types the code), so without the `code === null` check here
 * a client could bypass a promotion's code requirement entirely by sending
 * its id instead. Runs eligibility + discount calc; returns `null` if no
 * promotion applies (not provided, not found, wrong code-gating, or
 * ineligible) — the caller never needs to trust a client-reported discount.
 */
export async function resolveOrderPromotion(
  db: typeof prisma,
  {
    promotionId,
    promoCode,
    subtotal,
    userId,
  }: {
    promotionId?: string;
    promoCode?: string;
    subtotal: number;
    userId?: string;
  },
): Promise<ResolvedOrderPromotion | null> {
  let promotion: Promotion | null = null;

  if (promotionId) {
    const candidate = await db.promotion.findUnique({
      where: { id: promotionId },
    });
    if (candidate && candidate.code === null) {
      promotion = candidate;
    }
  } else if (promoCode) {
    promotion = await db.promotion.findUnique({
      where: { code: promoCode.toUpperCase() },
    });
  }

  if (!promotion) return null;

  const eligibility = await checkPromotionEligibility(db, promotion, {
    subtotal,
    userId,
  });
  if (!eligibility.eligible) return null;

  const { discountAmount, isFreeShipping } = calculatePromotionDiscount(
    promotion,
    subtotal,
  );

  return { promotion, discountAmount, isFreeShipping };
}

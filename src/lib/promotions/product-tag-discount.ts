import type { PromotionType } from "@prisma/client";

export interface ProductTagPromotion {
  type: PromotionType;
  value: number;
  max_discount: number | null;
}

/**
 * Sums every active PRODUCT_TAG/BOTH promotion's discount against a single
 * product's price (additive, matching the checkout stacking rule), capped
 * at the price itself. Store-wide by design — Promotion has no
 * product/category scoping, so every promotion here applies uniformly.
 * getActiveProductTagPromotions only ever returns PERCENTAGE/FIXED_AMOUNT
 * promotions server-side; any other type contributes zero defensively.
 */
export function calculateProductTagDiscount(
  promotions: ProductTagPromotion[],
  price: number,
): number {
  const total = promotions.reduce((sum, promo) => {
    const amount =
      promo.type === "PERCENTAGE"
        ? (price * promo.value) / 100
        : promo.type === "FIXED_AMOUNT"
          ? promo.value
          : 0;
    const capped = promo.max_discount
      ? Math.min(amount, promo.max_discount)
      : amount;
    return sum + capped;
  }, 0);

  return Math.min(total, price);
}

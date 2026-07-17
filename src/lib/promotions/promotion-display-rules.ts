import type { PromotionType } from "@prisma/client";

/**
 * Only a promotion with a per-item price makes sense on a product tag —
 * FREE_SHIPPING/BUY_X_GET_Y have no per-item discount to show there.
 */
export function canDisplayOnProductTag(type: PromotionType): boolean {
  return type === "PERCENTAGE" || type === "FIXED_AMOUNT";
}

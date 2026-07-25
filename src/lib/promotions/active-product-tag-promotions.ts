import type { PrismaClient } from "@prisma/client";
import { checkPromotionEligibility } from "@/lib/promotions/promotion-eligibility";
import type { ProductTagPromotion } from "@/lib/promotions/product-tag-discount";
import { syncPromotionStatuses } from "@/lib/promotions/sync-promotion-statuses";

export interface ActiveProductTagPromotion extends ProductTagPromotion {
  id: string;
  name: string;
}

// Codeless PERCENTAGE/FIXED_AMOUNT promotions flagged to display on the
// product price tag (strikethrough + new price) — store-wide, since
// Promotion has no product/category scoping. No cart context exists on a
// listing/PDP page, so min_order_value is intentionally ignored here (pass
// Number.MAX_SAFE_INTEGER so checkPromotionEligibility's subtotal-vs-minimum
// check always passes) rather than gated on it — a min_order_value promotion
// should still show its tag price, it just won't discount a cart below that
// minimum at checkout. Returns raw promo terms, not a precomputed price,
// since the discount is applied per-product against that product's own
// price — by the tRPC procedure on the client, or server-side for JSON-LD.
export async function resolveActiveProductTagPromotions(
  prisma: PrismaClient,
  userId?: string,
): Promise<ActiveProductTagPromotion[]> {
  await syncPromotionStatuses(prisma);

  const now = new Date();
  const candidates = await prisma.promotion.findMany({
    where: {
      code: null,
      status: "ACTIVE",
      start_date: { lte: now },
      end_date: { gte: now },
      display_location: { in: ["PRODUCT_TAG", "BOTH"] },
      type: { in: ["PERCENTAGE", "FIXED_AMOUNT"] },
    },
    orderBy: { created_at: "desc" },
  });

  const eligible: ActiveProductTagPromotion[] = [];
  for (const promotion of candidates) {
    const eligibility = await checkPromotionEligibility(prisma, promotion, {
      subtotal: Number.MAX_SAFE_INTEGER,
      userId,
    });
    if (eligibility.eligible) {
      eligible.push({
        id: promotion.id,
        name: promotion.name,
        type: promotion.type,
        value: Number(promotion.value),
        max_discount: promotion.max_discount
          ? Number(promotion.max_discount)
          : null,
      });
    }
  }

  return eligible;
}

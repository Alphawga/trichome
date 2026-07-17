import type { prisma } from "@/lib/prisma";

/**
 * Activates SCHEDULED promotions past their start date and expires ACTIVE
 * promotions past their end date; there is no cron in this app, so status is
 * self-healed lazily whenever promotions are read. Call at the top of any
 * read procedure over Promotion.
 */
export async function syncPromotionStatuses(db: typeof prisma) {
  const now = new Date();
  await Promise.all([
    db.promotion.updateMany({
      where: { status: "SCHEDULED", start_date: { lte: now } },
      data: { status: "ACTIVE" },
    }),
    db.promotion.updateMany({
      where: { status: "ACTIVE", end_date: { lt: now } },
      data: { status: "EXPIRED" },
    }),
  ]);
}

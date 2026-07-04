import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const REVENUE_WHERE: Prisma.OrderWhereInput = {
  payment_status: "COMPLETED",
  status: { notIn: ["CANCELLED", "RETURNED", "REFUNDED"] },
};

export async function getRevenueTotal(
  extra: Prisma.OrderWhereInput = {},
): Promise<number> {
  const result = await prisma.order.aggregate({
    where: { ...extra, ...REVENUE_WHERE },
    _sum: { total: true },
  });

  return Number(result._sum.total ?? 0);
}

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
    // processing_fee is a Paystack pass-through the merchant never keeps —
    // exclude it so "revenue" doesn't count what was charged for the gateway.
    _sum: { total: true, processing_fee: true },
  });

  return (
    Number(result._sum.total ?? 0) - Number(result._sum.processing_fee ?? 0)
  );
}

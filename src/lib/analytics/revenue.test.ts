import type { Prisma } from "@prisma/client";

const aggregateMock = jest.fn();

jest.mock("@/lib/prisma", () => ({
  prisma: {
    order: {
      aggregate: (...args: unknown[]) => aggregateMock(...args),
    },
  },
}));

import { getRevenueTotal, REVENUE_WHERE } from "./revenue";

describe("REVENUE_WHERE", () => {
  it("requires COMPLETED payment status", () => {
    expect(REVENUE_WHERE.payment_status).toBe("COMPLETED");
  });

  it("excludes cancelled, returned, and refunded orders", () => {
    expect(REVENUE_WHERE.status).toEqual({
      notIn: ["CANCELLED", "RETURNED", "REFUNDED"],
    });
  });
});

describe("getRevenueTotal", () => {
  beforeEach(() => {
    aggregateMock.mockReset();
  });

  it("queries with the correctly-filtered where clause", async () => {
    aggregateMock.mockResolvedValue({ _sum: { total: 5000 } });

    await getRevenueTotal();

    expect(aggregateMock).toHaveBeenCalledWith({
      where: REVENUE_WHERE,
      _sum: { total: true },
    });
  });

  it("merges extra where conditions without overriding the exclusion filter", async () => {
    aggregateMock.mockResolvedValue({ _sum: { total: 1000 } });

    await getRevenueTotal({ created_at: { gte: new Date("2026-01-01") } });

    expect(aggregateMock).toHaveBeenCalledWith({
      where: {
        ...REVENUE_WHERE,
        created_at: { gte: new Date("2026-01-01") },
      },
      _sum: { total: true },
    });
  });

  it("returns the summed total as a number", async () => {
    aggregateMock.mockResolvedValue({ _sum: { total: 123456.78 } });

    const result = await getRevenueTotal();

    expect(result).toBe(123456.78);
  });

  it("returns 0 when there are no matching orders", async () => {
    aggregateMock.mockResolvedValue({ _sum: { total: null } });

    const result = await getRevenueTotal();

    expect(result).toBe(0);
  });

  it("does not let extra override the exclusion filter", async () => {
    aggregateMock.mockResolvedValue({ _sum: { total: 0 } });

    await getRevenueTotal({
      payment_status: "PENDING",
      status: "CANCELLED",
    } as Prisma.OrderWhereInput);

    expect(aggregateMock).toHaveBeenCalledWith({
      where: REVENUE_WHERE,
      _sum: { total: true },
    });
  });
});

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
    aggregateMock.mockResolvedValue({
      _sum: { total: 5000, processing_fee: 0 },
    });

    await getRevenueTotal();

    expect(aggregateMock).toHaveBeenCalledWith({
      where: REVENUE_WHERE,
      _sum: { total: true, processing_fee: true },
    });
  });

  it("merges extra where conditions without overriding the exclusion filter", async () => {
    aggregateMock.mockResolvedValue({
      _sum: { total: 1000, processing_fee: 0 },
    });

    await getRevenueTotal({ created_at: { gte: new Date("2026-01-01") } });

    expect(aggregateMock).toHaveBeenCalledWith({
      where: {
        ...REVENUE_WHERE,
        created_at: { gte: new Date("2026-01-01") },
      },
      _sum: { total: true, processing_fee: true },
    });
  });

  it("returns the summed total as a number", async () => {
    aggregateMock.mockResolvedValue({
      _sum: { total: 123456.78, processing_fee: 0 },
    });

    const result = await getRevenueTotal();

    expect(result).toBe(123456.78);
  });

  it("excludes the Paystack processing fee from the revenue figure", async () => {
    aggregateMock.mockResolvedValue({
      _sum: { total: 15325, processing_fee: 325 },
    });

    const result = await getRevenueTotal();

    expect(result).toBe(15000);
  });

  it("returns 0 when there are no matching orders", async () => {
    aggregateMock.mockResolvedValue({ _sum: { total: null, processing_fee: null } });

    const result = await getRevenueTotal();

    expect(result).toBe(0);
  });

  it("does not let extra override the exclusion filter", async () => {
    aggregateMock.mockResolvedValue({ _sum: { total: 0, processing_fee: 0 } });

    await getRevenueTotal({
      payment_status: "PENDING",
      status: "CANCELLED",
    } as Prisma.OrderWhereInput);

    expect(aggregateMock).toHaveBeenCalledWith({
      where: REVENUE_WHERE,
      _sum: { total: true, processing_fee: true },
    });
  });
});

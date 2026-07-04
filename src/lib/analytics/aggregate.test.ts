import { summarizeDailyAnalytics, type DailyAnalytics } from "./aggregate";

function day(overrides: Partial<DailyAnalytics>): DailyAnalytics {
  return {
    id: "2026-01-01",
    date: new Date("2026-01-01"),
    visitors: 0,
    page_views: 0,
    orders: 0,
    revenue: 0,
    conversion_rate: 0,
    bounce_rate: 0,
    ...overrides,
  };
}

describe("summarizeDailyAnalytics", () => {
  it("sums visitors, page views, orders, and revenue across days", () => {
    const summary = summarizeDailyAnalytics([
      day({ visitors: 10, page_views: 20, orders: 1, revenue: 5000 }),
      day({ visitors: 5, page_views: 8, orders: 2, revenue: 3000 }),
    ]);

    expect(summary.totalVisitors).toBe(15);
    expect(summary.totalPageViews).toBe(28);
    expect(summary.totalOrders).toBe(3);
    expect(summary.totalRevenue).toBe(8000);
  });

  it("weights conversion/bounce rate by visitor count rather than averaging days naively", () => {
    // Day A: 100 visitors, 10 orders (10% conversion), 50% bounce
    // Day B: 1 visitor, 1 order (100% conversion), 0% bounce
    // A naive mean of daily rates would give (10% + 100%) / 2 = 55% conversion
    // and (50% + 0%) / 2 = 25% bounce — both wrong once weighted by traffic.
    const summary = summarizeDailyAnalytics([
      day({
        visitors: 100,
        orders: 10,
        conversion_rate: 0.1,
        bounce_rate: 0.5,
      }),
      day({ visitors: 1, orders: 1, conversion_rate: 1, bounce_rate: 0 }),
    ]);

    expect(summary.avgConversionRate).toBeCloseTo(11 / 101);
    expect(summary.avgBounceRate).toBeCloseTo(50 / 101);
  });

  it("returns all zeros for an empty range", () => {
    const summary = summarizeDailyAnalytics([]);

    expect(summary).toEqual({
      totalVisitors: 0,
      totalPageViews: 0,
      totalOrders: 0,
      totalRevenue: 0,
      avgConversionRate: 0,
      avgBounceRate: 0,
    });
  });
});

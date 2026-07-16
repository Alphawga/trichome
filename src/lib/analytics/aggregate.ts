import { prisma } from "@/lib/prisma";
import { REVENUE_WHERE } from "@/lib/analytics/revenue";

export interface DailyAnalytics {
  id: string;
  date: Date;
  visitors: number;
  page_views: number;
  orders: number;
  revenue: number;
  conversion_rate: number;
  bounce_rate: number;
}

export interface AnalyticsSummary {
  totalVisitors: number;
  totalPageViews: number;
  totalOrders: number;
  totalRevenue: number;
  avgConversionRate: number;
  avgBounceRate: number;
}

function dayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

interface DayAccumulator {
  date: Date;
  visitors: number;
  page_views: number;
  bounces: number;
  orders: number;
  revenue: number;
}

export async function getDailyAnalytics(
  startDate: Date,
  endDate: Date,
): Promise<DailyAnalytics[]> {
  const [visitorStats, orders] = await Promise.all([
    prisma.visitorDailyStat.findMany({
      where: { date: { gte: startDate, lte: endDate } },
    }),
    prisma.order.findMany({
      where: {
        ...REVENUE_WHERE,
        created_at: { gte: startDate, lte: endDate },
      },
      select: { created_at: true, total: true, processing_fee: true },
    }),
  ]);

  const byDay = new Map<string, DayAccumulator>();
  const ensureDay = (key: string, date: Date): DayAccumulator => {
    let day = byDay.get(key);
    if (!day) {
      day = { date, visitors: 0, page_views: 0, bounces: 0, orders: 0, revenue: 0 };
      byDay.set(key, day);
    }
    return day;
  };

  for (const stat of visitorStats) {
    const key = dayKey(stat.date);
    const day = ensureDay(key, stat.date);
    day.visitors += 1;
    day.page_views += stat.page_view_count;
    if (stat.page_view_count === 1) day.bounces += 1;
  }

  for (const order of orders) {
    const key = dayKey(order.created_at);
    const day = ensureDay(key, order.created_at);
    day.orders += 1;
    // processing_fee is a Paystack pass-through, not merchant revenue.
    day.revenue += Number(order.total) - Number(order.processing_fee);
  }

  return Array.from(byDay.entries())
    .map(([key, day]) => ({
      id: key,
      date: day.date,
      visitors: day.visitors,
      page_views: day.page_views,
      orders: day.orders,
      revenue: day.revenue,
      conversion_rate: day.visitors > 0 ? day.orders / day.visitors : 0,
      bounce_rate: day.visitors > 0 ? day.bounces / day.visitors : 0,
    }))
    .sort((a, b) => a.date.getTime() - b.date.getTime());
}

export function summarizeDailyAnalytics(
  days: DailyAnalytics[],
): AnalyticsSummary {
  const totals = days.reduce(
    (acc, day) => {
      acc.totalVisitors += day.visitors;
      acc.totalPageViews += day.page_views;
      acc.totalOrders += day.orders;
      acc.totalRevenue += day.revenue;
      acc.totalBounces += day.bounce_rate * day.visitors;
      return acc;
    },
    {
      totalVisitors: 0,
      totalPageViews: 0,
      totalOrders: 0,
      totalRevenue: 0,
      totalBounces: 0,
    },
  );

  return {
    totalVisitors: totals.totalVisitors,
    totalPageViews: totals.totalPageViews,
    totalOrders: totals.totalOrders,
    totalRevenue: totals.totalRevenue,
    avgConversionRate:
      totals.totalVisitors > 0 ? totals.totalOrders / totals.totalVisitors : 0,
    avgBounceRate:
      totals.totalVisitors > 0 ? totals.totalBounces / totals.totalVisitors : 0,
  };
}

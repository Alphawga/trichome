import { z } from "zod";
import { staffProcedure } from "../trpc";

// Get analytics for date range
export const getAnalytics = staffProcedure
  .input(
    z.object({
      startDate: z.date(),
      endDate: z.date(),
    }),
  )
  .query(async ({ input, ctx }) => {
    const analytics = await ctx.prisma.analytics.findMany({
      where: {
        date: {
          gte: input.startDate,
          lte: input.endDate,
        },
      },
      orderBy: { date: "asc" },
    });

    return analytics;
  });

// Get analytics summary
export const getAnalyticsSummary = staffProcedure
  .input(
    z.object({
      startDate: z.date(),
      endDate: z.date(),
    }),
  )
  .query(async ({ input, ctx }) => {
    const analytics = await ctx.prisma.analytics.aggregate({
      where: {
        date: {
          gte: input.startDate,
          lte: input.endDate,
        },
      },
      _sum: {
        visitors: true,
        page_views: true,
        orders: true,
        revenue: true,
      },
      _avg: {
        conversion_rate: true,
        bounce_rate: true,
      },
    });

    return {
      totalVisitors: analytics._sum.visitors || 0,
      totalPageViews: analytics._sum.page_views || 0,
      totalOrders: analytics._sum.orders || 0,
      totalRevenue: analytics._sum.revenue || 0,
      avgConversionRate: analytics._avg.conversion_rate || 0,
      avgBounceRate: analytics._avg.bounce_rate || 0,
    };
  });

// Record analytics (internal use)
export const recordAnalytics = staffProcedure
  .input(
    z.object({
      date: z.date(),
      visitors: z.number().int().default(0),
      page_views: z.number().int().default(0),
      orders: z.number().int().default(0),
      revenue: z.number().default(0),
      conversion_rate: z.number().default(0),
      bounce_rate: z.number().default(0),
    }),
  )
  .mutation(async ({ input, ctx }) => {
    const analytics = await ctx.prisma.analytics.upsert({
      where: { date: input.date },
      update: input,
      create: input,
    });

    return { analytics, message: "Analytics recorded successfully" };
  });

// Get dashboard statistics
export const getDashboardStats = staffProcedure.query(async ({ ctx }) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    todayOrders,
    todayRevenue,
    totalProducts,
    lowStockProducts,
    totalCustomers,
    pendingOrders,
  ] = await Promise.all([
    ctx.prisma.order.count({
      where: {
        created_at: { gte: today },
      },
    }),
    ctx.prisma.order.aggregate({
      where: {
        created_at: { gte: today },
        payment_status: "COMPLETED",
      },
      _sum: { total: true },
    }),
    ctx.prisma.product.count({
      where: { status: "ACTIVE" },
    }),
    ctx.prisma.product.count({
      where: {
        status: "ACTIVE",
        track_quantity: true,
        quantity: { lte: ctx.prisma.product.fields.low_stock_threshold },
      },
    }),
    ctx.prisma.user.count({
      where: { role: "CUSTOMER" },
    }),
    ctx.prisma.order.count({
      where: { status: "PENDING" },
    }),
  ]);

  return {
    todayOrders,
    todayRevenue: todayRevenue._sum.total || 0,
    totalProducts,
    lowStockProducts,
    totalCustomers,
    pendingOrders,
  };
});

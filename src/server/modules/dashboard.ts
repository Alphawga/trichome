import { z } from "zod";
import { REVENUE_WHERE } from "@/lib/analytics/revenue";
import { staffProcedure } from "../trpc";

// Get dashboard statistics
export const getDashboardStats = staffProcedure.query(async ({ ctx }) => {
  const now = new Date();
  const lastMonth = new Date(
    now.getFullYear(),
    now.getMonth() - 1,
    now.getDate(),
  );

  // Total products
  const totalProducts = await ctx.prisma.product.count({
    where: { status: "ACTIVE" },
  });

  // Products sold (from order items in the last month)
  const productsSoldThisMonth = await ctx.prisma.orderItem.aggregate({
    where: {
      order: {
        created_at: { gte: lastMonth },
        status: { in: ["PROCESSING", "SHIPPED", "DELIVERED"] },
      },
    },
    _sum: { quantity: true },
  });

  const productsSoldLastMonth = await ctx.prisma.orderItem.aggregate({
    where: {
      order: {
        created_at: {
          gte: new Date(now.getFullYear(), now.getMonth() - 2, now.getDate()),
          lt: lastMonth,
        },
        status: { in: ["PROCESSING", "SHIPPED", "DELIVERED"] },
      },
    },
    _sum: { quantity: true },
  });

  // Calculate trend for products sold
  const productsSold = productsSoldThisMonth._sum.quantity || 0;
  const productsSoldPrevious = productsSoldLastMonth._sum.quantity || 0;
  const productsSoldTrend =
    productsSoldPrevious > 0
      ? (
        ((productsSold - productsSoldPrevious) / productsSoldPrevious) *
        100
      ).toFixed(1)
      : "0.0";

  // Completed orders this month
  const completedOrdersThisMonth = await ctx.prisma.order.count({
    where: {
      created_at: { gte: lastMonth },
      status: "DELIVERED",
    },
  });

  const completedOrdersLastMonth = await ctx.prisma.order.count({
    where: {
      created_at: {
        gte: new Date(now.getFullYear(), now.getMonth() - 2, now.getDate()),
        lt: lastMonth,
      },
      status: "DELIVERED",
    },
  });

  // Calculate trend for completed orders
  const completedOrdersTrend =
    completedOrdersLastMonth > 0
      ? (
        ((completedOrdersThisMonth - completedOrdersLastMonth) /
          completedOrdersLastMonth) *
        100
      ).toFixed(1)
      : "0.0";

  // Pending orders
  const pendingOrders = await ctx.prisma.order.count({
    where: { status: "PENDING" },
  });

  // Out of stock items
  const outOfStockItems = await ctx.prisma.product.count({
    where: {
      status: "ACTIVE",
      quantity: { lte: 0 },
    },
  });

  // Low stock items (quantity <= low_stock_threshold)
  const lowStockItems = await ctx.prisma.product.count({
    where: {
      status: "ACTIVE",
      quantity: { lte: ctx.prisma.product.fields.low_stock_threshold },
    },
  });

  return {
    productsSold: {
      value: productsSold,
      trend: productsSoldTrend,
    },
    completedOrders: {
      value: completedOrdersThisMonth,
      trend: completedOrdersTrend,
    },
    pendingOrders: pendingOrders,
    outOfStockItems: outOfStockItems,
    lowStockItems: lowStockItems,
    totalProducts: totalProducts,
  };
});

// Get top performing products
export const getTopProducts = staffProcedure
  .input(
    z.object({
      limit: z.number().min(1).max(50).default(10),
    }),
  )
  .query(async ({ input, ctx }) => {
    // Rank by units sold at the DB level first, then fetch product details —
    // fetching `limit` products before ranking would miss real best-sellers
    // that don't happen to fall in the first `limit` rows of an unordered scan.
    const grouped = await ctx.prisma.orderItem.groupBy({
      by: ["product_id"],
      where: { order: REVENUE_WHERE },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: input.limit * 2, // headroom to filter out non-ACTIVE products below
    });

    const productIds = grouped.map((g) => g.product_id);
    const products = await ctx.prisma.product.findMany({
      where: { id: { in: productIds }, status: "ACTIVE" },
      include: {
        category: { select: { name: true } },
        images: { where: { is_primary: true }, take: 1 },
      },
    });
    const productsById = new Map(products.map((p) => [p.id, p]));

    const productsWithSales = grouped
      .map((g) => {
        const product = productsById.get(g.product_id);
        if (!product) return null;
        return {
          id: product.id,
          name: product.name,
          category: product.category.name,
          price: Number(product.price),
          stock: product.quantity,
          status:
            product.quantity > 0
              ? ("In stock" as const)
              : ("Out of stock" as const),
          imageUrl:
            product.images[0]?.url ||
            "https://placehold.co/50x50/38761d/white?text=P",
          totalSold: g._sum.quantity ?? 0,
        };
      })
      .filter((p): p is NonNullable<typeof p> => p !== null)
      .slice(0, input.limit);

    return productsWithSales;
  });


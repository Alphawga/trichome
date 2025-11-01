import { z } from 'zod'
import { staffProcedure } from '../trpc'

// Get dashboard statistics
export const getDashboardStats = staffProcedure.query(async ({ ctx }) => {
  const now = new Date()
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())

  // Total products
  const totalProducts = await ctx.prisma.product.count({
    where: { status: 'ACTIVE' },
  })

  // Products sold (from order items in the last month)
  const productsSoldThisMonth = await ctx.prisma.orderItem.aggregate({
    where: {
      order: {
        created_at: { gte: lastMonth },
        status: { in: ['PROCESSING', 'SHIPPED', 'DELIVERED'] },
      },
    },
    _sum: { quantity: true },
  })

  const productsSoldLastMonth = await ctx.prisma.orderItem.aggregate({
    where: {
      order: {
        created_at: {
          gte: new Date(now.getFullYear(), now.getMonth() - 2, now.getDate()),
          lt: lastMonth,
        },
        status: { in: ['PROCESSING', 'SHIPPED', 'DELIVERED'] },
      },
    },
    _sum: { quantity: true },
  })

  // Calculate trend for products sold
  const productsSold = productsSoldThisMonth._sum.quantity || 0
  const productsSoldPrevious = productsSoldLastMonth._sum.quantity || 0
  const productsSoldTrend =
    productsSoldPrevious > 0
      ? (((productsSold - productsSoldPrevious) / productsSoldPrevious) * 100).toFixed(1)
      : '0.0'

  // Completed orders this month
  const completedOrdersThisMonth = await ctx.prisma.order.count({
    where: {
      created_at: { gte: lastMonth },
      status: 'DELIVERED',
    },
  })

  const completedOrdersLastMonth = await ctx.prisma.order.count({
    where: {
      created_at: {
        gte: new Date(now.getFullYear(), now.getMonth() - 2, now.getDate()),
        lt: lastMonth,
      },
      status: 'DELIVERED',
    },
  })

  // Calculate trend for completed orders
  const completedOrdersTrend =
    completedOrdersLastMonth > 0
      ? (((completedOrdersThisMonth - completedOrdersLastMonth) / completedOrdersLastMonth) * 100).toFixed(1)
      : '0.0'

  // Pending orders
  const pendingOrders = await ctx.prisma.order.count({
    where: { status: 'PENDING' },
  })

  // Out of stock items
  const outOfStockItems = await ctx.prisma.product.count({
    where: {
      status: 'ACTIVE',
      quantity: { lte: 0 },
    },
  })

  // Low stock items (quantity <= low_stock_threshold)
  const lowStockItems = await ctx.prisma.product.count({
    where: {
      status: 'ACTIVE',
      quantity: { lte: ctx.prisma.product.fields.low_stock_threshold },
    },
  })

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
  }
})

// Get top performing products
export const getTopProducts = staffProcedure
  .input(
    z.object({
      limit: z.number().min(1).max(50).default(10),
    })
  )
  .query(async ({ input, ctx }) => {
    // Get products with most sales
    const topProducts = await ctx.prisma.product.findMany({
      where: { status: 'ACTIVE' },
      include: {
        category: {
          select: { name: true },
        },
        images: {
          where: { is_primary: true },
          take: 1,
        },
        order_items: {
          select: {
            quantity: true,
          },
        },
      },
      take: input.limit,
    })

    // Calculate total sales for each product and sort
    const productsWithSales = topProducts.map((product) => {
      const totalSold = product.order_items.reduce((sum, item) => sum + item.quantity, 0)
      return {
        id: product.id,
        name: product.name,
        category: product.category.name,
        price: Number(product.price),
        stock: product.quantity,
        status: product.quantity > 0 ? ('In stock' as const) : ('Out of stock' as const),
        imageUrl: product.images[0]?.url || 'https://placehold.co/50x50/38761d/white?text=P',
        totalSold,
      }
    })

    // Sort by total sold
    productsWithSales.sort((a, b) => b.totalSold - a.totalSold)

    return productsWithSales
  })

import { z } from 'zod'
import { protectedProcedure, staffProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'
import { OrderStatus, PaymentStatus, PaymentMethod, Currency } from '@prisma/client'

// Get user's orders
export const getMyOrders = protectedProcedure
  .input(
    z.object({
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(50).default(10),
    })
  )
  .query(async ({ input, ctx }) => {
    const { page, limit } = input
    const skip = (page - 1) * limit

    const [orders, total] = await Promise.all([
      ctx.prisma.order.findMany({
        where: { user_id: ctx.user.id },
        skip,
        take: limit,
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  images: {
                    where: { is_primary: true },
                    take: 1,
                  },
                },
              },
            },
          },
          shipping_address: true,
        },
        orderBy: { created_at: 'desc' },
      }),
      ctx.prisma.order.count({ where: { user_id: ctx.user.id } }),
    ])

    return {
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    }
  })

// Get all orders (staff)
export const getOrders = staffProcedure
  .input(
    z.object({
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(100).default(10),
      status: z.nativeEnum(OrderStatus).optional(),
      payment_status: z.nativeEnum(PaymentStatus).optional(),
      search: z.string().optional(),
    })
  )
  .query(async ({ input, ctx }) => {
    const { page, limit, status, payment_status, search } = input
    const skip = (page - 1) * limit

    const where = {
      ...(status && { status }),
      ...(payment_status && { payment_status }),
      ...(search && {
        OR: [
          { order_number: { contains: search } },
          { email: { contains: search, mode: 'insensitive' as const } },
          { first_name: { contains: search, mode: 'insensitive' as const } },
          { last_name: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    }

    const [orders, total] = await Promise.all([
      ctx.prisma.order.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              first_name: true,
              last_name: true,
            },
          },
          items: true,
          shipping_address: true,
        },
        orderBy: { created_at: 'desc' },
      }),
      ctx.prisma.order.count({ where }),
    ])

    return {
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    }
  })

// Get order by ID
export const getOrderById = protectedProcedure
  .input(z.object({ id: z.string() }))
  .query(async ({ input, ctx }) => {
    const order = await ctx.prisma.order.findUnique({
      where: { id: input.id },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                images: {
                  where: { is_primary: true },
                  take: 1,
                },
              },
            },
          },
        },
        shipping_address: true,
        payments: true,
        status_history: {
          orderBy: { created_at: 'desc' },
        },
      },
    })

    if (!order) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Order not found' })
    }

    // Check if user has access to this order
    if (order.user_id !== ctx.user.id && ctx.user.role !== 'ADMIN' && ctx.user.role !== 'STAFF') {
      throw new TRPCError({ code: 'FORBIDDEN', message: 'Access denied' })
    }

    return order
  })

// Get order by order number
export const getOrderByNumber = protectedProcedure
  .input(z.object({ orderNumber: z.string() }))
  .query(async ({ input, ctx }) => {
    const order = await ctx.prisma.order.findUnique({
      where: { order_number: input.orderNumber },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                images: {
                  where: { is_primary: true },
                  take: 1,
                },
              },
            },
          },
        },
        shipping_address: true,
        payments: true,
        status_history: {
          orderBy: { created_at: 'desc' },
        },
      },
    })

    if (!order) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Order not found' })
    }

    return order
  })

// Create order
export const createOrder = protectedProcedure
  .input(
    z.object({
      email: z.string().email(),
      first_name: z.string().min(1),
      last_name: z.string().min(1),
      phone: z.string().optional(),
      payment_method: z.nativeEnum(PaymentMethod),
      currency: z.nativeEnum(Currency).default('NGN'),
      shipping_address_id: z.string(),
      notes: z.string().optional(),
      items: z.array(
        z.object({
          product_id: z.string(),
          quantity: z.number().int().min(1),
        })
      ),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const { items: orderItems, ...orderData } = input

    // Validate products and calculate totals
    const products = await ctx.prisma.product.findMany({
      where: { id: { in: orderItems.map((item) => item.product_id) } },
    })

    if (products.length !== orderItems.length) {
      throw new TRPCError({ code: 'BAD_REQUEST', message: 'Some products not found' })
    }

    // Check stock availability
    for (const orderItem of orderItems) {
      const product = products.find((p) => p.id === orderItem.product_id)
      if (!product) continue

      if (product.track_quantity && product.quantity < orderItem.quantity) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Insufficient stock for ${product.name}`,
        })
      }
    }

    // Calculate totals
    const subtotal = orderItems.reduce((sum, item) => {
      const product = products.find((p) => p.id === item.product_id)!
      return sum + Number(product.price) * item.quantity
    }, 0)

    const shipping_cost = 0 // Calculate based on your logic
    const tax = 0 // Calculate based on your logic
    const discount = 0
    const total = subtotal + shipping_cost + tax - discount

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    // Create order
    const order = await ctx.prisma.order.create({
      data: {
        order_number: orderNumber,
        user_id: ctx.user.id,
        email: orderData.email,
        first_name: orderData.first_name,
        last_name: orderData.last_name,
        phone: orderData.phone,
        payment_method: orderData.payment_method,
        currency: orderData.currency,
        shipping_address_id: orderData.shipping_address_id,
        notes: orderData.notes,
        subtotal,
        shipping_cost,
        tax,
        discount,
        total,
        items: {
          create: orderItems.map((item) => {
            const product = products.find((p) => p.id === item.product_id)!
            return {
              product_id: item.product_id,
              product_name: product.name,
              product_sku: product.sku,
              price: product.price,
              quantity: item.quantity,
              total: Number(product.price) * item.quantity,
            }
          }),
        },
        status_history: {
          create: {
            status: 'PENDING',
            notes: 'Order created',
            created_by: ctx.user.id,
          },
        },
      },
      include: {
        items: true,
        shipping_address: true,
      },
    })

    // Clear cart after order
    await ctx.prisma.cartItem.deleteMany({
      where: { user_id: ctx.user.id },
    })

    // Update product quantities
    for (const item of orderItems) {
      const product = products.find((p) => p.id === item.product_id)!
      if (product.track_quantity) {
        await ctx.prisma.product.update({
          where: { id: item.product_id },
          data: {
            quantity: { decrement: item.quantity },
            reserved_quantity: { increment: item.quantity },
            sale_count: { increment: item.quantity },
          },
        })
      }
    }

    return { order, message: 'Order created successfully' }
  })

// Update order status (staff)
export const updateOrderStatus = staffProcedure
  .input(
    z.object({
      id: z.string(),
      status: z.nativeEnum(OrderStatus),
      notes: z.string().optional(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const order = await ctx.prisma.order.update({
      where: { id: input.id },
      data: {
        status: input.status,
        status_history: {
          create: {
            status: input.status,
            notes: input.notes,
            created_by: ctx.user.id,
          },
        },
      },
      include: {
        items: true,
        shipping_address: true,
      },
    })

    return { order, message: 'Order status updated successfully' }
  })

// Cancel order
export const cancelOrder = protectedProcedure
  .input(
    z.object({
      id: z.string(),
      reason: z.string().optional(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const order = await ctx.prisma.order.findUnique({
      where: { id: input.id },
      include: { items: true },
    })

    if (!order) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Order not found' })
    }

    if (order.user_id !== ctx.user.id && ctx.user.role !== 'ADMIN') {
      throw new TRPCError({ code: 'FORBIDDEN', message: 'Access denied' })
    }

    if (order.status === 'DELIVERED' || order.status === 'CANCELLED') {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Cannot cancel this order',
      })
    }

    const updatedOrder = await ctx.prisma.order.update({
      where: { id: input.id },
      data: {
        status: 'CANCELLED',
        cancelled_at: new Date(),
        cancellation_reason: input.reason,
        status_history: {
          create: {
            status: 'CANCELLED',
            notes: input.reason || 'Order cancelled by customer',
            created_by: ctx.user.id,
          },
        },
      },
    })

    // Restore product quantities
    for (const item of order.items) {
      await ctx.prisma.product.update({
        where: { id: item.product_id },
        data: {
          quantity: { increment: item.quantity },
          reserved_quantity: { decrement: item.quantity },
        },
      })
    }

    return { order: updatedOrder, message: 'Order cancelled successfully' }
  })

// Get order statistics (staff)
export const getOrderStats = staffProcedure.query(async ({ ctx }) => {
  const [total, pending, processing, shipped, delivered, cancelled] = await Promise.all([
    ctx.prisma.order.count(),
    ctx.prisma.order.count({ where: { status: 'PENDING' } }),
    ctx.prisma.order.count({ where: { status: 'PROCESSING' } }),
    ctx.prisma.order.count({ where: { status: 'SHIPPED' } }),
    ctx.prisma.order.count({ where: { status: 'DELIVERED' } }),
    ctx.prisma.order.count({ where: { status: 'CANCELLED' } }),
  ])

  const revenue = await ctx.prisma.order.aggregate({
    where: { payment_status: 'COMPLETED' },
    _sum: { total: true },
  })

  return {
    total,
    pending,
    processing,
    shipped,
    delivered,
    cancelled,
    revenue: revenue._sum.total || 0,
  }
})

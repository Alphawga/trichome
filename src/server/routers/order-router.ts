import { z } from 'zod'
import { createTRPCRouter, publicProcedure } from '../trpc'
import { orderService } from '@/lib/services/order-service'
import { TRPCError } from '@trpc/server'
import { ServiceError } from '@/lib/services/base-service'
import { OrderStatus } from '@prisma/client'

// Helper function to convert ServiceError to TRPCError
const handleServiceError = (error: unknown): never => {
  if (error instanceof ServiceError) {
    const trpcCode = error.statusCode === 404 ? 'NOT_FOUND' :
                     error.statusCode === 401 ? 'UNAUTHORIZED' :
                     error.statusCode === 403 ? 'FORBIDDEN' :
                     error.statusCode === 409 ? 'CONFLICT' :
                     'INTERNAL_SERVER_ERROR'

    throw new TRPCError({
      code: trpcCode,
      message: error.message,
      cause: error
    })
  }

  throw new TRPCError({
    code: 'INTERNAL_SERVER_ERROR',
    message: 'An unexpected error occurred',
    cause: error
  })
}

// Address schema
const addressSchema = z.object({
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  address_line_1: z.string().min(1),
  address_line_2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().min(1),
  postal_code: z.string().min(1),
  country: z.string().min(1),
  phone_number: z.string().min(1)
})

// Order item schema
const orderItemSchema = z.object({
  product_id: z.string().cuid(),
  quantity: z.number().int().positive(),
  variant_id: z.string().cuid().optional()
})

// Input schemas
const createOrderSchema = z.object({
  user_id: z.string().cuid().optional(),
  guest_email: z.string().email().optional(),
  guest_phone: z.string().optional(),
  shipping_address: addressSchema,
  billing_address: addressSchema.optional(),
  items: z.array(orderItemSchema).min(1),
  notes: z.string().optional()
})

const updateOrderSchema = z.object({
  id: z.string().cuid(),
  status: z.nativeEnum(OrderStatus).optional(),
  tracking_number: z.string().optional(),
  notes: z.string().optional(),
  shipped_at: z.date().optional(),
  delivered_at: z.date().optional()
})

const getOrdersSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  status: z.nativeEnum(OrderStatus).optional(),
  user_id: z.string().cuid().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  search: z.string().optional()
})

export const orderRouter = createTRPCRouter({
  create: publicProcedure
    .input(createOrderSchema)
    .mutation(async ({ input }) => {
      try {
        return await orderService.createOrder(input)
      } catch (error) {
        handleServiceError(error)
      }
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(async ({ input }) => {
      try {
        const order = await orderService.getOrderById(input.id)
        if (!order) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Order not found'
          })
        }
        return order
      } catch (error) {
        handleServiceError(error)
      }
    }),

  getByNumber: publicProcedure
    .input(z.object({ orderNumber: z.string() }))
    .query(async ({ input }) => {
      try {
        const order = await orderService.getOrderByNumber(input.orderNumber)
        if (!order) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Order not found'
          })
        }
        return order
      } catch (error) {
        handleServiceError(error)
      }
    }),

  getAll: publicProcedure
    .input(getOrdersSchema)
    .query(async ({ input }) => {
      try {
        const { page, limit, ...filters } = input
        return await orderService.getOrders({ page, limit }, filters)
      } catch (error) {
        handleServiceError(error)
      }
    }),

  getUserOrders: publicProcedure
    .input(z.object({
      userId: z.string().cuid(),
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(100).default(10)
    }))
    .query(async ({ input }) => {
      try {
        const { userId, page, limit } = input
        return await orderService.getUserOrders(userId, { page, limit })
      } catch (error) {
        handleServiceError(error)
      }
    }),

  update: publicProcedure
    .input(updateOrderSchema)
    .mutation(async ({ input }) => {
      try {
        const { id, ...data } = input
        return await orderService.updateOrder(id, data)
      } catch (error) {
        handleServiceError(error)
      }
    }),

  cancel: publicProcedure
    .input(z.object({
      id: z.string().cuid(),
      reason: z.string().optional()
    }))
    .mutation(async ({ input }) => {
      try {
        return await orderService.cancelOrder(input.id, input.reason)
      } catch (error) {
        handleServiceError(error)
      }
    }),

  updateStatus: publicProcedure
    .input(z.object({
      id: z.string().cuid(),
      status: z.nativeEnum(OrderStatus),
      tracking_number: z.string().optional(),
      notes: z.string().optional()
    }))
    .mutation(async ({ input }) => {
      try {
        const { id, ...data } = input
        return await orderService.updateOrder(id, data)
      } catch (error) {
        handleServiceError(error)
      }
    }),

  getStats: publicProcedure
    .query(async () => {
      try {
        return await orderService.getOrderStats()
      } catch (error) {
        handleServiceError(error)
      }
    }),

  // Tracking endpoint for customers
  track: publicProcedure
    .input(z.object({ orderNumber: z.string() }))
    .query(async ({ input }) => {
      try {
        const order = await orderService.getOrderByNumber(input.orderNumber)
        if (!order) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Order not found'
          })
        }

        // Return only tracking-relevant information
        return {
          order_number: order.order_number,
          status: order.status,
          created_at: order.created_at,
          shipped_at: order.shipped_at,
          delivered_at: order.delivered_at,
          tracking_number: order.tracking_number,
          orderItems: order.orderItems.map(item => ({
            product_name: item.product.name,
            quantity: item.quantity,
            unit_price: item.unit_price
          })),
          total_amount: order.total_amount
        }
      } catch (error) {
        handleServiceError(error)
      }
    })
})
import { z } from 'zod'
import { orderService } from '../services'
import { handleServiceError } from '../error-handler'
import {
  createOrderSchema,
  updateOrderSchema,
  getOrderSchema,
  getOrdersSchema,
  getOrderByNumberSchema,
} from '../../lib/validations/order'
import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc'

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
    .input(getOrderSchema)
    .query(async ({ input }) => {
      try {
        return await orderService.getOrderById(input.id)
      } catch (error) {
        handleServiceError(error)
      }
    }),

  getByNumber: publicProcedure
    .input(getOrderByNumberSchema)
    .query(async ({ input }) => {
      try {
        return await orderService.getOrderByNumber(input.order_number)
      } catch (error) {
        handleServiceError(error)
      }
    }),

  getAll: protectedProcedure
    .input(getOrdersSchema)
    .query(async ({ input }) => {
      try {
        return await orderService.getOrders(input)
      } catch (error) {
        handleServiceError(error)
      }
    }),

  getUserOrders: publicProcedure
    .input(z.object({
      userId: z.string().cuid(),
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(50).default(10),
    }))
    .query(async ({ input }) => {
      try {
        return await orderService.getUserOrderHistory(input.userId, input.page, input.limit)
      } catch (error) {
        handleServiceError(error)
      }
    }),

  updateStatus: protectedProcedure
    .input(updateOrderSchema.extend({
      updatedBy: z.string().cuid().optional(),
    }))
    .mutation(async ({ input }) => {
      try {
        const { id, updatedBy, ...data } = input
        return await orderService.updateOrderStatus(id, data, updatedBy)
      } catch (error) {
        handleServiceError(error)
      }
    }),

  cancel: protectedProcedure
    .input(z.object({
      id: z.string().cuid(),
      reason: z.string().optional(),
      cancelledBy: z.string().cuid().optional(),
    }))
    .mutation(async ({ input }) => {
      try {
        return await orderService.cancelOrder(input.id, input.reason, input.cancelledBy)
      } catch (error) {
        handleServiceError(error)
      }
    }),

  getAnalytics: protectedProcedure
    .input(z.object({
      dateFrom: z.date().optional(),
      dateTo: z.date().optional(),
    }))
    .query(async ({ input }) => {
      try {
        return await orderService.getOrderAnalytics(input.dateFrom, input.dateTo)
      } catch (error) {
        handleServiceError(error)
      }
    }),
})
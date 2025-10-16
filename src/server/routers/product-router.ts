import { z } from 'zod'
import { createTRPCRouter, publicProcedure, protectedProcedure } from '../trpc'
import { productService } from '../services'
import { handleServiceError } from '../error-handler'
import {
  createProductSchema,
  updateProductSchema,
  getProductSchema,
  getProductsSchema,
  getProductBySlugSchema,
} from '../../lib/validations/product'

export const productRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createProductSchema)
    .mutation(async ({ input }) => {
      try {
        return await productService.createProduct(input)
      } catch (error) {
        handleServiceError(error)
      }
    }),

  getById: publicProcedure
    .input(getProductSchema)
    .query(async ({ input }) => {
      try {
        return await productService.getProductById(input.id, true)
      } catch (error) {
        handleServiceError(error)
      }
    }),

  getBySlug: publicProcedure
    .input(getProductBySlugSchema)
    .query(async ({ input }) => {
      try {
        return await productService.getProductBySlug(input.slug, true)
      } catch (error) {
        handleServiceError(error)
      }
    }),

  getAll: publicProcedure
    .input(getProductsSchema)
    .query(async ({ input }) => {
      try {
        return await productService.getProducts(input)
      } catch (error) {
        handleServiceError(error)
      }
    }),

  getFeatured: publicProcedure
    .input(z.object({ limit: z.number().min(1).max(20).default(8) }))
    .query(async ({ input }) => {
      try {
        return await productService.getFeaturedProducts(input.limit)
      } catch (error) {
        handleServiceError(error)
      }
    }),

  update: protectedProcedure
    .input(updateProductSchema)
    .mutation(async ({ input }) => {
      try {
        const { id, ...data } = input
        return await productService.updateProduct(id, data)
      } catch (error) {
        handleServiceError(error)
      }
    }),

  updateInventory: protectedProcedure
    .input(z.array(z.object({
      productId: z.string().cuid(),
      quantity: z.number().int(),
      operation: z.enum(['increment', 'decrement', 'set']),
      reason: z.string().optional(),
    })))
    .mutation(async ({ input }) => {
      try {
        return await productService.updateInventory(input)
      } catch (error) {
        handleServiceError(error)
      }
    }),

  reserveInventory: protectedProcedure
    .input(z.object({
      productId: z.string().cuid(),
      quantity: z.number().int().positive(),
    }))
    .mutation(async ({ input }) => {
      try {
        return await productService.reserveInventory(input.productId, input.quantity)
      } catch (error) {
        handleServiceError(error)
      }
    }),

  releaseInventory: protectedProcedure
    .input(z.object({
      productId: z.string().cuid(),
      quantity: z.number().int().positive(),
    }))
    .mutation(async ({ input }) => {
      try {
        return await productService.releaseReservedInventory(input.productId, input.quantity)
      } catch (error) {
        handleServiceError(error)
      }
    }),

  getLowStock: protectedProcedure
    .query(async () => {
      try {
        return await productService.getLowStockProducts()
      } catch (error) {
        handleServiceError(error)
      }
    }),

  getAnalytics: protectedProcedure
    .input(getProductSchema)
    .query(async ({ input }) => {
      try {
        return await productService.getProductAnalytics(input.id)
      } catch (error) {
        handleServiceError(error)
      }
    }),

  delete: protectedProcedure
    .input(getProductSchema)
    .mutation(async ({ input }) => {
      try {
        return await productService.deleteProduct(input.id)
      } catch (error) {
        handleServiceError(error)
      }
    }),
})
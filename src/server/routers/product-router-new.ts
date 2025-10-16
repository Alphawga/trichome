import { z } from 'zod'
import { createTRPCRouter, publicProcedure } from '../trpc'
import { productService } from '@/lib/services/product-service'
import { TRPCError } from '@trpc/server'
import { ServiceError } from '@/lib/services/base-service'
import { ProductStatus } from '@prisma/client'

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

// Input schemas
const createProductSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  price: z.number().positive(),
  category_id: z.string().cuid(),
  sku: z.string().optional(),
  stock_quantity: z.number().int().min(0),
  weight: z.number().positive().optional(),
  dimensions: z.string().optional(),
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
  featured: z.boolean().optional(),
  status: z.nativeEnum(ProductStatus).optional()
})

const updateProductSchema = z.object({
  id: z.string().cuid(),
  name: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  price: z.number().positive().optional(),
  category_id: z.string().cuid().optional(),
  stock_quantity: z.number().int().min(0).optional(),
  weight: z.number().positive().optional(),
  dimensions: z.string().optional(),
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
  featured: z.boolean().optional(),
  status: z.nativeEnum(ProductStatus).optional()
})

const getProductsSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  category_id: z.string().cuid().optional(),
  status: z.nativeEnum(ProductStatus).optional(),
  featured: z.boolean().optional(),
  inStock: z.boolean().optional(),
  priceMin: z.number().positive().optional(),
  priceMax: z.number().positive().optional(),
  search: z.string().optional()
})

const updateStockSchema = z.object({
  productId: z.string().cuid(),
  quantity: z.number().int().min(0),
  operation: z.enum(['add', 'subtract', 'set']).default('set')
})

export const productRouter = createTRPCRouter({
  create: publicProcedure
    .input(createProductSchema)
    .mutation(async ({ input }) => {
      try {
        return await productService.createProduct(input)
      } catch (error) {
        handleServiceError(error)
      }
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(async ({ input }) => {
      try {
        const product = await productService.getProductById(input.id)
        if (!product) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Product not found'
          })
        }
        return product
      } catch (error) {
        handleServiceError(error)
      }
    }),

  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      try {
        const product = await productService.getProductBySlug(input.slug)
        if (!product) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Product not found'
          })
        }
        return product
      } catch (error) {
        handleServiceError(error)
      }
    }),

  getAll: publicProcedure
    .input(getProductsSchema)
    .query(async ({ input }) => {
      try {
        const { page, limit, ...filters } = input
        return await productService.getProducts({ page, limit }, filters)
      } catch (error) {
        handleServiceError(error)
      }
    }),

  update: publicProcedure
    .input(updateProductSchema)
    .mutation(async ({ input }) => {
      try {
        const { id, ...data } = input
        return await productService.updateProduct(id, data)
      } catch (error) {
        handleServiceError(error)
      }
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ input }) => {
      try {
        await productService.deleteProduct(input.id)
        return { success: true }
      } catch (error) {
        handleServiceError(error)
      }
    }),

  updateStock: publicProcedure
    .input(updateStockSchema)
    .mutation(async ({ input }) => {
      try {
        return await productService.updateStock(
          input.productId,
          input.quantity,
          input.operation
        )
      } catch (error) {
        handleServiceError(error)
      }
    }),

  toggleFeatured: publicProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ input }) => {
      try {
        return await productService.toggleFeaturedStatus(input.id)
      } catch (error) {
        handleServiceError(error)
      }
    }),

  getFeatured: publicProcedure
    .input(z.object({ limit: z.number().min(1).max(50).default(8) }))
    .query(async ({ input }) => {
      try {
        return await productService.getFeaturedProducts(input.limit)
      } catch (error) {
        handleServiceError(error)
      }
    }),

  getNewArrivals: publicProcedure
    .input(z.object({ limit: z.number().min(1).max(50).default(10) }))
    .query(async ({ input }) => {
      try {
        return await productService.getNewArrivals(input.limit)
      } catch (error) {
        handleServiceError(error)
      }
    }),

  getTopSelling: publicProcedure
    .input(z.object({ limit: z.number().min(1).max(50).default(10) }))
    .query(async ({ input }) => {
      try {
        return await productService.getTopSellingProducts(input.limit)
      } catch (error) {
        handleServiceError(error)
      }
    }),

  getLowStockAlerts: publicProcedure
    .input(z.object({ threshold: z.number().min(1).default(10) }))
    .query(async ({ input }) => {
      try {
        return await productService.getLowStockAlerts(input.threshold)
      } catch (error) {
        handleServiceError(error)
      }
    }),

  getStats: publicProcedure
    .query(async () => {
      try {
        return await productService.getProductStats()
      } catch (error) {
        handleServiceError(error)
      }
    })
})
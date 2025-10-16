import { PrismaClient, ProductStatus } from '@prisma/client'
import { BaseService } from './base-service'
import { ServiceError } from '../../lib/errors/service-error'
import type {
  CreateProductInput,
  UpdateProductInput,
  GetProductsInput
} from '../../lib/validations/product'

interface InventoryUpdate {
  productId: string
  quantity: number
  operation: 'increment' | 'decrement' | 'set'
  reason?: string
}

interface StockAlert {
  productId: string
  productName: string
  currentStock: number
  threshold: number
}

export class ProductService extends BaseService {
  constructor(prisma: PrismaClient) {
    super(prisma, 'ProductService')
  }

  async createProduct(data: CreateProductInput) {
    return this.executeWithLogging(
      'createProduct',
      async () => {
        // Check slug uniqueness
        await this.ensureUnique(
          'Product',
          'slug',
          data.slug,
          () => this.prisma.product.findUnique({ where: { slug: data.slug } })
        )

        // Check SKU uniqueness
        await this.ensureUnique(
          'Product',
          'sku',
          data.sku,
          () => this.prisma.product.findUnique({ where: { sku: data.sku } })
        )

        // Verify category exists
        const category = await this.prisma.category.findUnique({
          where: { id: data.category_id },
        })

        if (!category) {
          throw ServiceError.notFound(`Category with ID ${data.category_id} not found`)
        }

        const product = await this.prisma.product.create({
          data,
          include: {
            category: true,
            images: {
              orderBy: { sort_order: 'asc' },
            },
            variants: true,
          },
        })

        return product
      },
      { sku: data.sku, categoryId: data.category_id }
    )
  }

  async getProductById(id: string, incrementView: boolean = false) {
    return this.executeWithLogging(
      'getProductById',
      async () => {
        const product = await this.findByIdOrThrow(
          'Product',
          id,
          () => this.prisma.product.findUnique({
            where: { id },
            include: {
              category: true,
              images: {
                orderBy: { sort_order: 'asc' },
              },
              variants: true,
            },
          })
        )

        // Increment view count if requested
        if (incrementView && product.status === ProductStatus.ACTIVE) {
          await this.prisma.product.update({
            where: { id },
            data: { view_count: { increment: 1 } },
          })
          product.view_count += 1
        }

        return product
      },
      { productId: id, incrementView }
    )
  }

  async getProductBySlug(slug: string, incrementView: boolean = false) {
    return this.executeWithLogging(
      'getProductBySlug',
      async () => {
        const product = await this.prisma.product.findUnique({
          where: { slug },
          include: {
            category: true,
            images: {
              orderBy: { sort_order: 'asc' },
            },
            variants: true,
          },
        })

        if (!product) {
          throw ServiceError.notFound(`Product with slug '${slug}' not found`)
        }

        // Increment view count if requested
        if (incrementView && product.status === ProductStatus.ACTIVE) {
          await this.prisma.product.update({
            where: { slug },
            data: { view_count: { increment: 1 } },
          })
          product.view_count += 1
        }

        return product
      },
      { slug, incrementView }
    )
  }

  async getProducts(params: GetProductsInput) {
    return this.executeWithLogging(
      'getProducts',
      async () => {
        const { page, limit, category_id, status, is_featured, search, sort_by, sort_order } = params

        const where = {
          ...(category_id && { category_id }),
          ...(status && { status }),
          ...(is_featured !== undefined && { is_featured }),
          ...(search && {
            OR: [
              { name: { contains: search, mode: 'insensitive' as const } },
              { description: { contains: search, mode: 'insensitive' as const } },
              { short_description: { contains: search, mode: 'insensitive' as const } },
              { sku: { contains: search, mode: 'insensitive' as const } },
            ],
          }),
        }

        const orderBy = { [sort_by]: sort_order }

        return this.getPaginatedResults(
          page,
          limit,
          (skip, take) => this.prisma.product.findMany({
            where,
            skip,
            take,
            orderBy,
            include: {
              category: true,
              images: {
                where: { is_primary: true },
                take: 1,
              },
              _count: {
                select: {
                  variants: true,
                  order_items: true,
                },
              },
            },
          }),
          () => this.prisma.product.count({ where })
        )
      },
      { filters: params }
    )
  }

  async getFeaturedProducts(limit: number = 8) {
    return this.executeWithLogging(
      'getFeaturedProducts',
      async () => {
        return this.prisma.product.findMany({
          where: {
            is_featured: true,
            status: ProductStatus.ACTIVE,
          },
          take: limit,
          orderBy: { created_at: 'desc' },
          include: {
            category: true,
            images: {
              where: { is_primary: true },
              take: 1,
            },
          },
        })
      },
      { limit }
    )
  }

  async updateProduct(id: string, data: Omit<UpdateProductInput, 'id'>) {
    return this.executeWithLogging(
      'updateProduct',
      async () => {
        // Verify product exists
        await this.getProductById(id)

        // Check slug uniqueness if being updated
        if (data.slug) {
          const existingProduct = await this.prisma.product.findUnique({
            where: { slug: data.slug },
          })
          if (existingProduct && existingProduct.id !== id) {
            throw ServiceError.alreadyExists(
              `Product with slug '${data.slug}' already exists`
            )
          }
        }

        // Check SKU uniqueness if being updated
        if (data.sku) {
          const existingProduct = await this.prisma.product.findUnique({
            where: { sku: data.sku },
          })
          if (existingProduct && existingProduct.id !== id) {
            throw ServiceError.alreadyExists(
              `Product with SKU '${data.sku}' already exists`
            )
          }
        }

        // Verify category exists if being updated
        if (data.category_id) {
          const category = await this.prisma.category.findUnique({
            where: { id: data.category_id },
          })
          if (!category) {
            throw ServiceError.notFound(`Category with ID ${data.category_id} not found`)
          }
        }

        const updatedProduct = await this.prisma.product.update({
          where: { id },
          data,
          include: {
            category: true,
            images: {
              orderBy: { sort_order: 'asc' },
            },
            variants: true,
          },
        })

        return updatedProduct
      },
      { productId: id, updates: Object.keys(data) }
    )
  }

  async updateInventory(updates: InventoryUpdate[]) {
    return this.executeWithLogging(
      'updateInventory',
      async () => {
        return this.transaction(async (tx) => {
          const results = []

          for (const update of updates) {
            const { productId, quantity, operation, reason } = update

            // Get current product
            const product = await tx.product.findUnique({
              where: { id: productId },
            })

            if (!product) {
              throw ServiceError.notFound(`Product with ID ${productId} not found`)
            }

            if (!product.track_quantity) {
              this.logger.warn(`Attempted to update inventory for non-tracked product`, {
                productId,
                sku: product.sku,
              })
              continue
            }

            let newQuantity: number

            switch (operation) {
              case 'set':
                newQuantity = quantity
                break
              case 'increment':
                newQuantity = product.quantity + quantity
                break
              case 'decrement':
                newQuantity = product.quantity - quantity
                if (newQuantity < 0) {
                  throw ServiceError.insufficientStock(
                    `Insufficient stock for product ${product.name}. Available: ${product.quantity}, Requested: ${quantity}`
                  )
                }
                break
            }

            const updatedProduct = await tx.product.update({
              where: { id: productId },
              data: { quantity: newQuantity },
            })

            results.push({
              productId,
              previousQuantity: product.quantity,
              newQuantity,
              operation,
              reason,
            })

            this.logger.info(`Inventory updated`, {
              productId,
              sku: product.sku,
              previousQuantity: product.quantity,
              newQuantity,
              operation,
              reason,
            })
          }

          return results
        })
      },
      { updateCount: updates.length }
    )
  }

  async reserveInventory(productId: string, quantity: number) {
    return this.executeWithLogging(
      'reserveInventory',
      async () => {
        const product = await this.getProductById(productId)

        if (!product.track_quantity) {
          return { success: true, message: 'Product inventory not tracked' }
        }

        const availableQuantity = product.quantity - product.reserved_quantity

        if (availableQuantity < quantity) {
          throw ServiceError.insufficientStock(
            `Insufficient stock for product ${product.name}. Available: ${availableQuantity}, Requested: ${quantity}`
          )
        }

        await this.prisma.product.update({
          where: { id: productId },
          data: {
            reserved_quantity: { increment: quantity },
          },
        })

        return { success: true, reservedQuantity: quantity }
      },
      { productId, quantity }
    )
  }

  async releaseReservedInventory(productId: string, quantity: number) {
    return this.executeWithLogging(
      'releaseReservedInventory',
      async () => {
        const product = await this.getProductById(productId)

        if (product.reserved_quantity < quantity) {
          this.logger.warn(`Attempted to release more inventory than reserved`, {
            productId,
            reservedQuantity: product.reserved_quantity,
            releaseQuantity: quantity,
          })
        }

        await this.prisma.product.update({
          where: { id: productId },
          data: {
            reserved_quantity: { decrement: Math.min(quantity, product.reserved_quantity) },
          },
        })

        return { success: true, releasedQuantity: quantity }
      },
      { productId, quantity }
    )
  }

  async getLowStockProducts(): Promise<StockAlert[]> {
    return this.executeWithLogging(
      'getLowStockProducts',
      async () => {
        const products = await this.prisma.product.findMany({
          where: {
            track_quantity: true,
            status: ProductStatus.ACTIVE,
            OR: [
              { quantity: { lte: this.prisma.product.fields.low_stock_threshold } },
              {
                AND: [
                  { quantity: { gt: 0 } },
                  { quantity: { lt: 10 } }, // Additional safety check
                ],
              },
            ],
          },
          select: {
            id: true,
            name: true,
            sku: true,
            quantity: true,
            low_stock_threshold: true,
          },
        })

        return products
          .filter(p => p.quantity <= p.low_stock_threshold)
          .map(product => ({
            productId: product.id,
            productName: product.name,
            currentStock: product.quantity,
            threshold: product.low_stock_threshold,
          }))
      }
    )
  }

  async deleteProduct(id: string) {
    return this.executeWithLogging(
      'deleteProduct',
      async () => {
        // Verify product exists
        const product = await this.getProductById(id)

        // Check if product has orders
        const orderItemCount = await this.prisma.orderItem.count({
          where: { product_id: id },
        })

        if (orderItemCount > 0) {
          throw ServiceError.validationError(
            'Cannot delete product with existing orders. Consider archiving instead.',
            { orderItemCount }
          )
        }

        // Check if product is in carts
        const cartItemCount = await this.prisma.cartItem.count({
          where: { product_id: id },
        })

        if (cartItemCount > 0) {
          // Remove from all carts before deletion
          await this.prisma.cartItem.deleteMany({
            where: { product_id: id },
          })
        }

        await this.prisma.product.delete({
          where: { id },
        })

        return { success: true, deletedProduct: product }
      },
      { productId: id }
    )
  }

  async getProductAnalytics(id: string) {
    return this.executeWithLogging(
      'getProductAnalytics',
      async () => {
        const product = await this.getProductById(id)

        const [orderStats, recentOrders] = await Promise.all([
          this.prisma.orderItem.aggregate({
            where: { product_id: id },
            _count: { id: true },
            _sum: { quantity: true, total: true },
          }),
          this.prisma.orderItem.findMany({
            where: { product_id: id },
            take: 10,
            orderBy: { order: { created_at: 'desc' } },
            include: {
              order: {
                select: {
                  id: true,
                  order_number: true,
                  created_at: true,
                  status: true,
                },
              },
            },
          }),
        ])

        return {
          product: {
            id: product.id,
            name: product.name,
            sku: product.sku,
            status: product.status,
            viewCount: product.view_count,
            saleCount: product.sale_count,
          },
          sales: {
            totalOrders: orderStats._count.id,
            totalQuantitySold: orderStats._sum.quantity || 0,
            totalRevenue: orderStats._sum.total || 0,
          },
          inventory: {
            currentStock: product.quantity,
            reservedStock: product.reserved_quantity,
            availableStock: product.quantity - product.reserved_quantity,
            lowStockThreshold: product.low_stock_threshold,
            isLowStock: product.quantity <= product.low_stock_threshold,
          },
          recentOrders,
        }
      },
      { productId: id }
    )
  }
}
import { Product, ProductStatus, Category, Prisma } from '@prisma/client'
import { BaseService, ServiceError, PaginationParams, PaginatedResult } from './base-service'
import { generateSKU, generateSlug } from '@/lib/utils/common'

export interface CreateProductData {
  name: string
  description: string
  price: number
  category_id: string
  sku?: string
  stock_quantity: number
  weight?: number
  dimensions?: string
  meta_title?: string
  meta_description?: string
  featured?: boolean
  status?: ProductStatus
}

export interface UpdateProductData {
  name?: string
  description?: string
  price?: number
  category_id?: string
  stock_quantity?: number
  weight?: number
  dimensions?: string
  meta_title?: string
  meta_description?: string
  featured?: boolean
  status?: ProductStatus
}

export interface ProductWithCategory extends Product {
  category: Category
  _count?: {
    orderItems: number
    reviews: number
  }
}

export interface ProductFilters {
  category_id?: string
  status?: ProductStatus
  featured?: boolean
  inStock?: boolean
  priceMin?: number
  priceMax?: number
  search?: string
}

export interface BulkImportResult {
  success: number
  failed: number
  errors: string[]
}

export interface StockAlert {
  product_id: string
  product_name: string
  current_stock: number
  threshold: number
}

export class ProductService extends BaseService {
  constructor() {
    super('ProductService')
  }

  async createProduct(productData: CreateProductData): Promise<Product> {
    try {
      this.logger.info('Creating new product', { name: productData.name })

      // Generate SKU if not provided
      const sku = productData.sku || generateSKU(productData.name)

      // Check if SKU already exists
      const existingSKU = await this.db.product.findUnique({
        where: { sku }
      })

      if (existingSKU) {
        throw this.createError(
          'Product with this SKU already exists',
          'SKU_ALREADY_EXISTS',
          409
        )
      }

      // Verify category exists
      const category = await this.db.category.findUnique({
        where: { id: productData.category_id }
      })

      if (!category) {
        throw this.createError('Category not found', 'CATEGORY_NOT_FOUND', 404)
      }

      // Generate slug from name
      const slug = generateSlug(productData.name)

      const product = await this.db.product.create({
        data: {
          ...productData,
          sku,
          slug,
          status: productData.status || ProductStatus.ACTIVE,
          featured: productData.featured || false
        }
      })

      this.logger.info('Product created successfully', { productId: product.id, sku })
      return product

    } catch (error) {
      if (error instanceof ServiceError) {
        throw error
      }
      throw this.createError(
        'Failed to create product',
        'PRODUCT_CREATION_FAILED',
        500,
        error
      )
    }
  }

  async getProductById(id: string): Promise<ProductWithCategory | null> {
    try {
      const product = await this.db.product.findUnique({
        where: { id },
        include: {
          category: true,
          variants: true,
          images: true,
          _count: {
            select: {
              orderItems: true,
              reviews: true
            }
          }
        }
      })

      return product
    } catch (error) {
      throw this.createError(
        'Failed to fetch product',
        'PRODUCT_FETCH_FAILED',
        500,
        error
      )
    }
  }

  async getProductBySlug(slug: string): Promise<ProductWithCategory | null> {
    try {
      const product = await this.db.product.findUnique({
        where: { slug },
        include: {
          category: true,
          variants: true,
          images: true,
          _count: {
            select: {
              orderItems: true,
              reviews: true
            }
          }
        }
      })

      return product
    } catch (error) {
      throw this.createError(
        'Failed to fetch product by slug',
        'PRODUCT_FETCH_FAILED',
        500,
        error
      )
    }
  }

  async updateProduct(id: string, updateData: UpdateProductData): Promise<Product> {
    try {
      this.logger.info('Updating product', { productId: id })

      const existingProduct = await this.db.product.findUnique({
        where: { id }
      })

      if (!existingProduct) {
        throw this.createError('Product not found', 'PRODUCT_NOT_FOUND', 404)
      }

      // If category is being updated, verify it exists
      if (updateData.category_id) {
        const category = await this.db.category.findUnique({
          where: { id: updateData.category_id }
        })

        if (!category) {
          throw this.createError('Category not found', 'CATEGORY_NOT_FOUND', 404)
        }
      }

      // Generate new slug if name is being updated
      let slug = existingProduct.slug
      if (updateData.name && updateData.name !== existingProduct.name) {
        slug = generateSlug(updateData.name)
      }

      const updatedProduct = await this.db.product.update({
        where: { id },
        data: {
          ...updateData,
          slug,
          updated_at: new Date()
        }
      })

      this.logger.info('Product updated successfully', { productId: id })
      return updatedProduct

    } catch (error) {
      if (error instanceof ServiceError) {
        throw error
      }
      throw this.createError(
        'Failed to update product',
        'PRODUCT_UPDATE_FAILED',
        500,
        error
      )
    }
  }

  async deleteProduct(id: string): Promise<void> {
    try {
      this.logger.info('Deleting product', { productId: id })

      const product = await this.db.product.findUnique({
        where: { id }
      })

      if (!product) {
        throw this.createError('Product not found', 'PRODUCT_NOT_FOUND', 404)
      }

      // Soft delete by updating status
      await this.db.product.update({
        where: { id },
        data: {
          status: ProductStatus.INACTIVE,
          updated_at: new Date()
        }
      })

      this.logger.info('Product deleted successfully', { productId: id })

    } catch (error) {
      if (error instanceof ServiceError) {
        throw error
      }
      throw this.createError(
        'Failed to delete product',
        'PRODUCT_DELETE_FAILED',
        500,
        error
      )
    }
  }

  async getProducts(
    pagination: PaginationParams,
    filters?: ProductFilters
  ): Promise<PaginatedResult<ProductWithCategory>> {
    try {
      this.validatePagination(pagination.page, pagination.limit)

      const skip = (pagination.page - 1) * pagination.limit

      // Build where clause
      const where: Prisma.ProductWhereInput = {}

      if (filters?.category_id) {
        where.category_id = filters.category_id
      }

      if (filters?.status) {
        where.status = filters.status
      } else {
        // Default to active products only
        where.status = ProductStatus.ACTIVE
      }

      if (filters?.featured !== undefined) {
        where.featured = filters.featured
      }

      if (filters?.inStock) {
        where.stock_quantity = { gt: 0 }
      }

      if (filters?.priceMin || filters?.priceMax) {
        where.price = {}
        if (filters.priceMin) {
          where.price.gte = filters.priceMin
        }
        if (filters.priceMax) {
          where.price.lte = filters.priceMax
        }
      }

      if (filters?.search) {
        where.OR = [
          { name: { contains: filters.search, mode: 'insensitive' } },
          { description: { contains: filters.search, mode: 'insensitive' } },
          { sku: { contains: filters.search, mode: 'insensitive' } }
        ]
      }

      // Execute queries in parallel
      const [products, total] = await Promise.all([
        this.db.product.findMany({
          where,
          skip,
          take: pagination.limit,
          orderBy: { created_at: 'desc' },
          include: {
            category: true,
            _count: {
              select: {
                orderItems: true,
                reviews: true
              }
            }
          }
        }),
        this.db.product.count({ where })
      ])

      return this.createPaginatedResult(products, total, pagination.page, pagination.limit)

    } catch (error) {
      if (error instanceof ServiceError) {
        throw error
      }
      throw this.createError(
        'Failed to fetch products',
        'PRODUCTS_FETCH_FAILED',
        500,
        error
      )
    }
  }

  async updateStock(productId: string, quantity: number, operation: 'add' | 'subtract' | 'set' = 'set'): Promise<Product> {
    try {
      this.logger.info('Updating product stock', { productId, quantity, operation })

      const product = await this.db.product.findUnique({
        where: { id: productId }
      })

      if (!product) {
        throw this.createError('Product not found', 'PRODUCT_NOT_FOUND', 404)
      }

      let newQuantity: number

      switch (operation) {
        case 'add':
          newQuantity = product.stock_quantity + quantity
          break
        case 'subtract':
          newQuantity = Math.max(0, product.stock_quantity - quantity)
          break
        case 'set':
        default:
          newQuantity = Math.max(0, quantity)
          break
      }

      const updatedProduct = await this.db.product.update({
        where: { id: productId },
        data: {
          stock_quantity: newQuantity,
          updated_at: new Date()
        }
      })

      this.logger.info('Stock updated successfully', {
        productId,
        oldQuantity: product.stock_quantity,
        newQuantity
      })

      return updatedProduct

    } catch (error) {
      if (error instanceof ServiceError) {
        throw error
      }
      throw this.createError(
        'Failed to update stock',
        'STOCK_UPDATE_FAILED',
        500,
        error
      )
    }
  }

  async getFeaturedProducts(limit: number = 8): Promise<ProductWithCategory[]> {
    try {
      const products = await this.db.product.findMany({
        where: {
          featured: true,
          status: ProductStatus.ACTIVE,
          stock_quantity: { gt: 0 }
        },
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          category: true,
          _count: {
            select: {
              orderItems: true,
              reviews: true
            }
          }
        }
      })

      return products
    } catch (error) {
      throw this.createError(
        'Failed to fetch featured products',
        'FEATURED_PRODUCTS_FETCH_FAILED',
        500,
        error
      )
    }
  }

  async getNewArrivals(limit: number = 10): Promise<ProductWithCategory[]> {
    try {
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const products = await this.db.product.findMany({
        where: {
          status: ProductStatus.ACTIVE,
          stock_quantity: { gt: 0 },
          created_at: { gte: thirtyDaysAgo }
        },
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          category: true,
          _count: {
            select: {
              orderItems: true,
              reviews: true
            }
          }
        }
      })

      return products
    } catch (error) {
      throw this.createError(
        'Failed to fetch new arrivals',
        'NEW_ARRIVALS_FETCH_FAILED',
        500,
        error
      )
    }
  }

  async getTopSellingProducts(limit: number = 10): Promise<ProductWithCategory[]> {
    try {
      const products = await this.db.product.findMany({
        where: {
          status: ProductStatus.ACTIVE
        },
        take: limit,
        orderBy: {
          orderItems: {
            _count: 'desc'
          }
        },
        include: {
          category: true,
          _count: {
            select: {
              orderItems: true,
              reviews: true
            }
          }
        }
      })

      return products
    } catch (error) {
      throw this.createError(
        'Failed to fetch top selling products',
        'TOP_SELLING_FETCH_FAILED',
        500,
        error
      )
    }
  }

  async getLowStockAlerts(threshold: number = 10): Promise<StockAlert[]> {
    try {
      const products = await this.db.product.findMany({
        where: {
          status: ProductStatus.ACTIVE,
          stock_quantity: { lte: threshold }
        },
        select: {
          id: true,
          name: true,
          stock_quantity: true
        },
        orderBy: { stock_quantity: 'asc' }
      })

      return products.map(product => ({
        product_id: product.id,
        product_name: product.name,
        current_stock: product.stock_quantity,
        threshold
      }))

    } catch (error) {
      throw this.createError(
        'Failed to fetch low stock alerts',
        'LOW_STOCK_FETCH_FAILED',
        500,
        error
      )
    }
  }

  async getProductStats(): Promise<{
    total: number
    active: number
    inactive: number
    featured: number
    outOfStock: number
    lowStock: number
    averagePrice: number
    totalValue: number
  }> {
    try {
      const [
        total,
        active,
        inactive,
        featured,
        outOfStock,
        lowStock,
        priceStats
      ] = await Promise.all([
        this.db.product.count(),
        this.db.product.count({ where: { status: ProductStatus.ACTIVE } }),
        this.db.product.count({ where: { status: ProductStatus.INACTIVE } }),
        this.db.product.count({ where: { featured: true, status: ProductStatus.ACTIVE } }),
        this.db.product.count({ where: { stock_quantity: 0 } }),
        this.db.product.count({ where: { stock_quantity: { lte: 10, gt: 0 } } }),
        this.db.product.aggregate({
          where: { status: ProductStatus.ACTIVE },
          _avg: { price: true },
          _sum: {
            price: true,
            stock_quantity: true
          }
        })
      ])

      return {
        total,
        active,
        inactive,
        featured,
        outOfStock,
        lowStock,
        averagePrice: priceStats._avg.price || 0,
        totalValue: (priceStats._sum.price || 0) * (priceStats._sum.stock_quantity || 0)
      }

    } catch (error) {
      throw this.createError(
        'Failed to fetch product stats',
        'PRODUCT_STATS_FAILED',
        500,
        error
      )
    }
  }

  async toggleFeaturedStatus(id: string): Promise<Product> {
    try {
      const product = await this.db.product.findUnique({
        where: { id }
      })

      if (!product) {
        throw this.createError('Product not found', 'PRODUCT_NOT_FOUND', 404)
      }

      const updatedProduct = await this.db.product.update({
        where: { id },
        data: {
          featured: !product.featured,
          updated_at: new Date()
        }
      })

      this.logger.info('Product featured status toggled', {
        productId: id,
        featured: updatedProduct.featured
      })

      return updatedProduct

    } catch (error) {
      if (error instanceof ServiceError) {
        throw error
      }
      throw this.createError(
        'Failed to toggle featured status',
        'FEATURED_TOGGLE_FAILED',
        500,
        error
      )
    }
  }
}

// Export singleton instance
export const productService = new ProductService()
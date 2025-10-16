import { PrismaClient, OrderStatus, PaymentStatus, Currency } from '@prisma/client'
import { BaseService } from './base-service'
import { ServiceError } from '../../lib/errors/service-error'
import { ProductService } from './product-service'
import type {
  CreateOrderInput,
  UpdateOrderInput,
  GetOrdersInput
} from '../../lib/validations/order'

interface OrderCalculation {
  subtotal: number
  shippingCost: number
  tax: number
  discount: number
  total: number
}

interface OrderItem {
  productId: string
  productName: string
  productSku: string
  price: number
  quantity: number
  total: number
}

export class OrderService extends BaseService {
  private productService: ProductService

  constructor(prisma: PrismaClient, productService: ProductService) {
    super(prisma, 'OrderService')
    this.productService = productService
  }

  private generateOrderNumber(): string {
    const timestamp = Date.now().toString(36).toUpperCase()
    const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase()
    return `TR-${timestamp}-${randomStr}`
  }

  private async calculateOrderTotals(
    items: CreateOrderInput['items'],
    currency: Currency = Currency.NGN
  ): Promise<OrderCalculation> {
    let subtotal = 0

    for (const item of items) {
      subtotal += item.price * item.quantity
    }

    // TODO: Implement actual shipping calculation based on location, weight, etc.
    const shippingCost = this.calculateShippingCost(subtotal, currency)

    // TODO: Implement tax calculation based on location and product tax settings
    const tax = this.calculateTax(subtotal, currency)

    // TODO: Apply any discounts/coupons
    const discount = 0

    const total = subtotal + shippingCost + tax - discount

    return {
      subtotal,
      shippingCost,
      tax,
      discount,
      total,
    }
  }

  private calculateShippingCost(subtotal: number, currency: Currency): number {
    // Simple shipping calculation - free shipping over threshold
    const freeShippingThreshold = currency === Currency.NGN ? 50000 : 100 // NGN 50k or $100
    const standardShipping = currency === Currency.NGN ? 2000 : 10 // NGN 2k or $10

    return subtotal >= freeShippingThreshold ? 0 : standardShipping
  }

  private calculateTax(subtotal: number, currency: Currency): number {
    // Simple tax calculation - 7.5% VAT for Nigeria
    const taxRate = currency === Currency.NGN ? 0.075 : 0
    return subtotal * taxRate
  }

  async createOrder(data: CreateOrderInput) {
    return this.executeWithLogging(
      'createOrder',
      async () => {
        const { items, ...orderData } = data

        if (items.length === 0) {
          throw ServiceError.validationError('Order must contain at least one item')
        }

        return this.transaction(async (tx) => {
          // Validate products and prepare order items
          const orderItems: OrderItem[] = []
          const inventoryReservations: Array<{ productId: string; quantity: number }> = []

          for (const item of items) {
            // Get product details
            const product = await tx.product.findUnique({
              where: { id: item.product_id },
            })

            if (!product) {
              throw ServiceError.notFound(`Product with ID ${item.product_id} not found`)
            }

            if (product.status !== 'ACTIVE') {
              throw ServiceError.validationError(
                `Product ${product.name} is not available for purchase`
              )
            }

            // Check inventory
            if (product.track_quantity) {
              const availableQuantity = product.quantity - product.reserved_quantity
              if (availableQuantity < item.quantity) {
                throw ServiceError.insufficientStock(
                  `Insufficient stock for ${product.name}. Available: ${availableQuantity}, Requested: ${item.quantity}`
                )
              }
              inventoryReservations.push({
                productId: item.product_id,
                quantity: item.quantity,
              })
            }

            const itemTotal = item.price * item.quantity
            orderItems.push({
              productId: item.product_id,
              productName: product.name,
              productSku: product.sku,
              price: item.price,
              quantity: item.quantity,
              total: itemTotal,
            })
          }

          // Calculate order totals
          const calculations = await this.calculateOrderTotals(items, data.currency)

          // Reserve inventory
          for (const reservation of inventoryReservations) {
            await tx.product.update({
              where: { id: reservation.productId },
              data: {
                reserved_quantity: { increment: reservation.quantity },
              },
            })
          }

          // Create order
          const order = await tx.order.create({
            data: {
              order_number: this.generateOrderNumber(),
              ...orderData,
              ...calculations,
              items: {
                create: orderItems.map(item => ({
                  product_id: item.productId,
                  product_name: item.productName,
                  product_sku: item.productSku,
                  price: item.price,
                  quantity: item.quantity,
                  total: item.total,
                })),
              },
            },
            include: {
              items: {
                include: {
                  product: {
                    include: {
                      images: {
                        where: { is_primary: true },
                        take: 1,
                      },
                    },
                  },
                },
              },
              user: true,
              shipping_address: true,
            },
          })

          // Create initial status history
          await tx.orderStatusHistory.create({
            data: {
              order_id: order.id,
              status: order.status,
              notes: 'Order created',
            },
          })

          // Clear cart items if user is logged in
          if (data.user_id) {
            const cartProductIds = items.map(item => item.product_id)
            await tx.cartItem.deleteMany({
              where: {
                user_id: data.user_id,
                product_id: { in: cartProductIds },
              },
            })
          }

          return order
        })
      },
      { itemCount: items.length, userId: data.user_id }
    )
  }

  async getOrderById(id: string) {
    return this.executeWithLogging(
      'getOrderById',
      async () => {
        return this.findByIdOrThrow(
          'Order',
          id,
          () => this.prisma.order.findUnique({
            where: { id },
            include: {
              items: {
                include: {
                  product: {
                    include: {
                      images: {
                        where: { is_primary: true },
                        take: 1,
                      },
                    },
                  },
                },
              },
              user: true,
              shipping_address: true,
              payments: {
                orderBy: { created_at: 'desc' },
              },
              status_history: {
                orderBy: { created_at: 'desc' },
              },
            },
          })
        )
      },
      { orderId: id }
    )
  }

  async getOrderByNumber(orderNumber: string) {
    return this.executeWithLogging(
      'getOrderByNumber',
      async () => {
        const order = await this.prisma.order.findUnique({
          where: { order_number: orderNumber },
          include: {
            items: {
              include: {
                product: {
                  include: {
                    images: {
                      where: { is_primary: true },
                      take: 1,
                    },
                  },
                },
              },
            },
            user: true,
            shipping_address: true,
            payments: {
              orderBy: { created_at: 'desc' },
            },
            status_history: {
              orderBy: { created_at: 'desc' },
            },
          },
        })

        if (!order) {
          throw ServiceError.notFound(`Order with number ${orderNumber} not found`)
        }

        return order
      },
      { orderNumber }
    )
  }

  async getOrders(params: GetOrdersInput) {
    return this.executeWithLogging(
      'getOrders',
      async () => {
        const { page, limit, user_id, status, payment_status, search, date_from, date_to } = params

        const where = {
          ...(user_id && { user_id }),
          ...(status && { status }),
          ...(payment_status && { payment_status }),
          ...(search && {
            OR: [
              { order_number: { contains: search, mode: 'insensitive' as const } },
              { email: { contains: search, mode: 'insensitive' as const } },
              { first_name: { contains: search, mode: 'insensitive' as const } },
              { last_name: { contains: search, mode: 'insensitive' as const } },
            ],
          }),
          ...(date_from || date_to
            ? {
                created_at: {
                  ...(date_from && { gte: new Date(date_from) }),
                  ...(date_to && { lte: new Date(date_to) }),
                },
              }
            : {}),
        }

        return this.getPaginatedResults(
          page,
          limit,
          (skip, take) => this.prisma.order.findMany({
            where,
            skip,
            take,
            orderBy: { created_at: 'desc' },
            include: {
              user: {
                select: {
                  id: true,
                  first_name: true,
                  last_name: true,
                  email: true,
                },
              },
              _count: {
                select: {
                  items: true,
                },
              },
            },
          }),
          () => this.prisma.order.count({ where })
        )
      },
      { filters: params }
    )
  }

  async updateOrderStatus(id: string, data: Omit<UpdateOrderInput, 'id'>, updatedBy?: string) {
    return this.executeWithLogging(
      'updateOrderStatus',
      async () => {
        const order = await this.getOrderById(id)

        return this.transaction(async (tx) => {
          // Update order
          const updatedOrder = await tx.order.update({
            where: { id },
            data: {
              ...data,
              ...(data.status === OrderStatus.SHIPPED && { shipped_at: new Date() }),
              ...(data.status === OrderStatus.DELIVERED && { delivered_at: new Date() }),
              ...(data.status === OrderStatus.CANCELLED && { cancelled_at: new Date() }),
            },
            include: {
              items: true,
            },
          })

          // Create status history entry
          if (data.status && data.status !== order.status) {
            await tx.orderStatusHistory.create({
              data: {
                order_id: id,
                status: data.status,
                notes: data.notes || `Order status updated to ${data.status}`,
                created_by: updatedBy,
              },
            })

            // Handle inventory adjustments for cancelled orders
            if (data.status === OrderStatus.CANCELLED) {
              for (const item of order.items) {
                // Release reserved inventory and add back to available stock
                await tx.product.update({
                  where: { id: item.product_id },
                  data: {
                    reserved_quantity: { decrement: item.quantity },
                    quantity: { increment: item.quantity },
                  },
                })
              }
            }

            // Handle inventory adjustments for fulfilled orders
            if (data.status === OrderStatus.DELIVERED && order.status !== OrderStatus.DELIVERED) {
              for (const item of order.items) {
                // Convert reserved inventory to sold
                await tx.product.update({
                  where: { id: item.product_id },
                  data: {
                    reserved_quantity: { decrement: item.quantity },
                    sale_count: { increment: item.quantity },
                  },
                })
              }
            }
          }

          return updatedOrder
        })
      },
      { orderId: id, newStatus: data.status, updatedBy }
    )
  }

  async cancelOrder(id: string, reason?: string, cancelledBy?: string) {
    return this.executeWithLogging(
      'cancelOrder',
      async () => {
        const order = await this.getOrderById(id)

        if (order.status === OrderStatus.DELIVERED) {
          throw ServiceError.validationError('Cannot cancel a delivered order')
        }

        if (order.status === OrderStatus.CANCELLED) {
          throw ServiceError.validationError('Order is already cancelled')
        }

        return this.updateOrderStatus(
          id,
          {
            status: OrderStatus.CANCELLED,
            notes: reason || 'Order cancelled',
          },
          cancelledBy
        )
      },
      { orderId: id, reason, cancelledBy }
    )
  }

  async getOrderAnalytics(dateFrom?: Date, dateTo?: Date) {
    return this.executeWithLogging(
      'getOrderAnalytics',
      async () => {
        const where = {
          ...(dateFrom || dateTo
            ? {
                created_at: {
                  ...(dateFrom && { gte: dateFrom }),
                  ...(dateTo && { lte: dateTo }),
                },
              }
            : {}),
        }

        const [totalStats, statusBreakdown, paymentBreakdown] = await Promise.all([
          this.prisma.order.aggregate({
            where,
            _count: { id: true },
            _sum: { total: true, subtotal: true, shipping_cost: true, tax: true },
            _avg: { total: true },
          }),
          this.prisma.order.groupBy({
            by: ['status'],
            where,
            _count: { id: true },
            _sum: { total: true },
          }),
          this.prisma.order.groupBy({
            by: ['payment_status'],
            where,
            _count: { id: true },
            _sum: { total: true },
          }),
        ])

        return {
          summary: {
            totalOrders: totalStats._count.id,
            totalRevenue: totalStats._sum.total || 0,
            averageOrderValue: totalStats._avg.total || 0,
            totalShipping: totalStats._sum.shipping_cost || 0,
            totalTax: totalStats._sum.tax || 0,
          },
          breakdown: {
            byStatus: statusBreakdown,
            byPaymentStatus: paymentBreakdown,
          },
        }
      },
      { dateFrom, dateTo }
    )
  }

  async getUserOrderHistory(userId: string, page: number = 1, limit: number = 10) {
    return this.executeWithLogging(
      'getUserOrderHistory',
      async () => {
        return this.getPaginatedResults(
          page,
          limit,
          (skip, take) => this.prisma.order.findMany({
            where: { user_id: userId },
            skip,
            take,
            orderBy: { created_at: 'desc' },
            include: {
              items: {
                include: {
                  product: {
                    include: {
                      images: {
                        where: { is_primary: true },
                        take: 1,
                      },
                    },
                  },
                },
              },
            },
          }),
          () => this.prisma.order.count({ where: { user_id: userId } })
        )
      },
      { userId, page, limit }
    )
  }
}
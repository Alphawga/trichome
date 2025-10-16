import { Order, OrderStatus, OrderItem, User, Product, Prisma } from '@prisma/client'
import { BaseService, ServiceError, PaginationParams, PaginatedResult } from './base-service'
import { generateOrderNumber } from '@/lib/utils/common'
import { productService } from './product-service'

export interface CreateOrderData {
  user_id?: string // Optional for guest orders
  guest_email?: string
  guest_phone?: string
  shipping_address: {
    first_name: string
    last_name: string
    address_line_1: string
    address_line_2?: string
    city: string
    state: string
    postal_code: string
    country: string
    phone_number: string
  }
  billing_address?: {
    first_name: string
    last_name: string
    address_line_1: string
    address_line_2?: string
    city: string
    state: string
    postal_code: string
    country: string
    phone_number: string
  }
  items: {
    product_id: string
    quantity: number
    variant_id?: string
  }[]
  notes?: string
}

export interface UpdateOrderData {
  status?: OrderStatus
  tracking_number?: string
  notes?: string
  shipped_at?: Date
  delivered_at?: Date
}

export interface OrderWithDetails extends Order {
  user?: User
  orderItems: (OrderItem & {
    product: Product
  })[]
  _count?: {
    orderItems: number
  }
}

export interface OrderFilters {
  status?: OrderStatus
  user_id?: string
  startDate?: Date
  endDate?: Date
  search?: string // Search by order number, email, or customer name
}

export interface OrderSummary {
  subtotal: number
  shipping_cost: number
  tax_amount: number
  discount_amount: number
  total_amount: number
}

export interface CartItem {
  product_id: string
  variant_id?: string
  quantity: number
  price: number
}

export class OrderService extends BaseService {
  constructor() {
    super('OrderService')
  }

  async createOrder(orderData: CreateOrderData): Promise<Order> {
    try {
      this.logger.info('Creating new order', {
        userId: orderData.user_id,
        itemCount: orderData.items.length
      })

      return await this.executeWithTransaction(async (tx) => {
        // Validate and calculate order totals
        const { items, subtotal } = await this.validateOrderItems(orderData.items)

        // Calculate shipping and total
        const shipping_cost = await this.calculateShipping(orderData.shipping_address)
        const tax_amount = await this.calculateTax(subtotal, orderData.shipping_address.state)
        const total_amount = subtotal + shipping_cost + tax_amount

        // Generate order number
        const order_number = generateOrderNumber()

        // Create order
        const order = await tx.order.create({
          data: {
            order_number,
            user_id: orderData.user_id,
            guest_email: orderData.guest_email,
            guest_phone: orderData.guest_phone,
            status: OrderStatus.PENDING,
            subtotal,
            shipping_cost,
            tax_amount,
            total_amount,
            shipping_address: orderData.shipping_address,
            billing_address: orderData.billing_address || orderData.shipping_address,
            notes: orderData.notes
          }
        })

        // Create order items and update stock
        for (const item of items) {
          await tx.orderItem.create({
            data: {
              order_id: order.id,
              product_id: item.product_id,
              variant_id: item.variant_id,
              quantity: item.quantity,
              unit_price: item.price,
              total_price: item.price * item.quantity
            }
          })

          // Update product stock
          await productService.updateStock(item.product_id, item.quantity, 'subtract')
        }

        this.logger.info('Order created successfully', {
          orderId: order.id,
          orderNumber: order_number,
          totalAmount: total_amount
        })

        return order
      })

    } catch (error) {
      if (error instanceof ServiceError) {
        throw error
      }
      throw this.createError(
        'Failed to create order',
        'ORDER_CREATION_FAILED',
        500,
        error
      )
    }
  }

  async getOrderById(id: string): Promise<OrderWithDetails | null> {
    try {
      const order = await this.db.order.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true,
              phone_number: true
            }
          },
          orderItems: {
            include: {
              product: {
                include: {
                  category: true
                }
              }
            }
          },
          _count: {
            select: {
              orderItems: true
            }
          }
        }
      })

      return order
    } catch (error) {
      throw this.createError(
        'Failed to fetch order',
        'ORDER_FETCH_FAILED',
        500,
        error
      )
    }
  }

  async getOrderByNumber(orderNumber: string): Promise<OrderWithDetails | null> {
    try {
      const order = await this.db.order.findUnique({
        where: { order_number: orderNumber },
        include: {
          user: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true,
              phone_number: true
            }
          },
          orderItems: {
            include: {
              product: {
                include: {
                  category: true
                }
              }
            }
          }
        }
      })

      return order
    } catch (error) {
      throw this.createError(
        'Failed to fetch order by number',
        'ORDER_FETCH_FAILED',
        500,
        error
      )
    }
  }

  async updateOrder(id: string, updateData: UpdateOrderData): Promise<Order> {
    try {
      this.logger.info('Updating order', { orderId: id })

      const existingOrder = await this.db.order.findUnique({
        where: { id }
      })

      if (!existingOrder) {
        throw this.createError('Order not found', 'ORDER_NOT_FOUND', 404)
      }

      // Handle status-specific updates
      const updatePayload: any = {
        ...updateData,
        updated_at: new Date()
      }

      if (updateData.status === OrderStatus.SHIPPED && !updateData.shipped_at) {
        updatePayload.shipped_at = new Date()
      }

      if (updateData.status === OrderStatus.DELIVERED && !updateData.delivered_at) {
        updatePayload.delivered_at = new Date()
      }

      const updatedOrder = await this.db.order.update({
        where: { id },
        data: updatePayload
      })

      this.logger.info('Order updated successfully', {
        orderId: id,
        status: updateData.status
      })

      return updatedOrder

    } catch (error) {
      if (error instanceof ServiceError) {
        throw error
      }
      throw this.createError(
        'Failed to update order',
        'ORDER_UPDATE_FAILED',
        500,
        error
      )
    }
  }

  async cancelOrder(id: string, reason?: string): Promise<Order> {
    try {
      this.logger.info('Cancelling order', { orderId: id })

      return await this.executeWithTransaction(async (tx) => {
        const order = await tx.order.findUnique({
          where: { id },
          include: {
            orderItems: true
          }
        })

        if (!order) {
          throw this.createError('Order not found', 'ORDER_NOT_FOUND', 404)
        }

        if (order.status === OrderStatus.SHIPPED || order.status === OrderStatus.DELIVERED) {
          throw this.createError(
            'Cannot cancel shipped or delivered orders',
            'INVALID_ORDER_STATUS',
            400
          )
        }

        // Restore stock for all items
        for (const item of order.orderItems) {
          await productService.updateStock(item.product_id, item.quantity, 'add')
        }

        // Update order status
        const updatedOrder = await tx.order.update({
          where: { id },
          data: {
            status: OrderStatus.CANCELLED,
            notes: reason ? `${order.notes || ''}\nCancellation reason: ${reason}` : order.notes,
            updated_at: new Date()
          }
        })

        this.logger.info('Order cancelled successfully', { orderId: id })
        return updatedOrder
      })

    } catch (error) {
      if (error instanceof ServiceError) {
        throw error
      }
      throw this.createError(
        'Failed to cancel order',
        'ORDER_CANCELLATION_FAILED',
        500,
        error
      )
    }
  }

  async getOrders(
    pagination: PaginationParams,
    filters?: OrderFilters
  ): Promise<PaginatedResult<OrderWithDetails>> {
    try {
      this.validatePagination(pagination.page, pagination.limit)

      const skip = (pagination.page - 1) * pagination.limit

      // Build where clause
      const where: Prisma.OrderWhereInput = {}

      if (filters?.status) {
        where.status = filters.status
      }

      if (filters?.user_id) {
        where.user_id = filters.user_id
      }

      if (filters?.startDate || filters?.endDate) {
        where.created_at = {}
        if (filters.startDate) {
          where.created_at.gte = filters.startDate
        }
        if (filters.endDate) {
          where.created_at.lte = filters.endDate
        }
      }

      if (filters?.search) {
        where.OR = [
          { order_number: { contains: filters.search, mode: 'insensitive' } },
          { guest_email: { contains: filters.search, mode: 'insensitive' } },
          {
            user: {
              OR: [
                { first_name: { contains: filters.search, mode: 'insensitive' } },
                { last_name: { contains: filters.search, mode: 'insensitive' } },
                { email: { contains: filters.search, mode: 'insensitive' } }
              ]
            }
          }
        ]
      }

      // Execute queries in parallel
      const [orders, total] = await Promise.all([
        this.db.order.findMany({
          where,
          skip,
          take: pagination.limit,
          orderBy: { created_at: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                first_name: true,
                last_name: true,
                email: true,
                phone_number: true
              }
            },
            orderItems: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    sku: true
                  }
                }
              }
            },
            _count: {
              select: {
                orderItems: true
              }
            }
          }
        }),
        this.db.order.count({ where })
      ])

      return this.createPaginatedResult(orders, total, pagination.page, pagination.limit)

    } catch (error) {
      if (error instanceof ServiceError) {
        throw error
      }
      throw this.createError(
        'Failed to fetch orders',
        'ORDERS_FETCH_FAILED',
        500,
        error
      )
    }
  }

  async getUserOrders(
    userId: string,
    pagination: PaginationParams
  ): Promise<PaginatedResult<OrderWithDetails>> {
    try {
      return await this.getOrders(pagination, { user_id: userId })
    } catch (error) {
      throw this.createError(
        'Failed to fetch user orders',
        'USER_ORDERS_FETCH_FAILED',
        500,
        error
      )
    }
  }

  async getOrderStats(): Promise<{
    total: number
    pending: number
    confirmed: number
    processing: number
    shipped: number
    delivered: number
    cancelled: number
    totalRevenue: number
    averageOrderValue: number
    todaysOrders: number
    todaysRevenue: number
  }> {
    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      const [
        total,
        pending,
        confirmed,
        processing,
        shipped,
        delivered,
        cancelled,
        revenueStats,
        todaysStats
      ] = await Promise.all([
        this.db.order.count(),
        this.db.order.count({ where: { status: OrderStatus.PENDING } }),
        this.db.order.count({ where: { status: OrderStatus.CONFIRMED } }),
        this.db.order.count({ where: { status: OrderStatus.PROCESSING } }),
        this.db.order.count({ where: { status: OrderStatus.SHIPPED } }),
        this.db.order.count({ where: { status: OrderStatus.DELIVERED } }),
        this.db.order.count({ where: { status: OrderStatus.CANCELLED } }),
        this.db.order.aggregate({
          where: {
            status: {
              not: OrderStatus.CANCELLED
            }
          },
          _sum: { total_amount: true },
          _avg: { total_amount: true }
        }),
        this.db.order.aggregate({
          where: {
            created_at: {
              gte: today,
              lt: tomorrow
            },
            status: {
              not: OrderStatus.CANCELLED
            }
          },
          _count: true,
          _sum: { total_amount: true }
        })
      ])

      return {
        total,
        pending,
        confirmed,
        processing,
        shipped,
        delivered,
        cancelled,
        totalRevenue: revenueStats._sum.total_amount || 0,
        averageOrderValue: revenueStats._avg.total_amount || 0,
        todaysOrders: todaysStats._count,
        todaysRevenue: todaysStats._sum.total_amount || 0
      }

    } catch (error) {
      throw this.createError(
        'Failed to fetch order stats',
        'ORDER_STATS_FAILED',
        500,
        error
      )
    }
  }

  private async validateOrderItems(items: CreateOrderData['items']): Promise<{
    items: CartItem[]
    subtotal: number
  }> {
    const validatedItems: CartItem[] = []
    let subtotal = 0

    for (const item of items) {
      const product = await this.db.product.findUnique({
        where: { id: item.product_id }
      })

      if (!product) {
        throw this.createError(
          `Product not found: ${item.product_id}`,
          'PRODUCT_NOT_FOUND',
          404
        )
      }

      if (product.stock_quantity < item.quantity) {
        throw this.createError(
          `Insufficient stock for product: ${product.name}`,
          'INSUFFICIENT_STOCK',
          400
        )
      }

      const cartItem: CartItem = {
        product_id: item.product_id,
        variant_id: item.variant_id,
        quantity: item.quantity,
        price: product.price
      }

      validatedItems.push(cartItem)
      subtotal += cartItem.price * cartItem.quantity
    }

    return { items: validatedItems, subtotal }
  }

  private async calculateShipping(address: any): Promise<number> {
    // Simple shipping calculation - in production, this would integrate with shipping APIs
    const baseRate = 2500 // ₦25 base shipping for Nigeria

    // Free shipping for Lagos
    if (address.state.toLowerCase().includes('lagos')) {
      return 0
    }

    // Higher rates for remote areas
    const remoteStates = ['borno', 'yobe', 'adamawa', 'taraba', 'cross river']
    if (remoteStates.some(state => address.state.toLowerCase().includes(state))) {
      return baseRate * 2
    }

    return baseRate
  }

  private async calculateTax(subtotal: number, state: string): Promise<number> {
    // Nigeria VAT is 7.5%
    const vatRate = 0.075
    return subtotal * vatRate
  }
}

// Export singleton instance
export const orderService = new OrderService()
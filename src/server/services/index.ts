import { prisma } from '../../lib/prisma'
import { UserService } from './user-service'
import { ProductService } from './product-service'
import { OrderService } from './order-service'
import { NotificationService } from './notification-service'


export const userService = new UserService(prisma)
export const productService = new ProductService(prisma)
export const orderService = new OrderService(prisma, productService)
export const notificationService = new NotificationService(prisma)

// Export service classes for type purposes
export { UserService, ProductService, OrderService, NotificationService }

// Export all service types
export type Services = {
  userService: UserService
  productService: ProductService
  orderService: OrderService
  notificationService: NotificationService
}
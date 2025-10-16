import { z } from 'zod'
import { OrderStatus, PaymentStatus, PaymentMethod } from '@prisma/client'
import { Currency } from '@prisma/client'

export const createOrderSchema = z.object({
  user_id: z.string().cuid().optional(),
  email: z.string().email('Invalid email address'),
  first_name: z.string().min(1, 'First name is required').max(50),
  last_name: z.string().min(1, 'Last name is required').max(50),
  phone: z.string().optional(),
  currency: z.nativeEnum(Currency).default(Currency.NGN),
  shipping_address_id: z.string().cuid().optional(),
  notes: z.string().optional(),
  items: z.array(z.object({
    product_id: z.string().cuid(),
    quantity: z.number().int().min(1),
    price: z.number().positive(),
  })).min(1, 'At least one item is required'),
})

export const updateOrderSchema = z.object({
  id: z.string().cuid(),
  status: z.nativeEnum(OrderStatus).optional(),
  payment_status: z.nativeEnum(PaymentStatus).optional(),
  payment_method: z.nativeEnum(PaymentMethod).optional(),
  tracking_number: z.string().optional(),
  notes: z.string().optional(),
})

export const getOrderSchema = z.object({
  id: z.string().cuid(),
})

export const getOrdersSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  user_id: z.string().cuid().optional(),
  status: z.nativeEnum(OrderStatus).optional(),
  payment_status: z.nativeEnum(PaymentStatus).optional(),
  search: z.string().optional(),
  date_from: z.string().datetime().optional(),
  date_to: z.string().datetime().optional(),
})

export const getOrderByNumberSchema = z.object({
  order_number: z.string().min(1),
})

export type CreateOrderInput = z.infer<typeof createOrderSchema>
export type UpdateOrderInput = z.infer<typeof updateOrderSchema>
export type GetOrderInput = z.infer<typeof getOrderSchema>
export type GetOrdersInput = z.infer<typeof getOrdersSchema>
export type GetOrderByNumberInput = z.infer<typeof getOrderByNumberSchema>
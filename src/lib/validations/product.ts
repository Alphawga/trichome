import { z } from 'zod'
import { ProductStatus } from '@prisma/client'

export const createProductSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(255),
  slug: z.string().min(1, 'Slug is required').max(255),
  description: z.string().optional(),
  short_description: z.string().optional(),
  sku: z.string().min(1, 'SKU is required').max(100),
  barcode: z.string().optional(),
  price: z.number().positive('Price must be positive'),
  compare_price: z.number().positive().optional(),
  cost_price: z.number().positive().optional(),
  track_quantity: z.boolean().default(true),
  quantity: z.number().int().min(0).default(0),
  low_stock_threshold: z.number().int().min(0).default(10),
  weight: z.number().positive().optional(),
  is_featured: z.boolean().default(false),
  is_digital: z.boolean().default(false),
  requires_shipping: z.boolean().default(true),
  taxable: z.boolean().default(true),
  seo_title: z.string().max(255).optional(),
  seo_description: z.string().max(500).optional(),
  category_id: z.string().cuid('Invalid category ID'),
})

export const updateProductSchema = z.object({
  id: z.string().cuid(),
  name: z.string().min(1).max(255).optional(),
  slug: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  short_description: z.string().optional(),
  sku: z.string().min(1).max(100).optional(),
  barcode: z.string().optional(),
  price: z.number().positive().optional(),
  compare_price: z.number().positive().optional(),
  cost_price: z.number().positive().optional(),
  track_quantity: z.boolean().optional(),
  quantity: z.number().int().min(0).optional(),
  low_stock_threshold: z.number().int().min(0).optional(),
  weight: z.number().positive().optional(),
  status: z.nativeEnum(ProductStatus).optional(),
  is_featured: z.boolean().optional(),
  is_digital: z.boolean().optional(),
  requires_shipping: z.boolean().optional(),
  taxable: z.boolean().optional(),
  seo_title: z.string().max(255).optional(),
  seo_description: z.string().max(500).optional(),
  category_id: z.string().cuid().optional(),
})

export const getProductSchema = z.object({
  id: z.string().cuid(),
})

export const getProductsSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  category_id: z.string().cuid().optional(),
  status: z.nativeEnum(ProductStatus).optional(),
  is_featured: z.boolean().optional(),
  search: z.string().optional(),
  sort_by: z.enum(['name', 'price', 'created_at', 'view_count', 'sale_count']).default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc'),
})

export const getProductBySlugSchema = z.object({
  slug: z.string().min(1),
})

export type CreateProductInput = z.infer<typeof createProductSchema>
export type UpdateProductInput = z.infer<typeof updateProductSchema>
export type GetProductInput = z.infer<typeof getProductSchema>
export type GetProductsInput = z.infer<typeof getProductsSchema>
export type GetProductBySlugInput = z.infer<typeof getProductBySlugSchema>
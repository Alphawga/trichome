import {
  ContentStatus,
  ContentType,
  Currency,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  ProductStatus,
  UserRole,
  UserStatus,
} from "@prisma/client";
import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  phone: z.string().optional(),
});

export const updateProfileSchema = z.object({
  first_name: z.string().min(1, "First name is required").optional(),
  last_name: z.string().min(1, "Last name is required").optional(),
  phone: z.string().optional(),
  image: z.string().url("Invalid image URL").optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
});

export const getUsersSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  role: z.nativeEnum(UserRole).optional(),
  status: z.nativeEnum(UserStatus).optional(),
  search: z.string().optional(),
});

export const updateUserSchema = z.object({
  id: z.string(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  phone: z.string().optional(),
  role: z.nativeEnum(UserRole).optional(),
  status: z.nativeEnum(UserStatus).optional(),
});

export const userPermissionSchema = z.object({
  userId: z.string(),
  permission: z.string(),
});

export const getProductsSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(12),
  category_id: z.string().optional(),
  status: z.nativeEnum(ProductStatus).optional(),
  search: z.string().optional(),
  min_price: z.number().optional(),
  max_price: z.number().optional(),
  is_featured: z.boolean().optional(),
  sort_by: z
    .enum(["newest", "oldest", "price_asc", "price_desc", "popular"])
    .default("newest"),
});

export const productImageSchema = z.object({
  url: z.string().url("Invalid image URL"),
  alt_text: z.string().optional(),
  sort_order: z.number().int().optional(),
  is_primary: z.boolean().optional(),
});

export const createProductSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
  short_description: z.string().optional(),
  sku: z.string().min(1, "SKU is required"),
  barcode: z.string().optional(),
  price: z.number().positive("Price must be positive"),
  compare_price: z.number().optional(),
  cost_price: z.number().optional(),
  track_quantity: z.boolean().optional(),
  quantity: z.number().int().min(0).optional(),
  low_stock_threshold: z.number().int().min(0).optional(),
  weight: z.number().optional(),
  status: z.nativeEnum(ProductStatus).optional(),
  is_featured: z.boolean().optional(),
  is_digital: z.boolean().optional(),
  requires_shipping: z.boolean().optional(),
  taxable: z.boolean().optional(),
  seo_title: z.string().optional(),
  seo_description: z.string().optional(),
  category_id: z.string().min(1, "Category is required"),
  brand_id: z.string().optional(),
  images: z.array(productImageSchema).optional(),
});

export const updateProductSchema = z.object({
  id: z.string(),
  name: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  description: z.string().optional(),
  short_description: z.string().optional(),
  sku: z.string().min(1).optional(),
  barcode: z.string().optional(),
  price: z.number().positive().optional(),
  compare_price: z.number().positive().optional(),
  cost_price: z.number().positive().optional(),
  track_quantity: z.boolean().optional(),
  quantity: z.number().int().min(0).optional(),
  low_stock_threshold: z.number().int().min(0).optional(),
  weight: z.number().optional(),
  status: z.nativeEnum(ProductStatus).optional(),
  is_featured: z.boolean().optional(),
  is_digital: z.boolean().optional(),
  requires_shipping: z.boolean().optional(),
  taxable: z.boolean().optional(),
  seo_title: z.string().optional(),
  seo_description: z.string().optional(),
  category_id: z.string().optional(),
  brand_id: z.string().optional().nullable(),
});

export const getCategoriesSchema = z.object({
  status: z.nativeEnum(ProductStatus).optional(),
  parent_id: z.string().optional().nullable(),
});

export const createCategorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
  image: z.string().url("Invalid image URL").optional(),
  status: z.nativeEnum(ProductStatus).default("ACTIVE"),
  sort_order: z.number().int().default(0),
  parent_id: z.string().optional(),
});

export const updateCategorySchema = z.object({
  id: z.string(),
  name: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  description: z.string().optional(),
  image: z.string().url().optional(),
  status: z.nativeEnum(ProductStatus).optional(),
  sort_order: z.number().int().optional(),
  parent_id: z.string().optional().nullable(),
});

export const addToCartSchema = z.object({
  product_id: z.string(),
  quantity: z.number().int().min(1, "Quantity must be at least 1").default(1),
});

export const updateCartItemSchema = z.object({
  id: z.string(),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
});

export const addToWishlistSchema = z.object({
  product_id: z.string(),
});

export const getOrdersSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  status: z.nativeEnum(OrderStatus).optional(),
  payment_status: z.nativeEnum(PaymentStatus).optional(),
  search: z.string().optional(),
});

export const createOrderItemSchema = z.object({
  product_id: z.string(),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
});

export const createOrderSchema = z.object({
  email: z.string().email("Invalid email address"),
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  phone: z.string().optional(),
  payment_method: z.nativeEnum(PaymentMethod),
  currency: z.nativeEnum(Currency).default("NGN"),
  shipping_address_id: z.string(),
  notes: z.string().optional(),
  items: z.array(createOrderItemSchema).min(1, "At least one item is required"),
});

export const updateOrderStatusSchema = z.object({
  id: z.string(),
  status: z.nativeEnum(OrderStatus),
  notes: z.string().optional(),
});

export const cancelOrderSchema = z.object({
  id: z.string(),
  reason: z.string().optional(),
});

export const createAddressSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  company: z.string().optional(),
  address_1: z.string().min(1, "Address is required"),
  address_2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().optional(), // Made optional to match AddressForm
  postal_code: z.string().optional(), // Made optional to match AddressForm
  country: z.string().default("Nigeria"),
  phone: z.string().optional(),
  is_default: z.boolean().default(false),
});

export const updateAddressSchema = z.object({
  id: z.string(),
  first_name: z.string().min(1).optional(),
  last_name: z.string().min(1).optional(),
  company: z.string().optional(),
  address_1: z.string().min(1).optional(),
  address_2: z.string().optional(),
  city: z.string().min(1).optional(),
  state: z.string().optional(), // Made optional to match AddressForm
  postal_code: z.string().optional(), // Made optional to match AddressForm
  country: z.string().optional(),
  phone: z.string().optional(),
  is_default: z.boolean().optional(),
});

export const subscribeNewsletterSchema = z.object({
  email: z.string().email("Invalid email address"),
  source: z.string().optional().default("website"),
});

export const getSubscribersSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(50),
  search: z.string().optional(),
});

export const createContentSchema = z.object({
  type: z.nativeEnum(ContentType),
  title: z.string().min(1, "Title is required"),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  content: z.string().optional(),
  button_text: z.string().optional(),
  button_link: z.string().url("Invalid URL").optional(),
  image_url: z.string().url("Invalid image URL").optional(),
  video_url: z.string().url("Invalid video URL").optional(),
  metadata: z.any().optional(),
  status: z.nativeEnum(ContentStatus).default("DRAFT"),
  sort_order: z.number().int().default(0),
  published_at: z.date().optional(),
  expires_at: z.date().optional(),
});

export const updateContentSchema = z.object({
  id: z.string(),
  type: z.nativeEnum(ContentType).optional(),
  title: z.string().min(1).optional(),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  content: z.string().optional(),
  button_text: z.string().optional(),
  button_link: z.string().url().optional(),
  image_url: z.string().url().optional(),
  video_url: z.string().url().optional(),
  metadata: z.any().optional(),
  status: z.nativeEnum(ContentStatus).optional(),
  sort_order: z.number().int().optional(),
  published_at: z.date().optional(),
  expires_at: z.date().optional(),
});

export const getContentSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  type: z.nativeEnum(ContentType).optional(),
  status: z.nativeEnum(ContentStatus).optional(),
});

export const getAnalyticsSchema = z.object({
  startDate: z.date(),
  endDate: z.date(),
});

export const recordAnalyticsSchema = z.object({
  date: z.date(),
  visitors: z.number().int().default(0),
  page_views: z.number().int().default(0),
  orders: z.number().int().default(0),
  revenue: z.number().default(0),
  conversion_rate: z.number().default(0),
  bounce_rate: z.number().default(0),
});

export const idSchema = z.object({
  id: z.string(),
});

export const slugSchema = z.object({
  slug: z.string(),
});

export const paginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
});

// ============================================
// TYPE EXPORTS (for frontend usage)
// ============================================

export type RegisterInput = z.infer<typeof registerSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

export type GetUsersInput = z.infer<typeof getUsersSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UserPermissionInput = z.infer<typeof userPermissionSchema>;

export type GetProductsInput = z.infer<typeof getProductsSchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;

export type GetCategoriesInput = z.infer<typeof getCategoriesSchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;

export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;

export type AddToWishlistInput = z.infer<typeof addToWishlistSchema>;

export type GetOrdersInput = z.infer<typeof getOrdersSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type CancelOrderInput = z.infer<typeof cancelOrderSchema>;

export type CreateAddressInput = z.infer<typeof createAddressSchema>;
export type UpdateAddressInput = z.infer<typeof updateAddressSchema>;

export type SubscribeNewsletterInput = z.infer<
  typeof subscribeNewsletterSchema
>;
export type GetSubscribersInput = z.infer<typeof getSubscribersSchema>;

export type CreateContentInput = z.infer<typeof createContentSchema>;
export type UpdateContentInput = z.infer<typeof updateContentSchema>;
export type GetContentInput = z.infer<typeof getContentSchema>;

export type GetAnalyticsInput = z.infer<typeof getAnalyticsSchema>;
export type RecordAnalyticsInput = z.infer<typeof recordAnalyticsSchema>;

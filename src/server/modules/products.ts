import { ProductStatus } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { publicProcedure, staffProcedure } from "../trpc";

export const getProducts = publicProcedure
  .input(
    z.object({
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(100).default(12),
      category_id: z.string().optional(),
      category_slug: z.string().optional(),
      status: z.nativeEnum(ProductStatus).optional(),
      search: z.string().optional(),
      min_price: z.number().optional(),
      max_price: z.number().optional(),
      is_featured: z.boolean().optional(),
      sort_by: z
        .enum([
          "newest",
          "oldest",
          "price_asc",
          "price_desc",
          "popular",
          "featured",
        ])
        .default("newest"),
    }),
  )
  .query(async ({ input, ctx }) => {
    const {
      page,
      limit,
      category_id,
      category_slug,
      status,
      search,
      min_price,
      max_price,
      is_featured,
      sort_by,
    } = input;
    const skip = (page - 1) * limit;

    // Resolve category_id from slug if provided
    let resolvedCategoryId = category_id;
    if (category_slug && !category_id) {
      const category = await ctx.prisma.category.findUnique({
        where: { slug: category_slug },
        select: { id: true },
      });
      if (category) {
        resolvedCategoryId = category.id;
      }
    }

    const where = {
      ...(status && { status }),
      ...(resolvedCategoryId && { category_id: resolvedCategoryId }),
      ...(is_featured !== undefined && { is_featured }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { description: { contains: search, mode: "insensitive" as const } },
          { sku: { contains: search, mode: "insensitive" as const } },
        ],
      }),
      ...(min_price !== undefined || max_price !== undefined
        ? {
            price: {
              ...(min_price !== undefined && { gte: min_price }),
              ...(max_price !== undefined && { lte: max_price }),
            },
          }
        : {}),
    };

    const orderBy = (() => {
      switch (sort_by) {
        case "newest":
          return { created_at: "desc" as const };
        case "oldest":
          return { created_at: "asc" as const };
        case "price_asc":
          return { price: "asc" as const };
        case "price_desc":
          return { price: "desc" as const };
        case "popular":
          return { sale_count: "desc" as const };
        case "featured":
          return [
            { is_featured: "desc" as const },
            { created_at: "desc" as const },
          ];
        default:
          return { created_at: "desc" as const };
      }
    })();

    const [products, total] = await Promise.all([
      ctx.prisma.product.findMany({
        where,
        skip,
        take: limit,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          images: {
            orderBy: { sort_order: "asc" },
            // Primary images will be handled by filtering in the application
          },
        },
        orderBy,
      }),
      ctx.prisma.product.count({ where }),
    ]);

    return {
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  });

export const getProductBySlug = publicProcedure
  .input(z.object({ slug: z.string() }))
  .query(async ({ input, ctx }) => {
    const product = await ctx.prisma.product.findUnique({
      where: { slug: input.slug },
      include: {
        category: true,
        images: {
          orderBy: { sort_order: "asc" },
        },
        variants: true,
      },
    });

    if (!product) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Product not found" });
    }

    await ctx.prisma.product.update({
      where: { id: product.id },
      data: { view_count: { increment: 1 } },
    });

    return product;
  });

// Get product by ID (staff)
export const getProductById = publicProcedure
  .input(z.object({ id: z.string() }))
  .query(async ({ input, ctx }) => {
    const product = await ctx.prisma.product.findUnique({
      where: { id: input.id },
      include: {
        category: true,
        images: {
          orderBy: { sort_order: "asc" },
        },
        variants: true,
      },
    });

    if (!product) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Product not found" });
    }

    return product;
  });

// Get products by IDs (public - for cart)
export const getProductsByIds = publicProcedure
  .input(z.object({ ids: z.array(z.string()) }))
  .query(async ({ input, ctx }) => {
    if (input.ids.length === 0) return [];

    const products = await ctx.prisma.product.findMany({
      where: {
        id: { in: input.ids },
        status: "ACTIVE",
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        images: {
          where: { is_primary: true },
          take: 1,
          orderBy: { sort_order: "asc" },
        },
      },
    });

    // Return products in the same order as requested IDs
    return input.ids
      .map((id) => products.find((p) => p.id === id))
      .filter(Boolean) as typeof products;
  });

// Create product (staff)
export const createProduct = staffProcedure
  .input(
    z.object({
      name: z.string().min(1),
      slug: z.string().min(1),
      description: z.string().optional(),
      short_description: z.string().optional(),
      sku: z.string().min(1),
      barcode: z.string().optional(),
      price: z.number().positive(),
      compare_price: z.number().positive().optional(),
      // cost_price: z.number().positive().optional(),
      track_quantity: z.boolean().default(true),
      quantity: z.number().int().min(0).default(0),
      low_stock_threshold: z.number().int().min(0).default(10),
      weight: z.number().optional(),
      status: z.nativeEnum(ProductStatus).default("DRAFT"),
      is_featured: z.boolean().default(false),
      is_digital: z.boolean().default(false),
      requires_shipping: z.boolean().default(true),
      taxable: z.boolean().default(true),
      seo_title: z.string().optional(),
      seo_description: z.string().optional(),
      category_id: z.string(),
      images: z
        .array(
          z.object({
            url: z.string(),
            alt_text: z.string().optional(),
            sort_order: z.number().int().default(0),
            is_primary: z.boolean().default(false),
          }),
        )
        .optional(),
    }),
  )
  .mutation(async ({ input, ctx }) => {
    const { images, ...productData } = input;

    const product = await ctx.prisma.product.create({
      data: {
        ...productData,
        images: images
          ? {
              create: images,
            }
          : undefined,
      },
      include: {
        images: true,
        category: true,
      },
    });

    return { product, message: "Product created successfully" };
  });

// Update product (staff)
export const updateProduct = staffProcedure
  .input(
    z.object({
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
    }),
  )
  .mutation(async ({ input, ctx }) => {
    const { id, ...data } = input;

    const product = await ctx.prisma.product.update({
      where: { id },
      data,
      include: {
        images: true,
        category: true,
      },
    });

    return { product, message: "Product updated successfully" };
  });

// Delete product (staff)
export const deleteProduct = staffProcedure
  .input(z.object({ id: z.string() }))
  .mutation(async ({ input, ctx }) => {
    await ctx.prisma.product.delete({
      where: { id: input.id },
    });

    return { message: "Product deleted successfully" };
  });

// Get featured products
export const getFeaturedProducts = publicProcedure
  .input(z.object({ limit: z.number().min(1).max(20).default(8) }))
  .query(async ({ input, ctx }) => {
    const products = await ctx.prisma.product.findMany({
      where: {
        is_featured: true,
        status: "ACTIVE",
      },
      take: input.limit,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        images: {
          orderBy: { sort_order: "asc" },
          take: 1,
        },
      },
      orderBy: { created_at: "desc" },
    });

    return products;
  });

// Get related products
export const getRelatedProducts = publicProcedure
  .input(
    z.object({
      productId: z.string(),
      limit: z.number().min(1).max(20).default(4),
    }),
  )
  .query(async ({ input, ctx }) => {
    const product = await ctx.prisma.product.findUnique({
      where: { id: input.productId },
      select: { category_id: true },
    });

    if (!product) {
      return [];
    }

    const products = await ctx.prisma.product.findMany({
      where: {
        category_id: product.category_id,
        status: "ACTIVE",
        id: { not: input.productId },
      },
      take: input.limit,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        images: {
          orderBy: { sort_order: "asc" },
          take: 1,
        },
      },
      orderBy: { sale_count: "desc" },
    });

    return products;
  });

// Get product statistics (staff)
export const getProductStats = staffProcedure.query(async ({ ctx }) => {
  // Total products
  const totalProducts = await ctx.prisma.product.count();

  // Active products
  const activeProducts = await ctx.prisma.product.count({
    where: { status: "ACTIVE" },
  });

  // Out of stock products
  const outOfStockProducts = await ctx.prisma.product.count({
    where: {
      status: "ACTIVE",
      quantity: { lte: 0 },
    },
  });

  // Featured products
  const featuredProducts = await ctx.prisma.product.count({
    where: {
      status: "ACTIVE",
      is_featured: true,
    },
  });

  // Low stock products (quantity > 0 and quantity <= low_stock_threshold)
  // Note: Prisma doesn't support comparing fields directly, so we fetch and filter
  const allActiveProducts = await ctx.prisma.product.findMany({
    where: {
      status: "ACTIVE",
      quantity: { gt: 0 },
    },
    select: {
      quantity: true,
      low_stock_threshold: true,
    },
  });

  const lowStockProducts = allActiveProducts.filter(
    (p) => p.quantity <= p.low_stock_threshold,
  ).length;

  return {
    totalProducts,
    activeProducts,
    outOfStockProducts,
    featuredProducts,
    lowStockProducts,
  };
});

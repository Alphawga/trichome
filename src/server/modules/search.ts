import { z } from "zod";
import { publicProcedure } from "../trpc";

// Search products with autocomplete suggestions
export const searchProducts = publicProcedure
  .input(
    z.object({
      query: z.string(),
      limit: z.number().min(1).max(20).default(5),
      category_id: z.string().optional(),
    }),
  )
  .query(async ({ input, ctx }) => {
    const { query, limit, category_id } = input;

    if (!query.trim()) {
      return [];
    }

    const products = await ctx.prisma.product.findMany({
      where: {
        status: "ACTIVE",
        ...(category_id && { category_id }),
        OR: [
          { name: { contains: query, mode: "insensitive" as const } },
          { description: { contains: query, mode: "insensitive" as const } },
          { sku: { contains: query, mode: "insensitive" as const } },
          {
            short_description: {
              contains: query,
              mode: "insensitive" as const,
            },
          },
        ],
      },
      take: limit,
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        images: {
          where: { is_primary: true },
          take: 1,
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: [
        { sale_count: "desc" },
        { view_count: "desc" },
        { created_at: "desc" },
      ],
    });

    return products.map((product) => ({
      id: product.id,
      name: product.name,
      title: product.name, // For compatibility
      slug: product.slug,
      price: product.price,
      image: product.images[0]?.url,
      category: product.category,
    }));
  });

// Get popular searches
export const getPopularSearches = publicProcedure
  .input(
    z.object({
      limit: z.number().min(1).max(20).default(5),
    }),
  )
  .query(async ({ input, ctx }) => {
    const { limit } = input;

    // Get most viewed products as popular searches
    const products = await ctx.prisma.product.findMany({
      where: {
        status: "ACTIVE",
      },
      take: limit,
      select: {
        id: true,
        name: true,
        slug: true,
        view_count: true,
      },
      orderBy: [{ view_count: "desc" }, { sale_count: "desc" }],
    });

    return products.map((product) => ({
      id: product.id,
      name: product.name,
      title: product.name, // For compatibility
      slug: product.slug,
    }));
  });

import { ProductStatus } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { publicProcedure, staffProcedure } from "../trpc";

// Get all brands (public) - with optional pagination
export const getBrands = publicProcedure
  .input(
    z.object({
      status: z.nativeEnum(ProductStatus).optional(),
      search: z.string().optional(),
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(100).default(10),
    }),
  )
  .query(async ({ input, ctx }) => {
    const { page, limit, status, search } = input;
    const skip = (page - 1) * limit;

    const where = {
      ...(status && { status }),
      ...(search && {
        name: { contains: search, mode: "insensitive" as const },
      }),
    };

    const [brands, total] = await Promise.all([
      ctx.prisma.brand.findMany({
        where,
        skip,
        take: limit,
        include: {
          _count: {
            select: { products: true },
          },
        },
        orderBy: { sort_order: "asc" },
      }),
      ctx.prisma.brand.count({ where }),
    ]);

    return {
      brands,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  });

// Get brand by ID (public)
export const getBrandById = publicProcedure
  .input(z.object({ id: z.string() }))
  .query(async ({ input, ctx }) => {
    const brand = await ctx.prisma.brand.findUnique({
      where: { id: input.id },
      include: {
        _count: {
          select: { products: true },
        },
        products: {
          take: 5,
          select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            images: {
              take: 1,
              select: { url: true },
            },
          },
          orderBy: { created_at: "desc" },
        },
      },
    });

    if (!brand) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Brand not found" });
    }

    return brand;
  });

// Get brand by slug (public)
export const getBrandBySlug = publicProcedure
  .input(z.object({ slug: z.string() }))
  .query(async ({ input, ctx }) => {
    const brand = await ctx.prisma.brand.findUnique({
      where: { slug: input.slug },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!brand) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Brand not found" });
    }

    return brand;
  });

// Get brand statistics (staff)
export const getBrandStats = staffProcedure.query(async ({ ctx }) => {
  const [totalBrands, activeBrands, inactiveBrands] = await Promise.all([
    ctx.prisma.brand.count(),
    ctx.prisma.brand.count({ where: { status: "ACTIVE" } }),
    ctx.prisma.brand.count({ where: { status: "INACTIVE" } }),
  ]);

  return {
    totalBrands,
    activeBrands,
    inactiveBrands,
  };
});

// Create brand (staff)
export const createBrand = staffProcedure
  .input(
    z.object({
      name: z.string().min(1, "Brand name is required"),
      slug: z.string().min(1, "Slug is required"),
      description: z.string().optional(),
      logo: z.string().optional(),
      image: z.string().optional(),
      status: z.nativeEnum(ProductStatus).default("ACTIVE"),
      sort_order: z.number().int().default(0),
    }),
  )
  .mutation(async ({ input, ctx }) => {
    // Check if brand with same name or slug exists
    const existingBrand = await ctx.prisma.brand.findFirst({
      where: {
        OR: [{ name: input.name }, { slug: input.slug }],
      },
    });

    if (existingBrand) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "Brand with this name or slug already exists",
      });
    }

    const brand = await ctx.prisma.brand.create({
      data: input,
    });

    return { brand, message: "Brand created successfully" };
  });

// Update brand (staff)
export const updateBrand = staffProcedure
  .input(
    z.object({
      id: z.string(),
      name: z.string().min(1).optional(),
      slug: z.string().min(1).optional(),
      description: z.string().optional().nullable(),
      logo: z.string().optional().nullable(),
      image: z.string().optional().nullable(),
      status: z.nativeEnum(ProductStatus).optional(),
      sort_order: z.number().int().optional(),
    }),
  )
  .mutation(async ({ input, ctx }) => {
    const { id, ...data } = input;

    const brand = await ctx.prisma.brand.findUnique({
      where: { id },
    });

    if (!brand) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Brand not found" });
    }

    // Check if name or slug conflicts with another brand
    if (data.name || data.slug) {
      const conflictingBrand = await ctx.prisma.brand.findFirst({
        where: {
          AND: [
            { id: { not: id } },
            {
              OR: [
                ...(data.name ? [{ name: data.name }] : []),
                ...(data.slug ? [{ slug: data.slug }] : []),
              ],
            },
          ],
        },
      });

      if (conflictingBrand) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Brand with this name or slug already exists",
        });
      }
    }

    const updatedBrand = await ctx.prisma.brand.update({
      where: { id },
      data,
    });

    return { brand: updatedBrand, message: "Brand updated successfully" };
  });

// Delete brand (staff)
export const deleteBrand = staffProcedure
  .input(z.object({ id: z.string() }))
  .mutation(async ({ input, ctx }) => {
    const brand = await ctx.prisma.brand.findUnique({
      where: { id: input.id },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!brand) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Brand not found" });
    }

    if (brand._count.products > 0) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: `Cannot delete brand with ${brand._count.products} associated products`,
      });
    }

    await ctx.prisma.brand.delete({
      where: { id: input.id },
    });

    return { message: "Brand deleted successfully" };
  });

// Bulk delete brands (staff)
export const bulkDeleteBrands = staffProcedure
  .input(z.object({ ids: z.array(z.string()).min(1) }))
  .mutation(async ({ input, ctx }) => {
    const { ids } = input;

    // Check if any brands have products
    const brandsWithProducts = await ctx.prisma.brand.findMany({
      where: {
        id: { in: ids },
        products: { some: {} },
      },
      select: { id: true, name: true },
    });

    if (brandsWithProducts.length > 0) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: `Cannot delete brands with associated products: ${brandsWithProducts.map((b) => b.name).join(", ")}`,
      });
    }

    const result = await ctx.prisma.brand.deleteMany({
      where: { id: { in: ids } },
    });

    return {
      count: result.count,
      message: `Successfully deleted ${result.count} brand(s)`,
    };
  });

// Bulk update brand status (staff)
export const bulkUpdateBrandStatus = staffProcedure
  .input(
    z.object({
      ids: z.array(z.string()).min(1),
      status: z.nativeEnum(ProductStatus),
    }),
  )
  .mutation(async ({ input, ctx }) => {
    const { ids, status } = input;

    const result = await ctx.prisma.brand.updateMany({
      where: { id: { in: ids } },
      data: { status },
    });

    return {
      count: result.count,
      message: `Successfully updated ${result.count} brand(s) to ${status}`,
    };
  });

// Get or create brand by name (staff)
// Used for inline brand creation in product form
export const getOrCreateBrand = staffProcedure
  .input(
    z.object({
      name: z.string().min(1, "Brand name is required"),
    }),
  )
  .mutation(async ({ input, ctx }) => {
    const { name } = input;

    // Check if brand with this name exists (case-insensitive)
    const existingBrand = await ctx.prisma.brand.findFirst({
      where: {
        name: { equals: name, mode: "insensitive" },
      },
    });

    if (existingBrand) {
      return { brand: existingBrand, created: false };
    }

    // Create new brand with auto-generated slug
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    // Ensure slug is unique by appending a number if needed
    let finalSlug = slug;
    let counter = 1;
    while (await ctx.prisma.brand.findUnique({ where: { slug: finalSlug } })) {
      finalSlug = `${slug}-${counter}`;
      counter++;
    }

    const newBrand = await ctx.prisma.brand.create({
      data: {
        name,
        slug: finalSlug,
        status: "ACTIVE",
      },
    });

    return { brand: newBrand, created: true };
  });

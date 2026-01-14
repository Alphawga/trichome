import { ProductStatus } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { publicProcedure, staffProcedure } from "../trpc";

// Get all categories (public)
export const getCategories = publicProcedure
  .input(
    z.object({
      status: z.nativeEnum(ProductStatus).optional(),
      parent_id: z.string().optional().nullable(),
    }),
  )
  .query(async ({ input, ctx }) => {
    const categories = await ctx.prisma.category.findMany({
      where: {
        ...(input.status && { status: input.status }),
        ...(input.parent_id !== undefined && { parent_id: input.parent_id }),
      },
      include: {
        parent: true,
        children: {
          where: { status: "ACTIVE" },
          orderBy: { sort_order: "asc" },
        },
        _count: {
          select: { products: true },
        },
      },
      orderBy: { sort_order: "asc" },
    });

    return categories;
  });

// Get category by ID
export const getCategoryById = publicProcedure
  .input(z.object({ id: z.string() }))
  .query(async ({ input, ctx }) => {
    const category = await ctx.prisma.category.findUnique({
      where: { id: input.id },
      include: {
        parent: true,
        children: {
          where: { status: "ACTIVE" },
          orderBy: { sort_order: "asc" },
        },
        _count: {
          select: { products: true },
        },
      },
    });

    if (!category) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Category not found" });
    }

    return category;
  });

// Get category by slug
export const getCategoryBySlug = publicProcedure
  .input(z.object({ slug: z.string() }))
  .query(async ({ input, ctx }) => {
    const category = await ctx.prisma.category.findUnique({
      where: { slug: input.slug },
      include: {
        parent: true,
        children: {
          where: { status: "ACTIVE" },
          orderBy: { sort_order: "asc" },
        },
        _count: {
          select: { products: true },
        },
      },
    });

    if (!category) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Category not found" });
    }

    return category;
  });

// Get category tree (hierarchical structure)
export const getCategoryTree = publicProcedure.query(async ({ ctx }) => {
  const categories = await ctx.prisma.category.findMany({
    where: {
      status: "ACTIVE",
      parent_id: null,
    },
    include: {
      children: {
        where: { status: "ACTIVE" },
        orderBy: { sort_order: "asc" },
        include: {
          children: {
            where: { status: "ACTIVE" },
            orderBy: { sort_order: "asc" },
          },
        },
      },
      _count: {
        select: { products: true },
      },
    },
    orderBy: { sort_order: "asc" },
  });

  return categories;
});

// Create category (staff)
export const createCategory = staffProcedure
  .input(
    z.object({
      name: z.string().min(1),
      slug: z.string().min(1),
      description: z.string().optional(),
      image: z.string().optional(),
      status: z.nativeEnum(ProductStatus).default("ACTIVE"),
      sort_order: z.number().int().default(0),
      parent_id: z.string().optional(),
    }),
  )
  .mutation(async ({ input, ctx }) => {
    const category = await ctx.prisma.category.create({
      data: input,
      include: {
        parent: true,
        children: true,
      },
    });

    return { category, message: "Category created successfully" };
  });

// Update category (staff)
export const updateCategory = staffProcedure
  .input(
    z.object({
      id: z.string(),
      name: z.string().min(1).optional(),
      slug: z.string().min(1).optional(),
      description: z.string().optional(),
      image: z.string().optional(),
      status: z.nativeEnum(ProductStatus).optional(),
      sort_order: z.number().int().optional(),
      parent_id: z.string().optional().nullable(),
    }),
  )
  .mutation(async ({ input, ctx }) => {
    const { id, ...data } = input;

    const category = await ctx.prisma.category.update({
      where: { id },
      data,
      include: {
        parent: true,
        children: true,
      },
    });

    return { category, message: "Category updated successfully" };
  });

// Delete category (staff)
export const deleteCategory = staffProcedure
  .input(z.object({ id: z.string() }))
  .mutation(async ({ input, ctx }) => {
    // Check if category has products
    const productCount = await ctx.prisma.product.count({
      where: { category_id: input.id },
    });

    if (productCount > 0) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Cannot delete category with products",
      });
    }

    await ctx.prisma.category.delete({
      where: { id: input.id },
    });

    return { message: "Category deleted successfully" };
  });

// Get or create category by name (staff)
// Used for inline category creation in product form
export const getOrCreateCategory = staffProcedure
  .input(
    z.object({
      name: z.string().min(1, "Category name is required"),
    }),
  )
  .mutation(async ({ input, ctx }) => {
    const { name } = input;

    // Check if category with this name exists (case-insensitive)
    const existingCategory = await ctx.prisma.category.findFirst({
      where: {
        name: { equals: name, mode: "insensitive" },
      },
    });

    if (existingCategory) {
      return { category: existingCategory, created: false };
    }

    // Create new category with auto-generated slug
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    // Ensure slug is unique by appending a number if needed
    let finalSlug = slug;
    let counter = 1;
    while (await ctx.prisma.category.findUnique({ where: { slug: finalSlug } })) {
      finalSlug = `${slug}-${counter}`;
      counter++;
    }

    const newCategory = await ctx.prisma.category.create({
      data: {
        name,
        slug: finalSlug,
        status: "ACTIVE",
      },
    });

    return { category: newCategory, created: true };
  });

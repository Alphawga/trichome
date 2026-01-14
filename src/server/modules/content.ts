import { ContentStatus } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { publicProcedure, staffProcedure } from "../trpc";

// Get published content by type (public) - now accepts string types
export const getContentByType = publicProcedure
  .input(z.object({ type: z.string() }))
  .query(async ({ input, ctx }) => {
    const now = new Date();

    const content = await ctx.prisma.content.findMany({
      where: {
        type: input.type,
        status: "PUBLISHED",
        AND: [
          {
            OR: [{ published_at: { lte: now } }, { published_at: null }],
          },
          {
            OR: [{ expires_at: { gte: now } }, { expires_at: null }],
          },
        ],
      },
      orderBy: { sort_order: "asc" },
    });

    return content;
  });

// Get content by multiple types (for loading page sections)
export const getContentByTypes = publicProcedure
  .input(z.object({ types: z.array(z.string()) }))
  .query(async ({ input, ctx }) => {
    const now = new Date();

    const content = await ctx.prisma.content.findMany({
      where: {
        type: { in: input.types },
        status: "PUBLISHED",
        AND: [
          {
            OR: [{ published_at: { lte: now } }, { published_at: null }],
          },
          {
            OR: [{ expires_at: { gte: now } }, { expires_at: null }],
          },
        ],
      },
      orderBy: { sort_order: "asc" },
    });

    // Return as a map for easy access
    const contentMap: Record<string, typeof content[0]> = {};
    for (const item of content) {
      contentMap[item.type] = item;
    }

    return contentMap;
  });

// Get all content for a page (admin) - returns all sections for editing
export const getPageContent = staffProcedure
  .input(z.object({ types: z.array(z.string()) }))
  .query(async ({ input, ctx }) => {
    const content = await ctx.prisma.content.findMany({
      where: {
        type: { in: input.types },
      },
      orderBy: { sort_order: "asc" },
    });

    // Return as a map for easy access
    const contentMap: Record<string, typeof content[0]> = {};
    for (const item of content) {
      contentMap[item.type] = item;
    }

    return contentMap;
  });

// Get all content (staff)
export const getAllContent = staffProcedure
  .input(
    z.object({
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(100).default(20),
      type: z.string().optional(),
      status: z.nativeEnum(ContentStatus).optional(),
    }),
  )
  .query(async ({ input, ctx }) => {
    const { page, limit, type, status } = input;
    const skip = (page - 1) * limit;

    const where = {
      ...(type && { type }),
      ...(status && { status }),
    };

    const [items, total] = await Promise.all([
      ctx.prisma.content.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ sort_order: "asc" }, { created_at: "desc" }],
      }),
      ctx.prisma.content.count({ where }),
    ]);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  });

// Get content by ID (staff)
export const getContentById = staffProcedure
  .input(z.object({ id: z.string() }))
  .query(async ({ input, ctx }) => {
    const content = await ctx.prisma.content.findUnique({
      where: { id: input.id },
    });

    if (!content) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Content not found" });
    }

    return content;
  });

// Create content (staff)
export const createContent = staffProcedure
  .input(
    z.object({
      type: z.string(),
      title: z.string().min(1),
      subtitle: z.string().optional(),
      description: z.string().optional(),
      content: z.string().optional(),
      button_text: z.string().optional(),
      button_link: z.string().optional(),
      image_url: z.string().optional(),
      video_url: z.string().optional(),
      metadata: z.any().optional(),
      status: z.nativeEnum(ContentStatus).default("DRAFT"),
      sort_order: z.number().int().default(0),
      published_at: z.date().optional(),
      expires_at: z.date().optional(),
    }),
  )
  .mutation(async ({ input, ctx }) => {
    const content = await ctx.prisma.content.create({
      data: input,
    });

    return { content, message: "Content created successfully" };
  });

// Update content (staff)
export const updateContent = staffProcedure
  .input(
    z.object({
      id: z.string(),
      type: z.string().optional(),
      title: z.string().min(1).optional(),
      subtitle: z.string().optional(),
      description: z.string().optional(),
      content: z.string().optional(),
      button_text: z.string().optional(),
      button_link: z.string().optional(),
      image_url: z.string().optional(),
      video_url: z.string().optional(),
      metadata: z.any().optional(),
      status: z.nativeEnum(ContentStatus).optional(),
      sort_order: z.number().int().optional(),
      published_at: z.date().optional(),
      expires_at: z.date().optional(),
    }),
  )
  .mutation(async ({ input, ctx }) => {
    const { id, ...data } = input;

    const content = await ctx.prisma.content.update({
      where: { id },
      data,
    });

    return { content, message: "Content updated successfully" };
  });

// Upsert content (staff) - create or update by type
export const upsertContent = staffProcedure
  .input(
    z.object({
      type: z.string(),
      title: z.string().optional().default(""),
      subtitle: z.string().optional().nullable(),
      description: z.string().optional().nullable(),
      content: z.string().optional().nullable(),
      button_text: z.string().optional().nullable(),
      button_link: z.string().optional().nullable(),
      image_url: z.string().optional().nullable(),
      video_url: z.string().optional().nullable(),
      metadata: z.any().optional(),
      status: z.nativeEnum(ContentStatus).default("PUBLISHED"),
    }),
  )
  .mutation(async ({ input, ctx }) => {
    const { type, ...data } = input;

    // Find existing content by type
    const existing = await ctx.prisma.content.findFirst({
      where: { type },
    });

    if (existing) {
      const content = await ctx.prisma.content.update({
        where: { id: existing.id },
        data,
      });
      return { content, message: "Content updated successfully" };
    }

    const content = await ctx.prisma.content.create({
      data: { type, ...data },
    });

    return { content, message: "Content created successfully" };
  });

// Delete content (staff)
export const deleteContent = staffProcedure
  .input(z.object({ id: z.string() }))
  .mutation(async ({ input, ctx }) => {
    await ctx.prisma.content.delete({
      where: { id: input.id },
    });

    return { message: "Content deleted successfully" };
  });

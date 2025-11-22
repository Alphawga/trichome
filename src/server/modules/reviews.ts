import { ReviewStatus } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, publicProcedure, staffProcedure } from "../trpc";

// Get reviews for a product (public)
export const getProductReviews = publicProcedure
  .input(
    z.object({
      productId: z.string(),
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(50).default(10),
      status: z.nativeEnum(ReviewStatus).optional(),
    }),
  )
  .query(async ({ input, ctx }) => {
    const { productId, page, limit, status } = input;
    const skip = (page - 1) * limit;

    const where = {
      product_id: productId,
      status: status || "APPROVED", // Only show approved reviews by default
    };

    const [reviews, total] = await Promise.all([
      ctx.prisma.review.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true,
            },
          },
        },
        orderBy: { created_at: "desc" },
      }),
      ctx.prisma.review.count({ where }),
    ]);

    // Calculate average rating
    const ratingStats = await ctx.prisma.review.aggregate({
      where: {
        product_id: productId,
        status: "APPROVED",
      },
      _avg: {
        rating: true,
      },
      _count: {
        rating: true,
      },
    });

    return {
      reviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      stats: {
        averageRating: ratingStats._avg.rating || 0,
        totalReviews: ratingStats._count.rating || 0,
      },
    };
  });

// Get user's reviews
export const getMyReviews = protectedProcedure
  .input(
    z.object({
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(50).default(10),
    }),
  )
  .query(async ({ input, ctx }) => {
    const { page, limit } = input;
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      ctx.prisma.review.findMany({
        where: { user_id: ctx.user.id },
        skip,
        take: limit,
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              images: {
                where: { is_primary: true },
                take: 1,
              },
            },
          },
        },
        orderBy: { created_at: "desc" },
      }),
      ctx.prisma.review.count({ where: { user_id: ctx.user.id } }),
    ]);

    return {
      reviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  });

// Create review
export const createReview = protectedProcedure
  .input(
    z.object({
      product_id: z.string(),
      rating: z.number().int().min(1).max(5),
      title: z.string().optional(),
      comment: z.string().optional(),
    }),
  )
  .mutation(async ({ input, ctx }) => {
    // Check if user has already reviewed this product
    const existingReview = await ctx.prisma.review.findUnique({
      where: {
        product_id_user_id: {
          product_id: input.product_id,
          user_id: ctx.user.id,
        },
      },
    });

    if (existingReview) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "You have already reviewed this product",
      });
    }

    // Verify product exists
    const product = await ctx.prisma.product.findUnique({
      where: { id: input.product_id },
    });

    if (!product) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Product not found" });
    }

    // Check if user has purchased this product (optional validation)
    const hasPurchased = await ctx.prisma.orderItem.findFirst({
      where: {
        product_id: input.product_id,
        order: {
          user_id: ctx.user.id,
          payment_status: "COMPLETED",
        },
      },
    });

    // Create review (pending approval)
    const review = await ctx.prisma.review.create({
      data: {
        product_id: input.product_id,
        user_id: ctx.user.id,
        rating: input.rating,
        title: input.title,
        comment: input.comment,
        status: hasPurchased ? "APPROVED" : "PENDING", // Auto-approve if purchased
      },
      include: {
        user: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
          },
        },
      },
    });

    return { review, message: "Review submitted successfully" };
  });

// Update review
export const updateReview = protectedProcedure
  .input(
    z.object({
      id: z.string(),
      rating: z.number().int().min(1).max(5).optional(),
      title: z.string().optional(),
      comment: z.string().optional(),
    }),
  )
  .mutation(async ({ input, ctx }) => {
    const { id, ...data } = input;

    const review = await ctx.prisma.review.findUnique({
      where: { id },
    });

    if (!review) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Review not found" });
    }

    if (review.user_id !== ctx.user.id) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You can only edit your own reviews",
      });
    }

    const updatedReview = await ctx.prisma.review.update({
      where: { id },
      data: {
        ...data,
        status: "PENDING", // Reset to pending after edit
      },
      include: {
        user: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
          },
        },
      },
    });

    return { review: updatedReview, message: "Review updated successfully" };
  });

// Delete review
export const deleteReview = protectedProcedure
  .input(z.object({ id: z.string() }))
  .mutation(async ({ input, ctx }) => {
    const review = await ctx.prisma.review.findUnique({
      where: { id: input.id },
    });

    if (!review) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Review not found" });
    }

    if (review.user_id !== ctx.user.id) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You can only delete your own reviews",
      });
    }

    await ctx.prisma.review.delete({
      where: { id: input.id },
    });

    return { message: "Review deleted successfully" };
  });

// Mark review as helpful
export const markReviewHelpful = publicProcedure
  .input(z.object({ id: z.string() }))
  .mutation(async ({ input, ctx }) => {
    const review = await ctx.prisma.review.findUnique({
      where: { id: input.id },
    });

    if (!review) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Review not found" });
    }

    // Increment helpful count
    const updatedReview = await ctx.prisma.review.update({
      where: { id: input.id },
      data: {
        helpful_count: { increment: 1 },
      },
    });

    return { helpfulCount: updatedReview.helpful_count };
  });

// Get all reviews (staff/admin)
export const getAllReviews = staffProcedure
  .input(
    z.object({
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(100).default(20),
      status: z.nativeEnum(ReviewStatus).optional(),
      productId: z.string().optional(),
    }),
  )
  .query(async ({ input, ctx }) => {
    const { page, limit, status, productId } = input;
    const skip = (page - 1) * limit;

    const where = {
      ...(status && { status }),
      ...(productId && { product_id: productId }),
    };

    const [reviews, total] = await Promise.all([
      ctx.prisma.review.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              first_name: true,
              last_name: true,
            },
          },
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
        orderBy: { created_at: "desc" },
      }),
      ctx.prisma.review.count({ where }),
    ]);

    return {
      reviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  });

// Update review status (staff/admin)
export const updateReviewStatus = staffProcedure
  .input(
    z.object({
      id: z.string(),
      status: z.nativeEnum(ReviewStatus),
    }),
  )
  .mutation(async ({ input, ctx }) => {
    const review = await ctx.prisma.review.findUnique({
      where: { id: input.id },
    });

    if (!review) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Review not found" });
    }

    const updatedReview = await ctx.prisma.review.update({
      where: { id: input.id },
      data: { status: input.status },
    });

    return {
      review: updatedReview,
      message: "Review status updated successfully",
    };
  });

// Get review statistics (staff/admin)
export const getReviewStats = staffProcedure.query(async ({ ctx }) => {
  const [total, pending, approved, rejected] = await Promise.all([
    ctx.prisma.review.count(),
    ctx.prisma.review.count({ where: { status: "PENDING" } }),
    ctx.prisma.review.count({ where: { status: "APPROVED" } }),
    ctx.prisma.review.count({ where: { status: "REJECTED" } }),
  ]);

  return {
    total,
    pending,
    approved,
    rejected,
  };
});

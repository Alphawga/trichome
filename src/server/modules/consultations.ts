import { ConsultationStatus, ConsultationType } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, publicProcedure, staffProcedure } from "../trpc";

// Create consultation booking
export const createConsultation = publicProcedure
  .input(
    z.object({
      first_name: z.string().min(1),
      last_name: z.string().min(1),
      email: z.email(),
      phone: z.string().min(1),
      type: z.nativeEnum(ConsultationType),
      preferred_date: z.string().transform((str) => new Date(str)),
      preferred_time: z.string().min(1),
      skin_concerns: z.array(z.string()).default([]),
      additional_notes: z.string().optional(),
    }),
  )
  .mutation(async ({ input, ctx }) => {
    // Check if user is authenticated
    const userId = ctx.session?.user?.id;

    // Check for conflicting bookings (same date and time)
    const conflictingBooking = await ctx.prisma.consultation.findFirst({
      where: {
        preferred_date: {
          gte: new Date(input.preferred_date.setHours(0, 0, 0, 0)),
          lt: new Date(input.preferred_date.setHours(23, 59, 59, 999)),
        },
        preferred_time: input.preferred_time,
        status: {
          in: ["PENDING", "CONFIRMED"],
        },
      },
    });

    if (conflictingBooking) {
      throw new TRPCError({
        code: "CONFLICT",
        message:
          "This time slot is already booked. Please choose another time.",
      });
    }

    // Create consultation booking
    const consultation = await ctx.prisma.consultation.create({
      data: {
        user_id: userId || undefined,
        first_name: input.first_name,
        last_name: input.last_name,
        email: input.email,
        phone: input.phone,
        type: input.type,
        preferred_date: input.preferred_date,
        preferred_time: input.preferred_time,
        skin_concerns: input.skin_concerns,
        additional_notes: input.additional_notes,
        status: "PENDING",
      },
    });

    // Send confirmation email (fire and forget)
    try {
      const { sendEmail } = await import("@/lib/email");
      const _baseUrl =
        process.env.NEXTAUTH_URL ||
        process.env.NEXT_PUBLIC_APP_URL ||
        "http://localhost:3000";

      const consultationTypeLabels = {
        SKINCARE: "Skincare Consultation",
        MAKEUP: "Makeup Consultation",
        FULL: "Full Beauty Consultation",
      };

      const emailContent = `
        <h2>Consultation Booking Confirmation</h2>
        <p>Hello ${input.first_name},</p>
        <p>Thank you for booking a consultation with Trichomes!</p>
        <div style="background-color: #f0f9f0; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #38761d;">
          <h3>Booking Details</h3>
          <p><strong>Type:</strong> ${consultationTypeLabels[input.type]}</p>
          <p><strong>Date:</strong> ${input.preferred_date.toLocaleDateString()}</p>
          <p><strong>Time:</strong> ${input.preferred_time}</p>
          ${input.skin_concerns.length > 0 ? `<p><strong>Skin Concerns:</strong> ${input.skin_concerns.join(", ")}</p>` : ""}
        </div>
        <p>We'll send you a confirmation email once your booking is reviewed. If you have any questions, please contact us.</p>
      `;

      await sendEmail({
        to: input.email,
        subject: "Consultation Booking Confirmation - Trichomes",
        html: emailContent,
        text: `Consultation Booking Confirmation\n\nHello ${input.first_name},\n\nThank you for booking a consultation with Trichomes!\n\nBooking Details:\nType: ${consultationTypeLabels[input.type]}\nDate: ${input.preferred_date.toLocaleDateString()}\nTime: ${input.preferred_time}\n${input.skin_concerns.length > 0 ? `Skin Concerns: ${input.skin_concerns.join(", ")}\n` : ""}\nWe'll send you a confirmation email once your booking is reviewed.`,
      });
    } catch (error) {
      console.error("Failed to send consultation confirmation email:", error);
    }

    return { consultation, message: "Consultation booked successfully" };
  });

// Get user's consultations
export const getMyConsultations = protectedProcedure.query(async ({ ctx }) => {
  const consultations = await ctx.prisma.consultation.findMany({
    where: { user_id: ctx.user.id },
    orderBy: { preferred_date: "desc" },
  });

  return consultations;
});

// Get all consultations (staff/admin)
export const getConsultations = staffProcedure
  .input(
    z.object({
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(100).default(10),
      status: z.nativeEnum(ConsultationStatus).optional(),
      search: z.string().optional(),
    }),
  )
  .query(async ({ input, ctx }) => {
    const { page, limit, status, search } = input;
    const skip = (page - 1) * limit;

    const where = {
      ...(status && { status }),
      ...(search && {
        OR: [
          { email: { contains: search, mode: "insensitive" as const } },
          { first_name: { contains: search, mode: "insensitive" as const } },
          { last_name: { contains: search, mode: "insensitive" as const } },
          { phone: { contains: search, mode: "insensitive" as const } },
        ],
      }),
    };

    const [consultations, total] = await Promise.all([
      ctx.prisma.consultation.findMany({
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
        },
        orderBy: { preferred_date: "desc" },
      }),
      ctx.prisma.consultation.count({ where }),
    ]);

    return {
      consultations,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  });

// Get consultation by ID (staff/admin can view any, customers can only view their own)
export const getConsultationById = protectedProcedure
  .input(z.object({ id: z.string() }))
  .query(async ({ input, ctx }) => {
    const consultation = await ctx.prisma.consultation.findUnique({
      where: { id: input.id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            first_name: true,
            last_name: true,
          },
        },
      },
    });

    if (!consultation) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Consultation not found",
      });
    }

    // Users can only view their own consultations unless they're staff/admin
    if (
      consultation.user_id !== ctx.user.id &&
      ctx.user.role === "CUSTOMER"
    ) {
      throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
    }

    return consultation;
  });

// Get consultation by ID (staff/admin only - no restrictions)
export const getConsultationByIdAdmin = staffProcedure
  .input(z.object({ id: z.string() }))
  .query(async ({ input, ctx }) => {
    const consultation = await ctx.prisma.consultation.findUnique({
      where: { id: input.id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            first_name: true,
            last_name: true,
          },
        },
      },
    });

    if (!consultation) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Consultation not found",
      });
    }

    return consultation;
  });

// Update consultation status (staff/admin)
export const updateConsultationStatus = staffProcedure
  .input(
    z.object({
      id: z.string(),
      status: z.nativeEnum(ConsultationStatus),
      cancellation_reason: z.string().optional(),
    }),
  )
  .mutation(async ({ input, ctx }) => {
    const consultation = await ctx.prisma.consultation.findUnique({
      where: { id: input.id },
    });

    if (!consultation) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Consultation not found",
      });
    }

    const updateData: Record<string, unknown> = {
      status: input.status,
    };

    if (input.status === "CONFIRMED") {
      updateData.confirmed_at = new Date();
    } else if (input.status === "COMPLETED") {
      updateData.completed_at = new Date();
    } else if (input.status === "CANCELLED") {
      updateData.cancelled_at = new Date();
      if (input.cancellation_reason) {
        updateData.cancellation_reason = input.cancellation_reason;
      }
    }

    const updatedConsultation = await ctx.prisma.consultation.update({
      where: { id: input.id },
      data: updateData,
    });

    // Send status update email
    try {
      const { sendEmail } = await import("@/lib/email");

      const statusMessages = {
        CONFIRMED: "Your consultation has been confirmed!",
        COMPLETED: "Your consultation has been marked as completed.",
        CANCELLED: "Your consultation has been cancelled.",
      };

      const message =
        statusMessages[input.status] ||
        "Your consultation status has been updated.";

      await sendEmail({
        to: consultation.email,
        subject: `Consultation ${input.status} - Trichomes`,
        html: `
          <h2>Consultation Status Update</h2>
          <p>Hello ${consultation.first_name},</p>
          <p>${message}</p>
          ${input.cancellation_reason ? `<p><strong>Reason:</strong> ${input.cancellation_reason}</p>` : ""}
        `,
        text: `Consultation Status Update\n\nHello ${consultation.first_name},\n\n${message}${input.cancellation_reason ? `\n\nReason: ${input.cancellation_reason}` : ""}`,
      });
    } catch (error) {
      console.error("Failed to send consultation status email:", error);
    }

    return {
      consultation: updatedConsultation,
      message: "Consultation status updated successfully",
    };
  });

// Cancel consultation (user can cancel their own)
export const cancelConsultation = protectedProcedure
  .input(
    z.object({
      id: z.string(),
      cancellation_reason: z.string().optional(),
    }),
  )
  .mutation(async ({ input, ctx }) => {
    const consultation = await ctx.prisma.consultation.findUnique({
      where: { id: input.id },
    });

    if (!consultation) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Consultation not found",
      });
    }

    // Users can only cancel their own consultations
    if (consultation.user_id !== ctx.user.id) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You can only cancel your own consultations",
      });
    }

    // Can't cancel if already completed or cancelled
    if (
      consultation.status === "COMPLETED" ||
      consultation.status === "CANCELLED"
    ) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message:
          "Cannot cancel a consultation that is already completed or cancelled",
      });
    }

    const updatedConsultation = await ctx.prisma.consultation.update({
      where: { id: input.id },
      data: {
        status: "CANCELLED",
        cancelled_at: new Date(),
        cancellation_reason: input.cancellation_reason || "Cancelled by user",
      },
    });

    return {
      consultation: updatedConsultation,
      message: "Consultation cancelled successfully",
    };
  });

// Bulk update consultation status (staff/admin)
export const bulkUpdateConsultationStatus = staffProcedure
  .input(
    z.object({
      ids: z.array(z.string()).min(1),
      status: z.nativeEnum(ConsultationStatus),
    }),
  )
  .mutation(async ({ input, ctx }) => {
    const { ids, status } = input;

    const updateData: Record<string, unknown> = { status };

    if (status === "CONFIRMED") {
      updateData.confirmed_at = new Date();
    } else if (status === "COMPLETED") {
      updateData.completed_at = new Date();
    } else if (status === "CANCELLED") {
      updateData.cancelled_at = new Date();
    }

    const result = await ctx.prisma.consultation.updateMany({
      where: { id: { in: ids } },
      data: updateData,
    });

    return {
      count: result.count,
      message: `Successfully updated ${result.count} consultation(s) to ${status}`,
    };
  });

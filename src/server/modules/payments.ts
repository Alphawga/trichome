import { PaymentMethod, PaymentStatus } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { staffProcedure } from "../trpc";

// Get all payments (staff/admin)
export const getPayments = staffProcedure
  .input(
    z.object({
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(100).default(20),
      status: z.nativeEnum(PaymentStatus).optional(),
      payment_method: z.nativeEnum(PaymentMethod).optional(),
      search: z.string().optional(),
    }),
  )
  .query(async ({ input, ctx }) => {
    const { page, limit, status, payment_method, search } = input;
    const skip = (page - 1) * limit;

    const where = {
      ...(status && { status }),
      ...(payment_method && { payment_method }),
      ...(search && {
        OR: [
          { transaction_id: { contains: search, mode: "insensitive" as const } },
          { reference: { contains: search, mode: "insensitive" as const } },
          {
            order: {
              OR: [
                { order_number: { contains: search, mode: "insensitive" as const } },
                { email: { contains: search, mode: "insensitive" as const } },
              ],
            },
          },
        ],
      }),
    };

    const [payments, total] = await Promise.all([
      ctx.prisma.payment.findMany({
        where,
        skip,
        take: limit,
        include: {
          order: {
            select: {
              id: true,
              order_number: true,
              email: true,
              first_name: true,
              last_name: true,
              total: true,
            },
          },
        },
        orderBy: { created_at: "desc" },
      }),
      ctx.prisma.payment.count({ where }),
    ]);

    return {
      payments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  });

// Get payment by ID (staff/admin)
export const getPaymentById = staffProcedure
  .input(z.object({ id: z.string() }))
  .query(async ({ input, ctx }) => {
    const payment = await ctx.prisma.payment.findUnique({
      where: { id: input.id },
      include: {
        order: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                first_name: true,
                last_name: true,
              },
            },
            items: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    images: {
                      where: { is_primary: true },
                      take: 1,
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!payment) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Payment not found" });
    }

    return payment;
  });

// Get payment statistics (staff/admin)
export const getPaymentStats = staffProcedure.query(async ({ ctx }) => {
  const [total, completed, pending, failed, refunded] = await Promise.all([
    ctx.prisma.payment.count(),
    ctx.prisma.payment.count({ where: { status: "COMPLETED" } }),
    ctx.prisma.payment.count({ where: { status: "PENDING" } }),
    ctx.prisma.payment.count({ where: { status: "FAILED" } }),
    ctx.prisma.payment.count({ where: { status: "REFUNDED" } }),
  ]);

  const totalRevenue = await ctx.prisma.payment.aggregate({
    where: { status: "COMPLETED" },
    _sum: { amount: true },
  });

  return {
    total,
    completed,
    pending,
    failed,
    refunded,
    totalRevenue: totalRevenue._sum.amount || 0,
  };
});

// Process refund (staff/admin)
export const processRefund = staffProcedure
  .input(
    z.object({
      paymentId: z.string(),
      amount: z.number().positive().optional(),
      reason: z.string().optional(),
    }),
  )
  .mutation(async ({ input, ctx }) => {
    const payment = await ctx.prisma.payment.findUnique({
      where: { id: input.paymentId },
      include: { order: true },
    });

    if (!payment) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Payment not found" });
    }

    if (payment.status !== "COMPLETED") {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Can only refund completed payments",
      });
    }

    const refundAmount = input.amount || Number(payment.amount);

    if (refundAmount > Number(payment.amount)) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Refund amount cannot exceed payment amount",
      });
    }

    // Update payment status
    const updatedPayment = await ctx.prisma.payment.update({
      where: { id: input.paymentId },
      data: {
        status: refundAmount === Number(payment.amount) ? "REFUNDED" : "PARTIALLY_REFUNDED",
        failure_reason: input.reason || "Refund processed",
      },
    });

    // Update order status if fully refunded
    if (refundAmount === Number(payment.amount)) {
      await ctx.prisma.order.update({
        where: { id: payment.order_id },
        data: {
          payment_status: "REFUNDED",
          status: "REFUNDED",
        },
      });
    }

    return {
      payment: updatedPayment,
      message: "Refund processed successfully",
    };
  });


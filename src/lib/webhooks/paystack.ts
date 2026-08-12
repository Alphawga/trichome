import crypto from "node:crypto";
import type { Prisma } from "@prisma/client";
import { OrderStatus, type PaymentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export interface PaystackWebhookPayload {
  event: string;
  data: {
    id: number;
    reference: string;
    amount: number; // in kobo
    currency: string;
    status: string;
    paid_at: string;
    customer: {
      email: string;
      first_name?: string;
      last_name?: string;
    };
    metadata?: Record<string, unknown>;
  };
}

export function verifyPaystackWebhookSignature(
  payload: string,
  signature: string,
  secretKey: string,
): boolean {
  try {
    const hash = crypto
      .createHmac("sha512", secretKey)
      .update(payload)
      .digest("hex");
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(hash));
  } catch {
    return false;
  }
}

export interface PaystackVerifyResult {
  status: string;
  amount: number; // in kobo
  currency: string;
  reference: string;
  paidAt: string | null;
}

export async function verifyPaystackTransaction(
  reference: string,
): Promise<PaystackVerifyResult> {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) {
    throw new Error("PAYSTACK_SECRET_KEY is not configured");
  }

  const response = await fetch(
    `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
    {
      headers: { Authorization: `Bearer ${secretKey}` },
    },
  );

  const body = await response.json();

  if (!response.ok || !body.status) {
    throw new Error(body.message || "Failed to verify Paystack transaction");
  }

  const { data } = body as {
    data: {
      status: string;
      amount: number;
      currency: string;
      reference: string;
      paid_at: string | null;
    };
  };

  return {
    status: data.status,
    amount: data.amount,
    currency: data.currency,
    reference: data.reference,
    paidAt: data.paid_at,
  };
}

export async function refundPaystackTransaction(
  reference: string,
  amountKobo?: number,
): Promise<{ status: string }> {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) {
    throw new Error("PAYSTACK_SECRET_KEY is not configured");
  }

  const response = await fetch("https://api.paystack.co/refund", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      transaction: reference,
      ...(amountKobo !== undefined && { amount: amountKobo }),
    }),
  });

  const body = await response.json();

  if (!response.ok || !body.status) {
    throw new Error(body.message || "Failed to refund Paystack transaction");
  }

  return { status: body.data?.status ?? "pending" };
}

function mapPaystackStatus(status: string): PaymentStatus {
  const map: Record<string, PaymentStatus> = {
    success: "COMPLETED",
    failed: "FAILED",
    abandoned: "FAILED",
    reversed: "FAILED",
  };
  return map[status] || "PENDING";
}

export async function processPaystackPaymentWebhook(
  payload: PaystackWebhookPayload,
): Promise<{ success: boolean; message: string; orderNumber?: string }> {
  if (payload.event !== "charge.success" && payload.event !== "charge.failed") {
    return { success: true, message: `Event ${payload.event} ignored` };
  }

  const { reference, amount, status, paid_at } = payload.data;

  const payment = await prisma.payment.findUnique({
    where: { reference },
    include: {
      order: {
        include: { items: true },
      },
    },
  });

  if (!payment) {
    const attemptId = payload.data.metadata?.checkout_attempt_id;
    if (typeof attemptId !== "string") {
      console.error(`Payment not found for reference: ${reference}`);
      return {
        success: false,
        message: "Payment not found and no checkout attempt supplied",
      };
    }

    const attempt = await prisma.checkoutAttempt.findFirst({
      where: { id: attemptId, reference },
    });
    if (!attempt) {
      console.error(`Checkout attempt not found for reference: ${reference}`);
      return { success: false, message: "Checkout attempt not found" };
    }

    if (status !== "success") {
      await prisma.checkoutAttempt.update({
        where: { id: attempt.id },
        data: { status: "FAILED" },
      });
      return {
        success: true,
        message: `Failed checkout ${reference} recorded`,
      };
    }

    try {
      // Dynamic import avoids a module cycle: the orders router uses the
      // Paystack verifier, while recovery needs to invoke that same validated
      // order-creation procedure when the browser callback never arrived.
      const { appRouter } = await import("@/server");
      const checkoutPayload = attempt.payload as Record<string, unknown>;
      const paymentResponse = {
        paymentStatus: "PAID",
        transactionReference: String(payload.data.id),
        paymentReference: reference,
        amountPaid: String(amount / 100),
        customerEmail: payload.data.customer.email,
        customerName:
          `${payload.data.customer.first_name || ""} ${payload.data.customer.last_name || ""}`.trim() ||
          payload.data.customer.email,
      };

      let session = null;
      if (!attempt.is_guest && attempt.user_id) {
        const user = await prisma.user.findUnique({
          where: { id: attempt.user_id },
        });
        if (!user) throw new Error("Checkout user no longer exists");
        session = {
          expires: new Date(Date.now() + 5 * 60_000).toISOString(),
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            role: user.role,
            first_name: user.first_name,
            last_name: user.last_name,
          },
        };
      }

      const caller = appRouter.createCaller({
        prisma,
        session,
        ip: `paystack-recovery:${attempt.id}`,
      });
      const recoveryInput = { ...checkoutPayload, paymentResponse };
      const result = attempt.is_guest
        ? await caller.createGuestOrderWithPayment(
            recoveryInput as Parameters<
              typeof caller.createGuestOrderWithPayment
            >[0],
          )
        : await caller.createOrderWithPayment(
            recoveryInput as Parameters<
              typeof caller.createOrderWithPayment
            >[0],
          );

      await prisma.checkoutAttempt.update({
        where: { id: attempt.id },
        data: { status: "COMPLETED", order_id: result.order.id },
      });
      return {
        success: true,
        message: "Order recovered from Paystack webhook",
        orderNumber: result.orderNumber,
      };
    } catch (error) {
      const errorCode =
        typeof error === "object" && error !== null && "code" in error
          ? String(error.code)
          : undefined;
      if (errorCode === "CONFLICT" || errorCode === "TOO_MANY_REQUESTS") {
        return {
          success: true,
          message: `Checkout ${attempt.id} is already being processed`,
        };
      }
      console.error(`Failed to recover checkout ${attempt.id}:`, error);
      await prisma.checkoutAttempt.update({
        where: { id: attempt.id },
        data: { status: "RECOVERY_FAILED" },
      });
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "Checkout recovery failed",
      };
    }
  }

  const order = payment.order;

  if (payment.status === "COMPLETED" && status === "success") {
    await prisma.checkoutAttempt.updateMany({
      where: { reference },
      data: { status: "COMPLETED", order_id: order.id },
    });
    return {
      success: true,
      message: "Payment already processed",
      orderNumber: order.order_number,
    };
  }

  const newStatus = mapPaystackStatus(status);
  const amountNaira = amount / 100;

  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: newStatus,
      processed_at: paid_at ? new Date(paid_at) : new Date(),
      gateway_response: payload.data as Prisma.InputJsonValue,
      failure_reason:
        newStatus === "FAILED" ? `Payment failed: ${status}` : null,
    },
  });

  if (status === "success") {
    const orderTotal = Number(order.total);
    if (Math.abs(amountNaira - orderTotal) > 1) {
      console.warn(
        `Amount mismatch for order ${order.order_number}. Expected: ${orderTotal}, Got: ${amountNaira}`,
      );
    }

    await prisma.order.update({
      where: { id: order.id },
      data: {
        payment_status: "COMPLETED",
        status:
          order.status === "PENDING" ? OrderStatus.PROCESSING : order.status,
      },
    });

    await prisma.orderStatusHistory.create({
      data: {
        order_id: order.id,
        status:
          order.status === "PENDING" ? OrderStatus.PROCESSING : order.status,
        notes: "Payment confirmed via Paystack webhook",
        created_by: order.user_id || "system",
      },
    });

    console.log(
      `Order ${order.order_number} payment confirmed via Paystack webhook. Reference: ${reference}`,
    );
  } else {
    await prisma.order.update({
      where: { id: order.id },
      data: { payment_status: "FAILED" },
    });

    await prisma.orderStatusHistory.create({
      data: {
        order_id: order.id,
        status: order.status,
        notes: `Payment failed via Paystack webhook: ${status}`,
        created_by: order.user_id || "system",
      },
    });

    console.log(
      `Order ${order.order_number} payment failed via Paystack webhook. Reference: ${reference}`,
    );
  }

  return {
    success: true,
    message: `Payment ${reference} processed`,
    orderNumber: order.order_number,
  };
}

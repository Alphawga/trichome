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
    console.error(`Payment not found for reference: ${reference}`);
    return { success: false, message: "Payment not found" };
  }

  const order = payment.order;

  if (payment.status === "COMPLETED" && status === "success") {
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
      failure_reason: newStatus === "FAILED" ? `Payment failed: ${status}` : null,
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

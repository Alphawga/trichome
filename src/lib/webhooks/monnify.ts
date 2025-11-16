import crypto from "node:crypto";
import type { Prisma } from "@prisma/client";
import { OrderStatus, type PaymentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

/**
 * Monnify Webhook Utilities
 *
 * Provides utilities for verifying and processing Monnify webhooks
 */

export interface MonnifyWebhookPayload {
  eventType: string;
  eventData: {
    product?: {
      type: string;
      reference: string;
    };
    transactionReference: string;
    paymentReference: string;
    amountPaid: string;
    totalPayable: string;
    settlementAmount: string;
    paidOn: string;
    paymentStatus: string;
    paymentDescription: string;
    currency: string;
    paymentMethod: string;
    customer: {
      email: string;
      name: string;
    };
    metaData?: Record<string, unknown>;
  };
}

/**
 * Verify Monnify webhook signature
 * Monnify signs webhooks with HMAC SHA512 using the secret key
 */
export function verifyMonnifyWebhookSignature(
  payload: string,
  signature: string,
  secretKey: string,
): boolean {
  try {
    const hash = crypto
      .createHmac("sha512", secretKey)
      .update(payload, "utf8")
      .digest("hex");

    // Use timing-safe comparison to prevent timing attacks
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(hash));
  } catch (error) {
    console.error("Error verifying webhook signature:", error);
    return false;
  }
}

/**
 * Map Monnify payment status to our PaymentStatus enum
 */
export function mapMonnifyPaymentStatus(monnifyStatus: string): PaymentStatus {
  const statusMap: Record<string, PaymentStatus> = {
    PAID: "COMPLETED",
    FAILED: "FAILED",
    PENDING: "PENDING",
    OVERPAID: "COMPLETED",
    PARTIAL: "PENDING",
    REVERSED: "FAILED",
    EXPIRED: "FAILED",
    CANCELLED: "FAILED",
  };

  return statusMap[monnifyStatus] || "PENDING";
}

/**
 * Process payment webhook event
 * Updates payment and order status based on webhook data
 */
export async function processMonnifyPaymentWebhook(
  payload: MonnifyWebhookPayload,
): Promise<{ success: boolean; message: string; orderNumber?: string }> {
  const { eventType, eventData } = payload;

  // Only process SUCCESSFUL_TRANSACTION events (Monnify's actual event type)
  // According to Monnify docs: https://developers.monnify.com/docs/webhooks
  if (eventType !== "SUCCESSFUL_TRANSACTION") {
    console.log(`Ignoring webhook event type: ${eventType}`);
    return { success: true, message: `Event type ${eventType} ignored` };
  }

  const {
    transactionReference,
    paymentReference,
    amountPaid,
    paymentStatus,
    paidOn,
    customer: _customer,
    currency: _currency,
  } = eventData;

  // Find payment by reference
  const payment = await prisma.payment.findUnique({
    where: { reference: paymentReference },
    include: {
      order: {
        include: {
          items: true,
        },
      },
    },
  });

  if (!payment) {
    console.error(`Payment not found for reference: ${paymentReference}`);
    return { success: false, message: "Payment not found" };
  }

  const order = payment.order;

  // Prevent duplicate processing (idempotency check)
  if (payment.status === "COMPLETED" && paymentStatus === "PAID") {
    console.log(`Payment ${paymentReference} already processed`);
    return {
      success: true,
      message: "Payment already processed",
      orderNumber: order.order_number,
    };
  }

  const newPaymentStatus = mapMonnifyPaymentStatus(paymentStatus);

  // Update payment record
  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: newPaymentStatus,
      transaction_id: transactionReference,
      processed_at: paidOn ? new Date(paidOn) : new Date(),
      gateway_response: eventData as Prisma.InputJsonValue,
      failure_reason:
        newPaymentStatus === "FAILED"
          ? `Payment failed: ${paymentStatus}`
          : null,
    },
  });

  // Update order status based on payment status
  if (paymentStatus === "PAID" || paymentStatus === "OVERPAID") {
    // Verify payment amount matches order total (with small tolerance for rounding)
    const paidAmount = parseFloat(amountPaid);
    const orderTotal = Number(order.total);
    const tolerance = 0.01; // 1 kobo tolerance

    if (Math.abs(paidAmount - orderTotal) > tolerance) {
      console.warn(
        `Payment amount mismatch for order ${order.order_number}. Expected: ${orderTotal}, Received: ${paidAmount}`,
      );
      // Still update payment but log the discrepancy
    }

    // Update order payment status
    await prisma.order.update({
      where: { id: order.id },
      data: {
        payment_status: "COMPLETED",
        // Only update order status if it's still PENDING
        status:
          order.status === "PENDING" ? OrderStatus.PROCESSING : order.status,
      },
    });

    // Add status history entry
    await prisma.orderStatusHistory.create({
      data: {
        order_id: order.id,
        status:
          order.status === "PENDING" ? OrderStatus.PROCESSING : order.status,
        notes: "Payment confirmed via webhook",
        created_by: order.user_id || "system",
      },
    });

    console.log(
      `Order ${order.order_number} payment confirmed via webhook. Payment: ${paymentReference}`,
    );
  } else if (
    paymentStatus === "FAILED" ||
    paymentStatus === "REVERSED" ||
    paymentStatus === "EXPIRED"
  ) {
    // Update order payment status to failed
    await prisma.order.update({
      where: { id: order.id },
      data: {
        payment_status: "FAILED",
      },
    });

    // Add status history entry
    await prisma.orderStatusHistory.create({
      data: {
        order_id: order.id,
        status: order.status,
        notes: `Payment failed via webhook: ${paymentStatus}`,
        created_by: order.user_id || "system",
      },
    });

    console.log(
      `Order ${order.order_number} payment failed via webhook. Payment: ${paymentReference}`,
    );
  }

  return {
    success: true,
    message: `Payment ${paymentReference} processed successfully`,
    orderNumber: order.order_number,
  };
}

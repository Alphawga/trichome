import { type NextRequest, NextResponse } from "next/server";
import {
  type MonnifyWebhookPayload,
  processMonnifyPaymentWebhook,
  verifyMonnifyWebhookSignature,
} from "@/lib/webhooks/monnify";

/**
 * Monnify Webhook Handler
 *
 * Handles payment webhooks from Monnify payment gateway.
 * Verifies webhook signature and updates order/payment status accordingly.
 *
 * Webhook Documentation: https://docs.monnify.com/#monnify-webhook
 *
 * Endpoint: POST /api/webhooks/monnify
 */

/**
 * POST handler for Monnify webhooks
 */
export async function POST(request: NextRequest) {
  try {
    // Get Monnify client secret key for webhook signature verification
    // According to Monnify docs: SHA-512(client secret key + request body)
    // The client secret key is the same one used for API authentication
    const clientSecretKey = process.env.NEXT_PUBLIC_MONNIFY_SECRET_KEY;

    if (!clientSecretKey) {
      console.error("Monnify client secret key not configured");
      return NextResponse.json(
        { error: "Monnify client secret key not configured" },
        { status: 500 },
      );
    }

    // Get raw body for signature verification
    const rawBody = await request.text();
    const signature = request.headers.get("monnify-signature") || "";

    // Verify webhook signature using client secret key
    if (!verifyMonnifyWebhookSignature(rawBody, signature, clientSecretKey)) {
      console.error("Invalid webhook signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // Parse webhook payload
    let payload: MonnifyWebhookPayload;
    try {
      payload = JSON.parse(rawBody);
    } catch (error) {
      console.error("Invalid JSON payload:", error);
      return NextResponse.json(
        { error: "Invalid JSON payload" },
        { status: 400 },
      );
    }

    // Validate payload structure
    if (!payload.eventType || !payload.eventData) {
      console.error("Invalid webhook payload structure");
      return NextResponse.json(
        { error: "Invalid payload structure" },
        { status: 400 },
      );
    }

    // Process webhook
    const result = await processMonnifyPaymentWebhook(payload);

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    // Return success response
    return NextResponse.json({
      success: true,
      message: result.message,
      orderNumber: result.orderNumber,
    });
  } catch (error) {
    console.error("Error processing Monnify webhook:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    );
  }
}

/**
 * GET handler for webhook verification (optional)
 * Some payment gateways require GET endpoint for webhook setup verification
 */
export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "Monnify webhook endpoint is active",
    timestamp: new Date().toISOString(),
  });
}

import { type NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import {
  type PaystackWebhookPayload,
  processPaystackPaymentWebhook,
  verifyPaystackWebhookSignature,
} from "@/lib/webhooks/paystack";

export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      "unknown";
    const { allowed, retryAfterSeconds } = await checkRateLimit(
      `paystackWebhook:${ip}`,
      60,
      60,
    );

    if (!allowed) {
      return NextResponse.json(
        { error: "Too many requests" },
        {
          status: 429,
          headers: { "Retry-After": String(retryAfterSeconds ?? 60) },
        },
      );
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
      console.error("Paystack secret key not configured");
      return NextResponse.json(
        { error: "Paystack secret key not configured" },
        { status: 500 },
      );
    }

    const rawBody = await request.text();
    const signature = request.headers.get("x-paystack-signature") || "";

    if (!verifyPaystackWebhookSignature(rawBody, signature, secretKey)) {
      console.error("Invalid Paystack webhook signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    let payload: PaystackWebhookPayload;
    try {
      payload = JSON.parse(rawBody);
    } catch (error) {
      console.error("Invalid JSON payload:", error);
      return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
    }

    if (!payload.event || !payload.data) {
      return NextResponse.json({ error: "Invalid payload structure" }, { status: 400 });
    }

    const result = await processPaystackPaymentWebhook(payload);

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      orderNumber: result.orderNumber,
    });
  } catch (error) {
    console.error("Error processing Paystack webhook:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "Paystack webhook endpoint is active",
    timestamp: new Date().toISOString(),
  });
}

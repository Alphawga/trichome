import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { trackOrder } from "@/lib/shipping/tracking-service";
import { publicProcedure } from "../trpc";

// Get tracking information for an order
export const getOrderTracking = publicProcedure
  .input(
    z.object({
      orderNumber: z.string(),
      email: z.string().email().optional(), // For guest order tracking
    }),
  )
  .query(async ({ input, ctx }) => {
    const { orderNumber, email } = input;

    // Find order
    const order = await ctx.prisma.order.findUnique({
      where: { order_number: orderNumber },
      include: {
        shipping_address: true,
        status_history: {
          orderBy: { created_at: "desc" },
        },
      },
    });

    if (!order) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Order not found" });
    }

    // For guest orders, verify email matches
    if (!order.user_id && email) {
      if (order.email.toLowerCase() !== email.toLowerCase()) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid email for this order",
        });
      }
    }

    // For authenticated users, verify ownership
    if (order.user_id && ctx.user?.id) {
      if (order.user_id !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have access to this order",
        });
      }
    }

    // Get tracking number from order
    const trackingNumber = order.tracking_number;

    if (!trackingNumber) {
      // If no tracking number, return order status-based tracking
      return {
        orderNumber: order.order_number,
        status: order.status,
        trackingNumber: null,
        trackingInfo: null,
        estimatedDelivery: order.delivered_at || null,
        events: order.status_history.map((history) => ({
          timestamp: history.created_at,
          description: history.notes || `Order ${history.status.toLowerCase()}`,
          location: order.shipping_address?.city || undefined,
          status: mapOrderStatusToTrackingStatus(history.status),
        })),
        shippingAddress: order.shipping_address,
      };
    }

    // Fetch tracking information from shipping provider
    try {
      const trackingInfo = await trackOrder(trackingNumber);

      // Merge order status history with tracking events
      const combinedEvents = [
        ...order.status_history.map((history) => ({
          timestamp: history.created_at,
          description: history.notes || `Order ${history.status.toLowerCase()}`,
          location: order.shipping_address?.city || undefined,
          status: mapOrderStatusToTrackingStatus(history.status),
        })),
        ...trackingInfo.events.map((event) => ({
          timestamp: event.timestamp,
          description: event.description,
          location: event.location,
          status: event.status,
        })),
      ].sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      );

      return {
        orderNumber: order.order_number,
        status: order.status,
        trackingNumber,
        trackingInfo: {
          ...trackingInfo,
          events: combinedEvents,
        },
        estimatedDelivery:
          trackingInfo.estimatedDelivery || order.delivered_at || null,
        shippingAddress: order.shipping_address,
      };
    } catch (error) {
      // If tracking fails, return order status-based tracking
      return {
        orderNumber: order.order_number,
        status: order.status,
        trackingNumber,
        trackingInfo: null,
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch tracking information",
        estimatedDelivery: order.delivered_at || null,
        events: order.status_history.map((history) => ({
          timestamp: history.created_at,
          description: history.notes || `Order ${history.status.toLowerCase()}`,
          location: order.shipping_address?.city || undefined,
          status: mapOrderStatusToTrackingStatus(history.status),
        })),
        shippingAddress: order.shipping_address,
      };
    }
  });

// Map order status to tracking status
function mapOrderStatusToTrackingStatus(
  orderStatus: string,
): "pending" | "in_transit" | "out_for_delivery" | "delivered" | "exception" {
  const statusLower = orderStatus.toLowerCase();

  if (statusLower === "delivered") {
    return "delivered";
  }
  if (statusLower === "shipped") {
    return "out_for_delivery";
  }
  if (statusLower === "processing" || statusLower === "confirmed") {
    return "in_transit";
  }
  if (
    statusLower === "cancelled" ||
    statusLower === "returned" ||
    statusLower === "refunded"
  ) {
    return "exception";
  }
  return "pending";
}

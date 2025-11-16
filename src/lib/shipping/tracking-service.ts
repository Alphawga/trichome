/**
 * Shipping Tracking Service
 *
 * Provides a unified interface for tracking orders across multiple shipping providers.
 * Follows Trichomes Design Guide principles:
 * - Reusable utility functions
 * - Type-safe
 * - Centralized logic
 */

export interface TrackingEvent {
  /** Event timestamp */
  timestamp: Date;
  /** Event description */
  description: string;
  /** Event location */
  location?: string;
  /** Event status */
  status:
    | "pending"
    | "in_transit"
    | "out_for_delivery"
    | "delivered"
    | "exception";
}

export interface TrackingInfo {
  /** Tracking number */
  trackingNumber: string;
  /** Carrier/provider name */
  carrier: string;
  /** Current status */
  status: string;
  /** Tracking events timeline */
  events: TrackingEvent[];
  /** Estimated delivery date */
  estimatedDelivery?: Date;
  /** Origin address */
  origin?: string;
  /** Destination address */
  destination?: string;
  /** Last updated timestamp */
  lastUpdated: Date;
}

/**
 * Shipping provider interface
 */
interface ShippingProvider {
  /** Provider name */
  name: string;
  /** Check if tracking number matches provider format */
  matchesTrackingNumber(trackingNumber: string): boolean;
  /** Fetch tracking information */
  fetchTracking(trackingNumber: string): Promise<TrackingInfo>;
}

/**
 * Generic tracking implementation
 * This provides a basic tracking structure that can be extended
 * with actual API integrations for specific carriers
 */
export class GenericTrackingProvider implements ShippingProvider {
  name = "Generic";

  matchesTrackingNumber(trackingNumber: string): boolean {
    // Match common tracking number formats
    return /^[A-Z0-9]{8,30}$/i.test(trackingNumber);
  }

  async fetchTracking(trackingNumber: string): Promise<TrackingInfo> {
    // This is a placeholder - replace with actual API integration
    // For now, return mock data based on order status

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    return {
      trackingNumber,
      carrier: "Standard Shipping",
      status: "In Transit",
      events: [
        {
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          description: "Order processed",
          location: "Lagos, Nigeria",
          status: "pending",
        },
        {
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          description: "Package shipped",
          location: "Lagos, Nigeria",
          status: "in_transit",
        },
        {
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          description: "In transit to destination",
          location: "En route",
          status: "in_transit",
        },
      ],
      estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      lastUpdated: new Date(),
    };
  }
}

/**
 * Track order by tracking number
 *
 * This function can be extended to integrate with actual shipping APIs:
 * - FedEx API
 * - DHL API
 * - UPS API
 * - Local courier APIs (e.g., Nigeria Post, GIG Logistics, etc.)
 */
export async function trackOrder(
  trackingNumber: string,
): Promise<TrackingInfo> {
  if (!trackingNumber || !trackingNumber.trim()) {
    throw new Error("Tracking number is required");
  }

  const provider = new GenericTrackingProvider();

  if (!provider.matchesTrackingNumber(trackingNumber)) {
    throw new Error("Invalid tracking number format");
  }

  try {
    return await provider.fetchTracking(trackingNumber);
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? `Failed to track order: ${error.message}`
        : "Failed to track order",
    );
  }
}

/**
 * Get tracking status color
 */
export function getTrackingStatusColor(status: string): string {
  const statusLower = status.toLowerCase();

  if (statusLower.includes("delivered")) {
    return "text-green-600 bg-green-50";
  }
  if (
    statusLower.includes("out for delivery") ||
    statusLower.includes("out_for_delivery")
  ) {
    return "text-blue-600 bg-blue-50";
  }
  if (
    statusLower.includes("in transit") ||
    statusLower.includes("in_transit")
  ) {
    return "text-yellow-600 bg-yellow-50";
  }
  if (statusLower.includes("exception") || statusLower.includes("failed")) {
    return "text-red-600 bg-red-50";
  }
  return "text-gray-600 bg-gray-50";
}

/**
 * Format tracking status for display
 */
export function formatTrackingStatus(status: string): string {
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

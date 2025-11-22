"use client";

import type { OrderStatus } from "@prisma/client";
import { format } from "date-fns";

interface OrderStatusTimelineProps {
  /** Current order status */
  currentStatus: OrderStatus;
  /** Status history entries */
  statusHistory?: Array<{
    status: OrderStatus;
    created_at: Date;
    notes?: string | null;
  }>;
  /** Show all statuses or only completed ones */
  showAll?: boolean;
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Additional className */
  className?: string;
}

/**
 * OrderStatusTimeline Component
 *
 * Reusable component for displaying order status progression.
 * Shows a visual timeline with completed, current, and pending statuses.
 *
 * Follows Trichomes Design Guide principles:
 * - Reusable across track order, order details, and order history
 * - Type-safe
 * - Consistent styling
 * - Accessible
 */
export function OrderStatusTimeline({
  currentStatus,
  statusHistory = [],
  showAll = false,
  size: _size = "md",
  className = "",
}: OrderStatusTimelineProps) {
  // Define all possible order statuses in progression order
  const statusOrder: OrderStatus[] = [
    "PENDING",
    "CONFIRMED",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
    "RETURNED",
    "REFUNDED",
  ];

  // Get status configuration
  const getStatusConfig = (status: OrderStatus) => {
    const configs = {
      PENDING: {
        label: "Pending",
        description: "Order received, awaiting confirmation",
        color: "text-trichomes-forest/60",
        bgColor: "bg-trichomes-forest/10",
        borderColor: "border-trichomes-forest/20",
        icon: (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <title>Pending</title>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        ),
      },
      CONFIRMED: {
        label: "Confirmed",
        description: "Order confirmed and being prepared",
        color: "text-blue-600",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200",
        icon: (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <title>Confirmed</title>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        ),
      },
      PROCESSING: {
        label: "Processing",
        description: "Order is being processed",
        color: "text-trichomes-gold",
        bgColor: "bg-trichomes-gold/10",
        borderColor: "border-trichomes-gold/30",
        icon: (
          <svg
            className="w-5 h-5 animate-spin"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <title>Processing</title>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        ),
      },
      SHIPPED: {
        label: "Shipped",
        description: "Order has been shipped",
        color: "text-trichomes-primary",
        bgColor: "bg-trichomes-primary/10",
        borderColor: "border-trichomes-primary/30",
        icon: (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <title>Shipped</title>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        ),
      },
      DELIVERED: {
        label: "Delivered",
        description: "Order has been delivered",
        color: "text-trichomes-primary",
        bgColor: "bg-trichomes-primary/10",
        borderColor: "border-trichomes-primary/30",
        icon: (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <title>Delivered</title>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        ),
      },
      CANCELLED: {
        label: "Cancelled",
        description: "Order has been cancelled",
        color: "text-red-600",
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
        icon: (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <title>Cancelled</title>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ),
      },
      RETURNED: {
        label: "Returned",
        description: "Order has been returned",
        color: "text-orange-600",
        bgColor: "bg-orange-50",
        borderColor: "border-orange-200",
        icon: (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <title>Returned</title>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
            />
          </svg>
        ),
      },
      REFUNDED: {
        label: "Refunded",
        description: "Order has been refunded",
        color: "text-blue-600",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200",
        icon: (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <title>Refunded</title>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
            />
          </svg>
        ),
      },
    };

    return configs[status] || configs.PENDING;
  };

  // Determine which statuses to show
  const getStatusesToShow = () => {
    if (showAll) {
      return statusOrder;
    }

    // Show only statuses up to and including current status
    const currentIndex = statusOrder.indexOf(currentStatus);
    if (currentIndex === -1) {
      return [currentStatus]; // If status not in order, just show it
    }

    // For terminal statuses (CANCELLED, RETURNED, REFUNDED), show the path that led there
    if (["CANCELLED", "RETURNED", "REFUNDED"].includes(currentStatus)) {
      // Show normal progression up to SHIPPED, then the terminal status
      const normalProgression = statusOrder.slice(
        0,
        statusOrder.indexOf("SHIPPED") + 1,
      );
      return [...normalProgression, currentStatus];
    }

    return statusOrder.slice(0, currentIndex + 1);
  };

  const statusesToShow = getStatusesToShow();
  const currentIndex = statusesToShow.indexOf(currentStatus);

  // Get status history map for timestamps
  const statusHistoryMap = new Map(
    statusHistory.map((entry) => [entry.status, entry]),
  );

  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="text-lg font-heading font-semibold text-trichomes-forest mb-6">
        Order Status
      </h3>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-trichomes-forest/10" />

        <div className="space-y-6">
          {statusesToShow.map((status, index) => {
            const config = getStatusConfig(status);
            const isCompleted = index < currentIndex;
            const isCurrent = index === currentIndex;
            const _isPending = index > currentIndex;
            const historyEntry = statusHistoryMap.get(status);

            return (
              <div key={status} className="relative flex items-start gap-4">
                {/* Status icon */}
                <div
                  className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors duration-300 ${
                    isCompleted
                      ? `${config.bgColor} ${config.borderColor} ${config.color}`
                      : isCurrent
                        ? `${config.bgColor} ${config.borderColor} ${config.color} ring-2 ring-offset-2 ring-trichomes-primary/20`
                        : "bg-trichomes-soft border-trichomes-forest/20 text-trichomes-forest/40"
                  }`}
                >
                  {isCompleted || isCurrent ? (
                    config.icon
                  ) : (
                    <div className="w-3 h-3 rounded-full bg-trichomes-forest/20" />
                  )}
                </div>

                {/* Status content */}
                <div className="flex-1 pt-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4
                      className={`font-medium transition-colors duration-300 ${
                        isCompleted || isCurrent
                          ? `${config.color}`
                          : "text-trichomes-forest/40"
                      }`}
                    >
                      {config.label}
                    </h4>
                    {historyEntry && (
                      <span className="text-xs text-trichomes-forest/60 font-body">
                        {format(
                          new Date(historyEntry.created_at),
                          "MMM dd, yyyy",
                        )}
                      </span>
                    )}
                  </div>
                  <p
                    className={`text-sm transition-colors duration-300 ${
                      isCompleted || isCurrent
                        ? "text-trichomes-forest/70"
                        : "text-trichomes-forest/40"
                    } font-body`}
                  >
                    {historyEntry?.notes || config.description}
                  </p>
                  {historyEntry?.notes && (
                    <p className="text-xs text-trichomes-forest/50 mt-1 font-body italic">
                      {historyEntry.notes}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

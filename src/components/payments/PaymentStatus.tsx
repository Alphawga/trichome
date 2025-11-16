"use client";

import type { PaymentStatus as PaymentStatusEnum } from "@prisma/client";

interface PaymentStatusProps {
  /** Payment status to display */
  status: PaymentStatusEnum;
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Show icon */
  showIcon?: boolean;
  /** Additional className */
  className?: string;
}

/**
 * PaymentStatus Component
 *
 * Reusable component to display payment status with proper styling and icons.
 * Follows Trichomes Design Guide principles:
 * - Reusable across the app
 * - Type-safe
 * - Consistent styling
 * - Accessible
 */
export function PaymentStatus({
  status,
  size = "md",
  showIcon = true,
  className = "",
}: PaymentStatusProps) {
  const statusConfig = {
    PENDING: {
      label: "Pending",
      color: "text-trichomes-forest/60",
      bgColor: "bg-trichomes-forest/10",
      icon: (
        <svg
          className="w-4 h-4"
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
    PROCESSING: {
      label: "Processing",
      color: "text-trichomes-gold",
      bgColor: "bg-trichomes-gold/10",
      icon: (
        <svg
          className="w-4 h-4 animate-spin"
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
    COMPLETED: {
      label: "Completed",
      color: "text-trichomes-primary",
      bgColor: "bg-trichomes-primary/10",
      icon: (
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <title>Completed</title>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      ),
    },
    FAILED: {
      label: "Failed",
      color: "text-red-600",
      bgColor: "bg-red-50",
      icon: (
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <title>Failed</title>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      ),
    },
    CANCELLED: {
      label: "Cancelled",
      color: "text-trichomes-forest/60",
      bgColor: "bg-trichomes-forest/10",
      icon: (
        <svg
          className="w-4 h-4"
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
    REFUNDED: {
      label: "Refunded",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      icon: (
        <svg
          className="w-4 h-4"
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
    PARTIALLY_REFUNDED: {
      label: "Partially Refunded",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      icon: (
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <title>Partially Refunded</title>
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

  const config = statusConfig[status] || statusConfig.PENDING;

  const sizeClasses = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-3 py-1.5",
    lg: "text-base px-4 py-2",
  };

  const iconSizeClasses = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  return (
    <output
      className={`inline-flex items-center gap-1.5 ${config.bgColor} ${config.color} ${sizeClasses[size]} font-medium ${className}`}
      aria-label={`Payment status: ${config.label}`}
    >
      {showIcon && (
        <span className={iconSizeClasses[size]} aria-hidden="true">
          {config.icon}
        </span>
      )}
      <span>{config.label}</span>
    </output>
  );
}

"use client";

import Link from "next/link";

interface TrackingInfoProps {
  /** Tracking number */
  trackingNumber?: string | null;
  /** Estimated delivery date */
  estimatedDelivery?: Date | string | null;
  /** Shipping status */
  status?: string;
  /** Show tracking link */
  showTrackingLink?: boolean;
}

/**
 * Reusable TrackingInfo component
 * Displays tracking information and delivery estimates
 */
export function TrackingInfo({
  trackingNumber,
  estimatedDelivery,
  status,
  showTrackingLink = true,
}: TrackingInfoProps) {
  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return null;
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return new Intl.DateTimeFormat("en-NG", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(dateObj);
  };

  const deliveryDate = formatDate(estimatedDelivery);

  return (
    <div className="bg-white p-6 sm:p-8 rounded-xl border border-trichomes-forest/10 shadow-sm">
      <h3 className="text-[18px] sm:text-[20px] font-heading font-semibold mb-4 sm:mb-6 text-trichomes-forest">
        Tracking Information
      </h3>

      <div className="space-y-4">
        {trackingNumber ? (
          <div>
            <p className="text-[13px] sm:text-[14px] text-trichomes-forest/60 font-body mb-1">
              Tracking Number
            </p>
            <div className="flex items-center gap-3">
              <p className="text-[15px] sm:text-[16px] font-mono font-semibold text-trichomes-forest">
                {trackingNumber}
              </p>
              {showTrackingLink && (
                <Link
                  href={`/track-order?order=${trackingNumber}`}
                  className="text-trichomes-primary hover:text-trichomes-forest text-[13px] sm:text-[14px] font-body font-medium transition-colors duration-150 underline"
                >
                  Track Order
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div>
            <p className="text-[14px] sm:text-[15px] text-trichomes-forest/60 font-body">
              Tracking number will be available once your order ships.
            </p>
          </div>
        )}

        {deliveryDate && (
          <div>
            <p className="text-[13px] sm:text-[14px] text-trichomes-forest/60 font-body mb-1">
              Estimated Delivery
            </p>
            <p className="text-[14px] sm:text-[15px] font-body text-trichomes-forest">
              {deliveryDate}
            </p>
          </div>
        )}

        {status && (
          <div>
            <p className="text-[13px] sm:text-[14px] text-trichomes-forest/60 font-body mb-1">
              Status
            </p>
            <p className="text-[14px] sm:text-[15px] font-body text-trichomes-forest">
              {status
                .toLowerCase()
                .split("_")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { format } from "date-fns";

import {
  formatTrackingStatus,
  getTrackingStatusColor,
  type TrackingInfo,
} from "@/lib/shipping/tracking-service";

interface TrackingUpdatesProps {
  /** Tracking information */
  trackingInfo: TrackingInfo;
  /** Additional className */
  className?: string;
}

/**
 * TrackingUpdates Component
 *
 * Displays real-time tracking updates for an order.
 * Used in track order page and order details.
 *
 * Follows Trichomes Design Guide principles:
 * - Reusable component
 * - Type-safe
 * - Consistent styling
 * - Loading states
 */
export function TrackingUpdates({
  trackingInfo,
  className = "",
}: TrackingUpdatesProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Current Status */}
      <div className="bg-white p-6 rounded-xl border border-trichomes-forest/10 shadow-sm">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-heading font-semibold text-trichomes-forest mb-2">
              Tracking Information
            </h3>
            <p className="text-sm text-trichomes-forest/60 font-body">
              Tracking Number:{" "}
              <span className="font-mono font-semibold text-trichomes-forest">
                {trackingInfo.trackingNumber}
              </span>
            </p>
            <p className="text-sm text-trichomes-forest/60 font-body">
              Carrier:{" "}
              <span className="font-medium text-trichomes-forest">
                {trackingInfo.carrier}
              </span>
            </p>
          </div>
          <div
            className={`px-4 py-2 rounded-lg font-medium text-sm ${getTrackingStatusColor(trackingInfo.status)} font-body`}
          >
            {formatTrackingStatus(trackingInfo.status)}
          </div>
        </div>

        {trackingInfo.estimatedDelivery && (
          <div className="mt-4 pt-4 border-t border-trichomes-forest/10">
            <p className="text-sm text-trichomes-forest/60 font-body">
              Estimated Delivery:{" "}
              <span className="font-medium text-trichomes-forest">
                {format(
                  new Date(trackingInfo.estimatedDelivery),
                  "EEEE, MMMM dd, yyyy",
                )}
              </span>
            </p>
          </div>
        )}
      </div>

      {/* Tracking Timeline */}
      <div className="bg-white p-6 rounded-xl border border-trichomes-forest/10 shadow-sm">
        <h3 className="text-lg font-heading font-semibold text-trichomes-forest mb-6">
          Tracking History
        </h3>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-trichomes-forest/20"></div>

          {/* Timeline events */}
          <div className="space-y-6">
            {trackingInfo.events.map((event) => (
              <div
                key={`${event.timestamp}-${event.status}`}
                className="relative flex items-start gap-4"
              >
                {/* Timeline dot */}
                <div
                  className={`relative z-10 flex-shrink-0 w-8 h-8 rounded-full border-4 border-white ${
                    event.status === "delivered"
                      ? "bg-green-500"
                      : event.status === "in_transit" ||
                          event.status === "out_for_delivery"
                        ? "bg-blue-500"
                        : event.status === "exception"
                          ? "bg-red-500"
                          : "bg-gray-400"
                  }`}
                >
                  {event.status === "delivered" && (
                    <svg
                      className="w-4 h-4 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <title>Delivered</title>
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>

                {/* Event details */}
                <div className="flex-1 pb-6">
                  <div className="flex items-start justify-between mb-1">
                    <p className="font-medium text-trichomes-forest font-body">
                      {event.description}
                    </p>
                    <p className="text-xs text-trichomes-forest/60 font-body whitespace-nowrap ml-4">
                      {format(new Date(event.timestamp), "MMM dd, yyyy")}
                    </p>
                  </div>
                  {event.location && (
                    <p className="text-sm text-trichomes-forest/60 font-body">
                      📍 {event.location}
                    </p>
                  )}
                  <p className="text-xs text-trichomes-forest/50 font-body mt-1">
                    {format(new Date(event.timestamp), "h:mm a")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Origin & Destination */}
      {(trackingInfo.origin || trackingInfo.destination) && (
        <div className="bg-white p-6 rounded-xl border border-trichomes-forest/10 shadow-sm">
          <h3 className="text-lg font-heading font-semibold text-trichomes-forest mb-4">
            Shipping Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {trackingInfo.origin && (
              <div>
                <h4 className="text-sm font-medium text-trichomes-forest/60 mb-2 font-body">
                  Origin
                </h4>
                <p className="text-sm text-trichomes-forest font-body">
                  {trackingInfo.origin}
                </p>
              </div>
            )}
            {trackingInfo.destination && (
              <div>
                <h4 className="text-sm font-medium text-trichomes-forest/60 mb-2 font-body">
                  Destination
                </h4>
                <p className="text-sm text-trichomes-forest font-body">
                  {trackingInfo.destination}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Last Updated */}
      <div className="text-center text-xs text-trichomes-forest/50 font-body">
        Last updated:{" "}
        {format(new Date(trackingInfo.lastUpdated), "MMM dd, yyyy h:mm a")}
      </div>
    </div>
  );
}

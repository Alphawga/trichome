"use client";

import { format } from "date-fns";

interface OrderDetailsCardProps {
  /** Order number */
  orderNumber: string;
  /** Order date */
  orderDate: Date | string;
  /** Order status */
  status: string;
  /** Payment status */
  paymentStatus: string;
  /** Payment method */
  paymentMethod?: string;
  /** Show full details */
  showFullDetails?: boolean;
}

/**
 * Reusable OrderDetailsCard component
 * Displays order details like order number, date, status, etc.
 */
export function OrderDetailsCard({
  orderNumber,
  orderDate,
  status,
  paymentStatus,
  paymentMethod,
  showFullDetails: _showFullDetails = true,
}: OrderDetailsCardProps) {
  const formatStatus = (status: string) => {
    return status
      .toLowerCase()
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return "bg-trichomes-primary/20 text-trichomes-primary";
      case "SHIPPED":
      case "PROCESSING":
        return "bg-trichomes-sage text-trichomes-forest";
      case "PENDING":
        return "bg-trichomes-gold/30 text-trichomes-forest";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-trichomes-forest/10 text-trichomes-forest";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "PENDING":
        return "bg-trichomes-gold/30 text-trichomes-forest";
      case "FAILED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-trichomes-forest/10 text-trichomes-forest";
    }
  };

  const date = typeof orderDate === "string" ? new Date(orderDate) : orderDate;

  return (
    <div className="bg-white p-6 sm:p-8 rounded-xl border border-trichomes-forest/10 shadow-sm">
      <h3 className="text-[18px] sm:text-[20px] font-heading font-semibold mb-4 sm:mb-6 text-trichomes-forest">
        Order Details
      </h3>

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <p className="text-[13px] sm:text-[14px] text-trichomes-forest/60 font-body">
              Order Number
            </p>
            <p className="text-[15px] sm:text-[16px] font-mono font-semibold text-trichomes-forest mt-1">
              {orderNumber}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span
              className={`px-3 py-1 text-[11px] sm:text-[12px] font-semibold rounded-full font-body ${getStatusColor(status)}`}
            >
              {formatStatus(status)}
            </span>
            <span
              className={`px-3 py-1 text-[11px] sm:text-[12px] font-semibold rounded-full font-body ${getPaymentStatusColor(paymentStatus)}`}
            >
              {formatStatus(paymentStatus)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-trichomes-forest/10">
          <div>
            <p className="text-[13px] sm:text-[14px] text-trichomes-forest/60 font-body">
              Order Date
            </p>
            <p className="text-[14px] sm:text-[15px] font-body text-trichomes-forest mt-1">
              {format(date, "dd MMMM yyyy, h:mm a")}
            </p>
          </div>

          {paymentMethod && (
            <div>
              <p className="text-[13px] sm:text-[14px] text-trichomes-forest/60 font-body">
                Payment Method
              </p>
              <p className="text-[14px] sm:text-[15px] font-body text-trichomes-forest mt-1">
                {formatStatus(paymentMethod)}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

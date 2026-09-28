import type { OrderStatus, PaymentStatus } from "@prisma/client";
import type { StatusVariant } from "@/components/ui/status-badge";

export interface AdminOrderItem {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  price: number;
  image: string;
}

export interface AdminOrder {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  items: AdminOrderItem[];
  subtotal: number;
  tax: number;
  shippingCost: number;
  discount: number;
  processingFee: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  orderDate: string;
  shippingAddress: string;
  trackingNumber?: string;
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  READY_FOR_PICKUP: "Ready for pickup",
  PICKED_UP: "Picked up",
  CANCELLED: "Cancelled",
  RETURNED: "Returned",
  REFUNDED: "Refunded",
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  PENDING: "Pending",
  PROCESSING: "Processing",
  COMPLETED: "Paid",
  FAILED: "Failed",
  CANCELLED: "Cancelled",
  REFUNDED: "Refunded",
  PARTIALLY_REFUNDED: "Partially refunded",
};

const terminalOrderStatuses = new Set<OrderStatus>([
  "DELIVERED",
  "PICKED_UP",
  "CANCELLED",
  "RETURNED",
  "REFUNDED",
]);

export function isTerminalOrderStatus(status: OrderStatus): boolean {
  return terminalOrderStatuses.has(status);
}

export function getOrderStatusVariant(status: OrderStatus): StatusVariant {
  if (status === "DELIVERED" || status === "PICKED_UP") return "success";
  if (status === "SHIPPED" || status === "READY_FOR_PICKUP") return "info";
  if (status === "CONFIRMED" || status === "PROCESSING") return "warning";
  if (
    status === "CANCELLED" ||
    status === "RETURNED" ||
    status === "REFUNDED"
  ) {
    return "danger";
  }
  return "neutral";
}

export function getPaymentStatusVariant(status: PaymentStatus): StatusVariant {
  if (status === "COMPLETED") return "success";
  if (status === "PENDING" || status === "PROCESSING") return "warning";
  if (status === "FAILED" || status === "CANCELLED") return "danger";
  if (status === "REFUNDED" || status === "PARTIALLY_REFUNDED") return "info";
  return "neutral";
}

export function formatNaira(value: number): string {
  return `₦${value.toLocaleString("en-NG", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

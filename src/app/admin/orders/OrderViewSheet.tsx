"use client";

import type { OrderStatus } from "@prisma/client";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { trpc } from "@/utils/trpc";

interface OrderItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
  image: string;
}

interface AdminOrder {
  id: string;
  dbId: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  total: number;
  status: "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
  paymentStatus: "Pending" | "Paid" | "Failed" | "Refunded";
  orderDate: string;
  shippingAddress: string;
  trackingNumber?: string;
}

interface OrderViewSheetProps {
  order: AdminOrder | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOrderUpdated?: () => void;
}

const statusOptions: { value: OrderStatus; label: string; color: string }[] = [
  { value: "PENDING", label: "Pending", color: "bg-gray-100 text-gray-800" },
  {
    value: "CONFIRMED",
    label: "Confirmed",
    color: "bg-blue-100 text-blue-800",
  },
  {
    value: "PROCESSING",
    label: "Processing",
    color: "bg-yellow-100 text-yellow-800",
  },
  { value: "SHIPPED", label: "Shipped", color: "bg-purple-100 text-purple-800" },
  {
    value: "DELIVERED",
    label: "Delivered",
    color: "bg-green-100 text-green-800",
  },
  {
    value: "CANCELLED",
    label: "Cancelled",
    color: "bg-red-100 text-red-800",
  },
];

export function OrderViewSheet({
  order,
  open,
  onOpenChange,
  onOrderUpdated,
}: OrderViewSheetProps) {
  const [showStatusUpdate, setShowStatusUpdate] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | "">("");
  const [statusNotes, setStatusNotes] = useState("");
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [showRefundConfirm, setShowRefundConfirm] = useState(false);
  const [refundReason, setRefundReason] = useState("");
  const [internalNotes, setInternalNotes] = useState("");
  const [showAddNotes, setShowAddNotes] = useState(false);

  const utils = trpc.useUtils();

  const updateStatusMutation = trpc.updateOrderStatus.useMutation({
    onSuccess: () => {
      toast.success("Order status updated successfully");
      setShowStatusUpdate(false);
      setSelectedStatus("");
      setStatusNotes("");
      utils.getOrders.invalidate();
      onOrderUpdated?.();
    },
    onError: (error) => {
      toast.error(`Failed to update status: ${error.message}`);
    },
  });

  const cancelOrderMutation = trpc.updateOrderStatus.useMutation({
    onSuccess: () => {
      toast.success("Order cancelled successfully");
      setShowCancelConfirm(false);
      setCancelReason("");
      utils.getOrders.invalidate();
      onOrderUpdated?.();
    },
    onError: (error) => {
      toast.error(`Failed to cancel order: ${error.message}`);
    },
  });

  const refundMutation = trpc.processRefund.useMutation({
    onSuccess: () => {
      toast.success("Refund processed successfully");
      setShowRefundConfirm(false);
      setRefundReason("");
      utils.getOrders.invalidate();
      onOrderUpdated?.();
    },
    onError: (error) => {
      toast.error(`Failed to process refund: ${error.message}`);
    },
  });

  const addNotesMutation = trpc.updateOrderStatus.useMutation({
    onSuccess: () => {
      toast.success("Notes added successfully");
      setShowAddNotes(false);
      setInternalNotes("");
    },
    onError: (error) => {
      toast.error(`Failed to add notes: ${error.message}`);
    },
  });

  if (!order) return null;

  const subtotal = order.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const tax = subtotal * 0.075; // 7.5% VAT
  const shipping = order.total - subtotal - tax;

  const handleUpdateStatus = () => {
    if (!selectedStatus || !order.dbId) return;
    updateStatusMutation.mutate({
      id: order.dbId,
      status: selectedStatus,
      notes: statusNotes || undefined,
    });
  };

  const handleCancelOrder = () => {
    if (!order.dbId) return;
    cancelOrderMutation.mutate({
      id: order.dbId,
      status: "CANCELLED",
      notes: cancelReason || "Order cancelled by admin",
    });
  };

  const handleRefund = () => {
    if (!order.dbId) return;
    // Note: processRefund needs paymentId, so user would need to have that
    // For now, we'll show an error if not available
    toast.info(
      "Refunds are processed through the Payments section. Navigate to Payments to process this refund.",
    );
    setShowRefundConfirm(false);
  };

  const handleAddNotes = () => {
    if (!internalNotes.trim() || !order.dbId) return;
    // We use updateOrderStatus with the current status to just add notes
    const currentDbStatus = mapDisplayStatusToDbStatus(order.status);
    addNotesMutation.mutate({
      id: order.dbId,
      status: currentDbStatus,
      notes: internalNotes,
    });
  };

  const mapDisplayStatusToDbStatus = (
    status: AdminOrder["status"],
  ): OrderStatus => {
    const map: Record<AdminOrder["status"], OrderStatus> = {
      Pending: "PENDING",
      Processing: "PROCESSING",
      Shipped: "SHIPPED",
      Delivered: "DELIVERED",
      Cancelled: "CANCELLED",
    };
    return map[status];
  };

  const canCancel =
    order.status === "Pending" || order.status === "Processing";
  const canRefund = order.paymentStatus === "Paid";

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-2xl p-0 overflow-y-auto">
          <SheetHeader className="p-6 border-b">
            <SheetTitle>Order Details</SheetTitle>
            <SheetDescription>
              View and manage order #{order.id}
            </SheetDescription>
          </SheetHeader>

          <div className="p-6 space-y-6">
            {/* Order Overview */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Order ID</p>
                  <p className="font-medium text-gray-900">#{order.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Order Date</p>
                  <p className="font-medium text-gray-900">{order.orderDate}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Order Status</p>
                  <span
                    className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${order.status === "Delivered"
                        ? "bg-green-100 text-green-800"
                        : order.status === "Shipped"
                          ? "bg-blue-100 text-blue-800"
                          : order.status === "Processing"
                            ? "bg-yellow-100 text-yellow-800"
                            : order.status === "Pending"
                              ? "bg-gray-100 text-gray-800"
                              : "bg-red-100 text-red-800"
                      }`}
                  >
                    {order.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Payment Status</p>
                  <span
                    className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${order.paymentStatus === "Paid"
                        ? "bg-green-100 text-green-800"
                        : order.paymentStatus === "Pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : order.paymentStatus === "Failed"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                      }`}
                  >
                    {order.paymentStatus}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3">Order Actions</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setShowStatusUpdate(!showStatusUpdate)}
                  className="px-3 py-2 text-sm font-medium bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  📋 Update Status
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddNotes(!showAddNotes)}
                  className="px-3 py-2 text-sm font-medium bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  📝 Add Notes
                </button>
                {canCancel && (
                  <button
                    type="button"
                    onClick={() => setShowCancelConfirm(true)}
                    className="px-3 py-2 text-sm font-medium bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    ❌ Cancel Order
                  </button>
                )}
                {canRefund && (
                  <button
                    type="button"
                    onClick={() => setShowRefundConfirm(true)}
                    className="px-3 py-2 text-sm font-medium bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors"
                  >
                    💰 Process Refund
                  </button>
                )}
              </div>

              {/* Status Update Form */}
              {showStatusUpdate && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-3">
                  <div>
                    <label
                      htmlFor="order-status-select"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      New Status
                    </label>
                    <select
                      id="order-status-select"
                      value={selectedStatus}
                      onChange={(e) =>
                        setSelectedStatus(e.target.value as OrderStatus)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#38761d] focus:border-[#38761d]"
                    >
                      <option value="">Select status...</option>
                      {statusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="status-notes"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Notes (optional)
                    </label>
                    <textarea
                      id="status-notes"
                      value={statusNotes}
                      onChange={(e) => setStatusNotes(e.target.value)}
                      rows={2}
                      placeholder="Add notes about this status change..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#38761d] focus:border-[#38761d]"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleUpdateStatus}
                      disabled={
                        !selectedStatus || updateStatusMutation.isPending
                      }
                      className="px-4 py-2 bg-[#38761d] text-white rounded-lg hover:bg-opacity-90 disabled:opacity-50 text-sm font-medium"
                    >
                      {updateStatusMutation.isPending
                        ? "Updating..."
                        : "Update Status"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowStatusUpdate(false);
                        setSelectedStatus("");
                        setStatusNotes("");
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Add Notes Form */}
              {showAddNotes && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-3">
                  <div>
                    <label
                      htmlFor="internal-notes"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Internal Notes
                    </label>
                    <textarea
                      id="internal-notes"
                      value={internalNotes}
                      onChange={(e) => setInternalNotes(e.target.value)}
                      rows={3}
                      placeholder="Add internal notes about this order..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#38761d] focus:border-[#38761d]"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Notes are stored in the order history and visible to staff
                      only.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleAddNotes}
                      disabled={
                        !internalNotes.trim() || addNotesMutation.isPending
                      }
                      className="px-4 py-2 bg-[#38761d] text-white rounded-lg hover:bg-opacity-90 disabled:opacity-50 text-sm font-medium"
                    >
                      {addNotesMutation.isPending ? "Adding..." : "Add Notes"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddNotes(false);
                        setInternalNotes("");
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Customer Information */}
            <div>
              <h3 className="text-lg font-semibold mb-3">
                Customer Information
              </h3>
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium text-gray-900">
                    {order.customerName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium text-gray-900">
                    {order.customerEmail}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Shipping Address</p>
                  <p className="font-medium text-gray-900">
                    {order.shippingAddress}
                  </p>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Order Items</h3>
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="relative w-16 h-16 flex-shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="rounded-md object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {item.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        Quantity: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        ₦{(item.price * item.quantity).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500">
                        ₦{item.price.toLocaleString()} each
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Order Summary</h3>
              <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">
                    ₦{subtotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax (7.5%)</span>
                  <span className="font-medium">₦{tax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">
                    ₦{shipping.toLocaleString()}
                  </span>
                </div>
                <div className="border-t pt-2 mt-2 flex justify-between">
                  <span className="text-lg font-semibold">Total</span>
                  <span className="text-lg font-bold text-[#38761d]">
                    ₦{order.total.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Tracking Information */}
            {order.trackingNumber && (
              <div>
                <h3 className="text-lg font-semibold mb-3">
                  Tracking Information
                </h3>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Tracking Number</p>
                  <p className="font-mono font-medium text-gray-900">
                    {order.trackingNumber}
                  </p>
                </div>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Cancel Order Confirm Dialog */}
      <ConfirmDialog
        open={showCancelConfirm}
        onOpenChange={(isOpen) => {
          setShowCancelConfirm(isOpen);
          if (!isOpen) setCancelReason("");
        }}
        title="Cancel Order"
        description={
          <div className="space-y-3">
            <p>
              Are you sure you want to cancel order #{order.id}? This action
              cannot be undone.
            </p>
            <div>
              <label
                htmlFor="cancel-reason"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Cancellation Reason
              </label>
              <textarea
                id="cancel-reason"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={2}
                placeholder="Reason for cancellation..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
              />
            </div>
          </div>
        }
        confirmLabel="Cancel Order"
        cancelLabel="Go Back"
        onConfirm={handleCancelOrder}
        isLoading={cancelOrderMutation.isPending}
        variant="danger"
      />

      {/* Process Refund Confirm Dialog */}
      <ConfirmDialog
        open={showRefundConfirm}
        onOpenChange={(isOpen) => {
          setShowRefundConfirm(isOpen);
          if (!isOpen) setRefundReason("");
        }}
        title="Process Refund"
        description={
          <div className="space-y-3">
            <p>
              Process a refund for order #{order.id}? Total amount: ₦
              {order.total.toLocaleString()}
            </p>
            <div>
              <label
                htmlFor="refund-reason"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Refund Reason
              </label>
              <textarea
                id="refund-reason"
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                rows={2}
                placeholder="Reason for refund..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
            <p className="text-sm text-gray-500">
              Note: Refunds are processed through your payment provider. This
              will redirect you to the Payments section.
            </p>
          </div>
        }
        confirmLabel="Process Refund"
        cancelLabel="Go Back"
        onConfirm={handleRefund}
        isLoading={refundMutation.isPending}
        variant="danger"
      />
    </>
  );
}

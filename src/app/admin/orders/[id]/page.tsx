"use client";

import type { OrderStatus } from "@prisma/client";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/utils/trpc";

export default function OrderViewPage() {
  const router = useRouter();
  const params = useParams();
  const orderNumber = params.id as string;

  const [status, setStatus] = useState<OrderStatus | "">("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isUpdatingTracking, setIsUpdatingTracking] = useState(false);
  const [showTrackingInput, setShowTrackingInput] = useState(false);

  // Fetch order data
  const orderQuery = trpc.getOrderByNumber.useQuery(
    { orderNumber },
    {
      enabled: !!orderNumber,
      onSuccess: (data) => {
        setStatus(data.status);
        setTrackingNumber(data.tracking_number || "");
      },
    },
  );

  // Update status mutation
  const updateStatusMutation = trpc.updateOrderStatus.useMutation({
    onSuccess: () => {
      orderQuery.refetch();
      toast.success("Order status updated successfully");
      setIsUpdatingStatus(false);
    },
    onError: (error) => {
      toast.error(`Failed to update status: ${error.message}`);
      setIsUpdatingStatus(false);
    },
  });

  // Update tracking number mutation
  const updateTrackingMutation = trpc.updateTrackingNumber.useMutation({
    onSuccess: () => {
      orderQuery.refetch();
      toast.success("Tracking number updated successfully");
      setIsUpdatingTracking(false);
      setShowTrackingInput(false);
    },
    onError: (error) => {
      toast.error(`Failed to update tracking number: ${error.message}`);
      setIsUpdatingTracking(false);
    },
  });

  const handleStatusUpdate = async () => {
    if (!orderQuery.data || !status || status === orderQuery.data.status) {
      return;
    }

    setIsUpdatingStatus(true);
    try {
      await updateStatusMutation.mutateAsync({
        id: orderQuery.data.id,
        status: status as OrderStatus,
        notes: `Status changed to ${status}`,
      });
    } catch (_error) {
      // Error handled in mutation
    }
  };

  const handleTrackingUpdate = async () => {
    if (!orderQuery.data || !trackingNumber.trim()) {
      return;
    }

    setIsUpdatingTracking(true);
    try {
      await updateTrackingMutation.mutateAsync({
        id: orderQuery.data.id,
        trackingNumber: trackingNumber.trim(),
      });
    } catch (_error) {
      // Error handled in mutation
    }
  };

  const cancelOrderMutation = trpc.cancelOrder.useMutation({
    onSuccess: () => {
      orderQuery.refetch();
      toast.success("Order cancelled successfully");
    },
    onError: (error) => {
      toast.error(`Failed to cancel order: ${error.message}`);
    },
  });

  const handleCancelOrder = async () => {
    if (!orderQuery.data) return;

    const reason = prompt("Please provide a reason for cancellation:");
    if (!reason) return;

    await cancelOrderMutation.mutateAsync({
      id: orderQuery.data.id,
      reason,
    });
  };

  const handleBack = () => {
    router.push("/admin/orders");
  };

  const statusOptions: OrderStatus[] = [
    "PENDING",
    "CONFIRMED",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
  ];

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case "DELIVERED":
        return "bg-green-100 text-green-800";
      case "SHIPPED":
        return "bg-blue-100 text-blue-800";
      case "PROCESSING":
      case "CONFIRMED":
        return "bg-yellow-100 text-yellow-800";
      case "PENDING":
        return "bg-gray-100 text-gray-800";
      case "CANCELLED":
      case "RETURNED":
      case "REFUNDED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: OrderStatus) => {
    const labels: Record<OrderStatus, string> = {
      PENDING: "Pending",
      CONFIRMED: "Confirmed",
      PROCESSING: "Processing",
      SHIPPED: "Shipped",
      DELIVERED: "Delivered",
      CANCELLED: "Cancelled",
      RETURNED: "Returned",
      REFUNDED: "Refunded",
    };
    return labels[status] || status;
  };

  if (orderQuery.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#38761d] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (orderQuery.error || !orderQuery.data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 mb-4">
            {orderQuery.error?.message || "Order not found"}
          </p>
          <button
            type="button"
            onClick={handleBack}
            className="px-4 py-2 bg-[#38761d] text-white rounded-lg hover:bg-opacity-90"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  const order = orderQuery.data;
  const customerName = order.user
    ? `${order.user.first_name || ""} ${order.user.last_name || ""}`.trim() ||
      "No name"
    : `${order.first_name} ${order.last_name}`;
  const customerEmail = order.user?.email || order.email;
  const shippingAddress = order.shipping_address
    ? `${order.shipping_address.address_1}${order.shipping_address.address_2 ? `, ${order.shipping_address.address_2}` : ""}, ${order.shipping_address.city}, ${order.shipping_address.state}, ${order.shipping_address.country}`
    : "No address provided";

  return (
    <div>
      <div className="flex items-center mb-6">
        <button
          type="button"
          onClick={handleBack}
          className="text-gray-500 hover:text-gray-800 mr-4 text-2xl"
        >
          ←
        </button>
        <h1 className="text-2xl font-bold">Order Details</h1>
        <span className="ml-4 text-lg text-gray-500 font-medium">
          #{order.order_number}
        </span>
        <span
          className={`ml-4 px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(order.status)}`}
        >
          {getStatusLabel(order.status)}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-lg border">
            <h2 className="text-lg font-bold mb-4">
              Items in Order ({order.items.length})
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b">
                    <th className="p-2 font-semibold text-sm">Product</th>
                    <th className="p-2 font-semibold text-sm">SKU</th>
                    <th className="p-2 font-semibold text-sm">Quantity</th>
                    <th className="p-2 font-semibold text-sm">Price</th>
                    <th className="p-2 font-semibold text-sm text-right">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item) => (
                    <tr key={item.id} className="border-b last:border-0">
                      <td className="p-2">
                        <div className="flex items-center gap-3">
                          {item.product?.images?.[0] && (
                            <div className="relative w-12 h-12 shrink-0">
                              <Image
                                src={item.product.images[0].url}
                                alt={item.product_name}
                                fill
                                className="rounded-md object-cover"
                              />
                            </div>
                          )}
                          <div>
                            <p className="font-medium">{item.product_name}</p>
                            {item.product && (
                              <Link
                                href={`/products/${item.product.id}`}
                                className="text-sm text-[#40702A] hover:underline"
                              >
                                View Product
                              </Link>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-2">
                        <span className="text-sm text-gray-500">
                          {item.product_sku}
                        </span>
                      </td>
                      <td className="p-2">{item.quantity}</td>
                      <td className="p-2">
                        ₦{Number(item.price).toLocaleString()}
                      </td>
                      <td className="p-2 text-right font-medium">
                        ₦{Number(item.total).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="text-right mt-4 pr-2 border-t pt-4">
              <p className="text-gray-600">
                Subtotal:{" "}
                <span className="font-medium text-black">
                  ₦{Number(order.subtotal).toLocaleString()}
                </span>
              </p>
              {order.tax > 0 && (
                <p className="text-gray-600">
                  Tax:{" "}
                  <span className="font-medium text-black">
                    ₦{Number(order.tax).toLocaleString()}
                  </span>
                </p>
              )}
              <p className="text-gray-600">
                Shipping:{" "}
                <span className="font-medium text-black">
                  ₦{Number(order.shipping_cost).toLocaleString()}
                </span>
              </p>
              {order.discount > 0 && (
                <p className="text-gray-600">
                  Discount:{" "}
                  <span className="font-medium text-green-600">
                    -₦{Number(order.discount).toLocaleString()}
                  </span>
                </p>
              )}
              <p className="font-bold text-lg mt-2">
                Total:{" "}
                <span className="text-black">
                  ₦{Number(order.total).toLocaleString()}
                </span>
              </p>
            </div>
          </div>

          {/* Order Timeline */}
          {order.status_history && order.status_history.length > 0 && (
            <div className="bg-white p-6 rounded-lg border mt-6">
              <h2 className="text-lg font-bold mb-4">Order Timeline</h2>
              <div className="space-y-4">
                {order.status_history.map((history, index) => (
                  <div key={history.id} className="flex items-start">
                    <div
                      className={`w-3 h-3 rounded-full mt-2 mr-4 ${
                        index === 0
                          ? "bg-green-500"
                          : index === 1
                            ? "bg-blue-500"
                            : "bg-gray-400"
                      }`}
                    ></div>
                    <div>
                      <p className="font-medium">
                        {getStatusLabel(history.status)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(history.created_at).toLocaleString()}
                      </p>
                      {history.notes && (
                        <p className="text-sm text-gray-400 mt-1">
                          {history.notes}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          {/* Customer Details */}
          <div className="bg-white p-6 rounded-lg border mb-6">
            <h2 className="text-lg font-bold mb-4">Customer Details</h2>
            <div className="space-y-3">
              <div>
                <p className="font-medium">{customerName}</p>
                {order.user && (
                  <p className="text-sm text-gray-600">ID: {order.user.id.slice(0, 8)}</p>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-600">Email:</p>
                <p className="font-medium">{customerEmail}</p>
              </div>
              {order.phone && (
                <div>
                  <p className="text-sm text-gray-600">Phone:</p>
                  <p className="font-medium">{order.phone}</p>
                </div>
              )}
              {order.user && (
                <div className="pt-2">
                  <Link
                    href={`/admin/customers?search=${encodeURIComponent(customerEmail)}`}
                    className="text-[#40702A] hover:text-[#1E3024] text-sm font-medium"
                  >
                    View Customer Profile →
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white p-6 rounded-lg border mb-6">
            <h2 className="text-lg font-bold mb-4">Shipping Address</h2>
            <p className="text-gray-700 leading-relaxed">{shippingAddress}</p>
          </div>

          {/* Tracking Number */}
          <div className="bg-white p-6 rounded-lg border mb-6">
            <h2 className="text-lg font-bold mb-4">Tracking Number</h2>
            {order.tracking_number ? (
              <div>
                <p className="font-mono font-medium text-gray-900 mb-3">
                  {order.tracking_number}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setTrackingNumber(order.tracking_number || "");
                    setShowTrackingInput(true);
                  }}
                  className="text-sm text-[#40702A] hover:text-[#1E3024] font-medium"
                >
                  Update Tracking Number
                </button>
              </div>
            ) : (
              <p className="text-gray-500 text-sm mb-3">No tracking number</p>
            )}
            {showTrackingInput && (
              <div className="mt-3 space-y-2">
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Enter tracking number"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 outline-none"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleTrackingUpdate}
                    disabled={isUpdatingTracking || !trackingNumber.trim()}
                    className="flex-1 px-4 py-2 bg-[#38761d] text-white rounded-lg hover:bg-opacity-90 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                  >
                    {isUpdatingTracking ? "Updating..." : "Save"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowTrackingInput(false);
                      setTrackingNumber(order.tracking_number || "");
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
            {!showTrackingInput && !order.tracking_number && (
              <button
                type="button"
                onClick={() => setShowTrackingInput(true)}
                className="text-sm text-[#40702A] hover:text-[#1E3024] font-medium"
              >
                Add Tracking Number
              </button>
            )}
          </div>

          {/* Update Status */}
          <div className="bg-white p-6 rounded-lg border">
            <h2 className="text-lg font-bold mb-4">Update Status</h2>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as OrderStatus)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 mb-4"
            >
              {statusOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {getStatusLabel(opt)}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleStatusUpdate}
              disabled={
                isUpdatingStatus || !status || status === order.status
              }
              className="w-full px-6 py-2 border border-transparent rounded-lg bg-[#38761d] text-white hover:bg-opacity-90 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isUpdatingStatus ? "Updating..." : "Update Order"}
            </button>

            {status && status !== order.status && (
              <p className="text-sm text-gray-600 mt-2">
                Status will change from "{getStatusLabel(order.status)}" to "
                {getStatusLabel(status)}"
              </p>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white p-6 rounded-lg border mt-6">
            <h2 className="text-lg font-bold mb-4">Quick Actions</h2>
            <div className="space-y-3">
              {order.tracking_number && (
                <button
                  type="button"
                  onClick={() => {
                    window.location.href = `mailto:${customerEmail}?subject=Order ${order.order_number} Tracking&body=Your order ${order.order_number} tracking number is: ${order.tracking_number}`;
                  }}
                  className="w-full text-left px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Send Tracking Email
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  toast.info("Print shipping label feature coming soon");
                }}
                className="w-full text-left px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Print Shipping Label
              </button>
              <button
                type="button"
                onClick={() => {
                  toast.info("Generate invoice feature coming soon");
                }}
                className="w-full text-left px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Generate Invoice
              </button>
              {order.status !== "CANCELLED" &&
                order.status !== "DELIVERED" &&
                order.status !== "REFUNDED" && (
                  <button
                    type="button"
                    onClick={handleCancelOrder}
                    className="w-full text-left px-4 py-2 text-sm border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    Cancel Order
                  </button>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

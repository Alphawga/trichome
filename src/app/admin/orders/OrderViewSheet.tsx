"use client";

import Image from "next/image";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface OrderItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
  image: string;
}

interface AdminOrder {
  id: string;
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
}

export function OrderViewSheet({
  order,
  open,
  onOpenChange,
}: OrderViewSheetProps) {
  if (!order) return null;

  const subtotal = order.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const tax = subtotal * 0.075; // 7.5% VAT
  const shipping = order.total - subtotal - tax;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl p-0 overflow-y-auto">
        <SheetHeader className="p-6 border-b">
          <SheetTitle>Order Details</SheetTitle>
          <SheetDescription>
            View complete order information and status
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
                  className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                    order.status === "Delivered"
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
                  className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                    order.paymentStatus === "Paid"
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

          {/* Customer Information */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Customer Information</h3>
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
  );
}

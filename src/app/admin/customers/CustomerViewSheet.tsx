"use client";

import type { Address, User } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";

import { LogoLoader } from "@/components/ui/logo-loader";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { trpc } from "@/utils/trpc";

type Customer = Pick<
  User,
  | "id"
  | "email"
  | "first_name"
  | "last_name"
  | "phone"
  | "status"
  | "image"
  | "created_at"
  | "last_login_at"
> & {
  totalOrders: number;
  totalSpent: number;
  lastOrderDate?: Date;
  loyaltyPoints: number;
  addresses: Array<Pick<Address, "city" | "state" | "country">>;
};

interface CustomerViewSheetProps {
  customer: Customer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CustomerViewSheet({
  customer,
  open,
  onOpenChange,
}: CustomerViewSheetProps) {
  // Fetch full customer data with orders when sheet is open
  const customerDetailQuery = trpc.getUserById.useQuery(
    { id: customer?.id || "" },
    {
      enabled: !!customer?.id && open,
    },
  );

  if (!customer) return null;

  const location = customer.addresses[0]
    ? `${customer.addresses[0].city}, ${customer.addresses[0].state}, ${customer.addresses[0].country}`
    : "N/A";

  const statusStyles = {
    ACTIVE: "bg-green-100 text-green-800",
    PENDING_VERIFICATION: "bg-yellow-100 text-yellow-800",
    SUSPENDED: "bg-red-100 text-red-800",
    INACTIVE: "bg-gray-100 text-gray-800",
  };

  const fullCustomerData = customerDetailQuery.data;
  const recentOrders = fullCustomerData?.orders || [];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl p-0 overflow-y-auto">
        <SheetHeader className="p-6 border-b">
          <SheetTitle>Customer Details</SheetTitle>
          <SheetDescription>
            View complete customer information and activity
          </SheetDescription>
        </SheetHeader>

        <div className="p-6 space-y-6">
          {/* Customer Overview */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-4 mb-4">
              <div className="relative w-20 h-20 rounded-full overflow-hidden bg-gray-200">
                <Image
                  src={
                    customer.image ||
                    `https://placehold.co/80x80/38761d/white?text=${encodeURIComponent(
                      Array.from(customer.first_name || "")[0] || "U",
                    )}`
                  }
                  alt={`${customer.first_name} ${customer.last_name}`}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {customer.first_name} {customer.last_name}
                </h3>
                <p className="text-sm text-gray-500">
                  Customer ID: {customer.id.slice(0, 8)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <span
                  className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${statusStyles[customer.status]}`}
                >
                  {customer.status.replace("_", " ")}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Member Since</p>
                <p className="font-medium text-gray-900">
                  {new Date(customer.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Last Login</p>
                <p className="font-medium text-gray-900">
                  {customer.last_login_at
                    ? new Date(customer.last_login_at).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      },
                    )
                    : "Never"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Loyalty Points</p>
                <p className="font-medium text-[#38761d]">
                  {customer.loyaltyPoints.toLocaleString()} pts
                </p>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Contact Information</h3>
            <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <a
                  href={`mailto:${customer.email}`}
                  className="font-medium text-blue-600 hover:underline"
                >
                  {customer.email}
                </a>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium text-gray-900">
                  {customer.phone || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p className="font-medium text-gray-900">{location}</p>
              </div>
            </div>
          </div>

          {/* Purchase Statistics */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Purchase Statistics</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Total Orders</p>
                <p className="text-2xl font-bold text-blue-600">
                  {customer.totalOrders}
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Total Spent</p>
                <p className="text-2xl font-bold text-green-600">
                  ₦{customer.totalSpent.toLocaleString()}
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg col-span-2">
                <p className="text-sm text-gray-600 mb-1">
                  Average Order Value
                </p>
                <p className="text-2xl font-bold text-purple-600">
                  ₦
                  {customer.totalOrders > 0
                    ? (
                      customer.totalSpent / customer.totalOrders
                    ).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })
                    : "0.00"}
                </p>
              </div>
            </div>
          </div>

          {/* Recent Orders */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Recent Orders</h3>
              <Link
                href={`/admin/orders?search=${encodeURIComponent(customer.email)}`}
                className="text-sm text-[#38761d] hover:underline"
              >
                View All Orders →
              </Link>
            </div>

            {customerDetailQuery.isLoading ? (
              <div className="flex justify-center py-8">
                <LogoLoader size="sm" text="Loading orders..." />
              </div>
            ) : recentOrders.length > 0 ? (
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        #{order.order_number}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        ₦{Number(order.total).toLocaleString()}
                      </p>
                      <span
                        className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full ${order.status === "DELIVERED"
                          ? "bg-green-100 text-green-800"
                          : order.status === "SHIPPED"
                            ? "bg-blue-100 text-blue-800"
                            : order.status === "PROCESSING"
                              ? "bg-yellow-100 text-yellow-800"
                              : order.status === "CANCELLED"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800"
                          }`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                <p>No orders yet</p>
              </div>
            )}
          </div>

          {/* Customer Tier */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Customer Tier</h3>
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg border border-yellow-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Current Tier</p>
                  <p className="text-xl font-bold text-orange-600">
                    {customer.totalSpent >= 500000
                      ? "Platinum"
                      : customer.totalSpent >= 200000
                        ? "Gold"
                        : customer.totalSpent >= 50000
                          ? "Silver"
                          : "Bronze"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Lifetime Value</p>
                  <p className="text-xl font-bold text-[#38761d]">
                    ₦{customer.totalSpent.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

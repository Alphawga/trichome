"use client";

import type {
  Address,
  Order,
  OrderStatus,
  PaymentStatus,
  OrderItem as PrismaOrderItem,
  User,
} from "@prisma/client";
import {
  Banknote,
  ClipboardList,
  Clock3,
  Eye,
  MoreVertical,
  Plus,
  Settings2,
  Truck,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/app/contexts/auth-context";
import { type Column, DataTable } from "@/components/ui/data-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ExportIcon, SearchIcon } from "@/components/ui/icons";
import { StatusBadge } from "@/components/ui/status-badge";
import { type CSVColumn, exportToCSV } from "@/utils/csv-export";
import { trpc } from "@/utils/trpc";
import { CreateOrderSheet } from "./CreateOrderSheet";
import { OrderViewSheet } from "./OrderViewSheet";
import {
  type AdminOrder,
  getOrderStatusVariant,
  getPaymentStatusVariant,
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
} from "./order-display";

type OrderWithRelations = Order & {
  user: Pick<User, "id" | "email" | "first_name" | "last_name"> | null;
  items: Array<
    PrismaOrderItem & {
      product: {
        id: string;
        name: string;
        slug: string;
        images: Array<{ url: string }>;
      };
    }
  >;
  shipping_address: Address | null;
};

const transformOrder = (order: OrderWithRelations): AdminOrder => {
  const customerEmail = order.user?.email || order.email;
  const customerName = order.user
    ? [order.user.first_name, order.user.last_name].filter(Boolean).join(" ") ||
      customerEmail
    : `${order.first_name} ${order.last_name}`.trim();

  const shippingAddress = order.shipping_address
    ? `${order.shipping_address.address_1}${order.shipping_address.address_2 ? `, ${order.shipping_address.address_2}` : ""}, ${order.shipping_address.city}, ${order.shipping_address.state}, ${order.shipping_address.country}`
    : "No address provided";

  return {
    id: order.order_number,
    customerName,
    customerEmail,
    customerPhone: order.phone || order.shipping_address?.phone || null,
    items: order.items.map((item) => ({
      id: item.id,
      name: item.product_name,
      sku: item.product_sku,
      quantity: item.quantity,
      price: Number(item.price),
      image:
        item.product.images[0]?.url ||
        "https://placehold.co/50x50/38761d/white?text=P",
    })),
    subtotal: Number(order.subtotal),
    tax: Number(order.tax),
    shippingCost: Number(order.shipping_cost),
    discount: Number(order.discount),
    processingFee: Number(order.processing_fee),
    total: Number(order.total),
    status: order.status,
    paymentStatus: order.payment_status,
    orderDate: new Date(order.created_at).toLocaleDateString("en-NG", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }),
    shippingAddress,
    trackingNumber: order.tracking_number || undefined,
  };
};

export default function AdminOrdersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get("status") as OrderStatus | null;
  const { isAdmin } = useAuth();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "All">(
    initialStatus || "All",
  );
  const [paymentFilter, setPaymentFilter] = useState<PaymentStatus | "All">(
    "All",
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [viewSheetOpen, setViewSheetOpen] = useState(false);
  const [viewingOrder, setViewingOrder] = useState<AdminOrder | null>(null);
  const [createSheetOpen, setCreateSheetOpen] = useState(false);

  // Update filter when URL params change
  useEffect(() => {
    if (initialStatus) {
      setStatusFilter(initialStatus);
    }
  }, [initialStatus]);

  // Fetch orders from database
  const ordersQuery = trpc.getOrders.useQuery(
    {
      page: currentPage,
      limit: 10,
      status: statusFilter !== "All" ? statusFilter : undefined,
      payment_status: paymentFilter !== "All" ? paymentFilter : undefined,
      search: searchTerm || undefined,
    },
    {
      refetchOnWindowFocus: false,
    },
  );

  // Fetch order statistics
  const statsQuery = trpc.getOrderStats.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  const orders = ordersQuery.data?.orders || [];
  const stats = statsQuery.data;

  // Transform database orders to AdminOrder format
  const transformedOrders = orders.map(transformOrder);

  const handleViewOrder = (id: string) => {
    const order = transformedOrders.find((o) => o.id === id);
    if (order) {
      setViewingOrder(order);
      setViewSheetOpen(true);
    }
  };

  const handleManageOrder = (id: string) => {
    router.push(`/admin/orders/${encodeURIComponent(id)}`);
  };

  const handleTrackOrder = (order: AdminOrder) => {
    if (order.trackingNumber) {
      // Open tracking in new window (you could integrate with a specific carrier)
      window.open(
        `https://track.aftership.com/${encodeURIComponent(order.trackingNumber)}`,
        "_blank",
        "noopener,noreferrer",
      );
    } else {
      toast.info("No tracking number available for this order");
    }
  };

  const handleExportCSV = () => {
    const columns: CSVColumn<AdminOrder>[] = [
      { key: "id", label: "Order ID" },
      { key: "customerName", label: "Customer Name" },
      { key: "customerEmail", label: "Customer Email" },
      { key: (o) => o.customerPhone || "N/A", label: "Customer Phone" },
      { key: (o) => o.items.length, label: "Items Count" },
      { key: (o) => o.total.toLocaleString(), label: "Total (₦)" },
      { key: (o) => ORDER_STATUS_LABELS[o.status], label: "Order Status" },
      {
        key: (o) => PAYMENT_STATUS_LABELS[o.paymentStatus],
        label: "Payment Status",
      },
      { key: "orderDate", label: "Order Date" },
      { key: (o) => o.trackingNumber || "N/A", label: "Tracking Number" },
    ];
    exportToCSV(transformedOrders, columns, "orders");
    toast.success("Orders exported to CSV");
  };

  const statuses: Array<OrderStatus | "All"> = [
    "All",
    "PENDING",
    "CONFIRMED",
    "PROCESSING",
    "SHIPPED",
    "READY_FOR_PICKUP",
    "PICKED_UP",
    "DELIVERED",
    "RETURNED",
    "CANCELLED",
    "REFUNDED",
  ];
  const paymentStatuses: Array<PaymentStatus | "All"> = [
    "All",
    "PENDING",
    "PROCESSING",
    "COMPLETED",
    "FAILED",
    "CANCELLED",
    "REFUNDED",
    "PARTIALLY_REFUNDED",
  ];

  const statusLabels: Record<OrderStatus | "All", string> = {
    All: "All Status",
    ...ORDER_STATUS_LABELS,
  };

  const paymentLabels: Record<PaymentStatus | "All", string> = {
    All: "All Payment",
    ...PAYMENT_STATUS_LABELS,
  };

  // Define table columns
  const columns: Column<AdminOrder>[] = [
    {
      header: "Order ID",
      cell: (order) => (
        <div>
          <Link
            href={`/admin/orders/${encodeURIComponent(order.id)}`}
            className="font-semibold text-gray-950 hover:text-[#40702A] hover:underline"
          >
            #{order.id}
          </Link>
          <p className="text-sm text-gray-500">{order.orderDate}</p>
        </div>
      ),
    },
    {
      header: "Customer",
      cell: (order) => (
        <div>
          <span className="font-medium text-gray-900">
            {order.customerName}
          </span>
          <p className="text-sm text-gray-500">{order.customerEmail}</p>
        </div>
      ),
    },
    {
      header: "Items",
      cell: (order) => (
        <div>
          <span className="text-gray-900">
            {order.items.length} item{order.items.length > 1 ? "s" : ""}
          </span>
          <p className="text-sm text-gray-500">
            {order.items
              .slice(0, 2)
              .map((item) => item.name)
              .join(", ")}
            {order.items.length > 2 && ` +${order.items.length - 2} more`}
          </p>
        </div>
      ),
    },
    {
      header: "Total",
      cell: (order) => (
        <span className="text-gray-900 font-medium">
          ₦{order.total.toLocaleString()}
        </span>
      ),
    },
    {
      header: "Order Status",
      cell: (order) => (
        <StatusBadge variant={getOrderStatusVariant(order.status)}>
          {ORDER_STATUS_LABELS[order.status]}
        </StatusBadge>
      ),
    },
    {
      header: "Payment",
      cell: (order) => (
        <StatusBadge variant={getPaymentStatusVariant(order.paymentStatus)}>
          {PAYMENT_STATUS_LABELS[order.paymentStatus]}
        </StatusBadge>
      ),
    },
    {
      header: "Actions",
      className: "w-20",
      cell: (order) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="rounded-md p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#40702A]"
              aria-label={`Open actions for order ${order.id}`}
            >
              <MoreVertical className="size-5" aria-hidden="true" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem
              onClick={() => handleViewOrder(order.id)}
              className="cursor-pointer"
            >
              <Eye className="mr-2 size-4" aria-hidden="true" />
              Preview
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleManageOrder(order.id)}
              className="cursor-pointer"
            >
              <Settings2 className="mr-2 size-4" aria-hidden="true" />
              Manage order
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => handleTrackOrder(order)}
              className="cursor-pointer"
            >
              <Truck className="mr-2 size-4" aria-hidden="true" />
              Track shipment
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Orders Management
          </h1>
          <p className="text-gray-600">Track and manage customer orders</p>
        </div>
        {isAdmin && (
          <button
            type="button"
            onClick={() => setCreateSheetOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-[#38761d] px-4 py-2 font-medium text-white transition-colors hover:bg-[#2f6518]"
          >
            <Plus className="size-4" aria-hidden="true" />
            Create order
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {statsQuery.isLoading ? (
          [1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-lg border border-gray-200 animate-pulse"
            >
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-200 rounded-lg" />
                <div className="ml-4 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
                  <div className="h-8 bg-gray-200 rounded w-16" />
                </div>
              </div>
            </div>
          ))
        ) : stats ? (
          <>
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <div className="rounded-lg bg-blue-50 p-2.5 text-blue-700">
                  <ClipboardList className="size-5" aria-hidden="true" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Total Orders</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <div className="rounded-lg bg-amber-50 p-2.5 text-amber-700">
                  <Clock3 className="size-5" aria-hidden="true" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Pending Orders</p>
                  <p className="text-2xl font-bold">{stats.pending}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <div className="rounded-lg bg-emerald-50 p-2.5 text-emerald-700">
                  <Banknote className="size-5" aria-hidden="true" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Total Revenue</p>
                  <p className="text-2xl font-bold">
                    ₦{Number(stats.revenue).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <div className="rounded-lg bg-violet-50 p-2.5 text-violet-700">
                  <Truck className="size-5" aria-hidden="true" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Shipped Orders</p>
                  <p className="text-2xl font-bold">{stats.shipped}</p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="col-span-4 text-center py-8 text-gray-500">
            Failed to load order statistics
          </div>
        )}
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search orders, customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 outline-none"
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <SearchIcon />
            </div>
          </div>

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as OrderStatus | "All")
            }
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 outline-none"
          >
            {statuses.map((status) => (
              <option key={status} value={status}>
                {statusLabels[status]}
              </option>
            ))}
          </select>

          <select
            value={paymentFilter}
            onChange={(e) =>
              setPaymentFilter(e.target.value as PaymentStatus | "All")
            }
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 outline-none"
          >
            {paymentStatuses.map((status) => (
              <option key={status} value={status}>
                {paymentLabels[status]}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 font-medium transition-colors"
          >
            <ExportIcon /> Export CSV
          </button>
        </div>
      </div>

      {/* Orders Table with Pagination */}
      <DataTable
        columns={columns}
        data={transformedOrders}
        isLoading={ordersQuery.isLoading}
        error={ordersQuery.error}
        onRetry={() => ordersQuery.refetch()}
        emptyMessage="No orders found matching your filters"
        keyExtractor={(order) => order.id}
        pagination={ordersQuery.data?.pagination}
        onPageChange={(page) => setCurrentPage(page)}
      />

      {/* Order View Sheet */}
      <OrderViewSheet
        order={viewingOrder}
        open={viewSheetOpen}
        onOpenChange={setViewSheetOpen}
      />

      {/* Create Order Sheet */}
      <CreateOrderSheet
        open={createSheetOpen}
        onOpenChange={setCreateSheetOpen}
        onSuccess={() => {
          ordersQuery.refetch();
          statsQuery.refetch();
        }}
      />
    </div>
  );
}

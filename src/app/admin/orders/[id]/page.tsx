"use client";

import {
  ArrowLeft,
  CalendarDays,
  Copy,
  CreditCard,
  Mail,
  MapPin,
  MoreHorizontal,
  NotebookPen,
  Package,
  Phone,
  Truck,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/app/contexts/auth-context";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CloudinaryImage as Image } from "@/components/ui/cloudinary-image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatusBadge } from "@/components/ui/status-badge";
import { trpc } from "@/utils/trpc";
import {
  AddNoteDialog,
  CancelOrderDialog,
  TrackingDialog,
  UpdateStatusDialog,
} from "../OrderActionDialogs";
import { OrderErrorState, OrderLoadingState } from "../OrderPageStates";
import {
  formatNaira,
  getOrderStatusVariant,
  getPaymentStatusVariant,
  isTerminalOrderStatus,
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
} from "../order-display";

export default function OrderManagementPage() {
  const router = useRouter();
  const params = useParams();
  const orderNumber = params.id as string;
  const { hasPermission } = useAuth();
  const utils = trpc.useUtils();

  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [trackingDialogOpen, setTrackingDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  const orderQuery = trpc.getOrderByNumber.useQuery(
    { orderNumber },
    { enabled: Boolean(orderNumber) },
  );

  const refreshOrder = () => {
    void orderQuery.refetch();
    void utils.getOrders.invalidate();
    void utils.getOrderStats.invalidate();
  };

  const updateStatusMutation = trpc.updateOrderStatus.useMutation({
    onSuccess: () => {
      toast.success("Order status updated");
      setStatusDialogOpen(false);
      refreshOrder();
    },
    onError: (error) =>
      toast.error(`Could not update status: ${error.message}`),
  });

  const addNoteMutation = trpc.updateOrderStatus.useMutation({
    onSuccess: () => {
      toast.success("Internal note added");
      setNoteDialogOpen(false);
      refreshOrder();
    },
    onError: (error) => toast.error(`Could not add note: ${error.message}`),
  });

  const trackingMutation = trpc.updateTrackingNumber.useMutation({
    onSuccess: () => {
      toast.success("Tracking number updated");
      setTrackingDialogOpen(false);
      refreshOrder();
    },
    onError: (error) =>
      toast.error(`Could not update tracking: ${error.message}`),
  });

  const cancelMutation = trpc.cancelOrder.useMutation({
    onSuccess: () => {
      toast.success("Order cancelled");
      setCancelDialogOpen(false);
      refreshOrder();
    },
    onError: (error) => toast.error(`Could not cancel order: ${error.message}`),
  });

  const copyValue = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label} copied`);
    } catch {
      toast.error(`Could not copy ${label.toLowerCase()}`);
    }
  };

  if (orderQuery.isLoading) {
    return <OrderLoadingState />;
  }

  if (orderQuery.error || !orderQuery.data) {
    return (
      <OrderErrorState
        message={orderQuery.error?.message || "Order not found"}
        onBack={() => router.push("/admin/orders")}
      />
    );
  }

  const order = orderQuery.data;
  const customerName = order.user
    ? `${order.user.first_name || ""} ${order.user.last_name || ""}`.trim() ||
      "No name"
    : `${order.first_name} ${order.last_name}`.trim();
  const customerEmail = order.user?.email || order.email;
  const customerPhone = order.phone || order.shipping_address?.phone || null;
  const phoneHref = customerPhone
    ? `tel:${customerPhone.replace(/[^+\d]/g, "")}`
    : undefined;
  const shippingAddress = order.shipping_address
    ? [
        order.shipping_address.address_1,
        order.shipping_address.address_2,
        order.shipping_address.city,
        order.shipping_address.state,
        order.shipping_address.country,
      ]
        .filter(Boolean)
        .join(", ")
    : "No address provided";
  const canUpdate = hasPermission("orders.update");
  const canUpdateStatus = canUpdate && !isTerminalOrderStatus(order.status);
  const canCancel =
    hasPermission("orders.delete") && !isTerminalOrderStatus(order.status);
  const itemCount = order.items.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  return (
    <div className="mx-auto max-w-[1500px] space-y-6">
      <header className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Back to orders"
              onClick={() => router.push("/admin/orders")}
            >
              <ArrowLeft aria-hidden="true" />
            </Button>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-semibold tracking-tight text-gray-950">
                  Order #{order.order_number}
                </h1>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Copy order number"
                  onClick={() => copyValue(order.order_number, "Order number")}
                >
                  <Copy aria-hidden="true" />
                </Button>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <StatusBadge variant={getOrderStatusVariant(order.status)}>
                  {ORDER_STATUS_LABELS[order.status]}
                </StatusBadge>
                <StatusBadge
                  variant={getPaymentStatusVariant(order.payment_status)}
                >
                  {PAYMENT_STATUS_LABELS[order.payment_status]}
                </StatusBadge>
                <span className="flex items-center gap-1.5 text-sm text-gray-500">
                  <CalendarDays className="size-4" aria-hidden="true" />
                  {new Date(order.created_at).toLocaleString("en-NG", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end lg:self-auto">
            {canUpdateStatus && (
              <Button onClick={() => setStatusDialogOpen(true)}>
                Update status
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <MoreHorizontal aria-hidden="true" />
                  More actions
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                {canUpdate && (
                  <>
                    <DropdownMenuItem onClick={() => setNoteDialogOpen(true)}>
                      <NotebookPen className="mr-2 size-4" aria-hidden="true" />
                      Add internal note
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setTrackingDialogOpen(true)}
                    >
                      <Truck className="mr-2 size-4" aria-hidden="true" />
                      {order.tracking_number ? "Edit tracking" : "Add tracking"}
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuItem
                  onClick={() => {
                    window.location.href = `mailto:${customerEmail}?subject=${encodeURIComponent(`Order ${order.order_number}`)}`;
                  }}
                >
                  <Mail className="mr-2 size-4" aria-hidden="true" />
                  Contact customer
                </DropdownMenuItem>
                {canCancel && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setCancelDialogOpen(true)}
                      className="text-red-600 focus:bg-red-50 focus:text-red-700"
                    >
                      Cancel order
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <main className="space-y-6">
          <Card>
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="flex items-center gap-2">
                <Package className="size-5 text-[#40702A]" aria-hidden="true" />
                Items in this order
              </CardTitle>
              <CardDescription>
                {itemCount} {itemCount === 1 ? "item" : "items"} across{" "}
                {order.items.length}{" "}
                {order.items.length === 1 ? "product" : "products"}
              </CardDescription>
            </CardHeader>
            <CardContent className="divide-y divide-gray-100 p-0">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="grid gap-4 px-5 py-5 sm:grid-cols-[64px_minmax(0,1fr)_auto] sm:items-center sm:px-6"
                >
                  <div className="relative size-16 overflow-hidden rounded-lg border border-gray-100 bg-gray-50">
                    {item.product?.images?.[0] ? (
                      <Image
                        src={item.product.images[0].url}
                        alt={item.product_name}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-gray-400">
                        <Package className="size-5" aria-hidden="true" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-gray-950">
                      {item.product_name}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      SKU {item.product_sku} · Qty {item.quantity} ·{" "}
                      {formatNaira(Number(item.price))} each
                    </p>
                    {item.product && (
                      <Link
                        href={`/products/${item.product.slug || item.product.id}`}
                        className="mt-2 inline-block text-sm font-medium text-[#40702A] hover:underline"
                      >
                        View product
                      </Link>
                    )}
                  </div>
                  <p className="font-semibold text-gray-950">
                    {formatNaira(Number(item.total))}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b border-gray-100">
              <CardTitle>Order activity</CardTitle>
              <CardDescription>
                Status changes and internal notes
              </CardDescription>
            </CardHeader>
            <CardContent>
              {order.status_history.length > 0 ? (
                <ol className="space-y-5">
                  {order.status_history.map((history, index) => (
                    <li key={history.id} className="relative flex gap-4">
                      {index < order.status_history.length - 1 && (
                        <span className="absolute left-[7px] top-5 h-[calc(100%+4px)] w-px bg-gray-200" />
                      )}
                      <span
                        className={`relative mt-1.5 size-4 shrink-0 rounded-full border-4 border-white ${
                          index === 0 ? "bg-[#40702A]" : "bg-gray-300"
                        }`}
                      />
                      <div className="min-w-0">
                        <p className="font-medium text-gray-950">
                          {ORDER_STATUS_LABELS[history.status]}
                        </p>
                        <p className="mt-0.5 text-sm text-gray-500">
                          {new Date(history.created_at).toLocaleString(
                            "en-NG",
                            {
                              dateStyle: "medium",
                              timeStyle: "short",
                            },
                          )}
                        </p>
                        {history.notes && (
                          <p className="mt-2 rounded-lg bg-gray-50 px-3 py-2 text-sm leading-6 text-gray-700">
                            {history.notes}
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="text-sm text-gray-500">
                  No activity has been recorded yet.
                </p>
              )}
            </CardContent>
          </Card>
        </main>

        <aside className="space-y-6">
          <Card>
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="flex items-center gap-2">
                <UserRound
                  className="size-5 text-[#40702A]"
                  aria-hidden="true"
                />
                Customer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <p className="font-semibold text-gray-950">{customerName}</p>
                <p className="mt-1 text-xs uppercase tracking-wide text-gray-500">
                  {order.user ? "Registered customer" : "Guest customer"}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Email
                </p>
                <div className="mt-1 flex items-center justify-between gap-2">
                  <a
                    href={`mailto:${customerEmail}`}
                    className="min-w-0 truncate text-sm font-medium text-gray-900 hover:text-[#40702A]"
                  >
                    {customerEmail}
                  </a>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Copy customer email"
                    onClick={() => copyValue(customerEmail, "Email")}
                  >
                    <Copy aria-hidden="true" />
                  </Button>
                </div>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Phone
                </p>
                <div className="mt-1 flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-gray-900">
                    {customerPhone || "Not provided"}
                  </p>
                  {customerPhone && phoneHref && (
                    <div className="flex items-center">
                      <Button variant="ghost" size="icon-sm" asChild>
                        <a href={phoneHref} aria-label="Call customer">
                          <Phone aria-hidden="true" />
                        </a>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Copy customer phone number"
                        onClick={() => copyValue(customerPhone, "Phone number")}
                      >
                        <Copy aria-hidden="true" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              {order.user && (
                <Button variant="outline" className="w-full" asChild>
                  <Link
                    href={`/admin/customers?search=${encodeURIComponent(customerEmail)}`}
                  >
                    View customer profile
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="flex items-center gap-2">
                <Truck className="size-5 text-[#40702A]" aria-hidden="true" />
                Fulfilment
              </CardTitle>
              <CardDescription>
                {order.delivery_method === "PICKUP"
                  ? "Store pickup"
                  : "Delivery"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-gray-500">
                  <MapPin className="size-3.5" aria-hidden="true" />
                  Shipping address
                </p>
                <p className="mt-2 text-sm leading-6 text-gray-700">
                  {shippingAddress}
                </p>
              </div>
              <div className="border-t border-gray-100 pt-4">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Tracking number
                </p>
                <p className="mt-2 break-all font-mono text-sm font-medium text-gray-900">
                  {order.tracking_number || "Not added"}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="flex items-center gap-2">
                <CreditCard
                  className="size-5 text-[#40702A]"
                  aria-hidden="true"
                />
                Payment summary
              </CardTitle>
              {order.payments[0] && (
                <CardDescription>
                  {order.payments[0].payment_method.replaceAll("_", " ")}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between gap-4 text-gray-600">
                  <dt>Subtotal</dt>
                  <dd className="font-medium text-gray-900">
                    {formatNaira(Number(order.subtotal))}
                  </dd>
                </div>
                {Number(order.discount) > 0 && (
                  <div className="flex justify-between gap-4 text-gray-600">
                    <dt>Discount</dt>
                    <dd className="font-medium text-emerald-700">
                      -{formatNaira(Number(order.discount))}
                    </dd>
                  </div>
                )}
                {Number(order.tax) > 0 && (
                  <div className="flex justify-between gap-4 text-gray-600">
                    <dt>Tax</dt>
                    <dd className="font-medium text-gray-900">
                      {formatNaira(Number(order.tax))}
                    </dd>
                  </div>
                )}
                <div className="flex justify-between gap-4 text-gray-600">
                  <dt>Shipping</dt>
                  <dd className="font-medium text-gray-900">
                    {formatNaira(Number(order.shipping_cost))}
                  </dd>
                </div>
                {Number(order.processing_fee) > 0 && (
                  <div className="flex justify-between gap-4 text-gray-600">
                    <dt>Processing fee</dt>
                    <dd className="font-medium text-gray-900">
                      {formatNaira(Number(order.processing_fee))}
                    </dd>
                  </div>
                )}
                <div className="flex justify-between gap-4 border-t border-gray-200 pt-3">
                  <dt className="font-semibold text-gray-950">Total</dt>
                  <dd className="text-lg font-semibold text-gray-950">
                    {formatNaira(Number(order.total))}
                  </dd>
                </div>
              </dl>
              {order.payments[0]?.reference && (
                <p className="mt-4 break-all border-t border-gray-100 pt-4 text-xs text-gray-500">
                  Reference: {order.payments[0].reference}
                </p>
              )}
            </CardContent>
          </Card>
        </aside>
      </div>

      <UpdateStatusDialog
        open={statusDialogOpen}
        onOpenChange={setStatusDialogOpen}
        currentStatus={order.status}
        isPending={updateStatusMutation.isPending}
        onSubmit={(status, notes) =>
          updateStatusMutation.mutate({ id: order.id, status, notes })
        }
      />
      <AddNoteDialog
        open={noteDialogOpen}
        onOpenChange={setNoteDialogOpen}
        isPending={addNoteMutation.isPending}
        onSubmit={(note) =>
          addNoteMutation.mutate({
            id: order.id,
            status: order.status,
            notes: note,
          })
        }
      />
      <TrackingDialog
        open={trackingDialogOpen}
        onOpenChange={setTrackingDialogOpen}
        currentTracking={order.tracking_number || ""}
        isPending={trackingMutation.isPending}
        onSubmit={(trackingNumber) =>
          trackingMutation.mutate({ id: order.id, trackingNumber })
        }
      />
      <CancelOrderDialog
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
        orderNumber={order.order_number}
        isPending={cancelMutation.isPending}
        onSubmit={(reason) => cancelMutation.mutate({ id: order.id, reason })}
      />
    </div>
  );
}

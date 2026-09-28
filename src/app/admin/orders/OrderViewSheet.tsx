"use client";

import {
  CalendarDays,
  Copy,
  ExternalLink,
  Mail,
  MapPin,
  Package,
  Phone,
  ReceiptText,
  Truck,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CloudinaryImage as Image } from "@/components/ui/cloudinary-image";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  type AdminOrder,
  formatNaira,
  getOrderStatusVariant,
  getPaymentStatusVariant,
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
} from "./order-display";

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

  const itemCount = order.items.reduce(
    (total, item) => total + item.quantity,
    0,
  );
  const phoneHref = order.customerPhone
    ? `tel:${order.customerPhone.replace(/[^+\d]/g, "")}`
    : undefined;

  const copyValue = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label} copied`);
    } catch {
      toast.error(`Could not copy ${label.toLowerCase()}`);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex h-full w-full flex-col overflow-hidden border-l-gray-200 p-0 sm:max-w-xl">
        <SheetHeader className="shrink-0 border-b border-gray-200 bg-gray-50/80 px-5 py-5 pr-12 text-left sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#40702A]">
            Order preview
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <SheetTitle className="text-xl text-gray-950">
              #{order.id}
            </SheetTitle>
            <StatusBadge variant={getOrderStatusVariant(order.status)}>
              {ORDER_STATUS_LABELS[order.status]}
            </StatusBadge>
            <StatusBadge variant={getPaymentStatusVariant(order.paymentStatus)}>
              {PAYMENT_STATUS_LABELS[order.paymentStatus]}
            </StatusBadge>
          </div>
          <SheetDescription className="flex items-center gap-1.5 text-sm text-gray-500">
            <CalendarDays className="size-4" aria-hidden="true" />
            Placed {order.orderDate}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-5 overflow-y-auto bg-gray-50/40 p-4 sm:p-6">
          <section
            className="grid grid-cols-2 gap-3"
            aria-label="Order summary"
          >
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Order total
              </p>
              <p className="mt-1 text-xl font-semibold text-gray-950">
                {formatNaira(order.total)}
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Items
              </p>
              <p className="mt-1 text-xl font-semibold text-gray-950">
                {itemCount}
              </p>
            </div>
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <ReceiptText
                className="size-4 text-[#40702A]"
                aria-hidden="true"
              />
              <h3 className="font-semibold text-gray-950">Customer</h3>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Name
                </p>
                <p className="mt-1 font-medium text-gray-950">
                  {order.customerName}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Email
                </p>
                <div className="mt-1 flex min-w-0 items-center justify-between gap-3">
                  <a
                    href={`mailto:${order.customerEmail}`}
                    className="min-w-0 truncate font-medium text-gray-900 hover:text-[#40702A]"
                  >
                    {order.customerEmail}
                  </a>
                  <div className="flex shrink-0 items-center">
                    <Button variant="ghost" size="icon-sm" asChild>
                      <a
                        href={`mailto:${order.customerEmail}`}
                        aria-label="Email customer"
                      >
                        <Mail aria-hidden="true" />
                      </a>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Copy customer email"
                      onClick={() => copyValue(order.customerEmail, "Email")}
                    >
                      <Copy aria-hidden="true" />
                    </Button>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Phone
                </p>
                <div className="mt-1 flex items-center justify-between gap-3">
                  <p className="font-medium text-gray-900">
                    {order.customerPhone || "Not provided"}
                  </p>
                  {order.customerPhone && phoneHref && (
                    <div className="flex shrink-0 items-center">
                      <Button variant="ghost" size="icon-sm" asChild>
                        <a href={phoneHref} aria-label="Call customer">
                          <Phone aria-hidden="true" />
                        </a>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Copy customer phone number"
                        onClick={() =>
                          copyValue(order.customerPhone || "", "Phone number")
                        }
                      >
                        <Copy aria-hidden="true" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <MapPin className="size-4 text-[#40702A]" aria-hidden="true" />
              <h3 className="font-semibold text-gray-950">Shipping address</h3>
            </div>
            <p className="text-sm leading-6 text-gray-700">
              {order.shippingAddress}
            </p>
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Package className="size-4 text-[#40702A]" aria-hidden="true" />
                <h3 className="font-semibold text-gray-950">Order items</h3>
              </div>
              <span className="text-sm text-gray-500">
                {itemCount} {itemCount === 1 ? "item" : "items"}
              </span>
            </div>
            <div className="divide-y divide-gray-100">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <div className="relative size-14 shrink-0 overflow-hidden rounded-lg border border-gray-100 bg-gray-50">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm font-medium text-gray-950">
                      {item.name}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      {item.sku} · Qty {item.quantity}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-semibold text-gray-900">
                    {formatNaira(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="mb-4 font-semibold text-gray-950">
              Payment summary
            </h3>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between gap-4 text-gray-600">
                <dt>Subtotal</dt>
                <dd className="font-medium text-gray-900">
                  {formatNaira(order.subtotal)}
                </dd>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between gap-4 text-gray-600">
                  <dt>Discount</dt>
                  <dd className="font-medium text-emerald-700">
                    -{formatNaira(order.discount)}
                  </dd>
                </div>
              )}
              {order.tax > 0 && (
                <div className="flex justify-between gap-4 text-gray-600">
                  <dt>Tax</dt>
                  <dd className="font-medium text-gray-900">
                    {formatNaira(order.tax)}
                  </dd>
                </div>
              )}
              <div className="flex justify-between gap-4 text-gray-600">
                <dt>Shipping</dt>
                <dd className="font-medium text-gray-900">
                  {formatNaira(order.shippingCost)}
                </dd>
              </div>
              {order.processingFee > 0 && (
                <div className="flex justify-between gap-4 text-gray-600">
                  <dt>Processing fee</dt>
                  <dd className="font-medium text-gray-900">
                    {formatNaira(order.processingFee)}
                  </dd>
                </div>
              )}
              <div className="flex justify-between gap-4 border-t border-gray-200 pt-3">
                <dt className="font-semibold text-gray-950">Total</dt>
                <dd className="text-lg font-semibold text-gray-950">
                  {formatNaira(order.total)}
                </dd>
              </div>
            </dl>
          </section>

          {order.trackingNumber && (
            <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <Truck className="size-4 text-[#40702A]" aria-hidden="true" />
                <h3 className="font-semibold text-gray-950">Tracking</h3>
              </div>
              <p className="break-all font-mono text-sm font-medium text-gray-900">
                {order.trackingNumber}
              </p>
            </section>
          )}
        </div>

        <div className="shrink-0 border-t border-gray-200 bg-white p-4 sm:px-6">
          <Button className="w-full" asChild>
            <Link
              href={`/admin/orders/${encodeURIComponent(order.id)}`}
              onClick={() => onOpenChange(false)}
            >
              Manage order
              <ExternalLink aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

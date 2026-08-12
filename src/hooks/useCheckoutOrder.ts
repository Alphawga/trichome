"use client";

import type { Currency, PaymentMethod } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { toast } from "sonner";
import { clearLocalCart } from "@/utils/local-cart";
import { trpc } from "@/utils/trpc";

interface PaymentResponse {
  paymentStatus: string;
  transactionReference?: string;
  paymentReference: string;
  amountPaid?: string;
  paymentDescription?: string;
  customerEmail: string;
  customerName: string;
}

interface AddressData {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  // Only required for delivery orders — omitted/ignored for pickup.
  address_1?: string;
  address_2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
}

interface OrderItem {
  product_id: string;
  quantity: number;
}

interface OrderTotals {
  subtotal: number;
  shipping: number;
  tax: number;
  discount?: number;
  total: number;
}

interface CreateOrderInput {
  paymentResponse: PaymentResponse;
  address: AddressData;
  items: OrderItem[];
  totals: OrderTotals;
  payment_method?: PaymentMethod;
  currency?: Currency;
  notes?: string;
  promo_code?: string;
  deliveryMethod?: "DELIVERY" | "PICKUP";
  pickupStoreId?: string;
}

/**
 * Creates an order after payment success, for either an authenticated or a
 * guest customer. Which tRPC mutation runs depends on `isGuestMode` — the two
 * stay separate server-side (authenticated orders link a real Address row
 * and track per-user promo usage; guest orders can't), but share one
 * client-side interface so callers don't need to branch.
 */
export function useCheckoutOrder(isGuestMode: boolean) {
  const router = useRouter();
  const utils = trpc.useUtils();

  const authenticatedMutation = trpc.createOrderWithPayment.useMutation({
    onSuccess: async (data) => {
      await utils.getCart.invalidate();
      await utils.getCart.refetch();

      toast.success("Order placed successfully!", {
        description: `Your order number is ${data.orderNumber}`,
      });

      router.push(`/order-confirmation?order=${data.orderNumber}`);
    },
    onError: (error) => {
      toast.error("Failed to create order", {
        description:
          error.message ||
          "Please contact support with your payment reference if you were charged.",
      });
      console.error("Order creation error:", error);
    },
  });

  const guestMutation = trpc.createGuestOrderWithPayment.useMutation({
    onSuccess: async (data) => {
      clearLocalCart();

      toast.success("Order placed successfully!", {
        description: `Your order number is ${data.orderNumber}`,
      });

      const email = data.order?.email || "";
      router.push(
        `/order-confirmation?order=${data.orderNumber}&guest=true&email=${encodeURIComponent(email)}`,
      );
    },
    onError: (error) => {
      toast.error("Failed to create order", {
        description:
          error.message ||
          "Please contact support with your payment reference if you were charged.",
      });
      console.error("Guest order creation error:", error);
    },
  });

  const activeMutation = isGuestMode ? guestMutation : authenticatedMutation;
  const authenticatedPreparation = trpc.prepareCheckout.useMutation();
  const guestPreparation = trpc.prepareGuestCheckout.useMutation();

  const prepareOrder = useCallback(
    async (input: Omit<CreateOrderInput, "paymentResponse">) => {
      const payload = {
        ...input,
        totals: { ...input.totals, discount: input.totals.discount || 0 },
        payment_method: input.payment_method || "PAYSTACK",
        currency: input.currency || "NGN",
        deliveryMethod: input.deliveryMethod || "DELIVERY",
      } as const;

      return isGuestMode
        ? guestPreparation.mutateAsync(payload)
        : authenticatedPreparation.mutateAsync(payload);
    },
    [isGuestMode, authenticatedPreparation, guestPreparation],
  );

  const createOrder = useCallback(
    (input: CreateOrderInput) => {
      const payload = {
        paymentResponse: input.paymentResponse,
        address: input.address,
        items: input.items,
        totals: {
          subtotal: input.totals.subtotal,
          shipping: input.totals.shipping,
          tax: input.totals.tax,
          discount: input.totals.discount || 0,
          total: input.totals.total,
        },
        payment_method: input.payment_method || "PAYSTACK",
        currency: input.currency || "NGN",
        notes: input.notes,
        promo_code: input.promo_code,
        deliveryMethod: input.deliveryMethod || "DELIVERY",
        pickupStoreId: input.pickupStoreId,
      } as const;

      if (isGuestMode) {
        guestMutation.mutate(payload);
      } else {
        authenticatedMutation.mutate(payload);
      }
    },
    [isGuestMode, authenticatedMutation, guestMutation],
  );

  return {
    prepareOrder,
    createOrder,
    isLoading:
      activeMutation.isPending ||
      authenticatedPreparation.isPending ||
      guestPreparation.isPending,
    isSuccess: activeMutation.isSuccess,
    isError: activeMutation.isError,
    error: activeMutation.error,
    order: activeMutation.data,
  };
}

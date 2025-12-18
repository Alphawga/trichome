"use client";

import type { Currency, PaymentMethod } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { toast } from "sonner";
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
  address_1: string;
  address_2?: string;
  city: string;
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

interface CreateOrderWithPaymentInput {
  paymentResponse: PaymentResponse;
  address: AddressData;
  items: OrderItem[];
  totals: OrderTotals;
  payment_method?: PaymentMethod;
  currency?: Currency;
  notes?: string;
  promo_code?: string;
  onOrderCreated?: () => void | Promise<void>;
}

/**
 * Hook for creating orders after payment success
 * Manages order creation logic, loading states, and error handling
 */
export function useOrderCreation() {
  const router = useRouter();
  const utils = trpc.useUtils();

  const createOrderMutation = trpc.createOrderWithPayment.useMutation({
    onSuccess: async (data) => {
      // Invalidate and refetch cart to update header count immediately
      await utils.getCart.invalidate();
      await utils.getCart.refetch();

      // Clear localStorage cart if it exists (for guest users)
      if (typeof window !== "undefined") {
        try {
          const { clearLocalCart } = await import("@/utils/local-cart");
          clearLocalCart();
        } catch (_error) {
          // Silently fail if local cart doesn't exist
          console.debug("No local cart to clear");
        }
      }

      // Show success message
      toast.success("Order placed successfully!", {
        description: `Your order number is ${data.orderNumber}`,
      });

      // Call optional callback (e.g., to save address)
      // Note: This is called before redirect, so any async operations should be fire-and-forget

      // Redirect to order confirmation page
      router.push(`/order-confirmation?order=${data.orderNumber}`);
    },
    onError: (error) => {
      // Show error message
      toast.error(
        error.message || "Failed to create order. Please contact support.",
      );

      // Log error for debugging
      console.error("Order creation error:", error);
    },
  });

  /**
   * Create order after payment success
   */
  const createOrder = useCallback(
    (input: CreateOrderWithPaymentInput) => {
      createOrderMutation.mutate({
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
        payment_method: input.payment_method || "WALLET",
        currency: input.currency || "NGN",
        notes: input.notes,
        promo_code: input.promo_code,
      });
    },
    [createOrderMutation],
  );

  return {
    createOrder,
    isLoading: createOrderMutation.isPending,
    isSuccess: createOrderMutation.isSuccess,
    isError: createOrderMutation.isError,
    error: createOrderMutation.error,
    order: createOrderMutation.data,
  };
}

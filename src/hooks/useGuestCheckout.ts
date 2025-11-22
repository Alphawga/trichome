"use client";

import type { Currency, PaymentMethod } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import type { AddressFormData } from "@/components/forms/AddressForm";
import { clearLocalCart, getLocalCart } from "@/utils/local-cart";
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

interface CreateGuestOrderInput {
  paymentResponse: PaymentResponse;
  address: AddressFormData;
  items: OrderItem[];
  totals: OrderTotals;
  payment_method?: PaymentMethod;
  currency?: Currency;
  notes?: string;
  promo_code?: string;
}

/**
 * Hook for guest checkout flow
 * Manages order creation for unauthenticated users
 *
 * Features:
 * - Uses localStorage cart
 * - Creates orders without user_id
 * - Stores email for order tracking
 * - Clears localStorage cart after order
 * - Provides account creation prompt after order
 */
export function useGuestCheckout() {
  const router = useRouter();
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);

  const createGuestOrderMutation = trpc.createGuestOrderWithPayment.useMutation(
    {
      onSuccess: async (data) => {
        // Clear localStorage cart
        clearLocalCart();

        // Show success message
        toast.success("Order placed successfully!", {
          description: `Your order number is ${data.orderNumber}`,
        });

        // Redirect to order confirmation with email for guest verification
        const email = data.order?.email || "";
        router.push(
          `/order-confirmation?order=${data.orderNumber}&guest=true&email=${encodeURIComponent(email)}`,
        );
      },
      onError: (error) => {
        toast.error("Failed to create order", {
          description:
            error.message || "An unexpected error occurred. Please try again.",
        });
        console.error("Guest order creation error:", error);
      },
    },
  );

  /**
   * Create guest order after payment success
   */
  const createGuestOrder = useCallback(
    (input: CreateGuestOrderInput) => {
      createGuestOrderMutation.mutate({
        paymentResponse: input.paymentResponse,
        address: {
          first_name: input.address.first_name,
          last_name: input.address.last_name,
          email: input.address.email,
          phone: input.address.phone || undefined,
          address_1: input.address.address_1,
          address_2: input.address.address_2 || undefined,
          city: input.address.city,
          state: input.address.state || undefined,
          postal_code: input.address.postal_code || undefined,
          country: input.address.country || "Nigeria",
        },
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
    [createGuestOrderMutation],
  );

  /**
   * Get guest cart items from localStorage
   */
  const getGuestCartItems = useCallback(() => {
    return getLocalCart();
  }, []);

  return {
    createGuestOrder,
    getGuestCartItems,
    isLoading: createGuestOrderMutation.isPending,
    isSuccess: createGuestOrderMutation.isSuccess,
    isError: createGuestOrderMutation.isError,
    error: createGuestOrderMutation.error,
    orderData: createGuestOrderMutation.data,
    isCreatingAccount,
    setIsCreatingAccount,
  };
}

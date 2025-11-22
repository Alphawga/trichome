"use client";

import type { Currency, PaymentMethod } from "@prisma/client";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { AddressFormData } from "@/components/forms/AddressForm";
import { useGuestCheckout } from "@/hooks/useGuestCheckout";

interface GuestPaymentHandlerProps {
  /** Address information for shipping */
  address: AddressFormData;
  /** Order items from cart */
  items: Array<{ product_id: string; quantity: number }>;
  /** Calculated order totals */
  totals: {
    subtotal: number;
    shipping: number;
    tax: number;
    discount?: number;
    total: number;
  };
  /** Payment method (defaults to WALLET for Monnify) */
  paymentMethod?: PaymentMethod;
  /** Currency (defaults to NGN) */
  currency?: Currency;
  /** Optional order notes */
  notes?: string;
  /** Optional promo code */
  promoCode?: string;
}

/**
 * Custom hook to handle Monnify payment initialization for guest checkout
 * Manages payment state, errors, and integrates with guest order creation
 */
export function useGuestPaymentHandler(props: GuestPaymentHandlerProps) {
  const [paymentStatus, setPaymentStatus] = useState<
    "idle" | "processing" | "success" | "error"
  >("idle");
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const {
    createGuestOrder,
    isLoading: isOrderCreating,
    isSuccess: isOrderCreated,
    isError: isOrderError,
    error: orderError,
  } = useGuestCheckout();
  // const _router = useRouter();

  const initializePayment = useCallback(async () => {
    if (typeof window === "undefined") {
      setPaymentError("Payment can only be initialized on the client side");
      return;
    }

    setPaymentStatus("processing");
    setPaymentError(null);

    try {
      // Dynamically import Monnify only on client side
      const Monnify = (await import("monnify-js")).default;
      const monnify = new Monnify(
        process.env.NEXT_PUBLIC_MONNIFY_API_KEY || "",
        process.env.NEXT_PUBLIC_MONNIFY_CONTRACT_CODE || "",
      );

      const paymentReference = `TRICHOMES-GUEST-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      type MonnifyCompleteResponse = {
        paymentStatus?: string;
        transactionReference?: string;
        paymentReference?: string;
        amountPaid?: number | string;
        paymentDescription?: string;
        customerEmail?: string;
        customerName?: string;
        message?: string;
      };
      monnify.initializePayment({
        amount: `${props.totals.total}`,
        currency: props.currency || "NGN",
        reference: paymentReference,
        customerFullName: `${props.address.first_name} ${props.address.last_name}`,
        customerEmail: props.address.email,
        apiKey: process.env.NEXT_PUBLIC_MONNIFY_API_KEY || "",
        contractCode: process.env.NEXT_PUBLIC_MONNIFY_CONTRACT_CODE || "",
        paymentDescription: "Trichomes Guest Order Payment",
        isTestMode: process.env.NODE_ENV !== "production",
        metadata: {
          orderTotal: props.totals.total.toString(),
          itemCount: props.items.length.toString(),
          guestOrder: "true",
        },
        onLoadStart: () => {
          console.log("Loading Monnify payment modal...");
        },
        onLoadComplete: () => {
          console.log("Monnify payment modal loaded");
        },
        onComplete: async (response: MonnifyCompleteResponse) => {
          console.log("Payment response:", response);

          if (response.paymentStatus === "PAID") {
            setPaymentStatus("success");

            // Trigger guest order creation after successful payment
            createGuestOrder({
              paymentResponse: {
                paymentStatus: response.paymentStatus,
                transactionReference: response.transactionReference,
                paymentReference: response.paymentReference || paymentReference,
                amountPaid: response.amountPaid?.toString(),
                paymentDescription: response.paymentDescription,
                customerEmail: response.customerEmail || props.address.email,
                customerName:
                  response.customerName ||
                  `${props.address.first_name} ${props.address.last_name}`,
              },
              address: props.address,
              items: props.items,
              totals: props.totals,
              payment_method: props.paymentMethod || "WALLET",
              currency: props.currency || "NGN",
              notes: props.notes,
            });
          } else {
            setPaymentStatus("error");
            setPaymentError(
              response.message || "Payment not successful. Please try again.",
            );
          }
        },
        onClose: () => {
          console.log("Monnify payment modal closed");
          // If payment was processing and modal closed, consider it cancelled
          if (paymentStatus === "processing") {
            setPaymentStatus("idle");
            setPaymentError("Payment was cancelled");
          }
        },
      });
    } catch (error) {
      console.error("Error initializing payment:", error);
      setPaymentStatus("error");
      setPaymentError(
        error instanceof Error
          ? error.message
          : "Failed to initialize payment. Please try again.",
      );
    }
  }, [props, paymentStatus, createGuestOrder]);

  // Handle order creation success/error after payment
  useEffect(() => {
    if (isOrderCreated) {
      // Redirection is handled by useGuestCheckout hook
      setPaymentStatus("success");
    }
    if (isOrderError) {
      setPaymentStatus("error");
      setPaymentError(
        orderError?.message || "Order creation failed after payment.",
      );
      toast.error("Order creation failed", {
        description:
          orderError?.message ||
          "Please contact support with your payment reference if you were charged.",
      });
    }
  }, [isOrderCreated, isOrderError, orderError]);

  return {
    initializePayment,
    paymentStatus,
    paymentError,
    isLoading: paymentStatus === "processing" || isOrderCreating,
    isSuccess: isOrderCreated && paymentStatus === "success",
    isError: paymentStatus === "error" || isOrderError,
    error: paymentError || orderError?.message,
  };
}

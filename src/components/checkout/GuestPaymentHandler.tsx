"use client";

import type { Currency, PaymentMethod } from "@prisma/client";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { AddressFormData } from "@/components/forms/AddressForm";
import { useGuestCheckout } from "@/hooks/useGuestCheckout";

interface GuestPaymentHandlerProps {
  address: AddressFormData;
  items: Array<{ product_id: string; quantity: number }>;
  totals: {
    subtotal: number;
    shipping: number;
    tax: number;
    discount?: number;
    total: number;
  };
  paymentMethod?: PaymentMethod;
  currency?: Currency;
  notes?: string;
  promoCode?: string;
}

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

  const initializePayment = useCallback(async () => {
    if (typeof window === "undefined") {
      setPaymentError("Payment can only be initialized on the client side");
      return;
    }

    setPaymentStatus("processing");
    setPaymentError(null);

    try {
      // @ts-ignore - Monnify JS SDK does not have types
      const Monnify = (await import("monnify-js")).default;
      // @ts-ignore - Monnify JS SDK does not have types
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
              promo_code: props.promoCode,
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

  useEffect(() => {
    if (isOrderCreated) {
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

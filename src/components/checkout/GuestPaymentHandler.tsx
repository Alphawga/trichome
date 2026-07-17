"use client";

import type { Currency, PaymentMethod } from "@prisma/client";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { AddressFormData } from "@/components/forms/AddressForm";
import { useGuestCheckout } from "@/hooks/useGuestCheckout";

type PaystackResponse = PaystackPopResponse;

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

function loadPaystackScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window !== "undefined" && window.PaystackPop) {
      resolve();
      return;
    }
    const existing = document.getElementById("paystack-inline-js");
    if (existing) {
      existing.addEventListener("load", () => resolve());
      return;
    }
    const script = document.createElement("script");
    script.id = "paystack-inline-js";
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Paystack script"));
    document.head.appendChild(script);
  });
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
      await loadPaystackScript();

      const paymentReference = `TRICHOMES-GUEST-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      const customerName = `${props.address.first_name} ${props.address.last_name}`;

      const handler = window.PaystackPop.setup({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "",
        email: props.address.email,
        amount: Math.round(props.totals.total * 100), // kobo
        currency: props.currency || "NGN",
        ref: paymentReference,
        label: customerName,
        callback: (response: PaystackResponse) => {
          if (response.status === "success") {
            setPaymentStatus("success");

            createGuestOrder({
              paymentResponse: {
                paymentStatus: "PAID",
                transactionReference: response.trans,
                paymentReference: response.reference,
                amountPaid: props.totals.total.toString(),
                paymentDescription: "Trichomes Guest Order Payment",
                customerEmail: props.address.email,
                customerName,
              },
              address: props.address,
              items: props.items,
              totals: props.totals,
              payment_method: props.paymentMethod || "PAYSTACK",
              currency: props.currency || "NGN",
              notes: props.notes,
              promo_code: props.promoCode,
            });
          } else {
            setPaymentStatus("error");
            setPaymentError(response.message || "Payment not successful. Please try again.");
          }
        },
        onClose: () => {
          if (paymentStatus === "processing") {
            setPaymentStatus("idle");
            setPaymentError("Payment was cancelled");
          }
        },
      });

      handler.openIframe();
    } catch (err) {
      console.error("Error initializing payment:", err);
      setPaymentStatus("error");
      setPaymentError(
        err instanceof Error ? err.message : "Failed to initialize payment. Please try again.",
      );
    }
  }, [props, paymentStatus, createGuestOrder]);

  useEffect(() => {
    if (isOrderCreated) {
      setPaymentStatus("success");
    }
    if (isOrderError) {
      setPaymentStatus("error");
      setPaymentError(orderError?.message || "Order creation failed after payment.");
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

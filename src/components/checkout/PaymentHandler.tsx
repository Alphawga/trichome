"use client";

import type { Currency, PaymentMethod } from "@prisma/client";
import { useCallback, useState } from "react";
import { useOrderCreation } from "@/hooks/useOrderCreation";
import { OrderCreationStatus } from "./OrderCreationStatus";

type PaystackResponse = PaystackPopResponse;

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

interface PaymentHandlerProps {
  address: AddressData;
  items: OrderItem[];
  totals: OrderTotals;
  paymentMethod?: PaymentMethod;
  currency?: Currency;
  notes?: string;
  customerName: string;
  customerEmail: string;
  promoCode?: string;
  onPaymentOpen?: () => void;
  onPaymentClose?: () => void;
  showStatus?: boolean;
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

export function PaymentHandler({
  address,
  items,
  totals,
  paymentMethod = "PAYSTACK",
  currency = "NGN",
  notes,
  customerName,
  customerEmail,
  onPaymentOpen,
  onPaymentClose,
  showStatus = true,
}: PaymentHandlerProps) {
  const { createOrder, isLoading, isError, error } = useOrderCreation();
  const [paymentStatus, setPaymentStatus] = useState<
    "idle" | "processing" | "success" | "error"
  >("idle");
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const initializePayment = useCallback(async () => {
    if (typeof window === "undefined") {
      setPaymentError("Payment can only be initialized on the client side");
      return;
    }

    setPaymentStatus("processing");
    setPaymentError(null);
    onPaymentOpen?.();

    try {
      await loadPaystackScript();

      const paymentReference = `TRICHOMES-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      const handler = window.PaystackPop.setup({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "",
        email: customerEmail,
        amount: Math.round(totals.total * 100), // kobo
        currency: currency,
        ref: paymentReference,
        label: customerName,
        callback: (response: PaystackResponse) => {
          if (response.status === "success") {
            setPaymentStatus("success");

            createOrder({
              paymentResponse: {
                paymentStatus: "PAID",
                transactionReference: response.trans,
                paymentReference: response.reference,
                amountPaid: totals.total.toString(),
                paymentDescription: "Trichomes Product Payment",
                customerEmail,
                customerName,
              },
              address,
              items,
              totals,
              payment_method: paymentMethod,
              currency,
              notes,
            });
          } else {
            setPaymentStatus("error");
            setPaymentError(response.message || "Payment not successful. Please try again.");
            onPaymentClose?.();
          }
        },
        onClose: () => {
          if (paymentStatus === "processing") {
            setPaymentStatus("idle");
            setPaymentError("Payment was cancelled");
          }
          onPaymentClose?.();
        },
      });

      handler.openIframe();
    } catch (err) {
      console.error("Error initializing payment:", err);
      setPaymentStatus("error");
      setPaymentError(
        err instanceof Error ? err.message : "Failed to initialize payment. Please try again.",
      );
      onPaymentClose?.();
    }
  }, [
    address,
    items,
    totals,
    paymentMethod,
    currency,
    notes,
    customerName,
    customerEmail,
    createOrder,
    paymentStatus,
    onPaymentOpen,
    onPaymentClose,
  ]);

  if (!showStatus) {
    return null;
  }

  if (isError || (paymentStatus === "error" && paymentError)) {
    return (
      <OrderCreationStatus
        status="error"
        error={error?.message || paymentError || "An error occurred"}
        onRetry={initializePayment}
      />
    );
  }

  if (isLoading || paymentStatus === "success") {
    return <OrderCreationStatus status="processing" />;
  }

  return null;
}

export function usePaymentHandler(props: PaymentHandlerProps) {
  const [paymentStatus, setPaymentStatus] = useState<
    "idle" | "processing" | "success" | "error"
  >("idle");
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const { createOrder, isLoading, isError, error } = useOrderCreation();

  const initializePayment = useCallback(async () => {
    if (typeof window === "undefined") {
      setPaymentError("Payment can only be initialized on the client side");
      return;
    }

    setPaymentStatus("processing");
    setPaymentError(null);

    try {
      await loadPaystackScript();

      const paymentReference = `TRICHOMES-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      const handler = window.PaystackPop.setup({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "",
        email: props.customerEmail,
        amount: Math.round(props.totals.total * 100),
        currency: props.currency || "NGN",
        ref: paymentReference,
        label: props.customerName,
        callback: (response: PaystackResponse) => {
          if (response.status === "success") {
            setPaymentStatus("success");

            createOrder({
              paymentResponse: {
                paymentStatus: "PAID",
                transactionReference: response.trans,
                paymentReference: response.reference,
                amountPaid: props.totals.total.toString(),
                paymentDescription: "Trichomes Product Payment",
                customerEmail: props.customerEmail,
                customerName: props.customerName,
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
  }, [props, paymentStatus, createOrder]);

  return {
    initializePayment,
    paymentStatus,
    paymentError,
    isLoading:
      isLoading ||
      paymentStatus === "processing" ||
      paymentStatus === "success",
    isError: isError || paymentStatus === "error",
    error: error?.message || paymentError,
  };
}

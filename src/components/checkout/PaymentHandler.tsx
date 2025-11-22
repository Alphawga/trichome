"use client";

import type { Currency, PaymentMethod } from "@prisma/client";
import { useCallback, useState } from "react";
import { useOrderCreation } from "@/hooks/useOrderCreation";
import { OrderCreationStatus } from "./OrderCreationStatus";

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
  /** Address information for shipping */
  address: AddressData;
  /** Order items from cart */
  items: OrderItem[];
  /** Calculated order totals */
  totals: OrderTotals;
  /** Payment method (defaults to WALLET for Monnify) */
  paymentMethod?: PaymentMethod;
  /** Currency (defaults to NGN) */
  currency?: Currency;
  /** Optional order notes */
  notes?: string;
  /** Customer name for payment */
  customerName: string;
  /** Customer email for payment */
  customerEmail: string;
  /** Optional promo code */
  promoCode?: string;
  /** Callback when payment modal is opened */
  onPaymentOpen?: () => void;
  /** Callback when payment is closed without completing */
  onPaymentClose?: () => void;
  /** Show status component */
  showStatus?: boolean;
}

/**
 * Reusable PaymentHandler component
 * Handles Monnify payment initialization and order creation after payment success
 */
export function PaymentHandler({
  address,
  items,
  totals,
  paymentMethod = "WALLET",
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

  /**
   * Initialize Monnify payment
   */
  const initializePayment = useCallback(async () => {
    if (typeof window === "undefined") {
      setPaymentError("Payment can only be initialized on the client side");
      return;
    }

    setPaymentStatus("processing");
    setPaymentError(null);
    onPaymentOpen?.();

    try {
      // Dynamically import Monnify only on client side
      const Monnify = (await import("monnify-js")).default;
      const monnify = new Monnify(
        process.env.NEXT_PUBLIC_MONNIFY_API_KEY || "",
        process.env.NEXT_PUBLIC_MONNIFY_CONTRACT_CODE || "",
      );

      const paymentReference = `TRICHOMES-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      monnify.initializePayment({
        amount: `${totals.total}`,
        currency: currency,
        reference: paymentReference,
        customerFullName: customerName,
        customerEmail: customerEmail,
        apiKey: process.env.NEXT_PUBLIC_MONNIFY_API_KEY || "",
        contractCode: process.env.NEXT_PUBLIC_MONNIFY_CONTRACT_CODE || "",
        paymentDescription: "Trichomes Product Payment",
        isTestMode: process.env.NODE_ENV !== "production",
        metadata: {
          orderTotal: totals.total.toString(),
          itemCount: items.length.toString(),
        },
        onLoadStart: () => {
          console.log("Loading Monnify payment modal...");
        },
        onLoadComplete: () => {
          console.log("Monnify payment modal loaded");
        },
        onComplete: (response: {
          paymentStatus?: string;
          transactionReference?: string;
          paymentReference?: string;
          amountPaid?: number | string;
          paymentDescription?: string;
          customerEmail?: string;
          customerName?: string;
          message?: string;
        }) => {
          console.log("Payment response:", response);

          if (response.paymentStatus === "PAID") {
            setPaymentStatus("success");
            console.log("Payment successful, creating order...", response);

            // Always use original email/name from checkout form
            // Monnify may return masked email (e.g., "al***ga@gmail.com")
            createOrder({
              paymentResponse: {
                paymentStatus: response.paymentStatus,
                transactionReference: response.transactionReference,
                paymentReference: response.paymentReference || paymentReference,
                amountPaid: response.amountPaid?.toString(),
                paymentDescription: response.paymentDescription,
                customerEmail: customerEmail,
                customerName: customerName,
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
            setPaymentError(
              response.message || "Payment not successful. Please try again.",
            );
            onPaymentClose?.();
          }
        },
        onClose: () => {
          console.log("Monnify payment modal closed");
          if (paymentStatus === "processing") {
            setPaymentStatus("idle");
            setPaymentError("Payment was cancelled");
          }
          onPaymentClose?.();
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

  // Expose initializePayment via children render prop pattern
  if (!showStatus) {
    return null;
  }

  // Show error status component if there's an error
  if (isError || (paymentStatus === "error" && paymentError)) {
    return (
      <OrderCreationStatus
        status="error"
        error={error?.message || paymentError || "An error occurred"}
        onRetry={initializePayment}
      />
    );
  }

  // Show loading status during order creation
  if (isLoading || paymentStatus === "success") {
    return <OrderCreationStatus status="processing" />;
  }

  return null; // idle state - don't render anything
}

/**
 * Hook version for easier use in checkout page
 */
export function usePaymentHandler(
  props: Omit<
    PaymentHandlerProps,
    "onPaymentOpen" | "onPaymentClose" | "showStatus"
  >,
) {
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
      // Dynamically import Monnify only on client side
      const Monnify = (await import("monnify-js")).default;
      const monnify = new Monnify(
        process.env.NEXT_PUBLIC_MONNIFY_API_KEY || "",
        process.env.NEXT_PUBLIC_MONNIFY_CONTRACT_CODE || "",
      );

      const paymentReference = `TRICHOMES-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      monnify.initializePayment({
        amount: `${props.totals.total}`,
        currency: props.currency || "NGN",
        reference: paymentReference,
        customerFullName: props.customerName,
        customerEmail: props.customerEmail,
        apiKey: process.env.NEXT_PUBLIC_MONNIFY_API_KEY || "",
        contractCode: process.env.NEXT_PUBLIC_MONNIFY_CONTRACT_CODE || "",
        paymentDescription: "Trichomes Product Payment",
        isTestMode: process.env.NODE_ENV !== "production",
        metadata: {
          orderTotal: props.totals.total.toString(),
          itemCount: props.items.length.toString(),
        },
        onLoadStart: () => {
          console.log("Loading Monnify payment modal...");
        },
        onLoadComplete: () => {
          console.log("Monnify payment modal loaded");
        },
        onComplete: (response: {
          paymentStatus?: string;
          transactionReference?: string;
          paymentReference?: string;
          amountPaid?: number | string;
          paymentDescription?: string;
          customerEmail?: string;
          customerName?: string;
          message?: string;
        }) => {
          console.log("Payment response:", response);

          if (response.paymentStatus === "PAID") {
            setPaymentStatus("success");

            // Always use original email/name from checkout form
            // Monnify may return masked email (e.g., "al***ga@gmail.com")
            createOrder({
              paymentResponse: {
                paymentStatus: response.paymentStatus,
                transactionReference: response.transactionReference,
                paymentReference: response.paymentReference || paymentReference,
                amountPaid: response.amountPaid?.toString(),
                paymentDescription: response.paymentDescription,
                customerEmail: props.customerEmail,
                customerName: props.customerName,
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

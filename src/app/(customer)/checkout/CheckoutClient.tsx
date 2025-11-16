"use client";
import React from "react";
import type { Prisma, Product as PrismaProduct } from "@prisma/client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
// import { AccountCreationPrompt } from "@/components/checkout/AccountCreationPrompt";
import { useGuestPaymentHandler } from "@/components/checkout/GuestPaymentHandler";
import { OrderCreationStatus } from "@/components/checkout/OrderCreationStatus";
import { usePaymentHandler } from "@/components/checkout/PaymentHandler";
import { SavedAddressesSelector } from "@/components/checkout/SavedAddressesSelector";
import {
  AddressForm,
  type AddressFormData,
  type AddressFormRef,
} from "@/components/forms/AddressForm";
import { OrderSummary } from "@/components/orders/OrderSummary";
import {
  calculateShipping,
  getAvailableShippingMethods,
} from "@/lib/shipping/calculate-shipping";
import { getLocalCart } from "@/utils/local-cart";
import { trpc } from "@/utils/trpc";
import { useAuth } from "../../contexts/auth-context";

function CheckoutPageContent() {
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { data: session } = useSession();
  const isGuestMode = searchParams.get("guest") === "true" || !isAuthenticated;

  // Fetch cart data for authenticated users
  const cartQuery = trpc.getCart.useQuery(undefined, {
    enabled: isAuthenticated && !isGuestMode,
    refetchOnWindowFocus: false,
  });

  // Fetch products for localStorage cart items (guest mode)
  const [localCartItems] = useState(() => getLocalCart());
  const localCartProductIds = useMemo(
    () => localCartItems.map((item) => item.product_id),
    [localCartItems],
  );
  const localProductsQuery = trpc.getProductsByIds.useQuery(
    { ids: localCartProductIds },
    { enabled: isGuestMode && localCartProductIds.length > 0 },
  );

  // Build cart items from either authenticated cart or localStorage
  const cartItems = useMemo(() => {
    if (isAuthenticated && !isGuestMode) {
      return cartQuery.data?.items || [];
    } else {
      // Build cart items from localStorage and fetched products
      if (!localProductsQuery.data) return [];

      return localCartItems
        .map((localItem) => {
          const product = localProductsQuery.data.find(
            (p) => p.id === localItem.product_id,
          );
          if (!product) return null;

          return {
            id: `local-${product.id}`,
            product_id: product.id,
            quantity: localItem.quantity,
            product: {
              ...(product as PrismaProduct),
              // prefer existing slug, fallback to id for URLs
              slug:
                (product as PrismaProduct & { slug?: string | null }).slug ||
                product.id,
            } as PrismaProduct,
          };
        })
        .filter(
          (
            item,
          ): item is {
            id: string;
            product_id: string;
            quantity: number;
            product: PrismaProduct;
          } => Boolean(item),
        );
    }
  }, [
    isAuthenticated,
    isGuestMode,
    cartQuery.data,
    localCartItems,
    localProductsQuery.data,
  ]);

  // Calculate totals
  const subtotal = useMemo(() => {
    return cartItems.reduce((sum, item) => {
      const price = Number(item.product.price);
      return sum + price * item.quantity;
    }, 0);
  }, [cartItems]);

  // Promo code state
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromoCode, setAppliedPromoCode] = useState<{
    code: string;
    discount: number;
    isFreeShipping: boolean;
  } | null>(null);
  const [promoCodeError, setPromoCodeError] = useState<string | null>(null);

  // Validate promo code
  const validatePromoCodeQuery = trpc.validatePromoCode.useQuery(
    {
      code: promoCode.toUpperCase(),
      subtotal,
      userId: isAuthenticated && !isGuestMode ? session?.user.id : undefined,
    },
    {
      enabled: false, // Only run on manual trigger
      retry: false,
    },
  );

  const [formData, setFormData] = useState<AddressFormData>({
    first_name: session?.user.first_name || "",
    last_name: session?.user.last_name || "",
    email: session?.user.email || "",
    phone: "",
    address_1: "",
    address_2: "",
    city: "",
    state: "",
    postal_code: "",
    country: "Nigeria",
  });

  const handleApplyPromoCode = async () => {
    if (!promoCode.trim()) {
      setPromoCodeError("Please enter a promo code");
      return;
    }

    setPromoCodeError(null);

    try {
      const result = await validatePromoCodeQuery.refetch();
      if (result.data) {
        setAppliedPromoCode({
          code: result.data.promotion.code,
          discount: result.data.discountAmount,
          isFreeShipping: result.data.isFreeShipping,
        });
        toast.success("Promo code applied successfully!");
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Invalid promo code";
      setPromoCodeError(message);
      setAppliedPromoCode(null);
    }
  };

  const handleRemovePromoCode = () => {
    setAppliedPromoCode(null);
    setPromoCode("");
    setPromoCodeError(null);
  };

  // Calculate shipping dynamically
  const [shippingMethod, setShippingMethod] = useState<"standard" | "express">(
    "standard",
  );
  const shippingCalculation = useMemo(() => {
    // Calculate total weight (estimate: 0.5kg per item if not available)
    const estimatedWeight = cartItems.reduce((sum, item) => {
      // If product has weight, use it; otherwise estimate 0.5kg per item
      const rawWeight = (
        item.product as {
          weight?: number | Prisma.Decimal | null;
        }
      ).weight;
      const itemWeight =
        (rawWeight !== undefined && rawWeight !== null && Number(rawWeight)) ||
        0.5;
      return sum + itemWeight * item.quantity;
    }, 0);

    const input = {
      subtotal,
      weight: estimatedWeight,
      state: formData.state,
      city: formData.city,
      postalCode: formData.postal_code,
      country: formData.country || "Nigeria",
    };

    return shippingMethod === "express"
      ? require("@/lib/shipping/calculate-shipping").calculateExpressShipping(
          input,
        )
      : calculateShipping(input);
  }, [
    subtotal,
    cartItems,
    formData.state,
    formData.city,
    formData.postal_code,
    formData.country,
    shippingMethod,
  ]);

  const shipping = appliedPromoCode?.isFreeShipping
    ? 0
    : shippingCalculation.cost;
  const tax = subtotal * 0.075;
  const discount = appliedPromoCode?.discount || 0;
  const total = subtotal + shipping + tax - discount;

  const [saveAddress, setSaveAddress] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<
    string | undefined
  >();

  // Mutation to save address
  const createAddressMutation = trpc.createAddress.useMutation({
    onSuccess: () => {
      toast.success("Address saved successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to save address");
    },
  });

  // Use appropriate payment handler based on authentication
  const authenticatedPaymentHandler = usePaymentHandler({
    address: {
      first_name: formData.first_name,
      last_name: formData.last_name,
      email: formData.email,
      phone: formData.phone || undefined,
      address_1: formData.address_1,
      address_2: formData.address_2 || undefined,
      city: formData.city,
      state: formData.state || undefined,
      postal_code: formData.postal_code || undefined,
      country: formData.country,
    },
    items: cartItems.map((item) => ({
      product_id: item.product.id,
      quantity: item.quantity,
    })),
    totals: {
      subtotal,
      shipping,
      tax,
      total,
    },
    customerName: `${formData.first_name} ${formData.last_name}`,
    customerEmail: formData.email,
  });

  const guestPaymentHandler = useGuestPaymentHandler({
    address: formData,
    items: cartItems.map((item) => ({
      product_id: item.product.id,
      quantity: item.quantity,
    })),
    totals: {
      subtotal,
      shipping,
      tax,
      total,
    },
  });

  const paymentHandler =
    isAuthenticated && !isGuestMode
      ? authenticatedPaymentHandler
      : guestPaymentHandler;

  const addressFormRef = useRef<AddressFormRef>(null);

  const handleAddressChange = (data: AddressFormData) => {
    setFormData(data);
  };

  const handleSelectSavedAddress = (address: AddressFormData) => {
    setFormData(address);
    setSelectedAddressId(undefined); // Clear selection when manually editing
  };

  // Save address (called before payment if user opted in)
  const handleSaveAddress = async () => {
    if (!saveAddress || !isAuthenticated || isGuestMode) return;

    try {
      await createAddressMutation.mutateAsync({
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone || undefined,
        address_1: formData.address_1,
        address_2: formData.address_2 || undefined,
        city: formData.city,
        state: formData.state || undefined,
        postal_code: formData.postal_code || undefined,
        country: formData.country,
        is_default: false, // Don't auto-set as default during checkout
      });
    } catch (error) {
      // Error already handled by mutation
      console.error("Failed to save address:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form using AddressForm validation
    if (addressFormRef.current && !addressFormRef.current.isValid()) {
      addressFormRef.current.validate();
      toast.error("Please fill in all required fields correctly");
      return;
    }

    // Validate cart
    if (cartItems.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    // Save address if user opted in (fire and forget - don't block payment)
    if (saveAddress && isAuthenticated && !isGuestMode) {
      handleSaveAddress().catch(console.error);
    }

    // Initialize payment
    await paymentHandler.initializePayment();
  };

  // Check if form is valid (basic check for button state)
  const isFormValid =
    formData.first_name &&
    formData.last_name &&
    formData.email &&
    formData.address_1 &&
    formData.city;

  // Show loading state
  if (
    authLoading ||
    (isAuthenticated && !isGuestMode && cartQuery.isLoading) ||
    (isGuestMode && localProductsQuery.isLoading)
  ) {
    return (
      <div className="min-h-screen bg-trichomes-soft">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 max-w-7xl">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-trichomes-primary mx-auto mb-4"></div>
              <p className="text-trichomes-forest/60 font-body">
                Loading checkout...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-trichomes-soft">
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 max-w-7xl">
          <div className="text-center py-12 sm:py-20 bg-white rounded-xl border border-trichomes-forest/10 shadow-sm">
            <h1 className="text-[20px] sm:text-[24px] font-heading font-semibold text-trichomes-forest mb-3 sm:mb-4">
              Your cart is empty
            </h1>
            <p className="text-trichomes-forest/60 font-body mb-4 sm:mb-6">
              Add some products before checking out.
            </p>
            <Link
              href="/"
              className="inline-block bg-trichomes-primary text-white py-3 px-6 sm:px-8 rounded-full hover:bg-trichomes-primary/90 font-semibold transition-all duration-150 ease-out hover:shadow-lg text-[14px] sm:text-[15px] font-body"
            >
              Continue shopping
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-trichomes-soft">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-12 sm:pb-16 max-w-7xl">
        {/* Breadcrumb */}
        <div className="text-sm text-trichomes-forest/60 mb-6 sm:mb-8 font-body">
          <Link
            href="/cart"
            className="hover:text-trichomes-forest transition-colors duration-150"
          >
            ← Back to cart
          </Link>
        </div>

        {/* Guest checkout notice */}
        {isGuestMode && (
          <div className="mb-6 bg-trichomes-sage/30 border border-trichomes-primary/20 p-4 rounded-xl">
            <p className="text-[14px] sm:text-[15px] text-trichomes-forest/80 font-body">
              <strong>Guest Checkout:</strong> You're checking out as a guest.
              You can create an account after your order to track it easily.
            </p>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 lg:gap-12">
          {/* Shipping Address Form */}
          <div className="lg:w-2/3">
            <h1 className="text-[24px] sm:text-[32px] font-heading font-semibold mb-4 sm:mb-6 text-trichomes-forest">
              Shipping Information
            </h1>

            <div className="bg-white p-6 sm:p-8 rounded-xl border border-trichomes-forest/10 shadow-sm">
              {/* Show saved addresses selector for authenticated users */}
              {isAuthenticated && !isGuestMode && (
                <SavedAddressesSelector
                  onSelectAddress={handleSelectSavedAddress}
                  selectedAddressId={selectedAddressId}
                />
              )}

              <AddressForm
                ref={addressFormRef}
                initialValues={formData}
                onChange={handleAddressChange}
                showEmail={true}
                showAddress2={true}
                showErrors={true}
                isLoading={paymentHandler.isLoading}
                formId="checkout-address-form"
                asDiv={true}
              />

              {/* Save address checkbox for authenticated users */}
              {isAuthenticated && !isGuestMode && (
                <div className="mt-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={saveAddress}
                      onChange={(e) => setSaveAddress(e.target.checked)}
                      className="w-4 h-4 text-trichomes-primary border-trichomes-forest/15 rounded focus:ring-trichomes-primary focus:ring-1"
                    />
                    <span className="text-sm text-trichomes-forest/80 font-body">
                      Save this address for future orders
                    </span>
                  </label>
                </div>
              )}

              {/* Shipping Method Selection */}
              {formData.city && formData.state && (
                <div className="mt-6 pt-6 border-t border-trichomes-forest/10">
                  <h3 className="text-sm font-medium text-trichomes-forest mb-3 font-body">
                    Shipping Method
                  </h3>
                  <div className="space-y-2">
                    {getAvailableShippingMethods({
                      subtotal,
                      weight: cartItems.reduce((sum, item) => {
                        const rawWeight = (
                          item.product as {
                            weight?: number | Prisma.Decimal | null;
                          }
                        ).weight;
                        const itemWeight =
                          (rawWeight !== undefined &&
                            rawWeight !== null &&
                            Number(rawWeight)) ||
                          0.5;
                        return sum + itemWeight * item.quantity;
                      }, 0),
                      state: formData.state,
                      city: formData.city,
                      postalCode: formData.postal_code,
                      country: formData.country || "Nigeria",
                    }).map((method) => (
                      <label
                        key={method.method}
                        className={`flex items-center justify-between p-3 border-2 rounded cursor-pointer transition-all duration-150 ${
                          shippingMethod === method.method
                            ? "border-trichomes-primary bg-trichomes-primary/5"
                            : "border-trichomes-forest/20 hover:border-trichomes-primary/50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="shippingMethod"
                            value={method.method}
                            checked={shippingMethod === method.method}
                            onChange={(e) =>
                              setShippingMethod(
                                e.target.value as "standard" | "express",
                              )
                            }
                            className="w-4 h-4 text-trichomes-primary border-trichomes-forest/15 focus:ring-trichomes-primary focus:ring-1"
                          />
                          <div>
                            <div className="font-medium text-trichomes-forest text-sm font-body">
                              {method.label}
                            </div>
                            {shippingCalculation.isFree &&
                              method.method === "standard" && (
                                <div className="text-xs text-trichomes-primary font-body">
                                  Free shipping on orders over ₦50,000
                                </div>
                              )}
                          </div>
                        </div>
                        <div className="text-sm font-semibold text-trichomes-forest font-body">
                          {method.cost === 0
                            ? "Free"
                            : `₦${method.cost.toLocaleString()}`}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:w-1/3">
            <div className="sticky top-8">
              <OrderSummary
                items={cartItems.map((item) => ({
                  id: item.id,
                  product_name: item.product.name,
                  quantity: item.quantity,
                  price: Number(item.product.price as unknown as number),
                  total:
                    Number(item.product.price as unknown as number) *
                    item.quantity,
                  product: {
                    name: item.product.name,
                    images:
                      (
                        item.product as unknown as {
                          images?: { url: string }[];
                        }
                      ).images ?? [],
                  },
                }))}
                subtotal={subtotal}
                shipping={shipping}
                tax={tax}
                discount={discount}
                total={total}
                variant="checkout"
                showItemDetails={true}
                showActions={true}
                actionButton={
                  <>
                    {/* Show order creation status if processing or error */}
                    {(paymentHandler.isLoading || paymentHandler.isError) && (
                      <div className="mb-4">
                        <OrderCreationStatus
                          status={
                            paymentHandler.isLoading ? "processing" : "error"
                          }
                          error={paymentHandler.error || undefined}
                          onRetry={paymentHandler.initializePayment}
                        />
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={!isFormValid || paymentHandler.isLoading}
                      className="w-full bg-trichomes-gold text-trichomes-forest py-3 sm:py-4 rounded-full hover:bg-trichomes-gold-hover font-semibold disabled:bg-trichomes-forest/20 disabled:cursor-not-allowed transition-all duration-150 ease-out hover:shadow-lg text-[14px] sm:text-[15px] font-body"
                    >
                      {paymentHandler.isLoading
                        ? "Processing..."
                        : "Continue to Payment"}
                    </button>

                    {/* Promo Code Section */}
                    <div className="mt-4">
                      {!appliedPromoCode ? (
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={promoCode}
                              onChange={(e) => {
                                setPromoCode(e.target.value.toUpperCase());
                                setPromoCodeError(null);
                              }}
                              placeholder="Enter promo code"
                              className="flex-1 px-3 py-2 text-sm border border-trichomes-forest/15 bg-trichomes-soft focus:ring-1 focus:ring-trichomes-primary focus:border-trichomes-primary outline-none font-body"
                            />
                            <button
                              type="button"
                              onClick={handleApplyPromoCode}
                              disabled={
                                validatePromoCodeQuery.isFetching ||
                                !promoCode.trim()
                              }
                              className="px-4 py-2 text-sm bg-trichomes-primary text-white hover:bg-trichomes-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 font-body"
                            >
                              {validatePromoCodeQuery.isFetching
                                ? "..."
                                : "Apply"}
                            </button>
                          </div>
                          {promoCodeError && (
                            <p className="text-xs text-red-600 font-body">
                              {promoCodeError}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center justify-between p-2 bg-trichomes-primary/10 rounded border border-trichomes-primary/20">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-trichomes-primary font-body">
                              {appliedPromoCode.code}
                            </span>
                            {appliedPromoCode.isFreeShipping ? (
                              <span className="text-xs text-trichomes-forest/70 font-body">
                                Free Shipping
                              </span>
                            ) : (
                              <span className="text-xs text-trichomes-forest/70 font-body">
                                -₦{appliedPromoCode.discount.toLocaleString()}
                              </span>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={handleRemovePromoCode}
                            className="text-xs text-trichomes-forest/60 hover:text-red-600 font-body transition-colors duration-150"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                }
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function CheckoutClient() {
  return <CheckoutPageContent />;
}



"use client";
import type { Prisma, Product as PrismaProduct } from "@prisma/client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useGuestPaymentHandler } from "@/components/checkout/GuestPaymentHandler";
import { OrderCreationStatus } from "@/components/checkout/OrderCreationStatus";
import { usePaymentHandler } from "@/components/checkout/PaymentHandler";
import { SavedAddressesSelector } from "@/components/checkout/SavedAddressesSelector";
import { OrderSummary } from "@/components/orders/OrderSummary";
import {
  calculateShipping,
  getAvailableShippingMethods,
} from "@/lib/shipping/calculate-shipping";
import { getLocalCart } from "@/utils/local-cart";
import { trpc } from "@/utils/trpc";
import { useAuth } from "../../contexts/auth-context";

// Form validation schema
const addressFormSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  address_1: z.string().min(1, "Street address is required"),
  address_2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().optional(),
  postal_code: z.string().optional(),
  country: z.string().default("Nigeria"),
});

type AddressFormData = z.infer<typeof addressFormSchema>;

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

  // Initialize react-hook-form
  const {
    register,
    handleSubmit: handleFormSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
    reset,
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressFormSchema),
    mode: "onChange",
    defaultValues: {
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
    },
  });

  // Watch form values for calculations
  const formData = watch();

  // Update form when session data is available
  useEffect(() => {
    if (session?.user && isAuthenticated && !isGuestMode) {
      setValue("first_name", session.user.first_name || "");
      setValue("last_name", session.user.last_name || "");
      setValue("email", session.user.email || "");
    }
  }, [session, isAuthenticated, isGuestMode, setValue]);

  // Determine cart items based on auth state
  const cartItems = useMemo(() => {
    if (isGuestMode) {
      const products = localProductsQuery.data || [];
      return localCartItems
        .map((localItem) => {
          const product = products.find((p) => p.id === localItem.product_id);
          if (!product) return null;
          return {
            id: localItem.product_id,
            product,
            quantity: localItem.quantity,
          };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null);
    }
    return cartQuery.data?.items || [];
  }, [isGuestMode, localCartItems, localProductsQuery.data, cartQuery.data]);

  const [shippingMethod, setShippingMethod] = useState<"standard" | "express">(
    "standard",
  );

  const [saveAddress, setSaveAddress] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<
    string | undefined
  >();

  // Promo code state
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromoCode, setAppliedPromoCode] = useState<{
    code: string;
    discount: number;
    isFreeShipping: boolean;
  } | null>(null);
  const [promoCodeError, setPromoCodeError] = useState<string | null>(null);

  // Validate promo code query
  const validatePromoCodeQuery = trpc.validatePromoCode.useQuery(
    { code: promoCode },
    { enabled: false },
  );

  const handleApplyPromoCode = async () => {
    if (!promoCode.trim()) {
      setPromoCodeError("Please enter a promo code");
      return;
    }

    try {
      const result = await validatePromoCodeQuery.refetch();
      if (result.data && result.data.isValid) {
        setAppliedPromoCode({
          code: promoCode,
          discount: result.data.discount || 0,
          isFreeShipping: result.data.isFreeShipping || false,
        });
        setPromoCodeError(null);
        toast.success("Promo code applied successfully!");
      } else {
        setPromoCodeError(result.data?.message || "Invalid promo code");
      }
    } catch (error) {
      setPromoCodeError("Failed to validate promo code");
    }
  };

  const handleRemovePromoCode = () => {
    setAppliedPromoCode(null);
    setPromoCode("");
    setPromoCodeError(null);
  };

  // Calculate totals
  const subtotal = useMemo(
    () =>
      cartItems.reduce((sum, item) => {
        const price = Number(item.product.price as unknown as number);
        return sum + price * item.quantity;
      }, 0),
    [cartItems],
  );

  const shippingCalculation = useMemo(() => {
    const input = {
      subtotal,
      weight: cartItems.reduce((sum, item) => {
        const rawWeight = (
          item.product as { weight?: number | Prisma.Decimal | null }
        ).weight;
        const itemWeight =
          (rawWeight !== undefined && rawWeight !== null && Number(rawWeight)) ||
          0.5;
        return sum + itemWeight * item.quantity;
      }, 0),
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

  const handleSelectSavedAddress = (address: Partial<AddressFormData>) => {
    reset({
      ...formData,
      ...address,
    });
    setSelectedAddressId(undefined);
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
        is_default: false,
      });
    } catch (error) {
      console.error("Failed to save address:", error);
    }
  };

  const onSubmit = async (data: AddressFormData) => {
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

  // Show loading state
  if (
    authLoading ||
    (isAuthenticated && !isGuestMode && cartQuery.isLoading) ||
    (isGuestMode && localProductsQuery.isLoading)
  ) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 max-w-[2200px]">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
              <p className="text-gray-600 font-body">Loading checkout...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 max-w-[2200px]">
          <div className="text-center py-12 sm:py-20 bg-gray-50 border border-gray-200 rounded-sm shadow-sm">
            <h1 className="text-[20px] sm:text-[24px] font-heading font-semibold text-gray-900 mb-3 sm:mb-4">
              Your cart is empty
            </h1>
            <p className="text-gray-600 font-body mb-4 sm:mb-6">
              Add some products before checking out.
            </p>
            <Link
              href="/"
              className="inline-block bg-[#1E3024] text-white rounded-full py-3 px-6 sm:px-8 hover:bg-[#1E3024]/90 font-semibold transition-all duration-150 ease-out hover:shadow-lg text-[14px] sm:text-[15px] font-body"
            >
              Continue shopping
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-12 sm:pb-16 max-w-[2200px]">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-600 mb-6 sm:mb-8 font-body">
          <Link
            href="/cart"
            className="hover:text-gray-900 transition-colors duration-150"
          >
            ← Back to cart
          </Link>
        </div>

        {/* Guest checkout notice */}
        {isGuestMode && (
          <div className="mb-6 bg-gray-50 border border-black/20 p-4 rounded-sm">
            <p className="text-[14px] sm:text-[15px] text-gray-900/80 font-body">
              <strong>Guest Checkout:</strong> You're checking out as a guest.
              You can create an account after your order to track it easily.
            </p>
          </div>
        )}

        <form onSubmit={handleFormSubmit(onSubmit)}>
          <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 lg:gap-12">
            {/* Shipping Address Form */}
            <div className="lg:w-2/3">
              <h1 className="text-[24px] sm:text-[32px] font-heading font-semibold mb-4 sm:mb-6 text-gray-900">
                Shipping Information
              </h1>

              <div className="bg-white p-6 sm:p-8 rounded-sm border border-gray-200 shadow-sm">
                {/* Show saved addresses selector for authenticated users */}
                {isAuthenticated && !isGuestMode && (
                  <SavedAddressesSelector
                    onSelectAddress={handleSelectSavedAddress}
                    selectedAddressId={selectedAddressId}
                  />
                )}

                {/* Form Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  {/* First Name */}
                  <div>
                    <label
                      htmlFor="first_name"
                      className="block text-[14px] sm:text-[15px] font-medium text-trichomes-forest mb-1 font-body"
                    >
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="first_name"
                      {...register("first_name")}
                      disabled={isAuthenticated && !isGuestMode}
                      readOnly={isAuthenticated && !isGuestMode}
                      className={`w-full px-4 py-3 border rounded-lg bg-white focus:ring-2 focus:ring-trichomes-primary focus:border-trichomes-primary outline-none text-trichomes-forest font-body transition-all duration-150 ${
                        errors.first_name
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                          : "border-trichomes-forest/20"
                      } ${isAuthenticated && !isGuestMode ? "bg-gray-100 cursor-not-allowed" : ""}`}
                    />
                    {errors.first_name && (
                      <p className="mt-1 text-[12px] sm:text-[13px] text-red-600 font-body">
                        {errors.first_name.message}
                      </p>
                    )}
                  </div>

                  {/* Last Name */}
                  <div>
                    <label
                      htmlFor="last_name"
                      className="block text-[14px] sm:text-[15px] font-medium text-trichomes-forest mb-1 font-body"
                    >
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="last_name"
                      {...register("last_name")}
                      disabled={isAuthenticated && !isGuestMode}
                      readOnly={isAuthenticated && !isGuestMode}
                      className={`w-full px-4 py-3 border rounded-lg bg-white focus:ring-2 focus:ring-trichomes-primary focus:border-trichomes-primary outline-none text-trichomes-forest font-body transition-all duration-150 ${
                        errors.last_name
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                          : "border-trichomes-forest/20"
                      } ${isAuthenticated && !isGuestMode ? "bg-gray-100 cursor-not-allowed" : ""}`}
                    />
                    {errors.last_name && (
                      <p className="mt-1 text-[12px] sm:text-[13px] text-red-600 font-body">
                        {errors.last_name.message}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-[14px] sm:text-[15px] font-medium text-trichomes-forest mb-1 font-body"
                    >
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      {...register("email")}
                      disabled={isAuthenticated && !isGuestMode}
                      readOnly={isAuthenticated && !isGuestMode}
                      className={`w-full px-4 py-3 border rounded-lg bg-white focus:ring-2 focus:ring-trichomes-primary focus:border-trichomes-primary outline-none text-trichomes-forest font-body transition-all duration-150 ${
                        errors.email
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                          : "border-trichomes-forest/20"
                      } ${isAuthenticated && !isGuestMode ? "bg-gray-100 cursor-not-allowed" : ""}`}
                    />
                    {errors.email && (
                      <p className="mt-1 text-[12px] sm:text-[13px] text-red-600 font-body">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-[14px] sm:text-[15px] font-medium text-trichomes-forest mb-1 font-body"
                    >
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      {...register("phone")}
                      placeholder="+234 XXX XXX XXXX"
                      className={`w-full px-4 py-3 border rounded-lg bg-white focus:ring-2 focus:ring-trichomes-primary focus:border-trichomes-primary outline-none text-trichomes-forest font-body transition-all duration-150 ${
                        errors.phone
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                          : "border-trichomes-forest/20"
                      }`}
                    />
                    {errors.phone && (
                      <p className="mt-1 text-[12px] sm:text-[13px] text-red-600 font-body">
                        {errors.phone.message}
                      </p>
                    )}
                  </div>

                  {/* Street Address */}
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="address_1"
                      className="block text-[14px] sm:text-[15px] font-medium text-trichomes-forest mb-1 font-body"
                    >
                      Street Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="address_1"
                      {...register("address_1")}
                      placeholder="Street address"
                      className={`w-full px-4 py-3 border rounded-lg bg-white focus:ring-2 focus:ring-trichomes-primary focus:border-trichomes-primary outline-none text-trichomes-forest font-body transition-all duration-150 ${
                        errors.address_1
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                          : "border-trichomes-forest/20"
                      }`}
                    />
                    {errors.address_1 && (
                      <p className="mt-1 text-[12px] sm:text-[13px] text-red-600 font-body">
                        {errors.address_1.message}
                      </p>
                    )}
                  </div>

                  {/* Address Line 2 */}
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="address_2"
                      className="block text-[14px] sm:text-[15px] font-medium text-trichomes-forest mb-1 font-body"
                    >
                      Address Line 2 (Optional)
                    </label>
                    <input
                      type="text"
                      id="address_2"
                      {...register("address_2")}
                      placeholder="Apartment, suite, etc."
                      className="w-full px-4 py-3 border border-trichomes-forest/20 rounded-lg bg-white focus:ring-2 focus:ring-trichomes-primary focus:border-trichomes-primary outline-none text-trichomes-forest font-body transition-all duration-150"
                    />
                  </div>

                  {/* City */}
                  <div>
                    <label
                      htmlFor="city"
                      className="block text-[14px] sm:text-[15px] font-medium text-trichomes-forest mb-1 font-body"
                    >
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="city"
                      {...register("city")}
                      placeholder="City"
                      className={`w-full px-4 py-3 border rounded-lg bg-white focus:ring-2 focus:ring-trichomes-primary focus:border-trichomes-primary outline-none text-trichomes-forest font-body transition-all duration-150 ${
                        errors.city
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                          : "border-trichomes-forest/20"
                      }`}
                    />
                    {errors.city && (
                      <p className="mt-1 text-[12px] sm:text-[13px] text-red-600 font-body">
                        {errors.city.message}
                      </p>
                    )}
                  </div>

                  {/* State */}
                  <div>
                    <label
                      htmlFor="state"
                      className="block text-[14px] sm:text-[15px] font-medium text-trichomes-forest mb-1 font-body"
                    >
                      State
                    </label>
                    <input
                      type="text"
                      id="state"
                      {...register("state")}
                      placeholder="State"
                      className="w-full px-4 py-3 border border-trichomes-forest/20 rounded-lg bg-white focus:ring-2 focus:ring-trichomes-primary focus:border-trichomes-primary outline-none text-trichomes-forest font-body transition-all duration-150"
                    />
                  </div>

                  {/* Postal Code */}
                  <div>
                    <label
                      htmlFor="postal_code"
                      className="block text-[14px] sm:text-[15px] font-medium text-trichomes-forest mb-1 font-body"
                    >
                      Postal Code
                    </label>
                    <input
                      type="text"
                      id="postal_code"
                      {...register("postal_code")}
                      placeholder="Postal code"
                      className="w-full px-4 py-3 border border-trichomes-forest/20 rounded-lg bg-white focus:ring-2 focus:ring-trichomes-primary focus:border-trichomes-primary outline-none text-trichomes-forest font-body transition-all duration-150"
                    />
                  </div>

                  {/* Country */}
                  <div>
                    <label
                      htmlFor="country"
                      className="block text-[14px] sm:text-[15px] font-medium text-trichomes-forest mb-1 font-body"
                    >
                      Country <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="country"
                      {...register("country")}
                      placeholder="Country"
                      className={`w-full px-4 py-3 border rounded-lg bg-white focus:ring-2 focus:ring-trichomes-primary focus:border-trichomes-primary outline-none text-trichomes-forest font-body transition-all duration-150 ${
                        errors.country
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                          : "border-trichomes-forest/20"
                      }`}
                    />
                    {errors.country && (
                      <p className="mt-1 text-[12px] sm:text-[13px] text-red-600 font-body">
                        {errors.country.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Save address checkbox for authenticated users */}
                {isAuthenticated && !isGuestMode && (
                  <div className="mt-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={saveAddress}
                        onChange={(e) => setSaveAddress(e.target.checked)}
                        className="w-4 h-4 text-black border-black rounded focus:ring-trichomes-primary focus:ring-1"
                      />
                      <span className="text-sm text-gray-900/80 font-body">
                        Save this address for future orders
                      </span>
                    </label>
                  </div>
                )}

                {/* Shipping Method Selection */}
                {formData.city && formData.state && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h3 className="text-sm font-medium text-gray-900 mb-3 font-body">
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
                          className={`flex items-center justify-between p-3 border rounded-sm cursor-pointer transition-all duration-150 ${
                            shippingMethod === method.method
                              ? "border-black bg-gray-50"
                              : "border-gray-200 hover:border-gray-300"
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
                              className="w-4 h-4 text-black border-gray-200 focus:ring-black focus:ring-1"
                            />
                            <div>
                              <div className="font-medium text-gray-900 text-sm font-body">
                                {method.label}
                              </div>
                              {shippingCalculation.isFree &&
                                method.method === "standard" && (
                                  <div className="text-xs text-[#407029] font-body">
                                    Free shipping on orders over ₦50,000
                                  </div>
                                )}
                            </div>
                          </div>
                          <div className="text-sm font-semibold text-gray-900 font-body">
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
                        type="submit"
                        disabled={!isValid || paymentHandler.isLoading}
                        className="w-full bg-[#1E3024] text-white py-3 sm:py-4 rounded-full hover:bg-[#1E3024]/90 font-semibold disabled:bg-gray-200 disabled:cursor-not-allowed transition-all duration-150 ease-out hover:shadow-lg text-[14px] sm:text-[15px] font-body"
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
                                className="flex-1 px-3 py-2 text-sm border border-gray-200 bg-white rounded-sm focus:ring-1 focus:ring-black focus:border-black outline-none font-body"
                              />
                              <button
                                type="button"
                                onClick={handleApplyPromoCode}
                                disabled={
                                  validatePromoCodeQuery.isFetching ||
                                  !promoCode.trim()
                                }
                                className="px-4 py-2 text-sm bg-black text-white rounded-sm hover:bg-black/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 font-body"
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
                          <div className="flex items-center justify-between p-2 bg-gray-50 rounded-sm border border-gray-200">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-900 font-body">
                                {appliedPromoCode.code}
                              </span>
                              {appliedPromoCode.isFreeShipping ? (
                                <span className="text-xs text-gray-600 font-body">
                                  Free Shipping
                                </span>
                              ) : (
                                <span className="text-xs text-gray-600 font-body">
                                  -₦{appliedPromoCode.discount.toLocaleString()}
                                </span>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={handleRemovePromoCode}
                              className="text-xs text-red-600 hover:text-red-700 font-body"
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
        </form>
      </main>
    </div>
  );
}

export default CheckoutPageContent;

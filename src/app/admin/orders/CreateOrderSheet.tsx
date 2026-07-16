"use client";

import { PaymentMethod } from "@prisma/client";
import { useState } from "react";
import { toast } from "sonner";
import { AddressForm, type AddressFormData } from "@/components/forms/AddressForm";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ServerSearchCombobox } from "@/components/ui/server-search-combobox";
import { calculatePaystackFee } from "@/lib/payments/calculate-paystack-fee";
import { trpc } from "@/utils/trpc";

interface CreateOrderSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

interface LineItemRow {
  key: string;
  product_id: string;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  trackQuantity: boolean;
  availableQuantity: number;
}

interface ProductInfo {
  name: string;
  sku: string;
  price: number;
  track_quantity: boolean;
  quantity: number;
}

interface CustomerInfo {
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
}

const MANUAL_PAYMENT_METHODS: PaymentMethod[] = [
  PaymentMethod.BANK_TRANSFER,
  PaymentMethod.FLUTTERWAVE,
  PaymentMethod.USSD,
  PaymentMethod.WALLET,
];

const defaultAddress: AddressFormData = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  address_1: "",
  address_2: "",
  city: "",
  state: "",
  postal_code: "",
  country: "Nigeria",
};

function newLineItem(): LineItemRow {
  return {
    key: crypto.randomUUID(),
    product_id: "",
    name: "",
    sku: "",
    price: 0,
    quantity: 1,
    trackQuantity: false,
    availableQuantity: 0,
  };
}

export function CreateOrderSheet({
  open,
  onOpenChange,
  onSuccess,
}: CreateOrderSheetProps) {
  const utils = trpc.useUtils();

  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [selectedCustomerLabel, setSelectedCustomerLabel] = useState("");
  const [customerCache, setCustomerCache] = useState<
    Record<string, CustomerInfo>
  >({});

  const [addressData, setAddressData] = useState<AddressFormData>(defaultAddress);
  const [addressKey, setAddressKey] = useState(0);

  const [lineItems, setLineItems] = useState<LineItemRow[]>([newLineItem()]);
  const [productCache, setProductCache] = useState<Record<string, ProductInfo>>(
    {},
  );

  const [shippingCost, setShippingCost] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState("");

  const [paymentMode, setPaymentMode] = useState<"verify" | "manual">("verify");
  const [paystackReference, setPaystackReference] = useState("");
  const [manualMethod, setManualMethod] = useState<PaymentMethod>(
    PaymentMethod.BANK_TRANSFER,
  );
  const [manualReference, setManualReference] = useState("");
  const [justification, setJustification] = useState("");

  const userAddressesQuery = trpc.getUserById.useQuery(
    { id: selectedCustomerId },
    { enabled: !!selectedCustomerId },
  );

  const createMutation = trpc.adminCreateOrder.useMutation({
    onSuccess: (result) => {
      utils.getOrders.invalidate();
      utils.getOrderStats.invalidate();
      toast.success(`Order ${result.orderNumber} created and marked paid`);
      onSuccess?.();
      resetForm();
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(`Failed to create order: ${error.message}`);
    },
  });

  const resetForm = () => {
    setSelectedCustomerId("");
    setSelectedCustomerLabel("");
    setAddressData(defaultAddress);
    setAddressKey((k) => k + 1);
    setLineItems([newLineItem()]);
    setShippingCost(0);
    setDiscount(0);
    setNotes("");
    setPaymentMode("verify");
    setPaystackReference("");
    setManualMethod(PaymentMethod.BANK_TRANSFER);
    setManualReference("");
    setJustification("");
  };

  const customerLabel = (info: CustomerInfo) => {
    const name = `${info.first_name || ""} ${info.last_name || ""}`.trim();
    return name ? `${name} — ${info.email}` : info.email;
  };

  const searchCustomers = async (query: string) => {
    const result = await utils.client.getCustomers.query({
      search: query,
      limit: 20,
    });
    setCustomerCache((prev) => {
      const next = { ...prev };
      for (const c of result.customers) {
        next[c.id] = {
          email: c.email,
          first_name: c.first_name,
          last_name: c.last_name,
          phone: c.phone,
        };
      }
      return next;
    });
    return result.customers.map((c) => ({
      label: customerLabel(c),
      value: c.id,
    }));
  };

  const handleCustomerChange = (value: string, isNew: boolean) => {
    if (isNew) return; // customers can't be created inline here
    setSelectedCustomerId(value);
    const info = value ? customerCache[value] : undefined;
    setSelectedCustomerLabel(info ? customerLabel(info) : "");
    if (info) {
      setAddressData((prev) => ({
        ...prev,
        email: info.email,
        first_name: info.first_name || prev.first_name,
        last_name: info.last_name || prev.last_name,
        phone: info.phone || prev.phone,
      }));
      setAddressKey((k) => k + 1);
    }
  };

  const applySavedAddress = (addr: {
    first_name: string;
    last_name: string;
    address_1: string;
    address_2: string | null;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    phone: string | null;
  }) => {
    setAddressData((prev) => ({
      ...prev,
      first_name: addr.first_name,
      last_name: addr.last_name,
      address_1: addr.address_1,
      address_2: addr.address_2 || "",
      city: addr.city,
      state: addr.state,
      postal_code: addr.postal_code,
      country: addr.country,
      phone: addr.phone || prev.phone,
    }));
    setAddressKey((k) => k + 1);
  };

  const productLabel = (info: { name: string; sku: string; price: number }) =>
    `${info.name} — ₦${info.price.toLocaleString()} (${info.sku})`;

  const searchProducts = async (query: string) => {
    const result = await utils.client.getProducts.query({
      search: query,
      limit: 20,
      status: "ACTIVE",
    });
    setProductCache((prev) => {
      const next = { ...prev };
      for (const p of result.products) {
        next[p.id] = {
          name: p.name,
          sku: p.sku,
          price: Number(p.price),
          track_quantity: p.track_quantity,
          quantity: p.quantity,
        };
      }
      return next;
    });
    return result.products.map((p) => ({
      label: productLabel({ name: p.name, sku: p.sku, price: Number(p.price) }),
      value: p.id,
    }));
  };

  const handleLineItemProductChange = (
    rowKey: string,
    value: string,
    isNew: boolean,
  ) => {
    if (isNew) {
      toast.info("Product not found — add it in the Products page first");
      return;
    }
    if (!value) {
      setLineItems((items) =>
        items.map((item) =>
          item.key === rowKey
            ? {
                ...item,
                product_id: "",
                name: "",
                sku: "",
                price: 0,
                trackQuantity: false,
                availableQuantity: 0,
              }
            : item,
        ),
      );
      return;
    }
    const info = productCache[value];
    if (!info) return;
    setLineItems((items) =>
      items.map((item) =>
        item.key === rowKey
          ? {
              ...item,
              product_id: value,
              name: info.name,
              sku: info.sku,
              price: info.price,
              trackQuantity: info.track_quantity,
              availableQuantity: info.quantity,
              quantity: 1,
            }
          : item,
      ),
    );
  };

  const updateLineItemQuantity = (rowKey: string, quantity: number) => {
    setLineItems((items) =>
      items.map((item) =>
        item.key === rowKey ? { ...item, quantity: Math.max(1, quantity) } : item,
      ),
    );
  };

  const removeLineItem = (rowKey: string) => {
    setLineItems((items) =>
      items.length > 1 ? items.filter((item) => item.key !== rowKey) : items,
    );
  };

  const validItems = lineItems.filter((item) => item.product_id);
  const subtotal = validItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const total = subtotal + shippingCost - discount;
  // The Paystack fee only applies when verifying a real transaction — manual
  // /offline payments have no gateway involved, matching adminCreateOrder.
  const fee = paymentMode === "verify" ? calculatePaystackFee(total) : 0;
  const grandTotal = total + fee;

  const handleSubmit = () => {
    if (validItems.length === 0) {
      toast.error("Add at least one product");
      return;
    }
    for (const item of validItems) {
      if (item.trackQuantity && item.quantity > item.availableQuantity) {
        toast.error(
          `Only ${item.availableQuantity} of "${item.name}" in stock`,
        );
        return;
      }
    }

    if (paymentMode === "verify" && !paystackReference.trim()) {
      toast.error("Enter the Paystack transaction reference");
      return;
    }
    if (paymentMode === "manual" && justification.trim().length < 10) {
      toast.error(
        "Explain why this payment is being recorded manually (min 10 characters)",
      );
      return;
    }

    createMutation.mutate({
      user_id: selectedCustomerId || undefined,
      address: addressData,
      items: validItems.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
      })),
      shipping_cost: shippingCost,
      discount,
      notes: notes || undefined,
      payment:
        paymentMode === "verify"
          ? { mode: "verify", paystack_reference: paystackReference.trim() }
          : {
              mode: "manual",
              payment_method: manualMethod,
              amount: total,
              reference: manualReference || undefined,
              justification: justification.trim(),
            },
    });
  };

  const isSubmitting = createMutation.isPending;

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        if (!next) resetForm();
        onOpenChange(next);
      }}
    >
      <SheetContent className="w-full sm:max-w-2xl p-5 overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Create Order</SheetTitle>
          <SheetDescription>
            Manually record an order and mark it paid — for recovering a payment
            that succeeded but wasn't recorded, or a genuine offline sale.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Customer */}
          <div>
            <label
              htmlFor="order-customer"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Customer (optional)
            </label>
            <ServerSearchCombobox
              id="order-customer"
              value={selectedCustomerId}
              onChange={handleCustomerChange}
              onSearch={searchCustomers}
              placeholder="Search registered customers, or leave blank for a guest order..."
              createLabel=""
              debounceMs={300}
              minSearchLength={1}
              initialOptions={
                selectedCustomerId
                  ? [
                      {
                        label: selectedCustomerLabel,
                        value: selectedCustomerId,
                      },
                    ]
                  : []
              }
            />
            <p className="mt-1 text-xs text-gray-500">
              Leave blank to create a guest order using the contact details
              entered below.
            </p>
          </div>

          {selectedCustomerId &&
            userAddressesQuery.data &&
            userAddressesQuery.data.addresses.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Saved addresses
                </p>
                <div className="flex flex-wrap gap-2">
                  {userAddressesQuery.data.addresses.map((addr) => (
                    <button
                      key={addr.id}
                      type="button"
                      onClick={() => applySavedAddress(addr)}
                      className="text-xs px-3 py-1.5 border border-gray-300 rounded-full hover:bg-gray-50"
                    >
                      {addr.address_1}, {addr.city}
                    </button>
                  ))}
                </div>
              </div>
            )}

          {/* Address / contact */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">
              Contact & shipping address
            </p>
            <AddressForm
              key={addressKey}
              asDiv
              initialValues={addressData}
              onChange={setAddressData}
              isLoading={isSubmitting}
            />
          </div>

          {/* Line items */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Items</p>
            <div className="space-y-3">
              {lineItems.map((item) => (
                <div key={item.key} className="flex items-start gap-2">
                  <div className="flex-1">
                    <ServerSearchCombobox
                      value={item.product_id}
                      onChange={(value, isNew) =>
                        handleLineItemProductChange(item.key, value, isNew)
                      }
                      onSearch={searchProducts}
                      placeholder="Search products..."
                      createLabel=""
                      debounceMs={300}
                      minSearchLength={1}
                      disabled={isSubmitting}
                      initialOptions={
                        item.product_id
                          ? [
                              {
                                label: productLabel(item),
                                value: item.product_id,
                              },
                            ]
                          : []
                      }
                    />
                    {item.trackQuantity && (
                      <p className="mt-1 text-xs text-gray-500">
                        {item.availableQuantity} in stock
                      </p>
                    )}
                  </div>
                  <input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) =>
                      updateLineItemQuantity(
                        item.key,
                        Number.parseInt(e.target.value, 10) || 1,
                      )
                    }
                    disabled={isSubmitting || !item.product_id}
                    className="w-20 px-2 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                  />
                  <span className="w-28 pt-2 text-sm text-gray-700 text-right">
                    ₦{(item.price * item.quantity).toLocaleString()}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeLineItem(item.key)}
                    disabled={isSubmitting || lineItems.length === 1}
                    className="p-2 text-gray-400 hover:text-red-600 disabled:opacity-30"
                    title="Remove item"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setLineItems((items) => [...items, newLineItem()])}
              disabled={isSubmitting}
              className="mt-3 text-sm text-[#38761d] hover:underline"
            >
              + Add item
            </button>
          </div>

          {/* Shipping & discount */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="order-shipping"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Shipping cost (₦)
              </label>
              <input
                id="order-shipping"
                type="number"
                min={0}
                step="0.01"
                value={shippingCost}
                onChange={(e) =>
                  setShippingCost(Number.parseFloat(e.target.value) || 0)
                }
                disabled={isSubmitting}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div>
              <label
                htmlFor="order-discount"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Discount (₦)
              </label>
              <input
                id="order-discount"
                type="number"
                min={0}
                step="0.01"
                value={discount}
                onChange={(e) =>
                  setDiscount(Number.parseFloat(e.target.value) || 0)
                }
                disabled={isSubmitting}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>

          <div className="flex justify-between text-sm border-t pt-3">
            <span className="text-gray-600">Subtotal</span>
            <span className="text-gray-900">₦{subtotal.toLocaleString()}</span>
          </div>
          {fee > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Payment processing fee</span>
              <span className="text-gray-900">₦{fee.toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between font-medium border-t pt-3">
            <span>Total</span>
            <span>₦{grandTotal.toLocaleString()}</span>
          </div>

          {/* Payment */}
          <div className="border-t pt-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Payment</p>
            <div className="flex gap-2 mb-3">
              <button
                type="button"
                onClick={() => setPaymentMode("verify")}
                disabled={isSubmitting}
                className={`flex-1 px-3 py-2 text-sm rounded-lg border ${
                  paymentMode === "verify"
                    ? "border-[#38761d] bg-green-50 text-[#38761d] font-medium"
                    : "border-gray-300 text-gray-600"
                }`}
              >
                Verify Paystack reference
              </button>
              <button
                type="button"
                onClick={() => setPaymentMode("manual")}
                disabled={isSubmitting}
                className={`flex-1 px-3 py-2 text-sm rounded-lg border ${
                  paymentMode === "manual"
                    ? "border-[#38761d] bg-green-50 text-[#38761d] font-medium"
                    : "border-gray-300 text-gray-600"
                }`}
              >
                Manual / offline
              </button>
            </div>

            {paymentMode === "verify" ? (
              <div>
                <label
                  htmlFor="order-paystack-ref"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Paystack reference *
                </label>
                <input
                  id="order-paystack-ref"
                  type="text"
                  value={paystackReference}
                  onChange={(e) => setPaystackReference(e.target.value)}
                  placeholder="e.g. T123456789"
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Verified server-side against Paystack; the paid amount must
                  match the order total above, which includes the ₦
                  {fee.toLocaleString()} Paystack processing fee.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label
                    htmlFor="order-manual-method"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Payment method
                  </label>
                  <select
                    id="order-manual-method"
                    value={manualMethod}
                    onChange={(e) =>
                      setManualMethod(e.target.value as PaymentMethod)
                    }
                    disabled={isSubmitting}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                  >
                    {MANUAL_PAYMENT_METHODS.map((method) => (
                      <option key={method} value={method}>
                        {method.replace("_", " ")}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="order-manual-reference"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Reference (optional)
                  </label>
                  <input
                    id="order-manual-reference"
                    type="text"
                    value={manualReference}
                    onChange={(e) => setManualReference(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="order-justification"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Justification *
                  </label>
                  <textarea
                    id="order-justification"
                    value={justification}
                    onChange={(e) => setJustification(e.target.value)}
                    rows={2}
                    placeholder="Why is this being recorded without Paystack verification?"
                    disabled={isSubmitting}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Amount charged: ₦{grandTotal.toLocaleString()} (matches
                  order total)
                </p>
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label
              htmlFor="order-notes"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Admin notes (optional)
            </label>
            <textarea
              id="order-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="e.g. Recovered — checkout payment succeeded but order was not recorded"
              disabled={isSubmitting}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-4 py-2 bg-[#38761d] text-white rounded-lg hover:bg-opacity-90 disabled:opacity-50"
            >
              {isSubmitting ? "Creating..." : "Create Order"}
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

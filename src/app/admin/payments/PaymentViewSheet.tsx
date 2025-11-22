"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { trpc } from "@/utils/trpc";
import { format } from "date-fns";

interface PaymentViewSheetProps {
  paymentId: string | undefined;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PaymentViewSheet({
  paymentId,
  open,
  onOpenChange,
}: PaymentViewSheetProps) {
  const paymentQuery = trpc.getPaymentById.useQuery(
    { id: paymentId! },
    {
      enabled: !!paymentId && open,
    },
  );

  const payment = paymentQuery.data;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Payment Details</SheetTitle>
        </SheetHeader>

        {paymentQuery.isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-[#38761d] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : paymentQuery.error ? (
          <div className="text-center py-12 text-red-600">
            Error loading payment details
          </div>
        ) : payment ? (
          <div className="space-y-6">
            {/* Payment Information */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4">
                Payment Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Transaction ID</p>
                  <p className="font-medium text-gray-900">
                    {payment.transaction_id || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Reference</p>
                  <p className="font-medium text-gray-900">
                    {payment.reference || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Amount</p>
                  <p className="font-medium text-gray-900">
                    ₦{Number(payment.amount).toLocaleString()} {payment.currency}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Payment Method</p>
                  <p className="font-medium text-gray-900">
                    {payment.payment_method}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <span
                    className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                      payment.status === "COMPLETED"
                        ? "bg-green-100 text-green-800"
                        : payment.status === "PENDING"
                          ? "bg-yellow-100 text-yellow-800"
                          : payment.status === "FAILED"
                            ? "bg-red-100 text-red-800"
                            : payment.status === "REFUNDED" ||
                                payment.status === "PARTIALLY_REFUNDED"
                              ? "bg-orange-100 text-orange-800"
                              : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {payment.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-medium text-gray-900">
                    {format(new Date(payment.created_at), "PPp")}
                  </p>
                </div>
                {payment.failure_reason && (
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500">Failure Reason</p>
                    <p className="font-medium text-red-600">
                      {payment.failure_reason}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Order Information */}
            {payment.order && (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4">
                  Order Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Order Number</p>
                    <p className="font-medium text-gray-900">
                      #{payment.order.order_number}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Order Total</p>
                    <p className="font-medium text-gray-900">
                      ₦{Number(payment.order.total).toLocaleString()}
                    </p>
                  </div>
                  {payment.order.user && (
                    <>
                      <div>
                        <p className="text-sm text-gray-500">Customer</p>
                        <p className="font-medium text-gray-900">
                          {payment.order.user.first_name}{" "}
                          {payment.order.user.last_name}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium text-gray-900">
                          {payment.order.user.email}
                        </p>
                      </div>
                    </>
                  )}
                </div>

                {/* Order Items */}
                {payment.order.items && payment.order.items.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-500 mb-2">Order Items</p>
                    <div className="space-y-2">
                      {payment.order.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-3 p-2 bg-white rounded border border-gray-200"
                        >
                          {item.product?.images?.[0] && (
                            <img
                              src={item.product.images[0].url}
                              alt={item.product.name}
                              className="w-12 h-12 object-cover rounded"
                            />
                          )}
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">
                              {item.product_name}
                            </p>
                            <p className="text-sm text-gray-500">
                              Qty: {item.quantity} × ₦
                              {Number(item.price).toLocaleString()}
                            </p>
                          </div>
                          <p className="font-medium text-gray-900">
                            ₦{Number(item.total).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Gateway Response */}
            {payment.gateway_response && (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Gateway Response
                </h3>
                <pre className="text-xs bg-white p-3 rounded border border-gray-200 overflow-x-auto">
                  {JSON.stringify(payment.gateway_response, null, 2)}
                </pre>
              </div>
            )}
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}


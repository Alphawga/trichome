"use client";

import type { PaymentMethod, PaymentStatus } from "@prisma/client";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { type Column, DataTable } from "@/components/ui/data-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  EditIcon,
  ExportIcon,
  EyeIcon,
  RefundIcon,
  SearchIcon,
} from "@/components/ui/icons";
import { trpc } from "@/utils/trpc";
import { exportToCSV, type CSVColumn } from "@/utils/csv-export";
import { PaymentViewSheet } from "./PaymentViewSheet";
import { PaymentRefundSheet } from "./PaymentRefundSheet";

type PaymentWithRelations = {
  id: string;
  order_id: string;
  payment_method: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  currency: string;
  transaction_id: string | null;
  reference: string | null;
  failure_reason: string | null;
  created_at: Date;
  order: {
    id: string;
    order_number: string;
    email: string;
    first_name: string;
    last_name: string;
    total: number;
  };
};

export default function AdminPaymentsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | "All">(
    "All",
  );
  const [methodFilter, setMethodFilter] = useState<PaymentMethod | "All">(
    "All",
  );
  const [viewSheetOpen, setViewSheetOpen] = useState(false);
  const [refundSheetOpen, setRefundSheetOpen] = useState(false);
  const [viewingPaymentId, setViewingPaymentId] = useState<string | undefined>();
  const [refundingPaymentId, setRefundingPaymentId] = useState<
    string | undefined
  >();

  const paymentsQuery = trpc.getPayments.useQuery(
    {
      page: 1,
      limit: 100,
      status: statusFilter !== "All" ? statusFilter : undefined,
      payment_method: methodFilter !== "All" ? methodFilter : undefined,
      search: searchTerm.trim() || undefined,
    },
    {
      staleTime: 30000,
      refetchOnWindowFocus: false,
    },
  );

  const statsQuery = trpc.getPaymentStats.useQuery(undefined, {
    staleTime: 60000,
    refetchOnWindowFocus: false,
  });

  const payments = paymentsQuery.data?.payments || [];
  const stats = statsQuery.data;

  const handleViewPayment = useCallback((id: string) => {
    setViewingPaymentId(id);
    setViewSheetOpen(true);
  }, []);

  const handleRefundPayment = useCallback((id: string) => {
    setRefundingPaymentId(id);
    setRefundSheetOpen(true);
  }, []);

  const handleExportCSV = () => {
    const columns: CSVColumn<PaymentWithRelations>[] = [
      {
        key: (p) => p.transaction_id || p.reference || "N/A",
        label: "Transaction ID",
      },
      {
        key: (p) => p.order.order_number,
        label: "Order Number",
      },
      {
        key: (p) => `${p.order.first_name} ${p.order.last_name}`,
        label: "Customer",
      },
      { key: (p) => p.order.email, label: "Email" },
      {
        key: (p) => Number(p.amount).toLocaleString(),
        label: "Amount (₦)",
      },
      {
        key: (p) => p.payment_method,
        label: "Payment Method",
      },
      {
        key: (p) =>
          p.status === "COMPLETED"
            ? "Completed"
            : p.status === "PENDING"
              ? "Pending"
              : p.status === "FAILED"
                ? "Failed"
                : p.status === "REFUNDED"
                  ? "Refunded"
                  : p.status,
        label: "Status",
      },
      {
        key: (p) => new Date(p.created_at).toLocaleDateString(),
        label: "Date",
      },
    ];
    exportToCSV(payments, columns, "payments");
  };

  const columns: Column<PaymentWithRelations>[] = useMemo(
    () => [
      {
        header: "Transaction",
        cell: (payment) => (
          <div>
            <span className="font-medium text-gray-900">
              {payment.transaction_id || payment.reference || "N/A"}
            </span>
            <p className="text-sm text-gray-500">
              Ref: {payment.reference || "N/A"}
            </p>
          </div>
        ),
      },
      {
        header: "Order",
        cell: (payment) => (
          <div>
            <span className="font-medium text-gray-900">
              #{payment.order.order_number}
            </span>
            <p className="text-sm text-gray-500">{payment.order.email}</p>
          </div>
        ),
      },
      {
        header: "Customer",
        cell: (payment) => (
          <span className="text-gray-600">
            {payment.order.first_name} {payment.order.last_name}
          </span>
        ),
      },
      {
        header: "Amount",
        cell: (payment) => (
          <span className="font-medium text-gray-900">
            ₦{Number(payment.amount).toLocaleString()}
          </span>
        ),
      },
      {
        header: "Method",
        cell: (payment) => (
          <span className="text-gray-600">{payment.payment_method}</span>
        ),
      },
      {
        header: "Status",
        cell: (payment) => (
          <span
            className={`px-2 py-1 text-xs font-semibold rounded-full ${
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
            {payment.status === "COMPLETED"
              ? "Completed"
              : payment.status === "PENDING"
                ? "Pending"
                : payment.status === "FAILED"
                  ? "Failed"
                  : payment.status === "REFUNDED"
                    ? "Refunded"
                    : payment.status === "PARTIALLY_REFUNDED"
                      ? "Partially Refunded"
                      : payment.status}
          </span>
        ),
      },
      {
        header: "Date",
        cell: (payment) => (
          <span className="text-gray-600">
            {new Date(payment.created_at).toLocaleDateString()}
          </span>
        ),
      },
      {
        header: "Actions",
        cell: (payment) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                title="Actions"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <title>Open actions</title>
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={() => handleViewPayment(payment.id)}
                className="cursor-pointer"
              >
                <EyeIcon className="w-4 h-4 mr-2" />
                View Details
              </DropdownMenuItem>
              {payment.status === "COMPLETED" && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => handleRefundPayment(payment.id)}
                    className="cursor-pointer text-orange-600 focus:text-orange-600 focus:bg-orange-50"
                  >
                    <RefundIcon className="w-4 h-4 mr-2" />
                    Process Refund
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [handleViewPayment, handleRefundPayment],
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Payments Management</h1>
        <p className="text-gray-600">View and manage payment transactions</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <div className="w-6 h-6 text-blue-600">💳</div>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Total Payments</p>
              <p className="text-2xl font-bold">
                {statsQuery.isLoading ? "..." : stats?.total || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <div className="w-6 h-6 text-green-600">✓</div>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Completed</p>
              <p className="text-2xl font-bold">
                {statsQuery.isLoading ? "..." : stats?.completed || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <div className="w-6 h-6 text-yellow-600">⏳</div>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Pending</p>
              <p className="text-2xl font-bold">
                {statsQuery.isLoading ? "..." : stats?.pending || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <div className="w-6 h-6 text-red-600">✗</div>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Failed</p>
              <p className="text-2xl font-bold">
                {statsQuery.isLoading ? "..." : stats?.failed || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <div className="w-6 h-6 text-purple-600">💰</div>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Total Revenue</p>
              <p className="text-2xl font-bold">
                {statsQuery.isLoading
                  ? "..."
                  : `₦${Number(stats?.totalRevenue || 0).toLocaleString()}`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by transaction ID, reference, or order number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 outline-none"
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <SearchIcon />
            </div>
          </div>

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as PaymentStatus | "All")
            }
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 outline-none"
          >
            <option value="All">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="PROCESSING">Processing</option>
            <option value="COMPLETED">Completed</option>
            <option value="FAILED">Failed</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="REFUNDED">Refunded</option>
            <option value="PARTIALLY_REFUNDED">Partially Refunded</option>
          </select>

          <select
            value={methodFilter}
            onChange={(e) =>
              setMethodFilter(e.target.value as PaymentMethod | "All")
            }
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 outline-none"
          >
            <option value="All">All Methods</option>
            <option value="PAYSTACK">Paystack</option>
            <option value="FLUTTERWAVE">Flutterwave</option>
            <option value="BANK_TRANSFER">Bank Transfer</option>
            <option value="USSD">USSD</option>
            <option value="WALLET">Wallet</option>
          </select>

          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 font-medium transition-colors"
          >
            <ExportIcon /> Export CSV
          </button>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={payments}
        isLoading={paymentsQuery.isLoading}
        error={paymentsQuery.error}
        onRetry={() => paymentsQuery.refetch()}
        emptyMessage="No payments found matching your filters"
        keyExtractor={(payment) => payment.id}
      />

      {/* View Sheet */}
      <PaymentViewSheet
        paymentId={viewingPaymentId}
        open={viewSheetOpen}
        onOpenChange={setViewSheetOpen}
      />

      {/* Refund Sheet */}
      <PaymentRefundSheet
        paymentId={refundingPaymentId}
        open={refundSheetOpen}
        onOpenChange={setRefundSheetOpen}
        onSuccess={() => {
          paymentsQuery.refetch();
          statsQuery.refetch();
        }}
      />
    </div>
  );
}


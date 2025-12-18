"use client";

import type { Address, User, UserStatus } from "@prisma/client";
import Image from "next/image";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
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
  MailIcon,
  SearchIcon,
} from "@/components/ui/icons";
import { trpc } from "@/utils/trpc";
import { exportToCSV, type CSVColumn } from "@/utils/csv-export";
import { CustomerEditSheet } from "./CustomerEditSheet";
import { CustomerViewSheet } from "./CustomerViewSheet";

// Type for customer from backend (extending Prisma User with computed fields)
type Customer = Pick<
  User,
  | "id"
  | "email"
  | "first_name"
  | "last_name"
  | "phone"
  | "status"
  | "role"
  | "image"
  | "created_at"
  | "last_login_at"
> & {
  totalOrders: number;
  totalSpent: number;
  lastOrderDate?: Date;
  loyaltyPoints: number;
  addresses: Array<Pick<Address, "city" | "state" | "country">>;
};

export default function AdminCustomersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<UserStatus | "All">("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewCustomerId, setViewCustomerId] = useState<string | null>(null);
  const [editCustomerId, setEditCustomerId] = useState<string | null>(null);

  // Bulk selection state
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<Set<string>>(
    new Set(),
  );
  const [bulkStatusConfirmOpen, setBulkStatusConfirmOpen] = useState(false);
  const [pendingBulkStatus, setPendingBulkStatus] =
    useState<UserStatus | null>(null);

  // Single customer deactivate state
  const [deactivateCustomerId, setDeactivateCustomerId] = useState<string | null>(null);
  const [deactivateConfirmOpen, setDeactivateConfirmOpen] = useState(false);

  // Fetch customers from database
  const customersQuery = trpc.getCustomers.useQuery(
    {
      page: currentPage,
      limit: 10,
      status: statusFilter !== "All" ? statusFilter : undefined,
      search: searchTerm || undefined,
    },
    {
      refetchOnWindowFocus: false,
    },
  );

  // Fetch customer statistics
  const statsQuery = trpc.getUserStats.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  const bulkUpdateStatusMutation = trpc.bulkUpdateUserStatus.useMutation({
    onSuccess: (data) => {
      customersQuery.refetch();
      statsQuery.refetch();
      setSelectedCustomerIds(new Set());
      setBulkStatusConfirmOpen(false);
      setPendingBulkStatus(null);
      toast.success(data.message);
    },
    onError: (error) => {
      toast.error(`Failed to update customers: ${error.message}`);
    },
  });

  // Single customer deactivate mutation
  const updateCustomerStatusMutation = trpc.updateUser.useMutation({
    onSuccess: () => {
      customersQuery.refetch();
      statsQuery.refetch();
      setDeactivateConfirmOpen(false);
      setDeactivateCustomerId(null);
      toast.success("Customer status updated successfully");
    },
    onError: (error) => {
      toast.error(`Failed to update status: ${error.message}`);
    },
  });

  const customers = customersQuery.data?.customers || [];
  const stats = statsQuery.data;

  // Bulk selection handlers
  const handleSelectAll = useCallback(
    (checked: boolean) => {
      if (checked) {
        setSelectedCustomerIds(new Set(customers.map((c) => c.id)));
      } else {
        setSelectedCustomerIds(new Set());
      }
    },
    [customers],
  );

  const handleSelectCustomer = useCallback(
    (customerId: string, checked: boolean) => {
      setSelectedCustomerIds((prev) => {
        const newSet = new Set(prev);
        if (checked) {
          newSet.add(customerId);
        } else {
          newSet.delete(customerId);
        }
        return newSet;
      });
    },
    [],
  );

  const isAllSelected =
    customers.length > 0 &&
    customers.every((c) => selectedCustomerIds.has(c.id));
  const isSomeSelected = selectedCustomerIds.size > 0;

  const handleBulkStatusChange = (status: UserStatus) => {
    if (selectedCustomerIds.size === 0) return;
    setPendingBulkStatus(status);
    setBulkStatusConfirmOpen(true);
  };

  const confirmBulkStatusChange = async () => {
    if (!pendingBulkStatus) return;
    await bulkUpdateStatusMutation.mutateAsync({
      ids: Array.from(selectedCustomerIds),
      status: pendingBulkStatus,
    });
  };

  const handleViewCustomer = useCallback((id: string) => {
    setViewCustomerId(id);
  }, []);

  const handleEditCustomer = useCallback((id: string) => {
    setEditCustomerId(id);
  }, []);

  const handleContactCustomer = useCallback((email: string) => {
    window.location.href = `mailto:${email}`;
  }, []);

  const handleDeactivateCustomer = useCallback((customerId: string) => {
    setDeactivateCustomerId(customerId);
    setDeactivateConfirmOpen(true);
  }, []);

  const confirmDeactivateCustomer = async () => {
    if (!deactivateCustomerId) return;
    const customerToUpdate = customers.find((c) => c.id === deactivateCustomerId);
    const newStatus = customerToUpdate?.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    await updateCustomerStatusMutation.mutateAsync({
      id: deactivateCustomerId,
      status: newStatus,
    });
  };

  // Get selected customers for sheets
  const selectedViewCustomer =
    customers.find((c) => c.id === viewCustomerId) || null;
  const selectedEditCustomer =
    customers.find((c) => c.id === editCustomerId) || null;

  const handleExportCSV = () => {
    const columns: CSVColumn<Customer>[] = [
      {
        key: (c) =>
          c.first_name || c.last_name
            ? `${c.first_name || ""} ${c.last_name || ""}`.trim()
            : "No name",
        label: "Name",
      },
      { key: "email", label: "Email" },
      { key: (c) => c.phone || "N/A", label: "Phone" },
      {
        key: (c) => c.addresses[0]?.city || "N/A",
        label: "City",
      },
      {
        key: (c) => c.addresses[0]?.state || "N/A",
        label: "State",
      },
      { key: "totalOrders", label: "Total Orders" },
      { key: (c) => c.totalSpent.toLocaleString(), label: "Total Spent (₦)" },
      { key: "loyaltyPoints", label: "Loyalty Points" },
      {
        key: (c) =>
          c.status === "PENDING_VERIFICATION"
            ? "Pending"
            : c.status.toLowerCase(),
        label: "Status",
      },
      {
        key: (c) =>
          c.lastOrderDate
            ? new Date(c.lastOrderDate).toLocaleDateString()
            : "No orders",
        label: "Last Order",
      },
    ];
    exportToCSV(customers, columns, "customers");
    toast.success("Customers exported to CSV");
  };

  const statuses: Array<UserStatus | "All"> = [
    "All",
    "ACTIVE",
    "INACTIVE",
    "SUSPENDED",
    "PENDING_VERIFICATION",
  ];

  const statusLabels: Record<UserStatus | "All", string> = {
    All: "All Status",
    ACTIVE: "Active",
    INACTIVE: "Inactive",
    SUSPENDED: "Suspended",
    PENDING_VERIFICATION: "Pending Verification",
  };

  // Get top customers by spending
  const topCustomers = [...customers]
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 5);

  // Get location distribution
  const locationMap = new Map<string, number>();
  customers.forEach((customer) => {
    const location = customer.addresses[0];
    if (location) {
      const key = location.state;
      locationMap.set(key, (locationMap.get(key) || 0) + 1);
    }
  });
  const locationDistribution = Array.from(locationMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Define table columns
  const columns: Column<Customer>[] = useMemo(
    () => [
      {
        header: "",
        className: "w-12",
        cell: (customer) => (
          <input
            type="checkbox"
            checked={selectedCustomerIds.has(customer.id)}
            onChange={(e) =>
              handleSelectCustomer(customer.id, e.target.checked)
            }
            className="w-4 h-4 text-[#38761d] focus:ring-[#38761d] border-gray-300 rounded cursor-pointer"
            onClick={(e) => e.stopPropagation()}
          />
        ),
      },
      {
        header: "Customer",
        cell: (customer) => (
          <div className="flex items-center">
            <div className="relative w-10 h-10 mr-4 flex-shrink-0">
              <Image
                src={
                  customer.image ||
                  `https://placehold.co/80x80/38761d/white?text=${customer.first_name?.[0] || "U"}`
                }
                alt={
                  `${customer.first_name || ""} ${customer.last_name || ""}`.trim() ||
                  "Customer"
                }
                fill
                className="rounded-full object-cover"
              />
            </div>
            <div>
              <span className="font-medium text-gray-900">
                {customer.first_name || customer.last_name
                  ? `${customer.first_name || ""} ${customer.last_name || ""}`.trim()
                  : "No name"}
              </span>
              <p className="text-sm text-gray-500">
                ID: {customer.id.slice(0, 8)}
              </p>
            </div>
          </div>
        ),
      },
      {
        header: "Contact",
        cell: (customer) => (
          <div>
            <span className="text-gray-900">{customer.email}</span>
            <p className="text-sm text-gray-500">
              {customer.phone || "No phone"}
            </p>
          </div>
        ),
      },
      {
        header: "Location",
        cell: (customer) => {
          const address = customer.addresses[0];
          return (
            <span className="text-gray-600">
              {address ? `${address.city}, ${address.state}` : "No address"}
            </span>
          );
        },
      },
      {
        header: "Orders",
        cell: (customer) => (
          <span className="text-gray-600">{customer.totalOrders}</span>
        ),
      },
      {
        header: "Total Spent",
        cell: (customer) => (
          <span className="text-gray-900 font-medium">
            ₦{customer.totalSpent.toLocaleString()}
          </span>
        ),
      },
      {
        header: "Status",
        cell: (customer) => (
          <span
            className={`px-2 py-1 text-xs font-semibold rounded-full ${customer.status === "ACTIVE"
              ? "bg-green-100 text-green-800"
              : customer.status === "INACTIVE"
                ? "bg-gray-100 text-gray-800"
                : customer.status === "SUSPENDED"
                  ? "bg-red-100 text-red-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
          >
            {customer.status === "PENDING_VERIFICATION"
              ? "Pending"
              : customer.status.toLowerCase()}
          </span>
        ),
      },
      {
        header: "Actions",
        className: "w-20",
        cell: (customer) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                title="Actions"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <title>Open actions</title>
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={() => handleViewCustomer(customer.id)}
                className="cursor-pointer"
              >
                <EyeIcon className="w-4 h-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleEditCustomer(customer.id)}
                className="cursor-pointer"
              >
                <EditIcon className="w-4 h-4 mr-2" />
                Edit Customer
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleContactCustomer(customer.email)}
                className="cursor-pointer"
              >
                <MailIcon className="w-4 h-4 mr-2" />
                Contact Customer
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleDeactivateCustomer(customer.id)}
                className={`cursor-pointer ${customer.status === "ACTIVE"
                  ? "text-red-600 focus:text-red-600"
                  : "text-green-600 focus:text-green-600"
                  }`}
              >
                {customer.status === "ACTIVE" ? (
                  <>
                    <span className="w-4 h-4 mr-2">🚫</span>
                    Deactivate
                  </>
                ) : (
                  <>
                    <span className="w-4 h-4 mr-2">✅</span>
                    Reactivate
                  </>
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [
      selectedCustomerIds,
      handleSelectCustomer,
      handleViewCustomer,
      handleEditCustomer,
      handleContactCustomer,
      handleDeactivateCustomer,
    ],
  );

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Customers Management
        </h1>
        <p className="text-gray-600">Manage customer relationships and data</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {statsQuery.isLoading ? (
          [1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-lg border border-gray-200 animate-pulse"
            >
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-200 rounded-lg" />
                <div className="ml-4 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
                  <div className="h-8 bg-gray-200 rounded w-16" />
                </div>
              </div>
            </div>
          ))
        ) : stats ? (
          <>
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <div className="w-6 h-6 text-blue-600">👥</div>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Total Customers</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <div className="w-6 h-6 text-green-600">✅</div>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Active Customers</p>
                  <p className="text-2xl font-bold">{stats.active}</p>
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
                    ₦{Number(stats.revenue).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <div className="w-6 h-6 text-orange-600">📊</div>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Avg Order Value</p>
                  <p className="text-2xl font-bold">
                    ₦{Math.round(stats.avgOrderValue).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="col-span-4 text-center py-8 text-gray-500">
            Failed to load customer statistics
          </div>
        )}
      </div>

      {/* Bulk Actions Bar */}
      {isSomeSelected && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-medium text-blue-900">
              {selectedCustomerIds.size} customer(s) selected
            </span>
            <button
              type="button"
              onClick={() => setSelectedCustomerIds(new Set())}
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              Clear selection
            </button>
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Change Status
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onClick={() => handleBulkStatusChange("ACTIVE")}
                  className="cursor-pointer"
                >
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                  Active
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleBulkStatusChange("INACTIVE")}
                  className="cursor-pointer"
                >
                  <span className="w-2 h-2 bg-gray-400 rounded-full mr-2" />
                  Inactive
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleBulkStatusChange("SUSPENDED")}
                  className="cursor-pointer"
                >
                  <span className="w-2 h-2 bg-red-500 rounded-full mr-2" />
                  Suspended
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search customers by name, email, or phone..."
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
              setStatusFilter(e.target.value as UserStatus | "All")
            }
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 outline-none"
          >
            {statuses.map((status) => (
              <option key={status} value={status}>
                {statusLabels[status]}
              </option>
            ))}
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

      {/* Select All Checkbox */}
      <div className="bg-white px-4 py-2 border border-gray-200 rounded-t-lg border-b-0 flex items-center gap-2">
        <input
          type="checkbox"
          checked={isAllSelected}
          onChange={(e) => handleSelectAll(e.target.checked)}
          className="w-4 h-4 text-[#38761d] focus:ring-[#38761d] border-gray-300 rounded cursor-pointer"
        />
        <span className="text-sm text-gray-600">
          {isAllSelected ? "Deselect all" : "Select all on this page"}
        </span>
      </div>

      {/* Customers Table */}
      <DataTable
        columns={columns}
        data={customers}
        isLoading={customersQuery.isLoading}
        error={customersQuery.error}
        onRetry={() => customersQuery.refetch()}
        emptyMessage="No customers found matching your filters"
        keyExtractor={(customer) => customer.id}
        pagination={customersQuery.data?.pagination}
        onPageChange={(page) => setCurrentPage(page)}
      />

      {/* Customer Insights */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">
            Top Customers by Spending
          </h3>
          <div className="space-y-3">
            {topCustomers.length > 0 ? (
              topCustomers.map((customer) => (
                <div
                  key={customer.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center">
                    <div className="relative w-8 h-8 mr-3">
                      <Image
                        src={
                          customer.image ||
                          `https://placehold.co/80x80/38761d/white?text=${customer.first_name?.[0] || "U"}`
                        }
                        alt={
                          `${customer.first_name || ""} ${customer.last_name || ""}`.trim() ||
                          "Customer"
                        }
                        fill
                        className="rounded-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-medium">
                        {customer.first_name || customer.last_name
                          ? `${customer.first_name || ""} ${customer.last_name || ""}`.trim()
                          : customer.email}
                      </p>
                      <p className="text-sm text-gray-500">
                        {customer.totalOrders} orders
                      </p>
                    </div>
                  </div>
                  <p className="font-semibold">
                    ₦{customer.totalSpent.toLocaleString()}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">
                No customer data available
              </p>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">
            Customer Distribution by Location
          </h3>
          <div className="space-y-3">
            {locationDistribution.length > 0 ? (
              locationDistribution.map(([location, count]) => {
                const percentage =
                  customers.length > 0
                    ? Math.round((count / customers.length) * 100)
                    : 0;
                return (
                  <div
                    key={location}
                    className="flex items-center justify-between"
                  >
                    <span className="font-medium">{location}</span>
                    <div className="flex items-center">
                      <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-12">{count}</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500 text-center py-4">
                No location data available
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Customer View Sheet */}
      <CustomerViewSheet
        customer={selectedViewCustomer}
        open={!!viewCustomerId}
        onOpenChange={(open) => !open && setViewCustomerId(null)}
      />

      {/* Customer Edit Sheet */}
      <CustomerEditSheet
        customer={selectedEditCustomer}
        open={!!editCustomerId}
        onOpenChange={(open) => !open && setEditCustomerId(null)}
        onSuccess={() => {
          customersQuery.refetch();
          setEditCustomerId(null);
        }}
      />

      {/* Bulk status change confirm */}
      <ConfirmDialog
        open={bulkStatusConfirmOpen}
        onOpenChange={(open) => {
          setBulkStatusConfirmOpen(open);
          if (!open) setPendingBulkStatus(null);
        }}
        title="Update Customer Status"
        description={`Are you sure you want to change the status of ${selectedCustomerIds.size} customer(s) to "${pendingBulkStatus}"?`}
        confirmLabel="Update Status"
        cancelLabel="Cancel"
        onConfirm={confirmBulkStatusChange}
        isLoading={bulkUpdateStatusMutation.isPending}
        variant="default"
      />

      {/* Single customer deactivate confirm */}
      <ConfirmDialog
        open={deactivateConfirmOpen}
        onOpenChange={(open) => {
          setDeactivateConfirmOpen(open);
          if (!open) setDeactivateCustomerId(null);
        }}
        title={
          customers.find((c) => c.id === deactivateCustomerId)?.status ===
            "ACTIVE"
            ? "Deactivate Customer"
            : "Reactivate Customer"
        }
        description={
          customers.find((c) => c.id === deactivateCustomerId)?.status ===
            "ACTIVE"
            ? "Are you sure you want to deactivate this customer? They will not be able to log in or place orders."
            : "Are you sure you want to reactivate this customer? Their account will be restored."
        }
        confirmLabel={
          customers.find((c) => c.id === deactivateCustomerId)?.status ===
            "ACTIVE"
            ? "Deactivate"
            : "Reactivate"
        }
        cancelLabel="Cancel"
        onConfirm={confirmDeactivateCustomer}
        isLoading={updateCustomerStatusMutation.isPending}
        variant={
          customers.find((c) => c.id === deactivateCustomerId)?.status ===
            "ACTIVE"
            ? "danger"
            : "default"
        }
      />
    </div>
  );
}

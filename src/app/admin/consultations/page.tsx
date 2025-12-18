"use client";

import type { ConsultationStatus, ConsultationType } from "@prisma/client";
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
  SearchIcon,
  WhatsAppIcon,
} from "@/components/ui/icons";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { trpc } from "@/utils/trpc";
import { exportToCSV, type CSVColumn } from "@/utils/csv-export";
import { ConsultationViewSheet } from "./ConsultationViewSheet";
import { ConsultationFormSheet } from "./ConsultationFormSheet";

type ConsultationWithRelations = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  type: ConsultationType;
  preferred_date: Date;
  preferred_time: string;
  skin_concerns: string[];
  status: ConsultationStatus;
  created_at: Date;
  user: {
    id: string;
    email: string;
    first_name: string | null;
    last_name: string | null;
  } | null;
};

const consultationTypeLabels: Record<ConsultationType, string> = {
  SKIN_ANALYSIS: "Skincare Consultation",
  PRODUCT_RECOMMENDATION: "Product Recommendation",
  ROUTINE_BUILDING: "Routine Building",
  GENERAL: "General Consultation",
};

const consultationStatusLabels: Record<ConsultationStatus, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  NO_SHOW: "No Show",
};

export default function AdminConsultationsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<ConsultationStatus | "All">(
    "All",
  );
  const [typeFilter, setTypeFilter] = useState<ConsultationType | "All">(
    "All",
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [viewSheetOpen, setViewSheetOpen] = useState(false);
  const [formSheetOpen, setFormSheetOpen] = useState(false);
  const [viewingConsultationId, setViewingConsultationId] = useState<
    string | undefined
  >();
  const [editingConsultationId, setEditingConsultationId] = useState<
    string | undefined
  >();

  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkConfirmOpen, setBulkConfirmOpen] = useState(false);
  const [pendingBulkStatus, setPendingBulkStatus] =
    useState<ConsultationStatus | null>(null);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [contactCustomer, setContactCustomer] = useState<{
    name: string;
    phone: string;
    email: string;
  } | null>(null);

  const consultationsQuery = trpc.getConsultations.useQuery(
    {
      page: currentPage,
      limit: 10,
      status: statusFilter !== "All" ? statusFilter : undefined,
      search: searchTerm.trim() || undefined,
    },
    {
      staleTime: 30000,
      refetchOnWindowFocus: false,
    },
  );

  const updateStatusMutation = trpc.updateConsultationStatus.useMutation({
    onSuccess: () => {
      consultationsQuery.refetch();
      toast.success("Status updated successfully");
    },
    onError: (error) => {
      toast.error(`Failed to update status: ${error.message}`);
    },
  });

  const bulkUpdateMutation = trpc.bulkUpdateConsultationStatus.useMutation({
    onSuccess: (data) => {
      consultationsQuery.refetch();
      setSelectedIds(new Set());
      setBulkConfirmOpen(false);
      setPendingBulkStatus(null);
      toast.success(data.message);
    },
    onError: (error) => {
      toast.error(`Failed to update consultations: ${error.message}`);
    },
  });

  const consultations = consultationsQuery.data?.consultations || [];

  const filteredConsultations = consultations.filter((consultation) => {
    if (typeFilter !== "All" && consultation.type !== typeFilter) {
      return false;
    }
    return true;
  });

  // Bulk selection handlers
  const handleSelectAll = useCallback(
    (checked: boolean) => {
      if (checked) {
        setSelectedIds(new Set(filteredConsultations.map((c) => c.id)));
      } else {
        setSelectedIds(new Set());
      }
    },
    [filteredConsultations],
  );

  const handleSelectConsultation = useCallback(
    (id: string, checked: boolean) => {
      setSelectedIds((prev) => {
        const newSet = new Set(prev);
        if (checked) {
          newSet.add(id);
        } else {
          newSet.delete(id);
        }
        return newSet;
      });
    },
    [],
  );

  const isAllSelected =
    filteredConsultations.length > 0 &&
    filteredConsultations.every((c) => selectedIds.has(c.id));
  const isSomeSelected = selectedIds.size > 0;

  const handleBulkStatusChange = (status: ConsultationStatus) => {
    if (selectedIds.size === 0) return;
    setPendingBulkStatus(status);
    setBulkConfirmOpen(true);
  };

  const confirmBulkStatusChange = async () => {
    if (!pendingBulkStatus) return;
    await bulkUpdateMutation.mutateAsync({
      ids: Array.from(selectedIds),
      status: pendingBulkStatus,
    });
  };

  const handleViewConsultation = useCallback((id: string) => {
    setViewingConsultationId(id);
    setViewSheetOpen(true);
  }, []);

  const handleEditConsultation = useCallback((id: string) => {
    setEditingConsultationId(id);
    setFormSheetOpen(true);
  }, []);

  const handleOpenContactDialog = useCallback(
    (name: string, phone: string, email: string) => {
      setContactCustomer({ name, phone, email });
      setContactDialogOpen(true);
    },
    [],
  );

  const handleContactViaWhatsApp = useCallback(() => {
    if (!contactCustomer) return;
    // Format phone number for WhatsApp (remove spaces, dashes, and ensure starts with country code)
    let phone = contactCustomer.phone.replace(/[\s\-()]/g, "");
    // If phone doesn't start with +, assume it's a Nigerian number
    if (!phone.startsWith("+")) {
      if (phone.startsWith("0")) {
        phone = "+234" + phone.substring(1);
      } else {
        phone = "+234" + phone;
      }
    }
    const message = `Hello ${contactCustomer.name}, this is Trichomes regarding your consultation booking.`;
    window.open(
      `https://wa.me/${phone.replace("+", "")}?text=${encodeURIComponent(message)}`,
      "_blank",
    );
    setContactDialogOpen(false);
  }, [contactCustomer]);

  const handleContactViaEmail = useCallback(() => {
    if (!contactCustomer) return;
    const subject = encodeURIComponent("Regarding Your Consultation Booking - Trichomes");
    const body = encodeURIComponent(
      `Hello ${contactCustomer.name},\n\nThis is Trichomes regarding your consultation booking.\n\nBest regards,\nTrichomes Team`,
    );
    window.location.href = `mailto:${contactCustomer.email}?subject=${subject}&body=${body}`;
    setContactDialogOpen(false);
  }, [contactCustomer]);

  const handleQuickStatusChange = useCallback(
    async (id: string, status: ConsultationStatus) => {
      await updateStatusMutation.mutateAsync({ id, status });
    },
    [updateStatusMutation],
  );

  const handleExportCSV = () => {
    const columns: CSVColumn<ConsultationWithRelations>[] = [
      {
        key: (c) => `${c.first_name} ${c.last_name}`,
        label: "Customer Name",
      },
      { key: "email", label: "Email" },
      { key: "phone", label: "Phone" },
      {
        key: (c) => consultationTypeLabels[c.type],
        label: "Type",
      },
      {
        key: (c) => new Date(c.preferred_date).toLocaleDateString(),
        label: "Preferred Date",
      },
      { key: "preferred_time", label: "Preferred Time" },
      {
        key: (c) => consultationStatusLabels[c.status],
        label: "Status",
      },
      {
        key: (c) => new Date(c.created_at).toLocaleDateString(),
        label: "Created",
      },
    ];
    exportToCSV(filteredConsultations, columns, "consultations");
    toast.success("Consultations exported to CSV");
  };

  // Calculate stats
  const stats = useMemo(() => {
    const total = consultations.length;
    const pending = consultations.filter((c) => c.status === "PENDING").length;
    const confirmed = consultations.filter((c) => c.status === "CONFIRMED")
      .length;
    const completed = consultations.filter((c) => c.status === "COMPLETED")
      .length;
    const cancelled = consultations.filter((c) => c.status === "CANCELLED")
      .length;

    return { total, pending, confirmed, completed, cancelled };
  }, [consultations]);

  const columns: Column<ConsultationWithRelations>[] = useMemo(
    () => [
      {
        header: "",
        className: "w-12",
        cell: (consultation) => (
          <input
            type="checkbox"
            checked={selectedIds.has(consultation.id)}
            onChange={(e) =>
              handleSelectConsultation(consultation.id, e.target.checked)
            }
            className="w-4 h-4 text-[#38761d] focus:ring-[#38761d] border-gray-300 rounded cursor-pointer"
            onClick={(e) => e.stopPropagation()}
          />
        ),
      },
      {
        header: "Customer",
        cell: (consultation) => (
          <div>
            <span className="font-medium text-gray-900">
              {consultation.first_name} {consultation.last_name}
            </span>
            <p className="text-sm text-gray-500">{consultation.email}</p>
          </div>
        ),
      },
      {
        header: "Contact",
        cell: (consultation) => (
          <span className="text-gray-600">{consultation.phone}</span>
        ),
      },
      {
        header: "Type",
        cell: (consultation) => (
          <span className="text-gray-600">
            {consultationTypeLabels[consultation.type]}
          </span>
        ),
      },
      {
        header: "Date & Time",
        cell: (consultation) => (
          <div>
            <span className="text-gray-900">
              {new Date(consultation.preferred_date).toLocaleDateString()}
            </span>
            <p className="text-sm text-gray-500">
              {consultation.preferred_time}
            </p>
          </div>
        ),
      },
      {
        header: "Status",
        cell: (consultation) => (
          <span
            className={`px-2 py-1 text-xs font-semibold rounded-full ${consultation.status === "COMPLETED"
              ? "bg-green-100 text-green-800"
              : consultation.status === "CONFIRMED"
                ? "bg-blue-100 text-blue-800"
                : consultation.status === "PENDING"
                  ? "bg-yellow-100 text-yellow-800"
                  : consultation.status === "CANCELLED"
                    ? "bg-red-100 text-red-800"
                    : "bg-gray-100 text-gray-800"
              }`}
          >
            {consultationStatusLabels[consultation.status]}
          </span>
        ),
      },
      {
        header: "Actions",
        className: "w-20",
        cell: (consultation) => (
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
                onClick={() => handleViewConsultation(consultation.id)}
                className="cursor-pointer"
              >
                <EyeIcon className="w-4 h-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleEditConsultation(consultation.id)}
                className="cursor-pointer"
              >
                <EditIcon className="w-4 h-4 mr-2" />
                Update Status
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() =>
                  handleOpenContactDialog(
                    `${consultation.first_name} ${consultation.last_name}`,
                    consultation.phone,
                    consultation.email,
                  )
                }
                className="cursor-pointer"
              >
                📞 Contact Customer
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {/* Quick status actions */}
              {consultation.status === "PENDING" && (
                <DropdownMenuItem
                  onClick={() =>
                    handleQuickStatusChange(consultation.id, "CONFIRMED")
                  }
                  className="cursor-pointer text-blue-600 focus:text-blue-600 focus:bg-blue-50"
                >
                  ✓ Confirm
                </DropdownMenuItem>
              )}
              {consultation.status === "CONFIRMED" && (
                <DropdownMenuItem
                  onClick={() =>
                    handleQuickStatusChange(consultation.id, "COMPLETED")
                  }
                  className="cursor-pointer text-green-600 focus:text-green-600 focus:bg-green-50"
                >
                  ✓ Mark Completed
                </DropdownMenuItem>
              )}
              {(consultation.status === "PENDING" ||
                consultation.status === "CONFIRMED") && (
                  <>
                    <DropdownMenuItem
                      onClick={() =>
                        handleQuickStatusChange(consultation.id, "CANCELLED")
                      }
                      className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                    >
                      ✗ Cancel
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        handleQuickStatusChange(consultation.id, "NO_SHOW")
                      }
                      className="cursor-pointer text-gray-600 focus:text-gray-600"
                    >
                      ⏱️ No Show
                    </DropdownMenuItem>
                  </>
                )}
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [
      selectedIds,
      handleSelectConsultation,
      handleViewConsultation,
      handleEditConsultation,
      handleOpenContactDialog,
      handleQuickStatusChange,
    ],
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Consultations Management
        </h1>
        <p className="text-gray-600">
          Manage customer consultation bookings
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <div className="w-6 h-6 text-blue-600">📅</div>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Total</p>
              <p className="text-2xl font-bold">{stats.total}</p>
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
              <p className="text-2xl font-bold">{stats.pending}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <div className="w-6 h-6 text-blue-600">✅</div>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Confirmed</p>
              <p className="text-2xl font-bold">{stats.confirmed}</p>
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
              <p className="text-2xl font-bold">{stats.completed}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <div className="w-6 h-6 text-red-600">✗</div>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Cancelled</p>
              <p className="text-2xl font-bold">{stats.cancelled}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {isSomeSelected && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-medium text-blue-900">
              {selectedIds.size} consultation(s) selected
            </span>
            <button
              type="button"
              onClick={() => setSelectedIds(new Set())}
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
                  className="px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-100 border border-blue-300 rounded-md hover:bg-blue-200 transition-colors"
                >
                  Change Status ▾
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => handleBulkStatusChange("CONFIRMED")}
                  className="cursor-pointer"
                >
                  ✅ Confirm
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleBulkStatusChange("COMPLETED")}
                  className="cursor-pointer"
                >
                  ✓ Complete
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleBulkStatusChange("CANCELLED")}
                  className="cursor-pointer text-red-600"
                >
                  ✗ Cancel
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleBulkStatusChange("NO_SHOW")}
                  className="cursor-pointer"
                >
                  ⏱️ No Show
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
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
              setStatusFilter(e.target.value as ConsultationStatus | "All")
            }
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 outline-none bg-white"
          >
            <option value="All">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="NO_SHOW">No Show</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) =>
              setTypeFilter(e.target.value as ConsultationType | "All")
            }
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 outline-none bg-white"
          >
            <option value="All">All Types</option>
            <option value="SKIN_ANALYSIS">Skincare Consultation</option>
            <option value="PRODUCT_RECOMMENDATION">
              Product Recommendation
            </option>
            <option value="ROUTINE_BUILDING">Routine Building</option>
            <option value="GENERAL">General Consultation</option>
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

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filteredConsultations}
        isLoading={consultationsQuery.isLoading}
        error={consultationsQuery.error}
        onRetry={() => consultationsQuery.refetch()}
        emptyMessage="No consultations found matching your filters"
        keyExtractor={(consultation) => consultation.id}
        pagination={consultationsQuery.data?.pagination}
        onPageChange={(page) => setCurrentPage(page)}
      />

      {/* View Sheet */}
      <ConsultationViewSheet
        consultationId={viewingConsultationId}
        open={viewSheetOpen}
        onOpenChange={setViewSheetOpen}
      />

      {/* Form Sheet for Status Update */}
      <ConsultationFormSheet
        consultationId={editingConsultationId}
        open={formSheetOpen}
        onOpenChange={setFormSheetOpen}
        onSuccess={() => {
          consultationsQuery.refetch();
        }}
      />

      {/* Bulk action confirm */}
      <ConfirmDialog
        open={bulkConfirmOpen}
        onOpenChange={(open) => {
          setBulkConfirmOpen(open);
          if (!open) setPendingBulkStatus(null);
        }}
        title={`Update ${selectedIds.size} Consultation(s)`}
        description={`Are you sure you want to change the status of ${selectedIds.size} consultation(s) to "${pendingBulkStatus}"?`}
        confirmLabel="Update Status"
        cancelLabel="Cancel"
        onConfirm={confirmBulkStatusChange}
        isLoading={bulkUpdateMutation.isPending}
        variant={pendingBulkStatus === "CANCELLED" ? "danger" : "default"}
      />

      {/* Contact Dialog */}
      <Dialog open={contactDialogOpen} onOpenChange={setContactDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Contact Customer</DialogTitle>
            <DialogDescription>
              How would you like to contact {contactCustomer?.name}?
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 mt-4">
            <button
              type="button"
              onClick={handleContactViaWhatsApp}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              <WhatsAppIcon className="w-5 h-5" />
              Contact via WhatsApp
            </button>
            <button
              type="button"
              onClick={handleContactViaEmail}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <title>Email</title>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              Contact via Email
            </button>
          </div>
          {contactCustomer && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
              <p>
                <strong>Phone:</strong> {contactCustomer.phone}
              </p>
              <p>
                <strong>Email:</strong> {contactCustomer.email}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

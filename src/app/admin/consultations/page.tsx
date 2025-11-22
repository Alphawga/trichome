"use client";

import type { ConsultationStatus, ConsultationType } from "@prisma/client";
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
  SearchIcon,
} from "@/components/ui/icons";
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
  const [viewSheetOpen, setViewSheetOpen] = useState(false);
  const [formSheetOpen, setFormSheetOpen] = useState(false);
  const [viewingConsultationId, setViewingConsultationId] = useState<
    string | undefined
  >();
  const [editingConsultationId, setEditingConsultationId] = useState<
    string | undefined
  >();

  const consultationsQuery = trpc.getConsultations.useQuery(
    {
      page: 1,
      limit: 100,
      status: statusFilter !== "All" ? statusFilter : undefined,
      search: searchTerm.trim() || undefined,
    },
    {
      staleTime: 30000,
      refetchOnWindowFocus: false,
    },
  );

  const consultations = consultationsQuery.data?.consultations || [];

  const filteredConsultations = consultations.filter((consultation) => {
    if (typeFilter !== "All" && consultation.type !== typeFilter) {
      return false;
    }
    return true;
  });

  const handleViewConsultation = useCallback((id: string) => {
    setViewingConsultationId(id);
    setViewSheetOpen(true);
  }, []);

  const handleEditConsultation = useCallback((id: string) => {
    setEditingConsultationId(id);
    setFormSheetOpen(true);
  }, []);

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
            className={`px-2 py-1 text-xs font-semibold rounded-full ${
              consultation.status === "COMPLETED"
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
        header: "Created",
        cell: (consultation) => (
          <span className="text-gray-600">
            {new Date(consultation.created_at).toLocaleDateString()}
          </span>
        ),
      },
      {
        header: "Actions",
        cell: (consultation) => (
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
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [handleViewConsultation, handleEditConsultation],
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
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 outline-none"
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
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 outline-none"
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

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filteredConsultations}
        isLoading={consultationsQuery.isLoading}
        error={consultationsQuery.error}
        onRetry={() => consultationsQuery.refetch()}
        emptyMessage="No consultations found matching your filters"
        keyExtractor={(consultation) => consultation.id}
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
    </div>
  );
}


"use client";

import type { Promotion, PromotionStatus, PromotionType } from "@prisma/client";
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
  CopyIcon,
  EditIcon,
  ExportIcon,
  EyeIcon,
  PlusIcon,
  SearchIcon,
  TrashIcon,
} from "@/components/ui/icons";
import { trpc } from "@/utils/trpc";
import { exportToCSV, type CSVColumn } from "@/utils/csv-export";
import { PromotionFormSheet } from "./PromotionFormSheet";
import { PromotionViewSheet } from "./PromotionViewSheet";

// Type for promotion from backend
type PromotionWithDetails = Promotion & {
  _count: {
    usages: number;
  };
};

export default function AdminPromotionsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<PromotionStatus | "All">(
    "All",
  );
  const [typeFilter, setTypeFilter] = useState<PromotionType | "All">("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewPromotionId, setViewPromotionId] = useState<string | null>(null);
  const [editPromotionId, setEditPromotionId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Template presets for quick creation
  const [pendingTemplate, setPendingTemplate] = useState<{
    name: string;
    code: string;
    type: PromotionType;
    value: number;
    target: "ALL" | "NEW_CUSTOMERS" | "VIP";
    min_order: number;
  } | null>(null);

  // Fetch promotions from database
  const promotionsQuery = trpc.getPromotions.useQuery(
    {
      page: currentPage,
      limit: 10,
      status: statusFilter !== "All" ? statusFilter : undefined,
      type: typeFilter !== "All" ? typeFilter : undefined,
      search: searchTerm || undefined,
    },
    {
      refetchOnWindowFocus: false,
    },
  );

  // Fetch promotion statistics
  const statsQuery = trpc.getPromotionStats.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  const promotions = promotionsQuery.data?.promotions || [];
  const stats = statsQuery.data;

  const utils = trpc.useUtils();

  // Delete mutation
  const deletePromotionMutation = trpc.deletePromotion.useMutation({
    onSuccess: () => {
      toast.success("Promotion deleted successfully");
      utils.getPromotions.invalidate();
      utils.getPromotionStats.invalidate();
      setDeleteConfirmOpen(false);
      setDeleteTargetId(null);
    },
    onError: (error) => {
      toast.error(`Failed to delete promotion: ${error.message}`);
    },
  });

  // Toggle status mutation
  const toggleStatusMutation = trpc.togglePromotionStatus.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      utils.getPromotions.invalidate();
      utils.getPromotionStats.invalidate();
    },
    onError: (error) => {
      toast.error(`Failed to update status: ${error.message}`);
    },
  });

  const handleAddPromotion = useCallback(() => {
    setPendingTemplate(null);
    setIsCreating(true);
  }, []);

  const handleViewPromotion = useCallback((id: string) => {
    setViewPromotionId(id);
  }, []);

  const handleEditPromotion = useCallback((id: string) => {
    setEditPromotionId(id);
  }, []);

  // Get selected promotions for sheets
  const selectedViewPromotion =
    promotions.find((p) => p.id === viewPromotionId) || null;
  const selectedEditPromotion =
    promotions.find((p) => p.id === editPromotionId) || null;

  const handleDeletePromotion = useCallback((id: string) => {
    setDeleteTargetId(id);
    setDeleteConfirmOpen(true);
  }, []);

  const confirmDelete = async () => {
    if (deleteTargetId) {
      await deletePromotionMutation.mutateAsync({ id: deleteTargetId });
    }
  };

  const handleCopyCode = useCallback((code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`Code "${code}" copied to clipboard`);
  }, []);

  const handleToggleStatus = useCallback(
    (id: string) => {
      toggleStatusMutation.mutate({ id });
    },
    [toggleStatusMutation],
  );

  const handleQuickTemplate = (template: {
    name: string;
    code: string;
    type: PromotionType;
    value: number;
    target: "ALL" | "NEW_CUSTOMERS" | "VIP";
    min_order: number;
  }) => {
    setPendingTemplate(template);
    setIsCreating(true);
  };

  const handleExportCSV = () => {
    const columns: CSVColumn<PromotionWithDetails>[] = [
      { key: "name", label: "Promotion Name" },
      { key: "code", label: "Code" },
      {
        key: (p) => {
          switch (p.type) {
            case "PERCENTAGE":
              return `${p.value}% OFF`;
            case "FIXED_AMOUNT":
              return `₦${Number(p.value).toLocaleString()} OFF`;
            case "FREE_SHIPPING":
              return "FREE SHIPPING";
            case "BUY_X_GET_Y":
              return "BUY X GET Y";
            default:
              return p.type;
          }
        },
        label: "Discount",
      },
      { key: (p) => p._count.usages, label: "Usage Count" },
      { key: (p) => p.usage_limit || "∞", label: "Usage Limit" },
      {
        key: (p) => new Date(p.start_date).toLocaleDateString(),
        label: "Start Date",
      },
      {
        key: (p) => new Date(p.end_date).toLocaleDateString(),
        label: "End Date",
      },
      { key: "status", label: "Status" },
      {
        key: (p) => p.target_customers.replace("_", " "),
        label: "Target",
      },
    ];
    exportToCSV(promotions, columns, "promotions");
    toast.success("Promotions exported to CSV");
  };

  const statuses: Array<PromotionStatus | "All"> = [
    "All",
    "ACTIVE",
    "INACTIVE",
    "EXPIRED",
    "SCHEDULED",
  ];
  const types: Array<PromotionType | "All"> = [
    "All",
    "PERCENTAGE",
    "FIXED_AMOUNT",
    "FREE_SHIPPING",
    "BUY_X_GET_Y",
  ];

  const statusLabels: Record<PromotionStatus | "All", string> = {
    All: "All Status",
    ACTIVE: "Active",
    INACTIVE: "Inactive",
    EXPIRED: "Expired",
    SCHEDULED: "Scheduled",
  };

  const typeLabels: Record<PromotionType | "All", string> = {
    All: "All Types",
    PERCENTAGE: "Percentage",
    FIXED_AMOUNT: "Fixed Amount",
    FREE_SHIPPING: "Free Shipping",
    BUY_X_GET_Y: "Buy X Get Y",
  };

  // Define table columns
  const columns: Column<PromotionWithDetails>[] = useMemo(
    () => [
      {
        header: "Promotion Name",
        cell: (promotion) => (
          <div>
            <span className="font-medium text-gray-900">{promotion.name}</span>
            <p className="text-sm text-gray-500">
              Created{" "}
              {new Date(promotion.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </p>
          </div>
        ),
      },
      {
        header: "Code",
        cell: (promotion) => (
          <button
            type="button"
            onClick={() => handleCopyCode(promotion.code)}
            className="bg-gray-100 px-2 py-1 rounded text-sm font-mono hover:bg-gray-200 transition-colors cursor-pointer"
            title="Click to copy"
          >
            {promotion.code}
          </button>
        ),
      },
      {
        header: "Discount",
        cell: (promotion) => {
          let discountText = "";
          switch (promotion.type) {
            case "PERCENTAGE":
              discountText = `${promotion.value}% OFF`;
              break;
            case "FIXED_AMOUNT":
              discountText = `₦${Number(promotion.value).toLocaleString()} OFF`;
              break;
            case "FREE_SHIPPING":
              discountText = "FREE SHIPPING";
              break;
            case "BUY_X_GET_Y":
              discountText = "BUY X GET Y";
              break;
          }
          return (
            <div>
              <span className="font-medium text-green-600">{discountText}</span>
              <p className="text-sm text-gray-500">
                Min: ₦{Number(promotion.min_order_value).toLocaleString()}
              </p>
            </div>
          );
        },
      },
      {
        header: "Usage",
        cell: (promotion) => {
          const usageCount = promotion._count.usages;
          const usageLimit = promotion.usage_limit;
          const percentage =
            usageLimit > 0 ? Math.min((usageCount / usageLimit) * 100, 100) : 0;

          return (
            <div>
              <span className="text-gray-900">
                {usageCount} / {usageLimit || "∞"}
              </span>
              {usageLimit > 0 && (
                <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                  <div
                    className="bg-blue-600 h-1 rounded-full"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              )}
            </div>
          );
        },
      },
      {
        header: "Duration",
        cell: (promotion) => (
          <div>
            <span className="text-sm text-gray-600">
              {new Date(promotion.start_date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
            <span className="text-sm text-gray-400"> → </span>
            <span className="text-sm text-gray-600">
              {new Date(promotion.end_date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
        ),
      },
      {
        header: "Status",
        cell: (promotion) => {
          const statusColors = {
            ACTIVE: "bg-green-100 text-green-800",
            INACTIVE: "bg-gray-100 text-gray-800",
            EXPIRED: "bg-red-100 text-red-800",
            SCHEDULED: "bg-blue-100 text-blue-800",
          };
          return (
            <span
              className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[promotion.status]}`}
            >
              {promotion.status}
            </span>
          );
        },
      },
      {
        header: "Actions",
        className: "w-20",
        cell: (promotion) => (
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
                onClick={() => handleViewPromotion(promotion.id)}
                className="cursor-pointer"
              >
                <EyeIcon className="w-4 h-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleEditPromotion(promotion.id)}
                className="cursor-pointer"
              >
                <EditIcon className="w-4 h-4 mr-2" />
                Edit Promotion
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleCopyCode(promotion.code)}
                className="cursor-pointer"
              >
                <CopyIcon className="w-4 h-4 mr-2" />
                Copy Code
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleToggleStatus(promotion.id)}
                className="cursor-pointer"
              >
                {promotion.status === "ACTIVE" ? "⏸️" : "▶️"}
                <span className="ml-2">
                  {promotion.status === "ACTIVE" ? "Deactivate" : "Activate"}
                </span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleDeletePromotion(promotion.id)}
                className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
              >
                <TrashIcon className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [
      handleCopyCode,
      handleViewPromotion,
      handleEditPromotion,
      handleToggleStatus,
      handleDeletePromotion,
    ],
  );

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Promotions & Discounts
          </h1>
          <p className="text-gray-600">
            Manage discount codes and promotional campaigns
          </p>
        </div>
        <button
          type="button"
          onClick={handleAddPromotion}
          className="flex items-center gap-2 px-4 py-2 bg-[#38761d] text-white rounded-lg hover:bg-opacity-90 font-medium transition-colors"
        >
          <PlusIcon className="w-4 h-4" />
          Create Promotion
        </button>
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
                <div className="p-2 bg-green-100 rounded-lg">
                  <div className="w-6 h-6 text-green-600">✅</div>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Active Promotions</p>
                  <p className="text-2xl font-bold">{stats.active}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <div className="w-6 h-6 text-blue-600">📈</div>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Total Usage</p>
                  <p className="text-2xl font-bold">
                    {stats.totalUsage.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <div className="w-6 h-6 text-purple-600">⏰</div>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Scheduled</p>
                  <p className="text-2xl font-bold">{stats.scheduled}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <div className="w-6 h-6 text-red-600">⏳</div>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Expired</p>
                  <p className="text-2xl font-bold">{stats.expired}</p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="col-span-4 text-center py-8 text-gray-500">
            Failed to load promotion statistics
          </div>
        )}
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search promotions by name or code..."
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
              setStatusFilter(e.target.value as PromotionStatus | "All")
            }
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 outline-none bg-white"
          >
            {statuses.map((status) => (
              <option key={status} value={status}>
                {statusLabels[status]}
              </option>
            ))}
          </select>

          <select
            value={typeFilter}
            onChange={(e) =>
              setTypeFilter(e.target.value as PromotionType | "All")
            }
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 outline-none bg-white"
          >
            {types.map((type) => (
              <option key={type} value={type}>
                {typeLabels[type]}
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

      {/* Promotions Table */}
      <DataTable
        columns={columns}
        data={promotions}
        isLoading={promotionsQuery.isLoading}
        error={promotionsQuery.error}
        onRetry={() => promotionsQuery.refetch()}
        emptyMessage="No promotions found matching your filters"
        keyExtractor={(promotion) => promotion.id}
        pagination={promotionsQuery.data?.pagination}
        onPageChange={(page) => setCurrentPage(page)}
      />

      {/* Quick Campaign Templates */}
      <div className="mt-8 bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">Quick Campaign Templates</h3>
        <p className="text-sm text-gray-500 mb-4">
          Click a template to pre-fill the promotion form with suggested
          settings
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <button
            type="button"
            onClick={() =>
              handleQuickTemplate({
                name: "New Customer Welcome",
                code: "WELCOME20",
                type: "PERCENTAGE",
                value: 20,
                target: "NEW_CUSTOMERS",
                min_order: 5000,
              })
            }
            className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-green-300 transition-colors"
          >
            <div className="text-green-600 mb-2">🎯</div>
            <p className="font-medium">New Customer Welcome</p>
            <p className="text-sm text-gray-500">20% off first order</p>
          </button>

          <button
            type="button"
            onClick={() =>
              handleQuickTemplate({
                name: "Free Shipping Promo",
                code: "FREESHIP",
                type: "FREE_SHIPPING",
                value: 0,
                target: "ALL",
                min_order: 20000,
              })
            }
            className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-blue-300 transition-colors"
          >
            <div className="text-blue-600 mb-2">🚚</div>
            <p className="font-medium">Free Shipping</p>
            <p className="text-sm text-gray-500">
              Free delivery above ₦20,000
            </p>
          </button>

          <button
            type="button"
            onClick={() =>
              handleQuickTemplate({
                name: "VIP Exclusive Discount",
                code: "VIP15",
                type: "PERCENTAGE",
                value: 15,
                target: "VIP",
                min_order: 0,
              })
            }
            className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-purple-300 transition-colors"
          >
            <div className="text-purple-600 mb-2">⭐</div>
            <p className="font-medium">VIP Exclusive</p>
            <p className="text-sm text-gray-500">15% for loyal customers</p>
          </button>

          <button
            type="button"
            onClick={() =>
              handleQuickTemplate({
                name: "Flash Sale",
                code: "FLASH30",
                type: "PERCENTAGE",
                value: 30,
                target: "ALL",
                min_order: 10000,
              })
            }
            className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-red-300 transition-colors"
          >
            <div className="text-red-600 mb-2">🔥</div>
            <p className="font-medium">Flash Sale</p>
            <p className="text-sm text-gray-500">30% off limited time</p>
          </button>

          <button
            type="button"
            onClick={() =>
              handleQuickTemplate({
                name: "Fixed Amount Discount",
                code: "SAVE5000",
                type: "FIXED_AMOUNT",
                value: 5000,
                target: "ALL",
                min_order: 30000,
              })
            }
            className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-orange-300 transition-colors"
          >
            <div className="text-orange-600 mb-2">💰</div>
            <p className="font-medium">Fixed ₦5,000 Off</p>
            <p className="text-sm text-gray-500">On orders above ₦30,000</p>
          </button>

          <button
            type="button"
            onClick={() =>
              handleQuickTemplate({
                name: "Birthday Special",
                code: "BIRTHDAY25",
                type: "PERCENTAGE",
                value: 25,
                target: "ALL",
                min_order: 0,
              })
            }
            className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-yellow-300 transition-colors"
          >
            <div className="text-yellow-600 mb-2">🎂</div>
            <p className="font-medium">Birthday Special</p>
            <p className="text-sm text-gray-500">25% birthday discount</p>
          </button>
        </div>
      </div>

      {/* Promotion View Sheet */}
      <PromotionViewSheet
        promotion={selectedViewPromotion}
        open={!!viewPromotionId}
        onOpenChange={(open) => !open && setViewPromotionId(null)}
      />

      {/* Promotion Form Sheet (Create/Edit) */}
      <PromotionFormSheet
        promotion={selectedEditPromotion}
        open={isCreating || !!editPromotionId}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreating(false);
            setEditPromotionId(null);
            setPendingTemplate(null);
          }
        }}
        onSuccess={() => {
          promotionsQuery.refetch();
          setIsCreating(false);
          setEditPromotionId(null);
          setPendingTemplate(null);
        }}
        template={pendingTemplate}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={(open) => {
          setDeleteConfirmOpen(open);
          if (!open) setDeleteTargetId(null);
        }}
        title="Delete Promotion"
        description="Are you sure you want to delete this promotion? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={confirmDelete}
        isLoading={deletePromotionMutation.isPending}
        variant="danger"
      />
    </div>
  );
}

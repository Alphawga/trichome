"use client";

import type { Brand, ProductStatus } from "@prisma/client";
import Image from "next/image";
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
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  EditIcon,
  ExportIcon,
  EyeIcon,
  PlusIcon,
  SearchIcon,
  TrashIcon,
} from "@/components/ui/icons";
import { trpc } from "@/utils/trpc";
import { exportToCSV, type CSVColumn } from "@/utils/csv-export";
import { BrandFormSheet } from "./BrandFormSheet";
import { BrandViewSheet } from "./BrandViewSheet";

type BrandWithRelations = Brand & {
  _count: {
    products: number;
  };
  imageUrl: string;
};

export default function AdminBrandsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProductStatus | "All">(
    "All",
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [viewSheetOpen, setViewSheetOpen] = useState(false);
  const [editingBrandId, setEditingBrandId] = useState<string | undefined>();
  const [viewingBrandId, setViewingBrandId] = useState<string | undefined>();
  const [deletingBrandId, setDeletingBrandId] = useState<string | null>(null);

  // Single delete confirm
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [brandToDelete, setBrandToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // Bulk selection state
  const [selectedBrandIds, setSelectedBrandIds] = useState<Set<string>>(
    new Set(),
  );
  const [bulkDeleteConfirmOpen, setBulkDeleteConfirmOpen] = useState(false);
  const [bulkStatusConfirmOpen, setBulkStatusConfirmOpen] = useState(false);
  const [pendingBulkStatus, setPendingBulkStatus] =
    useState<ProductStatus | null>(null);

  const brandsQuery = trpc.getBrands.useQuery(
    {
      status: statusFilter === "All" ? undefined : statusFilter,
      search: searchTerm.trim() || undefined,
      page: currentPage,
      limit: 10,
    },
    {
      staleTime: 30000,
      refetchOnWindowFocus: false,
    },
  );

  const statsQuery = trpc.getBrandStats.useQuery(undefined, {
    staleTime: 60000,
    refetchOnWindowFocus: false,
  });

  const deleteBrandMutation = trpc.deleteBrand.useMutation({
    onSuccess: () => {
      brandsQuery.refetch();
      statsQuery.refetch();
      setDeletingBrandId(null);
      setDeleteConfirmOpen(false);
      setBrandToDelete(null);
      toast.success("Brand deleted successfully");
    },
    onError: (error) => {
      toast.error(`Failed to delete brand: ${error.message}`);
      setDeletingBrandId(null);
    },
  });

  const bulkDeleteMutation = trpc.bulkDeleteBrands.useMutation({
    onSuccess: (data) => {
      brandsQuery.refetch();
      statsQuery.refetch();
      setSelectedBrandIds(new Set());
      setBulkDeleteConfirmOpen(false);
      toast.success(data.message);
    },
    onError: (error) => {
      toast.error(`Failed to delete brands: ${error.message}`);
    },
  });

  const bulkUpdateStatusMutation = trpc.bulkUpdateBrandStatus.useMutation({
    onSuccess: (data) => {
      brandsQuery.refetch();
      statsQuery.refetch();
      setSelectedBrandIds(new Set());
      setBulkStatusConfirmOpen(false);
      setPendingBulkStatus(null);
      toast.success(data.message);
    },
    onError: (error) => {
      toast.error(`Failed to update brands: ${error.message}`);
    },
  });

  const adminBrands: BrandWithRelations[] =
    brandsQuery.data?.brands?.map((brand) => ({
      ...brand,
      imageUrl:
        brand.logo ||
        brand.image ||
        `https://placehold.co/80x80/38761d/white?text=${encodeURIComponent(
          Array.from(brand.name)[0] || "B",
        )}`,
    })) || [];

  // Bulk selection handlers
  const handleSelectAll = useCallback(
    (checked: boolean) => {
      if (checked) {
        setSelectedBrandIds(new Set(adminBrands.map((b) => b.id)));
      } else {
        setSelectedBrandIds(new Set());
      }
    },
    [adminBrands],
  );

  const handleSelectBrand = useCallback(
    (brandId: string, checked: boolean) => {
      setSelectedBrandIds((prev) => {
        const newSet = new Set(prev);
        if (checked) {
          newSet.add(brandId);
        } else {
          newSet.delete(brandId);
        }
        return newSet;
      });
    },
    [],
  );

  const isAllSelected =
    adminBrands.length > 0 &&
    adminBrands.every((b) => selectedBrandIds.has(b.id));
  const isSomeSelected = selectedBrandIds.size > 0;

  const handleBulkDelete = () => {
    if (selectedBrandIds.size === 0) return;
    setBulkDeleteConfirmOpen(true);
  };

  const confirmBulkDelete = async () => {
    await bulkDeleteMutation.mutateAsync({
      ids: Array.from(selectedBrandIds),
    });
  };

  const handleBulkStatusChange = (status: ProductStatus) => {
    if (selectedBrandIds.size === 0) return;
    setPendingBulkStatus(status);
    setBulkStatusConfirmOpen(true);
  };

  const confirmBulkStatusChange = async () => {
    if (!pendingBulkStatus) return;
    await bulkUpdateStatusMutation.mutateAsync({
      ids: Array.from(selectedBrandIds),
      status: pendingBulkStatus,
    });
  };

  const handleAddBrand = () => {
    setEditingBrandId(undefined);
    setSheetOpen(true);
  };

  const handleEditBrand = useCallback((id: string) => {
    setEditingBrandId(id);
    setSheetOpen(true);
  }, []);

  const handleDeleteBrand = useCallback(
    (brand: { id: string; name: string }) => {
      setBrandToDelete(brand);
      setDeleteConfirmOpen(true);
    },
    [],
  );

  const confirmDeleteBrand = useCallback(async () => {
    if (!brandToDelete) return;
    setDeletingBrandId(brandToDelete.id);
    try {
      await deleteBrandMutation.mutateAsync({ id: brandToDelete.id });
    } catch (_error) {
      // Error handled in mutation
    }
  }, [brandToDelete, deleteBrandMutation]);

  const handleViewBrand = useCallback((id: string) => {
    setViewingBrandId(id);
    setViewSheetOpen(true);
  }, []);

  const handleExportCSV = () => {
    const columns: CSVColumn<BrandWithRelations>[] = [
      { key: "name", label: "Brand Name" },
      { key: "slug", label: "Slug" },
      { key: (b) => b._count.products, label: "Products Count" },
      {
        key: (b) =>
          b.status === "ACTIVE"
            ? "Active"
            : b.status === "INACTIVE"
              ? "Inactive"
              : "Draft",
        label: "Status",
      },
      { key: "sort_order", label: "Sort Order" },
      {
        key: (b) => new Date(b.created_at).toLocaleDateString(),
        label: "Date Added",
      },
    ];
    exportToCSV(adminBrands, columns, "brands");
  };

  const handleFormSuccess = () => {
    brandsQuery.refetch();
    statsQuery.refetch();
  };

  const stats = statsQuery.data;

  const columns: Column<BrandWithRelations>[] = useMemo(
    () => [
      {
        header: "",
        className: "w-12",
        cell: (brand) => (
          <input
            type="checkbox"
            checked={selectedBrandIds.has(brand.id)}
            onChange={(e) => handleSelectBrand(brand.id, e.target.checked)}
            className="w-4 h-4 text-[#38761d] focus:ring-[#38761d] border-gray-300 rounded cursor-pointer"
            onClick={(e) => e.stopPropagation()}
          />
        ),
      },
      {
        header: "Brand",
        cell: (brand) => (
          <div className="flex items-center">
            <div className="relative w-12 h-12 mr-4 shrink-0">
              <Image
                src={brand.imageUrl}
                alt={brand.name}
                fill
                className="rounded-md object-cover"
              />
            </div>
            <div>
              <span className="font-medium text-gray-900">{brand.name}</span>
              <p className="text-sm text-gray-500">{brand.slug}</p>
            </div>
          </div>
        ),
      },
      {
        header: "Products",
        cell: (brand) => (
          <span className="text-gray-600">{brand._count.products} products</span>
        ),
      },
      {
        header: "Status",
        cell: (brand) => (
          <span
            className={`px-2 py-1 text-xs font-semibold rounded-full ${brand.status === "ACTIVE"
              ? "bg-green-100 text-green-800"
              : brand.status === "DRAFT"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-red-100 text-red-800"
              }`}
          >
            {brand.status === "ACTIVE"
              ? "Active"
              : brand.status === "DRAFT"
                ? "Draft"
                : "Inactive"}
          </span>
        ),
      },
      {
        header: "Sort Order",
        cell: (brand) => (
          <span className="text-gray-600">{brand.sort_order}</span>
        ),
      },
      {
        header: "Date Added",
        cell: (brand) => (
          <span className="text-gray-600">
            {new Date(brand.created_at).toLocaleDateString()}
          </span>
        ),
      },
      {
        header: "Actions",
        cell: (brand) => (
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
                onClick={() => handleViewBrand(brand.id)}
                className="cursor-pointer"
              >
                <EyeIcon className="w-4 h-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleEditBrand(brand.id)}
                className="cursor-pointer"
              >
                <EditIcon className="w-4 h-4 mr-2" />
                Edit Brand
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() =>
                  handleDeleteBrand({ id: brand.id, name: brand.name })
                }
                disabled={deletingBrandId === brand.id}
                className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
              >
                <TrashIcon className="w-4 h-4 mr-2" />
                Delete Brand
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [
      selectedBrandIds,
      handleSelectBrand,
      deletingBrandId,
      handleViewBrand,
      handleEditBrand,
      handleDeleteBrand,
    ],
  );

  return (
    <div>
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Brands Management
          </h1>
          <p className="text-gray-600">Manage product brands</p>
        </div>
        <button
          type="button"
          onClick={handleAddBrand}
          className="flex items-center gap-2 px-4 py-2 bg-[#38761d] text-white rounded-lg hover:bg-opacity-90 font-medium transition-colors"
        >
          <PlusIcon className="w-4 h-4" />
          Add New Brand
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <div className="w-6 h-6 text-blue-600">🏷️</div>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Total Brands</p>
              <p className="text-2xl font-bold text-gray-900">
                {statsQuery.isLoading ? "..." : stats?.totalBrands || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <div className="w-6 h-6 text-green-600">✅</div>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Active Brands</p>
              <p className="text-2xl font-bold text-gray-900">
                {statsQuery.isLoading ? "..." : stats?.activeBrands || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <div className="w-6 h-6 text-red-600">⏸️</div>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Inactive Brands</p>
              <p className="text-2xl font-bold text-gray-900">
                {statsQuery.isLoading ? "..." : stats?.inactiveBrands || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <div className="w-6 h-6 text-purple-600">📦</div>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Total Products</p>
              <p className="text-2xl font-bold text-gray-900">
                {brandsQuery.isLoading
                  ? "..."
                  : adminBrands.reduce((sum, b) => sum + b._count.products, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {isSomeSelected && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-medium text-blue-900">
              {selectedBrandIds.size} brand(s) selected
            </span>
            <button
              type="button"
              onClick={() => setSelectedBrandIds(new Set())}
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
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem
                  onClick={() => handleBulkStatusChange("ACTIVE")}
                  className="cursor-pointer"
                >
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                  Active
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleBulkStatusChange("DRAFT")}
                  className="cursor-pointer"
                >
                  <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2" />
                  Draft
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleBulkStatusChange("INACTIVE")}
                  className="cursor-pointer"
                >
                  <span className="w-2 h-2 bg-gray-400 rounded-full mr-2" />
                  Inactive
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <button
              type="button"
              onClick={handleBulkDelete}
              className="px-3 py-1.5 text-sm font-medium text-white bg-red-600 border border-red-600 rounded-md hover:bg-red-700 transition-colors"
            >
              Delete Selected
            </button>
          </div>
        </div>
      )}

      <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search brands..."
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
              setStatusFilter(e.target.value as ProductStatus | "All")
            }
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 outline-none"
          >
            <option value="All">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="DRAFT">Draft</option>
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

      <DataTable
        columns={columns}
        data={adminBrands}
        isLoading={brandsQuery.isLoading}
        error={brandsQuery.error}
        onRetry={() => brandsQuery.refetch()}
        emptyMessage="No brands found matching your filters"
        keyExtractor={(brand) => brand.id}
        pagination={brandsQuery.data?.pagination}
        onPageChange={(page) => setCurrentPage(page)}
      />

      <BrandFormSheet
        brandId={editingBrandId}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onSuccess={handleFormSuccess}
      />

      <BrandViewSheet
        brandId={viewingBrandId}
        open={viewSheetOpen}
        onOpenChange={setViewSheetOpen}
      />

      {/* Single delete confirm */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={(open) => {
          setDeleteConfirmOpen(open);
          if (!open) setBrandToDelete(null);
        }}
        title="Delete Brand"
        description={`Are you sure you want to delete "${brandToDelete?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={confirmDeleteBrand}
        isLoading={deleteBrandMutation.isPending}
        variant="danger"
      />

      {/* Bulk delete confirm */}
      <ConfirmDialog
        open={bulkDeleteConfirmOpen}
        onOpenChange={setBulkDeleteConfirmOpen}
        title="Delete Selected Brands"
        description={`Are you sure you want to delete ${selectedBrandIds.size} brand(s)? This action cannot be undone. Brands with associated products cannot be deleted.`}
        confirmLabel="Delete All"
        cancelLabel="Cancel"
        onConfirm={confirmBulkDelete}
        isLoading={bulkDeleteMutation.isPending}
        variant="danger"
      />

      {/* Bulk status change confirm */}
      <ConfirmDialog
        open={bulkStatusConfirmOpen}
        onOpenChange={(open) => {
          setBulkStatusConfirmOpen(open);
          if (!open) setPendingBulkStatus(null);
        }}
        title="Update Brand Status"
        description={`Are you sure you want to change the status of ${selectedBrandIds.size} brand(s) to "${pendingBulkStatus}"?`}
        confirmLabel="Update Status"
        cancelLabel="Cancel"
        onConfirm={confirmBulkStatusChange}
        isLoading={bulkUpdateStatusMutation.isPending}
        variant="default"
      />
    </div>
  );
}

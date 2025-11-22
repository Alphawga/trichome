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
  const [sheetOpen, setSheetOpen] = useState(false);
  const [viewSheetOpen, setViewSheetOpen] = useState(false);
  const [editingBrandId, setEditingBrandId] = useState<string | undefined>();
  const [viewingBrandId, setViewingBrandId] = useState<string | undefined>();
  const [deletingBrandId, setDeletingBrandId] = useState<string | null>(null);

  const brandsQuery = trpc.getBrands.useQuery(
    {
      status: statusFilter === "All" ? undefined : statusFilter,
      search: searchTerm.trim() || undefined,
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
      toast.success("Brand deleted successfully");
    },
    onError: (error) => {
      toast.error(`Failed to delete brand: ${error.message}`);
      setDeletingBrandId(null);
    },
  });

  const adminBrands: BrandWithRelations[] =
    brandsQuery.data?.map((brand) => ({
      ...brand,
      imageUrl:
        brand.logo ||
        brand.image ||
        `https://placehold.co/80x80/38761d/white?text=${brand.name.charAt(0)}`,
    })) || [];

  const handleAddBrand = () => {
    setEditingBrandId(undefined);
    setSheetOpen(true);
  };

  const handleEditBrand = useCallback((id: string) => {
    setEditingBrandId(id);
    setSheetOpen(true);
  }, []);

  const handleDeleteBrand = useCallback(
    async (id: string) => {
      if (!confirm("Are you sure you want to delete this brand?")) {
        return;
      }

      setDeletingBrandId(id);
      try {
        await deleteBrandMutation.mutateAsync({ id });
      } catch (_error) {
        // Error handled in mutation
      }
    },
    [deleteBrandMutation],
  );

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
          b.status === "ACTIVE" ? "Active" : b.status === "INACTIVE" ? "Inactive" : "Draft",
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
            className={`px-2 py-1 text-xs font-semibold rounded-full ${
              brand.status === "ACTIVE"
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
                onClick={() => handleDeleteBrand(brand.id)}
                disabled={deletingBrandId === brand.id}
                className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
              >
                {deletingBrandId === brand.id ? (
                  <>
                    <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <TrashIcon className="w-4 h-4 mr-2" />
                    Delete Brand
                  </>
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [deletingBrandId, handleViewBrand, handleEditBrand, handleDeleteBrand],
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

      <DataTable
        columns={columns}
        data={adminBrands}
        isLoading={brandsQuery.isLoading}
        error={brandsQuery.error}
        onRetry={() => brandsQuery.refetch()}
        emptyMessage="No brands found matching your filters"
        keyExtractor={(brand) => brand.id}
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
    </div>
  );
}


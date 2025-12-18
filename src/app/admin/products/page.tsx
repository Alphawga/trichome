"use client";

import type {
  Category,
  Product,
  ProductImage,
  ProductStatus,
} from "@prisma/client";
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
import { ProductFormSheet } from "./ProductFormSheet";
import { ProductViewSheet } from "./ProductViewSheet";

type ProductWithRelations = Product & {
  category: Pick<Category, "id" | "name" | "slug">;
  images: ProductImage[];
  imageUrl: string;
  stock: number;
  statusDisplay: string;
  sales: number;
};

export default function AdminProductsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProductStatus | "All">(
    "All",
  );
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(
    null,
  );
  const [sheetOpen, setSheetOpen] = useState(false);
  const [viewSheetOpen, setViewSheetOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | undefined>(
    undefined,
  );
  const [viewingProductId, setViewingProductId] = useState<string | undefined>(
    undefined,
  );
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // Bulk selection state
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(
    new Set(),
  );
  const [bulkDeleteConfirmOpen, setBulkDeleteConfirmOpen] = useState(false);
  const [bulkStatusConfirmOpen, setBulkStatusConfirmOpen] = useState(false);
  const [pendingBulkStatus, setPendingBulkStatus] =
    useState<ProductStatus | null>(null);

  const productsQuery = trpc.getProducts.useQuery(
    {
      page: currentPage,
      limit: 10,
      search: searchTerm.trim() || undefined,
      status: statusFilter === "All" ? undefined : statusFilter,
    },
    {
      staleTime: 30000,
      refetchOnWindowFocus: false,
    },
  );

  const statsQuery = trpc.getProductStats.useQuery(undefined, {
    staleTime: 60000,
    refetchOnWindowFocus: false,
  });

  const deleteProductMutation = trpc.deleteProduct.useMutation({
    onSuccess: () => {
      productsQuery.refetch();
      setDeletingProductId(null);
      toast.success("Product deleted successfully");
    },
    onError: (error) => {
      console.error("Failed to delete product:", error);
      toast.error(`Failed to delete product: ${error.message}`);
      setDeletingProductId(null);
    },
  });

  const bulkDeleteMutation = trpc.bulkDeleteProducts.useMutation({
    onSuccess: (data) => {
      productsQuery.refetch();
      statsQuery.refetch();
      setSelectedProductIds(new Set());
      setBulkDeleteConfirmOpen(false);
      toast.success(data.message);
    },
    onError: (error) => {
      toast.error(`Failed to delete products: ${error.message}`);
    },
  });

  const bulkUpdateStatusMutation = trpc.bulkUpdateProductStatus.useMutation({
    onSuccess: (data) => {
      productsQuery.refetch();
      statsQuery.refetch();
      setSelectedProductIds(new Set());
      setBulkStatusConfirmOpen(false);
      setPendingBulkStatus(null);
      toast.success(data.message);
    },
    onError: (error) => {
      toast.error(`Failed to update products: ${error.message}`);
    },
  });

  const adminProducts =
    productsQuery.data?.products?.map((product) => ({
      ...product,
      imageUrl:
        product.images?.[0]?.url ||
        `https://placehold.co/80x80/38761d/white?text=${product.name.charAt(0)}`,
      stock: product.quantity,
      statusDisplay:
        product.quantity === 0
          ? "Out of stock"
          : product.status === "ACTIVE"
            ? "Active"
            : product.status === "DRAFT"
              ? "Draft"
              : "Inactive",
      sales: product.sale_count || 0,
    })) || [];

  const filteredProducts = adminProducts.filter((product) => {
    const matchesCategory =
      categoryFilter === "All" || product.category.name === categoryFilter;
    return matchesCategory;
  });

  // Bulk selection handlers
  const handleSelectAll = useCallback(
    (checked: boolean) => {
      if (checked) {
        setSelectedProductIds(new Set(filteredProducts.map((p) => p.id)));
      } else {
        setSelectedProductIds(new Set());
      }
    },
    [filteredProducts],
  );

  const handleSelectProduct = useCallback((productId: string, checked: boolean) => {
    setSelectedProductIds((prev) => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(productId);
      } else {
        newSet.delete(productId);
      }
      return newSet;
    });
  }, []);

  const isAllSelected =
    filteredProducts.length > 0 &&
    filteredProducts.every((p) => selectedProductIds.has(p.id));
  const isSomeSelected = selectedProductIds.size > 0;

  const handleBulkDelete = () => {
    if (selectedProductIds.size === 0) return;
    setBulkDeleteConfirmOpen(true);
  };

  const confirmBulkDelete = async () => {
    await bulkDeleteMutation.mutateAsync({
      ids: Array.from(selectedProductIds),
    });
  };

  const handleBulkStatusChange = (status: ProductStatus) => {
    if (selectedProductIds.size === 0) return;
    setPendingBulkStatus(status);
    setBulkStatusConfirmOpen(true);
  };

  const confirmBulkStatusChange = async () => {
    if (!pendingBulkStatus) return;
    await bulkUpdateStatusMutation.mutateAsync({
      ids: Array.from(selectedProductIds),
      status: pendingBulkStatus,
    });
  };

  const handleAddProduct = () => {
    setEditingProductId(undefined);
    setSheetOpen(true);
  };

  const handleEditProduct = useCallback((id: string) => {
    setEditingProductId(id);
    setSheetOpen(true);
  }, []);

  const handleDeleteProduct = useCallback(
    (product: { id: string; name: string }) => {
      setProductToDelete(product);
      setDeleteConfirmOpen(true);
    },
    [],
  );

  const confirmDeleteProduct = useCallback(async () => {
    if (!productToDelete) return;

    setDeletingProductId(productToDelete.id);
    try {
      await deleteProductMutation.mutateAsync({ id: productToDelete.id });
      setDeleteConfirmOpen(false);
      setProductToDelete(null);
    } catch (_error) {
      // Error is handled by mutation onError
    }
  }, [productToDelete, deleteProductMutation]);

  const handleViewProduct = useCallback((id: string) => {
    setViewingProductId(id);
    setViewSheetOpen(true);
  }, []);

  const handleExportCSV = () => {
    const columns: CSVColumn<ProductWithRelations>[] = [
      { key: "name", label: "Product Name" },
      { key: "sku", label: "SKU" },
      { key: (p) => p.category.name, label: "Category" },
      { key: (p) => Number(p.price).toLocaleString(), label: "Price (₦)" },
      { key: "stock", label: "Stock" },
      { key: "statusDisplay", label: "Status" },
      { key: "sales", label: "Sales" },
      {
        key: (p) => new Date(p.created_at).toLocaleDateString(),
        label: "Date Added",
      },
    ];
    exportToCSV(adminProducts, columns, "products");
  };

  const handleFormSuccess = () => {
    productsQuery.refetch();
    statsQuery.refetch();
  };

  const stats = statsQuery.data;

  const categories = [
    "All",
    ...Array.from(new Set(adminProducts.map((p) => p.category.name))),
  ];
  const statuses = ["All", "ACTIVE", "DRAFT", "INACTIVE", "ARCHIVED"] as const;
  const statusLabels: Record<string, string> = {
    All: "All Status",
    ACTIVE: "Active",
    DRAFT: "Draft",
    INACTIVE: "Inactive",
    ARCHIVED: "Archived",
  };

  const columns: Column<ProductWithRelations>[] = useMemo(
    () => [
      {
        header: "",
        className: "w-12",
        cell: (product) => (
          <input
            type="checkbox"
            checked={selectedProductIds.has(product.id)}
            onChange={(e) => handleSelectProduct(product.id, e.target.checked)}
            className="w-4 h-4 text-[#38761d] focus:ring-[#38761d] border-gray-300 rounded cursor-pointer"
            onClick={(e) => e.stopPropagation()}
          />
        ),
      },
      {
        header: "Product",
        cell: (product) => (
          <div className="flex items-center">
            <div className="relative w-12 h-12 mr-4 flex-shrink-0">
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className="rounded-md object-cover"
              />
            </div>
            <div>
              <span className="font-medium text-gray-900">{product.name}</span>
              <p className="text-sm text-gray-500">SKU: {product.sku}</p>
            </div>
          </div>
        ),
      },
      {
        header: "Category",
        cell: (product) => (
          <span className="text-gray-600">{product.category.name}</span>
        ),
      },
      {
        header: "Price",
        cell: (product) => (
          <span className="text-gray-900 font-medium">
            ₦{Number(product.price).toLocaleString()}
          </span>
        ),
      },
      {
        header: "Stock",
        cell: (product) => (
          <span className="text-gray-600">{product.stock} units</span>
        ),
      },
      {
        header: "Status",
        cell: (product) => (
          <span
            className={`px-2 py-1 text-xs font-semibold rounded-full ${product.statusDisplay === "Active"
              ? "bg-green-100 text-green-800"
              : product.statusDisplay === "Draft"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-red-100 text-red-800"
              }`}
          >
            {product.statusDisplay}
          </span>
        ),
      },
      {
        header: "Sales",
        cell: (product) => (
          <span className="text-gray-600">{product.sales}</span>
        ),
      },
      {
        header: "Date Added",
        cell: (product) => (
          <span className="text-gray-600">
            {new Date(product.created_at).toLocaleDateString()}
          </span>
        ),
      },
      {
        header: "Actions",
        cell: (product) => (
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
                onClick={() => handleViewProduct(product.id)}
                className="cursor-pointer"
              >
                <EyeIcon className="w-4 h-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleEditProduct(product.id)}
                className="cursor-pointer"
              >
                <EditIcon className="w-4 h-4 mr-2" />
                Edit Product
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() =>
                  handleDeleteProduct({ id: product.id, name: product.name })
                }
                disabled={deletingProductId === product.id}
                className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
              >
                <TrashIcon className="w-4 h-4 mr-2" />
                Delete Product
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [
      selectedProductIds,
      handleSelectProduct,
      deletingProductId,
      handleViewProduct,
      handleEditProduct,
      handleDeleteProduct,
    ],
  );

  return (
    <div>
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Products Management
          </h1>
          <p className="text-gray-600">
            Manage your product catalog and inventory
          </p>
        </div>
        <button
          type="button"
          onClick={handleAddProduct}
          className="flex items-center gap-2 px-4 py-2 bg-[#38761d] text-white rounded-lg hover:bg-opacity-90 font-medium transition-colors"
        >
          <PlusIcon className="w-4 h-4" />
          Add New Product
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <div className="w-6 h-6 text-blue-600">📦</div>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Total Products</p>
              <p className="text-2xl font-bold text-gray-900">
                {statsQuery.isLoading ? "..." : stats?.totalProducts || 0}
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
              <p className="text-sm text-gray-500">Active Products</p>
              <p className="text-2xl font-bold text-gray-900">
                {statsQuery.isLoading ? "..." : stats?.activeProducts || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <div className="w-6 h-6 text-red-600">⚠️</div>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Out of Stock</p>
              <p className="text-2xl font-bold text-gray-900">
                {statsQuery.isLoading ? "..." : stats?.outOfStockProducts || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <div className="w-6 h-6 text-yellow-600">📝</div>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Featured Products</p>
              <p className="text-2xl font-bold text-gray-900">
                {statsQuery.isLoading ? "..." : stats?.featuredProducts || 0}
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
              {selectedProductIds.size} product(s) selected
            </span>
            <button
              type="button"
              onClick={() => setSelectedProductIds(new Set())}
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
                <DropdownMenuItem
                  onClick={() => handleBulkStatusChange("ARCHIVED")}
                  className="cursor-pointer"
                >
                  <span className="w-2 h-2 bg-gray-600 rounded-full mr-2" />
                  Archived
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
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 outline-none"
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <SearchIcon />
            </div>
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 outline-none"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category} Category
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as ProductStatus | "All")
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

      <DataTable
        columns={columns}
        data={filteredProducts}
        isLoading={productsQuery.isLoading}
        error={productsQuery.error}
        onRetry={() => productsQuery.refetch()}
        emptyMessage="No products found matching your filters"
        keyExtractor={(product) => product.id}
        pagination={productsQuery.data?.pagination}
        onPageChange={(page) => setCurrentPage(page)}
      />

      <ProductFormSheet
        productId={editingProductId}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onSuccess={handleFormSuccess}
      />

      <ProductViewSheet
        productId={viewingProductId}
        open={viewSheetOpen}
        onOpenChange={setViewSheetOpen}
      />

      {/* Single delete confirm */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={(open) => {
          setDeleteConfirmOpen(open);
          if (!open) setProductToDelete(null);
        }}
        title="Delete Product"
        description={`Are you sure you want to delete "${productToDelete?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={confirmDeleteProduct}
        isLoading={deleteProductMutation.isPending}
        variant="danger"
      />

      {/* Bulk delete confirm */}
      <ConfirmDialog
        open={bulkDeleteConfirmOpen}
        onOpenChange={setBulkDeleteConfirmOpen}
        title="Delete Selected Products"
        description={`Are you sure you want to delete ${selectedProductIds.size} product(s)? This action cannot be undone.`}
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
        title="Update Product Status"
        description={`Are you sure you want to change the status of ${selectedProductIds.size} product(s) to "${pendingBulkStatus}"?`}
        confirmLabel="Update Status"
        cancelLabel="Cancel"
        onConfirm={confirmBulkStatusChange}
        isLoading={bulkUpdateStatusMutation.isPending}
        variant="default"
      />
    </div>
  );
}

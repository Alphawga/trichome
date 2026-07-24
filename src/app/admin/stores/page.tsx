"use client";

import type { Store } from "@prisma/client";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { type Column, DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EditIcon, EyeIcon, PlusIcon, SearchIcon, TrashIcon } from "@/components/ui/icons";
import { trpc } from "@/utils/trpc";
import { StoreFormSheet } from "./StoreFormSheet";
import { StoreViewSheet } from "./StoreViewSheet";

type StoreWithRelations = Store & {
  _count: { orders: number };
};

export default function AdminStoresPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [viewSheetOpen, setViewSheetOpen] = useState(false);
  const [editingStoreId, setEditingStoreId] = useState<string | undefined>();
  const [viewingStoreId, setViewingStoreId] = useState<string | undefined>();
  const [deletingStoreId, setDeletingStoreId] = useState<string | null>(null);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [storeToDelete, setStoreToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const storesQuery = trpc.getStores.useQuery(
    {
      search: searchTerm.trim() || undefined,
      page: currentPage,
      limit: 10,
    },
    {
      staleTime: 30000,
      refetchOnWindowFocus: false,
    },
  );

  const deleteStoreMutation = trpc.deleteStore.useMutation({
    onSuccess: () => {
      storesQuery.refetch();
      setDeletingStoreId(null);
      setDeleteConfirmOpen(false);
      setStoreToDelete(null);
      toast.success("Store deleted successfully");
    },
    onError: (error) => {
      toast.error(`Failed to delete store: ${error.message}`);
      setDeletingStoreId(null);
    },
  });

  const stores: StoreWithRelations[] = storesQuery.data?.stores || [];

  const handleAddStore = () => {
    setEditingStoreId(undefined);
    setSheetOpen(true);
  };

  const handleEditStore = useCallback((id: string) => {
    setEditingStoreId(id);
    setSheetOpen(true);
  }, []);

  const handleDeleteStore = useCallback(
    (store: { id: string; name: string }) => {
      setStoreToDelete(store);
      setDeleteConfirmOpen(true);
    },
    [],
  );

  const confirmDeleteStore = useCallback(async () => {
    if (!storeToDelete) return;
    setDeletingStoreId(storeToDelete.id);
    try {
      await deleteStoreMutation.mutateAsync({ id: storeToDelete.id });
    } catch (_error) {
      // Error handled in mutation
    }
  }, [storeToDelete, deleteStoreMutation]);

  const handleViewStore = useCallback((id: string) => {
    setViewingStoreId(id);
    setViewSheetOpen(true);
  }, []);

  const handleFormSuccess = () => {
    storesQuery.refetch();
  };

  const columns: Column<StoreWithRelations>[] = useMemo(
    () => [
      {
        header: "Store",
        cell: (store) => (
          <div>
            <span className="font-medium text-gray-900">{store.name}</span>
            <p className="text-sm text-gray-500">{store.address}</p>
          </div>
        ),
      },
      {
        header: "Phone",
        cell: (store) => (
          <span className="text-gray-600">{store.phone || "—"}</span>
        ),
      },
      {
        header: "Orders",
        cell: (store) => (
          <span className="text-gray-600">{store._count.orders}</span>
        ),
      },
      {
        header: "Status",
        cell: (store) => (
          <StatusBadge variant={store.is_active ? "success" : "danger"}>
            {store.is_active ? "Active" : "Inactive"}
          </StatusBadge>
        ),
      },
      {
        header: "Sort Order",
        cell: (store) => (
          <span className="text-gray-600">{store.sort_order}</span>
        ),
      },
      {
        header: "Actions",
        cell: (store) => (
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
                onClick={() => handleViewStore(store.id)}
                className="cursor-pointer"
              >
                <EyeIcon className="w-4 h-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleEditStore(store.id)}
                className="cursor-pointer"
              >
                <EditIcon className="w-4 h-4 mr-2" />
                Edit Store
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() =>
                  handleDeleteStore({ id: store.id, name: store.name })
                }
                disabled={deletingStoreId === store.id}
                className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
              >
                <TrashIcon className="w-4 h-4 mr-2" />
                Delete Store
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [deletingStoreId, handleViewStore, handleEditStore, handleDeleteStore],
  );

  return (
    <div>
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Stores Management
          </h1>
          <p className="text-gray-600">
            Manage pickup locations customers can choose at checkout
          </p>
        </div>
        <button
          type="button"
          onClick={handleAddStore}
          className="flex items-center gap-2 px-4 py-2 bg-[#38761d] text-white rounded-lg hover:bg-opacity-90 font-medium transition-colors"
        >
          <PlusIcon className="w-4 h-4" />
          Add New Store
        </button>
      </div>

      <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search stores..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 outline-none"
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <SearchIcon />
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={stores}
        isLoading={storesQuery.isLoading}
        error={storesQuery.error}
        onRetry={() => storesQuery.refetch()}
        emptyMessage="No stores found. Add your first pickup location."
        keyExtractor={(store) => store.id}
        pagination={storesQuery.data?.pagination}
        onPageChange={(page) => setCurrentPage(page)}
      />

      <StoreFormSheet
        storeId={editingStoreId}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onSuccess={handleFormSuccess}
      />

      <StoreViewSheet
        storeId={viewingStoreId}
        open={viewSheetOpen}
        onOpenChange={setViewSheetOpen}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={(open) => {
          setDeleteConfirmOpen(open);
          if (!open) setStoreToDelete(null);
        }}
        title="Delete Store"
        description={`Are you sure you want to delete "${storeToDelete?.name}"? This action cannot be undone. Stores with associated orders cannot be deleted — deactivate instead.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={confirmDeleteStore}
        isLoading={deleteStoreMutation.isPending}
        variant="danger"
      />
    </div>
  );
}

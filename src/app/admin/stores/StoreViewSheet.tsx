"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { LogoLoader } from "@/components/ui/logo-loader";
import { trpc } from "@/utils/trpc";

interface StoreViewSheetProps {
  storeId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StoreViewSheet({
  storeId,
  open,
  onOpenChange,
}: StoreViewSheetProps) {
  const storeQuery = trpc.getStoreById.useQuery(
    storeId ? { id: storeId } : { id: "" },
    { enabled: !!storeId && open },
  );

  const store = storeQuery.data;
  const isLoading = storeQuery.isLoading;
  const hasError = storeQuery.error;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg p-0 overflow-y-auto">
        <SheetHeader className="p-6 border-b">
          <SheetTitle>Store Details</SheetTitle>
          <SheetDescription>
            View detailed information about this pickup location
          </SheetDescription>
        </SheetHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <LogoLoader size="lg" text="Loading store details..." />
          </div>
        ) : hasError ? (
          <div className="flex items-center justify-center py-12 px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <p className="text-gray-900 font-medium">Failed to load store</p>
              <p className="text-gray-600 text-sm">{storeQuery.error.message}</p>
              <button
                type="button"
                onClick={() => storeQuery.refetch()}
                className="px-4 py-2 bg-[#38761d] text-white rounded-lg hover:bg-opacity-90"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : store ? (
          <div className="p-6 space-y-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {store.name}
              </h3>
              <p className="text-gray-600 mb-3">{store.address}</p>
              <span
                className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${
                  store.is_active
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {store.is_active ? "Active" : "Inactive"}
              </span>
            </div>

            <div className="border-t pt-6 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Phone</span>
                <span className="text-gray-900">{store.phone || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Opening Hours</span>
                <span className="text-gray-900">
                  {store.opening_hours || "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Map Link</span>
                {store.map_url ? (
                  <a
                    href={store.map_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#38761d] hover:underline"
                  >
                    View on map
                  </a>
                ) : (
                  <span className="text-gray-900">—</span>
                )}
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Sort Order</span>
                <span className="text-gray-900">{store.sort_order}</span>
              </div>
            </div>

            <div className="border-t pt-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                Statistics
              </h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">
                  Orders Picked Up Here
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {store._count.orders}
                </p>
              </div>
            </div>

            <div className="border-t pt-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                Metadata
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Created</span>
                  <span className="text-gray-900">
                    {new Date(store.created_at).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Updated</span>
                  <span className="text-gray-900">
                    {new Date(store.updated_at).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { trpc } from "@/utils/trpc";

const storeSchema = z.object({
  name: z.string().min(1, "Store name is required"),
  address: z.string().min(1, "Address is required"),
  phone: z.string().optional(),
  opening_hours: z.string().optional(),
  map_url: z.string().optional(),
  is_active: z.boolean(),
  sort_order: z.number().int(),
});

type StoreInput = z.infer<typeof storeSchema>;

interface StoreFormSheetProps {
  storeId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function StoreFormSheet({
  storeId,
  open,
  onOpenChange,
  onSuccess,
}: StoreFormSheetProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<StoreInput>({
    resolver: zodResolver(storeSchema),
    defaultValues: {
      name: "",
      address: "",
      phone: "",
      opening_hours: "",
      map_url: "",
      is_active: true,
      sort_order: 0,
    },
  });

  const storeQuery = trpc.getStoreById.useQuery(
    storeId ? { id: storeId } : { id: "" },
    { enabled: !!storeId && open },
  );

  const createMutation = trpc.createStore.useMutation({
    onSuccess: () => {
      onSuccess?.();
      onOpenChange(false);
      reset();
      toast.success("Store created successfully");
    },
    onError: (error) => {
      toast.error(`Failed to create store: ${error.message}`);
    },
  });

  const updateMutation = trpc.updateStore.useMutation({
    onSuccess: () => {
      onSuccess?.();
      onOpenChange(false);
      toast.success("Store updated successfully");
    },
    onError: (error) => {
      toast.error(`Failed to update store: ${error.message}`);
    },
  });

  // Load store data for editing
  useEffect(() => {
    if (storeQuery.data && storeId) {
      reset({
        name: storeQuery.data.name,
        address: storeQuery.data.address,
        phone: storeQuery.data.phone || "",
        opening_hours: storeQuery.data.opening_hours || "",
        map_url: storeQuery.data.map_url || "",
        is_active: storeQuery.data.is_active,
        sort_order: storeQuery.data.sort_order,
      });
    } else if (!storeId) {
      reset({
        name: "",
        address: "",
        phone: "",
        opening_hours: "",
        map_url: "",
        is_active: true,
        sort_order: 0,
      });
    }
  }, [storeQuery.data, storeId, reset]);

  const onSubmit = async (data: StoreInput) => {
    if (storeId) {
      await updateMutation.mutateAsync({ id: storeId, ...data });
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="p-5 overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{storeId ? "Edit Store" : "Create New Store"}</SheetTitle>
          <SheetDescription>
            {storeId
              ? "Update pickup location information"
              : "Fill in the details to add a new pickup location"}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          {/* Name */}
          <div>
            <label htmlFor="name" className="text-gray-700">
              Store Name <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              {...register("name")}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 outline-none"
              placeholder="e.g., Main Branch"
            />
            {errors.name && (
              <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Address */}
          <div>
            <label htmlFor="address" className="text-gray-700">
              Address <span className="text-red-500">*</span>
            </label>
            <textarea
              id="address"
              {...register("address")}
              rows={3}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 outline-none"
              placeholder="e.g., 1st Floor HACO Building, Oritagun Bus Stop, Off Arakale Road, Akure, Ondo State"
            />
            {errors.address && (
              <p className="text-sm text-red-500 mt-1">
                {errors.address.message}
              </p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="text-gray-700">
              Phone
            </label>
            <input
              id="phone"
              {...register("phone")}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 outline-none"
              placeholder="e.g., 0808 709 8720"
            />
          </div>

          {/* Opening hours */}
          <div>
            <label htmlFor="opening_hours" className="text-gray-700">
              Opening Hours
            </label>
            <input
              id="opening_hours"
              {...register("opening_hours")}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 outline-none"
              placeholder="e.g., Mon-Sat 9am-6pm"
            />
          </div>

          {/* Map URL */}
          <div>
            <label htmlFor="map_url" className="text-gray-700">
              Map Link
            </label>
            <input
              id="map_url"
              {...register("map_url")}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 outline-none"
              placeholder="Google Maps URL"
            />
          </div>

          {/* Active toggle */}
          <div className="flex items-center gap-2">
            <input
              id="is_active"
              type="checkbox"
              {...register("is_active")}
              className="w-4 h-4 text-[#38761d] focus:ring-[#38761d] border-gray-300 rounded cursor-pointer"
            />
            <label htmlFor="is_active" className="text-gray-700">
              Active (visible to customers at checkout)
            </label>
          </div>

          {/* Sort Order */}
          <div>
            <label htmlFor="sort_order" className="text-gray-700">
              Sort Order
            </label>
            <input
              id="sort_order"
              type="number"
              {...register("sort_order", { valueAsNumber: true })}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 outline-none"
              placeholder="0"
            />
            <p className="text-xs text-gray-500 mt-1">
              Lower numbers appear first
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-[#38761d] text-white rounded-lg hover:bg-opacity-90 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting
                ? "Saving..."
                : storeId
                  ? "Update Store"
                  : "Create Store"}
            </button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}

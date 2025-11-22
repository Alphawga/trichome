"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ProductStatus } from "@prisma/client";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { ImageUploader } from "@/components/ui/image-uploader";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { trpc } from "@/utils/trpc";

const brandSchema = z.object({
  name: z.string().min(1, "Brand name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
  logo: z.string().optional(),
  image: z.string().optional(),
  status: z.nativeEnum(ProductStatus),
  sort_order: z.number().int(),
});

type BrandInput = z.infer<typeof brandSchema>;

interface BrandFormSheetProps {
  brandId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function BrandFormSheet({
  brandId,
  open,
  onOpenChange,
  onSuccess,
}: BrandFormSheetProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<BrandInput>({
    resolver: zodResolver(brandSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      logo: "",
      image: "",
      status: ProductStatus.ACTIVE,
      sort_order: 0,
    },
  });

  const brandQuery = trpc.getBrandById.useQuery(
    brandId ? { id: brandId } : { id: "" },
    { enabled: !!brandId && open },
  );

  const createMutation = trpc.createBrand.useMutation({
    onSuccess: () => {
      onSuccess?.();
      onOpenChange(false);
      reset();
      toast.success("Brand created successfully");
    },
    onError: (error) => {
      toast.error(`Failed to create brand: ${error.message}`);
    },
  });

  const updateMutation = trpc.updateBrand.useMutation({
    onSuccess: () => {
      onSuccess?.();
      onOpenChange(false);
      toast.success("Brand updated successfully");
    },
    onError: (error) => {
      toast.error(`Failed to update brand: ${error.message}`);
    },
  });

  // Auto-generate slug from brand name (only for new brands)
  const brandName = watch("name");
  useEffect(() => {
    if (!brandId && brandName) {
      const slug = brandName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      setValue("slug", slug);
    }
  }, [brandName, brandId, setValue]);

  // Load brand data for editing
  useEffect(() => {
    if (brandQuery.data && brandId) {
      reset({
        name: brandQuery.data.name,
        slug: brandQuery.data.slug,
        description: brandQuery.data.description || "",
        logo: brandQuery.data.logo || "",
        image: brandQuery.data.image || "",
        status: brandQuery.data.status,
        sort_order: brandQuery.data.sort_order,
      });
    } else if (!brandId) {
      reset({
        name: "",
        slug: "",
        description: "",
        logo: "",
        image: "",
        status: ProductStatus.ACTIVE,
        sort_order: 0,
      });
    }
  }, [brandQuery.data, brandId, reset]);

  const onSubmit = async (data: BrandInput) => {
    if (brandId) {
      await updateMutation.mutateAsync({ id: brandId, ...data });
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{brandId ? "Edit Brand" : "Create New Brand"}</SheetTitle>
          <SheetDescription>
            {brandId
              ? "Update brand information"
              : "Fill in the details to create a new brand"}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          {/* Name */}
          <div>
            <label htmlFor="name" className="text-gray-700">
              Brand Name <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              {...register("name", { required: "Brand name is required" })}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 outline-none"
              placeholder="e.g., La Roche-Posay"
            />
            {errors.name && (
              <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Slug */}
          <div>
            <label htmlFor="slug" className="text-gray-700">
              Slug <span className="text-red-500">*</span>
            </label>
            <input
              id="slug"
              {...register("slug", { required: "Slug is required" })}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 outline-none"
              placeholder="e.g., la-roche-posay"
            />
            {errors.slug && (
              <p className="text-sm text-red-500 mt-1">{errors.slug.message}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              URL-friendly identifier (auto-generated from name)
            </p>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              {...register("description")}
              rows={4}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 outline-none"
              placeholder="Brand description..."
            />
            {errors.description && (
              <p className="text-sm text-red-500 mt-1">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Logo */}
          <div>
            <label className="text-gray-700">Logo</label>
            <ImageUploader
              value={watch("logo")}
              onChange={(url) => setValue("logo", url || "")}
              folder="brands/logos"
              className="mt-1"
            />
            {watch("logo") && (
              <div className="mt-2">
                <img
                  src={watch("logo")}
                  alt="Brand logo"
                  className="w-20 h-20 object-contain border border-gray-200 rounded"
                />
              </div>
            )}
          </div>

          {/* Image */}
          <div>
            <label className="text-gray-700">Brand Image</label>
            <ImageUploader
              value={watch("image")}
              onChange={(url) => setValue("image", url || "")}
              folder="brands/images"
              className="mt-1"
            />
            {watch("image") && (
              <div className="mt-2">
                <img
                  src={watch("image")}
                  alt="Brand image"
                  className="w-32 h-32 object-cover border border-gray-200 rounded"
                />
              </div>
            )}
          </div>

          {/* Status */}
          <div>
            <label htmlFor="status" className="text-gray-700">
              Status <span className="text-red-500">*</span>
            </label>
            <select
              id="status"
              {...register("status")}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 outline-none"
            >
              <option value={ProductStatus.ACTIVE}>Active</option>
              <option value={ProductStatus.INACTIVE}>Inactive</option>
              <option value={ProductStatus.DRAFT}>Draft</option>
            </select>
            {errors.status && (
              <p className="text-sm text-red-500 mt-1">
                {errors.status.message}
              </p>
            )}
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
            {errors.sort_order && (
              <p className="text-sm text-red-500 mt-1">
                {errors.sort_order.message}
              </p>
            )}
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
                : brandId
                  ? "Update Brand"
                  : "Create Brand"}
            </button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}


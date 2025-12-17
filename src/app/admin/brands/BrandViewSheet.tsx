"use client";

import Image from "next/image";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { LogoLoader } from "@/components/ui/logo-loader";
import { trpc } from "@/utils/trpc";

interface BrandViewSheetProps {
  brandId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BrandViewSheet({
  brandId,
  open,
  onOpenChange,
}: BrandViewSheetProps) {
  const brandQuery = trpc.getBrandById.useQuery(
    brandId ? { id: brandId } : { id: "" },
    { enabled: !!brandId && open },
  );

  if (!brandId) return null;

  const brand = brandQuery.data;

  if (brandQuery.isLoading) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-lg px-4 md:px-6">
          <div className="flex items-center justify-center py-12">
            <LogoLoader size="md" text="Loading brand..." />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  if (!brand) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent>
          <div className="text-center py-8 text-gray-500">
            Brand not found
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  const imageUrl =
    brand.logo ||
    brand.image ||
    `https://placehold.co/200x200/38761d/white?text=${brand.name.charAt(0)}`;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{brand.name}</SheetTitle>
          <SheetDescription>Brand Details</SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Brand Image/Logo */}
          <div className="flex justify-center">
            <div className="relative w-32 h-32">
              <Image
                src={imageUrl}
                alt={brand.name}
                fill
                className="rounded-lg object-contain border border-gray-200"
              />
            </div>
          </div>

          {/* Brand Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Information</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium">{brand.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Slug</p>
                <p className="font-medium">{brand.slug}</p>
              </div>
              {brand.description && (
                <div>
                  <p className="text-sm text-gray-500">Description</p>
                  <p className="font-medium">{brand.description}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <span
                  className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${brand.status === "ACTIVE"
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
              </div>
              <div>
                <p className="text-sm text-gray-500">Sort Order</p>
                <p className="font-medium">{brand.sort_order}</p>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Statistics</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Total Products</p>
                <p className="font-medium text-2xl">
                  {brand._count.products}
                </p>
              </div>
            </div>
          </div>

          {/* Dates */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Dates</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Created</p>
                <p className="font-medium">
                  {new Date(brand.created_at).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Last Updated</p>
                <p className="font-medium">
                  {new Date(brand.updated_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}


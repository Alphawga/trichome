"use client";

import type { Category, Product, ProductImage } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { PlusIcon, XIcon } from "@/components/ui/icons";

type AttributeKey =
  | "price"
  | "rating"
  | "reviewCount"
  | "description"
  | "category"
  | "inStock"
  | "weight";

type ProductForComparison = (Product & {
  images?: ProductImage[];
  category?: Pick<Category, "name"> | null;
}) & {
  slug?: string;
  image?: string;
  rating?: number;
  reviewCount?: number;
  inStock?: boolean;
  weight?: number;
  // price can be Prisma.Decimal; allow string for upstream mappers
  price?: Product["price"] | string;
};

interface ComparisonTableProps {
  /** Products to compare */
  products: Array<ProductForComparison>;
  /** Maximum products to compare */
  maxProducts?: number;
  /** Callback when product is removed */
  onRemove?: (productId: string) => void;
  /** Callback when "Add Product" is clicked */
  onAddProduct?: () => void;
  /** Additional className */
  className?: string;
}

/**
 * ComparisonTable Component
 *
 * Displays products side-by-side for comparison.
 *
 * Follows Trichomes Design Guide principles:
 * - Reusable component
 * - Type-safe
 * - Responsive design
 * - Accessible
 */
export function ComparisonTable({
  products,
  maxProducts = 4,
  onRemove,
  onAddProduct,
  className = "",
}: ComparisonTableProps) {
  const [selectedAttributes, setSelectedAttributes] = useState<string[]>([
    "price",
    "rating",
    "description",
    "category",
    "inStock",
  ]);

  // Available attributes for comparison
  const availableAttributes = [
    {
      key: "price" as const,
      label: "Price",
      formatter: (value: unknown) => `₦${Number(value ?? 0).toLocaleString()}`,
    },
    {
      key: "rating" as const,
      label: "Rating",
      formatter: (value: unknown) =>
        typeof value === "number" ? `${value}/5 ⭐` : "N/A",
    },
    {
      key: "reviewCount" as const,
      label: "Reviews",
      formatter: (value: unknown) =>
        typeof value === "number" ? String(value) : "0",
    },
    {
      key: "description" as const,
      label: "Description",
      formatter: (value: unknown) =>
        typeof value === "string" && value.length > 0 ? value : "N/A",
    },
    {
      key: "category" as const,
      label: "Category",
      formatter: (value: unknown) =>
        value && typeof value === "object" && value !== null && "name" in value
          ? String((value as { name?: string }).name || "N/A")
          : "N/A",
    },
    {
      key: "inStock" as const,
      label: "Availability",
      formatter: (value: unknown) => (value ? "In Stock" : "Out of Stock"),
    },
    {
      key: "weight" as const,
      label: "Weight",
      formatter: (value: unknown) =>
        typeof value === "number" ? `${value}kg` : "N/A",
    },
  ] satisfies Array<{
    key: AttributeKey;
    label: string;
    formatter: (value: unknown) => string;
  }>;

  // Filter attributes based on selected
  const attributesToShow = availableAttributes.filter((attr) =>
    selectedAttributes.includes(attr.key),
  );

  const getAttributeValue = (
    product: ProductForComparison,
    key: AttributeKey,
  ): unknown => {
    return product[key as keyof ProductForComparison];
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-heading font-semibold text-trichomes-forest">
          Compare Products
        </h2>
        <div className="flex items-center gap-2">
          {/* Add Product Button */}
          {products.length < maxProducts && onAddProduct && (
            <button
              type="button"
              onClick={onAddProduct}
              className="px-4 py-2 border border-trichomes-forest/20 text-trichomes-forest hover:bg-trichomes-soft rounded font-medium text-sm font-body transition-colors duration-150 flex items-center gap-2"
            >
              <PlusIcon className="w-4 h-4" />
              Add Product
            </button>
          )}
        </div>
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto">
        <table className="w-full bg-white rounded-xl border border-trichomes-forest/10 shadow-sm overflow-hidden">
          <thead>
            <tr className="bg-trichomes-soft border-b border-trichomes-forest/10">
              <th className="px-4 py-4 text-left text-sm font-semibold text-trichomes-forest font-body sticky left-0 bg-trichomes-soft z-10">
                Features
              </th>
              {products.map((product) => (
                <th
                  key={product.id}
                  className="px-4 py-4 text-center min-w-[200px] relative"
                >
                  {onRemove && (
                    <button
                      type="button"
                      onClick={() => onRemove(product.id)}
                      className="absolute top-2 right-2 text-trichomes-forest/40 hover:text-trichomes-forest transition-colors duration-150"
                      aria-label={`Remove ${product.name} from comparison`}
                    >
                      <XIcon className="w-4 h-4" />
                    </button>
                  )}
                  <div className="flex flex-col items-center gap-3">
                    {product.image && (
                      <Link
                        href={`/products/${product.id}`}
                        className="relative w-32 h-32 bg-trichomes-soft rounded border border-trichomes-forest/10 overflow-hidden hover:border-trichomes-primary transition-colors duration-150"
                      >
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover"
                          sizes="128px"
                        />
                      </Link>
                    )}
                    <Link
                      href={`/products/${product.id}`}
                      className="font-semibold text-trichomes-forest hover:text-trichomes-primary transition-colors duration-150 font-body text-sm text-center"
                    >
                      {product.name}
                    </Link>
                  </div>
                </th>
              ))}
              {/* Empty columns for remaining slots */}
              {["slot-a", "slot-b", "slot-c", "slot-d"]
                .slice(0, Math.max(0, maxProducts - products.length))
                .map((slotKey) => (
                  <th
                    key={slotKey}
                    className="px-4 py-4 text-center min-w-[200px]"
                  >
                    {onAddProduct && (
                      <button
                        type="button"
                        onClick={onAddProduct}
                        className="w-full h-32 border-2 border-dashed border-trichomes-forest/20 rounded hover:border-trichomes-primary hover:bg-trichomes-primary/5 transition-all duration-150 flex flex-col items-center justify-center gap-2"
                      >
                        <PlusIcon className="w-6 h-6 text-trichomes-forest/40" />
                        <span className="text-xs text-trichomes-forest/60 font-body">
                          Add Product
                        </span>
                      </button>
                    )}
                  </th>
                ))}
            </tr>
          </thead>
          <tbody>
            {attributesToShow.map((attribute, index) => (
              <tr
                key={attribute.key}
                className={
                  index % 2 === 0 ? "bg-white" : "bg-trichomes-soft/30"
                }
              >
                <td className="px-4 py-3 font-medium text-trichomes-forest text-sm sticky left-0 bg-inherit z-10 font-body">
                  {attribute.label}
                </td>
                {products.map((product) => (
                  <td
                    key={product.id}
                    className="px-4 py-3 text-center text-sm text-trichomes-forest/70 font-body"
                  >
                    {attribute.formatter(
                      getAttributeValue(product, attribute.key),
                    )}
                  </td>
                ))}
                {["slot-a", "slot-b", "slot-c", "slot-d"]
                  .slice(0, Math.max(0, maxProducts - products.length))
                  .map((slotKey) => (
                    <td key={`cell-${slotKey}`} className="px-4 py-3"></td>
                  ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Attribute Selection (Mobile) */}
      <div className="lg:hidden bg-white p-4 rounded-xl border border-trichomes-forest/10 shadow-sm">
        <h3 className="text-sm font-semibold text-trichomes-forest mb-3 font-body">
          Show Attributes
        </h3>
        <div className="space-y-2">
          {availableAttributes.map((attr) => (
            <label
              key={attr.key}
              className="flex items-center gap-2 cursor-pointer text-sm font-body"
            >
              <input
                type="checkbox"
                checked={selectedAttributes.includes(attr.key)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedAttributes([...selectedAttributes, attr.key]);
                  } else {
                    setSelectedAttributes(
                      selectedAttributes.filter((a) => a !== attr.key),
                    );
                  }
                }}
                className="w-4 h-4 text-trichomes-primary border-trichomes-forest/15 rounded focus:ring-trichomes-primary focus:ring-1"
              />
              {attr.label}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

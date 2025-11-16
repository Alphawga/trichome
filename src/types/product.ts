import type { Category, Product, ProductImage } from "@prisma/client";

// Use Prisma-generated types as base and extend with computed fields
export type ProductWithImages = Product & {
  images: ProductImage[];
  category: Category;
};

export type ProductCardData = ProductWithImages & {
  rating?: number;
  reviewCount?: number;
  isNew?: boolean;
  isOnSale?: boolean;
};

export type ProductCategory = Category & {
  productCount: number;
};

export interface FilterState {
  categories: string[];
  priceRange: {
    min: number;
    max: number;
  };
  sortBy: "name" | "price-low" | "price-high" | "newest";
}

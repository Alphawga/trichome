import { ProductCardData, ProductCategory } from "@/types/product";
import { ProductStatus } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

// Mock data for demonstration - in production this would come from the database
export const mockCategories: ProductCategory[] = [
  {
    id: "1",
    name: "Skin care",
    slug: "skin-care",
    description: "Premium skincare products",
    image: null,
    status: ProductStatus.ACTIVE,
    sort_order: 1,
    parent_id: null,
    created_at: new Date(),
    updated_at: new Date(),
    productCount: 15
  },
  {
    id: "2",
    name: "Hair care",
    slug: "hair-care",
    description: "Professional hair care products",
    image: null,
    status: ProductStatus.ACTIVE,
    sort_order: 2,
    parent_id: null,
    created_at: new Date(),
    updated_at: new Date(),
    productCount: 8
  },
  {
    id: "3",
    name: "Body care",
    slug: "body-care",
    description: "Nourishing body care essentials",
    image: null,
    status: ProductStatus.ACTIVE,
    sort_order: 3,
    parent_id: null,
    created_at: new Date(),
    updated_at: new Date(),
    productCount: 12
  },
  {
    id: "4",
    name: "Perfumes",
    slug: "perfumes",
    description: "Luxury fragrances",
    image: null,
    status: ProductStatus.ACTIVE,
    sort_order: 4,
    parent_id: null,
    created_at: new Date(),
    updated_at: new Date(),
    productCount: 6
  }
];

export const mockProducts: ProductCardData[] = [
  {
    id: "1",
    name: "LA Roche-Posay Effaclar Purifying Foaming Gel",
    slug: "la-roche-posay-effaclar-gel",
    description: "Gentle purifying foaming gel for oily sensitive skin",
    short_description: "Purifying foaming gel for oily skin",
    sku: "LRP-EFF-001",
    barcode: null,
    price: new Decimal(89.00),
    compare_price: new Decimal(109.00),
    cost_price: new Decimal(65.00),
    track_quantity: true,
    quantity: 25,
    reserved_quantity: 0,
    low_stock_threshold: 5,
    weight: new Decimal(0.2),
    status: ProductStatus.ACTIVE,
    is_featured: true,
    is_digital: false,
    requires_shipping: true,
    taxable: true,
    seo_title: null,
    seo_description: null,
    view_count: 150,
    sale_count: 12,
    created_at: new Date('2024-01-15'),
    updated_at: new Date(),
    category_id: "1",
    category: mockCategories[0],
    images: [
      {
        id: "img1",
        product_id: "1",
        url: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop",
        alt_text: "LA Roche-Posay Effaclar Purifying Foaming Gel",
        sort_order: 1,
        is_primary: true,
        created_at: new Date()
      }
    ],
    rating: 4.5,
    reviewCount: 89,
    isNew: false,
    isOnSale: true
  },
  {
    id: "2",
    name: "CeraVe Hydrating Cleanser",
    slug: "cerave-hydrating-cleanser",
    description: "Daily facial cleanser for normal to dry skin",
    short_description: "Hydrating cleanser for dry skin",
    sku: "CRV-HYD-001",
    barcode: null,
    price: new Decimal(65.00),
    compare_price: null,
    cost_price: new Decimal(45.00),
    track_quantity: true,
    quantity: 18,
    reserved_quantity: 2,
    low_stock_threshold: 5,
    weight: new Decimal(0.3),
    status: ProductStatus.ACTIVE,
    is_featured: false,
    is_digital: false,
    requires_shipping: true,
    taxable: true,
    seo_title: null,
    seo_description: null,
    view_count: 89,
    sale_count: 8,
    created_at: new Date('2024-02-01'),
    updated_at: new Date(),
    category_id: "1",
    category: mockCategories[0],
    images: [
      {
        id: "img2",
        product_id: "2",
        url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop",
        alt_text: "CeraVe Hydrating Cleanser",
        sort_order: 1,
        is_primary: true,
        created_at: new Date()
      }
    ],
    rating: 4.2,
    reviewCount: 64,
    isNew: true,
    isOnSale: false
  },
  {
    id: "3",
    name: "Neutrogena Ultra Gentle Daily Cleanser",
    slug: "neutrogena-ultra-gentle-cleanser",
    description: "Ultra gentle daily cleanser for sensitive skin",
    short_description: "Gentle cleanser for sensitive skin",
    sku: "NEU-ULT-001",
    barcode: null,
    price: new Decimal(45.00),
    compare_price: null,
    cost_price: new Decimal(32.00),
    track_quantity: true,
    quantity: 30,
    reserved_quantity: 1,
    low_stock_threshold: 5,
    weight: new Decimal(0.25),
    status: ProductStatus.ACTIVE,
    is_featured: false,
    is_digital: false,
    requires_shipping: true,
    taxable: true,
    seo_title: null,
    seo_description: null,
    view_count: 67,
    sale_count: 5,
    created_at: new Date('2024-01-20'),
    updated_at: new Date(),
    category_id: "1",
    category: mockCategories[0],
    images: [
      {
        id: "img3",
        product_id: "3",
        url: "https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?w=400&h=400&fit=crop",
        alt_text: "Neutrogena Ultra Gentle Daily Cleanser",
        sort_order: 1,
        is_primary: true,
        created_at: new Date()
      }
    ],
    rating: 4.0,
    reviewCount: 43,
    isNew: false,
    isOnSale: false
  }
];

// Generate more products by repeating the pattern
export const generateMockProducts = (count: number): ProductCardData[] => {
  const products: ProductCardData[] = [];
  const baseProducts = mockProducts;

  for (let i = 0; i < count; i++) {
    const baseProduct = baseProducts[i % baseProducts.length];
    const productNumber = Math.floor(i / baseProducts.length) + 1;

    products.push({
      ...baseProduct,
      id: `${baseProduct.id}-${productNumber}`,
      name: `${baseProduct.name} ${productNumber > 1 ? `(${productNumber})` : ''}`,
      slug: `${baseProduct.slug}-${productNumber}`,
      sku: `${baseProduct.sku}-${productNumber}`,
      price: new Decimal((baseProduct.price.toNumber() + Math.random() * 20 - 10).toFixed(2)),
      images: baseProduct.images.map(img => ({
        ...img,
        id: `${img.id}-${productNumber}`,
        product_id: `${baseProduct.id}-${productNumber}`
      })),
      category_id: mockCategories[Math.floor(Math.random() * mockCategories.length)].id,
      category: mockCategories[Math.floor(Math.random() * mockCategories.length)],
      rating: Number((3.5 + Math.random() * 1.5).toFixed(1)),
      reviewCount: Math.floor(Math.random() * 100) + 10,
      isNew: Math.random() > 0.7,
      isOnSale: Math.random() > 0.6
    });
  }

  return products;
};
'use client';

import React, { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { ProductGrid } from '@/components/product/product-grid';
import { PlusIcon, MinusIcon, HeartIcon, ChevronDownIcon, ChevronUpIcon } from '@/components/ui/icons';

// Mock data - will be replaced with tRPC calls
const mockProducts = [
  {
    id: 1,
    name: 'La Roche-Posay Effaclar Purifying Foaming Gel Refill 400ml',
    price: 15800.00,
    currency: '₦',
    imageUrl: 'https://picsum.photos/seed/1/400/400',
    brand: 'La Roche-Posay',
    concerns: ['Acne & Blemishes'],
    ingredients: ['Salicylic Acid'],
    description: 'This gentle foaming gel deeply cleanses and purifies oily, blemish-prone skin without over-drying. Formulated with zinc pidolate to reduce excess oil and salicylic acid to unclog pores.',
    howToUse: [
      'Apply to wet skin morning and evening',
      'Massage gently to create a light foam',
      'Rinse thoroughly with water'
    ],
    additionalInfo: 'Dermatologist tested',
    slug: 'la-roche-posay-effaclar-gel',
    inStock: true
  },
  {
    id: 2,
    name: 'Nivea Men Deep Clean Shower Gel 500ml',
    price: 10300.00,
    currency: '₦',
    imageUrl: 'https://picsum.photos/seed/2/400/400',
    description: 'The innovative formula with natural-derived microfine clay absorbs impurities and cleanses your skin deeply, leaving a fresh skin feeling.',
    brand: 'Nivea',
    concerns: ['Dryness'],
    ingredients: ['Clay'],
    howToUse: [
      'Apply the shower gel to your wet skin',
      'Massage it onto your body, face and hair before rinsing it off'
    ],
    additionalInfo: 'Product available for wholesale',
    slug: 'nivea-men-deep-clean-gel',
    inStock: false
  },
  {
    id: 3,
    name: 'CeraVe Foaming Cleanser 236ml',
    price: 12500.00,
    currency: '₦',
    imageUrl: 'https://picsum.photos/seed/3/400/400',
    brand: 'CeraVe',
    concerns: ['Acne & Blemishes', 'Oily skin'],
    ingredients: ['Hyaluronic acid', 'Niacinamide'],
    description: 'Gentle foaming cleanser for normal to oily skin that removes dirt, oil and makeup without disrupting the skin barrier.',
    slug: 'cerave-foaming-cleanser',
    inStock: true
  }
];

// Temporary interface for migration
interface Product {
  id: number;
  name: string;
  price: number;
  currency: string;
  imageUrl: string;
  description?: string;
  howToUse?: string[];
  additionalInfo?: string;
  brand?: string;
  concerns?: string[];
  ingredients?: string[];
  slug: string;
  inStock?: boolean;
}

interface AccordionItemProps {
  title: string;
  children: React.ReactNode;
}

const AccordionItem: React.FC<AccordionItemProps> = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b">
      <button
        className="w-full flex justify-between items-center py-4 text-left"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="font-semibold">{title}</span>
        {isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
      </button>
      {isOpen && <div className="pb-4 text-gray-600">{children}</div>}
    </div>
  );
};

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [cart, setCart] = useState<any[]>([]);
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [quantity, setQuantity] = useState(1);

  // Find product by slug
  const product = useMemo(() => {
    return mockProducts.find(p => p.slug === params.slug);
  }, [params.slug]);

  // Related products (excluding current product)
  const relatedProducts = useMemo(() => {
    return mockProducts.filter(p => p.id !== product?.id).slice(0, 3);
  }, [product?.id]);

  if (!product) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] text-[#343A40]">
        <Header cartCount={0} wishlistCount={0} />
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-20">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
            <p className="text-gray-600 mb-6">The product you're looking for doesn't exist.</p>
            <Link href="/" className="bg-green-600 text-white py-2 px-6 rounded-md hover:bg-green-700 font-medium">
              Return to Shop
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const isInWishlist = wishlist.some(item => item.id === product.id);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const wishlistCount = wishlist.length;

  const handleAddToCart = (prod: Product, qty: number) => {
    const existingItem = cart.find(item => item.id === prod.id);
    if (existingItem) {
      setCart(cart.map(item =>
        item.id === prod.id ? { ...item, quantity: item.quantity + qty } : item
      ));
    } else {
      setCart([...cart, { ...prod, quantity: qty }]);
    }
    console.log(`Added ${qty} ${prod.name} to cart`);
  };

  const handleToggleWishlist = (prod: Product) => {
    const isInList = wishlist.find(item => item.id === prod.id);
    if (isInList) {
      setWishlist(wishlist.filter(item => item.id !== prod.id));
    } else {
      setWishlist([...wishlist, prod]);
    }
  };

  const handleProductClick = (prod: Product) => {
    router.push(`/products/${prod.slug}`);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#343A40]">
      <Header cartCount={cartCount} wishlistCount={wishlistCount} />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:underline">&larr; Shop</Link> /
          <span className="ml-1">Body care</span> /
          <span className="text-gray-800 ml-1">Soaps</span>
        </div>

        {/* Product Details */}
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Product Image */}
          <div className="lg:w-1/2">
            <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>

          {/* Product Info */}
          <div className="lg:w-1/2">
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            {product.additionalInfo && (
              <span className="inline-block bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full mb-4">
                {product.additionalInfo}
              </span>
            )}
            <p className="text-3xl font-bold text-gray-900 mb-6">
              {product.currency}{product.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>

            {/* How to Use */}
            {product.howToUse && (
              <div className="mb-6">
                <h2 className="font-semibold mb-2">How to use</h2>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  {product.howToUse.map((step, i) => <li key={i}>{step}</li>)}
                </ul>
              </div>
            )}

            {/* Purchase Options */}
            <div className="flex items-center space-x-4 mb-8">
              {/* Quantity Selector */}
              <div className="flex items-center border border-gray-300 rounded-md">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="px-4 py-3 text-gray-500 hover:text-black"
                >
                  <MinusIcon />
                </button>
                <span className="px-4 text-center w-14">{quantity}</span>
                <button
                  onClick={() => setQuantity(q => q + 1)}
                  className="px-4 py-3 text-gray-500 hover:text-black"
                >
                  <PlusIcon />
                </button>
              </div>

              {/* Wishlist Button */}
              <button
                onClick={() => handleToggleWishlist(product)}
                className="flex items-center gap-2 p-3 border border-gray-300 rounded-md hover:bg-gray-100"
              >
                <HeartIcon filled={isInWishlist} className={isInWishlist ? 'text-red-500' : 'text-gray-500'} />
                Add to wishlist
              </button>

              {/* Add to Cart Button */}
              <button
                onClick={() => handleAddToCart(product, quantity)}
                className="flex-grow bg-green-600 text-white py-3 px-6 rounded-md hover:bg-green-700 font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={!product.inStock}
              >
                {product.inStock ? 'Add to bag' : 'Out of Stock'}
              </button>
            </div>

            {/* Accordions */}
            <div className="space-y-2">
              <AccordionItem title="Description">
                <p>{product.description || 'No description available.'}</p>
              </AccordionItem>
              <AccordionItem title="Brand">
                <p>{product.brand || 'Brand information not available.'}</p>
              </AccordionItem>
              {product.concerns && product.concerns.length > 0 && (
                <AccordionItem title="Skin Concerns">
                  <ul className="space-y-1">
                    {product.concerns.map((concern, i) => (
                      <li key={i}>• {concern}</li>
                    ))}
                  </ul>
                </AccordionItem>
              )}
              {product.ingredients && product.ingredients.length > 0 && (
                <AccordionItem title="Key Ingredients">
                  <ul className="space-y-1">
                    {product.ingredients.map((ingredient, i) => (
                      <li key={i}>• {ingredient}</li>
                    ))}
                  </ul>
                </AccordionItem>
              )}
            </div>
          </div>
        </div>

        {/* Related Products */}
        <div className="mt-20">
          <h2 className="text-2xl font-bold mb-6">Related products</h2>
          <ProductGrid
            products={relatedProducts}
            onProductClick={handleProductClick}
            onAddToCart={handleAddToCart}
            wishlist={wishlist}
            onToggleWishlist={handleToggleWishlist}
          />
        </div>
      </main>
    </div>
  );
}
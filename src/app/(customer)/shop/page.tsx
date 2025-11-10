'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRightIcon } from '@/components/ui/icons';
import { trpc } from '@/utils/trpc';

export default function ShopPage() {
  const router = useRouter();

  const categoriesQuery = trpc.getCategoryTree.useQuery(undefined, {
    staleTime: 60000,
    refetchOnWindowFocus: false
  });

  const categories = categoriesQuery.data || [];

  return (
    <div className="min-h-screen bg-trichomes-soft">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-12 sm:pb-16 max-w-7xl">
        {/* Breadcrumbs */}
        <nav className="flex items-center space-x-2 text-sm text-trichomes-forest/60 mb-6 sm:mb-8 font-body">
          <Link href="/" className="hover:text-trichomes-forest transition-colors duration-150">Home</Link>
          <ChevronRightIcon className="w-4 h-4" />
          <span className="text-trichomes-forest font-medium">Shop</span>
        </nav>

        {/* Hero Section - Sage background */}
        <div className="bg-trichomes-sage rounded-xl p-8 sm:p-12 mb-8 sm:mb-12 text-center">
          <h1 className="text-[28px] sm:text-[36px] lg:text-[40px] font-heading font-semibold mb-3 sm:mb-4 text-trichomes-forest">
            Discover Our Collections
          </h1>
          <p className="text-[15px] sm:text-[16px] lg:text-[17px] text-trichomes-forest/70 max-w-2xl mx-auto leading-relaxed font-body font-normal">
            Explore our curated selection of premium beauty and skincare products
          </p>
        </div>

        {/* Quick Links - Mobile first grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
          <Link
            href="/products"
            className="bg-white rounded-xl border-2 border-trichomes-forest/10 hover:border-trichomes-primary p-6 sm:p-8 text-center transition-all duration-150 ease-out group shadow-sm hover:shadow-md"
          >
            <div className="w-16 h-16 bg-trichomes-sage rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-trichomes-primary transition-colors duration-150">
              <svg className="w-8 h-8 text-trichomes-primary group-hover:text-white transition-colors duration-150" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="text-[16px] sm:text-[17px] font-heading font-semibold mb-2 group-hover:text-trichomes-primary transition-colors duration-150 text-trichomes-forest">All Products</h3>
            <p className="text-[14px] sm:text-[15px] text-trichomes-forest/60 font-body font-normal">Browse our complete collection</p>
          </Link>

          <Link
            href="/brands"
            className="bg-white rounded-xl border-2 border-trichomes-forest/10 hover:border-trichomes-primary p-6 sm:p-8 text-center transition-all duration-150 ease-out group shadow-sm hover:shadow-md"
          >
            <div className="w-16 h-16 bg-trichomes-sage rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-trichomes-primary transition-colors duration-150">
              <svg className="w-8 h-8 text-trichomes-primary group-hover:text-white transition-colors duration-150" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <h3 className="text-[16px] sm:text-[17px] font-heading font-semibold mb-2 group-hover:text-trichomes-primary transition-colors duration-150 text-trichomes-forest">Shop by Brand</h3>
            <p className="text-[14px] sm:text-[15px] text-trichomes-forest/60 font-body font-normal">Explore your favorite brands</p>
          </Link>

          <Link
            href="/consultation"
            className="bg-white rounded-xl border-2 border-trichomes-forest/10 hover:border-trichomes-primary p-6 sm:p-8 text-center transition-all duration-150 ease-out group shadow-sm hover:shadow-md"
          >
            <div className="w-16 h-16 bg-trichomes-sage rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-trichomes-primary transition-colors duration-150">
              <svg className="w-8 h-8 text-trichomes-primary group-hover:text-white transition-colors duration-150" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-[16px] sm:text-[17px] font-heading font-semibold mb-2 group-hover:text-trichomes-primary transition-colors duration-150 text-trichomes-forest">Book Consultation</h3>
            <p className="text-[14px] sm:text-[15px] text-trichomes-forest/60 font-body font-normal">Get personalized recommendations</p>
          </Link>
        </div>

        {/* Categories */}
        <div className="mb-8 sm:mb-12">
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-[24px] sm:text-[32px] lg:text-[36px] font-heading font-semibold mb-2 sm:mb-3 text-trichomes-forest">
              Shop by Category
            </h2>
            <div className="w-20 sm:w-24 h-1 bg-trichomes-primary mx-auto"></div>
          </div>

          {categoriesQuery.isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-trichomes-forest/10 p-4 animate-pulse shadow-sm">
                  <div className="w-full h-48 bg-trichomes-sage rounded-lg mb-4"></div>
                  <div className="h-4 bg-trichomes-sage rounded mb-2"></div>
                </div>
              ))}
            </div>
          ) : categoriesQuery.error ? (
            <div className="text-center py-10 bg-white rounded-xl border border-trichomes-forest/10 shadow-sm">
              <p className="text-red-600 font-body">Error loading categories</p>
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-xl border border-trichomes-forest/10 shadow-sm">
              <p className="text-trichomes-forest/60 font-body">No categories available</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/products?category=${category.slug}`}
                  className="bg-white rounded-xl border-2 border-trichomes-forest/10 hover:border-trichomes-primary overflow-hidden group transition-all duration-150 ease-out shadow-sm hover:shadow-md"
                >
                  <div className="relative h-48 bg-trichomes-sage">
                    {category.image ? (
                      <Image
                        src={category.image}
                        alt={category.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-200 ease-in-out"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-trichomes-sage to-trichomes-soft">
                        <span className="text-4xl font-heading font-semibold text-trichomes-primary opacity-20">
                          {category.name.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-heading font-semibold text-[16px] sm:text-[17px] group-hover:text-trichomes-primary transition-colors duration-150 text-trichomes-forest">
                      {category.name}
                    </h3>
                    {category.description && (
                      <p className="text-[14px] text-trichomes-forest/60 mt-1 line-clamp-2 font-body font-normal">{category.description}</p>
                    )}
                    {category.children && category.children.length > 0 && (
                      <p className="text-[12px] text-trichomes-forest/50 mt-2 font-body font-normal">
                        {category.children.length} subcategories
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Featured Section - Sage background */}
        <div className="bg-trichomes-sage rounded-xl p-6 sm:p-8 text-center">
          <h2 className="text-[20px] sm:text-[24px] font-heading font-semibold mb-3 sm:mb-4 text-trichomes-forest">
            Not sure where to start?
          </h2>
          <p className="text-[15px] sm:text-[16px] text-trichomes-forest/70 mb-4 sm:mb-6 max-w-2xl mx-auto leading-relaxed font-body font-normal">
            Book a free consultation with our skincare experts to get personalized product recommendations tailored to your skin type and concerns.
          </p>
          <Link
            href="/consultation"
            className="inline-block bg-trichomes-primary text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full hover:bg-trichomes-primary/90 font-semibold transition-all duration-150 ease-out hover:shadow-lg text-[15px] sm:text-[16px] font-body"
          >
            Book Free Consultation
          </Link>
        </div>
      </div>
    </div>
  );
}

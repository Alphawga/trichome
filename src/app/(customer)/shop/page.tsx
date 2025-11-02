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
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
      {/* Breadcrumbs */}
      <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-gray-700">Home</Link>
        <ChevronRightIcon className="w-4 h-4" />
        <span className="text-gray-900 font-medium">Shop</span>
      </nav>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-900 via-green-600 to-green-900 rounded-lg p-12 mb-12 text-center text-white">
        <h1 className="text-4xl font-bold mb-4">Discover Our Collections</h1>
        <p className="text-lg opacity-90 max-w-2xl mx-auto">
          Explore our curated selection of premium beauty and skincare products
        </p>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <Link
          href="/products"
          className="bg-white rounded-lg border-2 border-gray-200 hover:border-green-600 p-8 text-center transition-all group"
        >
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-600 transition-colors">
            <svg className="w-8 h-8 text-green-600 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h3 className="text-lg font-bold mb-2 group-hover:text-green-600">All Products</h3>
          <p className="text-sm text-gray-600">Browse our complete collection</p>
        </Link>

        <Link
          href="/brands"
          className="bg-white rounded-lg border-2 border-gray-200 hover:border-green-600 p-8 text-center transition-all group"
        >
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-600 transition-colors">
            <svg className="w-8 h-8 text-green-600 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold mb-2 group-hover:text-green-600">Shop by Brand</h3>
          <p className="text-sm text-gray-600">Explore your favorite brands</p>
        </Link>

        <Link
          href="/consultation"
          className="bg-white rounded-lg border-2 border-gray-200 hover:border-green-600 p-8 text-center transition-all group"
        >
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-600 transition-colors">
            <svg className="w-8 h-8 text-green-600 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold mb-2 group-hover:text-green-600">Book Consultation</h3>
          <p className="text-sm text-gray-600">Get personalized recommendations</p>
        </Link>
      </div>

      {/* Categories */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Shop by Category</h2>

        {categoriesQuery.isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-lg border p-4 animate-pulse">
                <div className="w-full h-48 bg-gray-200 rounded-md mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
              </div>
            ))}
          </div>
        ) : categoriesQuery.error ? (
          <div className="text-center py-10 bg-white rounded-lg border">
            <p className="text-red-600">Error loading categories</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-lg border">
            <p className="text-gray-600">No categories available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/products?category=${category.slug}`}
                className="bg-white rounded-lg border-2 border-gray-200 hover:border-green-600 overflow-hidden group transition-all"
              >
                <div className="relative h-48 bg-gray-100">
                  {category.image_url ? (
                    <Image
                      src={category.image_url}
                      alt={category.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-100 to-green-50">
                      <span className="text-4xl font-bold text-green-600 opacity-20">
                        {category.name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg group-hover:text-green-600 transition-colors">
                    {category.name}
                  </h3>
                  {category.description && (
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{category.description}</p>
                  )}
                  {category.children && category.children.length > 0 && (
                    <p className="text-xs text-gray-500 mt-2">
                      {category.children.length} subcategories
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Featured Section */}
      <div className="bg-green-50 rounded-lg p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Not sure where to start?</h2>
        <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
          Book a free consultation with our skincare experts to get personalized product recommendations tailored to your skin type and concerns.
        </p>
        <Link
          href="/consultation"
          className="inline-block bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 font-semibold transition-colors"
        >
          Book Free Consultation
        </Link>
      </div>
    </div>
  );
}

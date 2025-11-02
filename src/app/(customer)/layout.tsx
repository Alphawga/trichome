'use client';

import React from 'react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/admin/footer';
import { trpc } from '@/utils/trpc';
import { useAuth } from '@/app/contexts/auth-context';

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated } = useAuth();

  // Fetch cart count - only if authenticated
  const cartQuery = trpc.getCart.useQuery(undefined, {
    enabled: isAuthenticated,
    refetchOnWindowFocus: false,
  });

  // Fetch wishlist count - only if authenticated
  const wishlistQuery = trpc.getWishlist.useQuery(undefined, {
    enabled: isAuthenticated,
    refetchOnWindowFocus: false,
  });

  const cartCount = cartQuery.data?.count || 0;
  const wishlistCount = wishlistQuery.data?.count || 0;

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#343A40] flex flex-col">
      <Header cartCount={cartCount} wishlistCount={wishlistCount} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
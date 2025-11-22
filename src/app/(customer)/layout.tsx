"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { AuthProvider, useAuth } from "@/app/contexts/auth-context";
import { Header } from "@/components/layout/header";
import { WhatsAppWidget } from "@/components/whatsapp/WhatsAppWidget";
import { CartSyncHandler } from "@/components/cart/CartSyncHandler";
import { trpc } from "@/utils/trpc";
import { Footer } from "@/components/admin/footer";
import { getLocalCartCount } from "@/utils/local-cart";


function CustomerLayoutContent({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [localCartCount, setLocalCartCount] = useState(0);

  // Fetch cart count - only if authenticated
  const cartQuery = trpc.getCart.useQuery(undefined, {
    enabled: isAuthenticated,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });

  // Fetch wishlist count - only if authenticated
  const wishlistQuery = trpc.getWishlist.useQuery(undefined, {
    enabled: isAuthenticated,
    refetchOnWindowFocus: false,
  });

  // Update local cart count for unauthenticated users
  useEffect(() => {
    if (!isAuthenticated) {
      setLocalCartCount(getLocalCartCount());
      
      const handleLocalCartUpdate = () => {
        setLocalCartCount(getLocalCartCount());
      };
      
      window.addEventListener("localCartUpdated", handleLocalCartUpdate);
      return () => window.removeEventListener("localCartUpdated", handleLocalCartUpdate);
    }
  }, [isAuthenticated]);

  const cartCount = isAuthenticated ? (cartQuery.data?.count || 0) : localCartCount;
  const wishlistCount = wishlistQuery.data?.count || 0;

  // Get WhatsApp number from environment variable or use default
  const whatsappNumber =
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "2341234567890";

  return (
    <div className="min-h-screen flex flex-col">
      {/* Cart Sync Handler - syncs local cart with DB after sign-in */}
      <CartSyncHandler />
      
      <Header cartCount={cartCount} wishlistCount={wishlistCount} />
      <main className="flex-1">{children}</main>
      {/* WhatsApp Widget */}
      <WhatsAppWidget
        phoneNumber={whatsappNumber}
        messages={[
          "Hello, I would like to inquire about your products.",
          "I need help with my order.",
          "I have a question about shipping.",
          "Can you help me choose a product?",
        ]}
      />
      <Footer />
    </div>
  );
}

export default function CustomerLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <CustomerLayoutContent>{children}</CustomerLayoutContent>
    </AuthProvider>
  );
}

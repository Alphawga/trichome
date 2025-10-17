'use client';

import React, { useState } from 'react';
import { Header } from '../components/layout/header';
import { Footer } from '../components/admin/footer';

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [cartCount] = useState(3);
  const [wishlistCount] = useState(5);

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#343A40] flex flex-col">
      <Header cartCount={cartCount} wishlistCount={wishlistCount} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
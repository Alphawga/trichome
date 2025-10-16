'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminSidebar } from '../components/admin/admin-sidebar';
import { AdminHeader } from '../components/admin/admin-header';

type AdminView = 'analytics' | 'products' | 'orders' | 'customers' | 'promotions' | 'permissions';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [activeView, setActiveView] = useState<AdminView>('analytics');

  const handleNavigate = (view: AdminView) => {
    setActiveView(view);
    router.push(`/admin/${view === 'analytics' ? '' : view}`);
  };

  const handleExitAdmin = () => {
    router.push('/');
  };

  return (
    <div className="flex bg-[#F8F9FA] min-h-screen">
      <AdminSidebar activeView={activeView} onNavigate={handleNavigate} />
      <div className="flex-1 flex flex-col">
        <AdminHeader onExitAdmin={handleExitAdmin} />
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
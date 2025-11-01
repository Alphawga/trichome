'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { AdminHeader } from '@/components/admin/admin-header';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  const handleExitAdmin = () => {
    router.push('/');
  };

  return (
    <div className="flex bg-[#F8F9FA] min-h-screen">
      <AdminSidebar currentPath={pathname} onNavigate={handleNavigate} />
      <div className="flex-1 flex flex-col">
        <AdminHeader onExitAdmin={handleExitAdmin} />
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
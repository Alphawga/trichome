'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { AdminHeader } from '@/components/admin/admin-header';
import { useAuth } from '@/app/contexts/auth-context';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading } = useAuth();

  
  useEffect(() => {
    if (!isLoading) {
      if (!user) {
      
        router.push('/');
      } else if (user.role !== 'ADMIN' && user.role !== 'STAFF') {
      
        router.push('/');
      }
    }
  }, [user, isLoading, router]);

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  const handleExitAdmin = () => {
    router.push('/');
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F8F9FA]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render admin panel if user is not authenticated or authorized
  if (!user || (user.role !== 'ADMIN' && user.role !== 'STAFF')) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F8F9FA]">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">You don't have permission to access this page.</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-[#38761d] text-white rounded-lg hover:bg-opacity-90 font-medium transition-colors"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

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
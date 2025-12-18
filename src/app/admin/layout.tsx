"use client";

import { notFound, usePathname, useRouter } from "next/navigation";
import type React from "react";
import { useEffect } from "react";
import { useAuth } from "@/app/contexts/auth-context";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

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

        router.replace("/");
      } else if (user.role !== "ADMIN" && user.role !== "STAFF") {

        router.replace("/");
      }
    }
  }, [user, isLoading, router]);

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  const handleExitAdmin = () => {
    router.push("/");
  };


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


  if (!user || (user.role !== "ADMIN" && user.role !== "STAFF")) {
    notFound();
  }

  return (
    <div className="bg-[#F8F9FA] min-h-screen">
      <AdminSidebar currentPath={pathname} onNavigate={handleNavigate} />
      <div className="ml-64 flex flex-col min-h-screen">
        <AdminHeader onExitAdmin={handleExitAdmin} />
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

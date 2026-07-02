"use client";

import { formatDistanceToNow } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type React from "react";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/app/contexts/auth-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { trpc } from "@/utils/trpc";
import { ChevronDownIcon } from "../ui/icons";

interface AdminHeaderProps {
  onExitAdmin?: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ onExitAdmin }) => {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();

  const unreadCountQuery = trpc.getUnreadNotificationCount.useQuery(undefined, {
    refetchInterval: 30000,
  });
  const notificationsQuery = trpc.getNotifications.useQuery(
    { limit: 10 },
    {
      enabled: notificationsOpen,
      refetchInterval: notificationsOpen ? 30000 : false,
    },
  );
  const utils = trpc.useUtils();
  const markAsReadMutation = trpc.markNotificationAsRead.useMutation({
    onSuccess: () => {
      utils.getUnreadNotificationCount.invalidate();
      utils.getNotifications.invalidate();
    },
  });
  const markAllAsReadMutation = trpc.markAllNotificationsAsRead.useMutation({
    onSuccess: () => {
      utils.getUnreadNotificationCount.invalidate();
      utils.getNotifications.invalidate();
    },
  });

  const unreadCount = unreadCountQuery.data ?? 0;
  const notifications = notificationsQuery.data ?? [];

  const handleExitAdmin = () => {
    if (onExitAdmin) {
      onExitAdmin();
    }
  };

  const handleLogout = async () => {
    try {
      router.push("/auth/signin");
      toast.success("Logged out successfully");
      await logout();
    } catch (error) {
      toast.error("Failed to logout");
      console.error("Logout error:", error);
    }
  };

  // Get user's initials for avatar
  const getUserInitials = () => {
    if (!user) return "A";
    const firstInitial = user.first_name
      ? Array.from(user.first_name)[0]?.toUpperCase()
      : "";
    const lastInitial = user.last_name
      ? Array.from(user.last_name)[0]?.toUpperCase()
      : "";
    return (
      firstInitial + lastInitial ||
      (user.email ? Array.from(user.email)[0]?.toUpperCase() : "")
    );
  };

  // Get user's display name
  const getUserDisplayName = () => {
    if (!user) return "Admin User";
    if (user.first_name || user.last_name) {
      return `${user.first_name || ""} ${user.last_name || ""}`.trim();
    }
    return user.email;
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-20 h-20 flex items-center px-6 lg:px-8 flex-shrink-0">
      <div className="flex items-center">
        <Link href="/" className="flex items-center h-full">
          <Image
            src="/T3.png"
            alt="Trichomes Logo"
            width={120}
            height={100}
            className="object-contain"
          />
        </Link>{" "}
        <span className="ml-3 text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
          Admin
        </span>
      </div>

      <div className="ml-auto flex items-center space-x-4">
        {/* Notifications */}
        <DropdownMenu
          open={notificationsOpen}
          onOpenChange={setNotificationsOpen}
        >
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="p-2 text-gray-400 hover:text-gray-600 relative"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <title>Notifications</title>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 p-0">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-900">Notifications</p>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={() => markAllAsReadMutation.mutate()}
                  disabled={markAllAsReadMutation.isPending}
                  className="text-xs text-primary hover:underline disabled:opacity-50"
                >
                  Mark all as read
                </button>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto">
              {notificationsQuery.isLoading ? (
                <div className="px-4 py-6 text-center text-sm text-gray-500">
                  Loading...
                </div>
              ) : notifications.length === 0 ? (
                <div className="px-4 py-6 text-center text-sm text-gray-500">
                  No notifications yet
                </div>
              ) : (
                notifications.map((notification) => (
                  <DropdownMenuItem key={notification.id} asChild>
                    <Link
                      href={
                        notification.order
                          ? `/admin/orders/${notification.order.id}`
                          : "#"
                      }
                      onClick={() => {
                        if (!notification.read) {
                          markAsReadMutation.mutate({ id: notification.id });
                        }
                      }}
                      className={`block px-4 py-3 text-sm border-b border-gray-50 rounded-none ${
                        notification.read ? "bg-white" : "bg-green-50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 w-full">
                        <p className="font-medium text-gray-900">
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <span className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-gray-600 mt-0.5 whitespace-normal">
                        {notification.message}
                      </p>
                      <p className="text-gray-400 text-xs mt-1">
                        {formatDistanceToNow(
                          new Date(notification.created_at),
                          {
                            addSuffix: true,
                          },
                        )}
                      </p>
                    </Link>
                  </DropdownMenuItem>
                ))
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {getUserInitials()}
                </span>
              </div>
              <span className="font-medium hidden sm:block">
                {getUserDisplayName()}
              </span>
              <ChevronDownIcon />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 p-0">
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-900">
                {getUserDisplayName()}
              </p>
              <p className="text-sm text-gray-500">
                {user?.email || "admin@trichomes.com"}
              </p>
              {user?.role && (
                <p className="text-xs text-gray-400 mt-1 capitalize">
                  {user.role.toLowerCase()}
                </p>
              )}
            </div>

            <DropdownMenuItem asChild>
              <Link
                href="/admin/profile"
                className="flex items-center px-4 py-2 text-sm text-gray-700 rounded-none"
              >
                <svg
                  className="w-4 h-4 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <title>Profile</title>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                Profile Settings
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={handleExitAdmin}
              className="px-4 py-2 text-sm text-gray-700"
            >
              <svg
                className="w-4 h-4 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <title>Back to store</title>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              Back to Store
            </DropdownMenuItem>

            <div className="border-t border-gray-100 mt-1">
              <DropdownMenuItem
                onClick={handleLogout}
                className="px-4 py-2 text-sm text-red-600 focus:text-red-600 focus:bg-red-50"
              >
                <svg
                  className="w-4 h-4 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <title>Logout</title>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                Logout
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

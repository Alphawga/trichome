"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { trpc } from "@/utils/trpc";
import { ShieldIcon } from "@/components/ui/icons";

interface PermissionAssignmentSheetProps {
  userId: string | undefined;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function PermissionAssignmentSheet({
  userId,
  open,
  onOpenChange,
  onSuccess,
}: PermissionAssignmentSheetProps) {
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(
    new Set(),
  );

  const permissionsQuery = trpc.getAvailablePermissions.useQuery(undefined, {
    enabled: open,
    staleTime: 300000, // Cache for 5 minutes
  });

  const userPermissionsQuery = trpc.getUserPermissions.useQuery(
    { userId: userId! },
    {
      enabled: !!userId && open,
      onSuccess: (data) => {
        setSelectedPermissions(new Set(data.map((p) => p.permission)));
      },
    },
  );

  const grantMutation = trpc.grantPermission.useMutation({
    onSuccess: () => {
      userPermissionsQuery.refetch();
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(`Failed to grant permission: ${error.message}`);
    },
  });

  const revokeMutation = trpc.revokePermission.useMutation({
    onSuccess: () => {
      userPermissionsQuery.refetch();
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(`Failed to revoke permission: ${error.message}`);
    },
  });

  const grantMultipleMutation = trpc.grantPermissions.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      userPermissionsQuery.refetch();
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(`Failed to grant permissions: ${error.message}`);
    },
  });

  const availablePermissions = permissionsQuery.data || [];
  const userPermissions = userPermissionsQuery.data || [];

  const handleTogglePermission = async (permission: string) => {
    if (!userId) return;

    const isGranted = selectedPermissions.has(permission);

    if (isGranted) {
      await revokeMutation.mutateAsync({
        userId,
        permission,
      });
      setSelectedPermissions((prev) => {
        const next = new Set(prev);
        next.delete(permission);
        return next;
      });
      toast.success("Permission revoked");
    } else {
      try {
        await grantMutation.mutateAsync({
          userId,
          permission,
        });
        setSelectedPermissions((prev) => {
          const next = new Set(prev);
          next.add(permission);
          return next;
        });
        toast.success("Permission granted");
      } catch (error) {
        // Error already handled in mutation
      }
    }
  };

  const handleSelectAll = () => {
    if (!userId) return;

    const allSelected = availablePermissions.every((p) =>
      selectedPermissions.has(p),
    );

    if (allSelected) {
      // Revoke all
      const permissionsToRevoke = Array.from(selectedPermissions);
      permissionsToRevoke.forEach((permission) => {
        revokeMutation.mutate({
          userId,
          permission,
        });
      });
      setSelectedPermissions(new Set());
      toast.success("All permissions revoked");
    } else {
      // Grant all missing
      const missingPermissions = availablePermissions.filter(
        (p) => !selectedPermissions.has(p),
      );
      grantMultipleMutation.mutate({
        userId,
        permissions: missingPermissions,
      });
      setSelectedPermissions(new Set(availablePermissions));
    }
  };

  // Group permissions by category
  const groupedPermissions: Record<string, string[]> = {};
  availablePermissions.forEach((permission) => {
    const category = permission.split(".")[0] || "other";
    if (!groupedPermissions[category]) {
      groupedPermissions[category] = [];
    }
    groupedPermissions[category].push(permission);
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl px-4 md:px-6 overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Manage Permissions</SheetTitle>
        </SheetHeader>

        {userPermissionsQuery.isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-[#38761d] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="mt-6 space-y-6">
            {/* Summary */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Permissions</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {selectedPermissions.size} / {availablePermissions.length}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleSelectAll}
                  disabled={
                    grantMutation.isPending ||
                    revokeMutation.isPending ||
                    grantMultipleMutation.isPending
                  }
                  className="px-4 py-2 text-sm border border-gray-300 rounded-lg bg-white hover:bg-gray-50 font-medium transition-colors disabled:opacity-50"
                >
                  {availablePermissions.every((p) =>
                    selectedPermissions.has(p),
                  )
                    ? "Deselect All"
                    : "Select All"}
                </button>
              </div>
            </div>

            {/* Permissions by Category */}
            <div className="space-y-4">
              {Object.entries(groupedPermissions).map(([category, permissions]) => (
                <div
                  key={category}
                  className="bg-white p-4 rounded-lg border border-gray-200"
                >
                  <h3 className="font-semibold text-gray-900 mb-3 capitalize">
                    {category} ({permissions.length})
                  </h3>
                  <div className="space-y-2">
                    {permissions.map((permission) => {
                      const isGranted = selectedPermissions.has(permission);
                      return (
                        <label
                          key={permission}
                          className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-gray-300 cursor-pointer transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={isGranted}
                            onChange={() => handleTogglePermission(permission)}
                            disabled={
                              grantMutation.isPending ||
                              revokeMutation.isPending ||
                              grantMultipleMutation.isPending
                            }
                            className="w-4 h-4 text-trichomes-primary border-gray-300 rounded focus:ring-trichomes-primary/20 focus:ring-2 accent-trichomes-primary"
                          />
                          <ShieldIcon className="w-4 h-4 text-gray-400" />
                          <span className="flex-1 text-sm text-gray-700">
                            {permission}
                          </span>
                          {isGranted && (
                            <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded-full">
                              Granted
                            </span>
                          )}
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Current Permissions List */}
            {userPermissions.length > 0 && (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3">
                  Currently Granted Permissions
                </h3>
                <div className="flex flex-wrap gap-2">
                  {userPermissions.map((permission) => (
                    <span
                      key={permission.id}
                      className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-lg text-gray-700"
                    >
                      {permission.permission}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}


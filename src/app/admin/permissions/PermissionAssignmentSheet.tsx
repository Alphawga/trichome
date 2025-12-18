"use client";

import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { Shield as ShieldIcon, Lock as LockIcon, Check as CheckIcon } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { LogoLoader } from "@/components/ui/logo-loader";
import { trpc } from "@/utils/trpc";
import {
  ROLE_PERMISSIONS,
  PERMISSION_DEFINITIONS,
  getGrantablePermissions,
  getRoleConfig,
  type Permission,
} from "@/lib/permissions";
import type { UserRole } from "@prisma/client";

interface PermissionAssignmentSheetProps {
  userId: string | undefined;
  userRole: UserRole | undefined;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function PermissionAssignmentSheet({
  userId,
  userRole,
  open,
  onOpenChange,
  onSuccess,
}: PermissionAssignmentSheetProps) {
  const [selectedCustomPermissions, setSelectedCustomPermissions] = useState<Set<string>>(
    new Set(),
  );

  // Fetch user's custom permissions from database
  const userPermissionsQuery = trpc.getUserPermissions.useQuery(
    { userId: userId! },
    { enabled: !!userId && open }
  );

  // Get role config for display
  const roleConfig = userRole ? getRoleConfig(userRole) : undefined;

  // Inherited permissions (from role)
  const inheritedPermissions = useMemo(() => {
    if (!userRole) return [];
    return ROLE_PERMISSIONS[userRole] || [];
  }, [userRole]);

  // Grantable permissions (not in role)
  const grantablePermissions = useMemo(() => {
    if (!userRole) return [];
    return getGrantablePermissions(userRole);
  }, [userRole]);

  // Update selected permissions when user permissions are loaded
  useEffect(() => {
    if (userPermissionsQuery.data) {
      setSelectedCustomPermissions(
        new Set(userPermissionsQuery.data.map((p: { permission: string }) => p.permission))
      );
    }
  }, [userPermissionsQuery.data]);

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

  const handleTogglePermission = async (permission: string) => {
    if (!userId) return;

    const isGranted = selectedCustomPermissions.has(permission);

    if (isGranted) {
      await revokeMutation.mutateAsync({ userId, permission });
      setSelectedCustomPermissions((prev) => {
        const next = new Set(prev);
        next.delete(permission);
        return next;
      });
      toast.success("Permission revoked");
    } else {
      try {
        await grantMutation.mutateAsync({ userId, permission });
        setSelectedCustomPermissions((prev) => {
          const next = new Set(prev);
          next.add(permission);
          return next;
        });
        toast.success("Permission granted");
      } catch {
        // Error handled in mutation
      }
    }
  };

  // Group permissions by module
  const groupPermissions = (permissions: string[]) => {
    const grouped: Record<string, string[]> = {};
    permissions.forEach((permission) => {
      const category = permission.split(".")[0] || "other";
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(permission);
    });
    return grouped;
  };

  const inheritedGrouped = groupPermissions(inheritedPermissions);
  const grantableGrouped = groupPermissions(grantablePermissions);

  const getPermissionLabel = (permissionId: string) => {
    const def = PERMISSION_DEFINITIONS.find((p) => p.id === permissionId);
    return def?.name || permissionId;
  };

  // Calculate totals
  const totalInherited = inheritedPermissions.length;
  const totalCustom = selectedCustomPermissions.size;
  const totalEffective = totalInherited + totalCustom;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl px-4 md:px-6 overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Manage Permissions</SheetTitle>
        </SheetHeader>

        {userPermissionsQuery.isLoading ? (
          <div className="flex items-center justify-center py-12">
            <LogoLoader size="md" text="Loading permissions..." />
          </div>
        ) : (
          <div className="mt-6 space-y-6">
            {/* Role Summary */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${roleConfig?.color}20` }}
                >
                  <ShieldIcon className="w-5 h-5" style={{ color: roleConfig?.color }} />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    Role: {roleConfig?.name || userRole}
                  </p>
                  <p className="text-sm text-gray-500">{roleConfig?.description}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-4 text-center">
                <div className="bg-white p-2 rounded border">
                  <p className="text-lg font-bold text-blue-600">{totalInherited}</p>
                  <p className="text-xs text-gray-500">From Role</p>
                </div>
                <div className="bg-white p-2 rounded border">
                  <p className="text-lg font-bold text-green-600">{totalCustom}</p>
                  <p className="text-xs text-gray-500">Custom</p>
                </div>
                <div className="bg-white p-2 rounded border">
                  <p className="text-lg font-bold text-gray-900">{totalEffective}</p>
                  <p className="text-xs text-gray-500">Total</p>
                </div>
              </div>
            </div>

            {/* Inherited Permissions (Read-only) */}
            {totalInherited > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <LockIcon className="w-4 h-4 text-gray-400" />
                  Inherited from {roleConfig?.name || userRole} Role ({totalInherited})
                </h3>
                <div className="space-y-3">
                  {Object.entries(inheritedGrouped).map(([category, permissions]) => (
                    <div
                      key={category}
                      className="bg-blue-50 p-4 rounded-lg border border-blue-100"
                    >
                      <h4 className="text-sm font-medium text-blue-800 mb-2 capitalize">
                        {category}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {permissions.map((permission) => (
                          <span
                            key={permission}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                          >
                            <CheckIcon className="w-3 h-3" />
                            {getPermissionLabel(permission)}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Custom Permissions (Grantable) */}
            {grantablePermissions.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <ShieldIcon className="w-4 h-4 text-green-600" />
                  Additional Permissions ({selectedCustomPermissions.size} / {grantablePermissions.length})
                </h3>
                <p className="text-sm text-gray-500 mb-3">
                  Grant extra permissions beyond the role defaults
                </p>
                <div className="space-y-3">
                  {Object.entries(grantableGrouped).map(([category, permissions]) => (
                    <div
                      key={category}
                      className="bg-white p-4 rounded-lg border border-gray-200"
                    >
                      <h4 className="text-sm font-medium text-gray-700 mb-2 capitalize">
                        {category}
                      </h4>
                      <div className="space-y-2">
                        {permissions.map((permission) => {
                          const isGranted = selectedCustomPermissions.has(permission);
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
                                  grantMutation.isPending || revokeMutation.isPending
                                }
                                className="w-4 h-4 text-trichomes-primary border-gray-300 rounded focus:ring-trichomes-primary/20 focus:ring-2 accent-trichomes-primary"
                              />
                              <span className="flex-1 text-sm text-gray-700">
                                {getPermissionLabel(permission)}
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
              </div>
            )}

            {/* No grantable permissions for Admin */}
            {grantablePermissions.length === 0 && userRole === "ADMIN" && (
              <div className="text-center py-8 text-gray-500">
                <ShieldIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Administrators have all permissions by default.</p>
                <p className="text-sm">No additional permissions can be granted.</p>
              </div>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

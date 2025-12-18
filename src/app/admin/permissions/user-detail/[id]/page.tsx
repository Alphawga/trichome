"use client";

import type { UserRole, UserStatus } from "@prisma/client";
import { ArrowLeft, Mail, Phone, Calendar, Clock, Shield, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/app/contexts/auth-context";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EditIcon, TrashIcon } from "@/components/ui/icons";
import { trpc } from "@/utils/trpc";
import { UserFormSheet } from "../../UserFormSheet";
import { PermissionAssignmentSheet } from "../../PermissionAssignmentSheet";

// Role configurations
const ROLE_CONFIGS: Record<UserRole, { name: string; color: string; description: string }> = {
    ADMIN: {
        name: "Administrator",
        description: "Full system access and control",
        color: "#ef4444",
    },
    STAFF: {
        name: "Staff",
        description: "Manage products, orders, and customers",
        color: "#3b82f6",
    },
    CUSTOMER: {
        name: "Customer",
        description: "Standard customer access",
        color: "#10b981",
    },
};

const STATUS_CONFIGS: Record<UserStatus, { label: string; color: string }> = {
    ACTIVE: { label: "Active", color: "bg-green-100 text-green-800" },
    INACTIVE: { label: "Inactive", color: "bg-gray-100 text-gray-800" },
    SUSPENDED: { label: "Suspended", color: "bg-red-100 text-red-800" },
    PENDING_VERIFICATION: { label: "Pending Verification", color: "bg-yellow-100 text-yellow-800" },
};

export default function UserDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { hasPermission } = useAuth();
    const userId = params.id as string;

    // Permission checks
    const canEditUsers = hasPermission("users.update");
    const canDeleteUsers = hasPermission("users.delete");
    const canManageUserPermissions = hasPermission("users.manage_permissions");

    const [editSheetOpen, setEditSheetOpen] = useState(false);
    const [permissionSheetOpen, setPermissionSheetOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    // Fetch user data
    const userQuery = trpc.getUserById.useQuery(
        { id: userId },
        { enabled: !!userId }
    );

    // Fetch user permissions
    const permissionsQuery = trpc.getUserPermissions.useQuery(
        { userId },
        { enabled: !!userId }
    );

    const deleteUserMutation = trpc.deleteUser.useMutation({
        onSuccess: () => {
            toast.success("User deleted successfully");
            router.push("/admin/permissions");
        },
        onError: (error) => {
            toast.error(`Failed to delete user: ${error.message}`);
        },
    });

    if (userQuery.isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="w-10 h-10 border-2 border-[#38761d] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-500">Loading user details...</p>
                </div>
            </div>
        );
    }

    if (userQuery.error || !userQuery.data) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <p className="text-red-500 mb-4">Failed to load user details</p>
                    <Link
                        href="/admin/permissions"
                        className="text-[#38761d] hover:underline"
                    >
                        ← Back to Users
                    </Link>
                </div>
            </div>
        );
    }

    const user = userQuery.data;
    const roleConfig = ROLE_CONFIGS[user.role];
    const statusConfig = STATUS_CONFIGS[user.status];
    const userPermissions = permissionsQuery.data || [];

    const formatDate = (date: Date | string | null) => {
        if (!date) return "N/A";
        return new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const formatDateTime = (date: Date | string | null) => {
        if (!date) return "Never";
        return new Date(date).toLocaleString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/permissions"
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">User Details</h1>
                        <p className="text-gray-500">View and manage user information</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    {canEditUsers && (
                        <button
                            type="button"
                            onClick={() => setEditSheetOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 font-medium transition-colors"
                        >
                            <EditIcon className="w-4 h-4" />
                            Edit User
                        </button>
                    )}
                    {canDeleteUsers && (
                        <button
                            type="button"
                            onClick={() => setDeleteDialogOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg bg-white hover:bg-red-50 font-medium transition-colors"
                        >
                            <TrashIcon className="w-4 h-4" />
                            Delete
                        </button>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Card */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-lg border p-6">
                        <div className="text-center mb-6">
                            <div className="relative w-24 h-24 mx-auto mb-4">
                                {user.image ? (
                                    <Image
                                        src={user.image}
                                        alt={user.name || user.email}
                                        fill
                                        className="rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
                                        <User className="w-12 h-12 text-gray-400" />
                                    </div>
                                )}
                            </div>
                            <h2 className="text-xl font-semibold text-gray-900">
                                {user.first_name || user.last_name
                                    ? `${user.first_name || ""} ${user.last_name || ""}`.trim()
                                    : "No Name"}
                            </h2>
                            <p className="text-gray-500">{user.email}</p>
                            <div className="flex justify-center gap-2 mt-3">
                                <span
                                    className="px-3 py-1 text-xs font-semibold rounded-full"
                                    style={{
                                        backgroundColor: roleConfig ? `${roleConfig.color}20` : "#e5e7eb",
                                        color: roleConfig?.color || "#6b7280",
                                    }}
                                >
                                    {roleConfig?.name || user.role}
                                </span>
                                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusConfig.color}`}>
                                    {statusConfig.label}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t">
                            <div className="flex items-center gap-3">
                                <Mail className="w-4 h-4 text-gray-400" />
                                <div>
                                    <p className="text-xs text-gray-500">Email</p>
                                    <p className="text-sm text-gray-900">{user.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Phone className="w-4 h-4 text-gray-400" />
                                <div>
                                    <p className="text-xs text-gray-500">Phone</p>
                                    <p className="text-sm text-gray-900">{user.phone || "Not provided"}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                <div>
                                    <p className="text-xs text-gray-500">Joined</p>
                                    <p className="text-sm text-gray-900">{formatDate(user.created_at)}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Clock className="w-4 h-4 text-gray-400" />
                                <div>
                                    <p className="text-xs text-gray-500">Last Login</p>
                                    <p className="text-sm text-gray-900">{formatDateTime(user.last_login_at)}</p>
                                </div>
                            </div>
                        </div>

                        {canManageUserPermissions && (
                            <button
                                type="button"
                                onClick={() => setPermissionSheetOpen(true)}
                                className="w-full mt-6 flex items-center justify-center gap-2 px-4 py-2 bg-[#38761d] text-white rounded-lg hover:bg-opacity-90 font-medium transition-colors"
                            >
                                <Shield className="w-4 h-4" />
                                Manage Permissions
                            </button>
                        )}
                    </div>
                </div>

                {/* Details Cards */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Account Information */}
                    <div className="bg-white rounded-lg border p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-500">User ID</p>
                                <p className="text-sm font-mono text-gray-900 break-all">{user.id}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Email Verified</p>
                                <p className="text-sm text-gray-900">
                                    {user.email_verified_at ? formatDate(user.email_verified_at) : "Not verified"}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Phone Verified</p>
                                <p className="text-sm text-gray-900">
                                    {user.phone_verified_at ? formatDate(user.phone_verified_at) : "Not verified"}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Account Status</p>
                                <p className="text-sm text-gray-900">{statusConfig.label}</p>
                            </div>
                        </div>
                    </div>

                    {/* Role & Permissions */}
                    <div className="bg-white rounded-lg border p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Role & Permissions</h3>
                        <div className="mb-4">
                            <div className="flex items-center gap-3 mb-2">
                                <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: roleConfig?.color || "#6b7280" }}
                                />
                                <span className="font-medium text-gray-900">{roleConfig?.name || user.role}</span>
                            </div>
                            <p className="text-sm text-gray-500">{roleConfig?.description || "User role"}</p>
                        </div>

                        {permissionsQuery.isLoading ? (
                            <div className="text-sm text-gray-500">Loading permissions...</div>
                        ) : userPermissions.length > 0 ? (
                            <div>
                                <p className="text-sm text-gray-500 mb-2">
                                    {userPermissions.length} custom permission{userPermissions.length !== 1 ? "s" : ""} assigned
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {userPermissions.slice(0, 6).map((p: { id: string; permission: string }) => (
                                        <span
                                            key={p.id}
                                            className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                                        >
                                            {p.permission}
                                        </span>
                                    ))}
                                    {userPermissions.length > 6 && (
                                        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-500 rounded">
                                            +{userPermissions.length - 6} more
                                        </span>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500">No custom permissions assigned. Using default role permissions.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Edit User Sheet */}
            <UserFormSheet
                userId={userId}
                open={editSheetOpen}
                onOpenChange={setEditSheetOpen}
                onSuccess={() => userQuery.refetch()}
            />

            {/* Permission Sheet */}
            <PermissionAssignmentSheet
                userId={userId}
                userRole={user.role}
                open={permissionSheetOpen}
                onOpenChange={setPermissionSheetOpen}
                onSuccess={() => userQuery.refetch()}
            />

            {/* Delete Confirmation */}
            <ConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                title="Delete User"
                description={`Are you sure you want to delete ${user.email}? This action cannot be undone.`}
                confirmLabel="Delete"
                cancelLabel="Cancel"
                onConfirm={() => deleteUserMutation.mutate({ id: userId })}
                isLoading={deleteUserMutation.isPending}
                variant="danger"
            />
        </div>
    );
}

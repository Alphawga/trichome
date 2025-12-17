"use client";

import type { User, UserRole, UserStatus } from "@prisma/client";
import { MoreVertical } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type React from "react";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/app/contexts/auth-context";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  EditIcon,
  EyeIcon,
  PlusIcon,
  SearchIcon,
  ShieldIcon,
  TrashIcon,
  UserIcon,
} from "@/components/ui/icons";
import {
  ROLE_CONFIGS,
  PERMISSION_DEFINITIONS,
  getRoleConfig,
  type RoleConfig,
} from "@/lib/permissions";
import { trpc } from "@/utils/trpc";
import { UserFormSheet } from "./UserFormSheet";
import { PermissionAssignmentSheet } from "./PermissionAssignmentSheet";

// Type for user with permissions from backend
type AdminUser = Pick<
  User,
  | "id"
  | "email"
  | "first_name"
  | "last_name"
  | "phone"
  | "role"
  | "status"
  | "image"
  | "last_login_at"
  | "created_at"
>;


interface UserRowProps {
  user: AdminUser;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onManagePermissions: (id: string, role: UserRole) => void;
  // Permission flags for conditional rendering
  canEdit: boolean;
  canDelete: boolean;
  canManagePermissions: boolean;
}

interface RoleCardProps {
  role: RoleConfig;
  userCount: number;
  onEdit: (roleId: UserRole) => void;
  onViewUsers: (roleId: UserRole) => void;
}

const UserRow: React.FC<UserRowProps> = ({
  user,
  onView,
  onEdit,
  onDelete,
  onManagePermissions,
  canEdit,
  canDelete,
  canManagePermissions,
}) => {
  const roleConfig = ROLE_CONFIGS.find((r) => r.id === user.role);
  const statusColors: Record<UserStatus, string> = {
    ACTIVE: "bg-green-100 text-green-800",
    INACTIVE: "bg-gray-100 text-gray-800",
    SUSPENDED: "bg-red-100 text-red-800",
    PENDING_VERIFICATION: "bg-yellow-100 text-yellow-800",
  };

  return (
    <tr className="border-b last:border-0 hover:bg-gray-50 cursor-pointer" onClick={() => onView(user.id)}>
      <td className="p-4 flex items-center">
        <div className="relative w-10 h-10 mr-4 flex-shrink-0">
          {user.image ? (
            <Image
              src={user.image}
              alt={
                `${user.first_name || ""} ${user.last_name || ""}`.trim() ||
                user.email
              }
              fill
              className="rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
              <UserIcon className="w-5 h-5 text-gray-500" />
            </div>
          )}
        </div>
        <div>
          <span className="font-medium text-gray-900">
            {user.first_name || user.last_name
              ? `${user.first_name || ""} ${user.last_name || ""}`.trim()
              : "No Name"}
          </span>
          <p className="text-sm text-gray-500">{user.email}</p>
        </div>
      </td>
      <td className="p-4">
        <span
          className="px-2 py-1 text-xs font-semibold rounded-full"
          style={{
            backgroundColor: roleConfig ? `${roleConfig.color}20` : "#e5e7eb",
            color: roleConfig?.color || "#6b7280",
          }}
        >
          {roleConfig?.name || user.role}
        </span>
      </td>
      <td className="p-4">
        <span
          className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[user.status]}`}
        >
          {user.status.replace("_", " ")}
        </span>
      </td>
      <td className="p-4 text-gray-600">
        {user.last_login_at
          ? new Date(user.last_login_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })
          : "Never"}
      </td>
      <td className="p-4 text-gray-600">
        {new Date(user.created_at).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })}
      </td>
      <td className="p-4" onClick={(e) => e.stopPropagation()}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <MoreVertical className="w-4 h-4 text-gray-500" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => onView(user.id)}>
              <EyeIcon className="w-4 h-4 mr-2" />
              View Details
            </DropdownMenuItem>
            {canEdit && (
              <DropdownMenuItem onClick={() => onEdit(user.id)}>
                <EditIcon className="w-4 h-4 mr-2" />
                Edit User
              </DropdownMenuItem>
            )}
            {canManagePermissions && (
              <DropdownMenuItem onClick={() => onManagePermissions(user.id, user.role)}>
                <ShieldIcon className="w-4 h-4 mr-2" />
                Manage Permissions
              </DropdownMenuItem>
            )}
            {canDelete && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDelete(user.id)}
                  className="text-red-600 focus:text-red-600 focus:bg-red-50"
                >
                  <TrashIcon className="w-4 h-4 mr-2" />
                  Delete User
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  );
};

const RoleCard: React.FC<RoleCardProps> = ({
  role,
  userCount,
  onEdit,
  onViewUsers,
}) => {
  const rolePermissions = PERMISSION_DEFINITIONS.filter((p) =>
    role.permissions.includes(p.id),
  );

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <div
            className="w-3 h-3 rounded-full mr-3"
            style={{ backgroundColor: role.color }}
          ></div>
          <div>
            <h3 className="font-semibold text-gray-900">{role.name}</h3>
            <p className="text-sm text-gray-500">{role.description}</p>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <button
            type="button"
            onClick={() => onEdit(role.id)}
            className="p-1 text-gray-400 hover:text-green-600 transition-colors"
            title="Edit role"
          >
            <EditIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-sm font-medium text-gray-700 mb-2">
          Permissions ({rolePermissions.length})
        </p>
        <div className="space-y-1 max-h-32 overflow-y-auto">
          {rolePermissions.slice(0, 5).map((permission) => (
            <div key={permission.id} className="flex items-center text-xs">
              <ShieldIcon className="w-3 h-3 text-gray-400 mr-2" />
              <span className="text-gray-600">{permission.name}</span>
            </div>
          ))}
          {rolePermissions.length > 5 && (
            <p className="text-xs text-gray-500">
              +{rolePermissions.length - 5} more permissions
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center text-sm text-gray-600">
          <UserIcon className="w-4 h-4 mr-1" />
          <span>{userCount} users</span>
        </div>
        <button
          type="button"
          onClick={() => onViewUsers(role.id)}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          View Users
        </button>
      </div>
    </div>
  );
};

export default function AdminPermissionsPage() {
  const { hasPermission } = useAuth();
  const [activeTab, setActiveTab] = useState<"roles" | "users" | "permissions">(
    "roles",
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "All">("All");
  const [statusFilter, setStatusFilter] = useState<UserStatus | "All">("All");

  // Role-based permission checks
  const canCreateUsers = hasPermission("users.create");
  const canEditUsers = hasPermission("users.update");
  const canDeleteUsers = hasPermission("users.delete");
  const canManageUserPermissions = hasPermission("users.manage_permissions");

  // Fetch users from database
  const usersQuery = trpc.getUsers.useQuery(
    {
      page: 1,
      limit: 100,
      role: roleFilter !== "All" ? roleFilter : undefined,
      status: statusFilter !== "All" ? statusFilter : undefined,
      search: searchTerm || undefined,
    },
    {
      refetchOnWindowFocus: false,
    },
  );

  const users = usersQuery.data?.users || [];

  // Count users by role
  const userCountByRole: Record<UserRole, number> = {
    ADMIN: users.filter((u) => u.role === "ADMIN").length,
    STAFF: users.filter((u) => u.role === "STAFF").length,
    CUSTOMER: users.filter((u) => u.role === "CUSTOMER").length,
  };

  const handleAddRole = () => {
    toast.info("Role creation feature coming soon");
  };

  const [userFormOpen, setUserFormOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | undefined>();
  const [permissionSheetOpen, setPermissionSheetOpen] = useState(false);
  const [permissionUserId, setPermissionUserId] = useState<string | undefined>();
  const [permissionUserRole, setPermissionUserRole] = useState<UserRole | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const router = useRouter();

  const handleAddUser = () => {
    setEditingUserId(undefined);
    setUserFormOpen(true);
  };

  const handleEditRole = (roleId: UserRole) => {
    toast.info(`Edit role: ${roleId} - Feature coming soon`);
  };

  const handleViewRoleUsers = (roleId: UserRole) => {
    setActiveTab("users");
    setRoleFilter(roleId);
  };

  const handleViewUser = (id: string) => {
    router.push(`/admin/permissions/user-detail/${id}`);
  };

  const handleEditUser = (id: string) => {
    setEditingUserId(id);
    setUserFormOpen(true);
  };

  const deleteUserMutation = trpc.deleteUser.useMutation({
    onSuccess: () => {
      toast.success("User deleted successfully");
      usersQuery.refetch();
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    },
    onError: (error) => {
      toast.error(`Failed to delete user: ${error.message}`);
    },
  });

  const handleDeleteUser = (id: string) => {
    setUserToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (userToDelete) {
      deleteUserMutation.mutate({ id: userToDelete });
    }
  };

  const handleManagePermissions = (id: string, role: UserRole) => {
    setPermissionUserId(id);
    setPermissionUserRole(role);
    setPermissionSheetOpen(true);
  };

  const roles: Array<UserRole | "All"> = ["All", "ADMIN", "STAFF", "CUSTOMER"];
  const statuses: Array<UserStatus | "All"> = [
    "All",
    "ACTIVE",
    "INACTIVE",
    "SUSPENDED",
    "PENDING_VERIFICATION",
  ];

  const roleLabels: Record<UserRole | "All", string> = {
    All: "All Roles",
    ADMIN: "Administrator",
    STAFF: "Staff",
    CUSTOMER: "Customer",
  };

  const statusLabels: Record<UserStatus | "All", string> = {
    All: "All Status",
    ACTIVE: "Active",
    INACTIVE: "Inactive",
    SUSPENDED: "Suspended",
    PENDING_VERIFICATION: "Pending Verification",
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            User Permissions & Roles
          </h1>
          <p className="text-gray-600">Manage user access and permissions</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleAddRole}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 font-medium transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            Add Role
          </button>
          {canCreateUsers && (
            <button
              type="button"
              onClick={handleAddUser}
              className="flex items-center gap-2 px-4 py-2 bg-[#38761d] text-white rounded-lg hover:bg-opacity-90 font-medium transition-colors"
            >
              <PlusIcon className="w-4 h-4" />
              Add User
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {(
            [
              {
                key: "roles",
                label: "Roles & Permissions",
                count: ROLE_CONFIGS.length,
              },
              { key: "users", label: "Users", count: users.length },
              {
                key: "permissions",
                label: "All Permissions",
                count: PERMISSION_DEFINITIONS.length,
              },
            ] as const
          ).map((tab) => (
            <button
              type="button"
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === tab.key
                ? "border-green-500 text-green-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "roles" && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ROLE_CONFIGS.map((role) => (
              <RoleCard
                key={role.id}
                role={role}
                userCount={userCountByRole[role.id]}
                onEdit={handleEditRole}
                onViewUsers={handleViewRoleUsers}
              />
            ))}
          </div>
        </div>
      )}

      {activeTab === "users" && (
        <div>
          {/* User Filters */}
          <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 outline-none"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <SearchIcon />
                </div>
              </div>

              <select
                value={roleFilter}
                onChange={(e) =>
                  setRoleFilter(e.target.value as UserRole | "All")
                }
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 outline-none"
              >
                {roles.map((role) => (
                  <option key={role} value={role}>
                    {roleLabels[role]}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as UserStatus | "All")
                }
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 outline-none"
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {statusLabels[status]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-lg border overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-4 font-semibold text-sm text-gray-700">
                    User
                  </th>
                  <th className="p-4 font-semibold text-sm text-gray-700">
                    Role
                  </th>
                  <th className="p-4 font-semibold text-sm text-gray-700">
                    Status
                  </th>
                  <th className="p-4 font-semibold text-sm text-gray-700">
                    Last Login
                  </th>
                  <th className="p-4 font-semibold text-sm text-gray-700">
                    Join Date
                  </th>
                  <th className="p-4 font-semibold text-sm text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {usersQuery.isLoading ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-500">
                      Loading users...
                    </td>
                  </tr>
                ) : users.length > 0 ? (
                  users.map((user) => (
                    <UserRow
                      key={user.id}
                      user={user}
                      onView={handleViewUser}
                      onEdit={handleEditUser}
                      onDelete={handleDeleteUser}
                      onManagePermissions={handleManagePermissions}
                      canEdit={canEditUsers}
                      canDelete={canDeleteUsers}
                      canManagePermissions={canManageUserPermissions}
                    />
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-500">
                      No users found matching your filters
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "permissions" && (
        <div>
          <div className="bg-white rounded-lg border">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">System Permissions</h3>
              <div className="space-y-6">
                {[
                  "Users",
                  "Products",
                  "Orders",
                  "Customers",
                  "Promotions",
                  "System",
                  "Profile",
                  "Wishlist",
                  "Cart",
                ].map((module) => {
                  const modulePermissions = PERMISSION_DEFINITIONS.filter(
                    (p) => p.module === module,
                  );
                  if (modulePermissions.length === 0) return null;

                  return (
                    <div
                      key={module}
                      className="border-l-4 border-blue-500 pl-4"
                    >
                      <h4 className="font-medium text-gray-900 mb-3">
                        {module} Module
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {modulePermissions.map((permission) => (
                          <div
                            key={permission.id}
                            className="bg-gray-50 p-3 rounded-lg"
                          >
                            <div className="flex items-center mb-2">
                              <ShieldIcon className="w-4 h-4 text-blue-500 mr-2" />
                              <span className="font-medium text-sm">
                                {permission.name}
                              </span>
                            </div>
                            <p className="text-xs text-gray-600 mb-2">
                              {permission.description}
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {permission.actions.map((action) => (
                                <span
                                  key={action}
                                  className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
                                >
                                  {action}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Form Sheet */}
      <UserFormSheet
        userId={editingUserId}
        open={userFormOpen}
        onOpenChange={(open) => {
          setUserFormOpen(open);
          if (!open) {
            setEditingUserId(undefined);
          }
        }}
        onSuccess={() => {
          usersQuery.refetch();
        }}
      />

      {/* Permission Assignment Sheet */}
      <PermissionAssignmentSheet
        userId={permissionUserId}
        userRole={permissionUserRole}
        open={permissionSheetOpen}
        onOpenChange={(open) => {
          setPermissionSheetOpen(open);
          if (!open) {
            setPermissionUserId(undefined);
            setPermissionUserRole(undefined);
          }
        }}
        onSuccess={() => {
          usersQuery.refetch();
        }}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open);
          if (!open) {
            setUserToDelete(null);
          }
        }}
        title="Delete User"
        description="Are you sure you want to delete this user? This action cannot be undone and will remove all associated data."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={confirmDelete}
        isLoading={deleteUserMutation.isPending}
        variant="danger"
      />
    </div>
  );
}

/**
 * Centralized permissions utility for role-based access control.
 * SINGLE SOURCE OF TRUTH for all permission-related constants.
 * Following DRY principle - permission logic in one place.
 */

import type { UserRole } from "@prisma/client";

/**
 * Permission types for the application.
 * Organized by module for clarity.
 */
export type Permission =
    // User management
    | "users.create"
    | "users.read"
    | "users.update"
    | "users.delete"
    | "users.manage_permissions"
    // Product management
    | "products.create"
    | "products.read"
    | "products.update"
    | "products.delete"
    // Order management
    | "orders.read"
    | "orders.update"
    | "orders.delete"
    // Promotion management
    | "promotions.create"
    | "promotions.read"
    | "promotions.update"
    | "promotions.delete"
    // Settings management
    | "settings.read"
    | "settings.update"
    // Customer management
    | "customers.read"
    | "customers.update"
    | "customers.delete"
    // Review management
    | "reviews.read"
    | "reviews.moderate"
    | "reviews.delete"
    // Brand management
    | "brands.create"
    | "brands.read"
    | "brands.update"
    | "brands.delete"
    // Category management
    | "categories.create"
    | "categories.read"
    | "categories.update"
    | "categories.delete"
    // Consultation management
    | "consultations.read"
    | "consultations.update"
    // Analytics
    | "analytics.read";

/**
 * All available permissions as an array (for iteration).
 */
export const ALL_PERMISSIONS: Permission[] = [
    "users.create",
    "users.read",
    "users.update",
    "users.delete",
    "users.manage_permissions",
    "products.create",
    "products.read",
    "products.update",
    "products.delete",
    "orders.read",
    "orders.update",
    "orders.delete",
    "promotions.create",
    "promotions.read",
    "promotions.update",
    "promotions.delete",
    "settings.read",
    "settings.update",
    "customers.read",
    "customers.update",
    "customers.delete",
    "reviews.read",
    "reviews.moderate",
    "reviews.delete",
    "brands.create",
    "brands.read",
    "brands.update",
    "brands.delete",
    "categories.create",
    "categories.read",
    "categories.update",
    "categories.delete",
    "consultations.read",
    "consultations.update",
    "analytics.read",
];

/**
 * Permission definition with metadata for UI display.
 */
export interface PermissionDefinition {
    id: Permission;
    name: string;
    description: string;
    module: string;
}

/**
 * All permission definitions with human-readable names and descriptions.
 */
export const PERMISSION_DEFINITIONS: PermissionDefinition[] = [
    // Users
    { id: "users.create", name: "Create Users", description: "Can create new users", module: "Users" },
    { id: "users.read", name: "View Users", description: "Can view user list and details", module: "Users" },
    { id: "users.update", name: "Edit Users", description: "Can edit user information", module: "Users" },
    { id: "users.delete", name: "Delete Users", description: "Can delete users", module: "Users" },
    { id: "users.manage_permissions", name: "Manage Permissions", description: "Can assign/revoke user permissions", module: "Users" },
    // Products
    { id: "products.create", name: "Create Products", description: "Can create new products", module: "Products" },
    { id: "products.read", name: "View Products", description: "Can view product list and details", module: "Products" },
    { id: "products.update", name: "Edit Products", description: "Can edit product information", module: "Products" },
    { id: "products.delete", name: "Delete Products", description: "Can delete products", module: "Products" },
    // Orders
    { id: "orders.read", name: "View Orders", description: "Can view order list and details", module: "Orders" },
    { id: "orders.update", name: "Update Orders", description: "Can update order status", module: "Orders" },
    { id: "orders.delete", name: "Delete Orders", description: "Can delete orders", module: "Orders" },
    // Promotions
    { id: "promotions.create", name: "Create Promotions", description: "Can create promotions", module: "Promotions" },
    { id: "promotions.read", name: "View Promotions", description: "Can view promotions", module: "Promotions" },
    { id: "promotions.update", name: "Edit Promotions", description: "Can edit promotions", module: "Promotions" },
    { id: "promotions.delete", name: "Delete Promotions", description: "Can delete promotions", module: "Promotions" },
    // Settings
    { id: "settings.read", name: "View Settings", description: "Can view system settings", module: "Settings" },
    { id: "settings.update", name: "Edit Settings", description: "Can modify system settings", module: "Settings" },
    // Customers
    { id: "customers.read", name: "View Customers", description: "Can view customer list", module: "Customers" },
    { id: "customers.update", name: "Edit Customers", description: "Can edit customer info", module: "Customers" },
    { id: "customers.delete", name: "Delete Customers", description: "Can delete customers", module: "Customers" },
    // Reviews
    { id: "reviews.read", name: "View Reviews", description: "Can view product reviews", module: "Reviews" },
    { id: "reviews.moderate", name: "Moderate Reviews", description: "Can approve/reject reviews", module: "Reviews" },
    { id: "reviews.delete", name: "Delete Reviews", description: "Can delete reviews", module: "Reviews" },
    // Brands
    { id: "brands.create", name: "Create Brands", description: "Can create brands", module: "Brands" },
    { id: "brands.read", name: "View Brands", description: "Can view brands", module: "Brands" },
    { id: "brands.update", name: "Edit Brands", description: "Can edit brands", module: "Brands" },
    { id: "brands.delete", name: "Delete Brands", description: "Can delete brands", module: "Brands" },
    // Categories
    { id: "categories.create", name: "Create Categories", description: "Can create categories", module: "Categories" },
    { id: "categories.read", name: "View Categories", description: "Can view categories", module: "Categories" },
    { id: "categories.update", name: "Edit Categories", description: "Can edit categories", module: "Categories" },
    { id: "categories.delete", name: "Delete Categories", description: "Can delete categories", module: "Categories" },
    // Consultations
    { id: "consultations.read", name: "View Consultations", description: "Can view consultations", module: "Consultations" },
    { id: "consultations.update", name: "Manage Consultations", description: "Can update consultation status", module: "Consultations" },
    // Analytics
    { id: "analytics.read", name: "View Analytics", description: "Can view analytics dashboard", module: "Analytics" },
];

/**
 * Role configuration with metadata for UI display.
 */
export interface RoleConfig {
    id: UserRole;
    name: string;
    description: string;
    color: string;
    permissions: Permission[];
}

/**
 * Role configurations - SINGLE SOURCE OF TRUTH.
 */
export const ROLE_CONFIGS: RoleConfig[] = [
    {
        id: "ADMIN",
        name: "Administrator",
        description: "Full system access and control",
        color: "#ef4444",
        permissions: ALL_PERMISSIONS, // Admin gets all permissions
    },
    {
        id: "STAFF",
        name: "Staff",
        description: "Manage products, orders, and customers",
        color: "#3b82f6",
        permissions: [
            "users.read",
            "products.create",
            "products.read",
            "products.update",
            "orders.read",
            "orders.update",
            "promotions.read",
            "settings.read",
            "customers.read",
            "reviews.read",
            "reviews.moderate",
            "brands.create",
            "brands.read",
            "brands.update",
            "categories.create",
            "categories.read",
            "categories.update",
            "consultations.read",
            "consultations.update",
            "analytics.read",
        ],
    },
    {
        id: "CUSTOMER",
        name: "Customer",
        description: "Standard customer access",
        color: "#10b981",
        permissions: [], // No admin permissions
    },
];

/**
 * Role-based default permissions as a lookup map.
 */
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
    ADMIN: ROLE_CONFIGS.find((r) => r.id === "ADMIN")!.permissions,
    STAFF: ROLE_CONFIGS.find((r) => r.id === "STAFF")!.permissions,
    CUSTOMER: ROLE_CONFIGS.find((r) => r.id === "CUSTOMER")!.permissions,
};

/**
 * Get role config by role ID.
 */
export function getRoleConfig(role: UserRole): RoleConfig | undefined {
    return ROLE_CONFIGS.find((r) => r.id === role);
}

/**
 * Get permission definition by ID.
 */
export function getPermissionDefinition(permission: Permission): PermissionDefinition | undefined {
    return PERMISSION_DEFINITIONS.find((p) => p.id === permission);
}

/**
 * Check if a role has a specific permission (role-based only).
 */
export function hasRolePermission(
    role: UserRole | undefined,
    permission: Permission
): boolean {
    if (!role) return false;
    return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

/**
 * Check if the role is Admin.
 */
export function isAdminRole(role: UserRole | undefined): boolean {
    return role === "ADMIN";
}

/**
 * Check if the role is Staff or Admin.
 */
export function isStaffOrAdmin(role: UserRole | undefined): boolean {
    return role === "STAFF" || role === "ADMIN";
}

/**
 * Check if the role can manage users (create, update, delete, permissions).
 */
export function canManageUsers(role: UserRole | undefined): boolean {
    return hasRolePermission(role, "users.manage_permissions");
}

/**
 * Check if the role can delete items (general delete permission).
 */
export function canDeleteItems(role: UserRole | undefined): boolean {
    return isAdminRole(role);
}

/**
 * Get permissions NOT included in a role (for granting additional permissions).
 */
export function getGrantablePermissions(role: UserRole): Permission[] {
    const rolePerms = ROLE_PERMISSIONS[role] || [];
    return ALL_PERMISSIONS.filter((p) => !rolePerms.includes(p));
}

/**
 * Merge role permissions with user-specific permissions.
 * Used to get effective permissions for a user.
 */
export function getEffectivePermissions(
    role: UserRole,
    customPermissions: string[]
): Permission[] {
    const rolePerms = ROLE_PERMISSIONS[role] || [];
    const validCustomPerms = customPermissions.filter((p) =>
        ALL_PERMISSIONS.includes(p as Permission)
    ) as Permission[];
    return [...new Set([...rolePerms, ...validCustomPerms])];
}

/**
 * Check if user has permission (considering both role and custom permissions).
 */
export function hasEffectivePermission(
    role: UserRole | undefined,
    customPermissions: string[],
    permission: Permission
): boolean {
    if (!role) return false;
    const effective = getEffectivePermissions(role, customPermissions);
    return effective.includes(permission);
}


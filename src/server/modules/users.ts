import { UserRole, UserStatus } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { adminProcedure, staffProcedure } from "../trpc";
import { hashPassword, validatePasswordStrength } from "@/lib/auth/password";

// Create user (admin only)
export const createUser = adminProcedure
  .input(
    z.object({
      email: z.string().email(),
      password: z.string().min(8),
      first_name: z.string().optional(),
      last_name: z.string().optional(),
      phone: z.string().optional(),
      role: z.nativeEnum(UserRole).default("CUSTOMER"),
      status: z.nativeEnum(UserStatus).default("ACTIVE"),
      permissions: z.array(z.string()).optional(),
    }),
  )
  .mutation(async ({ input, ctx }) => {
    const { password, permissions, ...userData } = input;

    // Check if user already exists
    const existingUser = await ctx.prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "User with this email already exists",
      });
    }

    // Validate password strength
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: passwordValidation.error || "Invalid password",
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await ctx.prisma.user.create({
      data: {
        ...userData,
        password_hash: hashedPassword,
        email_verified_at: new Date(), // Auto-verify admin-created users
      },
    });

    // Grant permissions if provided
    if (permissions && permissions.length > 0) {
      await ctx.prisma.userPermission.createMany({
        data: permissions.map((permission) => ({
          user_id: user.id,
          permission,
          granted_by: ctx.user.id,
        })),
      });
    }

    return {
      user,
      message: "User created successfully",
    };
  });

// Get all users (admin/staff only)
export const getUsers = staffProcedure
  .input(
    z.object({
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(100).default(10),
      role: z.nativeEnum(UserRole).optional(),
      status: z.nativeEnum(UserStatus).optional(),
      search: z.string().optional(),
    }),
  )
  .query(async ({ input, ctx }) => {
    const { page, limit, role, status, search } = input;
    const skip = (page - 1) * limit;

    const where = {
      ...(role && { role }),
      ...(status && { status }),
      ...(search && {
        OR: [
          { email: { contains: search, mode: "insensitive" as const } },
          { first_name: { contains: search, mode: "insensitive" as const } },
          { last_name: { contains: search, mode: "insensitive" as const } },
          { phone: { contains: search } },
        ],
      }),
    };

    const [users, total] = await Promise.all([
      ctx.prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          first_name: true,
          last_name: true,
          phone: true,
          role: true,
          status: true,
          image: true,
          email_verified_at: true,
          last_login_at: true,
          created_at: true,
        },
        orderBy: { created_at: "desc" },
      }),
      ctx.prisma.user.count({ where }),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  });

// Get user by ID (admin/staff only)
export const getUserById = staffProcedure
  .input(z.object({ id: z.string() }))
  .query(async ({ input, ctx }) => {
    const user = await ctx.prisma.user.findUnique({
      where: { id: input.id },
      include: {
        addresses: true,
        orders: {
          take: 5,
          orderBy: { created_at: "desc" },
        },
        permissions: true,
        _count: {
          select: {
            orders: true,
            wishlist_items: true,
            cart_items: true,
          },
        },
      },
    });

    if (!user) {
      throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
    }

    return user;
  });

// Update user (admin only)
export const updateUser = adminProcedure
  .input(
    z.object({
      id: z.string(),
      first_name: z.string().optional(),
      last_name: z.string().optional(),
      phone: z.string().optional(),
      role: z.nativeEnum(UserRole).optional(),
      status: z.nativeEnum(UserStatus).optional(),
    }),
  )
  .mutation(async ({ input, ctx }) => {
    const { id, ...data } = input;

    const user = await ctx.prisma.user.update({
      where: { id },
      data,
    });

    return { user, message: "User updated successfully" };
  });

// Delete user (admin only)
export const deleteUser = adminProcedure
  .input(z.object({ id: z.string() }))
  .mutation(async ({ input, ctx }) => {
    await ctx.prisma.user.delete({
      where: { id: input.id },
    });

    return { message: "User deleted successfully" };
  });

// Get user permissions (admin/staff only)
export const getUserPermissions = staffProcedure
  .input(z.object({ userId: z.string() }))
  .query(async ({ input, ctx }) => {
    const permissions = await ctx.prisma.userPermission.findMany({
      where: { user_id: input.userId },
      orderBy: { granted_at: "desc" },
    });

    return permissions;
  });

// Get all available permissions (admin/staff only)
export const getAvailablePermissions = staffProcedure.query(async ({ ctx }) => {
  // Common permissions list - can be extended
  const commonPermissions = [
    "products.create",
    "products.update",
    "products.delete",
    "orders.view",
    "orders.update",
    "orders.cancel",
    "customers.view",
    "customers.update",
    "customers.delete",
    "analytics.view",
    "settings.view",
    "settings.update",
    "promotions.create",
    "promotions.update",
    "promotions.delete",
    "reviews.moderate",
    "consultations.view",
    "consultations.update",
    "payments.view",
    "payments.refund",
  ];

  // Get all unique permissions from database
  const dbPermissions = await ctx.prisma.userPermission.findMany({
    select: { permission: true },
    distinct: ["permission"],
  });

  const dbPermissionSet = new Set(
    dbPermissions.map((p) => p.permission),
  );

  // Combine common permissions with database permissions
  const allPermissions = Array.from(
    new Set([...commonPermissions, ...Array.from(dbPermissionSet)]),
  ).sort();

  return allPermissions;
});

// Grant permission to user (admin only)
export const grantPermission = adminProcedure
  .input(
    z.object({
      userId: z.string(),
      permission: z.string(),
    }),
  )
  .mutation(async ({ input, ctx }) => {
    // Check if permission already exists
    const existing = await ctx.prisma.userPermission.findUnique({
      where: {
        user_id_permission: {
          user_id: input.userId,
          permission: input.permission,
        },
      },
    });

    if (existing) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "Permission already granted",
      });
    }

    const permission = await ctx.prisma.userPermission.create({
      data: {
        user_id: input.userId,
        permission: input.permission,
        granted_by: ctx.user.id,
      },
    });

    return { permission, message: "Permission granted successfully" };
  });

// Grant multiple permissions to user (admin only)
export const grantPermissions = adminProcedure
  .input(
    z.object({
      userId: z.string(),
      permissions: z.array(z.string()),
    }),
  )
  .mutation(async ({ input, ctx }) => {
    // Get existing permissions
    const existing = await ctx.prisma.userPermission.findMany({
      where: {
        user_id: input.userId,
        permission: { in: input.permissions },
      },
    });

    const existingSet = new Set(existing.map((p) => p.permission));
    const newPermissions = input.permissions.filter(
      (p) => !existingSet.has(p),
    );

    if (newPermissions.length === 0) {
      return { message: "All permissions already granted" };
    }

    await ctx.prisma.userPermission.createMany({
      data: newPermissions.map((permission) => ({
        user_id: input.userId,
        permission,
        granted_by: ctx.user.id,
      })),
    });

    return {
      message: `Granted ${newPermissions.length} permission(s) successfully`,
    };
  });

// Revoke permission from user (admin only)
export const revokePermission = adminProcedure
  .input(
    z.object({
      userId: z.string(),
      permission: z.string(),
    }),
  )
  .mutation(async ({ input, ctx }) => {
    await ctx.prisma.userPermission.delete({
      where: {
        user_id_permission: {
          user_id: input.userId,
          permission: input.permission,
        },
      },
    });

    return { message: "Permission revoked successfully" };
  });

// Get user statistics (admin/staff only)
export const getUserStats = staffProcedure.query(async ({ ctx }) => {
  const [total, active, pending, suspended] = await Promise.all([
    ctx.prisma.user.count({ where: { role: "CUSTOMER" } }),
    ctx.prisma.user.count({ where: { role: "CUSTOMER", status: "ACTIVE" } }),
    ctx.prisma.user.count({
      where: { role: "CUSTOMER", status: "PENDING_VERIFICATION" },
    }),
    ctx.prisma.user.count({ where: { role: "CUSTOMER", status: "SUSPENDED" } }),
  ]);

  // Calculate total revenue from completed orders
  const revenue = await ctx.prisma.order.aggregate({
    where: {
      payment_status: "COMPLETED",
    },
    _sum: {
      total: true,
    },
  });

  // Get total orders count
  const totalOrders = await ctx.prisma.order.count();

  return {
    total,
    active,
    pending,
    suspended,
    revenue: revenue._sum.total || 0,
    totalOrders,
    avgOrderValue:
      totalOrders > 0 ? Number(revenue._sum.total || 0) / totalOrders : 0,
  };
});

// Get customers with order statistics (admin/staff only)
export const getCustomers = staffProcedure
  .input(
    z.object({
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(100).default(50),
      status: z.nativeEnum(UserStatus).optional(),
      search: z.string().optional(),
    }),
  )
  .query(async ({ input, ctx }) => {
    const { page, limit, status, search } = input;
    const skip = (page - 1) * limit;

    const where = {
      role: "CUSTOMER" as UserRole,
      ...(status && { status }),
      ...(search && {
        OR: [
          { email: { contains: search, mode: "insensitive" as const } },
          { first_name: { contains: search, mode: "insensitive" as const } },
          { last_name: { contains: search, mode: "insensitive" as const } },
          { phone: { contains: search } },
        ],
      }),
    };

    const [customers, total] = await Promise.all([
      ctx.prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          first_name: true,
          last_name: true,
          phone: true,
          role: true,
          status: true,
          image: true,
          created_at: true,
          last_login_at: true,
          _count: {
            select: {
              orders: true,
            },
          },
          orders: {
            where: {
              payment_status: "COMPLETED",
            },
            select: {
              total: true,
              created_at: true,
            },
          },
          addresses: {
            where: {
              is_default: true,
            },
            take: 1,
            select: {
              city: true,
              state: true,
              country: true,
            },
          },
        },
        orderBy: { created_at: "desc" },
      }),
      ctx.prisma.user.count({ where }),
    ]);

    // Calculate totals for each customer
    const customersWithStats = customers.map((customer) => {
      const totalSpent = customer.orders.reduce(
        (sum, order) => sum + Number(order.total),
        0,
      );
      const lastOrder =
        customer.orders.length > 0
          ? customer.orders.sort(
              (a, b) =>
                new Date(b.created_at).getTime() -
                new Date(a.created_at).getTime(),
            )[0]
          : null;

      return {
        ...customer,
        totalOrders: customer._count.orders,
        totalSpent,
        lastOrderDate: lastOrder?.created_at,
        loyaltyPoints: Math.floor(totalSpent / 1000), // 1 point per 1000 spent
      };
    });

    return {
      customers: customersWithStats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  });

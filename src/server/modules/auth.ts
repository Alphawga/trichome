import { UserRole, UserStatus } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  hashPassword,
  validatePasswordStrength,
  verifyPassword,
} from "@/lib/auth/password";
import { protectedProcedure, publicProcedure } from "../trpc";

// Register a new user
export const register = publicProcedure
  .input(
    z.object({
      email: z.email(),
      password: z.string().min(8),
      first_name: z.string().optional(),
      last_name: z.string().optional(),
      phone: z.string().optional(),
    }),
  )
  .mutation(async ({ input, ctx }) => {
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
    const passwordValidation = validatePasswordStrength(input.password);
    if (!passwordValidation.isValid) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: passwordValidation.error || "Invalid password",
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(input.password);

    const user = await ctx.prisma.user.create({
      data: {
        email: input.email,
        password_hash: hashedPassword,
        first_name: input.first_name,
        last_name: input.last_name,
        phone: input.phone,
        name:
          input.first_name && input.last_name
            ? `${input.first_name} ${input.last_name}`
            : input.email,
        role: UserRole.CUSTOMER,
        status: UserStatus.ACTIVE,
      },
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        role: true,
        status: true,
      },
    });

    return { user, message: "User registered successfully" };
  });

// Get current user profile
export const getProfile = protectedProcedure.query(async ({ ctx }) => {
  const user = await ctx.prisma.user.findUnique({
    where: { id: ctx.user.id },
    select: {
      id: true,
      email: true,
      first_name: true,
      last_name: true,
      name: true,
      phone: true,
      image: true,
      role: true,
      status: true,
      email_verified_at: true,
      phone_verified_at: true,
      last_login_at: true,
      created_at: true,
    },
  });

  if (!user) {
    throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
  }

  return user;
});

// Update user profile
export const updateProfile = protectedProcedure
  .input(
    z.object({
      first_name: z.string().optional(),
      last_name: z.string().optional(),
      phone: z.string().optional(),
      image: z.string().optional(),
    }),
  )
  .mutation(async ({ input, ctx }) => {
    const user = await ctx.prisma.user.update({
      where: { id: ctx.user.id },
      data: {
        ...input,
        name:
          input.first_name && input.last_name
            ? `${input.first_name} ${input.last_name}`
            : undefined,
      },
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        name: true,
        phone: true,
        image: true,
      },
    });

    return { user, message: "Profile updated successfully" };
  });

// Change password
export const changePassword = protectedProcedure
  .input(
    z.object({
      currentPassword: z.string(),
      newPassword: z.string().min(8),
    }),
  )
  .mutation(async ({ input, ctx }) => {
    // Get user with password hash
    const user = await ctx.prisma.user.findUnique({
      where: { id: ctx.user.id },
      select: { id: true, password_hash: true },
    });

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    // Verify current password
    if (!user.password_hash) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "No password set for this account. Please use password reset.",
      });
    }

    const isValidPassword = await verifyPassword(
      input.currentPassword,
      user.password_hash,
    );
    if (!isValidPassword) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Current password is incorrect",
      });
    }

    // Validate new password strength
    const passwordValidation = validatePasswordStrength(input.newPassword);
    if (!passwordValidation.isValid) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: passwordValidation.error || "Invalid password",
      });
    }

    // Hash new password
    const hashedPassword = await hashPassword(input.newPassword);

    // Update password
    await ctx.prisma.user.update({
      where: { id: ctx.user.id },
      data: { password_hash: hashedPassword },
    });

    return { message: "Password changed successfully" };
  });

// Request password reset
export const requestPasswordReset = publicProcedure
  .input(
    z.object({
      email: z.email(),
    }),
  )
  .mutation(async ({ input, ctx }) => {
    // Find user by email
    const user = await ctx.prisma.user.findUnique({
      where: { email: input.email },
      select: { id: true, email: true, password_hash: true },
    });

    // Always return success to prevent email enumeration
    // Don't reveal whether the email exists or not
    if (!user) {
      // Return success even if user doesn't exist (security best practice)
      return {
        message:
          "If an account with that email exists, we have sent a password reset link.",
      };
    }

    // Check if user has a password (not OAuth-only account)
    if (!user.password_hash) {
      // Return success even if user doesn't have a password
      return {
        message:
          "If an account with that email exists, we have sent a password reset link.",
      };
    }

    // Generate reset token
    const { createPasswordResetToken, getTokenExpirationHours } = await import(
      "@/lib/auth/password-reset-token"
    );

    const token = await createPasswordResetToken(input.email);

    // Generate reset URL
    const baseUrl =
      process.env.NEXTAUTH_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "http://localhost:3000";
    const resetUrl = `${baseUrl}/auth/reset-password?token=${token}&email=${encodeURIComponent(input.email)}`;

    // Send reset email
    const { sendPasswordResetEmail } = await import(
      "@/lib/email/password-reset"
    );
    const expirationHours = getTokenExpirationHours();
    await sendPasswordResetEmail({
      email: input.email,
      resetToken: token,
      resetUrl: resetUrl,
      expiresIn: `${expirationHours} hour${expirationHours > 1 ? "s" : ""}`,
    });

    return {
      message:
        "If an account with that email exists, we have sent a password reset link.",
    };
  });

// Validate password reset token
export const validatePasswordResetToken = publicProcedure
  .input(
    z.object({
      email: z.email(),
      token: z.string(),
    }),
  )
  .query(async ({ input: _input, ctx: _ctx }) => {
    const { validatePasswordResetToken } = await import(
      "@/lib/auth/password-reset-token"
    );

    const isValid = await validatePasswordResetToken(input.email, input.token);

    return { isValid };
  });

// Reset password with token
export const resetPassword = publicProcedure
  .input(
    z.object({
      email: z.email(),
      token: z.string(),
      newPassword: z.string().min(8),
    }),
  )
  .mutation(async ({ input: _input, ctx: _ctx }) => {
    // Validate token
    const { validatePasswordResetToken, deletePasswordResetToken } =
      await import("@/lib/auth/password-reset-token");

    const isValidToken = await validatePasswordResetToken(
      input.email,
      input.token,
    );

    if (!isValidToken) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Invalid or expired reset token",
      });
    }

    // Find user
    const user = await ctx.prisma.user.findUnique({
      where: { email: input.email },
      select: { id: true, email: true, password_hash: true },
    });

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    // Validate password strength
    const passwordValidation = validatePasswordStrength(input.newPassword);
    if (!passwordValidation.isValid) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: passwordValidation.error || "Invalid password",
      });
    }

    // Hash new password
    const hashedPassword = await hashPassword(input.newPassword);

    // Update password
    await ctx.prisma.user.update({
      where: { id: user.id },
      data: { password_hash: hashedPassword },
    });

    // Delete used token
    await deletePasswordResetToken(input.email, input.token);

    return { message: "Password reset successfully" };
  });

// Verify email
export const verifyEmail = publicProcedure
  .input(z.object({ token: z.string() }))
  .mutation(async ({ input: _input, ctx: _ctx }) => {
    // Implement email verification logic
    throw new TRPCError({
      code: "NOT_IMPLEMENTED",
      message: "Email verification not implemented",
    });
  });

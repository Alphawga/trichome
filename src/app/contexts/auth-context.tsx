"use client";

import type { UserRole } from "@prisma/client";
import type { Session } from "next-auth";
import { signIn, signOut, useSession } from "next-auth/react";
import type React from "react";
import { createContext, useContext, useCallback } from "react";
import { type Permission, hasRolePermission, isAdminRole, isStaffOrAdmin } from "@/lib/permissions";


interface AuthUser {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: UserRole;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  session: Session | null;
  isAdmin: boolean;
  isStaff: boolean;
  hasPermission: (permission: Permission) => boolean;
  signInWithGoogle: (callbackUrl?: string) => Promise<void>;
  signInWithCredentials: (email: string, password: string) => Promise<void>;
  signUpWithCredentials: (data: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    password: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();

  const user: AuthUser | null = session?.user
    ? {
      id: session.user.id,
      email: session.user.email ?? "",
      first_name: session.user.first_name,
      last_name: session.user.last_name,
      role: session.user.role,
    }
    : null;

  const signInWithGoogle = async (callbackUrl?: string): Promise<void> => {
    try {
      const redirectUrl = callbackUrl ||
        (typeof window !== 'undefined' ? localStorage.getItem("trichomes_redirect_url") : null) ||
        "/";

      await signIn("google", {
        callbackUrl: redirectUrl,
        redirect: true,
      });
    } catch (error) {
     
      console.error("Google sign in failed:", error);
      throw error;
    }
  };

 
  const signInWithCredentials = async (
    email: string,
    password: string,
  ): Promise<void> => {
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        throw new Error(result.error);
      }
    } catch (error) {
      // Following CODING_RULES.md - proper error handling
      console.error("Login failed:", error);
      throw error;
    }
  };

  // Registration - we'll implement this as a separate endpoint
  const signUpWithCredentials = async (data: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    password: string;
  }): Promise<void> => {
    try {
      // Call our registration endpoint
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Registration failed");
      }

     
      await signInWithCredentials(data.email, data.password);
    } catch (error) {

      console.error("Registration failed:", error);
      throw error;
    }
  };

  // Logout using NextAuth
  const logout = async (): Promise<void> => {
    try {
      await signOut({ redirect: false });
    } catch (error) {
      
      console.error("Logout failed:", error);
      throw error;
    }
  };

 
  const isLoading = status === "loading";

   // Role-based permission helpers using centralized permissions utility
  const isAdmin = isAdminRole(user?.role);
  const isStaff = isStaffOrAdmin(user?.role);

  // Debug logging for permissions
  if (user?.role) {
    const { ROLE_PERMISSIONS } = require("@/lib/permissions");
    console.log("AUTH CONTEXT - User:", user?.email, "Role:", user?.role);
    console.log("AUTH CONTEXT - Permissions for role:", ROLE_PERMISSIONS[user.role]);
    console.log("AUTH CONTEXT - isAdmin:", isAdmin, "isStaff:", isStaff);
  }

  const hasPermission = useCallback(
    (permission: Permission) => hasRolePermission(user?.role, permission),
    [user?.role]
  );

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    session,
    isAdmin,
    isStaff,
    hasPermission,
    signInWithGoogle,
    signInWithCredentials,
    signUpWithCredentials,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

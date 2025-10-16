'use client';

import React, { createContext, useContext } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { UserRole } from '@prisma/client';
import type { Session } from 'next-auth';

// Following CODING_RULES.md - use Prisma-generated types
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
  signInWithGoogle: () => Promise<void>;
  signInWithCredentials: (email: string, password: string) => Promise<void>;
  signUpWithCredentials: (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();

  // Following CODING_RULES.md - use Prisma-generated types and proper type safety
  const user: AuthUser | null = session?.user ? {
    id: session.user.id,
    email: session.user.email!,
    first_name: session.user.first_name,
    last_name: session.user.last_name,
    role: session.user.role,
  } : null;

  // Google OAuth sign-in using NextAuth
  const signInWithGoogle = async (): Promise<void> => {
    try {
      await signIn('google', {
        callbackUrl: '/',
        redirect: true
      });
    } catch (error) {
      // Following CODING_RULES.md - proper error handling
      console.error('Google sign in failed:', error);
      throw error;
    }
  };

  // Traditional email/password login using NextAuth credentials provider
  const signInWithCredentials = async (email: string, password: string): Promise<void> => {
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false
      });

      if (result?.error) {
        throw new Error(result.error);
      }
    } catch (error) {
      // Following CODING_RULES.md - proper error handling
      console.error('Login failed:', error);
      throw error;
    }
  };

  // Registration - we'll implement this as a separate endpoint
  const signUpWithCredentials = async (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }): Promise<void> => {
    try {
      // Call our registration endpoint
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      // After successful registration, sign in the user
      await signInWithCredentials(data.email, data.password);
    } catch (error) {
      // Following CODING_RULES.md - proper error handling
      console.error('Registration failed:', error);
      throw error;
    }
  };

  // Logout using NextAuth
  const logout = async (): Promise<void> => {
    try {
      await signOut({ redirect: false });
    } catch (error) {
      // Following CODING_RULES.md - proper error handling
      console.error('Logout failed:', error);
      throw error;
    }
  };

  // Following CODING_RULES.md - proper loading state management
  const isLoading = status === 'loading';

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    session,
    signInWithGoogle,
    signInWithCredentials,
    signUpWithCredentials,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
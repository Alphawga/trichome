// import { PrismaAdapter } from '@auth/prisma-adapter'
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { UserRole, UserStatus } from "@prisma/client";
import type { DefaultSession, NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { verifyPassword } from "@/lib/auth/password";
import { prisma } from "@/lib/prisma";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      role: UserRole;
      first_name: string | null;
      last_name: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    role: UserRole;
    first_name: string | null;
    last_name: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: UserRole;
    first_name: string | null;
    last_name: string | null;
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  // Allow account linking when a user with the same email exists
  events: {
    async createUser({ user }) {
      // Set default role, status, and extract name for new users created via OAuth
      try {
        const nameParts = user.name?.split(" ") || [];
        await prisma.user.update({
          where: { id: user.id },
          data: {
            role: UserRole.CUSTOMER,
            status: UserStatus.ACTIVE,
            first_name: nameParts[0] || null,
            last_name: nameParts.slice(1).join(" ") || null,
          },
        });
        console.log("🆕 createUser triggered:", user);
      } catch (error) {
        console.error("Error updating new user role/status:", error);
      }
    },
    async linkAccount({ user, account, profile }) {
      // Update user profile when OAuth account is linked
      if (account.provider === "google") {
        const googleProfile = profile as
          | { given_name?: string; family_name?: string }
          | undefined;

        try {
          const existingUser = await prisma.user.findUnique({
            where: { id: user.id },
          });

          if (existingUser) {
            await prisma.user.update({
              where: { id: user.id },
              data: {
                name: user.name || existingUser.name,
                image: user.image || existingUser.image,
                emailVerified: new Date(),
                status: UserStatus.ACTIVE,
                last_login_at: new Date(),
                // Only update first_name/last_name if they're not already set
                first_name:
                  existingUser.first_name ||
                  googleProfile?.given_name ||
                  user.name?.split(" ")[0] ||
                  null,
                last_name:
                  existingUser.last_name ||
                  googleProfile?.family_name ||
                  user.name?.split(" ").slice(1).join(" ") ||
                  null,
              },
            });
          }
        } catch (error) {
          console.error(
            "Error updating user profile after account linking:",
            error,
          );
        }
      }
    },
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      allowDangerousEmailAccountLinking: false,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Following CODING_RULES.md - proper validation and error handling
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Find user using Prisma-generated types
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
            select: {
              id: true,
              email: true,
              password_hash: true,
              first_name: true,
              last_name: true,
              role: true,
              status: true,
            },
          });

          if (!user) {
            return null;
          }

          // Check if user account is active
          if (user.status !== UserStatus.ACTIVE) {
            return null;
          }

          // Verify password using bcrypt
          // If user has no password_hash (e.g., OAuth-only account), deny credentials login
          if (!user.password_hash) {
            return null;
          }

          const isValidPassword = await verifyPassword(
            credentials.password,
            user.password_hash,
          );

          if (!isValidPassword) {
            return null;
          }

          // Update last login timestamp
          await prisma.user.update({
            where: { id: user.id },
            data: { last_login_at: new Date() },
          });

          return {
            id: user.id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            role: user.role,
          };
        } catch (error) {
          console.error("Authorization error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log("SIGN IN STARTED", { user, account, profile });
      if (account?.provider === "google") {
        try {
          // Following CODING_RULES.md - proper error handling and type safety
          if (!user.email) {
            console.error("Google sign in failed: No email provided");
            return false;
          }
          return true;
        } catch (error) {
          // Following CODING_RULES.md - proper error handling
          console.error("Error during Google sign in:", error);
          return false;
        }
      }
      return true;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = token.role;
        session.user.first_name = token.first_name;
        session.user.last_name = token.last_name;
      }
      return session;
    },
    // async jwt({ token, user }) {
    //   if (user) {
    //     // Fetch user data from database
    //     const dbUser = await prisma.user.findUnique({
    //       where: { email: user.email! },
    //       select: {
    //         id: true,
    //         role: true,
    //         first_name: true,
    //         last_name: true,
    //       }
    //     })

    //     if (dbUser) {
    //       token.role = dbUser.role
    //       token.first_name = dbUser.first_name
    //       token.last_name = dbUser.last_name
    //       token.sub = dbUser.id
    //     }
    //   }
    //   return token
    // },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }

      // Prefer ID lookup (more reliable)
      if (token.sub) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub },
          select: {
            id: true,
            email: true,
            role: true,
            first_name: true,
            last_name: true,
          },
        });

        if (dbUser) {
          token.email = dbUser.email;
          token.role = dbUser.role;
          token.first_name = dbUser.first_name;
          token.last_name = dbUser.last_name;
        }
      }

      return token;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/signin",
  },
  session: {
    strategy: "jwt",
  },
};

import NextAuth, { type NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import { UserRole, UserStatus, type User } from '@prisma/client'
import type { DefaultSession } from 'next-auth'
import bcrypt from 'bcryptjs'

// Extend the built-in session types following CODING_RULES.md - use Prisma-generated types
declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string
      role: UserRole
      first_name: string | null
      last_name: string | null
    } & DefaultSession['user']
  }

  interface User {
    role: UserRole
    first_name: string | null
    last_name: string | null
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: UserRole
    first_name: string | null
    last_name: string | null
  }
}

const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
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
              first_name: true,
              last_name: true,
              role: true,
              status: true,
              // Note: We need to add password field to our User model
            }
          });

          if (!user) {
            return null;
          }

          // For now, we'll use a simple password check
          // TODO: Implement proper password hashing in the User model
          if (credentials.password === 'demo123') {
            return {
              id: user.id,
              email: user.email,
              first_name: user.first_name,
              last_name: user.last_name,
              role: user.role,
            };
          }

          return null;
        } catch (error) {
          console.error('Authorization error:', error);
          return null;
        }
      }
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        try {
          // Following CODING_RULES.md - proper error handling and type safety
          if (!user.email) {
            console.error('Google sign in failed: No email provided')
            return false
          }

          // Check if user already exists using Prisma-generated types
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email }
          })

          if (!existingUser) {
            // Create new user with Google data using Prisma-generated types
            const googleProfile = profile as { given_name?: string; family_name?: string }
            await prisma.user.create({
              data: {
                email: user.email,
                name: user.name,
                image: user.image,
                emailVerified: new Date(),
                first_name: googleProfile?.given_name || user.name?.split(' ')[0] || '',
                last_name: googleProfile?.family_name || user.name?.split(' ').slice(1).join(' ') || '',
                role: UserRole.CUSTOMER,
                status: UserStatus.ACTIVE,
                last_login_at: new Date(),
              }
            })
          } else {
            // Update last login and email verification
            await prisma.user.update({
              where: { email: user.email },
              data: {
                last_login_at: new Date(),
                emailVerified: new Date(),
                name: user.name,
                image: user.image,
              }
            })
          }
          return true
        } catch (error) {
          // Following CODING_RULES.md - proper error handling
          console.error('Error during Google sign in:', error)
          return false
        }
      }
      return true
    },
    async session({ session, user }) {
      // Following CODING_RULES.md - use Prisma-generated types
      if (session.user?.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: session.user.email },
          select: {
            id: true,
            role: true,
            first_name: true,
            last_name: true,
            email: true,
            name: true,
            image: true,
          }
        })

        if (dbUser) {
          session.user.id = dbUser.id
          session.user.role = dbUser.role
          session.user.first_name = dbUser.first_name
          session.user.last_name = dbUser.last_name
        }
      }
      return session
    },
    async jwt({ token, user }) {
      // Following CODING_RULES.md - proper type safety
      if (user) {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email! },
          select: {
            id: true,
            role: true,
            first_name: true,
            last_name: true,
          }
        })

        if (dbUser) {
          token.role = dbUser.role
          token.first_name = dbUser.first_name
          token.last_name = dbUser.last_name
          token.sub = dbUser.id
        }
      }
      return token
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/signin',
  },
  session: {
    strategy: 'database',
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
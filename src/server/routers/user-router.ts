import { z } from 'zod'
import { createTRPCRouter, publicProcedure } from '../trpc'
import { userService } from '@/lib/services/user-service'
import { TRPCError } from '@trpc/server'
import { ServiceError } from '@/lib/services/base-service'
import { UserRole, UserStatus } from '@prisma/client'

// Helper function to convert ServiceError to TRPCError
const handleServiceError = (error: unknown): never => {
  if (error instanceof ServiceError) {
    const trpcCode = error.statusCode === 404 ? 'NOT_FOUND' :
                     error.statusCode === 401 ? 'UNAUTHORIZED' :
                     error.statusCode === 403 ? 'FORBIDDEN' :
                     error.statusCode === 409 ? 'CONFLICT' :
                     'INTERNAL_SERVER_ERROR'

    throw new TRPCError({
      code: trpcCode,
      message: error.message,
      cause: error
    })
  }

  throw new TRPCError({
    code: 'INTERNAL_SERVER_ERROR',
    message: 'An unexpected error occurred',
    cause: error
  })
}

// Input schemas
const createUserSchema = z.object({
  email: z.string().email(),
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  phone_number: z.string().optional(),
  password: z.string().min(6).optional(),
  role: z.nativeEnum(UserRole).optional(),
  status: z.nativeEnum(UserStatus).optional()
})

const updateUserSchema = z.object({
  id: z.string().cuid(),
  first_name: z.string().min(1).optional(),
  last_name: z.string().min(1).optional(),
  phone_number: z.string().optional(),
  email: z.string().email().optional(),
  status: z.nativeEnum(UserStatus).optional(),
  role: z.nativeEnum(UserRole).optional()
})

const getUsersSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  role: z.nativeEnum(UserRole).optional(),
  status: z.nativeEnum(UserStatus).optional(),
  search: z.string().optional(),
  createdAfter: z.date().optional(),
  createdBefore: z.date().optional()
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
})

const registerSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  password: z.string().min(6),
  acceptTerms: z.boolean(),
  newsletterOptIn: z.boolean().optional()
})

export const userRouter = createTRPCRouter({
  create: publicProcedure
    .input(createUserSchema)
    .mutation(async ({ input }) => {
      try {
        return await userService.createUser(input)
      } catch (error) {
        handleServiceError(error)
      }
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(async ({ input }) => {
      try {
        const user = await userService.getUserById(input.id)
        if (!user) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'User not found'
          })
        }
        return user
      } catch (error) {
        handleServiceError(error)
      }
    }),

  getByEmail: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .query(async ({ input }) => {
      try {
        return await userService.getUserByEmail(input.email)
      } catch (error) {
        handleServiceError(error)
      }
    }),

  getAll: publicProcedure
    .input(getUsersSchema)
    .query(async ({ input }) => {
      try {
        const { page, limit, ...filters } = input
        return await userService.getUsers({ page, limit }, filters)
      } catch (error) {
        handleServiceError(error)
      }
    }),

  update: publicProcedure
    .input(updateUserSchema)
    .mutation(async ({ input }) => {
      try {
        const { id, ...data } = input
        return await userService.updateUser(id, data)
      } catch (error) {
        handleServiceError(error)
      }
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ input }) => {
      try {
        await userService.deleteUser(input.id)
        return { success: true }
      } catch (error) {
        handleServiceError(error)
      }
    }),

  toggleStatus: publicProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ input }) => {
      try {
        return await userService.toggleUserStatus(input.id)
      } catch (error) {
        handleServiceError(error)
      }
    }),

  updatePassword: publicProcedure
    .input(z.object({
      id: z.string().cuid(),
      newPassword: z.string().min(6)
    }))
    .mutation(async ({ input }) => {
      try {
        await userService.updatePassword(input.id, input.newPassword)
        return { success: true }
      } catch (error) {
        handleServiceError(error)
      }
    }),

  verifyPassword: publicProcedure
    .input(z.object({
      email: z.string().email(),
      password: z.string()
    }))
    .query(async ({ input }) => {
      try {
        return await userService.verifyPassword(input.email, input.password)
      } catch (error) {
        handleServiceError(error)
      }
    }),

  getStats: publicProcedure
    .query(async () => {
      try {
        return await userService.getUserStats()
      } catch (error) {
        handleServiceError(error)
      }
    }),

  // Authentication endpoints
  login: publicProcedure
    .input(loginSchema)
    .mutation(async ({ input }) => {
      try {
        const user = await userService.getUserByEmail(input.email)
        if (!user) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Invalid email or password'
          })
        }

        const isValid = await userService.verifyPassword(input.email, input.password)
        if (!isValid) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Invalid email or password'
          })
        }

        // Update last login
        await userService.updateUser(user.id, {
          last_login_at: new Date()
        })

        return {
          user: {
            id: user.id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            role: user.role
          },
          success: true
        }
      } catch (error) {
        handleServiceError(error)
      }
    }),

  register: publicProcedure
    .input(registerSchema)
    .mutation(async ({ input }) => {
      try {
        // Check if user already exists
        const existingUser = await userService.getUserByEmail(input.email)
        if (existingUser) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'An account with this email already exists'
          })
        }

        // Create new user
        const newUser = await userService.createUser({
          email: input.email,
          first_name: input.firstName,
          last_name: input.lastName,
          phone_number: input.phone,
          password: input.password,
          role: UserRole.CUSTOMER,
          status: UserStatus.ACTIVE
        })

        return {
          user: {
            id: newUser.id,
            email: newUser.email,
            first_name: newUser.first_name,
            last_name: newUser.last_name,
            role: newUser.role
          },
          success: true
        }
      } catch (error) {
        handleServiceError(error)
      }
    }),

  getCurrentUser: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .query(async ({ input }) => {
      try {
        const user = await userService.getUserByEmail(input.email)
        if (!user) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          role: user.role,
          status: user.status
        }
      } catch (error) {
        handleServiceError(error)
      }
    })
})
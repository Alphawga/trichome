import { z } from 'zod'
import { UserRole, UserStatus } from '@prisma/client'

export const createUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  first_name: z.string().min(1, 'First name is required').max(50),
  last_name: z.string().min(1, 'Last name is required').max(50),
  phone: z.string().optional(),
  role: z.nativeEnum(UserRole).default(UserRole.CUSTOMER),
})

export const updateUserSchema = z.object({
  id: z.string().cuid(),
  email: z.string().email().optional(),
  first_name: z.string().min(1).max(50).optional(),
  last_name: z.string().min(1).max(50).optional(),
  phone: z.string().optional(),
  status: z.nativeEnum(UserStatus).optional(),
})

export const getUserSchema = z.object({
  id: z.string().cuid(),
})

export const getUsersSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  role: z.nativeEnum(UserRole).optional(),
  status: z.nativeEnum(UserStatus).optional(),
  search: z.string().optional(),
})

export type CreateUserInput = z.infer<typeof createUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
export type GetUserInput = z.infer<typeof getUserSchema>
export type GetUsersInput = z.infer<typeof getUsersSchema>
import { z } from 'zod'
import { createTRPCRouter, publicProcedure, protectedProcedure } from '../trpc'
import { userService } from '../services'
import { handleServiceError } from '../error-handler'
import {
  createUserSchema,
  updateUserSchema,
  getUserSchema,
  getUsersSchema,
} from '../../lib/validations/user'

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
    .input(getUserSchema)
    .query(async ({ input }) => {
      try {
        return await userService.getUserById(input.id)
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

  getAll: protectedProcedure
    .input(getUsersSchema)
    .query(async ({ input }) => {
      try {
        return await userService.getUsers(input)
      } catch (error) {
        handleServiceError(error)
      }
    }),

  update: protectedProcedure
    .input(updateUserSchema)
    .mutation(async ({ input }) => {
      try {
        const { id, ...data } = input
        return await userService.updateUser(id, data)
      } catch (error) {
        handleServiceError(error)
      }
    }),

  block: protectedProcedure
    .input(z.object({
      id: z.string().cuid(),
      reason: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      try {
        return await userService.blockUser(input.id, input.reason)
      } catch (error) {
        handleServiceError(error)
      }
    }),

  unblock: protectedProcedure
    .input(getUserSchema)
    .mutation(async ({ input }) => {
      try {
        return await userService.unblockUser(input.id)
      } catch (error) {
        handleServiceError(error)
      }
    }),

  verifyEmail: protectedProcedure
    .input(getUserSchema)
    .mutation(async ({ input }) => {
      try {
        return await userService.verifyEmail(input.id)
      } catch (error) {
        handleServiceError(error)
      }
    }),

  verifyPhone: protectedProcedure
    .input(getUserSchema)
    .mutation(async ({ input }) => {
      try {
        return await userService.verifyPhone(input.id)
      } catch (error) {
        handleServiceError(error)
      }
    }),

  grantPermission: protectedProcedure
    .input(z.object({
      userId: z.string().cuid(),
      permission: z.string().min(1),
      grantedBy: z.string().cuid().optional(),
    }))
    .mutation(async ({ input }) => {
      try {
        return await userService.grantPermission(input.userId, input.permission, input.grantedBy)
      } catch (error) {
        handleServiceError(error)
      }
    }),

  revokePermission: protectedProcedure
    .input(z.object({
      userId: z.string().cuid(),
      permission: z.string().min(1),
    }))
    .mutation(async ({ input }) => {
      try {
        return await userService.revokePermission(input.userId, input.permission)
      } catch (error) {
        handleServiceError(error)
      }
    }),

  delete: protectedProcedure
    .input(getUserSchema)
    .mutation(async ({ input }) => {
      try {
        return await userService.deleteUser(input.id)
      } catch (error) {
        handleServiceError(error)
      }
    }),

  getStats: protectedProcedure
    .input(getUserSchema)
    .query(async ({ input }) => {
      try {
        return await userService.getUserStats(input.id)
      } catch (error) {
        handleServiceError(error)
      }
    }),
})
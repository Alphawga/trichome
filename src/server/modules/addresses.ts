import { protectedProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'
import {
  idSchema,
  createAddressSchema,
  updateAddressSchema,
} from '@/lib/dto'


export const getAddresses = protectedProcedure.query(async ({ ctx }) => {
  const addresses = await ctx.prisma.address.findMany({
    where: { user_id: ctx.user.id },
    orderBy: [{ is_default: 'desc' }, { created_at: 'desc' }],
  })

  return addresses
})


export const getAddressById = protectedProcedure
  .input(idSchema)
  .query(async ({ input, ctx }) => {
    const address = await ctx.prisma.address.findUnique({
      where: { id: input.id },
    })

    if (!address || address.user_id !== ctx.user.id) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Address not found' })
    }

    return address
  })


export const createAddress = protectedProcedure
  .input(createAddressSchema)
  .mutation(async ({ input, ctx }) => {

    if (input.is_default) {
      await ctx.prisma.address.updateMany({
        where: { user_id: ctx.user.id, is_default: true },
        data: { is_default: false },
      })
    }

    const address = await ctx.prisma.address.create({
      data: {
        ...input,
        user_id: ctx.user.id,
      },
    })

    return { address, message: 'Address created successfully' }
  })

// Update address
export const updateAddress = protectedProcedure
  .input(updateAddressSchema)
  .mutation(async ({ input, ctx }) => {
    const { id, ...data } = input

    const existingAddress = await ctx.prisma.address.findUnique({
      where: { id },
    })

    if (!existingAddress || existingAddress.user_id !== ctx.user.id) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Address not found' })
    }

    // If setting as default, unset other default addresses
    if (data.is_default) {
      await ctx.prisma.address.updateMany({
        where: { user_id: ctx.user.id, is_default: true, id: { not: id } },
        data: { is_default: false },
      })
    }

    const address = await ctx.prisma.address.update({
      where: { id },
      data,
    })

    return { address, message: 'Address updated successfully' }
  })

// Delete address
export const deleteAddress = protectedProcedure
  .input(idSchema)
  .mutation(async ({ input, ctx }) => {
    const address = await ctx.prisma.address.findUnique({
      where: { id: input.id },
    })

    if (!address || address.user_id !== ctx.user.id) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Address not found' })
    }

    await ctx.prisma.address.delete({
      where: { id: input.id },
    })

    return { message: 'Address deleted successfully' }
  })

// Set default address
export const setDefaultAddress = protectedProcedure
  .input(idSchema)
  .mutation(async ({ input, ctx }) => {
    const address = await ctx.prisma.address.findUnique({
      where: { id: input.id },
    })

    if (!address || address.user_id !== ctx.user.id) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Address not found' })
    }

    // Unset all default addresses
    await ctx.prisma.address.updateMany({
      where: { user_id: ctx.user.id, is_default: true },
      data: { is_default: false },
    })

    // Set new default
    const updatedAddress = await ctx.prisma.address.update({
      where: { id: input.id },
      data: { is_default: true },
    })

    return { address: updatedAddress, message: 'Default address updated' }
  })

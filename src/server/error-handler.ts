import { TRPCError } from '@trpc/server'
import { ServiceError } from '../lib/errors/service-error'

export function handleServiceError(error: unknown): never {
  if (error instanceof ServiceError) {
    const trpcCode = {
      NOT_FOUND: 'NOT_FOUND',
      ALREADY_EXISTS: 'CONFLICT',
      VALIDATION_ERROR: 'BAD_REQUEST',
      UNAUTHORIZED: 'UNAUTHORIZED',
      FORBIDDEN: 'FORBIDDEN',
      INSUFFICIENT_STOCK: 'BAD_REQUEST',
      PAYMENT_FAILED: 'BAD_REQUEST',
      INTERNAL_ERROR: 'INTERNAL_SERVER_ERROR',
      EXTERNAL_SERVICE_ERROR: 'INTERNAL_SERVER_ERROR',
      RATE_LIMITED: 'TOO_MANY_REQUESTS',
    }[error.code] as any

    throw new TRPCError({
      code: trpcCode || 'INTERNAL_SERVER_ERROR',
      message: error.message,
      cause: error,
    })
  }

  // Log unexpected errors
  console.error('Unexpected error in tRPC handler:', error)

  throw new TRPCError({
    code: 'INTERNAL_SERVER_ERROR',
    message: 'An unexpected error occurred',
  })
}

// Wrapper for tRPC procedures that automatically handles service errors
export function withServiceErrorHandling<T extends (...args: any[]) => Promise<any>>(
  serviceCall: T
): T {
  return (async (...args: any[]) => {
    try {
      return await serviceCall(...args)
    } catch (error) {
      handleServiceError(error)
    }
  }) as T
}
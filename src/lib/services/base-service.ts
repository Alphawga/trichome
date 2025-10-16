import { PrismaClient } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/utils/logger'
import { formatCurrency, generateUniqueCode, formatDate } from '@/lib/utils/common'

export class ServiceError extends Error {
  public code: string
  public statusCode: number
  public details?: unknown

  constructor(
    message: string,
    code: string = 'UNKNOWN_ERROR',
    statusCode: number = 500,
    details?: unknown
  ) {
    super(message)
    this.name = 'ServiceError'
    this.code = code
    this.statusCode = statusCode
    this.details = details
  }
}

export interface ServiceResult<T> {
  success: boolean
  data?: T
  error?: ServiceError
}

export interface PaginationParams {
  page: number
  limit: number
}

export interface PaginatedResult<T> {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export abstract class BaseService {
  protected db: PrismaClient
  protected logger: ReturnType<typeof logger.service>

  constructor(serviceName: string) {
    this.db = prisma
    this.logger = logger.service(serviceName)
  }

  protected async executeWithTransaction<T>(
    operation: (tx: PrismaClient) => Promise<T>
  ): Promise<T> {
    return await this.db.$transaction(operation)
  }

  protected createError(
    message: string,
    code: string,
    statusCode: number = 400,
    details?: unknown
  ): ServiceError {
    this.logger.error(message, undefined, { code, details, statusCode })
    return new ServiceError(message, code, statusCode, details)
  }

  protected createPaginatedResult<T>(
    items: T[],
    total: number,
    page: number,
    limit: number
  ): PaginatedResult<T> {
    const totalPages = Math.ceil(total / limit)

    return {
      items,
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  }

  protected validatePagination(page: number, limit: number): void {
    if (page < 1) {
      throw this.createError('Page number must be greater than 0', 'INVALID_PAGE')
    }

    if (limit < 1 || limit > 100) {
      throw this.createError('Limit must be between 1 and 100', 'INVALID_LIMIT')
    }
  }

  protected async handleServiceOperation<T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<ServiceResult<T>> {
    try {
      this.logger.info(`Starting ${operationName}`)
      const result = await operation()
      this.logger.info(`Successfully completed ${operationName}`)

      return {
        success: true,
        data: result
      }
    } catch (error) {
      if (error instanceof ServiceError) {
        return {
          success: false,
          error
        }
      }

      const serviceError = this.createError(
        `Failed to ${operationName}`,
        'OPERATION_FAILED',
        500,
        error
      )

      return {
        success: false,
        error: serviceError
      }
    }
  }

  // Re-export utility functions for backward compatibility
  protected formatCurrency = formatCurrency
  protected generateUniqueCode = generateUniqueCode
  protected formatDate = formatDate
}
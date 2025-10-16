import { PrismaClient } from '@prisma/client'
import { ServiceError } from '../../lib/errors/service-error'
import { logger } from '../../lib/utils/logger'

export abstract class BaseService {
  protected prisma: PrismaClient
  protected serviceName: string
  protected logger: ReturnType<typeof logger.service>

  constructor(prisma: PrismaClient, serviceName: string) {
    this.prisma = prisma
    this.serviceName = serviceName
    this.logger = logger.service(serviceName)
  }

  protected async executeWithLogging<T>(
    operation: string,
    fn: () => Promise<T>,
    context?: Record<string, unknown>
  ): Promise<T> {
    const startTime = Date.now()
    const logContext = { operation, ...context }

    try {
      this.logger.debug(`Starting ${operation}`, logContext)
      const result = await fn()
      const duration = Date.now() - startTime
      this.logger.info(`Completed ${operation}`, { ...logContext, duration })
      return result
    } catch (error) {
      const duration = Date.now() - startTime
      this.logger.error(
        `Failed ${operation}`,
        error instanceof Error ? error : new Error(String(error)),
        { ...logContext, duration }
      )
      throw error
    }
  }

  protected async findByIdOrThrow<T>(
    model: string,
    id: string,
    findFn: () => Promise<T | null>
  ): Promise<T> {
    const result = await findFn()
    if (!result) {
      throw ServiceError.notFound(`${model} with ID ${id} not found`)
    }
    return result
  }

  protected async ensureUnique<T>(
    model: string,
    field: string,
    value: string,
    findFn: () => Promise<T | null>
  ): Promise<void> {
    const existing = await findFn()
    if (existing) {
      throw ServiceError.alreadyExists(
        `${model} with ${field} '${value}' already exists`
      )
    }
  }

  protected validatePagination(page: number, limit: number) {
    if (page < 1) {
      throw ServiceError.validationError('Page must be greater than 0')
    }
    if (limit < 1 || limit > 100) {
      throw ServiceError.validationError('Limit must be between 1 and 100')
    }
  }

  protected calculatePagination(page: number, limit: number) {
    this.validatePagination(page, limit)
    return {
      skip: (page - 1) * limit,
      take: limit,
    }
  }

  protected async getPaginatedResults<T>(
    page: number,
    limit: number,
    findManyFn: (skip: number, take: number) => Promise<T[]>,
    countFn: () => Promise<number>
  ) {
    const { skip, take } = this.calculatePagination(page, limit)

    const [items, total] = await Promise.all([
      findManyFn(skip, take),
      countFn(),
    ])

    return {
      items,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    }
  }

  protected async transaction<T>(fn: (tx: PrismaClient) => Promise<T>): Promise<T> {
    return this.executeWithLogging(
      'transaction',
      () => this.prisma.$transaction(fn)
    )
  }
}
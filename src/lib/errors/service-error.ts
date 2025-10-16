export enum ServiceErrorCode {
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
  INSUFFICIENT_STOCK = 'INSUFFICIENT_STOCK',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  RATE_LIMITED = 'RATE_LIMITED',
}

export class ServiceError extends Error {
  public readonly code: ServiceErrorCode
  public readonly statusCode: number
  public readonly details?: Record<string, unknown>

  constructor(
    code: ServiceErrorCode,
    message: string,
    statusCode: number = 500,
    details?: Record<string, unknown>
  ) {
    super(message)
    this.name = 'ServiceError'
    this.code = code
    this.statusCode = statusCode
    this.details = details

    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ServiceError)
    }
  }

  static notFound(message: string, details?: Record<string, unknown>) {
    return new ServiceError(ServiceErrorCode.NOT_FOUND, message, 404, details)
  }

  static alreadyExists(message: string, details?: Record<string, unknown>) {
    return new ServiceError(ServiceErrorCode.ALREADY_EXISTS, message, 409, details)
  }

  static validationError(message: string, details?: Record<string, unknown>) {
    return new ServiceError(ServiceErrorCode.VALIDATION_ERROR, message, 400, details)
  }

  static unauthorized(message: string = 'Unauthorized', details?: Record<string, unknown>) {
    return new ServiceError(ServiceErrorCode.UNAUTHORIZED, message, 401, details)
  }

  static forbidden(message: string = 'Forbidden', details?: Record<string, unknown>) {
    return new ServiceError(ServiceErrorCode.FORBIDDEN, message, 403, details)
  }

  static internal(message: string, details?: Record<string, unknown>) {
    return new ServiceError(ServiceErrorCode.INTERNAL_ERROR, message, 500, details)
  }

  static insufficientStock(message: string, details?: Record<string, unknown>) {
    return new ServiceError(ServiceErrorCode.INSUFFICIENT_STOCK, message, 400, details)
  }

  static paymentFailed(message: string, details?: Record<string, unknown>) {
    return new ServiceError(ServiceErrorCode.PAYMENT_FAILED, message, 402, details)
  }
}
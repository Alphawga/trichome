type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogContext {
  userId?: string
  requestId?: string
  service?: string
  action?: string
  [key: string]: unknown
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'

  private formatMessage(level: LogLevel, message: string, context?: LogContext) {
    const timestamp = new Date().toISOString()
    const contextStr = context ? ` | ${JSON.stringify(context)}` : ''
    return `[${timestamp}] ${level.toUpperCase()}: ${message}${contextStr}`
  }

  debug(message: string, context?: LogContext) {
    if (this.isDevelopment) {
      console.debug(this.formatMessage('debug', message, context))
    }
  }

  info(message: string, context?: LogContext) {
    console.info(this.formatMessage('info', message, context))
  }

  warn(message: string, context?: LogContext) {
    console.warn(this.formatMessage('warn', message, context))
  }

  error(message: string, error?: Error, context?: LogContext) {
    const errorContext = {
      ...context,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : undefined,
    }
    console.error(this.formatMessage('error', message, errorContext))
  }

  // Service-specific loggers
  service(serviceName: string) {
    return {
      debug: (message: string, context?: LogContext) =>
        this.debug(message, { ...context, service: serviceName }),
      info: (message: string, context?: LogContext) =>
        this.info(message, { ...context, service: serviceName }),
      warn: (message: string, context?: LogContext) =>
        this.warn(message, { ...context, service: serviceName }),
      error: (message: string, error?: Error, context?: LogContext) =>
        this.error(message, error, { ...context, service: serviceName }),
    }
  }
}

export const logger = new Logger()

// Service loggers
export const userLogger = logger.service('UserService')
export const productLogger = logger.service('ProductService')
export const orderLogger = logger.service('OrderService')
export const paymentLogger = logger.service('PaymentService')
export const notificationLogger = logger.service('NotificationService')
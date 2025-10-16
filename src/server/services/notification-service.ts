import { BaseService } from './base-service'
import { ServiceError } from '../../lib/errors/service-error'
import { PrismaClient, OrderStatus } from '@prisma/client'

interface EmailTemplate {
  subject: string
  html: string
  text: string
}

interface SMSTemplate {
  message: string
}

interface NotificationConfig {
  emailEnabled: boolean
  smsEnabled: boolean
  whatsappEnabled: boolean
  emailProvider?: 'sendgrid' | 'mailgun' | 'smtp'
  smsProvider?: 'twilio' | 'termii' | 'sms.to'
}

export class NotificationService extends BaseService {
  private config: NotificationConfig

  constructor(prisma: PrismaClient, config?: Partial<NotificationConfig>) {
    super(prisma, 'NotificationService')
    this.config = {
      emailEnabled: process.env.EMAIL_ENABLED === 'true',
      smsEnabled: process.env.SMS_ENABLED === 'true',
      whatsappEnabled: process.env.WHATSAPP_ENABLED === 'true',
      emailProvider: (process.env.EMAIL_PROVIDER as any) || 'smtp',
      smsProvider: (process.env.SMS_PROVIDER as any) || 'termii',
      ...config,
    }
  }

  // Email Templates
  private getWelcomeEmailTemplate(firstName: string): EmailTemplate {
    return {
      subject: 'Welcome to Trichomes - Your Account is Ready!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #22c55e;">Welcome to Trichomes, ${firstName}!</h2>
          <p>Thank you for joining our community of skincare enthusiasts.</p>
          <p>Your account has been created successfully. You can now:</p>
          <ul>
            <li>Browse our revolutionary cosmeceutical products</li>
            <li>Save your favorite items to your wishlist</li>
            <li>Track your orders in real-time</li>
            <li>Enjoy exclusive member benefits</li>
          </ul>
          <div style="margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/login"
               style="background: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
              Start Shopping
            </a>
          </div>
          <p>Best regards,<br>The Trichomes Team</p>
        </div>
      `,
      text: `Welcome to Trichomes, ${firstName}! Your account is ready. Start shopping at ${process.env.NEXT_PUBLIC_APP_URL}/login`,
    }
  }

  private getOrderConfirmationTemplate(order: any): EmailTemplate {
    const itemsHtml = order.items.map((item: any) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.product_name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₦${item.price.toLocaleString()}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₦${item.total.toLocaleString()}</td>
      </tr>
    `).join('')

    return {
      subject: `Order Confirmation - ${order.order_number}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #22c55e;">Order Confirmed!</h2>
          <p>Hi ${order.first_name},</p>
          <p>Thank you for your order. We've received it and will process it shortly.</p>

          <div style="background: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 6px;">
            <h3>Order Details</h3>
            <p><strong>Order Number:</strong> ${order.order_number}</p>
            <p><strong>Order Date:</strong> ${new Date(order.created_at).toLocaleDateString()}</p>
            <p><strong>Status:</strong> ${order.status}</p>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
              <tr style="background: #f8f9fa;">
                <th style="padding: 10px; text-align: left;">Product</th>
                <th style="padding: 10px; text-align: center;">Qty</th>
                <th style="padding: 10px; text-align: right;">Price</th>
                <th style="padding: 10px; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div style="text-align: right; margin: 20px 0;">
            <p><strong>Subtotal: ₦${order.subtotal.toLocaleString()}</strong></p>
            <p><strong>Shipping: ₦${order.shipping_cost.toLocaleString()}</strong></p>
            <p><strong>Tax: ₦${order.tax.toLocaleString()}</strong></p>
            <h3 style="color: #22c55e;">Total: ₦${order.total.toLocaleString()}</h3>
          </div>

          <div style="margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/orders/${order.order_number}"
               style="background: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
              Track Your Order
            </a>
          </div>

          <p>Best regards,<br>The Trichomes Team</p>
        </div>
      `,
      text: `Order ${order.order_number} confirmed! Total: ₦${order.total.toLocaleString()}. Track at ${process.env.NEXT_PUBLIC_APP_URL}/orders/${order.order_number}`,
    }
  }

  private getOrderStatusUpdateTemplate(order: any, newStatus: OrderStatus): EmailTemplate {
    const statusMessages = {
      [OrderStatus.CONFIRMED]: 'Your order has been confirmed and is being prepared.',
      [OrderStatus.PROCESSING]: 'Your order is currently being processed.',
      [OrderStatus.SHIPPED]: `Your order has been shipped! ${order.tracking_number ? `Tracking number: ${order.tracking_number}` : ''}`,
      [OrderStatus.DELIVERED]: 'Your order has been delivered! We hope you love your products.',
      [OrderStatus.CANCELLED]: 'Your order has been cancelled. If you have any questions, please contact us.',
      [OrderStatus.RETURNED]: 'Your return has been processed.',
      [OrderStatus.REFUNDED]: 'Your refund has been processed.',
      [OrderStatus.PENDING]: 'Your order is pending confirmation.',
    }

    return {
      subject: `Order Update - ${order.order_number} is ${newStatus}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #22c55e;">Order Status Update</h2>
          <p>Hi ${order.first_name},</p>
          <p>${statusMessages[newStatus]}</p>

          <div style="background: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 6px;">
            <p><strong>Order Number:</strong> ${order.order_number}</p>
            <p><strong>Status:</strong> ${newStatus}</p>
            ${order.tracking_number ? `<p><strong>Tracking Number:</strong> ${order.tracking_number}</p>` : ''}
          </div>

          <div style="margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/orders/${order.order_number}"
               style="background: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
              View Order Details
            </a>
          </div>

          <p>Best regards,<br>The Trichomes Team</p>
        </div>
      `,
      text: `Order ${order.order_number} status: ${newStatus}. ${statusMessages[newStatus]} View details: ${process.env.NEXT_PUBLIC_APP_URL}/orders/${order.order_number}`,
    }
  }

  // SMS Templates
  private getOrderConfirmationSMS(order: any): SMSTemplate {
    return {
      message: `Trichomes: Order ${order.order_number} confirmed! Total: ₦${order.total.toLocaleString()}. Track: ${process.env.NEXT_PUBLIC_APP_URL}/orders/${order.order_number}`,
    }
  }

  private getOrderStatusSMS(order: any, newStatus: OrderStatus): SMSTemplate {
    const messages = {
      [OrderStatus.SHIPPED]: `Trichomes: Order ${order.order_number} shipped! ${order.tracking_number ? `Tracking: ${order.tracking_number}` : ''}`,
      [OrderStatus.DELIVERED]: `Trichomes: Order ${order.order_number} delivered! Thank you for shopping with us.`,
      [OrderStatus.CANCELLED]: `Trichomes: Order ${order.order_number} cancelled. Contact support if needed.`,
    }

    return {
      message: messages[newStatus] || `Trichomes: Order ${order.order_number} status: ${newStatus}`,
    }
  }

  // Email sending methods
  private async sendEmail(to: string, template: EmailTemplate): Promise<boolean> {
    if (!this.config.emailEnabled) {
      this.logger.info('Email sending disabled', { to, subject: template.subject })
      return false
    }

    try {
      // TODO: Implement actual email sending based on provider
      switch (this.config.emailProvider) {
        case 'sendgrid':
          return this.sendEmailViaSendGrid(to, template)
        case 'mailgun':
          return this.sendEmailViaMailgun(to, template)
        case 'smtp':
        default:
          return this.sendEmailViaSMTP(to, template)
      }
    } catch (error) {
      this.logger.error('Failed to send email', error as Error, { to, subject: template.subject })
      return false
    }
  }

  private async sendEmailViaSMTP(to: string, template: EmailTemplate): Promise<boolean> {
    // TODO: Implement SMTP email sending
    this.logger.info('SMTP email sending not implemented', { to, subject: template.subject })
    return true // Mock success for now
  }

  private async sendEmailViaSendGrid(to: string, template: EmailTemplate): Promise<boolean> {
    // TODO: Implement SendGrid email sending
    this.logger.info('SendGrid email sending not implemented', { to, subject: template.subject })
    return true // Mock success for now
  }

  private async sendEmailViaMailgun(to: string, template: EmailTemplate): Promise<boolean> {
    // TODO: Implement Mailgun email sending
    this.logger.info('Mailgun email sending not implemented', { to, subject: template.subject })
    return true // Mock success for now
  }

  // SMS sending methods
  private async sendSMS(to: string, template: SMSTemplate): Promise<boolean> {
    if (!this.config.smsEnabled || !to) {
      this.logger.info('SMS sending disabled or no phone number', { to, message: template.message })
      return false
    }

    try {
      // TODO: Implement actual SMS sending based on provider
      switch (this.config.smsProvider) {
        case 'twilio':
          return this.sendSMSViaTwilio(to, template)
        case 'termii':
          return this.sendSMSViaTermii(to, template)
        case 'sms.to':
        default:
          return this.sendSMSViaSMSTo(to, template)
      }
    } catch (error) {
      this.logger.error('Failed to send SMS', error as Error, { to, message: template.message })
      return false
    }
  }

  private async sendSMSViaTermii(to: string, template: SMSTemplate): Promise<boolean> {
    // TODO: Implement Termii SMS sending
    this.logger.info('Termii SMS sending not implemented', { to, message: template.message })
    return true // Mock success for now
  }

  private async sendSMSViaTwilio(to: string, template: SMSTemplate): Promise<boolean> {
    // TODO: Implement Twilio SMS sending
    this.logger.info('Twilio SMS sending not implemented', { to, message: template.message })
    return true // Mock success for now
  }

  private async sendSMSViaSMSTo(to: string, template: SMSTemplate): Promise<boolean> {
    // TODO: Implement SMS.to sending
    this.logger.info('SMS.to sending not implemented', { to, message: template.message })
    return true // Mock success for now
  }

  // Public notification methods
  async sendWelcomeEmail(email: string, firstName: string): Promise<boolean> {
    return this.executeWithLogging(
      'sendWelcomeEmail',
      async () => {
        const template = this.getWelcomeEmailTemplate(firstName)
        return this.sendEmail(email, template)
      },
      { email, firstName }
    )
  }

  async sendOrderConfirmation(order: any): Promise<{ emailSent: boolean; smsSent: boolean }> {
    return this.executeWithLogging(
      'sendOrderConfirmation',
      async () => {
        const emailTemplate = this.getOrderConfirmationTemplate(order)
        const smsTemplate = this.getOrderConfirmationSMS(order)

        const [emailSent, smsSent] = await Promise.all([
          this.sendEmail(order.email, emailTemplate),
          this.sendSMS(order.phone, smsTemplate),
        ])

        return { emailSent, smsSent }
      },
      { orderId: order.id, orderNumber: order.order_number }
    )
  }

  async sendOrderStatusUpdate(order: any, newStatus: OrderStatus): Promise<{ emailSent: boolean; smsSent: boolean }> {
    return this.executeWithLogging(
      'sendOrderStatusUpdate',
      async () => {
        const emailTemplate = this.getOrderStatusUpdateTemplate(order, newStatus)
        const smsTemplate = this.getOrderStatusSMS(order, newStatus)

        const [emailSent, smsSent] = await Promise.all([
          this.sendEmail(order.email, emailTemplate),
          // Only send SMS for important status updates
          [OrderStatus.SHIPPED, OrderStatus.DELIVERED, OrderStatus.CANCELLED].includes(newStatus)
            ? this.sendSMS(order.phone, smsTemplate)
            : Promise.resolve(false),
        ])

        return { emailSent, smsSent }
      },
      { orderId: order.id, newStatus }
    )
  }

  async sendLowStockAlert(products: Array<{ name: string; currentStock: number; threshold: number }>, adminEmails: string[]): Promise<boolean> {
    return this.executeWithLogging(
      'sendLowStockAlert',
      async () => {
        const productList = products.map(p => `${p.name}: ${p.currentStock} (threshold: ${p.threshold})`).join('\n')

        const template: EmailTemplate = {
          subject: `Low Stock Alert - ${products.length} Products Need Attention`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #ef4444;">Low Stock Alert</h2>
              <p>The following products are running low on stock:</p>
              <ul>
                ${products.map(p => `<li><strong>${p.name}</strong>: ${p.currentStock} remaining (threshold: ${p.threshold})</li>`).join('')}
              </ul>
              <p>Please restock these items as soon as possible.</p>
              <div style="margin: 30px 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/products"
                   style="background: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
                  Manage Inventory
                </a>
              </div>
            </div>
          `,
          text: `Low Stock Alert: ${productList}`,
        }

        const results = await Promise.all(
          adminEmails.map(email => this.sendEmail(email, template))
        )

        return results.some(result => result)
      },
      { productCount: products.length, adminCount: adminEmails.length }
    )
  }
}
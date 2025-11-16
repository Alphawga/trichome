/**
 * Email Service
 *
 * Centralized email service for sending transactional emails.
 * Currently logs emails for development. In production, integrate with an email service provider.
 *
 * Supported providers (to be configured):
 * - SendGrid
 * - AWS SES
 * - Resend
 * - Nodemailer (SMTP)
 *
 * TODO: Configure email service provider in production
 */

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
  cc?: string | string[];
  bcc?: string | string[];
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Base email service interface
 */
export interface EmailService {
  send(options: EmailOptions): Promise<EmailResult>;
}

/**
 * Development email service (logs emails to console)
 */
class DevelopmentEmailService implements EmailService {
  async send(options: EmailOptions): Promise<EmailResult> {
    const recipients = Array.isArray(options.to)
      ? options.to.join(", ")
      : options.to;

    console.log("=".repeat(80));
    console.log("📧 EMAIL NOTIFICATION");
    console.log("=".repeat(80));
    console.log("To:", recipients);
    console.log("Subject:", options.subject);
    if (options.from) console.log("From:", options.from);
    if (options.replyTo) console.log("Reply-To:", options.replyTo);
    if (options.cc)
      console.log(
        "CC:",
        Array.isArray(options.cc) ? options.cc.join(", ") : options.cc,
      );
    if (options.bcc)
      console.log(
        "BCC:",
        Array.isArray(options.bcc) ? options.bcc.join(", ") : options.bcc,
      );
    console.log("=".repeat(80));
    console.log("\n📄 HTML Content:");
    console.log(options.html);
    if (options.text) {
      console.log("\n📄 Text Content:");
      console.log(options.text);
    }
    console.log("=".repeat(80));
    console.log("");

    // Simulate email sending
    await new Promise((resolve) => setTimeout(resolve, 100));

    return {
      success: true,
      messageId: `dev-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
  }
}

/**
 * Production email service (to be implemented with actual provider)
 */
class ProductionEmailService implements EmailService {
  async send(options: EmailOptions): Promise<EmailResult> {
    // TODO: Implement actual email service integration
    // Example with Resend:
    // const resend = new Resend(process.env.RESEND_API_KEY);
    // const result = await resend.emails.send({
    //   from: options.from || process.env.EMAIL_FROM,
    //   to: options.to,
    //   subject: options.subject,
    //   html: options.html,
    //   text: options.text,
    // });
    // return { success: true, messageId: result.id };

    // Example with SendGrid:
    // const sgMail = require('@sendgrid/mail');
    // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    // const msg = {
    //   to: options.to,
    //   from: options.from || process.env.EMAIL_FROM,
    //   subject: options.subject,
    //   html: options.html,
    //   text: options.text,
    // };
    // const result = await sgMail.send(msg);
    // return { success: true, messageId: result[0].headers['x-message-id'] };

    // For now, fallback to development mode
    const devService = new DevelopmentEmailService();
    return devService.send(options);
  }
}

/**
 * Get email service instance based on environment
 */
function getEmailService(): EmailService {
  const isProduction = process.env.NODE_ENV === "production";
  const hasEmailProvider = !!(
    process.env.RESEND_API_KEY ||
    process.env.SENDGRID_API_KEY ||
    process.env.AWS_SES_REGION ||
    process.env.SMTP_HOST
  );

  if (isProduction && hasEmailProvider) {
    return new ProductionEmailService();
  }

  return new DevelopmentEmailService();
}

/**
 * Send email using the configured email service
 */
export async function sendEmail(options: EmailOptions): Promise<EmailResult> {
  const emailService = getEmailService();

  try {
    // Set default from address if not provided
    const emailOptions: EmailOptions = {
      ...options,
      from: options.from || process.env.EMAIL_FROM || "noreply@trichomes.com",
    };

    return await emailService.send(emailOptions);
  } catch (error) {
    console.error("Email sending error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Send email to multiple recipients
 */
export async function sendBulkEmail(
  recipients: string[],
  subject: string,
  html: string,
  text?: string,
): Promise<EmailResult[]> {
  const results: EmailResult[] = [];

  for (const recipient of recipients) {
    const result = await sendEmail({
      to: recipient,
      subject,
      html,
      text,
    });
    results.push(result);
  }

  return results;
}

/**
 * Validate email address
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

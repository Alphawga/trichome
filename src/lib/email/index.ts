/**
 * Email Service - Centralized Email Utilities
 *
 * Export all email-related functions and types
 */

export type { EmailOptions, EmailResult } from "./email-service";
// Email service
export { isValidEmail, sendBulkEmail, sendEmail } from "./email-service";
export type { PasswordResetEmailData } from "./password-reset";
// Password reset email
export {
  generatePasswordResetEmail,
  sendPasswordResetEmail,
} from "./password-reset";
export type { OrderConfirmationEmailData } from "./templates/order-confirmation";
// Order confirmation email
export { generateOrderConfirmationEmail } from "./templates/order-confirmation";
export type { PaymentConfirmationEmailData } from "./templates/payment-confirmation";
// Payment confirmation email
export { generatePaymentConfirmationEmail } from "./templates/payment-confirmation";
export type { ShippingUpdateEmailData } from "./templates/shipping-update";
// Shipping update email
export { generateShippingUpdateEmail } from "./templates/shipping-update";

/**
 * Helper function to send order confirmation email
 */
export async function sendOrderConfirmationEmail(
  data: import("./templates/order-confirmation").OrderConfirmationEmailData,
): Promise<import("./email-service").EmailResult> {
  const { generateOrderConfirmationEmail } = await import(
    "./templates/order-confirmation"
  );
  const { sendEmail } = await import("./email-service");

  const emailContent = generateOrderConfirmationEmail(data);

  return sendEmail({
    to: data.recipientEmail,
    subject: emailContent.subject,
    html: emailContent.html,
    text: emailContent.text,
  });
}

/**
 * Helper function to send payment confirmation email
 */
export async function sendPaymentConfirmationEmail(
  data: import("./templates/payment-confirmation").PaymentConfirmationEmailData,
): Promise<import("./email-service").EmailResult> {
  const { generatePaymentConfirmationEmail } = await import(
    "./templates/payment-confirmation"
  );
  const { sendEmail } = await import("./email-service");

  const emailContent = generatePaymentConfirmationEmail(data);

  return sendEmail({
    to: data.recipientEmail,
    subject: emailContent.subject,
    html: emailContent.html,
    text: emailContent.text,
  });
}

/**
 * Helper function to send shipping update email
 */
export async function sendShippingUpdateEmail(
  data: import("./templates/shipping-update").ShippingUpdateEmailData,
): Promise<import("./email-service").EmailResult> {
  const { generateShippingUpdateEmail } = await import(
    "./templates/shipping-update"
  );
  const { sendEmail } = await import("./email-service");

  const emailContent = generateShippingUpdateEmail(data);

  return sendEmail({
    to: data.recipientEmail,
    subject: emailContent.subject,
    html: emailContent.html,
    text: emailContent.text,
  });
}

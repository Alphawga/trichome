/**
 * Payment Confirmation Email Template
 */

import { format } from "date-fns";
import {
  generateBaseEmailTemplate,
  generateBaseEmailText,
} from "./base-template";

export interface PaymentConfirmationEmailData {
  recipientName?: string;
  recipientEmail: string;
  orderNumber: string;
  paymentAmount: number;
  paymentMethod: string;
  transactionId?: string;
  paymentDate: Date;
  orderUrl?: string;
}

export function generatePaymentConfirmationEmail(
  data: PaymentConfirmationEmailData,
): { subject: string; html: string; text: string } {
  const {
    recipientName,
    orderNumber,
    paymentAmount,
    paymentMethod,
    transactionId,
    paymentDate,
    orderUrl,
  } = data;

  const subject = `Payment Confirmed - Order #${orderNumber} - Trichomes`;

  const content = `
    <p>Your payment has been successfully processed!</p>
    
    <div style="background-color: #f0f9f0; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #38761d;">
      <h3 style="margin-top: 0; color: #333;">Payment Details</h3>
      <p style="margin: 5px 0;"><strong>Order Number:</strong> ${orderNumber}</p>
      <p style="margin: 5px 0;"><strong>Amount Paid:</strong> ₦${paymentAmount.toLocaleString()}</p>
      <p style="margin: 5px 0;"><strong>Payment Method:</strong> ${paymentMethod}</p>
      <p style="margin: 5px 0;"><strong>Payment Date:</strong> ${format(paymentDate, "MMMM dd, yyyy HH:mm")}</p>
      ${transactionId ? `<p style="margin: 5px 0;"><strong>Transaction ID:</strong> ${transactionId}</p>` : ""}
    </div>

    <p style="color: #666; font-size: 14px; margin-top: 20px;">
      Your order is now being processed. We'll send you an email once your order ships.
    </p>
  `;

  const html = generateBaseEmailTemplate({
    title: "Payment Confirmed",
    greeting: "Hello",
    recipientName,
    content,
    buttonText: orderUrl ? "View Order" : undefined,
    buttonUrl: orderUrl,
    footerText:
      "If you have any questions about your payment, please contact our support team.",
  });

  const textContent = `
Your payment has been successfully processed!

Payment Details:
Order Number: ${orderNumber}
Amount Paid: ₦${paymentAmount.toLocaleString()}
Payment Method: ${paymentMethod}
Payment Date: ${format(paymentDate, "MMMM dd, yyyy HH:mm")}
${transactionId ? `Transaction ID: ${transactionId}` : ""}

Your order is now being processed. We'll send you an email once your order ships.

If you have any questions about your payment, please contact our support team.
${orderUrl ? `\nView your order: ${orderUrl}` : ""}
  `.trim();

  const text = generateBaseEmailText({
    title: "Payment Confirmed",
    greeting: "Hello",
    recipientName,
    content: textContent,
    buttonText: orderUrl ? "View Order" : undefined,
    buttonUrl: orderUrl,
    footerText:
      "If you have any questions about your payment, please contact our support team.",
  });

  return { subject, html, text };
}

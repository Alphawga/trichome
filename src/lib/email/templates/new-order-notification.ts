/**
 * New Order Notification Email Template (admin/staff facing)
 */

import { format } from "date-fns";
import {
  generateBaseEmailTemplate,
  generateBaseEmailText,
} from "./base-template";

export interface NewOrderNotificationEmailData {
  orderNumber: string;
  orderDate: Date;
  customerName: string;
  customerEmail: string;
  total: number;
  itemCount: number;
  orderUrl?: string;
}

export function generateNewOrderNotificationEmail(
  data: NewOrderNotificationEmailData,
): { subject: string; html: string; text: string } {
  const {
    orderNumber,
    orderDate,
    customerName,
    customerEmail,
    total,
    itemCount,
    orderUrl,
  } = data;

  const subject = `New Order #${orderNumber} - ₦${total.toLocaleString()}`;

  const content = `
    <p>A new order has been placed on Trichomes.</p>

    <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
      <p style="margin: 5px 0;"><strong>Order Number:</strong> ${orderNumber}</p>
      <p style="margin: 5px 0;"><strong>Order Date:</strong> ${format(orderDate, "MMMM dd, yyyy 'at' h:mm a")}</p>
      <p style="margin: 5px 0;"><strong>Customer:</strong> ${customerName} (${customerEmail})</p>
      <p style="margin: 5px 0;"><strong>Items:</strong> ${itemCount}</p>
      <p style="margin: 5px 0;"><strong>Total:</strong> ₦${total.toLocaleString()}</p>
    </div>
  `;

  const html = generateBaseEmailTemplate({
    title: "New Order Received",
    greeting: "Hi there",
    content,
    buttonText: orderUrl ? "View Order" : undefined,
    buttonUrl: orderUrl,
    footerText: "This is an internal notification for Trichomes staff.",
  });

  const text = generateBaseEmailText({
    title: "New Order Received",
    greeting: "Hi there",
    content: `A new order has been placed on Trichomes.

Order Number: ${orderNumber}
Order Date: ${format(orderDate, "MMMM dd, yyyy 'at' h:mm a")}
Customer: ${customerName} (${customerEmail})
Items: ${itemCount}
Total: ₦${total.toLocaleString()}
${orderUrl ? `\nView order: ${orderUrl}` : ""}`,
    footerText: "This is an internal notification for Trichomes staff.",
  });

  return { subject, html, text };
}

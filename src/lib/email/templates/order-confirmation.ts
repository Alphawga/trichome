/**
 * Order Confirmation Email Template
 */

import { format } from "date-fns";
import {
  generateBaseEmailTemplate,
  generateBaseEmailText,
} from "./base-template";

export interface OrderConfirmationEmailData {
  recipientName?: string;
  recipientEmail: string;
  orderNumber: string;
  orderDate: Date;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
  shippingAddress: {
    first_name: string;
    last_name: string;
    address_1: string;
    address_2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  trackingNumber?: string;
  orderUrl?: string;
}

export function generateOrderConfirmationEmail(
  data: OrderConfirmationEmailData,
): { subject: string; html: string; text: string } {
  const {
    recipientName,
    orderNumber,
    orderDate,
    items,
    subtotal,
    shipping,
    tax,
    discount,
    total,
    shippingAddress,
    trackingNumber,
    orderUrl,
  } = data;

  const subject = `Order Confirmation #${orderNumber} - Trichomes`;

  const itemsHtml = items
    .map(
      (item) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #e0e0e0;">${item.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e0e0e0; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e0e0e0; text-align: right;">₦${item.price.toLocaleString()}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e0e0e0; text-align: right;">₦${(item.price * item.quantity).toLocaleString()}</td>
      </tr>
    `,
    )
    .join("");

  const content = `
    <p>Thank you for your order! We're excited to get your products to you.</p>
    
    <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
      <h3 style="margin-top: 0; color: #333;">Order Details</h3>
      <p style="margin: 5px 0;"><strong>Order Number:</strong> ${orderNumber}</p>
      <p style="margin: 5px 0;"><strong>Order Date:</strong> ${format(orderDate, "MMMM dd, yyyy")}</p>
      ${trackingNumber ? `<p style="margin: 5px 0;"><strong>Tracking Number:</strong> ${trackingNumber}</p>` : ""}
    </div>

    <h3 style="color: #333; margin-top: 30px;">Order Items</h3>
    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
      <thead>
        <tr style="background-color: #f5f5f5;">
          <th style="padding: 10px; text-align: left; border-bottom: 2px solid #e0e0e0;">Product</th>
          <th style="padding: 10px; text-align: center; border-bottom: 2px solid #e0e0e0;">Quantity</th>
          <th style="padding: 10px; text-align: right; border-bottom: 2px solid #e0e0e0;">Price</th>
          <th style="padding: 10px; text-align: right; border-bottom: 2px solid #e0e0e0;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>

    <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
      <table style="width: 100%;">
        <tr>
          <td style="padding: 5px 0;">Subtotal:</td>
          <td style="text-align: right; padding: 5px 0;">₦${subtotal.toLocaleString()}</td>
        </tr>
        ${
          discount > 0
            ? `
        <tr>
          <td style="padding: 5px 0;">Discount:</td>
          <td style="text-align: right; padding: 5px 0; color: #38761d;">-₦${discount.toLocaleString()}</td>
        </tr>
        `
            : ""
        }
        <tr>
          <td style="padding: 5px 0;">Shipping:</td>
          <td style="text-align: right; padding: 5px 0;">₦${shipping.toLocaleString()}</td>
        </tr>
        ${
          tax > 0
            ? `
        <tr>
          <td style="padding: 5px 0;">Tax:</td>
          <td style="text-align: right; padding: 5px 0;">₦${tax.toLocaleString()}</td>
        </tr>
        `
            : ""
        }
        <tr style="border-top: 2px solid #e0e0e0; font-weight: bold; font-size: 18px;">
          <td style="padding: 10px 0;">Total:</td>
          <td style="text-align: right; padding: 10px 0;">₦${total.toLocaleString()}</td>
        </tr>
      </table>
    </div>

    <h3 style="color: #333; margin-top: 30px;">Shipping Address</h3>
    <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
      <p style="margin: 5px 0;">${shippingAddress.first_name} ${shippingAddress.last_name}</p>
      <p style="margin: 5px 0;">${shippingAddress.address_1}</p>
      ${shippingAddress.address_2 ? `<p style="margin: 5px 0;">${shippingAddress.address_2}</p>` : ""}
      <p style="margin: 5px 0;">${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.postal_code}</p>
      <p style="margin: 5px 0;">${shippingAddress.country}</p>
    </div>

    ${
      trackingNumber
        ? `
    <p style="color: #666; font-size: 14px; margin-top: 20px;">
      You can track your order using the tracking number above. We'll send you updates as your order ships.
    </p>
    `
        : `
    <p style="color: #666; font-size: 14px; margin-top: 20px;">
      We'll send you a tracking number once your order ships.
    </p>
    `
    }
  `;

  const html = generateBaseEmailTemplate({
    title: "Order Confirmation",
    greeting: "Thank you",
    recipientName,
    content,
    buttonText: orderUrl ? "View Order" : undefined,
    buttonUrl: orderUrl,
    footerText:
      "If you have any questions about your order, please contact our support team.",
  });

  const itemsText = items
    .map(
      (item) =>
        `- ${item.name} (Qty: ${item.quantity}) - ₦${(item.price * item.quantity).toLocaleString()}`,
    )
    .join("\n");

  const textContent = `
Thank you for your order! We're excited to get your products to you.

Order Details:
Order Number: ${orderNumber}
Order Date: ${format(orderDate, "MMMM dd, yyyy")}
${trackingNumber ? `Tracking Number: ${trackingNumber}` : ""}

Order Items:
${itemsText}

Order Summary:
Subtotal: ₦${subtotal.toLocaleString()}
${discount > 0 ? `Discount: -₦${discount.toLocaleString()}\n` : ""}Shipping: ₦${shipping.toLocaleString()}
${tax > 0 ? `Tax: ₦${tax.toLocaleString()}\n` : ""}Total: ₦${total.toLocaleString()}

Shipping Address:
${shippingAddress.first_name} ${shippingAddress.last_name}
${shippingAddress.address_1}
${shippingAddress.address_2 ? `${shippingAddress.address_2}\n` : ""}${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.postal_code}
${shippingAddress.country}

${trackingNumber ? "You can track your order using the tracking number above. We'll send you updates as your order ships." : "We'll send you a tracking number once your order ships."}

If you have any questions about your order, please contact our support team.
${orderUrl ? `\nView your order: ${orderUrl}` : ""}
  `.trim();

  const text = generateBaseEmailText({
    title: "Order Confirmation",
    greeting: "Thank you",
    recipientName,
    content: textContent,
    buttonText: orderUrl ? "View Order" : undefined,
    buttonUrl: orderUrl,
    footerText:
      "If you have any questions about your order, please contact our support team.",
  });

  return { subject, html, text };
}

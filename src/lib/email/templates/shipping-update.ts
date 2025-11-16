/**
 * Shipping Update Email Template
 */

import { format } from "date-fns";
import {
  generateBaseEmailTemplate,
  generateBaseEmailText,
} from "./base-template";

export interface ShippingUpdateEmailData {
  recipientName?: string;
  recipientEmail: string;
  orderNumber: string;
  status: "shipped" | "out_for_delivery" | "delivered";
  trackingNumber?: string;
  carrier?: string;
  estimatedDelivery?: Date;
  deliveredAt?: Date;
  orderUrl?: string;
}

export function generateShippingUpdateEmail(data: ShippingUpdateEmailData): {
  subject: string;
  html: string;
  text: string;
} {
  const {
    recipientName,
    orderNumber,
    status,
    trackingNumber,
    carrier,
    estimatedDelivery,
    deliveredAt,
    orderUrl,
  } = data;

  const statusMessages = {
    shipped: {
      title: "Your Order Has Shipped!",
      message:
        "Great news! Your order has been shipped and is on its way to you.",
    },
    out_for_delivery: {
      title: "Your Order is Out for Delivery",
      message: "Your order is out for delivery and should arrive soon!",
    },
    delivered: {
      title: "Your Order Has Been Delivered",
      message: "Your order has been successfully delivered!",
    },
  };

  const statusInfo = statusMessages[status];
  const subject = `${statusInfo.title} - Order #${orderNumber} - Trichomes`;

  const content = `
    <p>${statusInfo.message}</p>
    
    <div style="background-color: #f0f9f0; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #38761d;">
      <h3 style="margin-top: 0; color: #333;">Shipping Information</h3>
      <p style="margin: 5px 0;"><strong>Order Number:</strong> ${orderNumber}</p>
      <p style="margin: 5px 0;"><strong>Status:</strong> ${statusInfo.title}</p>
      ${trackingNumber ? `<p style="margin: 5px 0;"><strong>Tracking Number:</strong> ${trackingNumber}</p>` : ""}
      ${carrier ? `<p style="margin: 5px 0;"><strong>Carrier:</strong> ${carrier}</p>` : ""}
      ${estimatedDelivery && status !== "delivered" ? `<p style="margin: 5px 0;"><strong>Estimated Delivery:</strong> ${format(estimatedDelivery, "MMMM dd, yyyy")}</p>` : ""}
      ${deliveredAt && status === "delivered" ? `<p style="margin: 5px 0;"><strong>Delivered On:</strong> ${format(deliveredAt, "MMMM dd, yyyy HH:mm")}</p>` : ""}
    </div>

    ${
      trackingNumber
        ? `
    <p style="color: #666; font-size: 14px; margin-top: 20px;">
      You can track your order using the tracking number above. Click the button below to view your order details.
    </p>
    `
        : `
    <p style="color: #666; font-size: 14px; margin-top: 20px;">
      We'll keep you updated on your order's progress. Click the button below to view your order details.
    </p>
    `
    }
  `;

  const html = generateBaseEmailTemplate({
    title: statusInfo.title,
    greeting: "Hello",
    recipientName,
    content,
    buttonText: orderUrl ? "Track Order" : undefined,
    buttonUrl: orderUrl,
    footerText:
      "If you have any questions about your shipment, please contact our support team.",
  });

  const textContent = `
${statusInfo.message}

Shipping Information:
Order Number: ${orderNumber}
Status: ${statusInfo.title}
${trackingNumber ? `Tracking Number: ${trackingNumber}` : ""}
${carrier ? `Carrier: ${carrier}` : ""}
${estimatedDelivery && status !== "delivered" ? `Estimated Delivery: ${format(estimatedDelivery, "MMMM dd, yyyy")}` : ""}
${deliveredAt && status === "delivered" ? `Delivered On: ${format(deliveredAt, "MMMM dd, yyyy HH:mm")}` : ""}

${trackingNumber ? "You can track your order using the tracking number above." : "We'll keep you updated on your order's progress."}

If you have any questions about your shipment, please contact our support team.
${orderUrl ? `\nTrack your order: ${orderUrl}` : ""}
  `.trim();

  const text = generateBaseEmailText({
    title: statusInfo.title,
    greeting: "Hello",
    recipientName,
    content: textContent,
    buttonText: orderUrl ? "Track Order" : undefined,
    buttonUrl: orderUrl,
    footerText:
      "If you have any questions about your shipment, please contact our support team.",
  });

  return { subject, html, text };
}

/**
 * Newsletter Welcome Email Template
 * Sent when a user subscribes to the newsletter
 */

import {
    generateBaseEmailTemplate,
    generateBaseEmailText,
} from "./base-template";

export interface NewsletterWelcomeEmailData {
    recipientEmail: string;
    unsubscribeUrl?: string;
}

export function generateNewsletterWelcomeEmail(
    data: NewsletterWelcomeEmailData,
): { subject: string; html: string; text: string } {
    const { unsubscribeUrl } = data;

    const subject = "You're Subscribed! Welcome to the Trichomes Newsletter 🌿";

    const content = `
    <p>Thank you for subscribing to the Trichomes newsletter! You're now part of an exclusive community that receives:</p>
    
    <ul style="color: #333; padding-left: 20px;">
      <li style="margin-bottom: 10px;"><strong>Exclusive Discounts:</strong> Subscriber-only offers and early sale access</li>
      <li style="margin-bottom: 10px;"><strong>Skincare Tips:</strong> Expert advice for your skincare journey</li>
      <li style="margin-bottom: 10px;"><strong>New Arrivals:</strong> Be the first to know about new products</li>
      <li style="margin-bottom: 10px;"><strong>Wellness Insights:</strong> Articles on holistic beauty and self-care</li>
    </ul>
    
    <p style="margin-top: 20px;">We promise to only send you content that matters. No spam, ever.</p>
  `;

    const html = generateBaseEmailTemplate({
        title: "Welcome to Our Newsletter!",
        greeting: "Hello",
        content,
        buttonText: "Shop Now",
        buttonUrl: process.env.NEXT_PUBLIC_APP_URL || "https://trichomes.com",
        footerText: "We're excited to have you with us!",
        showUnsubscribe: true,
        unsubscribeUrl,
    });

    const textContent = `
Thank you for subscribing to the Trichomes newsletter! You're now part of an exclusive community that receives:

- Exclusive Discounts: Subscriber-only offers and early sale access
- Skincare Tips: Expert advice for your skincare journey
- New Arrivals: Be the first to know about new products
- Wellness Insights: Articles on holistic beauty and self-care

We promise to only send you content that matters. No spam, ever.

We're excited to have you with us!
${unsubscribeUrl ? `\nTo unsubscribe: ${unsubscribeUrl}` : ""}
  `.trim();

    const text = generateBaseEmailText({
        title: "Welcome to Our Newsletter!",
        greeting: "Hello",
        content: textContent,
        buttonText: "Shop Now",
        buttonUrl: process.env.NEXT_PUBLIC_APP_URL || "https://trichomes.com",
        footerText: "We're excited to have you with us!",
    });

    return { subject, html, text };
}

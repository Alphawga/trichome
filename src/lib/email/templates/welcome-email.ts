/**
 * Welcome Email Template
 * Sent when a new user registers
 */

import {
    generateBaseEmailTemplate,
    generateBaseEmailText,
} from "./base-template";

export interface WelcomeEmailData {
    recipientName?: string;
    recipientEmail: string;
    loginUrl?: string;
}

export function generateWelcomeEmail(
    data: WelcomeEmailData,
): { subject: string; html: string; text: string } {
    const { recipientName, loginUrl } = data;

    const subject = "Welcome to Trichomes! 🌿";

    const content = `
    <p>Welcome to the Trichomes family! We're thrilled to have you join our community of skincare enthusiasts.</p>
    
    <p>At Trichomes, we believe in the power of natural, plant-based skincare solutions. Here's what you can look forward to:</p>
    
    <ul style="color: #333; padding-left: 20px;">
      <li style="margin-bottom: 10px;"><strong>Premium Products:</strong> Carefully curated skincare essentials</li>
      <li style="margin-bottom: 10px;"><strong>Expert Advice:</strong> Access to personalized consultations</li>
      <li style="margin-bottom: 10px;"><strong>Exclusive Rewards:</strong> Earn points with every purchase</li>
      <li style="margin-bottom: 10px;"><strong>Special Offers:</strong> Early access to sales and promotions</li>
    </ul>
    
    <p style="margin-top: 20px;">Start exploring our collection and discover products that will transform your skincare routine.</p>
  `;

    const html = generateBaseEmailTemplate({
        title: "Welcome to Trichomes!",
        greeting: "Hello",
        recipientName,
        content,
        buttonText: loginUrl ? "Start Shopping" : undefined,
        buttonUrl: loginUrl,
        footerText:
            "Thank you for joining us. If you have any questions, our team is always here to help.",
    });

    const textContent = `
Welcome to the Trichomes family! We're thrilled to have you join our community of skincare enthusiasts.

At Trichomes, we believe in the power of natural, plant-based skincare solutions. Here's what you can look forward to:

- Premium Products: Carefully curated skincare essentials
- Expert Advice: Access to personalized consultations
- Exclusive Rewards: Earn points with every purchase
- Special Offers: Early access to sales and promotions

Start exploring our collection and discover products that will transform your skincare routine.

Thank you for joining us. If you have any questions, our team is always here to help.
${loginUrl ? `\nStart shopping: ${loginUrl}` : ""}
  `.trim();

    const text = generateBaseEmailText({
        title: "Welcome to Trichomes!",
        greeting: "Hello",
        recipientName,
        content: textContent,
        buttonText: loginUrl ? "Start Shopping" : undefined,
        buttonUrl: loginUrl,
        footerText:
            "Thank you for joining us. If you have any questions, our team is always here to help.",
    });

    return { subject, html, text };
}

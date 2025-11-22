/**
 * Password Reset Email Template
 *
 * Uses the centralized email service
 */

import { sendEmail } from "./email-service";
import {
  generateBaseEmailTemplate,
  generateBaseEmailText,
} from "./templates/base-template";

export interface PasswordResetEmailData {
  email: string;
  resetToken: string;
  resetUrl: string;
  expiresIn: string; // e.g., "1 hour"
  recipientName?: string;
}

/**
 * Generate password reset email content
 */
export function generatePasswordResetEmail(data: PasswordResetEmailData): {
  subject: string;
  html: string;
  text: string;
} {
  const { email, resetUrl, expiresIn, recipientName } = data;

  const subject = "Reset Your Password - Trichomes";

  const content = `
    <p>We received a request to reset your password for your Trichomes account associated with <strong>${email}</strong>.</p>
    
    <p>Click the button below to reset your password. This link will expire in ${expiresIn}.</p>
    
    <p style="color: #666; font-size: 14px; margin-top: 20px;">
      Or copy and paste this link into your browser:<br>
      <a href="${resetUrl}" style="color: #38761d; word-break: break-all;">${resetUrl}</a>
    </p>
    
    <p style="color: #666; font-size: 14px; margin-top: 20px;">
      If you didn't request a password reset, please ignore this email. Your password will remain unchanged.
    </p>
  `;

  const html = generateBaseEmailTemplate({
    title: "Reset Your Password",
    greeting: "Hello",
    recipientName,
    content,
    buttonText: "Reset Password",
    buttonUrl: resetUrl,
    footerText: `This link will expire in ${expiresIn}.`,
  });

  const textContent = `
We received a request to reset your password for your Trichomes account associated with ${email}.

Click the link below to reset your password. This link will expire in ${expiresIn}.

${resetUrl}

If you didn't request a password reset, please ignore this email. Your password will remain unchanged.
  `.trim();

  const text = generateBaseEmailText({
    title: "Reset Your Password",
    greeting: "Hello",
    recipientName,
    content: textContent,
    buttonText: "Reset Password",
    buttonUrl: resetUrl,
    footerText: `This link will expire in ${expiresIn}.`,
  });

  return { subject, html, text };
}

/**
 * Send password reset email using the centralized email service
 */
export async function sendPasswordResetEmail(
  data: PasswordResetEmailData,
): Promise<void> {
  const emailContent = generatePasswordResetEmail(data);

  await sendEmail({
    to: data.email,
    subject: emailContent.subject,
    html: emailContent.html,
    text: emailContent.text,
  });
}

import React from "react";

/**
 * Base Email Template
 *
 * Provides a consistent base structure for all email templates
 */

export interface BaseEmailTemplateProps {
  title: string;
  greeting?: string;
  recipientName?: string;
  content: string | React.ReactNode;
  buttonText?: string;
  buttonUrl?: string;
  footerText?: string;
  showUnsubscribe?: boolean;
  unsubscribeUrl?: string;
}

/**
 * Generate base email HTML template
 */
export function generateBaseEmailTemplate(
  props: BaseEmailTemplateProps,
): string {
  const {
    title,
    greeting = "Hello",
    recipientName,
    content,
    buttonText,
    buttonUrl,
    footerText,
    showUnsubscribe = false,
    unsubscribeUrl,
  } = props;

  const greetingText = recipientName
    ? `${greeting}, ${recipientName}`
    : greeting;
  const contentHtml = typeof content === "string" ? content : "";

  const buttonHtml =
    buttonText && buttonUrl
      ? `
    <div style="text-align: center; margin: 30px 0;">
      <a href="${buttonUrl}" 
         style="display: inline-block; background-color: #38761d; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
        ${buttonText}
      </a>
    </div>
  `
      : "";

  const unsubscribeHtml =
    showUnsubscribe && unsubscribeUrl
      ? `
    <p style="color: #999; font-size: 12px; text-align: center; margin-top: 20px;">
      <a href="${unsubscribeUrl}" style="color: #999; text-decoration: underline;">Unsubscribe</a>
    </p>
  `
      : "";

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
        <div style="background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #38761d 0%, #4a9e2a 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">Trichomes</h1>
          </div>
          
          <!-- Content -->
          <div style="padding: 30px;">
            <h2 style="color: #333; margin-top: 0; font-size: 24px;">${title}</h2>
            
            <p style="color: #666; margin-bottom: 20px;">${greetingText},</p>
            
            <div style="color: #333; margin-bottom: 20px;">
              ${contentHtml}
            </div>
            
            ${buttonHtml}
            
            ${footerText ? `<p style="color: #666; font-size: 14px; margin-top: 30px;">${footerText}</p>` : ""}
          </div>
          
          <!-- Footer -->
          <div style="background-color: #f9f9f9; padding: 20px; border-top: 1px solid #e0e0e0;">
            <p style="color: #999; font-size: 12px; margin: 0; text-align: center;">
              This is an automated message from Trichomes. Please do not reply to this email.
            </p>
            ${unsubscribeHtml}
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Generate base email text template
 */
export function generateBaseEmailText(props: BaseEmailTemplateProps): string {
  const {
    title,
    greeting = "Hello",
    recipientName,
    content,
    buttonText,
    buttonUrl,
    footerText,
  } = props;

  const greetingText = recipientName
    ? `${greeting}, ${recipientName}`
    : greeting;
  const contentText = typeof content === "string" ? content : "";

  let text = `${title}\n\n`;
  text += `${greetingText},\n\n`;
  text += `${contentText}\n\n`;

  if (buttonText && buttonUrl) {
    text += `${buttonText}: ${buttonUrl}\n\n`;
  }

  if (footerText) {
    text += `${footerText}\n\n`;
  }

  text += "---\n";
  text +=
    "This is an automated message from Trichomes. Please do not reply to this email.\n";

  return text;
}

"use client";

import Image from "next/image";
import Link from "next/link";

interface WhatsAppWidgetProps {
  /** WhatsApp phone number */
  phoneNumber: string;
  /** Pre-filled message */
  message?: string;
  /** Show widget */
  show?: boolean;
  /** Additional className */
  className?: string;
}

/**
 * WhatsAppWidget Component
 *
 * Floating WhatsApp button that links directly to a WhatsApp chat.
 *
 * Follows Trichomes Design Guide principles:
 * - Reusable component
 * - Type-safe
 * - Accessible
 */
export function WhatsAppWidget({
  phoneNumber,
  message = "Hello, I would like to inquire about your products.",
  show = true,
  className = "",
}: WhatsAppWidgetProps) {
  if (!show) return null;

  const whatsappUrl = `https://wa.me/${phoneNumber.replace(/[^0-9]/g, "")}${message ? `?text=${encodeURIComponent(message)}` : ""}`;

  return (
    <div className={`fixed bottom-24 right-6 z-50 ${className}`}>
      <Link
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
        aria-label="Contact us on WhatsApp"
      >
        <Image
          src="/logo/whatsapp-green.png"
          alt="WhatsApp"
          width={56}
          height={56}
          className="w-full h-full object-contain"
        />
      </Link>
    </div>
  );
}

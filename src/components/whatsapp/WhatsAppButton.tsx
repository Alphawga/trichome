"use client";

import Link from "next/link";

import { WhatsAppIcon } from "@/components/ui/icons";

interface WhatsAppButtonProps {
  /** WhatsApp phone number (with country code, no +) */
  phoneNumber: string;
  /** Pre-filled message */
  message?: string;
  /** Button variant */
  variant?: "floating" | "inline" | "icon";
  /** Button size */
  size?: "sm" | "md" | "lg";
  /** Additional className */
  className?: string;
  /** Show text label */
  showLabel?: boolean;
}

/**
 * WhatsAppButton Component
 *
 * Reusable WhatsApp button that opens WhatsApp chat.
 *
 * Follows Trichomes Design Guide principles:
 * - Reusable component
 * - Type-safe
 * - Consistent styling
 */
export function WhatsAppButton({
  phoneNumber,
  message = "Hello, I would like to inquire about your products.",
  variant = "floating",
  size = "md",
  className = "",
  showLabel = true,
}: WhatsAppButtonProps) {
  // Format WhatsApp URL
  const whatsappUrl = `https://wa.me/${phoneNumber.replace(/[^0-9]/g, "")}${message ? `?text=${encodeURIComponent(message)}` : ""}`;

  // Size classes
  const sizeClasses = {
    sm: "w-10 h-10 text-sm",
    md: "w-12 h-12 text-base",
    lg: "w-16 h-16 text-lg",
  };

  // Variant styles
  const variantStyles = {
    floating:
      "fixed bottom-6 right-6 z-50 shadow-lg hover:shadow-xl transition-shadow duration-300",
    inline: "inline-flex",
    icon: "inline-flex",
  };

  if (variant === "floating") {
    return (
      <Link
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`${variantStyles.floating} ${sizeClasses.md} bg-[#25D366] text-white rounded-full flex items-center justify-center hover:bg-[#20BA5A] transition-colors duration-300 ${className}`}
        aria-label="Contact us on WhatsApp"
      >
        <WhatsAppIcon className="w-6 h-6" filled />
      </Link>
    );
  }

  if (variant === "icon") {
    return (
      <Link
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`${sizeClasses[size]} bg-[#25D366] text-white rounded-full flex items-center justify-center hover:bg-[#20BA5A] transition-colors duration-300 ${className}`}
        aria-label="Contact us on WhatsApp"
      >
        <WhatsAppIcon
          className={`${size === "sm" ? "w-5 h-5" : size === "md" ? "w-6 h-6" : "w-8 h-8"}`}
          filled
        />
      </Link>
    );
  }

  return (
    <Link
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`${variantStyles.inline} items-center gap-2 bg-[#25D366] text-white px-4 py-2 rounded-full hover:bg-[#20BA5A] transition-colors duration-300 font-medium ${className}`}
    >
      <WhatsAppIcon className="w-5 h-5" filled />
      {showLabel && <span className="font-body">Contact via WhatsApp</span>}
    </Link>
  );
}

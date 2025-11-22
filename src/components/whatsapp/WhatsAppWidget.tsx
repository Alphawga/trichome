"use client";

import Image from "next/image";
import { useState } from "react";
import { XIcon } from "@/components/ui/icons";
import { WhatsAppButton } from "./WhatsAppButton";

interface WhatsAppWidgetProps {
  /** WhatsApp phone number */
  phoneNumber: string;
  /** Default messages */
  messages?: string[];
  /** Show widget */
  show?: boolean;
  /** Additional className */
  className?: string;
}

/**
 * WhatsAppWidget Component
 *
 * Floating WhatsApp widget with quick message options.
 *
 * Follows Trichomes Design Guide principles:
 * - Reusable component
 * - Type-safe
 * - Accessible
 */
export function WhatsAppWidget({
  phoneNumber,
  messages = [
    "Hello, I would like to inquire about your products.",
    "I need help with my order.",
    "I have a question about shipping.",
    "Can you help me choose a product?",
  ],
  show = true,
  className = "",
}: WhatsAppWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!show) return null;

  return (
    <div className={`fixed bottom-24 right-6 z-50 ${className}`}>
      {/* Quick Messages Panel */}
      {isOpen && (
        <div className="absolute bottom-20 right-0 w-64 bg-white rounded-xl shadow-2xl border border-trichomes-forest/10 p-4 mb-2 animate-[slideUp_300ms_ease-out]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-trichomes-forest font-body">
              Quick Messages
            </h3>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-trichomes-forest/60 hover:text-trichomes-forest transition-colors duration-150"
              aria-label="Close messages"
            >
              <XIcon className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-2">
            {messages.map((message) => (
              <WhatsAppButton
                key={message}
                phoneNumber={phoneNumber}
                message={message}
                variant="inline"
                size="sm"
                showLabel={true}
                className="w-full justify-start text-left text-sm"
              />
            ))}
          </div>
        </div>
      )}

      {/* WhatsApp Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
        aria-label={isOpen ? "Close WhatsApp menu" : "Open WhatsApp menu"}
      >
        <Image
          src="/logo/whatsapp-green.png"
          alt="WhatsApp"
          width={56}
          height={56}
          className="w-full h-full object-contain"
        />
      </button>
    </div>
  );
}

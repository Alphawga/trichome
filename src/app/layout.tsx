import React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import Providers from "@/components/providers";
import { CompareFloatingBar } from "@/components/compare/CompareFloatingBar";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site-config";

// Inter font for body text
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

// Classy Vogue font for headings
const classyVogue = localFont({
  src: [
    {
      path: "../fonts/Classyvogueregular.ttf",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-classy-vogue",
  display: "swap",
  fallback: ["Georgia", "Times New Roman", "serif"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} - Cosmeceuticals & Skincare`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "cosmeceuticals",
    "skincare",
    "beauty",
    "trichomes",
    "natural skincare",
    "Nigerian skincare",
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  openGraph: {
    title: `${SITE_NAME} - Cosmeceuticals & Skincare`,
    description: SITE_DESCRIPTION,
    type: "website",
    siteName: SITE_NAME,
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} - Cosmeceuticals & Skincare`,
    description: SITE_DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${classyVogue.variable} antialiased`}>
        <Providers>
          {children}
          <CompareFloatingBar />
        </Providers>
      </body>
    </html>
  );
}

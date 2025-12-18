import React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import Providers from "@/components/providers";
import { CompareFloatingBar } from "@/components/compare/CompareFloatingBar";

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
  title: "Trichomes - Cosmeceuticals & Skincare Coming Soon",
  description:
    "Discover the future of skincare with Trichomes. Revolutionary cosmeceutical products inspired by nature's most powerful ingredients. Coming soon.",
  keywords: [
    "cosmeceuticals",
    "skincare",
    "beauty",
    "trichomes",
    "natural skincare",
    "innovative beauty",
  ],
  authors: [{ name: "Trichomes" }],
  creator: "Trichomes",
  publisher: "Trichomes",
  openGraph: {
    title: "Trichomes - Cosmeceuticals & Skincare Coming Soon",
    description:
      "Revolutionary cosmeceutical products inspired by nature's most powerful ingredients.",
    type: "website",
    siteName: "Trichomes",
  },
  twitter: {
    card: "summary_large_image",
    title: "Trichomes - Cosmeceuticals & Skincare Coming Soon",
    description:
      "Revolutionary cosmeceutical products inspired by nature's most powerful ingredients.",
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

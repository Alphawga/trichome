import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/providers";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Trichomes - Cosmeceuticals & Skincare Coming Soon",
  description: "Discover the future of skincare with Trichomes. Revolutionary cosmeceutical products inspired by nature's most powerful ingredients. Coming soon.",
  keywords: ["cosmeceuticals", "skincare", "beauty", "trichomes", "natural skincare", "innovative beauty"],
  authors: [{ name: "Trichomes" }],
  creator: "Trichomes",
  publisher: "Trichomes",
  openGraph: {
    title: "Trichomes - Cosmeceuticals & Skincare Coming Soon",
    description: "Revolutionary cosmeceutical products inspired by nature's most powerful ingredients.",
    type: "website",
    siteName: "Trichomes",
  },
  twitter: {
    card: "summary_large_image",
    title: "Trichomes - Cosmeceuticals & Skincare Coming Soon",
    description: "Revolutionary cosmeceutical products inspired by nature's most powerful ingredients.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}

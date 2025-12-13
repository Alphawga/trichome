import Image from "next/image";
import Link from "next/link";
import type React from "react";
import {
  FacebookIcon,
  InstagramIcon,
  TiktokIcon,
  WhatsAppIcon,
  XIcon,
} from "../ui/icons";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#193C08] text-white">
      <div className="mx-auto px-6 sm:px-8 lg:px-12 py-16 sm:py-20 max-w-[2200px]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-16">
          {/* Logo Section */}
          <div className=" max-w-md">
            <Link href="/" className="inline-block mb-6">
              <Image
                src="/T3.png"
                alt="Trichomes Logo"
                width={140}
                height={60}
                className="object-contain "
              />
            </Link>
            <p className="text-white/80 text-[14px] leading-relaxed font-body">
              Where science meets nature — luxury simplified.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4 text-[16px] text-white font-body">
              Quick Links
            </h4>
            <ul className="space-y-3 text-white/80 text-[14px]">
              <li>
                <Link
                  href="/about"
                  className="hover:text-white transition-colors duration-150 font-body underline"
                >
                  About us
                </Link>
              </li>
              <li>
                <Link
                  href="/consultation"
                  className="hover:text-white transition-colors duration-150 font-body underline"
                >
                  Book Consultation
                </Link>
              </li>
              <li>
                <Link
                  href="/shop"
                  className="hover:text-white transition-colors duration-150 font-body underline"
                >
                  Shop
                </Link>
              </li>
              <li>
                <Link
                  href="/brands"
                  className="hover:text-white transition-colors duration-150 font-body underline"
                >
                  Brands
                </Link>
              </li>
              <li>
                <Link
                  href="/products"
                  className="hover:text-white transition-colors duration-150 font-body underline"
                >
                  Products
                </Link>
              </li>
            </ul>
          </div>

          {/* My Account */}
          <div>
            <h4 className="font-semibold mb-4 text-[16px] text-white font-body">
              My Account
            </h4>
            <ul className="space-y-3 text-white/80 text-[14px]">
              <li>
                <Link
                  href="/profile"
                  className="hover:text-white transition-colors duration-150 font-body underline"
                >
                  Profile
                </Link>
              </li>
              <li>
                <Link
                  href="/order-history"
                  className="hover:text-white transition-colors duration-150 font-body underline"
                >
                  Order History
                </Link>
              </li>
              <li>
                <Link
                  href="/track-order"
                  className="hover:text-white transition-colors duration-150 font-body underline"
                >
                  Track Order
                </Link>
              </li>
              <li>
                <Link
                  href="/cart"
                  className="hover:text-white transition-colors duration-150 font-body underline"
                >
                  Cart
                </Link>
              </li>
              <li>
                <Link
                  href="/wishlist"
                  className="hover:text-white transition-colors duration-150 font-body underline"
                >
                  Wishlist
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect with us */}
          <div>
            <h4 className="font-semibold mb-4 text-[16px] text-white font-body">
              Connect with us
            </h4>
            <div className="flex space-x-4 mb-6">
              <a
                href="https://www.instagram.com/trichomes_ng?igsh=MTQ3ajZ0NjFlb3JzbA=="
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-70 transition-opacity duration-150"
                aria-label="Instagram"
              >
                <Image
                  src="/logo/instagram-logo.png"
                  alt="Instagram"
                  width={24}
                  height={24}
                  className="w-6 h-6 object-contain brightness-0 invert"
                />
              </a>
              <a
                href="https://facebook.com/trichome"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-70 transition-opacity duration-150"
                aria-label="Facebook"
              >
                <Image
                  src="/logo/facebook.png"
                  alt="Facebook"
                  width={24}
                  height={24}
                  className="w-6 h-6 object-contain brightness-0 invert"
                />
              </a>
              <a
                href="https://x.com/trichome"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-70 transition-opacity duration-150"
                aria-label="X (Twitter)"
              >
                <Image
                  src="/logo/twitter.png"
                  alt="X (Twitter)"
                  width={24}
                  height={24}
                  className="w-6 h-6 object-contain brightness-0 invert"
                />
              </a>
              <a
                href="https://www.tiktok.com/@trichomes_ng?_r=1&_t=ZS-92BTyW6SYR3"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-70 transition-opacity duration-150"
                aria-label="TikTok"
              >
                <Image
                  src="/logo/tik-tok.png"
                  alt="TikTok"
                  width={24}
                  height={24}
                  className="w-6 h-6 object-contain brightness-0 invert"
                />
              </a>
              <a
                href="https://wa.me/2348087098720?text=Hi%20Trichomes%20Ltd%2C%20I%20would%20like%20to%20know%20more%20about%20your%20products%20%26%20services%3F"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-70 transition-opacity duration-150"
                aria-label="WhatsApp"
              >
                <Image
                  src="/logo/whatsapp.png"
                  alt="WhatsApp"
                  width={24}
                  height={24}
                  className="w-6 h-6 object-contain brightness-0 invert"
                />
              </a>
            </div>
            <div>
              <p className="text-white text-[14px] mb-2 font-body font-semibold">
                Contact us
              </p>
              <p className="text-white/80 text-[14px] mb-1 font-body underline">
                <a href="mailto:support@trichome.com" className="hover:text-white transition-colors">
                  support@trichome.com
                </a>
              </p>
              <p className="text-white/80 text-[14px] font-body underline">
                <a href="tel:+2341234567890" className="hover:text-white transition-colors">
                  +234 123 456 7890
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/20 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-white/70 text-[13px] text-center md:text-left font-body">
              © {new Date().getFullYear()} Trichomes. All rights reserved.
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-[13px] text-white/70">
              <Link
                href="/privacy"
                className="hover:text-white transition-colors duration-150 font-body underline"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="hover:text-white transition-colors duration-150 font-body underline"
              >
                Terms of use
              </Link>
              <Link
                href="/returns"
                className="hover:text-white transition-colors duration-150 font-body underline"
              >
                Return policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

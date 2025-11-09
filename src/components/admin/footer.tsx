import React from 'react';
import { WhatsAppIcon, InstagramIcon, FacebookIcon, TiktokIcon, XIcon } from '../ui/icons'
import Image from 'next/image';
import Link from 'next/link';

export const Footer: React.FC = () => {
    return (
        <footer className="bg-trichomes-sage text-trichomes-forest">
            <div className="mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16" style={{ width: '85%' }}>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12">
                    {/* Logo Section */}
                    <div className="lg:col-span-3 text-center lg:text-left">
                        <Link href="/" className="inline-block mb-4 sm:mb-6">
                           <Image src="/T3.png" alt="Trichomes Logo" width={120} height={80} className="object-contain sm:w-[150px] sm:h-[100px]" />
                        </Link>
                        <p className="text-trichomes-forest/70 text-[13px] sm:text-[14px] leading-relaxed font-body font-normal">
                            Where science meets nature — luxury simplified.
                        </p>
                    </div>

             
                    <div className="lg:col-span-4">
                        <h3 className="text-[16px] sm:text-[18px] font-semibold mb-2 sm:mb-3 text-trichomes-forest text-center lg:text-left font-body">
                            Stay In The Loop
                        </h3>
                        <p className="text-trichomes-forest/70 mb-4 sm:mb-6 text-[13px] sm:text-[14px] leading-relaxed text-center lg:text-left font-body font-normal">
                            Get the latest product drops, exclusive offers, and beauty tips straight to your inbox.
                        </p>
                        <form className="flex flex-col sm:flex-row shadow-md gap-2 sm:gap-0">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="flex-grow bg-trichomes-soft text-trichomes-forest placeholder-trichomes-forest/50 px-4 py-3 rounded-full sm:rounded-l-full sm:rounded-r-none focus:outline-none focus:ring-2 focus:ring-trichomes-primary border-none text-[13px] sm:text-[14px] font-body"
                            />
                            <button
                                type="submit"
                                className="bg-trichomes-gold text-trichomes-forest font-semibold px-6 sm:px-8 py-3 rounded-full sm:rounded-r-full sm:rounded-l-none hover:bg-trichomes-gold-hover transition-all duration-150 ease-out whitespace-nowrap text-[13px] sm:text-[14px] font-body"
                            >
                                Subscribe
                            </button>
                        </form>
                    </div>

                    {/* Links Section - Design Guide: Minimal links, clean spacing */}
                    <div className="lg:col-span-5 grid grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 mt-4 lg:mt-0">
                        <div>
                            <h4 className="font-semibold mb-3 sm:mb-4 text-[15px] sm:text-[16px] text-trichomes-forest font-body">
                                Quick Links
                            </h4>
                            <ul className="space-y-2 sm:space-y-3 text-trichomes-forest/70 text-[13px] sm:text-[14px]">
                                <li>
                                    <Link href="/about" className="hover:text-trichomes-primary transition-colors duration-150 font-body font-normal">
                                        About Us
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/consultation" className="hover:text-trichomes-primary transition-colors duration-150 font-body font-normal">
                                        Book Consultation
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/shop" className="hover:text-trichomes-primary transition-colors duration-150 font-body font-normal">
                                        Shop
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/brands" className="hover:text-trichomes-primary transition-colors duration-150 font-body font-normal">
                                        Brands
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/products" className="hover:text-trichomes-primary transition-colors duration-150 font-body font-normal">
                                        Products
                                    </Link>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-3 sm:mb-4 text-[15px] sm:text-[16px] text-trichomes-forest font-body">
                                My Account
                            </h4>
                            <ul className="space-y-2 sm:space-y-3 text-trichomes-forest/70 text-[13px] sm:text-[14px]">
                                <li>
                                    <Link href="/profile" className="hover:text-trichomes-primary transition-colors duration-150 font-body font-normal">
                                        Profile
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/order-history" className="hover:text-trichomes-primary transition-colors duration-150 font-body font-normal">
                                        Order History
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/track-order" className="hover:text-trichomes-primary transition-colors duration-150 font-body font-normal">
                                        Track Order
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/cart" className="hover:text-trichomes-primary transition-colors duration-150 font-body font-normal">
                                        Cart
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/wishlist" className="hover:text-trichomes-primary transition-colors duration-150 font-body font-normal">
                                        Wishlist
                                    </Link>
                                </li>
                            </ul>
                        </div>
                        <div className="col-span-2 md:col-span-1">
                            <h4 className="font-semibold mb-3 sm:mb-4 text-[15px] sm:text-[16px] text-trichomes-forest text-center md:text-left font-body">
                                Connect With Us
                            </h4>
                            <div className="flex space-x-3 mb-4 sm:mb-6 justify-center md:justify-start">
                                <a
                                    href="https://wa.me/your-number"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-10 h-10 bg-trichomes-forest/10 rounded-full flex items-center justify-center text-trichomes-forest/70 hover:bg-trichomes-primary hover:text-white transition-all duration-150 ease-out hover:scale-110"
                                >
                                    <WhatsAppIcon className="w-5 h-5" />
                                </a>
                                <a
                                    href="https://instagram.com/trichome"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-10 h-10 bg-trichomes-forest/10 rounded-full flex items-center justify-center text-trichomes-forest/70 hover:bg-trichomes-primary hover:text-white transition-all duration-150 ease-out hover:scale-110"
                                >
                                    <InstagramIcon className="w-5 h-5" />
                                </a>
                                <a
                                    href="https://facebook.com/trichome"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-10 h-10 bg-trichomes-forest/10 rounded-full flex items-center justify-center text-trichomes-forest/70 hover:bg-trichomes-primary hover:text-white transition-all duration-150 ease-out hover:scale-110"
                                >
                                    <FacebookIcon className="w-5 h-5" />
                                </a>
                                <a
                                    href="https://tiktok.com/@trichome"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-10 h-10 bg-trichomes-forest/10 rounded-full flex items-center justify-center text-trichomes-forest/70 hover:bg-trichomes-primary hover:text-white transition-all duration-150 ease-out hover:scale-110"
                                >
                                    <TiktokIcon className="w-5 h-5" />
                                </a>
                                <a
                                    href="https://x.com/trichome"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-10 h-10 bg-trichomes-forest/10 rounded-full flex items-center justify-center text-trichomes-forest/70 hover:bg-trichomes-primary hover:text-white transition-all duration-150 ease-out hover:scale-110"
                                >
                                    <XIcon className="w-5 h-5" />
                                </a>
                            </div>
                            <div className="text-center md:text-left">
                                <p className="text-trichomes-forest/70 text-[13px] sm:text-[14px] mb-2 font-body font-medium">
                                    Contact Us:
                                </p>
                                <p className="text-trichomes-forest text-[13px] sm:text-[14px] font-medium mb-1 font-body">
                                    support@trichome.com
                                </p>
                                <p className="text-trichomes-forest text-[13px] sm:text-[14px] font-medium font-body">
                                    +234 123 456 7890
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar - Design Guide: Clean spacing */}
                <div className="border-t border-trichomes-forest/20 mt-8 sm:mt-12 pt-6 sm:pt-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-3 sm:gap-4">
                        <p className="text-trichomes-forest/70 text-[12px] sm:text-[14px] text-center md:text-left font-body font-normal">
                            © {new Date().getFullYear()} Trichomes. All rights reserved.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-[12px] sm:text-[14px] text-trichomes-forest/70">
                            <Link href="/privacy" className="hover:text-trichomes-primary transition-colors duration-150 font-body font-normal">
                                Privacy Policy
                            </Link>
                            <Link href="/terms" className="hover:text-trichomes-primary transition-colors duration-150 font-body font-normal">
                                Terms of Service
                            </Link>
                            <Link href="/returns" className="hover:text-trichomes-primary transition-colors duration-150 font-body font-normal">
                                Return Policy
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

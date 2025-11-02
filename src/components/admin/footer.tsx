import React from 'react';
import { WhatsAppIcon, InstagramIcon, FacebookIcon, TiktokIcon, XIcon } from '../ui/icons'
import Image from 'next/image';
import Link from 'next/link';

export const Footer: React.FC = () => {
    return (
        <footer className="bg-gradient-to-br from-green-900 via-green-800 to-green-900 text-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Logo Section */}
                    <div className="lg:col-span-3">
                        <Link href="/" className="inline-block mb-6">
                           <Image src="/T3.png" alt="Trichomes Logo" width={150} height={100} className="object-contain brightness-0 invert" />
                        </Link>
                        <p className="text-green-100 text-sm leading-relaxed">
                            Your trusted partner in premium beauty and skincare products.
                        </p>
                    </div>

                    {/* Newsletter Section */}
                    <div className="lg:col-span-4">
                        <h3 className="text-xl font-bold mb-3 text-white">Stay In The Loop</h3>
                        <p className="text-green-100 mb-6 text-sm">
                            Get the latest product drops, exclusive offers, and beauty tips straight to your inbox.
                        </p>
                        <form className="flex">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="flex-grow bg-white/10 backdrop-blur-sm text-white placeholder-green-200 px-4 py-3 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-green-400 border border-green-700"
                            />
                            <button
                                type="submit"
                                className="bg-green-600 text-white font-semibold px-6 py-3 rounded-r-lg hover:bg-green-500 transition-colors whitespace-nowrap"
                            >
                                Subscribe
                            </button>
                        </form>
                    </div>

                    {/* Links Section */}
                    <div className="lg:col-span-5 grid grid-cols-2 md:grid-cols-3 gap-8">
                        <div>
                            <h4 className="font-bold mb-4 text-lg text-white">Quick Links</h4>
                            <ul className="space-y-3 text-green-100 text-sm">
                                <li><Link href="/about" className="hover:text-white hover:translate-x-1 inline-block transition-all">About Us</Link></li>
                                <li><Link href="/consultation" className="hover:text-white hover:translate-x-1 inline-block transition-all">Book Consultation</Link></li>
                                <li><Link href="/shop" className="hover:text-white hover:translate-x-1 inline-block transition-all">Shop</Link></li>
                                <li><Link href="/brands" className="hover:text-white hover:translate-x-1 inline-block transition-all">Brands</Link></li>
                                <li><Link href="/products" className="hover:text-white hover:translate-x-1 inline-block transition-all">Products</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold mb-4 text-lg text-white">My Account</h4>
                            <ul className="space-y-3 text-green-100 text-sm">
                                <li><Link href="/profile" className="hover:text-white hover:translate-x-1 inline-block transition-all">Profile</Link></li>
                                <li><Link href="/order-history" className="hover:text-white hover:translate-x-1 inline-block transition-all">Order History</Link></li>
                                <li><Link href="/track-order" className="hover:text-white hover:translate-x-1 inline-block transition-all">Track Order</Link></li>
                                <li><Link href="/cart" className="hover:text-white hover:translate-x-1 inline-block transition-all">Cart</Link></li>
                                <li><Link href="/wishlist" className="hover:text-white hover:translate-x-1 inline-block transition-all">Wishlist</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold mb-4 text-lg text-white">Connect With Us</h4>
                            <div className="flex space-x-3 mb-6">
                                <a href="https://wa.me/your-number" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-green-100 hover:bg-green-600 hover:text-white transition-all hover:scale-110">
                                    <WhatsAppIcon className="w-5 h-5" />
                                </a>
                                <a href="https://instagram.com/trichome" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-green-100 hover:bg-green-600 hover:text-white transition-all hover:scale-110">
                                    <InstagramIcon className="w-5 h-5" />
                                </a>
                                <a href="https://facebook.com/trichome" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-green-100 hover:bg-green-600 hover:text-white transition-all hover:scale-110">
                                    <FacebookIcon className="w-5 h-5" />
                                </a>
                                <a href="https://tiktok.com/@trichome" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-green-100 hover:bg-green-600 hover:text-white transition-all hover:scale-110">
                                    <TiktokIcon className="w-5 h-5" />
                                </a>
                                <a href="https://x.com/trichome" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-green-100 hover:bg-green-600 hover:text-white transition-all hover:scale-110">
                                    <XIcon className="w-5 h-5" />
                                </a>
                            </div>
                            <p className="text-green-100 text-sm mb-2">Contact Us:</p>
                            <p className="text-white text-sm font-medium">support@trichome.com</p>
                            <p className="text-white text-sm font-medium">+234 123 456 7890</p>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-green-700 mt-12 pt-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-green-100 text-sm">
                            © {new Date().getFullYear()} Trichome. All rights reserved.
                        </p>
                        <div className="flex gap-6 text-sm text-green-100">
                            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
                            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
                            <Link href="/returns" className="hover:text-white transition-colors">Return Policy</Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

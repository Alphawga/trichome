import React from 'react';
import { LogoIcon, WhatsAppIcon, InstagramIcon, FacebookIcon, TiktokIcon, XIcon } from '../ui/icons'
import Image from 'next/image';

// type View = 'home' | 'shop' | 'product' | 'cart' | 'tracking' | 'history' | 'account' | 'signIn' | 'signUp' | 'forgotPassword' | 'resetPassword' | 'passwordResetSuccess' | 'checkout' | 'profile' | 'wishlist';

// interface FooterProps {
//     onNavigate: (view: View) => void;
// }

export const Footer: React.FC = () => {
    return (
        <footer className="bg-[#343A40] text-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    <div className="lg:col-span-3">
                        <a href="#" onClick={(e) => { e.preventDefault(); }} className="flex items-center mb-4">
                           <Image src="/T3.png" alt="Trichomes Logo" width={150} height={100} className="object-contain" />    </a>
                    </div>
                    <div className="lg:col-span-4">
                        <h3 className="text-xl font-bold mb-2">Down for more? We got you.</h3>
                        <p className="text-gray-400 mb-4">All the latest product drops, limited offers, in-store event info—straight to your inbox.</p>
                        <form className="flex">
                            <input type="email" placeholder="Email address" className="flex-grow bg-gray-700 text-white placeholder-gray-400 px-4 py-3 rounded-l-md focus:outline-none focus:ring-2 focus:ring-[#D4C394]" />
                            <button type="submit" className="bg-[#D4C394] text-black font-semibold px-6 py-3 rounded-r-md hover:bg-opacity-90 transition-colors">Subscribe</button>
                        </form>
                    </div>
                    <div className="lg:col-span-5 grid grid-cols-2 md:grid-cols-3 gap-8">
                        <div>
                            <h4 className="font-bold mb-4">Information</h4>
                            <ul className="space-y-2 text-gray-400">
                                <li><a href="#" className="hover:text-white">About US</a></li>
                                <li><a href="#" className="hover:text-white">Contact</a></li>
                                <li><a href="#" onClick={(e) => { e.preventDefault();  }} className="hover:text-white">Shop</a></li>
                                <li><a href="#" className="hover:text-white">Return policy</a></li>
                                <li><a href="#" className="hover:text-white">Shipping policy</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold mb-4">Account</h4>
                            <ul className="space-y-2 text-gray-400">
                                <li><a href="#" onClick={(e) => { e.preventDefault();  }} className="hover:text-white">Track orders</a></li>
                                <li><a href="#" onClick={(e) => { e.preventDefault();  }} className="hover:text-white">Sign In</a></li>
                                <li><a href="#" onClick={(e) => { e.preventDefault();  }} className="hover:text-white">Cart</a></li>
                                <li><a href="#" onClick={(e) => { e.preventDefault();  }} className="hover:text-white">Wishlist</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold mb-4">Our socials</h4>
                            <div className="flex space-x-4">
                                <a href="#" className="text-gray-400 hover:text-white"><WhatsAppIcon /></a>
                                <a href="#" className="text-gray-400 hover:text-white"><InstagramIcon /></a>
                                <a href="#" className="text-gray-400 hover:text-white"><FacebookIcon /></a>
                                <a href="#" className="text-gray-400 hover:text-white"><TiktokIcon /></a>
                                <a href="#" className="text-gray-400 hover:text-white"><XIcon /></a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

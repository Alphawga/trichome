'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../contexts/auth-context';
import { Header } from '@/components/layout/header';
import { useSession } from "next-auth/react";
import { trpc } from '@/utils/trpc';


// Temporary interface for migration
interface CartItem {
  id: number;
  name: string;
  price: number;
  currency: string;
  quantity: number;
}

interface CheckoutForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();
  const { data: session } = useSession();

  useEffect(() => {
    // Redirect to account page if not authenticated
    if (!isLoading && !isAuthenticated) {
      localStorage.setItem('trichomes_checkout_redirect', 'true');
      router.push('/account');
    }
  }, [isAuthenticated, isLoading, router]);

  // // Mock cart data - will be replaced with global state/context
  // const [cartItems] = useState<CartItem[]>([
  //   {
  //     id: 1,
  //     name: 'La Roche-Posay Effaclar Purifying Foaming Gel Refill 400ml',
  //     price: 15800.00,
  //     currency: '₦',
  //     quantity: 2
  //   },
  //   {
  //     id: 3,
  //     name: 'CeraVe Foaming Cleanser 236ml',
  //     price: 12500.00,
  //     currency: '₦',
  //     quantity: 1
  //   }
  // ]);

  const cartQuery = trpc.getCart.useQuery(undefined, {
    enabled: isAuthenticated,
    refetchOnWindowFocus: false,
  });
  
  const cartItems = cartQuery.data?.items || [];
  const subtotal = cartQuery.data?.total || 0;
  const shipping = subtotal > 0 ? 4500.00 : 0;
  const tax = subtotal * 0.075;
  const total = subtotal + shipping + tax;
  
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  

  const [form, setForm] = useState<CheckoutForm>({
    firstName: session?.user.first_name || '',
    lastName: session?.user.last_name || '',
    email: session?.user.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: ''
  });

  const [isProcessing, setIsProcessing] = useState(false);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    // Dynamically import Monnify only on client side
    if (typeof window === 'undefined') {
      setIsProcessing(false);
      return;
    }

    try {
      const Monnify = (await import('monnify-js')).default;
      const monnify = new Monnify(
        process.env.NEXT_PUBLIC_MONNIFY_API_KEY || '',
        process.env.NEXT_PUBLIC_MONNIFY_CONTRACT_CODE || ''
      );

      const paymentData = {
        amount: `${total}`, // in Naira
        currency: "NGN",
        customerName: `${form.firstName} ${form.lastName}`,
        customerEmail: `${form.email}`,
        paymentReference: "REF" + Date.now(),
        apiKey: process.env.NEXT_PUBLIC_MONNIFY_API_KEY || '',
        contractCode: process.env.NEXT_PUBLIC_MONNIFY_CONTRACT_CODE || '',
      };

      monnify.initializePayment({
        amount: paymentData.amount,
        currency: paymentData.currency,
        reference: paymentData.paymentReference,
        customerFullName: paymentData.customerName,
        customerEmail: paymentData.customerEmail,
        apiKey: paymentData.apiKey,
        contractCode: paymentData.contractCode,
        paymentDescription: "Trichome Product Payment",
        isTestMode: true,
        metadata: {
          'customData': "Trichome Product Payment",
        },
        onLoadStart: () => console.log("Loading Monnify..."),
        onLoadComplete: () => console.log("Monnify loaded"),

        onComplete: (response: any) => {
          console.log("Payment response: ", response);
          setIsProcessing(false);

          if (response.paymentStatus === "PAID") {
            router.push("/order-confirmation");
          } else {
            alert("Payment not successful. Please try again.");
          }
        },

        onClose: () => {
          console.log("Monnify modal closed");
          setIsProcessing(false);
        },
      });
    } catch (error) {
      console.error("Error initializing payment:", error);
      setIsProcessing(false);
      alert("Failed to initialize payment. Please try again.");
    }
  };

  const isFormValid = form.firstName && form.lastName && form.email && form.address && form.city;

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-trichomes-soft">
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 max-w-7xl">
          <div className="text-center py-12 sm:py-20 bg-white rounded-xl border border-trichomes-forest/10 shadow-sm">
            <h1 className="text-[20px] sm:text-[24px] font-heading font-semibold text-trichomes-forest mb-3 sm:mb-4">Your cart is empty</h1>
            <p className="text-trichomes-forest/60 font-body mb-4 sm:mb-6">Add some products before checking out.</p>
            <Link href="/" className="inline-block bg-trichomes-primary text-white py-3 px-6 sm:px-8 rounded-full hover:bg-trichomes-primary/90 font-semibold transition-all duration-150 ease-out hover:shadow-lg text-[14px] sm:text-[15px] font-body">
              Continue shopping
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-trichomes-soft">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-12 sm:pb-16 max-w-7xl">
        {/* Breadcrumb */}
        <div className="text-sm text-trichomes-forest/60 mb-6 sm:mb-8 font-body">
          <Link href="/cart" className="hover:text-trichomes-forest transition-colors duration-150">← Back to cart</Link>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 lg:gap-12">
          {/* Shipping Address Form */}
          <div className="lg:w-2/3">
            <h1 className="text-[24px] sm:text-[32px] font-heading font-semibold mb-4 sm:mb-6 text-trichomes-forest">Shipping Information</h1>

            <div className="bg-white p-6 sm:p-8 rounded-xl border border-trichomes-forest/10 shadow-sm">
              <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label htmlFor="firstName" className="block text-[14px] sm:text-[15px] font-medium text-trichomes-forest mb-1 font-body">
                    First Name*
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    required
                    value={form.firstName}
                    onChange={handleInputChange}
                    placeholder="First name"
                    className="w-full px-4 py-3 border border-trichomes-forest/20 rounded-lg bg-white focus:ring-2 focus:ring-trichomes-primary focus:border-trichomes-primary outline-none text-trichomes-forest font-body"
                  />
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-[14px] sm:text-[15px] font-medium text-trichomes-forest mb-1 font-body">
                    Last Name*
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    required
                    value={form.lastName}
                    onChange={handleInputChange}
                    placeholder="Last name"
                    className="w-full px-4 py-3 border border-trichomes-forest/20 rounded-lg bg-white focus:ring-2 focus:ring-trichomes-primary focus:border-trichomes-primary outline-none text-trichomes-forest font-body"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-[14px] sm:text-[15px] font-medium text-trichomes-forest mb-1 font-body">
                    Email Address*
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={form.email}
                    onChange={handleInputChange}
                    placeholder="your@email.com"
                    className="w-full px-4 py-3 border border-trichomes-forest/20 rounded-lg bg-white focus:ring-2 focus:ring-trichomes-primary focus:border-trichomes-primary outline-none text-trichomes-forest font-body"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-[14px] sm:text-[15px] font-medium text-trichomes-forest mb-1 font-body">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={form.phone}
                    onChange={handleInputChange}
                    placeholder="+234 XXX XXX XXXX"
                    className="w-full px-4 py-3 border border-trichomes-forest/20 rounded-lg bg-white focus:ring-2 focus:ring-trichomes-primary focus:border-trichomes-primary outline-none text-trichomes-forest font-body"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="address" className="block text-[14px] sm:text-[15px] font-medium text-trichomes-forest mb-1 font-body">
                    Street Address*
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    required
                    value={form.address}
                    onChange={handleInputChange}
                    placeholder="Street address"
                    className="w-full px-4 py-3 border border-trichomes-forest/20 rounded-lg bg-white focus:ring-2 focus:ring-trichomes-primary focus:border-trichomes-primary outline-none text-trichomes-forest font-body"
                  />
                </div>

                <div>
                  <label htmlFor="city" className="block text-[14px] sm:text-[15px] font-medium text-trichomes-forest mb-1 font-body">
                    City*
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    required
                    value={form.city}
                    onChange={handleInputChange}
                    placeholder="City"
                    className="w-full px-4 py-3 border border-trichomes-forest/20 rounded-lg bg-white focus:ring-2 focus:ring-trichomes-primary focus:border-trichomes-primary outline-none text-trichomes-forest font-body"
                  />
                </div>

                <div>
                  <label htmlFor="state" className="block text-[14px] sm:text-[15px] font-medium text-trichomes-forest mb-1 font-body">
                    State
                  </label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={form.state}
                    onChange={handleInputChange}
                    placeholder="State"
                    className="w-full px-4 py-3 border border-trichomes-forest/20 rounded-lg bg-white focus:ring-2 focus:ring-trichomes-primary focus:border-trichomes-primary outline-none text-trichomes-forest font-body"
                  />
                </div>

                <div>
                  <label htmlFor="zipCode" className="block text-[14px] sm:text-[15px] font-medium text-trichomes-forest mb-1 font-body">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    id="zipCode"
                    name="zipCode"
                    value={form.zipCode}
                    onChange={handleInputChange}
                    placeholder="Postal code"
                    className="w-full px-4 py-3 border border-trichomes-forest/20 rounded-lg bg-white focus:ring-2 focus:ring-trichomes-primary focus:border-trichomes-primary outline-none text-trichomes-forest font-body"
                  />
                </div>
              </form>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:w-1/3">
            <h2 className="text-[20px] sm:text-[24px] font-heading font-semibold mb-4 sm:mb-6 text-trichomes-forest">Order Summary</h2>

            <div className="bg-white p-4 sm:p-6 rounded-xl border border-trichomes-forest/10 sticky top-8 shadow-sm">
              {/* Order Items */}
              <div className="mb-4 sm:mb-6">
                <h3 className="font-heading font-semibold text-[15px] sm:text-[16px] mb-3 sm:mb-4 text-trichomes-forest">Items ({cartItems.length})</h3>
                <div className="space-y-3">
                  {cartItems.map(item => (
                    <div key={item.id} className="flex justify-between items-start text-[13px] sm:text-[14px] font-body">
                      <div className="flex-1">
                        <p className="font-medium text-trichomes-forest">{item.product.name}</p>
                        <p className="text-trichomes-forest/60">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-semibold ml-4 text-trichomes-forest">
                      ₦{(Number(item.product.price) * item.quantity).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Totals */}
              <div className="space-y-3 text-trichomes-forest/70 border-t border-trichomes-forest/20 pt-4 font-body">
                <div className="flex justify-between text-[14px] sm:text-[15px]">
                  <span>Subtotal</span>
                  <span className="font-semibold">₦{subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-[14px] sm:text-[15px]">
                  <span>Shipping</span>
                  <span className="font-semibold">₦{shipping.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-[14px] sm:text-[15px]">
                  <span>Tax (7.5%)</span>
                  <span className="font-semibold">₦{tax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>

                <hr className="my-3 border-trichomes-forest/20"/>

                <div className="flex justify-between text-[18px] sm:text-[20px] font-heading font-semibold text-trichomes-forest">
                  <span>Total</span>
                  <span>₦{total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={!isFormValid || isProcessing}
                className="w-full bg-trichomes-gold text-trichomes-forest py-3 sm:py-4 mt-4 sm:mt-6 rounded-full hover:bg-trichomes-gold-hover font-semibold disabled:bg-trichomes-forest/20 disabled:cursor-not-allowed transition-all duration-150 ease-out hover:shadow-lg text-[14px] sm:text-[15px] font-body"
              >
                {isProcessing ? 'Processing...' : 'Continue to Payment'}
              </button>

              <div className="mt-4 text-center">
                <button className="text-trichomes-primary hover:text-trichomes-forest underline text-[12px] sm:text-[13px] font-body transition-colors duration-150">
                  Use promo code
                </button>
              </div>

              <div className="mt-6 pt-6 border-t border-trichomes-forest/20 text-[11px] sm:text-[12px] text-trichomes-forest/60 font-body space-y-2">
                <p className="flex items-center">
                  <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  Secure 256-bit SSL encryption
                </p>
                <p className="flex items-center">
                  <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Money-back guarantee
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
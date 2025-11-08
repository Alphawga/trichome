'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../contexts/auth-context';
import { Header } from '@/components/layout/header';
import { useSession } from "next-auth/react";
import  Monnify  from  'monnify-js';
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

  const  monnify = new  Monnify(process.env.NEXT_PUBLIC_MONNIFY_API_KEY, process.env.NEXT_PUBLIC_MONNIFY_CONTRACT_CODE);

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
    const paymentData = {
      amount: `${total}`, // in Naira
      currency: "NGN",
      customerName: `${form.firstName} ${form.lastName}`	,
      customerEmail: `${form.email}`,
      paymentReference: "REF" + Date.now(),
      apiKey: process.env.NEXT_PUBLIC_MONNIFY_API_KEY,
      contractCode: process.env.NEXT_PUBLIC_MONNIFY_CONTRACT_CODE,
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
				'customData':  "Trichome Product Payment",
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
  };

  const isFormValid = form.firstName && form.lastName && form.email && form.address && form.city;

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] text-[#343A40]">
        
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-20">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
            <p className="text-gray-600 mb-6">Add some products before checking out.</p>
            <Link href="/" className="bg-green-600 text-white py-2 px-6 rounded-md hover:bg-green-700 font-medium">
              Continue shopping
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
 
    <div className="min-h-screen bg-[#F8F9FA] text-[#343A40]">
      {/* <Header cartCount={cartCount} wishlistCount={0} /> */}

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-500 mb-6">
          <Link href="/cart" className="hover:underline">← Back to cart</Link>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Shipping Address Form */}
          <div className="lg:w-2/3">
            <h1 className="text-2xl font-bold mb-6">Shipping Information</h1>

            <div className="bg-white p-8 rounded-lg border">
              <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-[#E9ECEF] focus:ring-green-500 focus:border-green-500 outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-[#E9ECEF] focus:ring-green-500 focus:border-green-500 outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-[#E9ECEF] focus:ring-green-500 focus:border-green-500 outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={form.phone}
                    onChange={handleInputChange}
                    placeholder="+234 XXX XXX XXXX"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-[#E9ECEF] focus:ring-green-500 focus:border-green-500 outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-[#E9ECEF] focus:ring-green-500 focus:border-green-500 outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-[#E9ECEF] focus:ring-green-500 focus:border-green-500 outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={form.state}
                    onChange={handleInputChange}
                    placeholder="State"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-[#E9ECEF] focus:ring-green-500 focus:border-green-500 outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    id="zipCode"
                    name="zipCode"
                    value={form.zipCode}
                    onChange={handleInputChange}
                    placeholder="Postal code"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-[#E9ECEF] focus:ring-green-500 focus:border-green-500 outline-none"
                  />
                </div>
              </form>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:w-1/3">
            <h2 className="text-2xl font-bold mb-6">Order Summary</h2>

            <div className="bg-white p-6 rounded-lg border sticky top-8">
              {/* Order Items */}
              <div className="mb-6">
                <h3 className="font-semibold mb-4">Items ({cartItems.length})</h3>
                <div className="space-y-3">
                  {cartItems.map(item => (
                    <div key={item.id} className="flex justify-between items-start text-sm">
                      <div className="flex-1">
                        <p className="font-medium">{item.product.name}</p>
                        <p className="text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-medium ml-4">
                      ₦{(Number(item.product.price) * item.quantity).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Totals */}
              <div className="space-y-3 text-gray-700 border-t pt-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₦{subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>₦{shipping.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (7.5%)</span>
                  <span>₦{tax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>

                <hr className="my-3"/>

                <div className="flex justify-between text-lg font-bold text-black">
                  <span>Total</span>
                  <span>₦{total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={!isFormValid || isProcessing}
                className="w-full bg-green-600 text-white py-3 mt-6 rounded-lg hover:bg-green-700 font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isProcessing ? 'Processing...' : 'Continue to Payment'}
              </button>

              <div className="mt-4 text-center">
                <button className="text-green-600 hover:underline text-sm">
                  Use promo code
                </button>
              </div>

              <div className="mt-6 pt-6 border-t text-xs text-gray-500">
                <p className="flex items-center mb-2">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  Secure 256-bit SSL encryption
                </p>
                <p className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
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
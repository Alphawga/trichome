'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRightIcon } from '@/components/ui/icons';

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
      {/* Breadcrumbs */}
      <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-gray-700">Home</Link>
        <ChevronRightIcon className="w-4 h-4" />
        <span className="text-gray-900 font-medium">About Us</span>
      </nav>

      {/* Hero Section */}
      <div className="mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-6">
          About Trichome
        </h1>
        <p className="text-lg text-gray-600 text-center max-w-3xl mx-auto">
          Your trusted partner in premium beauty and skincare. We're dedicated to helping you discover
          the perfect products that enhance your natural beauty and boost your confidence.
        </p>
      </div>

      {/* Our Story */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        <div>
          <h2 className="text-3xl font-bold mb-6">Our Story</h2>
          <div className="space-y-4 text-gray-700">
            <p>
              Founded with a passion for quality and authenticity, Trichome has become Nigeria's
              premier destination for premium beauty and skincare products. Our journey began with
              a simple mission: to make authentic, high-quality beauty products accessible to everyone.
            </p>
            <p>
              We carefully curate our collection from the world's most trusted brands, ensuring that
              every product meets our rigorous standards for quality, efficacy, and safety. From
              everyday essentials to luxury treatments, we offer a comprehensive range that caters
              to all skin types and beauty needs.
            </p>
            <p>
              What sets us apart is our commitment to education and personalized service. We don't
              just sell products – we help you understand your skin, choose the right products, and
              build effective routines that deliver real results.
            </p>
          </div>
        </div>

        <div className="relative h-96 lg:h-auto rounded-lg overflow-hidden bg-gradient-to-br from-green-100 to-green-50">
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-32 h-32 text-green-600 opacity-20" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Our Values */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-12">Our Values</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-bold text-xl mb-3">Authenticity</h3>
            <p className="text-gray-600">
              We guarantee 100% authentic products sourced directly from authorized distributors
              and brand partners. No fakes, no compromises.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="font-bold text-xl mb-3">Education</h3>
            <p className="text-gray-600">
              We believe in empowering our customers with knowledge. Our team provides expert
              guidance to help you make informed decisions.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 className="font-bold text-xl mb-3">Customer Care</h3>
            <p className="text-gray-600">
              Your satisfaction is our priority. From personalized recommendations to responsive
              support, we're here for you every step of the way.
            </p>
          </div>
        </div>
      </div>

      {/* Why Choose Us */}
      <div className="bg-green-50 rounded-lg p-8 md:p-12 mb-16">
        <h2 className="text-3xl font-bold text-center mb-8">Why Choose Trichome?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-6 h-6 bg-green-600 rounded-full flex items-center justify-center mt-1">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold mb-1">Curated Selection</h4>
              <p className="text-sm text-gray-600">
                Every product is handpicked by our beauty experts for quality and effectiveness.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-6 h-6 bg-green-600 rounded-full flex items-center justify-center mt-1">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold mb-1">Expert Consultations</h4>
              <p className="text-sm text-gray-600">
                Free personalized consultations to help you find the perfect products for your skin.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-6 h-6 bg-green-600 rounded-full flex items-center justify-center mt-1">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold mb-1">Fast & Reliable Delivery</h4>
              <p className="text-sm text-gray-600">
                Quick dispatch and secure packaging to ensure your products arrive in perfect condition.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-6 h-6 bg-green-600 rounded-full flex items-center justify-center mt-1">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold mb-1">Easy Returns</h4>
              <p className="text-sm text-gray-600">
                Not satisfied? We offer hassle-free returns within 30 days of purchase.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-6 h-6 bg-green-600 rounded-full flex items-center justify-center mt-1">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold mb-1">Secure Payments</h4>
              <p className="text-sm text-gray-600">
                Multiple payment options with secure encryption to protect your information.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-6 h-6 bg-green-600 rounded-full flex items-center justify-center mt-1">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold mb-1">Loyalty Rewards</h4>
              <p className="text-sm text-gray-600">
                Earn points on every purchase and enjoy exclusive discounts and early access to new products.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="text-center bg-gradient-to-r from-green-900 via-green-600 to-green-900 rounded-lg p-12 text-white">
        <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Beauty Routine?</h2>
        <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
          Discover our curated collection of premium products and start your journey to radiant, healthy skin today.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/shop"
            className="inline-block bg-white text-green-600 px-8 py-3 rounded-lg hover:bg-gray-100 font-semibold transition-colors"
          >
            Start Shopping
          </Link>
          <Link
            href="/consultation"
            className="inline-block border-2 border-white text-white px-8 py-3 rounded-lg hover:bg-white hover:text-green-600 font-semibold transition-colors"
          >
            Book Consultation
          </Link>
        </div>
      </div>
    </div>
  );
}

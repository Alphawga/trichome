"use client";

import Image from "next/image";
import Link from "next/link";

import { ChevronRightIcon } from "@/components/ui/icons";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Header Section */}
      <div className="relative w-full h-[300px] sm:h-[350px] lg:h-[400px] animate-[sectionEntrance_600ms_ease-out]">
        {/* Background Image */}
        <div className="absolute inset-0">
          <div 
            className="w-full h-full bg-cover bg-center"
            style={{ backgroundImage: "url('/banners/about-us.jpg')" }}
          />
          {/* Gradient Overlay - Warm beige/taupe tone */}
          <div 
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(to left, rgba(166, 147, 142, 0.88), rgba(166, 147, 142, 0.70), rgba(166, 147, 142, 0.35))'
            }}
          ></div>
        </div>

        {/* Content */}
        <div className="relative h-full mx-auto px-4 sm:px-6 lg:px-8 max-w-[2200px] flex flex-col justify-center">
          <div className="flex flex-col items-start max-w-2xl">
            {/* Main Title */}
            <h1 className="text-[40px] sm:text-[48px] lg:text-[56px] font-heading text-white leading-tight mb-4 animate-[fadeInUp_400ms_cubic-bezier(0.16,1,0.3,1)]">
              About Us
            </h1>

            {/* Breadcrumbs */}
            <nav 
              className="flex items-center space-x-2 animate-[fadeInUp_400ms_cubic-bezier(0.16,1,0.3,1)]"
              style={{ animationDelay: "100ms", animationFillMode: "both" }}
            >
              <Link
                href="/"
                className="text-[14px] text-white/80 hover:text-white transition-colors duration-150 ease-out font-body"
              >
                Home
              </Link>
              <ChevronRightIcon className="w-4 h-4 text-white/60" />
              <span className="text-[14px] text-white font-body">
                About Us
              </span>
            </nav>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 pb-16 sm:pb-20 max-w-[1440px] animate-[sectionEntrance_600ms_ease-out]">
        <div className="max-w-5xl mx-auto">
          {/* Welcome Text */}
          <p
            className="text-[16px] sm:text-[17px] lg:text-[18px] text-gray-600 font-body mb-8 sm:mb-10 leading-relaxed animate-[fadeInUp_400ms_cubic-bezier(0.16,1,0.3,1)]"
          >
            Welcome to Trichomes, your integrated digital skincare sanctuary.
          </p>

            {/* Our Purpose Section */}
            <div
              className="bg-gray-50 rounded-sm p-6 sm:p-8 mb-6 sm:mb-8 border border-gray-200 animate-[fadeInUp_400ms_cubic-bezier(0.16,1,0.3,1)]"
              style={{ animationDelay: "100ms", animationFillMode: "both" }}
            >
              <h2 className="text-[18px] sm:text-[20px] font-heading text-gray-900 mb-3 font-medium">
                Our Purpose
              </h2>
              <p className="text-[15px] sm:text-[16px] text-gray-600 font-body leading-relaxed">
                To make self-care accessible for all.
              </p>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 mb-6 sm:mb-8"></div>

            {/* Our Mission and Vision - Two Columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
              {/* Our Mission */}
              <div
                className="bg-gray-50 rounded-sm p-5 sm:p-6 border border-gray-200 animate-[fadeInUp_400ms_cubic-bezier(0.16,1,0.3,1)]"
                style={{ animationDelay: "200ms", animationFillMode: "both" }}
              >
                <h2 className="text-[18px] sm:text-[20px] font-heading text-gray-900 mb-3 font-medium">
                  Mission
                </h2>
                <p className="text-[14px] sm:text-[15px] text-gray-600 font-body leading-relaxed">
                  To bridge the gap in accessible, quality skincare in Nigeria
                  by providing expert consultations, educational resources, and
                  a curated selection of premium products that empower
                  individuals to achieve their skincare goals.
                </p>
              </div>

              {/* Our Vision */}
              <div
                className="bg-gray-50 rounded-sm p-5 sm:p-6 border border-gray-200 animate-[fadeInUp_400ms_cubic-bezier(0.16,1,0.3,1)]"
                style={{ animationDelay: "300ms", animationFillMode: "both" }}
              >
                <h2 className="text-[18px] sm:text-[20px] font-heading text-gray-900 mb-3 font-medium">
                  Vision
                </h2>
                <p className="text-[14px] sm:text-[15px] text-gray-600 font-body leading-relaxed">
                  To become Africa's leading integrated digital platform for
                  skincare education, consultation, and product discovery, where
                  science meets nature and self-care becomes accessible to
                  everyone.
                </p>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 mb-6 sm:mb-8"></div>

            {/* Our Approach Section */}
            <div className="mb-6 sm:mb-8">
              <h2 className="text-[18px] sm:text-[20px] font-heading text-gray-900 mb-3 font-medium">
                Our Approach
              </h2>
              <p className="text-[16px] sm:text-[18px] font-body text-gray-900 mb-3 font-medium">
                Educate. Consult. Shop
              </p>
              <p className="text-[15px] sm:text-[16px] text-gray-600 font-body leading-relaxed">
                We believe in a three-pronged approach to skincare: first, we
                educate you about your skin and the products available. Then, we
                provide expert consultations to help you find the right
                solutions. Finally, we offer a curated selection of premium
                products to help you achieve your skincare goals.
              </p>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 mb-6 sm:mb-8"></div>

            {/* Educate First Section */}
            <div className="bg-gray-50 rounded-sm p-6 sm:p-8 border border-gray-200">
              <h2 className="text-[18px] sm:text-[20px] font-heading text-gray-900 mb-4 font-medium">
                Educate First
              </h2>
              <div className="space-y-4">
                <p className="text-[15px] sm:text-[16px] text-gray-600 font-body leading-relaxed">
                  Knowledge is the first step to healthy, radiant skin. We
                  believe that understanding your skin type, concerns, and the
                  ingredients that work best for you is essential to building an
                  effective skincare routine.
                </p>
                <p className="text-[15px] sm:text-[16px] text-gray-600 font-body leading-relaxed">
                  Our educational resources debunk myths, explain complex
                  skincare science in simple terms, and empower you to make
                  informed decisions about your skincare journey. Whether you're
                  a skincare beginner or an enthusiast, we're here to guide you
                  every step of the way.
                </p>
                <p className="text-[15px] sm:text-[16px] text-gray-600 font-body leading-relaxed">
                  We don't just sell products – we help you understand why
                  certain ingredients work, how to layer products correctly, and
                  what to expect from your skincare routine. Because when you
                  know better, you can do better.
                </p>
              </div>
            </div>
          </div>
        </div>
    </div>
  );
}

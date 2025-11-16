"use client";

import Image from "next/image";
import Link from "next/link";

import { ChevronRightIcon } from "@/components/ui/icons";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF7]">
      {/* Breadcrumbs */}
      <div className="bg-[#FAFAF7] border-b border-[#1E3024]/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
          <nav className="flex items-center space-x-2 text-[14px] text-[#1E3024]/70 font-body">
            <Link
              href="/"
              className="hover:text-[#1E3024] transition-colors duration-150"
            >
              Home
            </Link>
            <ChevronRightIcon className="w-4 h-4 text-[#1E3024]/50" />
            <span className="text-[#1E3024]">About Us</span>
          </nav>
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-120px)]">
        {/* Left Section - Store Image (40-45% on desktop) */}
        <div className="w-full lg:w-[45%] relative min-h-[400px] sm:min-h-[500px] lg:min-h-screen animate-[sectionEntrance_600ms_ease-out]">
          <Image
            src="/store.png"
            alt="Trichomes Store Interior"
            fill
            className="object-cover transition-transform duration-500 ease-out hover:scale-[1.02]"
            priority
            quality={100}
            sizes="(max-width: 1024px) 100vw, 45vw"
          />
        </div>

        {/* Right Section - Content (55-60% on desktop) */}
        <div className="w-full lg:w-[55%] bg-[#FAFAF7] overflow-y-auto">
          <div className="p-6 sm:p-8 lg:p-12 xl:p-16 max-w-4xl mx-auto">
            {/* Main Heading */}
            <h1 className="text-[40px] sm:text-[48px] lg:text-[56px] font-heading font-semibold text-[#1E3024] mb-4 sm:mb-6 leading-tight animate-[fadeInUp_400ms_cubic-bezier(0.16,1,0.3,1)]">
              About Us
            </h1>

            {/* Welcome Text */}
            <p
              className="text-[16px] sm:text-[17px] lg:text-[18px] text-[#1E3024]/70 font-body mb-8 sm:mb-10 leading-relaxed animate-[fadeInUp_400ms_cubic-bezier(0.16,1,0.3,1)]"
              style={{ animationDelay: "100ms", animationFillMode: "both" }}
            >
              Welcome to Trichomes, your integrated digital skincare sanctuary.
            </p>

            {/* Our Purpose Section */}
            <div
              className="bg-[#E6E4C6] p-6 sm:p-8 mb-6 sm:mb-8 border border-[#1E3024]/10 animate-[fadeInUp_400ms_cubic-bezier(0.16,1,0.3,1)]"
              style={{ animationDelay: "200ms", animationFillMode: "both" }}
            >
              <h2 className="text-[18px] sm:text-[20px] font-body font-semibold text-[#1E3024] mb-3">
                Our Purpose
              </h2>
              <p className="text-[15px] sm:text-[16px] text-[#1E3024]/80 font-body leading-relaxed">
                To make self-care accessible for all.
              </p>
            </div>

            {/* Divider */}
            <div className="border-t border-[#1E3024]/10 mb-6 sm:mb-8"></div>

            {/* Our Mission and Vision - Two Columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
              {/* Our Mission */}
              <div
                className="bg-[#E6E4C6] p-5 sm:p-6 border border-[#1E3024]/10 animate-[fadeInUp_400ms_cubic-bezier(0.16,1,0.3,1)]"
                style={{ animationDelay: "300ms", animationFillMode: "both" }}
              >
                <h2 className="text-[18px] sm:text-[20px] font-body font-semibold text-[#1E3024] mb-3">
                  Our Mission
                </h2>
                <p className="text-[14px] sm:text-[15px] text-[#1E3024]/80 font-body leading-relaxed">
                  To bridge the gap in accessible, quality skincare in Nigeria
                  by providing expert consultations, educational resources, and
                  a curated selection of premium products that empower
                  individuals to achieve their skincare goals.
                </p>
              </div>

              {/* Our Vision */}
              <div
                className="bg-[#E6E4C6] p-5 sm:p-6 border border-[#1E3024]/10 animate-[fadeInUp_400ms_cubic-bezier(0.16,1,0.3,1)]"
                style={{ animationDelay: "400ms", animationFillMode: "both" }}
              >
                <h2 className="text-[18px] sm:text-[20px] font-body font-semibold text-[#1E3024] mb-3">
                  Our Vision
                </h2>
                <p className="text-[14px] sm:text-[15px] text-[#1E3024]/80 font-body leading-relaxed">
                  To become Africa's leading integrated digital platform for
                  skincare education, consultation, and product discovery, where
                  science meets nature and self-care becomes accessible to
                  everyone.
                </p>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-[#1E3024]/10 mb-6 sm:mb-8"></div>

            {/* Our Approach Section */}
            <div className="mb-6 sm:mb-8">
              <h2 className="text-[18px] sm:text-[20px] font-body font-semibold text-[#1E3024] mb-3">
                Our Approach
              </h2>
              <p className="text-[16px] sm:text-[18px] font-body font-semibold text-[#1E3024] mb-3">
                Educate. Consult. Shop
              </p>
              <p className="text-[15px] sm:text-[16px] text-[#1E3024]/80 font-body leading-relaxed">
                We believe in a three-pronged approach to skincare: first, we
                educate you about your skin and the products available. Then, we
                provide expert consultations to help you find the right
                solutions. Finally, we offer a curated selection of premium
                products to help you achieve your skincare goals.
              </p>
            </div>

            {/* Divider */}
            <div className="border-t border-[#1E3024]/10 mb-6 sm:mb-8"></div>

            {/* Educate First Section */}
            <div className="bg-[#E6E4C6] p-6 sm:p-8 border border-[#1E3024]/10">
              <h2 className="text-[18px] sm:text-[20px] font-body font-semibold text-[#1E3024] mb-4">
                Educate First
              </h2>
              <div className="space-y-4">
                <p className="text-[15px] sm:text-[16px] text-[#1E3024]/80 font-body leading-relaxed">
                  Knowledge is the first step to healthy, radiant skin. We
                  believe that understanding your skin type, concerns, and the
                  ingredients that work best for you is essential to building an
                  effective skincare routine.
                </p>
                <p className="text-[15px] sm:text-[16px] text-[#1E3024]/80 font-body leading-relaxed">
                  Our educational resources debunk myths, explain complex
                  skincare science in simple terms, and empower you to make
                  informed decisions about your skincare journey. Whether you're
                  a skincare beginner or an enthusiast, we're here to guide you
                  every step of the way.
                </p>
                <p className="text-[15px] sm:text-[16px] text-[#1E3024]/80 font-body leading-relaxed">
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
    </div>
  );
}

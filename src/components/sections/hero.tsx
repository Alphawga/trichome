"use client";

import Image from "next/image";
import Link from "next/link";
import type React from "react";

export const Hero: React.FC = () => {
  return (
    <section className="relative text-trichomes-forest overflow-hidden min-h-[60vh] ">
      {/* Background image using Next/Image for optimization and control */}
      <div className="absolute inset-0">
        <Image
          src="/hero/hero-image.jpg"
          alt="Natural skincare products with coconut and botanical ingredients"
          fill
          className="object-cover object-center mt-15 md:mt-0"
          priority
          quality={100}
          sizes="100vw"
        />
      </div>

      {/* Mobile: gradient top bar to blend into the image */}
      <div className="absolute top-0 inset-x-0 h-[260px] md:hidden pointer-events-none bg-gradient-to-b from-[#E1D1C1] via-[#E1D1C1]/80 to-transparent" />

      <div className="hidden lg:block absolute inset-0 bg-[#1E3024]/10 pointer-events-none" />

      <div className="relative z-10 w-full h-full px-4  md:mx-auto  max-w-[1900px] lg:px-12 xl:px-20 py-8 sm:py-12 lg:py-20 flex flex-col justify-start lg:justify-center items-start">
        {/* Text Container - Constrained width, left-aligned */}
        <div className="w-full  max-w-md md:max-w-xl ml-5 md:ml-0">
          {/* Headline - Classy Vogue font */}
          <h1 className=" mx-auto items-center justify-center text-[48px] md:text-[64px] leading-[1.1] text-trichomes-forest tracking-tight mb-4 sm:mb-5 lg:mb-6 animate-[fadeInUp_400ms_cubic-bezier(0.16,1,0.3,1)] font-heading">
            Natural Beauty,
            <br />
            Naturally Yours
          </h1>

          {/* Body Text - Inter font - Full text on mobile */}
          <p
            className="mb-6 sm:mb-8 lg:mb-10 text-[14px] sm:text-[15px] lg:text-[17px] text-trichomes-forest/70 leading-relaxed font-normal animate-[fadeInUp_400ms_cubic-bezier(0.16,1,0.3,1)] font-body"
            style={{ animationDelay: "150ms", animationFillMode: "both" }}
          >
            Where science meets nature — luxury simplified. Discover our range
            of natural, effective skincare products crafted with care.
          </p>

          {/* CTA Button - Inter font - Rounded corners */}
          <Link
            href="/products"
            className="inline-block bg-[#407029] text-white rounded-lg font-semibold py-3 px-7 sm:py-2.5 sm:px-10 lg:py-3 lg:px-12 text-[15px] sm:text-lg hover:bg-[#528C35] transition-all duration-200 ease-out hover:shadow-lg animate-[fadeInUp_400ms_cubic-bezier(0.16,1,0.3,1)] font-body"
            style={{ animationDelay: "300ms", animationFillMode: "both" }}
          >
            Shop Now
          </Link>
        </div>
      </div>
    </section>
  );
};

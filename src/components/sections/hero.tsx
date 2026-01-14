"use client";

import Image from "next/image";
import Link from "next/link";
import type React from "react";
import { CONTENT_TYPES } from "@/lib/constants/content-types";
import { trpc } from "@/utils/trpc";

// Default/fallback content
const DEFAULTS = {
  title: "Natural Beauty,\nNaturally Yours",
  description:
    "Where science meets nature — luxury simplified. Discover our range of natural, effective skincare products crafted with care.",
  buttonText: "Shop Now",
  buttonLink: "/products",
  imageUrl: "/hero/hero-image.jpg",
};

export const Hero: React.FC = () => {
  // Fetch hero content from database
  const { data: heroContentArray } = trpc.getContentByType.useQuery(
    { type: CONTENT_TYPES.HOME_HERO },
    {
      staleTime: 60000, // Cache for 1 minute
      refetchOnWindowFocus: false,
    },
  );

  // getContentByType returns an array, get the first item
  const heroContent = heroContentArray?.[0];

  // Use database content or fallbacks
  const title = heroContent?.title || DEFAULTS.title;
  const description = heroContent?.description || DEFAULTS.description;
  const buttonText = heroContent?.button_text || DEFAULTS.buttonText;
  const buttonLink = heroContent?.button_link || DEFAULTS.buttonLink;
  const imageUrl = heroContent?.image_url || DEFAULTS.imageUrl;

  // Split title by newline for line breaks
  const titleParts = title.split("\n");

  return (
    <section className="relative text-trichomes-forest overflow-hidden min-h-[60vh] ">
      {/* Background image using Next/Image for optimization and control */}
      <div className="absolute inset-0">
        <Image
          src={imageUrl}
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
            {titleParts.map((part, index) => (
              <span key={part}>
                {part}
                {index < titleParts.length - 1 && <br />}
              </span>
            ))}
          </h1>

          {/* Body Text - Inter font - Full text on mobile */}
          <p
            className="mb-6 sm:mb-8 lg:mb-10 text-[14px] sm:text-[15px] lg:text-[17px] text-trichomes-forest/70 leading-relaxed font-normal animate-[fadeInUp_400ms_cubic-bezier(0.16,1,0.3,1)] font-body"
            style={{ animationDelay: "150ms", animationFillMode: "both" }}
          >
            {description}
          </p>

          {/* CTA Button - Inter font - Rounded corners */}
          <Link
            href={buttonLink}
            className="inline-block bg-[#407029] text-white rounded-lg font-semibold py-3 px-7 sm:py-2.5 sm:px-10 lg:py-3 lg:px-12 text-[15px] sm:text-lg hover:bg-[#528C35] transition-all duration-200 ease-out hover:shadow-lg animate-[fadeInUp_400ms_cubic-bezier(0.16,1,0.3,1)] font-body"
            style={{ animationDelay: "300ms", animationFillMode: "both" }}
          >
            {buttonText}
          </Link>
        </div>
      </div>
    </section>
  );
};

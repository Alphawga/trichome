"use client";

import Link from "next/link";
import type React from "react";
import { useEffect, useRef } from "react";
import { CloudinaryImage as Image } from "@/components/ui/cloudinary-image";

export interface HeroSlideData {
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  imageUrl?: string | null;
  videoUrl?: string | null;
}

interface HeroSlideViewProps {
  slide: HeroSlideData;
  priority?: boolean;
  /** Whether this slide is the one currently visible in a slider. Defaults to true for standalone use (e.g. the admin preview). */
  active?: boolean;
}

export const HeroSlideView: React.FC<HeroSlideViewProps> = ({
  slide,
  priority,
  active = true,
}) => {
  const { title, description, buttonText, buttonLink, imageUrl, videoUrl } =
    slide;
  const titleParts = title.split("\n");
  const videoRef = useRef<HTMLVideoElement>(null);

  // Only decode/play video for the slide that's actually visible, so off-screen
  // slides in a multi-slide rotation don't keep streaming in the background
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (active) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [active]);

  return (
    <section className="relative text-trichomes-forest overflow-hidden min-h-[60vh] w-full h-full">
      {/* Background media */}
      <div className="absolute inset-0">
        {videoUrl ? (
          <video
            ref={videoRef}
            src={videoUrl}
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
        ) : (
          <Image
            src={imageUrl || "/hero/hero-image.jpg"}
            alt={title}
            fill
            className="object-cover object-center"
            priority={priority}
            quality={100}
            sizes="100vw"
          />
        )}
      </div>

      {/* Mobile: gradient top bar to blend into the image */}
      <div className="absolute top-0 inset-x-0 h-[260px] lg:hidden pointer-events-none bg-gradient-to-b from-[#E1D1C1] via-[#E1D1C1]/80 to-transparent" />

      <div className="hidden lg:block absolute inset-0 bg-[#1E3024]/10 pointer-events-none" />

      <div className="relative z-10 w-full h-full px-4  md:mx-auto  max-w-[1900px] lg:px-12 xl:px-20 py-8 sm:py-12 lg:py-20 flex flex-col justify-start lg:justify-center items-start">
        {/* Text Container - Constrained width, left-aligned */}
        <div className="w-full  max-w-md md:max-w-xl ml-5 md:ml-0">
          {/* Headline - Classy Vogue font */}
          <h1 className=" mx-auto items-center justify-center text-[48px] sm:text-[52px] md:text-[64px] lg:text-[72px] xl:text-[80px] leading-[1.1] text-trichomes-forest tracking-tight mb-4 sm:mb-5 lg:mb-6 animate-[fadeInUp_400ms_cubic-bezier(0.16,1,0.3,1)] font-heading">
            {titleParts.map((part, index) => (
              <span key={part}>
                {part}
                {index < titleParts.length - 1 && <br />}
              </span>
            ))}
          </h1>

          {/* Body Text - Inter font - Full text on mobile */}
          <p
            className="mb-6 sm:mb-8 lg:mb-10 text-[14px] sm:text-[15px] md:text-[16px] lg:text-[17px] xl:text-[18px] text-trichomes-forest/70 leading-relaxed font-normal animate-[fadeInUp_400ms_cubic-bezier(0.16,1,0.3,1)] font-body"
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

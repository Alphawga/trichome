"use client";

import type React from "react";
import { useEffect, useState } from "react";
import {
  type HeroSlideData,
  HeroSlideView,
} from "@/components/sections/hero-slide-view";
import { CONTENT_TYPES } from "@/lib/constants/content-types";
import { trpc } from "@/utils/trpc";

// Default/fallback content, used when no hero slides exist in the DB
const DEFAULTS: HeroSlideData = {
  title: "Natural Beauty,\nNaturally Yours",
  description:
    "Where science meets nature — luxury simplified. Discover our range of natural, effective skincare products crafted with care.",
  buttonText: "Shop Now",
  buttonLink: "/products",
  imageUrl: "/hero/hero-image.jpg",
};

const AUTOPLAY_INTERVAL_MS = 6000;

export const Hero: React.FC = () => {
  const { data: heroContentArray } = trpc.getContentByType.useQuery(
    { type: CONTENT_TYPES.HOME_HERO },
    {
      staleTime: 60000, // Cache for 1 minute
      refetchOnWindowFocus: false,
    },
  );

  const slides: HeroSlideData[] =
    heroContentArray && heroContentArray.length > 0
      ? heroContentArray.map((item) => ({
          title: item.title,
          description: item.description || "",
          buttonText: item.button_text || "",
          buttonLink: item.button_link || "/products",
          imageUrl: item.image_url,
          videoUrl: item.video_url,
        }))
      : [DEFAULTS];

  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  // Derived rather than corrected via effect, so a slide count shrinking (e.g. a slide is
  // unpublished) never leaves activeIndex pointing past the end for a render pass
  const safeIndex = activeIndex % slides.length;

  useEffect(() => {
    if (slides.length <= 1 || isPaused) return;
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const timer = setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, AUTOPLAY_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [slides.length, isPaused]);

  const goToSlide = (index: number) => setActiveIndex(index);
  const goToPrevious = () =>
    setActiveIndex((current) => (current - 1 + slides.length) % slides.length);
  const goToNext = () =>
    setActiveIndex((current) => (current + 1) % slides.length);

  return (
    <section
      className="relative"
      aria-label="Homepage hero slideshow"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      {slides.map((slide, index) => (
        <div
          key={`${slide.title}-${index}`}
          className={`transition-opacity duration-700 ease-out ${
            index === safeIndex
              ? "opacity-100 relative"
              : "opacity-0 absolute inset-0 pointer-events-none"
          }`}
          aria-hidden={index !== safeIndex}
        >
          <HeroSlideView
            slide={slide}
            priority={index === 0}
            active={index === safeIndex}
          />
        </div>
      ))}

      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={goToPrevious}
            aria-label="Previous slide"
            className="hidden lg:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 items-center justify-center w-10 h-10 rounded-full bg-white/70 hover:bg-white text-trichomes-forest shadow-md transition-colors"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={goToNext}
            aria-label="Next slide"
            className="hidden lg:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 items-center justify-center w-10 h-10 rounded-full bg-white/70 hover:bg-white text-trichomes-forest shadow-md transition-colors"
          >
            ›
          </button>

          <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {slides.map((slide, index) => (
              <button
                key={`dot-${slide.title}-${index}`}
                type="button"
                onClick={() => goToSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
                className={`h-2 rounded-full transition-all ${
                  index === safeIndex
                    ? "w-6 bg-trichomes-forest"
                    : "w-2 bg-trichomes-forest/40"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
};

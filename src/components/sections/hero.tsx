'use client';

import React from 'react';
import Link from 'next/link';

export const Hero: React.FC = () => {
  return (
    <section className="relative text-trichomes-forest overflow-hidden h-[500px] sm:h-[600px] lg:h-[700px] bg-trichomes-soft">
      {/* Background Image - Centered, responsive size */}
      <div
        className="absolute inset-0 bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(/back-2.png)`,
          backgroundSize: '95%',
        }}
      />

      {/* Overlay - stronger on mobile for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-trichomes-soft/80 via-trichomes-soft/60 to-transparent sm:from-trichomes-soft/70 sm:via-trichomes-soft/50"></div>

      {/* Content - responsive padding and centering */}
      <div className="w-full h-full flex flex-col justify-center items-start relative z-10 px-6 sm:px-12 lg:px-20 lg:mx-[10%] max-w-7xl">

        <h1 className="text-[32px] sm:text-[48px] lg:text-[60px]  max-w-2xl leading-[1.1] text-trichomes-forest font-heading tracking-tight">
          Natural Beauty,<br />Naturally Yours
        </h1>

        {/* Subheading - shorter on mobile per design guide */}
        <p className="mt-4 sm:mt-6 max-w-xl text-[15px] sm:text-[17px] lg:text-[18px] text-trichomes-primary leading-relaxed font-body font-normal">
          <span className="hidden sm:inline">Where science meets nature — luxury simplified. Discover our range of natural, effective skincare products crafted with care.</span>
          <span className="sm:hidden">Where science meets nature — luxury simplified.</span>
        </p>

        {/* CTA Button - responsive sizing */}
        <Link
          href="/shop"
          className="mt-6 sm:mt-8 inline-block bg-trichomes-gold text-trichomes-forest font-semibold py-3 px-8 sm:py-4 sm:px-10 rounded-full text-base sm:text-lg hover:bg-trichomes-gold-hover transition-all duration-150 ease-out hover:shadow-lg font-body"
        >
          Shop Now
        </Link>
      </div>
    </section>
  );
};

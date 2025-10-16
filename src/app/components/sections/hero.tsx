'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

interface Slide {
  imageUrl: string;
  title: string;
  description: string;
  buttonText: string;
}

export const Hero: React.FC = () => {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides: Slide[] = [
    {
      imageUrl: '/bg-image.png',
      title: 'The Complete Body Ritual: Nourishment from Head to Toe',
      description: 'Discover our high-performance skincare, meticulously formulated to treat, protect, and illuminate your natural beauty.',
      buttonText: 'Shop Now'
    },
    {
      imageUrl: '/bg-image-2.png',
      title: 'The Foundation of Radiance: Science Meets Nature',
      description: 'Experience the perfect harmony of scientific innovation and natural ingredients for visibly refined skin.',
      buttonText: 'Explore Products'
    },
    {
      imageUrl: '/bg-image-3.png',
      title: 'Transform Your Skincare Routine',
      description: 'Elevate your daily ritual with luxurious formulations designed for lasting results and radiant confidence.',
      buttonText: 'Shop Collection'
    },
    {
      imageUrl: '/bg-image-4.png',
      title: 'Nature\'s Best, Scientifically Enhanced',
      description: 'Harness the power of botanicals combined with cutting-edge technology for your healthiest skin yet.',
      buttonText: 'Discover More'
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const onNavigate = (path: string) => {
    router.push(`/${path}`);
  };

  // Auto-advance slides every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(interval);
  }, [currentSlide]);

  return (
    <section className="relative text-white overflow-hidden" style={{ height: '600px' }}>
      <div className="w-full h-full flex transition-transform duration-700 ease-in-out">
        {slides.map((slide, index) => (
          <div
            key={index}
            className="w-full h-full flex-shrink-0 relative bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${slide.imageUrl})`,
              transform: `translateX(-${currentSlide * 100}%)`,
              transition: 'transform 700ms ease-in-out'
            }}
          >
            <div className="absolute inset-0 bg-black opacity-30 z-10"></div>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center items-start relative z-20">
              <h1 className="text-3xl lg:text-4xl font-bold max-w-lg leading-tight">{slide.title}</h1>
              <p className="mt-4 max-w-md text-base">{slide.description}</p>
              <button onClick={() => onNavigate('shop')} className="mt-8 bg-[#D4C394] text-black font-semibold py-3 px-8 rounded-full text-lg hover:bg-opacity-90 transition-transform hover:scale-105">
                {slide.buttonText}
              </button>
            </div>
          </div>
        ))}
      </div>
      {/* Navigation Arrows */}
      <button onClick={prevSlide} className="absolute top-1/2 left-4 -translate-y-1/2 z-30 bg-white/20 hover:bg-white/40 p-2 rounded-full transition-colors">
        <ChevronLeftIcon className="w-6 h-6 text-white" />
      </button>
      <button onClick={nextSlide} className="absolute top-1/2 right-4 -translate-y-1/2 z-30 bg-white/20 hover:bg-white/40 p-2 rounded-full transition-colors">
        <ChevronRightIcon className="w-6 h-6 text-white" />
      </button>
      {/* Pagination Dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex space-x-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-colors ${currentSlide === index ? 'bg-white' : 'bg-white/50 hover:bg-white/75'}`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

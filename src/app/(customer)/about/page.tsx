"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronRightIcon } from "@/components/ui/icons";
import { CONTENT_TYPES } from "@/lib/constants/content-types";
import { trpc } from "@/utils/trpc";

// Default content for fallbacks
const DEFAULTS = {
  hero: {
    title: "About Us",
    imageUrl: "/banners/about-us.jpg",
  },
  welcome:
    "Welcome to Trichomes, your integrated digital skincare sanctuary.",
  purpose: {
    title: "Our Purpose",
    description: "To make self-care accessible for all.",
  },
  mission: {
    title: "Mission",
    description:
      "To bridge the gap in accessible, quality skincare in Nigeria by providing expert consultations, educational resources, and a curated selection of premium products that empower individuals to achieve their skincare goals.",
  },
  vision: {
    title: "Vision",
    description:
      "To become Africa's leading integrated digital platform for skincare education, consultation, and product discovery, where science meets nature and self-care becomes accessible to everyone.",
  },
  approach: {
    title: "Our Approach",
    subtitle: "Educate. Consult. Shop",
    description:
      "We believe in a three-pronged approach to skincare: first, we educate you about your skin and the products available. Then, we provide expert consultations to help you find the right solutions. Finally, we offer a curated selection of premium products to help you achieve your skincare goals.",
  },
  educate: {
    title: "Educate First",
    content: `Knowledge is the first step to healthy, radiant skin. We believe that understanding your skin type, concerns, and the ingredients that work best for you is essential to building an effective skincare routine.

Our educational resources debunk myths, explain complex skincare science in simple terms, and empower you to make informed decisions about your skincare journey. Whether you're a skincare beginner or an enthusiast, we're here to guide you every step of the way.

We don't just sell products – we help you understand why certain ingredients work, how to layer products correctly, and what to expect from your skincare routine. Because when you know better, you can do better.`,
  },
};

export default function AboutPage() {
  // Fetch all about page content from database
  const contentQuery = trpc.getPageContent.useQuery(
    {
      types: [
        CONTENT_TYPES.ABOUT_HERO,
        CONTENT_TYPES.ABOUT_WELCOME,
        CONTENT_TYPES.ABOUT_PURPOSE,
        CONTENT_TYPES.ABOUT_MISSION,
        CONTENT_TYPES.ABOUT_VISION,
        CONTENT_TYPES.ABOUT_APPROACH,
        CONTENT_TYPES.ABOUT_EDUCATE,
      ],
    },
    {
      staleTime: 60000,
      refetchOnWindowFocus: false,
    },
  );

  // Extract content with fallbacks
  const contentMap = contentQuery.data || {};

  const hero = {
    title: contentMap[CONTENT_TYPES.ABOUT_HERO]?.title || DEFAULTS.hero.title,
    imageUrl:
      contentMap[CONTENT_TYPES.ABOUT_HERO]?.image_url || DEFAULTS.hero.imageUrl,
  };

  const welcome =
    contentMap[CONTENT_TYPES.ABOUT_WELCOME]?.description || DEFAULTS.welcome;

  const purpose = {
    title:
      contentMap[CONTENT_TYPES.ABOUT_PURPOSE]?.title || DEFAULTS.purpose.title,
    description:
      contentMap[CONTENT_TYPES.ABOUT_PURPOSE]?.description ||
      DEFAULTS.purpose.description,
  };

  const mission = {
    title:
      contentMap[CONTENT_TYPES.ABOUT_MISSION]?.title || DEFAULTS.mission.title,
    description:
      contentMap[CONTENT_TYPES.ABOUT_MISSION]?.description ||
      DEFAULTS.mission.description,
  };

  const vision = {
    title:
      contentMap[CONTENT_TYPES.ABOUT_VISION]?.title || DEFAULTS.vision.title,
    description:
      contentMap[CONTENT_TYPES.ABOUT_VISION]?.description ||
      DEFAULTS.vision.description,
  };

  const approach = {
    title:
      contentMap[CONTENT_TYPES.ABOUT_APPROACH]?.title ||
      DEFAULTS.approach.title,
    subtitle:
      contentMap[CONTENT_TYPES.ABOUT_APPROACH]?.subtitle ||
      DEFAULTS.approach.subtitle,
    description:
      contentMap[CONTENT_TYPES.ABOUT_APPROACH]?.description ||
      DEFAULTS.approach.description,
  };

  const educate = {
    title:
      contentMap[CONTENT_TYPES.ABOUT_EDUCATE]?.title || DEFAULTS.educate.title,
    content:
      contentMap[CONTENT_TYPES.ABOUT_EDUCATE]?.content ||
      DEFAULTS.educate.content,
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Header Section */}
      <div className="relative w-full h-[300px] sm:h-[350px] lg:h-[400px] animate-[sectionEntrance_600ms_ease-out]">
        {/* Background Image */}
        <div className="absolute inset-0">
          <div
            className="w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url('${hero.imageUrl}')` }}
          />
          {/* Gradient Overlay - Warm beige/taupe tone */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to left, rgba(166, 147, 142, 0.88), rgba(166, 147, 142, 0.70), rgba(166, 147, 142, 0.35))",
            }}
          />
        </div>

        {/* Content */}
        <div className="relative h-full mx-auto px-4 sm:px-6 lg:px-8 max-w-[2200px] flex flex-col justify-center">
          <div className="flex flex-col items-start max-w-2xl">
            {/* Main Title */}
            <h1 className="text-[40px] sm:text-[48px] lg:text-[56px] font-heading text-white leading-tight mb-4 animate-[fadeInUp_400ms_cubic-bezier(0.16,1,0.3,1)]">
              {hero.title}
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
              <span className="text-[14px] text-white font-body">About Us</span>
            </nav>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 pb-16 sm:pb-20 max-w-[1440px] animate-[sectionEntrance_600ms_ease-out]">
        <div className="max-w-5xl mx-auto">
          {/* Welcome Text */}
          <p className="text-[16px] sm:text-[17px] lg:text-[18px] text-gray-600 font-body mb-8 sm:mb-10 leading-relaxed animate-[fadeInUp_400ms_cubic-bezier(0.16,1,0.3,1)]">
            {welcome}
          </p>

          {/* Our Purpose Section */}
          <div
            className="bg-gray-50 rounded-sm p-6 sm:p-8 mb-6 sm:mb-8 border border-gray-200 animate-[fadeInUp_400ms_cubic-bezier(0.16,1,0.3,1)]"
            style={{ animationDelay: "100ms", animationFillMode: "both" }}
          >
            <h2 className="text-[18px] sm:text-[20px] font-heading text-gray-900 mb-3 font-medium">
              {purpose.title}
            </h2>
            <p className="text-[15px] sm:text-[16px] text-gray-600 font-body leading-relaxed">
              {purpose.description}
            </p>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 mb-6 sm:mb-8" />

          {/* Our Mission and Vision - Two Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {/* Our Mission */}
            <div
              className="bg-gray-50 rounded-sm p-5 sm:p-6 border border-gray-200 animate-[fadeInUp_400ms_cubic-bezier(0.16,1,0.3,1)]"
              style={{ animationDelay: "200ms", animationFillMode: "both" }}
            >
              <h2 className="text-[18px] sm:text-[20px] font-heading text-gray-900 mb-3 font-medium">
                {mission.title}
              </h2>
              <p className="text-[14px] sm:text-[15px] text-gray-600 font-body leading-relaxed">
                {mission.description}
              </p>
            </div>

            {/* Our Vision */}
            <div
              className="bg-gray-50 rounded-sm p-5 sm:p-6 border border-gray-200 animate-[fadeInUp_400ms_cubic-bezier(0.16,1,0.3,1)]"
              style={{ animationDelay: "300ms", animationFillMode: "both" }}
            >
              <h2 className="text-[18px] sm:text-[20px] font-heading text-gray-900 mb-3 font-medium">
                {vision.title}
              </h2>
              <p className="text-[14px] sm:text-[15px] text-gray-600 font-body leading-relaxed">
                {vision.description}
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 mb-6 sm:mb-8" />

          {/* Our Approach Section */}
          <div className="mb-6 sm:mb-8">
            <h2 className="text-[18px] sm:text-[20px] font-heading text-gray-900 mb-3 font-medium">
              {approach.title}
            </h2>
            <p className="text-[16px] sm:text-[18px] font-body text-gray-900 mb-3 font-medium">
              {approach.subtitle}
            </p>
            <p className="text-[15px] sm:text-[16px] text-gray-600 font-body leading-relaxed">
              {approach.description}
            </p>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 mb-6 sm:mb-8" />

          {/* Educate First Section */}
          <div className="bg-gray-50 rounded-sm p-6 sm:p-8 border border-gray-200">
            <h2 className="text-[18px] sm:text-[20px] font-heading text-gray-900 mb-4 font-medium">
              {educate.title}
            </h2>
            <div className="space-y-4">
              {educate.content.split("\n\n").map((paragraph, index) => (
                <p
                  key={`educate-p-${index}`}
                  className="text-[15px] sm:text-[16px] text-gray-600 font-body leading-relaxed"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

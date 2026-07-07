"use client";

import { notFound } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/app/contexts/auth-context";
import {
  type HeroSlideData,
  HeroSlideView,
} from "@/components/sections/hero-slide-view";
import {
  HERO_SLIDE_PREVIEW_MESSAGE_TYPE,
  HERO_SLIDE_PREVIEW_READY_MESSAGE_TYPE,
} from "@/lib/constants/hero-preview";

const EMPTY_SLIDE: HeroSlideData = {
  title: "",
  description: "",
  buttonText: "",
  buttonLink: "/products",
  imageUrl: null,
  videoUrl: null,
};

export default function HeroSlidePreviewPage() {
  const { user, isLoading } = useAuth();
  const [slide, setSlide] = useState<HeroSlideData>(EMPTY_SLIDE);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type !== HERO_SLIDE_PREVIEW_MESSAGE_TYPE) return;
      setSlide(event.data.slide as HeroSlideData);
    };

    window.addEventListener("message", handleMessage);
    // Let the opener know we're ready to receive the initial payload
    window.parent.postMessage(
      { type: HERO_SLIDE_PREVIEW_READY_MESSAGE_TYPE },
      window.location.origin,
    );

    return () => window.removeEventListener("message", handleMessage);
  }, []);

  if (isLoading) return null;
  if (!user || (user.role !== "ADMIN" && user.role !== "STAFF")) {
    notFound();
  }

  return <HeroSlideView slide={slide} priority />;
}

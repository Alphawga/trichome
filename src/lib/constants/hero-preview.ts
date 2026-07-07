export const HERO_SLIDE_PREVIEW_MESSAGE_TYPE = "hero-slide-preview-update";
export const HERO_SLIDE_PREVIEW_READY_MESSAGE_TYPE =
  "hero-slide-preview-update-ready";

export const HERO_SLIDE_PREVIEW_DEVICES = {
  mobile: { label: "Mobile", width: 375, height: 640 },
  tablet: { label: "Tablet", width: 768, height: 640 },
  desktop: { label: "Desktop", width: 1440, height: 640 },
} as const;

export type HeroSlidePreviewDevice = keyof typeof HERO_SLIDE_PREVIEW_DEVICES;

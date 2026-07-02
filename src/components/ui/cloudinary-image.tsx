"use client";

import Image, { type ImageProps } from "next/image";
import { CldImage } from "next-cloudinary";

const CLOUDINARY_URL_PREFIX = "https://res.cloudinary.com/";

/**
 * Drop-in replacement for next/image's <Image> for fields that are usually,
 * but not always, Cloudinary URLs (e.g. user.image can be a Google OAuth
 * avatar). Cloudinary sources are served pre-transformed from Cloudinary's
 * own CDN via CldImage, bypassing Next's server-side image optimizer
 * (avoids redundant re-encoding and its hardcoded 7s fetch timeout).
 * Everything else falls back to the normal next/image optimizer.
 */
export function CloudinaryImage(props: ImageProps) {
  const src = typeof props.src === "string" ? props.src : "";

  if (src.startsWith(CLOUDINARY_URL_PREFIX)) {
    return <CldImage {...props} src={src} />;
  }

  return <Image {...props} />;
}

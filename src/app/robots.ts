import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/api",
        "/auth",
        "/account",
        "/cart",
        "/checkout",
        "/order-confirmation",
        "/order-history",
        "/profile",
        "/rewards",
        "/wishlist",
        "/track-order",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}

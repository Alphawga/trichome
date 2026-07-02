import {
  CONTACT_EMAIL,
  CONTACT_PHONE,
  SITE_ADDRESS,
  SITE_LOGO_PATH,
  SITE_NAME,
  SITE_URL,
  SOCIAL_LINKS,
} from "@/lib/site-config";

export function buildOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}${SITE_LOGO_PATH}`,
    sameAs: Object.values(SOCIAL_LINKS),
    telephone: CONTACT_PHONE,
    address: {
      "@type": "PostalAddress",
      ...SITE_ADDRESS,
    },
    contactPoint: {
      "@type": "ContactPoint",
      email: CONTACT_EMAIL,
      telephone: CONTACT_PHONE,
      contactType: "customer service",
    },
  };
}

export function buildWebsiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
  };
}

export function buildBreadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}

interface ProductForJsonLd {
  id: string;
  name: string;
  description: string | null;
  short_description: string | null;
  sku: string;
  price: { toString(): string };
  quantity: number;
  images: { url: string; is_primary: boolean }[];
  category: { name: string };
}

export function buildProductJsonLd(product: ProductForJsonLd) {
  const primaryImage =
    product.images.find((image) => image.is_primary) ?? product.images[0];
  const imageUrl = primaryImage
    ? primaryImage.url.startsWith("http")
      ? primaryImage.url
      : `${SITE_URL}${primaryImage.url}`
    : undefined;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description ?? product.short_description ?? undefined,
    sku: product.sku,
    category: product.category.name,
    image: imageUrl ? [imageUrl] : undefined,
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/products/${product.id}`,
      priceCurrency: "NGN",
      price: String(product.price),
      availability:
        product.quantity > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
    },
  };
}

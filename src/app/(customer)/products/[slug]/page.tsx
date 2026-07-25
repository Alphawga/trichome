import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { resolveActiveProductTagPromotions } from "@/lib/promotions/active-product-tag-promotions";
import { calculateProductTagDiscount } from "@/lib/promotions/product-tag-discount";
import { SITE_URL } from "@/lib/site-config";
import {
  buildBreadcrumbJsonLd,
  buildProductJsonLd,
} from "@/lib/structured-data";
import { ProductDetailsClient } from "./ProductDetailsClient";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

async function getProductBySlug(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: {
      category: { select: { name: true } },
      images: { orderBy: { sort_order: "asc" } },
    },
  });
}

// Legacy /products/[id] links (bookmarked, shared, or already indexed) still
// resolve here so we can 308-redirect them to the slug URL instead of 404ing.
async function resolveSlugFromLegacyId(id: string) {
  const product = await prisma.product.findUnique({
    where: { id },
    select: { slug: true },
  });
  return product?.slug;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return { title: "Product Not Found" };
  }

  const title = product.seo_title || product.name;
  const description =
    product.seo_description ||
    product.short_description ||
    product.description ||
    undefined;
  const primaryImage =
    product.images.find((image) => image.is_primary) ?? product.images[0];

  return {
    title,
    description,
    alternates: {
      canonical: `${SITE_URL}/products/${product.slug}`,
    },
    openGraph: {
      title,
      description,
      images: primaryImage ? [primaryImage.url] : undefined,
    },
  };
}

export default async function Page({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    const redirectSlug = await resolveSlugFromLegacyId(slug);
    if (redirectSlug) {
      permanentRedirect(`/products/${redirectSlug}`);
    }
    notFound();
  }

  const tagPromotions = await resolveActiveProductTagPromotions(prisma);
  const tagDiscount = calculateProductTagDiscount(
    tagPromotions,
    Number(product.price),
  );
  const effectivePrice = Number(product.price) - tagDiscount;

  const productJsonLd = buildProductJsonLd(product, effectivePrice);
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Products", path: "/products" },
    { name: product.name, path: `/products/${product.slug}` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: static JSON-LD, not user input
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: static JSON-LD, not user input
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <ProductDetailsClient />
    </>
  );
}

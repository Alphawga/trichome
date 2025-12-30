"use client";

import { ProductStatus } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { EditableSection } from "@/components/admin/EditableSection";
import { InlineEditor } from "@/components/admin/InlineEditor";
import type { ProductWithRelations } from "@/components/product/product-grid";
import { ProductGrid } from "@/components/product/product-grid";
import { ChevronRightIcon } from "@/components/ui/icons";
import { LogoLoader } from "@/components/ui/logo-loader";
import {
    CONTENT_TYPES,
    EDITABLE_PAGES,
    type FieldType,
} from "@/lib/constants/content-types";
import { trpc } from "@/utils/trpc";

export default function ContentEditorPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;

    const pageConfig = EDITABLE_PAGES.find((p) => p.slug === slug);
    const sectionTypes = pageConfig?.sections.map((s) => s.type) || [];

    const contentQuery = trpc.getPageContent.useQuery(
        { types: sectionTypes as string[] },
        { enabled: sectionTypes.length > 0 },
    );

    const [editingSection, setEditingSection] = useState<string | null>(null);

    if (!pageConfig) {
        return (
            <div className="p-6 text-center py-12">
                <h2 className="text-xl font-semibold text-gray-900">Page not found</h2>
                <Link href="/admin/content" className="mt-4 inline-block text-[#38761d] hover:underline">
                    ← Back to content pages
                </Link>
            </div>
        );
    }

    if (contentQuery.isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <LogoLoader size="lg" text="Loading content..." />
            </div>
        );
    }

    const contentMap = contentQuery.data || {};
    const getSectionConfig = (type: string) =>
        pageConfig.sections.find((s) => s.type === type);

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Editor Header */}
            <div className="bg-white border-b sticky top-0 z-50 shadow-sm">
                <div className="px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            type="button"
                            onClick={() => router.push("/admin/content")}
                            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <title>Back</title>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </button>
                        <div>
                            <h1 className="text-lg font-bold text-gray-900">Editing: {pageConfig.name}</h1>
                            <p className="text-xs text-gray-500">Click on any section to edit</p>
                        </div>
                    </div>
                    <a
                        href={`/${slug === "home" ? "" : slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <title>Preview</title>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        Open Live Page
                    </a>
                </div>
            </div>

            {/* Page Preview */}
            <div className="bg-white shadow-xl mx-auto max-w-[1400px] my-6 rounded-lg overflow-hidden">
                {slug === "home" && (
                    <HomePageEditor
                        contentMap={contentMap}
                        editingSection={editingSection}
                        onEditSection={setEditingSection}
                        getSectionConfig={getSectionConfig}
                    />
                )}
                {slug === "about" && (
                    <AboutPageEditor
                        contentMap={contentMap}
                        editingSection={editingSection}
                        onEditSection={setEditingSection}
                        getSectionConfig={getSectionConfig}
                    />
                )}
                {slug === "consultation" && (
                    <ConsultationPageEditor
                        contentMap={contentMap}
                        editingSection={editingSection}
                        onEditSection={setEditingSection}
                        getSectionConfig={getSectionConfig}
                    />
                )}
                {slug === "products" && (
                    <ProductsPageEditor
                        contentMap={contentMap}
                        editingSection={editingSection}
                        onEditSection={setEditingSection}
                        getSectionConfig={getSectionConfig}
                    />
                )}
                {slug === "brands" && (
                    <BrandsPageEditor
                        contentMap={contentMap}
                        editingSection={editingSection}
                        onEditSection={setEditingSection}
                        getSectionConfig={getSectionConfig}
                    />
                )}
            </div>
        </div>
    );
}

// Types
interface EditorProps {
    contentMap: Record<string, {
        id: string;
        type: string;
        title: string;
        subtitle?: string | null;
        description?: string | null;
        content?: string | null;
        button_text?: string | null;
        button_link?: string | null;
        image_url?: string | null;
    }>;
    editingSection: string | null;
    onEditSection: (section: string | null) => void;
    getSectionConfig: (type: string) => { type: string; name: string; fields: readonly string[] } | undefined;
}

// Default content (same as customer pages)
const HOME_DEFAULTS = {
    hero: {
        title: "Natural Beauty,\nNaturally Yours",
        description: "Where science meets nature — luxury simplified. Discover our range of natural, effective skincare products crafted with care.",
        buttonText: "Shop Now",
        buttonLink: "/products",
        imageUrl: "/hero/hero-image.jpg",
    },
    collectionTitle: "Our Collection",
    featuredTitle: "Featured Items",
    topSellersTitle: "Top Sellers",
    bannerLeft: { buttonText: "Top Sellers", buttonLink: "/products?sort=popular", imageUrl: "/banners/new-arrivals.jpg" },
    bannerRight: { buttonText: "New arrivals", buttonLink: "/products?sort=newest", imageUrl: "/banners/top-seller.jpg" },
    bookSession: {
        title: "Unlock your best skin, style, and scent. Book a 1 on 1 session.",
        description: "Stop guessing, start glowing. Your beauty journey is unique, and true refinement requires expert guidance.",
        buttonText: "Book my session",
        buttonLink: "/consultation",
        imageUrl: "/book-a-session.jpg",
    },
    whyChoose: { title: "Why Choose Trichomes?", imageUrl: "/store.png" },
};

// =====================
// HOME PAGE EDITOR
// =====================
function HomePageEditor({ contentMap, editingSection, onEditSection, getSectionConfig }: EditorProps) {
    // Get content with fallbacks
    const hero = {
        title: contentMap[CONTENT_TYPES.HOME_HERO]?.title || HOME_DEFAULTS.hero.title,
        description: contentMap[CONTENT_TYPES.HOME_HERO]?.description || HOME_DEFAULTS.hero.description,
        buttonText: contentMap[CONTENT_TYPES.HOME_HERO]?.button_text || HOME_DEFAULTS.hero.buttonText,
        buttonLink: contentMap[CONTENT_TYPES.HOME_HERO]?.button_link || HOME_DEFAULTS.hero.buttonLink,
        imageUrl: contentMap[CONTENT_TYPES.HOME_HERO]?.image_url || HOME_DEFAULTS.hero.imageUrl,
    };
    const collectionTitle = contentMap[CONTENT_TYPES.HOME_COLLECTION_TITLE]?.title || HOME_DEFAULTS.collectionTitle;
    const featuredTitle = contentMap[CONTENT_TYPES.HOME_FEATURED_TITLE]?.title || HOME_DEFAULTS.featuredTitle;
    const topSellersTitle = contentMap[CONTENT_TYPES.HOME_TOPSELLERS_TITLE]?.title || HOME_DEFAULTS.topSellersTitle;
    const bannerLeft = {
        buttonText: contentMap[CONTENT_TYPES.HOME_BANNER_LEFT]?.button_text || HOME_DEFAULTS.bannerLeft.buttonText,
        buttonLink: contentMap[CONTENT_TYPES.HOME_BANNER_LEFT]?.button_link || HOME_DEFAULTS.bannerLeft.buttonLink,
        imageUrl: contentMap[CONTENT_TYPES.HOME_BANNER_LEFT]?.image_url || HOME_DEFAULTS.bannerLeft.imageUrl,
    };
    const bannerRight = {
        buttonText: contentMap[CONTENT_TYPES.HOME_BANNER_RIGHT]?.button_text || HOME_DEFAULTS.bannerRight.buttonText,
        buttonLink: contentMap[CONTENT_TYPES.HOME_BANNER_RIGHT]?.button_link || HOME_DEFAULTS.bannerRight.buttonLink,
        imageUrl: contentMap[CONTENT_TYPES.HOME_BANNER_RIGHT]?.image_url || HOME_DEFAULTS.bannerRight.imageUrl,
    };
    const bookSession = {
        title: contentMap[CONTENT_TYPES.HOME_BOOK_SESSION]?.title || HOME_DEFAULTS.bookSession.title,
        description: contentMap[CONTENT_TYPES.HOME_BOOK_SESSION]?.description || HOME_DEFAULTS.bookSession.description,
        buttonText: contentMap[CONTENT_TYPES.HOME_BOOK_SESSION]?.button_text || HOME_DEFAULTS.bookSession.buttonText,
        buttonLink: contentMap[CONTENT_TYPES.HOME_BOOK_SESSION]?.button_link || HOME_DEFAULTS.bookSession.buttonLink,
        imageUrl: contentMap[CONTENT_TYPES.HOME_BOOK_SESSION]?.image_url || HOME_DEFAULTS.bookSession.imageUrl,
    };
    const whyChoose = {
        title: contentMap[CONTENT_TYPES.HOME_WHY_CHOOSE]?.title || HOME_DEFAULTS.whyChoose.title,
        imageUrl: contentMap[CONTENT_TYPES.HOME_WHY_CHOOSE]?.image_url || HOME_DEFAULTS.whyChoose.imageUrl,
    };

    // Fetch real data for product sections
    const categoriesQuery = trpc.getCategoryTree.useQuery(undefined, { staleTime: 60000 });
    const featuredQuery = trpc.getProducts.useQuery({ page: 1, limit: 4, status: ProductStatus.ACTIVE, is_featured: true, sort_by: "featured" }, { staleTime: 30000 });
    const topSellersQuery = trpc.getProducts.useQuery({ page: 1, limit: 4, status: ProductStatus.ACTIVE, sort_by: "popular" }, { staleTime: 30000 });

    const collections = categoriesQuery.data?.slice(0, 4) || [];
    const featuredProducts = featuredQuery.data?.products || [];
    const topSellers = topSellersQuery.data?.products || [];

    const titleParts = hero.title.split("\n");

    return (
        <div className="bg-white overflow-x-hidden">
            {/* Hero Section */}
            <EditableSection
                sectionName="Hero Section"
                isEditing={editingSection === CONTENT_TYPES.HOME_HERO}
                onEditClick={() => onEditSection(CONTENT_TYPES.HOME_HERO)}
                editForm={
                    <InlineEditor
                        contentType={CONTENT_TYPES.HOME_HERO}
                        sectionName="Hero Section"
                        initialData={contentMap[CONTENT_TYPES.HOME_HERO]}
                        onSave={() => onEditSection(null)}
                        onCancel={() => onEditSection(null)}
                        fields={getSectionConfig(CONTENT_TYPES.HOME_HERO)?.fields as FieldType[]}
                    />
                }
            >
                <section className="relative text-trichomes-forest overflow-hidden min-h-[60vh]">
                    <div className="absolute inset-0">
                        <Image src={hero.imageUrl} alt="Hero" fill className="object-cover object-center" priority />
                    </div>
                    <div className="absolute top-0 inset-x-0 h-[260px] md:hidden pointer-events-none bg-gradient-to-b from-[#E1D1C1] via-[#E1D1C1]/80 to-transparent" />
                    <div className="hidden lg:block absolute inset-0 bg-[#1E3024]/10 pointer-events-none" />
                    <div className="relative z-10 w-full h-full px-4 md:mx-auto max-w-[1900px] lg:px-12 xl:px-20 py-8 sm:py-12 lg:py-20 flex flex-col justify-start lg:justify-center items-start">
                        <div className="w-full max-w-md md:max-w-xl ml-5 md:ml-0">
                            <h1 className="text-[48px] md:text-[64px] leading-[1.1] text-trichomes-forest tracking-tight mb-4 sm:mb-5 lg:mb-6 font-heading">
                                {titleParts.map((part, i) => <span key={part}>{part}{i < titleParts.length - 1 && <br />}</span>)}
                            </h1>
                            <p className="mb-6 sm:mb-8 lg:mb-10 text-[14px] sm:text-[15px] lg:text-[17px] text-trichomes-forest/70 leading-relaxed font-body">
                                {hero.description}
                            </p>
                            <span className="inline-block bg-[#407029] text-white rounded-lg font-semibold py-3 px-7 sm:py-2.5 sm:px-10 lg:py-3 lg:px-12 text-[15px] sm:text-lg font-body">
                                {hero.buttonText}
                            </span>
                        </div>
                    </div>
                </section>
            </EditableSection>

            {/* Our Collection */}
            <EditableSection
                sectionName="Collection Title"
                isEditing={editingSection === CONTENT_TYPES.HOME_COLLECTION_TITLE}
                onEditClick={() => onEditSection(CONTENT_TYPES.HOME_COLLECTION_TITLE)}
                editForm={
                    <InlineEditor
                        contentType={CONTENT_TYPES.HOME_COLLECTION_TITLE}
                        sectionName="Collection Title"
                        initialData={contentMap[CONTENT_TYPES.HOME_COLLECTION_TITLE]}
                        onSave={() => onEditSection(null)}
                        onCancel={() => onEditSection(null)}
                        fields={getSectionConfig(CONTENT_TYPES.HOME_COLLECTION_TITLE)?.fields as FieldType[]}
                    />
                }
            >
                <section className="py-8 sm:py-12 lg:py-20 bg-white mx-auto max-w-[2200px]">
                    <div className="w-full mx-auto px-4 md:px-6">
                        <h2 className="text-[24px] sm:text-[32px] lg:text-[40px] text-center mb-2 sm:mb-3 text-trichomes-forest font-heading">
                            {collectionTitle}
                        </h2>
                        <div className="w-16 sm:w-20 h-1 bg-trichomes-primary mb-6 sm:mb-8 lg:mb-12 mx-auto rounded-full" />
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            {collections.map((cat) => (
                                <div key={cat.id} className="relative h-[280px] md:h-[400px] bg-white border rounded-lg overflow-hidden shadow-lg">
                                    {cat.image ? (
                                        <Image src={cat.image} alt={cat.name} fill className="object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                            <span className="text-4xl font-bold text-gray-300">{cat.name.charAt(0)}</span>
                                        </div>
                                    )}
                                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 to-transparent" />
                                    <div className="absolute bottom-0 left-0 right-0 p-4">
                                        <h3 className="text-white text-xl font-body">{cat.name}</h3>
                                        <div className="w-10 h-1 bg-trichomes-primary mt-2 rounded-full" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </EditableSection>

            {/* Featured Items */}
            <EditableSection
                sectionName="Featured Title"
                isEditing={editingSection === CONTENT_TYPES.HOME_FEATURED_TITLE}
                onEditClick={() => onEditSection(CONTENT_TYPES.HOME_FEATURED_TITLE)}
                editForm={
                    <InlineEditor
                        contentType={CONTENT_TYPES.HOME_FEATURED_TITLE}
                        sectionName="Featured Title"
                        initialData={contentMap[CONTENT_TYPES.HOME_FEATURED_TITLE]}
                        onSave={() => onEditSection(null)}
                        onCancel={() => onEditSection(null)}
                        fields={getSectionConfig(CONTENT_TYPES.HOME_FEATURED_TITLE)?.fields as FieldType[]}
                    />
                }
            >
                <section className="py-8 sm:py-12 lg:py-20 bg-white mx-auto max-w-[2200px]">
                    <div className="w-full mx-auto px-4 md:px-6">
                        <h2 className="text-[24px] sm:text-[32px] lg:text-[40px] text-center mb-2 sm:mb-3 text-trichomes-forest font-heading">
                            {featuredTitle}
                        </h2>
                        <div className="w-16 sm:w-20 h-1 bg-trichomes-primary mb-6 sm:mb-8 lg:mb-12 mx-auto rounded-full" />
                        <ProductGrid products={featuredProducts} onProductClick={() => { }} onAddToCart={() => { }} wishlist={[]} onToggleWishlist={() => { }} />
                    </div>
                </section>
            </EditableSection>

            {/* Top Sellers */}
            <EditableSection
                sectionName="Top Sellers Title"
                isEditing={editingSection === CONTENT_TYPES.HOME_TOPSELLERS_TITLE}
                onEditClick={() => onEditSection(CONTENT_TYPES.HOME_TOPSELLERS_TITLE)}
                editForm={
                    <InlineEditor
                        contentType={CONTENT_TYPES.HOME_TOPSELLERS_TITLE}
                        sectionName="Top Sellers Title"
                        initialData={contentMap[CONTENT_TYPES.HOME_TOPSELLERS_TITLE]}
                        onSave={() => onEditSection(null)}
                        onCancel={() => onEditSection(null)}
                        fields={getSectionConfig(CONTENT_TYPES.HOME_TOPSELLERS_TITLE)?.fields as FieldType[]}
                    />
                }
            >
                <section className="py-8 sm:py-12 lg:py-20 bg-[#E1D1C14D]/30 w-full">
                    <div className="max-w-[2200px] mx-auto px-4 md:px-6">
                        <h2 className="text-[24px] sm:text-[32px] lg:text-[40px] text-center mb-2 sm:mb-3 text-trichomes-forest font-heading">
                            {topSellersTitle}
                        </h2>
                        <div className="w-16 sm:w-20 h-1 bg-trichomes-primary mb-6 sm:mb-8 lg:mb-12 mx-auto rounded-full" />
                        <ProductGrid products={topSellers} onProductClick={() => { }} onAddToCart={() => { }} wishlist={[]} onToggleWishlist={() => { }} />
                    </div>
                </section>
            </EditableSection>

            {/* Banners */}
            <section className="mx-auto px-4 sm:px-6 lg:px-8 w-full py-8 sm:py-12 lg:py-20">
                <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8 max-w-[2200px] mx-auto">
                    <EditableSection
                        sectionName="Left Banner"
                        isEditing={editingSection === CONTENT_TYPES.HOME_BANNER_LEFT}
                        onEditClick={() => onEditSection(CONTENT_TYPES.HOME_BANNER_LEFT)}
                        editForm={
                            <InlineEditor
                                contentType={CONTENT_TYPES.HOME_BANNER_LEFT}
                                sectionName="Left Banner"
                                initialData={contentMap[CONTENT_TYPES.HOME_BANNER_LEFT]}
                                onSave={() => onEditSection(null)}
                                onCancel={() => onEditSection(null)}
                                fields={getSectionConfig(CONTENT_TYPES.HOME_BANNER_LEFT)?.fields as FieldType[]}
                            />
                        }
                    >
                        <div className="flex-1 bg-cover bg-center min-h-[250px] md:min-h-[400px] flex items-end p-6 rounded-2xl" style={{ backgroundImage: `url('${bannerLeft.imageUrl}')` }}>
                            <span className="bg-[#407029] text-white font-semibold py-3 px-6 rounded-lg">
                                {bannerLeft.buttonText} <ChevronRightIcon className="inline-block w-4 h-4" />
                            </span>
                        </div>
                    </EditableSection>

                    <EditableSection
                        sectionName="Right Banner"
                        isEditing={editingSection === CONTENT_TYPES.HOME_BANNER_RIGHT}
                        onEditClick={() => onEditSection(CONTENT_TYPES.HOME_BANNER_RIGHT)}
                        editForm={
                            <InlineEditor
                                contentType={CONTENT_TYPES.HOME_BANNER_RIGHT}
                                sectionName="Right Banner"
                                initialData={contentMap[CONTENT_TYPES.HOME_BANNER_RIGHT]}
                                onSave={() => onEditSection(null)}
                                onCancel={() => onEditSection(null)}
                                fields={getSectionConfig(CONTENT_TYPES.HOME_BANNER_RIGHT)?.fields as FieldType[]}
                            />
                        }
                    >
                        <div className="flex-1 bg-cover bg-center min-h-[250px] md:min-h-[400px] flex items-end p-6 rounded-2xl" style={{ backgroundImage: `url('${bannerRight.imageUrl}')` }}>
                            <span className="bg-[#407029] text-white font-semibold py-3 px-6 rounded-lg">
                                {bannerRight.buttonText} <ChevronRightIcon className="inline-block w-4 h-4" />
                            </span>
                        </div>
                    </EditableSection>
                </div>
            </section>

            {/* Book Session */}
            <EditableSection
                sectionName="Book Session"
                isEditing={editingSection === CONTENT_TYPES.HOME_BOOK_SESSION}
                onEditClick={() => onEditSection(CONTENT_TYPES.HOME_BOOK_SESSION)}
                editForm={
                    <InlineEditor
                        contentType={CONTENT_TYPES.HOME_BOOK_SESSION}
                        sectionName="Book Session"
                        initialData={contentMap[CONTENT_TYPES.HOME_BOOK_SESSION]}
                        onSave={() => onEditSection(null)}
                        onCancel={() => onEditSection(null)}
                        fields={getSectionConfig(CONTENT_TYPES.HOME_BOOK_SESSION)?.fields as FieldType[]}
                    />
                }
            >
                <section className="relative w-full bg-white py-16 sm:py-24 lg:py-32 overflow-hidden min-h-[500px]">
                    <div className="absolute inset-0 w-full h-full">
                        <Image src={bookSession.imageUrl} alt="Book a session" fill className="object-cover" />
                        <div className="absolute inset-0 bg-[#F6F1EC] opacity-85" />
                    </div>
                    <div className="relative mx-auto px-4 sm:px-6 lg:px-8 w-full max-w-[2200px] h-full flex flex-col justify-center items-center text-center">
                        <div className="max-w-4xl">
                            <h2 className="text-[32px] sm:text-[42px] lg:text-[56px] leading-[1.1] font-heading text-trichomes-forest mb-6">
                                {bookSession.title}
                            </h2>
                            <p className="text-[15px] md:text-[16px] leading-relaxed text-trichomes-forest/80 mb-8 font-body">
                                {bookSession.description}
                            </p>
                            <span className="bg-[#407029] text-white font-medium py-3.5 px-8 sm:py-4 sm:px-10 rounded-md font-body inline-block">
                                {bookSession.buttonText}
                            </span>
                        </div>
                    </div>
                </section>
            </EditableSection>

            {/* Why Choose */}
            <EditableSection
                sectionName="Why Choose Us"
                isEditing={editingSection === CONTENT_TYPES.HOME_WHY_CHOOSE}
                onEditClick={() => onEditSection(CONTENT_TYPES.HOME_WHY_CHOOSE)}
                editForm={
                    <InlineEditor
                        contentType={CONTENT_TYPES.HOME_WHY_CHOOSE}
                        sectionName="Why Choose Us"
                        initialData={contentMap[CONTENT_TYPES.HOME_WHY_CHOOSE]}
                        onSave={() => onEditSection(null)}
                        onCancel={() => onEditSection(null)}
                        fields={getSectionConfig(CONTENT_TYPES.HOME_WHY_CHOOSE)?.fields as FieldType[]}
                    />
                }
            >
                <section className="py-12 sm:py-16 lg:py-24 bg-white">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-[1440px]">
                        <div className="flex flex-col lg:flex-row gap-8 sm:gap-12 lg:gap-20 items-center">
                            <div className="w-full lg:w-1/2 order-2 lg:order-1 relative">
                                <div className="relative w-full h-[400px] lg:h-[500px]" style={{ backgroundImage: `url(${whyChoose.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                                    <div className="absolute inset-0 bg-white z-10" />
                                    <div className="absolute top-[22%] left-5 w-[45%] h-[60%] rounded-[32px] overflow-hidden shadow-xl z-20" style={{ backgroundImage: `url(${whyChoose.imageUrl})`, backgroundSize: 'calc(120% / 0.48) calc(120% / 0.60)', backgroundPosition: 'calc(18% / 0.90) calc(28% / 0.60)' }} />
                                    <div className="absolute top-[30%] right-0 w-[45%] h-[60%] rounded-[32px] overflow-hidden shadow-xl z-20" style={{ backgroundImage: `url(${whyChoose.imageUrl})`, backgroundSize: 'calc(120% / 0.48) calc(120% / 0.60)', backgroundPosition: 'calc(100%) calc(36% / 0.60)' }} />
                                </div>
                            </div>
                            <div className="w-full lg:w-1/2 order-1 lg:order-2">
                                <h2 className="text-[32px] sm:text-[40px] lg:text-[48px] text-trichomes-forest font-heading mb-8 leading-tight">
                                    {whyChoose.title}
                                </h2>
                                <div className="space-y-8">
                                    <div>
                                        <h3 className="text-[20px] font-heading text-trichomes-forest mb-3 font-semibold">Premium Quality</h3>
                                        <div className="w-full h-px bg-trichomes-forest/10 mb-4" />
                                        <p className="text-[15px] text-trichomes-forest/70 leading-relaxed font-body">Only the finest ingredients, scientifically proven to deliver results.</p>
                                    </div>
                                    <div>
                                        <h3 className="text-[20px] font-heading text-trichomes-forest mb-3 font-semibold">Expert Guidance</h3>
                                        <div className="w-full h-px bg-trichomes-forest/10 mb-4" />
                                        <p className="text-[15px] text-trichomes-forest/70 leading-relaxed font-body">Personalized consultations to help you find your perfect routine.</p>
                                    </div>
                                    <div>
                                        <h3 className="text-[20px] font-heading text-trichomes-forest mb-3 font-semibold">Educate First</h3>
                                        <div className="w-full h-px bg-trichomes-forest/10 mb-4" />
                                        <p className="text-[15px] text-trichomes-forest/70 leading-relaxed font-body">We believe in education first, consultation second, products third.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </EditableSection>
        </div>
    );
}

// =====================
// ABOUT PAGE EDITOR
// =====================
const ABOUT_DEFAULTS = {
    hero: { title: "About Us", imageUrl: "/banners/about-us.jpg" },
    welcome: "Welcome to Trichomes, your integrated digital skincare sanctuary.",
    purpose: { title: "Our Purpose", description: "To make self-care accessible for all." },
    mission: { title: "Mission", description: "To bridge the gap in accessible, quality skincare in Nigeria." },
    vision: { title: "Vision", description: "To become Africa's leading integrated digital platform for skincare." },
    approach: { title: "Our Approach", subtitle: "Educate. Consult. Shop", description: "We believe in a three-pronged approach to skincare." },
    educate: { title: "Educate First", content: "Knowledge is the first step to healthy, radiant skin." },
};

function AboutPageEditor({ contentMap, editingSection, onEditSection, getSectionConfig }: EditorProps) {
    const hero = {
        title: contentMap[CONTENT_TYPES.ABOUT_HERO]?.title || ABOUT_DEFAULTS.hero.title,
        imageUrl: contentMap[CONTENT_TYPES.ABOUT_HERO]?.image_url || ABOUT_DEFAULTS.hero.imageUrl,
    };
    const welcome = contentMap[CONTENT_TYPES.ABOUT_WELCOME]?.description || ABOUT_DEFAULTS.welcome;
    const purpose = {
        title: contentMap[CONTENT_TYPES.ABOUT_PURPOSE]?.title || ABOUT_DEFAULTS.purpose.title,
        description: contentMap[CONTENT_TYPES.ABOUT_PURPOSE]?.description || ABOUT_DEFAULTS.purpose.description,
    };
    const mission = {
        title: contentMap[CONTENT_TYPES.ABOUT_MISSION]?.title || ABOUT_DEFAULTS.mission.title,
        description: contentMap[CONTENT_TYPES.ABOUT_MISSION]?.description || ABOUT_DEFAULTS.mission.description,
    };
    const vision = {
        title: contentMap[CONTENT_TYPES.ABOUT_VISION]?.title || ABOUT_DEFAULTS.vision.title,
        description: contentMap[CONTENT_TYPES.ABOUT_VISION]?.description || ABOUT_DEFAULTS.vision.description,
    };
    const approach = {
        title: contentMap[CONTENT_TYPES.ABOUT_APPROACH]?.title || ABOUT_DEFAULTS.approach.title,
        subtitle: contentMap[CONTENT_TYPES.ABOUT_APPROACH]?.subtitle || ABOUT_DEFAULTS.approach.subtitle,
        description: contentMap[CONTENT_TYPES.ABOUT_APPROACH]?.description || ABOUT_DEFAULTS.approach.description,
    };
    const educate = {
        title: contentMap[CONTENT_TYPES.ABOUT_EDUCATE]?.title || ABOUT_DEFAULTS.educate.title,
        content: contentMap[CONTENT_TYPES.ABOUT_EDUCATE]?.content || ABOUT_DEFAULTS.educate.content,
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Hero */}
            <EditableSection
                sectionName="Hero Section"
                isEditing={editingSection === CONTENT_TYPES.ABOUT_HERO}
                onEditClick={() => onEditSection(CONTENT_TYPES.ABOUT_HERO)}
                editForm={<InlineEditor contentType={CONTENT_TYPES.ABOUT_HERO} sectionName="Hero Section" initialData={contentMap[CONTENT_TYPES.ABOUT_HERO]} onSave={() => onEditSection(null)} onCancel={() => onEditSection(null)} fields={getSectionConfig(CONTENT_TYPES.ABOUT_HERO)?.fields as FieldType[]} />}
            >
                <div className="relative w-full h-[300px] lg:h-[400px]" style={{ backgroundImage: `url('${hero.imageUrl}')`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(to left, rgba(166,147,142,0.88), rgba(166,147,142,0.70), rgba(166,147,142,0.35))' }} />
                    <div className="relative h-full flex items-center px-8 max-w-[2200px] mx-auto">
                        <div>
                            <h1 className="text-[40px] lg:text-[56px] font-heading text-white leading-tight mb-4">{hero.title}</h1>
                            <nav className="flex items-center space-x-2">
                                <span className="text-[14px] text-white/80 font-body">Home</span>
                                <ChevronRightIcon className="w-4 h-4 text-white/60" />
                                <span className="text-[14px] text-white font-body">About Us</span>
                            </nav>
                        </div>
                    </div>
                </div>
            </EditableSection>

            <div className="mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 max-w-[1440px]">
                <div className="max-w-5xl mx-auto">
                    {/* Welcome */}
                    <EditableSection sectionName="Welcome Text" isEditing={editingSection === CONTENT_TYPES.ABOUT_WELCOME} onEditClick={() => onEditSection(CONTENT_TYPES.ABOUT_WELCOME)} editForm={<InlineEditor contentType={CONTENT_TYPES.ABOUT_WELCOME} sectionName="Welcome Text" initialData={contentMap[CONTENT_TYPES.ABOUT_WELCOME]} onSave={() => onEditSection(null)} onCancel={() => onEditSection(null)} fields={getSectionConfig(CONTENT_TYPES.ABOUT_WELCOME)?.fields as FieldType[]} />}>
                        <p className="text-[16px] lg:text-[18px] text-gray-600 font-body mb-10 leading-relaxed">{welcome}</p>
                    </EditableSection>

                    {/* Purpose */}
                    <EditableSection sectionName="Our Purpose" isEditing={editingSection === CONTENT_TYPES.ABOUT_PURPOSE} onEditClick={() => onEditSection(CONTENT_TYPES.ABOUT_PURPOSE)} editForm={<InlineEditor contentType={CONTENT_TYPES.ABOUT_PURPOSE} sectionName="Our Purpose" initialData={contentMap[CONTENT_TYPES.ABOUT_PURPOSE]} onSave={() => onEditSection(null)} onCancel={() => onEditSection(null)} fields={getSectionConfig(CONTENT_TYPES.ABOUT_PURPOSE)?.fields as FieldType[]} />}>
                        <div className="bg-gray-50 rounded-sm p-6 sm:p-8 mb-8 border border-gray-200">
                            <h2 className="text-[18px] sm:text-[20px] font-heading text-gray-900 mb-3 font-medium">{purpose.title}</h2>
                            <p className="text-[15px] sm:text-[16px] text-gray-600 font-body leading-relaxed">{purpose.description}</p>
                        </div>
                    </EditableSection>

                    <div className="border-t border-gray-200 mb-8" />

                    {/* Mission & Vision */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <EditableSection sectionName="Mission" isEditing={editingSection === CONTENT_TYPES.ABOUT_MISSION} onEditClick={() => onEditSection(CONTENT_TYPES.ABOUT_MISSION)} editForm={<InlineEditor contentType={CONTENT_TYPES.ABOUT_MISSION} sectionName="Mission" initialData={contentMap[CONTENT_TYPES.ABOUT_MISSION]} onSave={() => onEditSection(null)} onCancel={() => onEditSection(null)} fields={getSectionConfig(CONTENT_TYPES.ABOUT_MISSION)?.fields as FieldType[]} />}>
                            <div className="bg-gray-50 rounded-sm p-6 border border-gray-200 h-full">
                                <h2 className="text-[18px] sm:text-[20px] font-heading text-gray-900 mb-3 font-medium">{mission.title}</h2>
                                <p className="text-[14px] sm:text-[15px] text-gray-600 font-body leading-relaxed">{mission.description}</p>
                            </div>
                        </EditableSection>
                        <EditableSection sectionName="Vision" isEditing={editingSection === CONTENT_TYPES.ABOUT_VISION} onEditClick={() => onEditSection(CONTENT_TYPES.ABOUT_VISION)} editForm={<InlineEditor contentType={CONTENT_TYPES.ABOUT_VISION} sectionName="Vision" initialData={contentMap[CONTENT_TYPES.ABOUT_VISION]} onSave={() => onEditSection(null)} onCancel={() => onEditSection(null)} fields={getSectionConfig(CONTENT_TYPES.ABOUT_VISION)?.fields as FieldType[]} />}>
                            <div className="bg-gray-50 rounded-sm p-6 border border-gray-200 h-full">
                                <h2 className="text-[18px] sm:text-[20px] font-heading text-gray-900 mb-3 font-medium">{vision.title}</h2>
                                <p className="text-[14px] sm:text-[15px] text-gray-600 font-body leading-relaxed">{vision.description}</p>
                            </div>
                        </EditableSection>
                    </div>

                    <div className="border-t border-gray-200 mb-8" />

                    {/* Approach */}
                    <EditableSection sectionName="Our Approach" isEditing={editingSection === CONTENT_TYPES.ABOUT_APPROACH} onEditClick={() => onEditSection(CONTENT_TYPES.ABOUT_APPROACH)} editForm={<InlineEditor contentType={CONTENT_TYPES.ABOUT_APPROACH} sectionName="Our Approach" initialData={contentMap[CONTENT_TYPES.ABOUT_APPROACH]} onSave={() => onEditSection(null)} onCancel={() => onEditSection(null)} fields={getSectionConfig(CONTENT_TYPES.ABOUT_APPROACH)?.fields as FieldType[]} />}>
                        <div className="mb-8">
                            <h2 className="text-[18px] sm:text-[20px] font-heading text-gray-900 mb-3 font-medium">{approach.title}</h2>
                            <p className="text-[16px] sm:text-[18px] font-body text-gray-900 mb-3 font-medium">{approach.subtitle}</p>
                            <p className="text-[15px] sm:text-[16px] text-gray-600 font-body leading-relaxed">{approach.description}</p>
                        </div>
                    </EditableSection>

                    <div className="border-t border-gray-200 mb-8" />

                    {/* Educate First */}
                    <EditableSection sectionName="Educate First" isEditing={editingSection === CONTENT_TYPES.ABOUT_EDUCATE} onEditClick={() => onEditSection(CONTENT_TYPES.ABOUT_EDUCATE)} editForm={<InlineEditor contentType={CONTENT_TYPES.ABOUT_EDUCATE} sectionName="Educate First" initialData={contentMap[CONTENT_TYPES.ABOUT_EDUCATE]} onSave={() => onEditSection(null)} onCancel={() => onEditSection(null)} fields={getSectionConfig(CONTENT_TYPES.ABOUT_EDUCATE)?.fields as FieldType[]} />}>
                        <div className="bg-gray-50 rounded-sm p-6 sm:p-8 border border-gray-200">
                            <h2 className="text-[18px] sm:text-[20px] font-heading text-gray-900 mb-4 font-medium">{educate.title}</h2>
                            <p className="text-[15px] sm:text-[16px] text-gray-600 font-body leading-relaxed whitespace-pre-line">{educate.content}</p>
                        </div>
                    </EditableSection>
                </div>
            </div>
        </div>
    );
}

// =====================
// CONSULTATION PAGE EDITOR
// =====================
function ConsultationPageEditor({ contentMap, editingSection, onEditSection, getSectionConfig }: EditorProps) {
    const hero = {
        title: contentMap[CONTENT_TYPES.CONSULTATION_HERO]?.title || "Book a Consultation",
        description: contentMap[CONTENT_TYPES.CONSULTATION_HERO]?.description || "Get personalized skincare advice from our experts",
        imageUrl: contentMap[CONTENT_TYPES.CONSULTATION_HERO]?.image_url || "/banners/consultation.jpg",
    };
    const intro = {
        title: contentMap[CONTENT_TYPES.CONSULTATION_INTRO]?.title || "How It Works",
        description: contentMap[CONTENT_TYPES.CONSULTATION_INTRO]?.description || "Our consultation process is simple and effective.",
    };

    return (
        <div className="min-h-screen bg-white">
            <EditableSection sectionName="Hero Section" isEditing={editingSection === CONTENT_TYPES.CONSULTATION_HERO} onEditClick={() => onEditSection(CONTENT_TYPES.CONSULTATION_HERO)} editForm={<InlineEditor contentType={CONTENT_TYPES.CONSULTATION_HERO} sectionName="Hero Section" initialData={contentMap[CONTENT_TYPES.CONSULTATION_HERO]} onSave={() => onEditSection(null)} onCancel={() => onEditSection(null)} fields={getSectionConfig(CONTENT_TYPES.CONSULTATION_HERO)?.fields as FieldType[]} />}>
                <div className="relative h-64 bg-cover bg-center" style={{ backgroundImage: `url('${hero.imageUrl}')` }}>
                    <div className="absolute inset-0 bg-green-900/60" />
                    <div className="relative h-full flex flex-col justify-center px-8">
                        <h1 className="text-4xl font-bold text-white mb-2">{hero.title}</h1>
                        <p className="text-white/80">{hero.description}</p>
                    </div>
                </div>
            </EditableSection>
            <div className="max-w-4xl mx-auto px-8 py-12">
                <EditableSection sectionName="Introduction" isEditing={editingSection === CONTENT_TYPES.CONSULTATION_INTRO} onEditClick={() => onEditSection(CONTENT_TYPES.CONSULTATION_INTRO)} editForm={<InlineEditor contentType={CONTENT_TYPES.CONSULTATION_INTRO} sectionName="Introduction" initialData={contentMap[CONTENT_TYPES.CONSULTATION_INTRO]} onSave={() => onEditSection(null)} onCancel={() => onEditSection(null)} fields={getSectionConfig(CONTENT_TYPES.CONSULTATION_INTRO)?.fields as FieldType[]} />}>
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">{intro.title}</h2>
                        <p className="text-gray-600">{intro.description}</p>
                    </div>
                </EditableSection>
            </div>
        </div>
    );
}

// =====================
// PRODUCTS PAGE EDITOR
// =====================
function ProductsPageEditor({ contentMap, editingSection, onEditSection, getSectionConfig }: EditorProps) {
    const hero = {
        title: contentMap[CONTENT_TYPES.PRODUCTS_HERO]?.title || "Our Products",
        description: contentMap[CONTENT_TYPES.PRODUCTS_HERO]?.description || "Discover our curated collection of skincare products",
        imageUrl: contentMap[CONTENT_TYPES.PRODUCTS_HERO]?.image_url || "/banners/products.jpg",
    };

    return (
        <div className="min-h-screen bg-white">
            <EditableSection sectionName="Hero Section" isEditing={editingSection === CONTENT_TYPES.PRODUCTS_HERO} onEditClick={() => onEditSection(CONTENT_TYPES.PRODUCTS_HERO)} editForm={<InlineEditor contentType={CONTENT_TYPES.PRODUCTS_HERO} sectionName="Hero Section" initialData={contentMap[CONTENT_TYPES.PRODUCTS_HERO]} onSave={() => onEditSection(null)} onCancel={() => onEditSection(null)} fields={getSectionConfig(CONTENT_TYPES.PRODUCTS_HERO)?.fields as FieldType[]} />}>
                <div className="relative h-48 bg-cover bg-center" style={{ backgroundImage: `url('${hero.imageUrl}')` }}>
                    <div className="absolute inset-0 bg-gray-800/50" />
                    <div className="relative h-full flex flex-col justify-center px-8">
                        <h1 className="text-3xl font-bold text-white mb-2">{hero.title}</h1>
                        <p className="text-white/80">{hero.description}</p>
                    </div>
                </div>
            </EditableSection>
        </div>
    );
}

// =====================
// BRANDS PAGE EDITOR
// =====================
function BrandsPageEditor({ contentMap, editingSection, onEditSection, getSectionConfig }: EditorProps) {
    const hero = {
        title: contentMap[CONTENT_TYPES.BRANDS_HERO]?.title || "Shop by Brand",
        description: contentMap[CONTENT_TYPES.BRANDS_HERO]?.description || "Explore products from trusted skincare brands",
        imageUrl: contentMap[CONTENT_TYPES.BRANDS_HERO]?.image_url || "/banners/brands.jpg",
    };

    return (
        <div className="min-h-screen bg-white">
            <EditableSection sectionName="Hero Section" isEditing={editingSection === CONTENT_TYPES.BRANDS_HERO} onEditClick={() => onEditSection(CONTENT_TYPES.BRANDS_HERO)} editForm={<InlineEditor contentType={CONTENT_TYPES.BRANDS_HERO} sectionName="Hero Section" initialData={contentMap[CONTENT_TYPES.BRANDS_HERO]} onSave={() => onEditSection(null)} onCancel={() => onEditSection(null)} fields={getSectionConfig(CONTENT_TYPES.BRANDS_HERO)?.fields as FieldType[]} />}>
                <div className="relative h-48 bg-cover bg-center" style={{ backgroundImage: `url('${hero.imageUrl}')` }}>
                    <div className="absolute inset-0 bg-purple-900/50" />
                    <div className="relative h-full flex flex-col justify-center px-8">
                        <h1 className="text-3xl font-bold text-white mb-2">{hero.title}</h1>
                        <p className="text-white/80">{hero.description}</p>
                    </div>
                </div>
            </EditableSection>
        </div>
    );
}

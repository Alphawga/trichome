/**
 * Content Type Constants
 *
 * Defines all content types for editable website sections.
 * Using constants instead of Prisma enums for flexibility - new types can be added
 * without database migrations.
 */

export const CONTENT_TYPES = {
    // Home Page Sections
    HOME_HERO: "HOME_HERO",
    HOME_COLLECTION_TITLE: "HOME_COLLECTION_TITLE",
    HOME_FEATURED_TITLE: "HOME_FEATURED_TITLE",
    HOME_TOPSELLERS_TITLE: "HOME_TOPSELLERS_TITLE",
    HOME_BANNER_LEFT: "HOME_BANNER_LEFT",
    HOME_BANNER_RIGHT: "HOME_BANNER_RIGHT",
    HOME_BOOK_SESSION: "HOME_BOOK_SESSION",
    HOME_WHY_CHOOSE: "HOME_WHY_CHOOSE",

    // About Page Sections
    ABOUT_HERO: "ABOUT_HERO",
    ABOUT_WELCOME: "ABOUT_WELCOME",
    ABOUT_PURPOSE: "ABOUT_PURPOSE",
    ABOUT_MISSION: "ABOUT_MISSION",
    ABOUT_VISION: "ABOUT_VISION",
    ABOUT_APPROACH: "ABOUT_APPROACH",
    ABOUT_EDUCATE: "ABOUT_EDUCATE",

    // Consultation Page
    CONSULTATION_HERO: "CONSULTATION_HERO",
    CONSULTATION_INTRO: "CONSULTATION_INTRO",

    // Products Page
    PRODUCTS_HERO: "PRODUCTS_HERO",

    // Brands Page
    BRANDS_HERO: "BRANDS_HERO",

    // Dynamic Content
    BANNER: "BANNER",
    ANNOUNCEMENT: "ANNOUNCEMENT",
    PROMOTION: "PROMOTION",
} as const;

export type ContentType = (typeof CONTENT_TYPES)[keyof typeof CONTENT_TYPES];

/**
 * Field configuration for different section types
 */
export type FieldType =
    | "title"
    | "subtitle"
    | "description"
    | "content"
    | "button_text"
    | "button_link"
    | "image_url";

export interface SectionConfig {
    type: ContentType;
    name: string;
    description: string;
    fields: FieldType[];
}

/**
 * Page definitions for the content editor
 * Maps pages to their editable sections with field configurations
 */
export const EDITABLE_PAGES = [
    {
        slug: "home",
        name: "Home Page",
        description: "Main landing page with hero section and featured content",
        sections: [
            {
                type: CONTENT_TYPES.HOME_HERO,
                name: "Hero Section",
                description: "Main hero banner with title, subtitle, and CTA",
                fields: [
                    "title",
                    "description",
                    "button_text",
                    "button_link",
                    "image_url",
                ] as FieldType[],
            },
            {
                type: CONTENT_TYPES.HOME_COLLECTION_TITLE,
                name: "Our Collection Title",
                description: "Section title for the collection grid",
                fields: ["title"] as FieldType[],
            },
            {
                type: CONTENT_TYPES.HOME_FEATURED_TITLE,
                name: "Featured Items Title",
                description: "Section title for featured products",
                fields: ["title"] as FieldType[],
            },
            {
                type: CONTENT_TYPES.HOME_TOPSELLERS_TITLE,
                name: "Top Sellers Title",
                description: "Section title for top selling products",
                fields: ["title"] as FieldType[],
            },
            {
                type: CONTENT_TYPES.HOME_BANNER_LEFT,
                name: "Left Banner",
                description: "Left promotional banner with button",
                fields: ["button_text", "button_link", "image_url"] as FieldType[],
            },
            {
                type: CONTENT_TYPES.HOME_BANNER_RIGHT,
                name: "Right Banner",
                description: "Right promotional banner with button",
                fields: ["button_text", "button_link", "image_url"] as FieldType[],
            },
            {
                type: CONTENT_TYPES.HOME_BOOK_SESSION,
                name: "Book Session Section",
                description: "Call to action for booking consultations",
                fields: [
                    "title",
                    "description",
                    "button_text",
                    "button_link",
                    "image_url",
                ] as FieldType[],
            },
            {
                type: CONTENT_TYPES.HOME_WHY_CHOOSE,
                name: "Why Choose Us",
                description: "Benefits and value proposition section",
                fields: ["title", "content", "image_url"] as FieldType[],
            },
        ],
    },
    {
        slug: "about",
        name: "About Page",
        description: "Company information, mission, and vision",
        sections: [
            {
                type: CONTENT_TYPES.ABOUT_HERO,
                name: "Hero Section",
                description: "Page header with title and background",
                fields: ["title", "image_url"] as FieldType[],
            },
            {
                type: CONTENT_TYPES.ABOUT_WELCOME,
                name: "Welcome Text",
                description: "Introduction paragraph",
                fields: ["description"] as FieldType[],
            },
            {
                type: CONTENT_TYPES.ABOUT_PURPOSE,
                name: "Our Purpose",
                description: "Purpose statement section",
                fields: ["title", "description"] as FieldType[],
            },
            {
                type: CONTENT_TYPES.ABOUT_MISSION,
                name: "Mission",
                description: "Company mission statement",
                fields: ["title", "description"] as FieldType[],
            },
            {
                type: CONTENT_TYPES.ABOUT_VISION,
                name: "Vision",
                description: "Company vision statement",
                fields: ["title", "description"] as FieldType[],
            },
            {
                type: CONTENT_TYPES.ABOUT_APPROACH,
                name: "Our Approach",
                description: "Educate, Consult, Shop approach",
                fields: ["title", "subtitle", "description"] as FieldType[],
            },
            {
                type: CONTENT_TYPES.ABOUT_EDUCATE,
                name: "Educate First",
                description: "Education philosophy section",
                fields: ["title", "content"] as FieldType[],
            },
        ],
    },
    {
        slug: "consultation",
        name: "Consultation Page",
        description: "Book a skincare consultation",
        sections: [
            {
                type: CONTENT_TYPES.CONSULTATION_HERO,
                name: "Hero Section",
                description: "Page header with title",
                fields: ["title", "description", "image_url"] as FieldType[],
            },
            {
                type: CONTENT_TYPES.CONSULTATION_INTRO,
                name: "Introduction",
                description: "Consultation introduction text",
                fields: ["title", "description"] as FieldType[],
            },
        ],
    },
    {
        slug: "products",
        name: "Products Page",
        description: "Product listing with filters",
        sections: [
            {
                type: CONTENT_TYPES.PRODUCTS_HERO,
                name: "Hero Section",
                description: "Page header banner",
                fields: ["title", "description", "image_url"] as FieldType[],
            },
        ],
    },
    {
        slug: "brands",
        name: "Brands Page",
        description: "Browse by brand",
        sections: [
            {
                type: CONTENT_TYPES.BRANDS_HERO,
                name: "Hero Section",
                description: "Page header banner",
                fields: ["title", "description", "image_url"] as FieldType[],
            },
        ],
    },
] as const;

export type EditablePage = (typeof EDITABLE_PAGES)[number];

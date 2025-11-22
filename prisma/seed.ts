import {
  ContentStatus,
  ContentType,
  Currency,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  PrismaClient,
  ProductStatus,
  UserRole,
  UserStatus,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const isProd =
  process.env.NODE_ENV === "production" ||
  (process.env.APP_ENV || "").toLowerCase() === "production";
const allowFullSeed =
  process.env.ALLOW_FULL_SEED === "true" || process.env.ALLOW_FULL_SEED === "1";
const doFullSeed = !isProd || allowFullSeed;

async function seedMinimalProd() {
  console.log("Running minimal production seed...");
  // Create admin: Nonso Chillington (idempotent upsert)
  const adminEmail = process.env.ADMIN_EMAIL || "nonso@trichomes.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "demo123";
  const hashedPassword = await bcrypt.hash(adminPassword, 12);

  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      first_name: "Nonso",
      last_name: "Chillington",
      name: "Nonso Chillington",
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      password_hash: hashedPassword,
      emailVerified: new Date(),
      email_verified_at: new Date(),
    },
    create: {
      email: adminEmail,
      password_hash: hashedPassword,
      first_name: "Nonso",
      last_name: "Chillington",
      name: "Nonso Chillington",
      phone: "+2348012345678",
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      emailVerified: new Date(),
      email_verified_at: new Date(),
    },
  });

  // Minimal categories (idempotent upserts by slug)
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: "face-care" },
      update: {},
      create: {
        name: "Face Care",
        slug: "face-care",
        description: "Face care products",
        image: "/categories/face-care.jpg",
        status: ProductStatus.ACTIVE,
        sort_order: 1,
      },
    }),
    prisma.category.upsert({
      where: { slug: "body-care" },
      update: {},
      create: {
        name: "Body Care",
        slug: "body-care",
        description: "Body care products",
        image: "/categories/body-care.jpg",
        status: ProductStatus.ACTIVE,
        sort_order: 2,
      },
    }),
    prisma.category.upsert({
      where: { slug: "hair-care" },
      update: {},
      create: {
        name: "Hair Care",
        slug: "hair-care",
        description: "Hair care products",
        image: "/categories/hair-care.jpg",
        status: ProductStatus.ACTIVE,
        sort_order: 3,
      },
    }),
  ]);

  const faceCategory = categories[0];
  const bodyCategory = categories[1];
  const hairCategory = categories[2];

  // Minimal products (3-4)
  const p1 = await prisma.product.upsert({
    where: { slug: "vitamin-c-brightening-serum" },
    update: {},
    create: {
      name: "Vitamin C Brightening Serum",
      slug: "vitamin-c-brightening-serum",
      description: "Brightening serum with vitamin C.",
      short_description: "Brightens and evens skin tone",
      sku: "VC-SERUM-30ML",
      barcode: "9000000000001",
      price: 15500.0,
      quantity: 50,
      weight: 0.05,
      status: ProductStatus.ACTIVE,
      is_featured: true,
      category_id: faceCategory.id,
    },
  });
  const p2 = await prisma.product.upsert({
    where: { slug: "nourishing-body-butter" },
    update: {},
    create: {
      name: "Nourishing Body Butter",
      slug: "nourishing-body-butter",
      description: "Rich body butter with shea and cocoa.",
      short_description: "Intensive moisture for dry skin",
      sku: "BODY-BUTTER-200ML",
      barcode: "9000000000002",
      price: 11200.0,
      quantity: 40,
      weight: 0.23,
      status: ProductStatus.ACTIVE,
      is_featured: true,
      category_id: bodyCategory.id,
    },
  });
  const p3 = await prisma.product.upsert({
    where: { slug: "natural-hair-growth-oil" },
    update: {},
    create: {
      name: "Natural Hair Growth Oil",
      slug: "natural-hair-growth-oil",
      description: "Castor and rosemary oil blend.",
      short_description: "Promotes healthy hair growth",
      sku: "HAIR-OIL-100ML",
      barcode: "9000000000003",
      price: 9800.0,
      quantity: 60,
      weight: 0.11,
      status: ProductStatus.ACTIVE,
      category_id: hairCategory.id,
    },
  });
  // Simple images (idempotent find-or-create)
  if (
    !(await prisma.productImage.findFirst({
      where: { product_id: p1.id, sort_order: 1 },
    }))
  ) {
    await prisma.productImage.create({
      data: {
        product_id: p1.id,
        url: "/products/vitamin-c-serum-1.jpg",
        alt_text: "Vitamin C Serum",
        sort_order: 1,
        is_primary: true,
      },
    });
  }
  if (
    !(await prisma.productImage.findFirst({
      where: { product_id: p2.id, sort_order: 1 },
    }))
  ) {
    await prisma.productImage.create({
      data: {
        product_id: p2.id,
        url: "/products/body-butter-1.jpg",
        alt_text: "Body Butter",
        sort_order: 1,
        is_primary: true,
      },
    });
  }
  if (
    !(await prisma.productImage.findFirst({
      where: { product_id: p3.id, sort_order: 1 },
    }))
  ) {
    await prisma.productImage.create({
      data: {
        product_id: p3.id,
        url: "/products/hair-oil-1.jpg",
        alt_text: "Hair Oil",
        sort_order: 1,
        is_primary: true,
      },
    });
  }

  console.log("Minimal production seeding completed. Admin:", adminUser.email);
}

async function main() {
  // If production and not explicitly allowing full seed, run minimal seed and exit
  if (!doFullSeed) {
    await seedMinimalProd();
    return;
  }
  console.log("Starting database seeding...");

  // Clean database (optional - comment out if you want to preserve existing data)
  console.log("Cleaning existing data...");
  await prisma.orderStatusHistory.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.address.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.category.deleteMany();
  await prisma.newsletter.deleteMany();
  await prisma.content.deleteMany();
  await prisma.systemSetting.deleteMany();
  await prisma.userPermission.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  // Hash password for demo users
  const hashedPassword = await bcrypt.hash("demo123", 12);

  // Create Users
  console.log("Creating users...");
  const adminUser = await prisma.user.create({
    data: {
      email: "admin@trichomes.com",
      password_hash: hashedPassword,
      first_name: "Admin",
      last_name: "User",
      name: "Admin User",
      phone: "+2348012345678",
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      emailVerified: new Date(),
      email_verified_at: new Date(),
      phone_verified_at: new Date(),
      last_login_at: new Date(),
    },
  });

  const customerUser = await prisma.user.create({
    data: {
      email: "customer@example.com",
      password_hash: hashedPassword,
      first_name: "John",
      last_name: "Doe",
      name: "John Doe",
      phone: "+2348087654321",
      role: UserRole.CUSTOMER,
      status: UserStatus.ACTIVE,
      emailVerified: new Date(),
      email_verified_at: new Date(),
      phone_verified_at: new Date(),
      last_login_at: new Date(),
    },
  });

  const customerUser2 = await prisma.user.create({
    data: {
      email: "jane.smith@example.com",
      password_hash: hashedPassword,
      first_name: "Jane",
      last_name: "Smith",
      name: "Jane Smith",
      phone: "+2348098765432",
      role: UserRole.CUSTOMER,
      status: UserStatus.ACTIVE,
      emailVerified: new Date(),
      email_verified_at: new Date(),
    },
  });

  const staffUser = await prisma.user.create({
    data: {
      email: "staff@trichomes.com",
      password_hash: hashedPassword,
      first_name: "Staff",
      last_name: "Member",
      name: "Staff Member",
      phone: "+2348067891234",
      role: UserRole.STAFF,
      status: UserStatus.ACTIVE,
      emailVerified: new Date(),
      email_verified_at: new Date(),
    },
  });

  console.log("Created users:", {
    adminUser: adminUser.email,
    customerUser: customerUser.email,
  });

  // Create Addresses
  console.log("Creating addresses...");
  const address1 = await prisma.address.create({
    data: {
      user_id: customerUser.id,
      first_name: "John",
      last_name: "Doe",
      address_1: "123 Victoria Island",
      address_2: "Eko Tower, Floor 5",
      city: "Lagos",
      state: "Lagos",
      postal_code: "101241",
      country: "Nigeria",
      phone: "+2348087654321",
      is_default: true,
    },
  });

  const address2 = await prisma.address.create({
    data: {
      user_id: customerUser2.id,
      first_name: "Jane",
      last_name: "Smith",
      address_1: "45 Lekki Phase 1",
      city: "Lagos",
      state: "Lagos",
      postal_code: "105102",
      country: "Nigeria",
      phone: "+2348098765432",
      is_default: true,
    },
  });

  // Create Categories
  console.log("Creating categories...");
  const faceCategory = await prisma.category.create({
    data: {
      name: "Face Care",
      slug: "face-care",
      description: "Premium face care products for healthy, glowing skin",
      image: "/categories/face-care.jpg",
      status: ProductStatus.ACTIVE,
      sort_order: 1,
    },
  });

  const bodyCategory = await prisma.category.create({
    data: {
      name: "Body Care",
      slug: "body-care",
      description: "Luxurious body care products for smooth, nourished skin",
      image: "/categories/body-care.jpg",
      status: ProductStatus.ACTIVE,
      sort_order: 2,
    },
  });

  const hairCategory = await prisma.category.create({
    data: {
      name: "Hair Care",
      slug: "hair-care",
      description: "Natural hair care solutions for all hair types",
      image: "/categories/hair-care.jpg",
      status: ProductStatus.ACTIVE,
      sort_order: 3,
    },
  });

  await prisma.category.create({
    data: {
      name: "Sun Care",
      slug: "sun-care",
      description: "Protective sun care products for healthy, shielded skin",
      image: "/categories/hair-care.jpg",
      status: ProductStatus.ACTIVE,
      sort_order: 4,
    },
  });

  const moisturizersCategory = await prisma.category.create({
    data: {
      name: "Moisturizers",
      slug: "moisturizers",
      description: "Hydrating moisturizers for all skin types",
      image: "/categories/moisturizers.jpg",
      status: ProductStatus.ACTIVE,
      sort_order: 5,
      parent_id: faceCategory.id,
    },
  });

  const cleansersCategory = await prisma.category.create({
    data: {
      name: "Cleansers",
      slug: "cleansers",
      description: "Gentle cleansers for fresh, clean skin",
      image: "/categories/cleansers.jpg",
      status: ProductStatus.ACTIVE,
      sort_order: 6,
      parent_id: faceCategory.id,
    },
  });

  // Create Brands
  console.log("Creating brands...");
  const ceraVeBrand = await prisma.brand.create({
    data: {
      name: "CeraVe",
      slug: "cerave",
      description:
        "Developed with dermatologists, CeraVe provides essential ceramides to help restore and maintain the skin's natural barrier.",
      logo: "/brands/cerave-logo.png",
      image: "/brands/cerave-banner.jpg",
      status: ProductStatus.ACTIVE,
      sort_order: 1,
    },
  });

  const theOrdinaryBrand = await prisma.brand.create({
    data: {
      name: "The Ordinary",
      slug: "the-ordinary",
      description:
        "Clinical formulations with integrity. High-quality, effective skincare at accessible prices.",
      logo: "/brands/the-ordinary-logo.png",
      image: "/brands/the-ordinary-banner.jpg",
      status: ProductStatus.ACTIVE,
      sort_order: 2,
    },
  });

  const laPochePosayBrand = await prisma.brand.create({
    data: {
      name: "La Roche-Posay",
      slug: "la-roche-posay",
      description:
        "Recommended by dermatologists worldwide, trusted by sensitive skin.",
      logo: "/brands/la-roche-posay-logo.png",
      image: "/brands/la-roche-posay-banner.jpg",
      status: ProductStatus.ACTIVE,
      sort_order: 3,
    },
  });

  const neutrogenaaBrand = await prisma.brand.create({
    data: {
      name: "Neutrogena",
      slug: "neutrogena",
      description: "Dermatologist-recommended skincare backed by science.",
      logo: "/brands/neutrogena-logo.png",
      image: "/brands/neutrogena-banner.jpg",
      status: ProductStatus.ACTIVE,
      sort_order: 4,
    },
  });

  const sheaMoistureBrand = await prisma.brand.create({
    data: {
      name: "SheaMoisture",
      slug: "sheamoisture",
      description:
        "Natural and certified organic ingredients. Sustainably produced, cruelty-free.",
      logo: "/brands/sheamoisture-logo.png",
      image: "/brands/sheamoisture-banner.jpg",
      status: ProductStatus.ACTIVE,
      sort_order: 5,
    },
  });

  const paularChoiceBrand = await prisma.brand.create({
    data: {
      name: "Paula's Choice",
      slug: "paulas-choice",
      description: "Research-backed formulas that deliver visible results.",
      logo: "/brands/paulas-choice-logo.png",
      image: "/brands/paulas-choice-banner.jpg",
      status: ProductStatus.ACTIVE,
      sort_order: 6,
    },
  });

  const glossierBrand = await prisma.brand.create({
    data: {
      name: "Glossier",
      slug: "glossier",
      description:
        "Skin first. Makeup second. Simple, effective beauty essentials.",
      logo: "/brands/glossier-logo.png",
      image: "/brands/glossier-banner.jpg",
      status: ProductStatus.ACTIVE,
      sort_order: 7,
    },
  });

  const drunkElephantBrand = await prisma.brand.create({
    data: {
      name: "Drunk Elephant",
      slug: "drunk-elephant",
      description: "Clean, biocompatible skincare that supports skin's health.",
      logo: "/brands/drunk-elephant-logo.png",
      image: "/brands/drunk-elephant-banner.jpg",
      status: ProductStatus.ACTIVE,
      sort_order: 8,
    },
  });

  // Create Products
  console.log("Creating products...");
  const product1 = await prisma.product.create({
    data: {
      name: "Vitamin C Brightening Serum",
      slug: "vitamin-c-brightening-serum",
      description:
        "A powerful antioxidant serum that brightens skin tone, reduces dark spots, and protects against environmental damage. Formulated with 20% pure vitamin C for maximum effectiveness.",
      short_description:
        "Brightens and evens skin tone with 20% pure vitamin C",
      sku: "TRI-VC-SERUM-30ML",
      barcode: "8901234567890",
      price: 15500.0,
      compare_price: 18500.0,
      cost_price: 8000.0,
      quantity: 150,
      low_stock_threshold: 20,
      weight: 0.05,
      status: ProductStatus.ACTIVE,
      is_featured: true,
      category_id: faceCategory.id,
      brand_id: theOrdinaryBrand.id,
      seo_title: "Vitamin C Brightening Serum - Trichomes Skincare",
      seo_description:
        "Premium vitamin C serum for brighter, more radiant skin",
      view_count: 342,
      sale_count: 87,
    },
  });

  const product2 = await prisma.product.create({
    data: {
      name: "Hyaluronic Acid Hydrating Moisturizer",
      slug: "hyaluronic-acid-moisturizer",
      description:
        "Ultra-hydrating moisturizer with hyaluronic acid that holds up to 1000x its weight in water. Plumps and smooths fine lines while providing long-lasting hydration.",
      short_description: "Deep hydration with hyaluronic acid",
      sku: "TRI-HA-MOIST-50ML",
      barcode: "8901234567891",
      price: 12800.0,
      compare_price: 15000.0,
      cost_price: 6500.0,
      quantity: 200,
      low_stock_threshold: 30,
      weight: 0.075,
      status: ProductStatus.ACTIVE,
      is_featured: true,
      category_id: moisturizersCategory.id,
      brand_id: ceraVeBrand.id,
      seo_title: "Hyaluronic Acid Moisturizer - Deep Hydration",
      seo_description:
        "Intensive hydrating moisturizer with pure hyaluronic acid",
      view_count: 298,
      sale_count: 65,
    },
  });

  const product3 = await prisma.product.create({
    data: {
      name: "Gentle Foaming Cleanser",
      slug: "gentle-foaming-cleanser",
      description:
        "pH-balanced gentle cleanser that removes makeup, dirt, and impurities without stripping skin. Perfect for daily use on all skin types, including sensitive skin.",
      short_description: "Gentle daily cleanser for all skin types",
      sku: "TRI-CLEAN-FOAM-150ML",
      barcode: "8901234567892",
      price: 8500.0,
      compare_price: 10000.0,
      cost_price: 4200.0,
      quantity: 300,
      low_stock_threshold: 50,
      weight: 0.18,
      status: ProductStatus.ACTIVE,
      is_featured: false,
      category_id: cleansersCategory.id,
      brand_id: laPochePosayBrand.id,
      seo_title: "Gentle Foaming Cleanser - Daily Face Wash",
      seo_description: "pH-balanced cleanser for clean, refreshed skin",
      view_count: 187,
      sale_count: 92,
    },
  });

  const product4 = await prisma.product.create({
    data: {
      name: "Nourishing Body Butter",
      slug: "nourishing-body-butter",
      description:
        "Rich, creamy body butter enriched with shea butter, cocoa butter, and vitamin E. Provides intense moisture and leaves skin soft, smooth, and delicately scented.",
      short_description: "Intensive moisture for dry skin",
      sku: "TRI-BODY-BUTTER-200ML",
      barcode: "8901234567893",
      price: 11200.0,
      compare_price: 13500.0,
      cost_price: 5600.0,
      quantity: 180,
      low_stock_threshold: 25,
      weight: 0.23,
      status: ProductStatus.ACTIVE,
      is_featured: true,
      category_id: bodyCategory.id,
      brand_id: sheaMoistureBrand.id,
      seo_title: "Nourishing Body Butter - Intensive Moisture",
      seo_description: "Luxurious body butter with shea and cocoa butter",
      view_count: 215,
      sale_count: 53,
    },
  });

  const product5 = await prisma.product.create({
    data: {
      name: "Natural Hair Growth Oil",
      slug: "natural-hair-growth-oil",
      description:
        "Potent blend of natural oils including castor oil, rosemary, and peppermint to stimulate hair growth, strengthen hair follicles, and prevent breakage.",
      short_description: "Promotes healthy hair growth naturally",
      sku: "TRI-HAIR-OIL-100ML",
      barcode: "8901234567894",
      price: 9800.0,
      compare_price: 12000.0,
      cost_price: 4900.0,
      quantity: 120,
      low_stock_threshold: 15,
      weight: 0.11,
      status: ProductStatus.ACTIVE,
      is_featured: false,
      category_id: hairCategory.id,
      brand_id: glossierBrand.id,
      seo_title: "Natural Hair Growth Oil - Strengthen & Grow",
      seo_description: "Natural oil blend for healthy, strong hair growth",
      view_count: 156,
      sale_count: 41,
    },
  });

  const product6 = await prisma.product.create({
    data: {
      name: "Retinol Night Cream",
      slug: "retinol-night-cream",
      description:
        "Advanced anti-aging night cream with retinol to reduce fine lines, wrinkles, and improve skin texture while you sleep. Suitable for mature skin.",
      short_description: "Anti-aging night treatment with retinol",
      sku: "TRI-RETINOL-NIGHT-50ML",
      barcode: "8901234567895",
      price: 18900.0,
      compare_price: 22000.0,
      cost_price: 9500.0,
      quantity: 95,
      low_stock_threshold: 10,
      weight: 0.065,
      status: ProductStatus.ACTIVE,
      is_featured: true,
      category_id: moisturizersCategory.id,
      brand_id: neutrogenaaBrand.id,
      seo_title: "Retinol Night Cream - Anti-Aging Treatment",
      seo_description: "Powerful retinol night cream for youthful skin",
      view_count: 401,
      sale_count: 78,
    },
  });

  const product7 = await prisma.product.create({
    data: {
      name: "BHA Liquid Exfoliant",
      slug: "bha-liquid-exfoliant",
      description:
        "Gentle leave-on exfoliant with 2% salicylic acid that unclogs pores, smooths wrinkles, and evens skin tone. Perfect for acne-prone and oily skin.",
      short_description: "Exfoliating treatment for clearer skin",
      sku: "TRI-BHA-EXFOLIANT-100ML",
      barcode: "8901234567896",
      price: 14200.0,
      compare_price: 16500.0,
      cost_price: 7100.0,
      quantity: 140,
      low_stock_threshold: 20,
      weight: 0.12,
      status: ProductStatus.ACTIVE,
      is_featured: true,
      category_id: faceCategory.id,
      brand_id: paularChoiceBrand.id,
      seo_title: "BHA Liquid Exfoliant - Paula's Choice",
      seo_description: "Salicylic acid exfoliant for clear, smooth skin",
      view_count: 276,
      sale_count: 68,
    },
  });

  const product8 = await prisma.product.create({
    data: {
      name: "Protini Polypeptide Cream",
      slug: "protini-polypeptide-cream",
      description:
        "Protein moisturizer that combines signal peptides, growth factors, and amino acids to visibly improve skin's texture and tone. Rich yet lightweight formula.",
      short_description: "Protein-rich moisturizer for firmer skin",
      sku: "TRI-PROTINI-50ML",
      barcode: "8901234567897",
      price: 24500.0,
      compare_price: 28000.0,
      cost_price: 12250.0,
      quantity: 85,
      low_stock_threshold: 10,
      weight: 0.065,
      status: ProductStatus.ACTIVE,
      is_featured: true,
      category_id: moisturizersCategory.id,
      brand_id: drunkElephantBrand.id,
      seo_title: "Protini Polypeptide Cream - Drunk Elephant",
      seo_description: "Advanced protein moisturizer for youthful skin",
      view_count: 321,
      sale_count: 54,
    },
  });

  // Create Product Images
  console.log("Creating product images...");
  await prisma.productImage.createMany({
    data: [
      {
        product_id: product1.id,
        url: "/products/vitamin-c-serum-1.jpg",
        alt_text: "Vitamin C Serum front view",
        sort_order: 1,
        is_primary: true,
      },
      {
        product_id: product1.id,
        url: "/products/vitamin-c-serum-2.jpg",
        alt_text: "Vitamin C Serum texture",
        sort_order: 2,
      },
      {
        product_id: product2.id,
        url: "/products/ha-moisturizer-1.jpg",
        alt_text: "Hyaluronic Acid Moisturizer",
        sort_order: 1,
        is_primary: true,
      },
      {
        product_id: product2.id,
        url: "/products/ha-moisturizer-2.jpg",
        alt_text: "HA Moisturizer texture",
        sort_order: 2,
      },
      {
        product_id: product3.id,
        url: "/products/cleanser-1.jpg",
        alt_text: "Gentle Cleanser bottle",
        sort_order: 1,
        is_primary: true,
      },
      {
        product_id: product4.id,
        url: "/products/body-butter-1.jpg",
        alt_text: "Body Butter jar",
        sort_order: 1,
        is_primary: true,
      },
      {
        product_id: product4.id,
        url: "/products/body-butter-2.jpg",
        alt_text: "Body Butter texture",
        sort_order: 2,
      },
      {
        product_id: product5.id,
        url: "/products/hair-oil-1.jpg",
        alt_text: "Hair Growth Oil bottle",
        sort_order: 1,
        is_primary: true,
      },
      {
        product_id: product6.id,
        url: "/products/retinol-cream-1.jpg",
        alt_text: "Retinol Night Cream",
        sort_order: 1,
        is_primary: true,
      },
      {
        product_id: product7.id,
        url: "/products/placeholder.jpg",
        alt_text: "BHA Liquid Exfoliant bottle",
        sort_order: 1,
        is_primary: true,
      },
      {
        product_id: product8.id,
        url: "/products/placeholder.jpg",
        alt_text: "Protini Polypeptide Cream",
        sort_order: 1,
        is_primary: true,
      },
    ],
  });

  // Create Product Variants
  console.log("Creating product variants...");
  await prisma.productVariant.createMany({
    data: [
      {
        product_id: product1.id,
        name: "Size",
        value: "30ml",
        price: 15500.0,
        quantity: 150,
        sku: "TRI-VC-SERUM-30ML",
      },
      {
        product_id: product1.id,
        name: "Size",
        value: "60ml",
        price: 28000.0,
        quantity: 75,
        sku: "TRI-VC-SERUM-60ML",
      },
      {
        product_id: product2.id,
        name: "Size",
        value: "50ml",
        price: 12800.0,
        quantity: 200,
        sku: "TRI-HA-MOIST-50ML",
      },
      {
        product_id: product2.id,
        name: "Size",
        value: "100ml",
        price: 22500.0,
        quantity: 100,
        sku: "TRI-HA-MOIST-100ML",
      },
      {
        product_id: product4.id,
        name: "Size",
        value: "200ml",
        price: 11200.0,
        quantity: 180,
        sku: "TRI-BODY-BUTTER-200ML",
      },
      {
        product_id: product4.id,
        name: "Size",
        value: "400ml",
        price: 19800.0,
        quantity: 90,
        sku: "TRI-BODY-BUTTER-400ML",
      },
    ],
  });

  // Create Cart Items
  console.log("Creating cart items...");
  await prisma.cartItem.createMany({
    data: [
      { user_id: customerUser.id, product_id: product1.id, quantity: 2 },
      { user_id: customerUser.id, product_id: product3.id, quantity: 1 },
      { user_id: customerUser2.id, product_id: product2.id, quantity: 1 },
      { user_id: customerUser2.id, product_id: product4.id, quantity: 1 },
    ],
  });

  // Create Wishlist Items
  console.log("Creating wishlist items...");
  await prisma.wishlistItem.createMany({
    data: [
      { user_id: customerUser.id, product_id: product6.id },
      { user_id: customerUser.id, product_id: product4.id },
      { user_id: customerUser2.id, product_id: product1.id },
      { user_id: customerUser2.id, product_id: product5.id },
    ],
  });

  // Create Orders
  console.log("Creating orders...");
  const order1 = await prisma.order.create({
    data: {
      order_number: "ORD-2025-001",
      user_id: customerUser.id,
      email: customerUser.email,
      first_name: customerUser.first_name ?? "",
      last_name: customerUser.last_name ?? "",
      phone: customerUser.phone ?? "",
      status: OrderStatus.DELIVERED,
      payment_status: PaymentStatus.COMPLETED,
      payment_method: PaymentMethod.PAYSTACK,
      currency: Currency.NGN,
      subtotal: 31000.0,
      shipping_cost: 2500.0,
      tax: 0.0,
      discount: 3100.0,
      total: 30400.0,
      shipping_address_id: address1.id,
      notes: "Please deliver before 5pm",
      tracking_number: "TRK-2025-001-ABC",
      shipped_at: new Date("2025-01-10T10:00:00Z"),
      delivered_at: new Date("2025-01-12T14:30:00Z"),
    },
  });

  const order2 = await prisma.order.create({
    data: {
      order_number: "ORD-2025-002",
      user_id: customerUser2.id,
      email: customerUser2.email,
      first_name: customerUser2.first_name ?? "",
      last_name: customerUser2.last_name ?? "",
      phone: customerUser2.phone ?? "",
      status: OrderStatus.PROCESSING,
      payment_status: PaymentStatus.COMPLETED,
      payment_method: PaymentMethod.PAYSTACK,
      currency: Currency.NGN,
      subtotal: 24000.0,
      shipping_cost: 2500.0,
      tax: 0.0,
      discount: 0.0,
      total: 26500.0,
      shipping_address_id: address2.id,
      shipped_at: new Date("2025-01-15T09:00:00Z"),
    },
  });

  const order3 = await prisma.order.create({
    data: {
      order_number: "ORD-2025-003",
      user_id: customerUser.id,
      email: customerUser.email,
      first_name: customerUser.first_name ?? "",
      last_name: customerUser.last_name ?? "",
      phone: customerUser.phone ?? "",
      status: OrderStatus.PENDING,
      payment_status: PaymentStatus.PENDING,
      payment_method: PaymentMethod.PAYSTACK,
      currency: Currency.NGN,
      subtotal: 18900.0,
      shipping_cost: 2500.0,
      tax: 0.0,
      discount: 0.0,
      total: 21400.0,
      shipping_address_id: address1.id,
    },
  });

  // Create Order Items
  console.log("Creating order items...");
  await prisma.orderItem.createMany({
    data: [
      {
        order_id: order1.id,
        product_id: product1.id,
        product_name: product1.name,
        product_sku: product1.sku,
        price: 15500.0,
        quantity: 2,
        total: 31000.0,
      },
      {
        order_id: order2.id,
        product_id: product2.id,
        product_name: product2.name,
        product_sku: product2.sku,
        price: 12800.0,
        quantity: 1,
        total: 12800.0,
      },
      {
        order_id: order2.id,
        product_id: product4.id,
        product_name: product4.name,
        product_sku: product4.sku,
        price: 11200.0,
        quantity: 1,
        total: 11200.0,
      },
      {
        order_id: order3.id,
        product_id: product6.id,
        product_name: product6.name,
        product_sku: product6.sku,
        price: 18900.0,
        quantity: 1,
        total: 18900.0,
      },
    ],
  });

  // Create Payments
  console.log("Creating payments...");
  await prisma.payment.createMany({
    data: [
      {
        order_id: order1.id,
        payment_method: PaymentMethod.PAYSTACK,
        status: PaymentStatus.COMPLETED,
        amount: 30400.0,
        currency: Currency.NGN,
        transaction_id: "PAY-TXN-2025-001",
        reference: "REF-2025-001",
        gateway_response: { status: "success", message: "Payment successful" },
        processed_at: new Date("2025-01-08T16:45:00Z"),
      },
      {
        order_id: order2.id,
        payment_method: PaymentMethod.PAYSTACK,
        status: PaymentStatus.COMPLETED,
        amount: 26500.0,
        currency: Currency.NGN,
        transaction_id: "PAY-TXN-2025-002",
        reference: "REF-2025-002",
        gateway_response: { status: "success", message: "Payment successful" },
        processed_at: new Date("2025-01-14T11:20:00Z"),
      },
    ],
  });

  // Create Order Status History
  console.log("Creating order status history...");
  await prisma.orderStatusHistory.createMany({
    data: [
      {
        order_id: order1.id,
        status: OrderStatus.PENDING,
        notes: "Order placed",
        created_by: customerUser.id,
      },
      {
        order_id: order1.id,
        status: OrderStatus.CONFIRMED,
        notes: "Payment confirmed",
        created_by: adminUser.id,
      },
      {
        order_id: order1.id,
        status: OrderStatus.PROCESSING,
        notes: "Order being prepared",
        created_by: staffUser.id,
      },
      {
        order_id: order1.id,
        status: OrderStatus.SHIPPED,
        notes: "Order shipped via courier",
        created_by: staffUser.id,
      },
      {
        order_id: order1.id,
        status: OrderStatus.DELIVERED,
        notes: "Order delivered successfully",
        created_by: staffUser.id,
      },
      {
        order_id: order2.id,
        status: OrderStatus.PENDING,
        notes: "Order placed",
        created_by: customerUser2.id,
      },
      {
        order_id: order2.id,
        status: OrderStatus.CONFIRMED,
        notes: "Payment confirmed",
        created_by: adminUser.id,
      },
      {
        order_id: order2.id,
        status: OrderStatus.PROCESSING,
        notes: "Order being prepared",
        created_by: staffUser.id,
      },
      {
        order_id: order3.id,
        status: OrderStatus.PENDING,
        notes: "Order placed, awaiting payment",
        created_by: customerUser.id,
      },
    ],
  });

  // Create Newsletter Subscriptions
  console.log("Creating newsletter subscriptions...");
  await prisma.newsletter.createMany({
    data: [
      { email: customerUser.email, source: "signup" },
      { email: customerUser2.email, source: "signup" },
      { email: "newsletter1@example.com", source: "website" },
      { email: "newsletter2@example.com", source: "website" },
      { email: "newsletter3@example.com", source: "popup" },
    ],
  });

  // Create Content
  console.log("Creating content...");
  await prisma.content.createMany({
    data: [
      {
        type: ContentType.HERO_SECTION,
        title: "Natural Beauty, Naturally Yours",
        subtitle: "Premium Skincare Solutions",
        description:
          "Discover our range of natural, effective skincare products crafted with care",
        button_text: "Shop Now",
        button_link: "/products",
        image_url: "/hero/main-banner.jpg",
        status: ContentStatus.PUBLISHED,
        published_at: new Date(),
        sort_order: 1,
      },
      {
        type: ContentType.BANNER,
        title: "New Year Sale",
        subtitle: "Up to 30% Off",
        description: "Start the year with fresh, glowing skin",
        button_text: "Shop Sale",
        button_link: "/sale",
        image_url: "/banners/new-year-sale.jpg",
        status: ContentStatus.PUBLISHED,
        published_at: new Date(),
        expires_at: new Date("2025-01-31T23:59:59Z"),
        sort_order: 1,
      },
      {
        type: ContentType.PROMOTION,
        title: "Free Shipping",
        subtitle: "On Orders Over ₦20,000",
        description: "Get free delivery on all orders above ₦20,000",
        status: ContentStatus.PUBLISHED,
        published_at: new Date(),
        sort_order: 2,
      },
      {
        type: ContentType.ANNOUNCEMENT,
        title: "New Product Launch",
        description: "Introducing our new Retinol Night Cream - Available Now!",
        button_text: "Learn More",
        button_link: `/products/${product6.slug}`,
        status: ContentStatus.PUBLISHED,
        published_at: new Date(),
        sort_order: 1,
      },
    ],
  });

  // Create System Settings
  console.log("Creating system settings...");
  await prisma.systemSetting.createMany({
    data: [
      { key: "site_name", value: "Trichomes Skincare", type: "string" },
      {
        key: "site_description",
        value: "Premium natural skincare products",
        type: "string",
      },
      { key: "contact_email", value: "support@trichomes.com", type: "string" },
      { key: "contact_phone", value: "+234 801 234 5678", type: "string" },
      { key: "free_shipping_threshold", value: "20000", type: "number" },
      { key: "default_shipping_cost", value: "2500", type: "number" },
      { key: "tax_rate", value: "0", type: "number" },
      { key: "currency", value: "NGN", type: "string" },
      { key: "low_stock_notification", value: "true", type: "boolean" },
      { key: "order_auto_confirm", value: "false", type: "boolean" },
    ],
  });

  console.log("Database seeding completed successfully!");
  console.log("\nDemo Account Credentials:");
  console.log("-------------------------");
  console.log("Admin:");
  console.log("  Email: admin@trichomes.com");
  console.log("  Password: demo123");
  console.log("");
  console.log("Customer:");
  console.log("  Email: customer@example.com");
  console.log("  Password: demo123");
  console.log("");
  console.log("Staff:");
  console.log("  Email: staff@trichomes.com");
  console.log("  Password: demo123");
  console.log("-------------------------");
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

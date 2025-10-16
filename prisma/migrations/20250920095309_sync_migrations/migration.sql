-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('ADMIN', 'STAFF', 'CUSTOMER');

-- CreateEnum
CREATE TYPE "public"."UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION');

-- CreateEnum
CREATE TYPE "public"."OrderStatus" AS ENUM ('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "public"."PaymentStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED', 'REFUNDED', 'PARTIALLY_REFUNDED');

-- CreateEnum
CREATE TYPE "public"."PaymentMethod" AS ENUM ('PAYSTACK', 'FLUTTERWAVE', 'BANK_TRANSFER', 'USSD', 'WALLET');

-- CreateEnum
CREATE TYPE "public"."Currency" AS ENUM ('NGN', 'USD');

-- CreateEnum
CREATE TYPE "public"."ProductStatus" AS ENUM ('DRAFT', 'ACTIVE', 'INACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "public"."ContentType" AS ENUM ('BANNER', 'ANNOUNCEMENT', 'PROMOTION', 'HERO_SECTION', 'SIDEBAR_WIDGET', 'FOOTER_CONTENT', 'POPUP', 'NEWSLETTER');

-- CreateEnum
CREATE TYPE "public"."ContentStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'SCHEDULED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "first_name" TEXT,
    "last_name" TEXT,
    "phone" TEXT,
    "role" "public"."UserRole" NOT NULL DEFAULT 'CUSTOMER',
    "status" "public"."UserStatus" NOT NULL DEFAULT 'PENDING_VERIFICATION',
    "email_verified_at" TIMESTAMP(3),
    "phone_verified_at" TIMESTAMP(3),
    "last_login_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_permissions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "permission" TEXT NOT NULL,
    "granted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "granted_by" TEXT,

    CONSTRAINT "user_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."addresses" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "company" TEXT,
    "address_1" TEXT NOT NULL,
    "address_2" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "postal_code" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'Nigeria',
    "phone" TEXT,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "image" TEXT,
    "status" "public"."ProductStatus" NOT NULL DEFAULT 'ACTIVE',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "parent_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."products" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "short_description" TEXT,
    "sku" TEXT NOT NULL,
    "barcode" TEXT,
    "price" DECIMAL(12,2) NOT NULL,
    "compare_price" DECIMAL(12,2),
    "cost_price" DECIMAL(12,2),
    "track_quantity" BOOLEAN NOT NULL DEFAULT true,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "reserved_quantity" INTEGER NOT NULL DEFAULT 0,
    "low_stock_threshold" INTEGER NOT NULL DEFAULT 10,
    "weight" DECIMAL(8,3),
    "status" "public"."ProductStatus" NOT NULL DEFAULT 'DRAFT',
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "is_digital" BOOLEAN NOT NULL DEFAULT false,
    "requires_shipping" BOOLEAN NOT NULL DEFAULT true,
    "taxable" BOOLEAN NOT NULL DEFAULT true,
    "seo_title" TEXT,
    "seo_description" TEXT,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "sale_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "category_id" TEXT NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."product_images" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "alt_text" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."product_variants" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "price" DECIMAL(12,2),
    "quantity" INTEGER,
    "sku" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_variants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."cart_items" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cart_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."wishlist_items" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wishlist_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."orders" (
    "id" TEXT NOT NULL,
    "order_number" TEXT NOT NULL,
    "user_id" TEXT,
    "email" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "phone" TEXT,
    "status" "public"."OrderStatus" NOT NULL DEFAULT 'PENDING',
    "payment_status" "public"."PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "payment_method" "public"."PaymentMethod",
    "currency" "public"."Currency" NOT NULL DEFAULT 'NGN',
    "subtotal" DECIMAL(12,2) NOT NULL,
    "shipping_cost" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "tax" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "discount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(12,2) NOT NULL,
    "notes" TEXT,
    "tracking_number" TEXT,
    "shipped_at" TIMESTAMP(3),
    "delivered_at" TIMESTAMP(3),
    "cancelled_at" TIMESTAMP(3),
    "cancellation_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "shipping_address_id" TEXT,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."order_items" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "product_name" TEXT NOT NULL,
    "product_sku" TEXT NOT NULL,
    "price" DECIMAL(12,2) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "total" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."payments" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "payment_method" "public"."PaymentMethod" NOT NULL,
    "status" "public"."PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" "public"."Currency" NOT NULL DEFAULT 'NGN',
    "transaction_id" TEXT,
    "reference" TEXT,
    "gateway_response" JSONB,
    "failure_reason" TEXT,
    "processed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."order_status_history" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "status" "public"."OrderStatus" NOT NULL,
    "notes" TEXT,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_status_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."newsletter" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "source" TEXT DEFAULT 'website',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "newsletter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."content" (
    "id" TEXT NOT NULL,
    "type" "public"."ContentType" NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "description" TEXT,
    "content" TEXT,
    "button_text" TEXT,
    "button_link" TEXT,
    "image_url" TEXT,
    "video_url" TEXT,
    "metadata" JSONB,
    "status" "public"."ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "published_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "content_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."analytics" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "visitors" INTEGER NOT NULL DEFAULT 0,
    "page_views" INTEGER NOT NULL DEFAULT 0,
    "orders" INTEGER NOT NULL DEFAULT 0,
    "revenue" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "conversion_rate" DECIMAL(5,4) NOT NULL DEFAULT 0,
    "bounce_rate" DECIMAL(5,4) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."system_settings" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'string',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "public"."users"("phone");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "public"."users"("email");

-- CreateIndex
CREATE INDEX "users_phone_idx" ON "public"."users"("phone");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "public"."users"("role");

-- CreateIndex
CREATE INDEX "users_status_idx" ON "public"."users"("status");

-- CreateIndex
CREATE INDEX "users_created_at_idx" ON "public"."users"("created_at");

-- CreateIndex
CREATE INDEX "user_permissions_user_id_idx" ON "public"."user_permissions"("user_id");

-- CreateIndex
CREATE INDEX "user_permissions_permission_idx" ON "public"."user_permissions"("permission");

-- CreateIndex
CREATE UNIQUE INDEX "user_permissions_user_id_permission_key" ON "public"."user_permissions"("user_id", "permission");

-- CreateIndex
CREATE INDEX "addresses_user_id_idx" ON "public"."addresses"("user_id");

-- CreateIndex
CREATE INDEX "addresses_country_state_city_idx" ON "public"."addresses"("country", "state", "city");

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_key" ON "public"."categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "public"."categories"("slug");

-- CreateIndex
CREATE INDEX "categories_slug_idx" ON "public"."categories"("slug");

-- CreateIndex
CREATE INDEX "categories_status_idx" ON "public"."categories"("status");

-- CreateIndex
CREATE INDEX "categories_parent_id_idx" ON "public"."categories"("parent_id");

-- CreateIndex
CREATE INDEX "categories_sort_order_idx" ON "public"."categories"("sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "products_slug_key" ON "public"."products"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "products_sku_key" ON "public"."products"("sku");

-- CreateIndex
CREATE INDEX "products_slug_idx" ON "public"."products"("slug");

-- CreateIndex
CREATE INDEX "products_sku_idx" ON "public"."products"("sku");

-- CreateIndex
CREATE INDEX "products_status_idx" ON "public"."products"("status");

-- CreateIndex
CREATE INDEX "products_category_id_idx" ON "public"."products"("category_id");

-- CreateIndex
CREATE INDEX "products_is_featured_idx" ON "public"."products"("is_featured");

-- CreateIndex
CREATE INDEX "products_price_idx" ON "public"."products"("price");

-- CreateIndex
CREATE INDEX "products_created_at_idx" ON "public"."products"("created_at");

-- CreateIndex
CREATE INDEX "products_view_count_idx" ON "public"."products"("view_count");

-- CreateIndex
CREATE INDEX "products_sale_count_idx" ON "public"."products"("sale_count");

-- CreateIndex
CREATE INDEX "product_images_product_id_idx" ON "public"."product_images"("product_id");

-- CreateIndex
CREATE INDEX "product_images_sort_order_idx" ON "public"."product_images"("sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "product_variants_sku_key" ON "public"."product_variants"("sku");

-- CreateIndex
CREATE INDEX "product_variants_product_id_idx" ON "public"."product_variants"("product_id");

-- CreateIndex
CREATE INDEX "product_variants_sku_idx" ON "public"."product_variants"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "product_variants_product_id_name_value_key" ON "public"."product_variants"("product_id", "name", "value");

-- CreateIndex
CREATE INDEX "cart_items_user_id_idx" ON "public"."cart_items"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "cart_items_user_id_product_id_key" ON "public"."cart_items"("user_id", "product_id");

-- CreateIndex
CREATE INDEX "wishlist_items_user_id_idx" ON "public"."wishlist_items"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "wishlist_items_user_id_product_id_key" ON "public"."wishlist_items"("user_id", "product_id");

-- CreateIndex
CREATE UNIQUE INDEX "orders_order_number_key" ON "public"."orders"("order_number");

-- CreateIndex
CREATE INDEX "orders_order_number_idx" ON "public"."orders"("order_number");

-- CreateIndex
CREATE INDEX "orders_user_id_idx" ON "public"."orders"("user_id");

-- CreateIndex
CREATE INDEX "orders_status_idx" ON "public"."orders"("status");

-- CreateIndex
CREATE INDEX "orders_payment_status_idx" ON "public"."orders"("payment_status");

-- CreateIndex
CREATE INDEX "orders_created_at_idx" ON "public"."orders"("created_at");

-- CreateIndex
CREATE INDEX "orders_email_idx" ON "public"."orders"("email");

-- CreateIndex
CREATE INDEX "order_items_order_id_idx" ON "public"."order_items"("order_id");

-- CreateIndex
CREATE INDEX "order_items_product_id_idx" ON "public"."order_items"("product_id");

-- CreateIndex
CREATE UNIQUE INDEX "payments_transaction_id_key" ON "public"."payments"("transaction_id");

-- CreateIndex
CREATE UNIQUE INDEX "payments_reference_key" ON "public"."payments"("reference");

-- CreateIndex
CREATE INDEX "payments_order_id_idx" ON "public"."payments"("order_id");

-- CreateIndex
CREATE INDEX "payments_transaction_id_idx" ON "public"."payments"("transaction_id");

-- CreateIndex
CREATE INDEX "payments_reference_idx" ON "public"."payments"("reference");

-- CreateIndex
CREATE INDEX "payments_status_idx" ON "public"."payments"("status");

-- CreateIndex
CREATE INDEX "order_status_history_order_id_idx" ON "public"."order_status_history"("order_id");

-- CreateIndex
CREATE INDEX "order_status_history_created_at_idx" ON "public"."order_status_history"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "newsletter_email_key" ON "public"."newsletter"("email");

-- CreateIndex
CREATE INDEX "newsletter_email_idx" ON "public"."newsletter"("email");

-- CreateIndex
CREATE INDEX "newsletter_created_at_idx" ON "public"."newsletter"("created_at");

-- CreateIndex
CREATE INDEX "content_type_idx" ON "public"."content"("type");

-- CreateIndex
CREATE INDEX "content_status_idx" ON "public"."content"("status");

-- CreateIndex
CREATE INDEX "content_published_at_idx" ON "public"."content"("published_at");

-- CreateIndex
CREATE INDEX "content_expires_at_idx" ON "public"."content"("expires_at");

-- CreateIndex
CREATE INDEX "content_sort_order_idx" ON "public"."content"("sort_order");

-- CreateIndex
CREATE INDEX "analytics_date_idx" ON "public"."analytics"("date");

-- CreateIndex
CREATE UNIQUE INDEX "analytics_date_key" ON "public"."analytics"("date");

-- CreateIndex
CREATE UNIQUE INDEX "system_settings_key_key" ON "public"."system_settings"("key");

-- CreateIndex
CREATE INDEX "system_settings_key_idx" ON "public"."system_settings"("key");

-- AddForeignKey
ALTER TABLE "public"."user_permissions" ADD CONSTRAINT "user_permissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."addresses" ADD CONSTRAINT "addresses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."categories" ADD CONSTRAINT "categories_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "public"."categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."products" ADD CONSTRAINT "products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."product_images" ADD CONSTRAINT "product_images_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."product_variants" ADD CONSTRAINT "product_variants_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cart_items" ADD CONSTRAINT "cart_items_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cart_items" ADD CONSTRAINT "cart_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."wishlist_items" ADD CONSTRAINT "wishlist_items_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."wishlist_items" ADD CONSTRAINT "wishlist_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."orders" ADD CONSTRAINT "orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."orders" ADD CONSTRAINT "orders_shipping_address_id_fkey" FOREIGN KEY ("shipping_address_id") REFERENCES "public"."addresses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."order_items" ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."order_items" ADD CONSTRAINT "order_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payments" ADD CONSTRAINT "payments_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."order_status_history" ADD CONSTRAINT "order_status_history_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

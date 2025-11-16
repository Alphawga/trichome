-- AlterTable
ALTER TABLE "public"."products" ADD COLUMN     "brand_id" TEXT;

-- CreateTable
CREATE TABLE "public"."brands" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "logo" TEXT,
    "image" TEXT,
    "status" "public"."ProductStatus" NOT NULL DEFAULT 'ACTIVE',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "brands_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "brands_name_key" ON "public"."brands"("name");

-- CreateIndex
CREATE UNIQUE INDEX "brands_slug_key" ON "public"."brands"("slug");

-- CreateIndex
CREATE INDEX "brands_slug_idx" ON "public"."brands"("slug");

-- CreateIndex
CREATE INDEX "brands_status_idx" ON "public"."brands"("status");

-- CreateIndex
CREATE INDEX "brands_sort_order_idx" ON "public"."brands"("sort_order");

-- CreateIndex
CREATE INDEX "brands_name_idx" ON "public"."brands"("name");

-- CreateIndex
CREATE INDEX "products_brand_id_idx" ON "public"."products"("brand_id");

-- AddForeignKey
ALTER TABLE "public"."products" ADD CONSTRAINT "products_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE SET NULL ON UPDATE CASCADE;

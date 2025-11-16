/*
  Warnings:

  - You are about to drop the `brands` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."products" DROP CONSTRAINT "products_brand_id_fkey";

-- DropTable
DROP TABLE "public"."brands";

-- CreateTable
CREATE TABLE "public"."brand" (
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

    CONSTRAINT "brand_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "brand_name_key" ON "public"."brand"("name");

-- CreateIndex
CREATE UNIQUE INDEX "brand_slug_key" ON "public"."brand"("slug");

-- CreateIndex
CREATE INDEX "brand_name_idx" ON "public"."brand"("name");

-- CreateIndex
CREATE INDEX "brand_slug_idx" ON "public"."brand"("slug");

-- CreateIndex
CREATE INDEX "brand_sort_order_idx" ON "public"."brand"("sort_order");

-- CreateIndex
CREATE INDEX "brand_status_idx" ON "public"."brand"("status");

-- AddForeignKey
ALTER TABLE "public"."products" ADD CONSTRAINT "products_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "public"."brand"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateEnum
CREATE TYPE "public"."PromotionType" AS ENUM ('PERCENTAGE', 'FIXED_AMOUNT', 'FREE_SHIPPING', 'BUY_X_GET_Y');

-- CreateEnum
CREATE TYPE "public"."PromotionStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'EXPIRED', 'SCHEDULED');

-- CreateEnum
CREATE TYPE "public"."PromotionTarget" AS ENUM ('ALL', 'NEW_CUSTOMERS', 'VIP', 'SPECIFIC_GROUP');

-- CreateTable
CREATE TABLE "public"."promotions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "type" "public"."PromotionType" NOT NULL,
    "value" DECIMAL(12,2) NOT NULL,
    "min_order_value" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "max_discount" DECIMAL(12,2),
    "status" "public"."PromotionStatus" NOT NULL DEFAULT 'INACTIVE',
    "target_customers" "public"."PromotionTarget" NOT NULL DEFAULT 'ALL',
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "usage_limit" INTEGER NOT NULL DEFAULT 0,
    "usage_count" INTEGER NOT NULL DEFAULT 0,
    "usage_limit_per_user" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,

    CONSTRAINT "promotions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."promotion_usages" (
    "id" TEXT NOT NULL,
    "promotion_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "order_id" TEXT,
    "discount_amount" DECIMAL(12,2) NOT NULL,
    "used_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "promotion_usages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "promotions_code_key" ON "public"."promotions"("code");

-- CreateIndex
CREATE INDEX "promotions_code_idx" ON "public"."promotions"("code");

-- CreateIndex
CREATE INDEX "promotions_status_idx" ON "public"."promotions"("status");

-- CreateIndex
CREATE INDEX "promotions_start_date_idx" ON "public"."promotions"("start_date");

-- CreateIndex
CREATE INDEX "promotions_end_date_idx" ON "public"."promotions"("end_date");

-- CreateIndex
CREATE INDEX "promotion_usages_promotion_id_idx" ON "public"."promotion_usages"("promotion_id");

-- CreateIndex
CREATE INDEX "promotion_usages_user_id_idx" ON "public"."promotion_usages"("user_id");

-- CreateIndex
CREATE INDEX "promotion_usages_used_at_idx" ON "public"."promotion_usages"("used_at");

-- AddForeignKey
ALTER TABLE "public"."promotions" ADD CONSTRAINT "promotions_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."promotion_usages" ADD CONSTRAINT "promotion_usages_promotion_id_fkey" FOREIGN KEY ("promotion_id") REFERENCES "public"."promotions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."promotion_usages" ADD CONSTRAINT "promotion_usages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateEnum
CREATE TYPE "PromotionDisplayLocation" AS ENUM ('CHECKOUT', 'PRODUCT_TAG', 'BOTH');

-- AlterTable
ALTER TABLE "promotions" ADD COLUMN     "applicable_city" TEXT,
ADD COLUMN     "applicable_state" TEXT,
ADD COLUMN     "display_location" "PromotionDisplayLocation" NOT NULL DEFAULT 'CHECKOUT';

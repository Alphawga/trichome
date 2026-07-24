-- CreateEnum
CREATE TYPE "DeliveryMethod" AS ENUM ('DELIVERY', 'PICKUP');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "OrderStatus" ADD VALUE 'READY_FOR_PICKUP';
ALTER TYPE "OrderStatus" ADD VALUE 'PICKED_UP';

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "delivery_method" "DeliveryMethod" NOT NULL DEFAULT 'DELIVERY',
ADD COLUMN     "pickup_store_id" TEXT;

-- CreateTable
CREATE TABLE "stores" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "phone" TEXT,
    "opening_hours" TEXT,
    "map_url" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stores_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "stores_is_active_idx" ON "stores"("is_active");

-- CreateIndex
CREATE INDEX "stores_sort_order_idx" ON "stores"("sort_order");

-- CreateIndex
CREATE INDEX "orders_pickup_store_id_idx" ON "orders"("pickup_store_id");

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_pickup_store_id_fkey" FOREIGN KEY ("pickup_store_id") REFERENCES "stores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

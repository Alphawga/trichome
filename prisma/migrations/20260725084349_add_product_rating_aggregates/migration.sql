-- AlterTable
ALTER TABLE "products" ADD COLUMN     "average_rating" DECIMAL(3,2) NOT NULL DEFAULT 0,
ADD COLUMN     "review_count" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "products_average_rating_idx" ON "products"("average_rating");

-- Backfill aggregates from existing APPROVED reviews so every environment
-- running this migration ends up consistent without a manual script step.
UPDATE "products" p SET
  "average_rating" = COALESCE((
    SELECT AVG(r."rating") FROM "reviews" r
    WHERE r."product_id" = p."id" AND r."status" = 'APPROVED'
  ), 0),
  "review_count" = (
    SELECT COUNT(*) FROM "reviews" r
    WHERE r."product_id" = p."id" AND r."status" = 'APPROVED'
  );

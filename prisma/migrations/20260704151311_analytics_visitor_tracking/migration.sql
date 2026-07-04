/*
  Warnings:

  - You are about to drop the `analytics` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "analytics";

-- CreateTable
CREATE TABLE "visitor_daily_stats" (
    "id" TEXT NOT NULL,
    "visitor_id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "page_view_count" INTEGER NOT NULL DEFAULT 1,
    "first_seen_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_seen_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "visitor_daily_stats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "visitor_daily_stats_date_idx" ON "visitor_daily_stats"("date");

-- CreateIndex
CREATE UNIQUE INDEX "visitor_daily_stats_visitor_id_date_key" ON "visitor_daily_stats"("visitor_id", "date");

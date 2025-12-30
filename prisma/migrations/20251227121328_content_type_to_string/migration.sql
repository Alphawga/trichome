-- Safe migration: Convert content.type from enum to text while preserving data
-- Step 1: Add a temporary text column
ALTER TABLE "content" ADD COLUMN "type_new" TEXT;

-- Step 2: Copy existing enum values to the new text column (cast enum to text)
UPDATE "content" SET "type_new" = "type"::text;

-- Step 3: Drop the old enum column
ALTER TABLE "content" DROP COLUMN "type";

-- Step 4: Rename the new column to "type"
ALTER TABLE "content" RENAME COLUMN "type_new" TO "type";

-- Step 5: Make the column NOT NULL
ALTER TABLE "content" ALTER COLUMN "type" SET NOT NULL;

-- Step 6: Recreate the index
CREATE INDEX "content_type_idx" ON "content"("type");

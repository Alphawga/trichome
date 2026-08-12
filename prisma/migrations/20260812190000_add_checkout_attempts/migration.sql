CREATE TABLE "checkout_attempts" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "user_id" TEXT,
    "is_guest" BOOLEAN NOT NULL,
    "payload" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "order_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "checkout_attempts_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "checkout_attempts_reference_key" ON "checkout_attempts"("reference");
CREATE INDEX "checkout_attempts_status_created_at_idx" ON "checkout_attempts"("status", "created_at");
CREATE INDEX "checkout_attempts_user_id_idx" ON "checkout_attempts"("user_id");

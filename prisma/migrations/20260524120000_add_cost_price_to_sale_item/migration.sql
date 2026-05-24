-- Add "costPrice" column to "SaleItem" table
ALTER TABLE "SaleItem" ADD COLUMN "costPrice" DOUBLE PRECISION NOT NULL DEFAULT 0;
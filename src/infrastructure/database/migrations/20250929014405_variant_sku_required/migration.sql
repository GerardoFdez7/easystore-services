/*
  Warnings:

  - Made the column `sku` on table `Variant` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "product"."Variant" ALTER COLUMN "sku" SET NOT NULL;

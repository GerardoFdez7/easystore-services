/*
  Warnings:

  - You are about to drop the column `ocurredAt` on the `StockMovement` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "inventory"."StockMovement" DROP COLUMN "ocurredAt",
ADD COLUMN     "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

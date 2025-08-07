/*
  Warnings:

  - A unique constraint covering the columns `[warehouseId,variantId]` on the table `StockPerWarehouse` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "inventory"."StockPerWarehouse" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "StockPerWarehouse_warehouseId_variantId_key" ON "inventory"."StockPerWarehouse"("warehouseId", "variantId");

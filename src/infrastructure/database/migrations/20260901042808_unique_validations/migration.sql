/*
  Warnings:

  - A unique constraint covering the columns `[warehouseId,variantId,tenantId]` on the table `StockPerWarehouse` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id,tenantId]` on the table `Warehouse` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id,tenantId]` on the table `Variant` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "common"."Address" DROP CONSTRAINT "Address_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "inventory"."StockPerWarehouse" DROP CONSTRAINT "StockPerWarehouse_variantId_fkey";

-- DropForeignKey
ALTER TABLE "inventory"."StockPerWarehouse" DROP CONSTRAINT "StockPerWarehouse_warehouseId_fkey";

-- DropIndex
DROP INDEX "inventory"."StockPerWarehouse_warehouseId_variantId_key";

-- CreateIndex
CREATE UNIQUE INDEX "StockPerWarehouse_warehouseId_variantId_tenantId_key" ON "inventory"."StockPerWarehouse"("warehouseId", "variantId", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Warehouse_id_tenantId_key" ON "inventory"."Warehouse"("id", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Variant_id_tenantId_key" ON "product"."Variant"("id", "tenantId");

-- AddForeignKey
ALTER TABLE "inventory"."StockPerWarehouse" ADD CONSTRAINT "StockPerWarehouse_variantId_tenantId_fkey" FOREIGN KEY ("variantId", "tenantId") REFERENCES "product"."Variant"("id", "tenantId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory"."StockPerWarehouse" ADD CONSTRAINT "StockPerWarehouse_warehouseId_tenantId_fkey" FOREIGN KEY ("warehouseId", "tenantId") REFERENCES "inventory"."Warehouse"("id", "tenantId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "common"."Address" ADD CONSTRAINT "Address_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"."Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

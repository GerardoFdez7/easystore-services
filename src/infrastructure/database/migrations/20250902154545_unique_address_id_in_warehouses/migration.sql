/*
  Warnings:

  - A unique constraint covering the columns `[tenantId,addressId]` on the table `Warehouse` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Warehouse_tenantId_addressId_key" ON "inventory"."Warehouse"("tenantId", "addressId");

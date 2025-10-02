/*
  Warnings:

  - A unique constraint covering the columns `[tenantId,name]` on the table `Address` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[customerId,name]` on the table `Address` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "common"."Address_name_customerId_key";

-- DropIndex
DROP INDEX "common"."Address_name_tenantId_key";

-- CreateIndex
CREATE UNIQUE INDEX "Address_tenantId_name_key" ON "common"."Address"("tenantId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Address_customerId_name_key" ON "common"."Address"("customerId", "name");

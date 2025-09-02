/*
  Warnings:

  - A unique constraint covering the columns `[name,tenantId]` on the table `Address` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,customerId]` on the table `Address` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `Country` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[code]` on the table `Country` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `stateId` to the `Address` table without a default value. This is not possible if the table is not empty.
  - Made the column `postalCode` on table `Address` required. This step will fail if there are existing NULL values in that column.
  - Made the column `deliveryNum` on table `Address` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "common"."Address" ADD COLUMN     "deliveryInstructions" TEXT,
ADD COLUMN     "stateId" TEXT NOT NULL,
ALTER COLUMN "postalCode" SET NOT NULL,
ALTER COLUMN "deliveryNum" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Address_name_tenantId_key" ON "common"."Address"("name", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Address_name_customerId_key" ON "common"."Address"("name", "customerId");

-- CreateIndex
CREATE UNIQUE INDEX "Country_name_key" ON "geography"."Country"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Country_code_key" ON "geography"."Country"("code");

-- AddForeignKey
ALTER TABLE "common"."Address" ADD CONSTRAINT "Address_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "geography"."State"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

/*
  Warnings:

  - A unique constraint covering the columns `[businessName]` on the table `Tenant` will be added. If there are existing duplicate values, this will fail.
  - Made the column `businessName` on table `Tenant` required. This step will fail if there are existing NULL values in that column.
  - Made the column `domain` on table `Tenant` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "sales"."ProviderType" AS ENUM ('PAGADITO', 'VISANET', 'PAYPAL');

-- AlterTable
ALTER TABLE "tenant"."Tenant" ALTER COLUMN "businessName" SET NOT NULL,
ALTER COLUMN "domain" SET NOT NULL;

-- CreateTable
CREATE TABLE "sales"."PaymentProviderCredential" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "provider" "sales"."ProviderType" NOT NULL,
    "credentials" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentProviderCredential_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PaymentProviderCredential_tenantId_provider_key" ON "sales"."PaymentProviderCredential"("tenantId", "provider");

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_businessName_key" ON "tenant"."Tenant"("businessName");

-- AddForeignKey
ALTER TABLE "sales"."PaymentProviderCredential" ADD CONSTRAINT "PaymentProviderCredential_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

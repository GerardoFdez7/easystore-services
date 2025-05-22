/*
  Warnings:

  - You are about to drop the column `productId` on the `CustomerReviewProduct` table. All the data in the column will be lost.
  - You are about to drop the column `productId` on the `WishList` table. All the data in the column will be lost.
  - You are about to drop the column `productId` on the `InstallmentPayment` table. All the data in the column will be lost.
  - You are about to drop the column `currency` on the `Variant` table. All the data in the column will be lost.
  - You are about to drop the column `productId` on the `Warranty` table. All the data in the column will be lost.
  - You are about to drop the column `productId` on the `CartItem` table. All the data in the column will be lost.
  - You are about to drop the column `productId` on the `OrderDetail` table. All the data in the column will be lost.
  - You are about to drop the column `productId` on the `Return` table. All the data in the column will be lost.
  - You are about to drop the column `productId` on the `ShippingRule` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[variantId,position]` on the table `Media` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `variantId` to the `CustomerReviewProduct` table without a default value. This is not possible if the table is not empty.
  - Added the required column `variantId` to the `WishList` table without a default value. This is not possible if the table is not empty.
  - Added the required column `variantId` to the `InstallmentPayment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Variant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `variantId` to the `Warranty` table without a default value. This is not possible if the table is not empty.
  - Added the required column `variantId` to the `CartItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `currency` to the `Tenant` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "tenant"."Currency" AS ENUM ('AFN', 'ALL', 'EUR', 'DZD', 'AOA', 'XCD', 'SAR', 'ARS', 'AMD', 'AWG', 'AUD', 'AZN', 'BSD', 'BDT', 'BBD', 'BHD', 'BZD', 'XOF', 'BMD', 'BYR', 'MMK', 'BOB', 'BOV', 'USD', 'BAM', 'BWP', 'BRL', 'BND', 'BGN', 'BIF', 'BTN', 'INR', 'CVE', 'KHR', 'XAF', 'CAD', 'CLF', 'CLP', 'CNY', 'COP', 'COU', 'KMF', 'CDF', 'CRC', 'HRK', 'CUC', 'CUP', 'ANG', 'DKK', 'EGP', 'SVC', 'AED', 'ERN', 'ETB', 'FJD', 'PHP', 'XDR', 'GMD', 'GEL', 'GHS', 'GIP', 'GNF', 'GTQ', 'GYD', 'HTG', 'HNL', 'HKD', 'HUF', 'IDR', 'IQD', 'NOK', 'ISK', 'KYD', 'FKP', 'SBD', 'ILS', 'JMD', 'JPY', 'GBP', 'JOD', 'KZT', 'KES', 'KGS', 'KWD', 'LSL', 'ZAR', 'LRD', 'LYD', 'CHF', 'LBP', 'MOP', 'MKD', 'MGA', 'MYR', 'MWK', 'MVR', 'MAD', 'MUR', 'MRO', 'MNT', 'MZN', 'MXN', 'MXV', 'NAD', 'NPR', 'NIO', 'NGN', 'NZD', 'XPF', 'OMR', 'XUA', 'PKR', 'PAB', 'PGK', 'PYG', 'PEN', 'PLN', 'QAR', 'LAK', 'VEF', 'CZK', 'KRW', 'MDL', 'KPW', 'DOP', 'IRR', 'TZS', 'SYP', 'RWF', 'RON', 'RUB', 'WST', 'STD', 'RSD', 'SCR', 'SLL', 'SGD', 'XSU', 'SOS', 'LKR', 'SZL', 'SDG', 'SSP', 'SEK', 'CHE', 'CHW', 'SRD', 'THB', 'TWD', 'TJS', 'TOP', 'TTD', 'TMT', 'TRY', 'TND', 'UGX', 'UAH', 'UYI', 'UYU', 'UZS', 'VUV', 'VND', 'YER', 'DJF', 'ZMW', 'ZWL');

-- DropForeignKey
ALTER TABLE "customer"."CustomerReviewProduct" DROP CONSTRAINT "CustomerReviewProduct_productId_fkey";

-- DropForeignKey
ALTER TABLE "customer"."WishList" DROP CONSTRAINT "WishList_productId_fkey";

-- DropForeignKey
ALTER TABLE "product"."InstallmentPayment" DROP CONSTRAINT "InstallmentPayment_productId_fkey";

-- DropForeignKey
ALTER TABLE "product"."Warranty" DROP CONSTRAINT "Warranty_productId_fkey";

-- DropForeignKey
ALTER TABLE "sales"."CartItem" DROP CONSTRAINT "CartItem_productId_fkey";

-- DropForeignKey
ALTER TABLE "sales"."OrderDetail" DROP CONSTRAINT "OrderDetail_productId_fkey";

-- DropForeignKey
ALTER TABLE "sales"."Return" DROP CONSTRAINT "Return_productId_fkey";

-- DropForeignKey
ALTER TABLE "shipping"."ShippingRule" DROP CONSTRAINT "ShippingRule_productId_fkey";

-- DropIndex
DROP INDEX "product"."Product_name_key";

-- AlterTable
ALTER TABLE "customer"."CustomerReviewProduct" DROP COLUMN "productId",
ADD COLUMN     "variantId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "customer"."WishList" DROP COLUMN "productId",
ADD COLUMN     "variantId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "product"."InstallmentPayment" DROP COLUMN "productId",
ADD COLUMN     "variantId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "product"."Media" ADD COLUMN     "variantId" INTEGER,
ALTER COLUMN "productId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "product"."Variant" DROP COLUMN "currency",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "product"."Warranty" DROP COLUMN "productId",
ADD COLUMN     "variantId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "sales"."CartItem" DROP COLUMN "productId",
ADD COLUMN     "variantId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "sales"."OrderDetail" DROP COLUMN "productId",
ADD COLUMN     "variantId" INTEGER;

-- AlterTable
ALTER TABLE "sales"."Return" DROP COLUMN "productId",
ADD COLUMN     "variantId" INTEGER;

-- AlterTable
ALTER TABLE "shipping"."ShippingRule" DROP COLUMN "productId",
ADD COLUMN     "variantId" INTEGER;

-- AlterTable
ALTER TABLE "tenant"."Tenant" ADD COLUMN     "currency" "tenant"."Currency" NOT NULL;

-- DropEnum
DROP TYPE "product"."Currency";

-- CreateIndex
CREATE UNIQUE INDEX "Media_variantId_position_key" ON "product"."Media"("variantId", "position");

-- AddForeignKey
ALTER TABLE "shipping"."ShippingRule" ADD CONSTRAINT "ShippingRule_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "product"."Variant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product"."Media" ADD CONSTRAINT "Media_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "product"."Variant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product"."InstallmentPayment" ADD CONSTRAINT "InstallmentPayment_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "product"."Variant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product"."Warranty" ADD CONSTRAINT "Warranty_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "product"."Variant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales"."CartItem" ADD CONSTRAINT "CartItem_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "product"."Variant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales"."OrderDetail" ADD CONSTRAINT "OrderDetail_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "product"."Variant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales"."Return" ADD CONSTRAINT "Return_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "product"."Variant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer"."WishList" ADD CONSTRAINT "WishList_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "product"."Variant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer"."CustomerReviewProduct" ADD CONSTRAINT "CustomerReviewProduct_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "product"."Variant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

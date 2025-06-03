/*
  Warnings:

  - You are about to drop the column `metadata` on the `Product` table. All the data in the column will be lost.
  - Made the column `variantId` on table `OrderDetail` required. This step will fail if there are existing NULL values in that column.
  - Made the column `orderId` on table `Payment` required. This step will fail if there are existing NULL values in that column.
  - Made the column `subscriptionId` on table `Payment` required. This step will fail if there are existing NULL values in that column.
  - Made the column `variantId` on table `Return` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "product"."Media" DROP CONSTRAINT "Media_variantId_fkey";

-- DropForeignKey
ALTER TABLE "sales"."OrderDetail" DROP CONSTRAINT "OrderDetail_orderId_fkey";

-- DropForeignKey
ALTER TABLE "sales"."OrderDetail" DROP CONSTRAINT "OrderDetail_variantId_fkey";

-- DropForeignKey
ALTER TABLE "sales"."Payment" DROP CONSTRAINT "Payment_orderId_fkey";

-- DropForeignKey
ALTER TABLE "sales"."Payment" DROP CONSTRAINT "Payment_subscriptionId_fkey";

-- DropForeignKey
ALTER TABLE "sales"."Return" DROP CONSTRAINT "Return_orderId_fkey";

-- DropForeignKey
ALTER TABLE "sales"."Return" DROP CONSTRAINT "Return_variantId_fkey";

-- AlterTable
ALTER TABLE "product"."Product" DROP COLUMN "metadata",
ADD COLUMN     "isArchived" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "product"."Variant" ADD COLUMN     "isArchived" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "sales"."OrderDetail" ALTER COLUMN "variantId" SET NOT NULL;

-- AlterTable
ALTER TABLE "sales"."Payment" ALTER COLUMN "orderId" SET NOT NULL,
ALTER COLUMN "subscriptionId" SET NOT NULL;

-- AlterTable
ALTER TABLE "sales"."Return" ALTER COLUMN "variantId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "product"."Media" ADD CONSTRAINT "Media_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "product"."Variant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales"."OrderDetail" ADD CONSTRAINT "OrderDetail_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "sales"."Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales"."OrderDetail" ADD CONSTRAINT "OrderDetail_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "product"."Variant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales"."Return" ADD CONSTRAINT "Return_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "sales"."Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales"."Return" ADD CONSTRAINT "Return_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "product"."Variant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales"."Payment" ADD CONSTRAINT "Payment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "sales"."Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales"."Payment" ADD CONSTRAINT "Payment_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "tenant"."Subscription"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

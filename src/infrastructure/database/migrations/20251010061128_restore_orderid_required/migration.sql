/*
  Warnings:

  - Made the column `orderId` on table `Payment` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "sales"."Payment" ALTER COLUMN "orderId" SET NOT NULL;

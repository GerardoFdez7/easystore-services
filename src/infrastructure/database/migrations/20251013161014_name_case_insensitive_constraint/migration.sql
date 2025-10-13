-- Enable citext extension if not already enabled
CREATE EXTENSION IF NOT EXISTS citext;

-- AlterTable
ALTER TABLE "common"."Address" ALTER COLUMN "name" SET DATA TYPE CITEXT;

-- AlterTable
ALTER TABLE "customer"."Customer" ALTER COLUMN "name" SET DATA TYPE CITEXT;

-- AlterTable
ALTER TABLE "geography"."Country" ALTER COLUMN "name" SET DATA TYPE CITEXT;

-- AlterTable
ALTER TABLE "geography"."State" ALTER COLUMN "name" SET DATA TYPE CITEXT;

-- AlterTable
ALTER TABLE "inventory"."Warehouse" ALTER COLUMN "name" SET DATA TYPE CITEXT;

-- AlterTable
ALTER TABLE "pricing"."Promotion" ALTER COLUMN "name" SET DATA TYPE CITEXT;

-- AlterTable
ALTER TABLE "product"."Category" ALTER COLUMN "name" SET DATA TYPE CITEXT;

-- AlterTable
ALTER TABLE "product"."Product" ALTER COLUMN "name" SET DATA TYPE CITEXT;

-- AlterTable
ALTER TABLE "tenant"."Employee" ALTER COLUMN "name" SET DATA TYPE CITEXT;

-- AlterTable
ALTER TABLE "tenant"."Feature" ALTER COLUMN "name" SET DATA TYPE CITEXT;

-- AlterTable
ALTER TABLE "tenant"."Plan" ALTER COLUMN "name" SET DATA TYPE CITEXT;

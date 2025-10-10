-- AlterTable
ALTER TABLE "sales"."Payment" ALTER COLUMN "orderId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "sales"."PaymentProviderCredential" ALTER COLUMN "credentials" SET DATA TYPE TEXT;

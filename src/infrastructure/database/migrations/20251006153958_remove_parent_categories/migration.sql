-- DropForeignKey
ALTER TABLE "product"."Category" DROP CONSTRAINT "Category_parentId_fkey";

-- AddForeignKey
ALTER TABLE "product"."Category" ADD CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "product"."Category"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

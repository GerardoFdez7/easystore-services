-- Monetary contract (docs/MONETARY-CONTRACT.md):
--   * supported currencies are GTQ and USD (the Currency enum),
--   * money columns use scale 2,
--   * currency lives on the product (Product.currency) instead of the variant,
--   * every order records its currency,
--   * plus the foreign-key corrections that bring the database in line with the schema.

-- The dashboard view depends on money columns that change type below.
DROP VIEW IF EXISTS sales.dashboard_sales_view;

-- Fail loudly instead of rounding when existing money has more than 2 decimals.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM "product"."Variant" WHERE "price" <> round("price", 2))
    OR EXISTS (SELECT 1 FROM "sales"."Order" WHERE "totalAmount" <> round("totalAmount", 2))
    OR EXISTS (SELECT 1 FROM "sales"."OrderDetail" WHERE "unitPrice" <> round("unitPrice", 2) OR "subtotal" <> round("subtotal", 2))
    OR EXISTS (SELECT 1 FROM "sales"."Return" WHERE "refundAmount" <> round("refundAmount", 2))
    OR EXISTS (SELECT 1 FROM "sales"."Payment" WHERE "amount" <> round("amount", 2))
    OR EXISTS (SELECT 1 FROM "tenant"."Plan" WHERE "price" <> round("price", 2))
    OR EXISTS (SELECT 1 FROM "pricing"."Promotion" WHERE "actionValue" <> round("actionValue", 2))
  THEN
    RAISE EXCEPTION 'Monetary migration aborted: existing amounts have more than 2 decimals; fix them before migrating';
  END IF;
END $$;

-- Only GTQ and USD remain supported; abort instead of guessing a replacement.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM "tenant"."Store" WHERE "currency"::text NOT IN ('GTQ', 'USD'))
    OR EXISTS (SELECT 1 FROM "product"."Variant" WHERE "currency" NOT IN ('GTQ', 'USD'))
  THEN
    RAISE EXCEPTION 'Monetary migration aborted: stores or variants use a currency other than GTQ or USD';
  END IF;
END $$;

-- A product whose variants use different currencies cannot be migrated automatically.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM "product"."Variant"
    GROUP BY "productId", "storeId"
    HAVING COUNT(DISTINCT "currency") > 1
  ) THEN
    RAISE EXCEPTION 'Monetary migration aborted: some products have variants in different currencies; align them first';
  END IF;
END $$;

-- DropForeignKey (older databases carry these under the previous names; fresh ones may lack them)
ALTER TABLE "inventory"."StockMovement" DROP CONSTRAINT IF EXISTS "StockMovement_createdById_storeId_fkey";

-- DropForeignKey
ALTER TABLE "pricing"."Coupon" DROP CONSTRAINT IF EXISTS "Coupon_customerId_storeId_fkey";

-- DropForeignKey
ALTER TABLE "product"."Category" DROP CONSTRAINT IF EXISTS "Category_parentId_storeId_fkey";

-- DropForeignKey
ALTER TABLE "sales"."CartItem" DROP CONSTRAINT IF EXISTS "CartItem_promotionId_storeId_fkey";

-- DropForeignKey
ALTER TABLE "sales"."Order" DROP CONSTRAINT IF EXISTS "Order_addressId_fkey";

-- AlterEnum
BEGIN;
CREATE TYPE "tenant"."Currency_new" AS ENUM ('GTQ', 'USD');
ALTER TABLE "tenant"."Store" ALTER COLUMN "currency" TYPE "tenant"."Currency_new" USING ("currency"::text::"tenant"."Currency_new");
ALTER TYPE "tenant"."Currency" RENAME TO "Currency_old";
ALTER TYPE "tenant"."Currency_new" RENAME TO "Currency";
DROP TYPE "tenant"."Currency_old";
COMMIT;

-- Currency moves from the variant to the product. Products take their variants' shared
-- currency; products without variants take the store's.
ALTER TABLE "product"."Product" ADD COLUMN "currency" "tenant"."Currency";

UPDATE "product"."Product" p SET "currency" = v."currency"::"tenant"."Currency"
FROM (
  SELECT DISTINCT ON ("productId", "storeId") "productId", "storeId", "currency"
  FROM "product"."Variant"
) v
WHERE v."productId" = p."id" AND v."storeId" = p."storeId";

UPDATE "product"."Product" p SET "currency" = s."currency"
FROM "tenant"."Store" s
WHERE s."id" = p."storeId" AND p."currency" IS NULL;

ALTER TABLE "product"."Product" ALTER COLUMN "currency" SET NOT NULL;
ALTER TABLE "product"."Variant" DROP COLUMN "currency";

-- Orders snapshot their currency; existing orders take the store currency.
ALTER TABLE "sales"."Order" ADD COLUMN "currency" "tenant"."Currency";
UPDATE "sales"."Order" o SET "currency" = s."currency" FROM "tenant"."Store" s WHERE s."id" = o."storeId";
ALTER TABLE "sales"."Order" ALTER COLUMN "currency" SET NOT NULL;

-- Money columns use scale 2.
ALTER TABLE "product"."Variant" ALTER COLUMN "price" SET DATA TYPE DECIMAL(19,2);
ALTER TABLE "sales"."Order" ALTER COLUMN "totalAmount" SET DATA TYPE DECIMAL(19,2);
ALTER TABLE "sales"."OrderDetail" ALTER COLUMN "unitPrice" SET DATA TYPE DECIMAL(19,2),
ALTER COLUMN "subtotal" SET DATA TYPE DECIMAL(19,2);
ALTER TABLE "sales"."Return" ALTER COLUMN "refundAmount" SET DATA TYPE DECIMAL(19,2);
ALTER TABLE "sales"."Payment" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(19,2);
ALTER TABLE "tenant"."Plan" ALTER COLUMN "price" SET DATA TYPE DECIMAL(19,2);
ALTER TABLE "pricing"."Promotion" ALTER COLUMN "actionValue" SET DATA TYPE DECIMAL(19,2);

-- AddForeignKey
ALTER TABLE "inventory"."StockMovement" DROP CONSTRAINT IF EXISTS "StockMovement_createdById_fkey";
ALTER TABLE "inventory"."StockMovement" ADD CONSTRAINT "StockMovement_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "tenant"."Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product"."Category" DROP CONSTRAINT IF EXISTS "Category_parentId_fkey";
ALTER TABLE "product"."Category" ADD CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "product"."Category"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "pricing"."Coupon" DROP CONSTRAINT IF EXISTS "Coupon_customerId_fkey";
ALTER TABLE "pricing"."Coupon" ADD CONSTRAINT "Coupon_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customer"."Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales"."CartItem" DROP CONSTRAINT IF EXISTS "CartItem_promotionId_fkey";
ALTER TABLE "sales"."CartItem" ADD CONSTRAINT "CartItem_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "pricing"."Promotion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales"."Order" DROP CONSTRAINT IF EXISTS "Order_addressId_customerId_fkey";
ALTER TABLE "sales"."Order" ADD CONSTRAINT "Order_addressId_customerId_fkey" FOREIGN KEY ("addressId", "customerId") REFERENCES "common"."Address"("id", "customerId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Recreate the dashboard view unchanged.
CREATE OR REPLACE VIEW sales.dashboard_sales_view AS
SELECT 
    o.id as order_id,
    o."orderNumber" as order_number,
    o.status as order_status,
    o."totalAmount" as order_total,
    o."createdAt" as order_date,
    o."storeId" as store_id,
    
    c.id as customer_id,
    c.name as customer_name,
    
    a.city as shipping_city,
    a."addressLine1" as shipping_address,
    
    od.id as order_detail_id,
    od.qty as quantity_sold,
    od."unitPrice" as unit_price,
    od.subtotal as item_subtotal,
    od."productName" as product_name,
    
    v.id as variant_id,
    v.sku as variant_sku,
    v.price as variant_price,
    v."variantCover" as variant_cover,
    
    p.id as product_id,
    p.name as product_full_name,
    p.brand as product_brand,
    p.cover as product_cover,
    p."productType" as product_type,
    
    DATE(o."createdAt") as order_date_only,
    DATE_TRUNC('day', o."createdAt") as day_start,
    DATE_TRUNC('week', o."createdAt") as week_start,
    DATE_TRUNC('month', o."createdAt") as month_start,
    DATE_TRUNC('year', o."createdAt") as year_start,
    EXTRACT(DOW FROM o."createdAt") as day_of_week,
    EXTRACT(HOUR FROM o."createdAt") as hour_of_day
    
FROM 
    sales."Order" o
INNER JOIN 
    customer."Customer" c ON c.id = o."customerId"
INNER JOIN 
    "common"."Address" a ON a.id = o."addressId"
LEFT JOIN 
    sales."OrderDetail" od ON od."orderId" = o.id
LEFT JOIN 
    product."Variant" v ON v.id = od."variantId"
LEFT JOIN 
    product."Product" p ON p.id = v."productId";

COMMENT ON VIEW sales.dashboard_sales_view IS 
'View consolidating sales data for dashboard analytics, including orders, customers, products, and time dimensions.';

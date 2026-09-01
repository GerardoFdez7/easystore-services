-- Add tenant scope as nullable first so existing rows can be backfilled safely.
ALTER TABLE "tenant"."Employee" ADD COLUMN "tenantId" TEXT;
ALTER TABLE "tenant"."RoleFeatures" ADD COLUMN "tenantId" TEXT;
ALTER TABLE "inventory"."StockMovement" ADD COLUMN "tenantId" TEXT;
ALTER TABLE "inventory"."StockPerWarehouse" ADD COLUMN "tenantId" TEXT;
ALTER TABLE "product"."ProductCategories" ADD COLUMN "tenantId" TEXT;
ALTER TABLE "product"."Media" ADD COLUMN "tenantId" TEXT;
ALTER TABLE "pricing"."CouponUsage" ADD COLUMN "tenantId" TEXT;
ALTER TABLE "pricing"."CartPromotions" ADD COLUMN "tenantId" TEXT;
ALTER TABLE "pricing"."OrderPromotions" ADD COLUMN "tenantId" TEXT;
ALTER TABLE "sales"."Cart" ADD COLUMN "tenantId" TEXT;
ALTER TABLE "sales"."CartItem" ADD COLUMN "tenantId" TEXT;
ALTER TABLE "sales"."OrderDetail" ADD COLUMN "tenantId" TEXT;
ALTER TABLE "sales"."Return" ADD COLUMN "tenantId" TEXT;
ALTER TABLE "sales"."Payment" ADD COLUMN "tenantId" TEXT;
ALTER TABLE "customer"."WishList" ADD COLUMN "tenantId" TEXT;
ALTER TABLE "customer"."CustomerReviewProduct" ADD COLUMN "tenantId" TEXT;

-- Backfill each row from its authoritative tenant-owned parent.
UPDATE "tenant"."Employee" AS employee
SET "tenantId" = role."tenantId"
FROM "tenant"."EmployeeRole" AS role
WHERE employee."roleId" = role."id";

UPDATE "tenant"."RoleFeatures" AS role_feature
SET "tenantId" = role."tenantId"
FROM "tenant"."EmployeeRole" AS role
WHERE role_feature."roleId" = role."id";

UPDATE "inventory"."StockPerWarehouse" AS stock
SET "tenantId" = warehouse."tenantId"
FROM "inventory"."Warehouse" AS warehouse
WHERE stock."warehouseId" = warehouse."id";

UPDATE "inventory"."StockMovement" AS movement
SET "tenantId" = warehouse."tenantId"
FROM "inventory"."Warehouse" AS warehouse
WHERE movement."warehouseId" = warehouse."id";

UPDATE "product"."ProductCategories" AS product_category
SET "tenantId" = product."tenantId"
FROM "product"."Product" AS product
WHERE product_category."productId" = product."id";

UPDATE "product"."Media" AS media
SET "tenantId" = COALESCE(
  (SELECT product."tenantId" FROM "product"."Product" AS product WHERE product."id" = media."productId"),
  (SELECT variant."tenantId" FROM "product"."Variant" AS variant WHERE variant."id" = media."variantId")
);

UPDATE "pricing"."CouponUsage" AS usage
SET "tenantId" = coupon."tenantId"
FROM "pricing"."Coupon" AS coupon
WHERE usage."couponId" = coupon."id";

UPDATE "sales"."Cart" AS cart
SET "tenantId" = customer."tenantId"
FROM "customer"."Customer" AS customer
WHERE cart."customerId" = customer."id";

UPDATE "pricing"."CartPromotions" AS cart_promotion
SET "tenantId" = cart."tenantId"
FROM "sales"."Cart" AS cart
WHERE cart_promotion."cartId" = cart."id";

UPDATE "pricing"."OrderPromotions" AS order_promotion
SET "tenantId" = orders."tenantId"
FROM "sales"."Order" AS orders
WHERE order_promotion."orderId" = orders."id";

UPDATE "sales"."CartItem" AS item
SET "tenantId" = cart."tenantId"
FROM "sales"."Cart" AS cart
WHERE item."cartId" = cart."id";

UPDATE "sales"."OrderDetail" AS detail
SET "tenantId" = orders."tenantId"
FROM "sales"."Order" AS orders
WHERE detail."orderId" = orders."id";

UPDATE "sales"."Return" AS return_row
SET "tenantId" = orders."tenantId"
FROM "sales"."Order" AS orders
WHERE return_row."orderId" = orders."id";

UPDATE "sales"."PaymentMethod" AS payment_method
SET "tenantId" = customer."tenantId"
FROM "customer"."Customer" AS customer
WHERE payment_method."customerId" = customer."id"
  AND payment_method."tenantId" IS NULL;

UPDATE "sales"."Payment" AS payment
SET "tenantId" = orders."tenantId"
FROM "sales"."Order" AS orders
WHERE payment."orderId" = orders."id";

UPDATE "customer"."WishList" AS wish_list
SET "tenantId" = customer."tenantId"
FROM "customer"."Customer" AS customer
WHERE wish_list."customerId" = customer."id";

UPDATE "customer"."CustomerReviewProduct" AS review
SET "tenantId" = customer."tenantId"
FROM "customer"."Customer" AS customer
WHERE review."customerId" = customer."id";

UPDATE "common"."PhoneNumber" AS phone
SET "tenantId" = customer."tenantId"
FROM "customer"."Customer" AS customer
WHERE phone."customerId" = customer."id"
  AND phone."tenantId" IS NULL;

UPDATE "common"."Address" AS address
SET "tenantId" = customer."tenantId"
FROM "customer"."Customer" AS customer
WHERE address."customerId" = customer."id"
  AND address."tenantId" IS NULL;

-- Reject orphaned rows rather than assigning them to an arbitrary tenant.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM "tenant"."Employee" WHERE "tenantId" IS NULL
    UNION ALL SELECT 1 FROM "tenant"."RoleFeatures" WHERE "tenantId" IS NULL
    UNION ALL SELECT 1 FROM "inventory"."StockMovement" WHERE "tenantId" IS NULL
    UNION ALL SELECT 1 FROM "inventory"."StockPerWarehouse" WHERE "tenantId" IS NULL
    UNION ALL SELECT 1 FROM "product"."ProductCategories" WHERE "tenantId" IS NULL
    UNION ALL SELECT 1 FROM "product"."Media" WHERE "tenantId" IS NULL
    UNION ALL SELECT 1 FROM "pricing"."CouponUsage" WHERE "tenantId" IS NULL
    UNION ALL SELECT 1 FROM "pricing"."CartPromotions" WHERE "tenantId" IS NULL
    UNION ALL SELECT 1 FROM "pricing"."OrderPromotions" WHERE "tenantId" IS NULL
    UNION ALL SELECT 1 FROM "sales"."Cart" WHERE "tenantId" IS NULL
    UNION ALL SELECT 1 FROM "sales"."CartItem" WHERE "tenantId" IS NULL
    UNION ALL SELECT 1 FROM "sales"."OrderDetail" WHERE "tenantId" IS NULL
    UNION ALL SELECT 1 FROM "sales"."Return" WHERE "tenantId" IS NULL
    UNION ALL SELECT 1 FROM "sales"."Payment" WHERE "tenantId" IS NULL
    UNION ALL SELECT 1 FROM "sales"."PaymentMethod" WHERE "tenantId" IS NULL
    UNION ALL SELECT 1 FROM "customer"."WishList" WHERE "tenantId" IS NULL
    UNION ALL SELECT 1 FROM "customer"."CustomerReviewProduct" WHERE "tenantId" IS NULL
    UNION ALL SELECT 1 FROM "common"."PhoneNumber" WHERE "tenantId" IS NULL
    UNION ALL SELECT 1 FROM "common"."Address" WHERE "tenantId" IS NULL
  ) THEN
    RAISE EXCEPTION 'Tenant backfill failed: tenant-owned rows exist without a resolvable tenant';
  END IF;
END $$;

-- Reject cross-tenant links found while deriving the new tenant keys.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM "inventory"."StockPerWarehouse" AS stock
    JOIN "product"."Variant" AS variant ON variant."id" = stock."variantId"
    WHERE stock."tenantId" <> variant."tenantId"
    UNION ALL
    SELECT 1
    FROM "inventory"."StockMovement" AS movement
    JOIN "inventory"."StockPerWarehouse" AS stock ON stock."id" = movement."stockPerWarehouseId"
    WHERE movement."tenantId" <> stock."tenantId"
    UNION ALL
    SELECT 1
    FROM "inventory"."StockMovement" AS movement
    JOIN "tenant"."Employee" AS employee ON employee."id" = movement."createdById"
    WHERE movement."tenantId" <> employee."tenantId"
    UNION ALL
    SELECT 1
    FROM "product"."ProductCategories" AS product_category
    JOIN "product"."Category" AS category ON category."id" = product_category."categoryId"
    WHERE product_category."tenantId" <> category."tenantId"
    UNION ALL
    SELECT 1
    FROM "product"."Media" AS media
    JOIN "product"."Product" AS product ON product."id" = media."productId"
    JOIN "product"."Variant" AS variant ON variant."id" = media."variantId"
    WHERE product."tenantId" <> variant."tenantId"
    UNION ALL
    SELECT 1
    FROM "pricing"."CouponUsage" AS usage
    JOIN "sales"."Order" AS orders ON orders."id" = usage."orderId"
    WHERE usage."tenantId" <> orders."tenantId"
    UNION ALL
    SELECT 1
    FROM "pricing"."CartPromotions" AS cart_promotion
    JOIN "pricing"."Promotion" AS promotion ON promotion."id" = cart_promotion."promotionId"
    WHERE cart_promotion."tenantId" <> promotion."tenantId"
    UNION ALL
    SELECT 1
    FROM "pricing"."OrderPromotions" AS order_promotion
    JOIN "pricing"."Promotion" AS promotion ON promotion."id" = order_promotion."promotionId"
    WHERE order_promotion."tenantId" <> promotion."tenantId"
    UNION ALL
    SELECT 1
    FROM "sales"."CartItem" AS item
    JOIN "product"."Variant" AS variant ON variant."id" = item."variantId"
    WHERE item."tenantId" <> variant."tenantId"
    UNION ALL
    SELECT 1
    FROM "sales"."CartItem" AS item
    JOIN "pricing"."Promotion" AS promotion ON promotion."id" = item."promotionId"
    WHERE item."tenantId" <> promotion."tenantId"
    UNION ALL
    SELECT 1
    FROM "sales"."OrderDetail" AS detail
    JOIN "product"."Variant" AS variant ON variant."id" = detail."variantId"
    WHERE detail."tenantId" <> variant."tenantId"
    UNION ALL
    SELECT 1
    FROM "sales"."Return" AS return_row
    JOIN "product"."Variant" AS variant ON variant."id" = return_row."variantId"
    WHERE return_row."tenantId" <> variant."tenantId"
    UNION ALL
    SELECT 1
    FROM "sales"."Payment" AS payment
    JOIN "sales"."PaymentMethod" AS payment_method ON payment_method."id" = payment."paymentMethodId"
    WHERE payment."tenantId" <> payment_method."tenantId"
    UNION ALL
    SELECT 1
    FROM "sales"."Payment" AS payment
    JOIN "tenant"."Subscription" AS subscription ON subscription."id" = payment."subscriptionId"
    WHERE payment."tenantId" <> subscription."tenantId"
    UNION ALL
    SELECT 1
    FROM "sales"."PaymentMethod" AS payment_method
    JOIN "customer"."Customer" AS customer ON customer."id" = payment_method."customerId"
    WHERE payment_method."tenantId" <> customer."tenantId"
    UNION ALL
    SELECT 1
    FROM "customer"."WishList" AS wish_list
    JOIN "product"."Variant" AS variant ON variant."id" = wish_list."variantId"
    WHERE wish_list."tenantId" <> variant."tenantId"
    UNION ALL
    SELECT 1
    FROM "customer"."CustomerReviewProduct" AS review
    JOIN "product"."Variant" AS variant ON variant."id" = review."variantId"
    WHERE review."tenantId" <> variant."tenantId"
    UNION ALL
    SELECT 1
    FROM "common"."PhoneNumber" AS phone
    JOIN "customer"."Customer" AS customer ON customer."id" = phone."customerId"
    WHERE phone."tenantId" <> customer."tenantId"
    UNION ALL
    SELECT 1
    FROM "common"."Address" AS address
    JOIN "customer"."Customer" AS customer ON customer."id" = address."customerId"
    WHERE address."tenantId" <> customer."tenantId"
  ) THEN
    RAISE EXCEPTION 'Tenant backfill failed: cross-tenant relationships exist';
  END IF;
END $$;

-- Tenant scope is mandatory for every tenant-owned row.
ALTER TABLE "tenant"."Employee" ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "tenant"."RoleFeatures" ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "inventory"."StockMovement" ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "inventory"."StockPerWarehouse" ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "product"."ProductCategories" ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "product"."Media" ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "pricing"."CouponUsage" ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "pricing"."CartPromotions" ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "pricing"."OrderPromotions" ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "sales"."Cart" ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "sales"."CartItem" ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "sales"."OrderDetail" ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "sales"."Return" ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "sales"."Payment" ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "sales"."PaymentMethod" ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "customer"."WishList" ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "customer"."CustomerReviewProduct" ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "common"."PhoneNumber" ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "common"."Address" ALTER COLUMN "tenantId" SET NOT NULL;

-- Index every new tenant foreign key for scoped queries and tenant lifecycle operations.
CREATE INDEX "Employee_tenantId_idx" ON "tenant"."Employee"("tenantId");
CREATE INDEX "RoleFeatures_tenantId_idx" ON "tenant"."RoleFeatures"("tenantId");
CREATE INDEX "StockMovement_tenantId_idx" ON "inventory"."StockMovement"("tenantId");
CREATE INDEX "StockPerWarehouse_tenantId_idx" ON "inventory"."StockPerWarehouse"("tenantId");
CREATE INDEX "ProductCategories_tenantId_idx" ON "product"."ProductCategories"("tenantId");
CREATE INDEX "Media_tenantId_idx" ON "product"."Media"("tenantId");
CREATE INDEX "CouponUsage_tenantId_idx" ON "pricing"."CouponUsage"("tenantId");
CREATE INDEX "CartPromotions_tenantId_idx" ON "pricing"."CartPromotions"("tenantId");
CREATE INDEX "OrderPromotions_tenantId_idx" ON "pricing"."OrderPromotions"("tenantId");
CREATE INDEX "Cart_tenantId_idx" ON "sales"."Cart"("tenantId");
CREATE INDEX "CartItem_tenantId_idx" ON "sales"."CartItem"("tenantId");
CREATE INDEX "OrderDetail_tenantId_idx" ON "sales"."OrderDetail"("tenantId");
CREATE INDEX "Return_tenantId_idx" ON "sales"."Return"("tenantId");
CREATE INDEX "Payment_tenantId_idx" ON "sales"."Payment"("tenantId");
CREATE INDEX "WishList_tenantId_idx" ON "customer"."WishList"("tenantId");
CREATE INDEX "CustomerReviewProduct_tenantId_idx" ON "customer"."CustomerReviewProduct"("tenantId");

-- Foreign keys make tenant attribution referentially valid.
ALTER TABLE "tenant"."Employee" ADD CONSTRAINT "Employee_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "tenant"."RoleFeatures" ADD CONSTRAINT "RoleFeatures_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "inventory"."StockMovement" ADD CONSTRAINT "StockMovement_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "inventory"."StockPerWarehouse" ADD CONSTRAINT "StockPerWarehouse_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "product"."ProductCategories" ADD CONSTRAINT "ProductCategories_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "product"."Media" ADD CONSTRAINT "Media_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "pricing"."CouponUsage" ADD CONSTRAINT "CouponUsage_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"."Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "pricing"."CartPromotions" ADD CONSTRAINT "CartPromotions_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "pricing"."OrderPromotions" ADD CONSTRAINT "OrderPromotions_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"."Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "sales"."Cart" ADD CONSTRAINT "Cart_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "sales"."CartItem" ADD CONSTRAINT "CartItem_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "sales"."OrderDetail" ADD CONSTRAINT "OrderDetail_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"."Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "sales"."Return" ADD CONSTRAINT "Return_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"."Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "sales"."Payment" ADD CONSTRAINT "Payment_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"."Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "customer"."WishList" ADD CONSTRAINT "WishList_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "customer"."CustomerReviewProduct" ADD CONSTRAINT "CustomerReviewProduct_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

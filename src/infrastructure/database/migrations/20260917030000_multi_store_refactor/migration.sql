-- DropView (recreated at the end referencing storeId)
DROP VIEW IF EXISTS sales.dashboard_sales_view;

-- DropForeignKey
ALTER TABLE "customer"."Customer" DROP CONSTRAINT "Customer_defaultBillingAddressId_fkey";

-- DropForeignKey
ALTER TABLE "customer"."Customer" DROP CONSTRAINT "Customer_defaultPhoneNumberId_fkey";

-- DropForeignKey
ALTER TABLE "customer"."Customer" DROP CONSTRAINT "Customer_defaultShippingAddressId_fkey";

-- DropForeignKey
ALTER TABLE "customer"."Customer" DROP CONSTRAINT "Customer_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "customer"."CustomerReviewProduct" DROP CONSTRAINT "CustomerReviewProduct_customerId_fkey";

-- DropForeignKey
ALTER TABLE "customer"."CustomerReviewProduct" DROP CONSTRAINT "CustomerReviewProduct_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "customer"."CustomerReviewProduct" DROP CONSTRAINT "CustomerReviewProduct_variantId_fkey";

-- DropForeignKey
ALTER TABLE "customer"."WishList" DROP CONSTRAINT "WishList_customerId_fkey";

-- DropForeignKey
ALTER TABLE "customer"."WishList" DROP CONSTRAINT "WishList_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "customer"."WishList" DROP CONSTRAINT "WishList_variantId_fkey";

-- DropForeignKey
ALTER TABLE "inventory"."StockMovement" DROP CONSTRAINT "StockMovement_createdById_fkey";

-- DropForeignKey
ALTER TABLE "inventory"."StockMovement" DROP CONSTRAINT "StockMovement_stockPerWarehouseId_fkey";

-- DropForeignKey
ALTER TABLE "inventory"."StockMovement" DROP CONSTRAINT "StockMovement_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "inventory"."StockMovement" DROP CONSTRAINT "StockMovement_warehouseId_fkey";

-- DropForeignKey
ALTER TABLE "inventory"."StockPerWarehouse" DROP CONSTRAINT "StockPerWarehouse_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "inventory"."StockPerWarehouse" DROP CONSTRAINT "StockPerWarehouse_variantId_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "inventory"."StockPerWarehouse" DROP CONSTRAINT "StockPerWarehouse_warehouseId_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "inventory"."Warehouse" DROP CONSTRAINT "Warehouse_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "pricing"."CartPromotions" DROP CONSTRAINT "CartPromotions_cartId_fkey";

-- DropForeignKey
ALTER TABLE "pricing"."CartPromotions" DROP CONSTRAINT "CartPromotions_promotionId_fkey";

-- DropForeignKey
ALTER TABLE "pricing"."CartPromotions" DROP CONSTRAINT "CartPromotions_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "pricing"."Coupon" DROP CONSTRAINT "Coupon_customerId_fkey";

-- DropForeignKey
ALTER TABLE "pricing"."Coupon" DROP CONSTRAINT "Coupon_promotionId_fkey";

-- DropForeignKey
ALTER TABLE "pricing"."Coupon" DROP CONSTRAINT "Coupon_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "pricing"."CouponUsage" DROP CONSTRAINT "CouponUsage_couponId_fkey";

-- DropForeignKey
ALTER TABLE "pricing"."CouponUsage" DROP CONSTRAINT "CouponUsage_orderId_fkey";

-- DropForeignKey
ALTER TABLE "pricing"."CouponUsage" DROP CONSTRAINT "CouponUsage_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "pricing"."OrderPromotions" DROP CONSTRAINT "OrderPromotions_orderId_fkey";

-- DropForeignKey
ALTER TABLE "pricing"."OrderPromotions" DROP CONSTRAINT "OrderPromotions_promotionId_fkey";

-- DropForeignKey
ALTER TABLE "pricing"."OrderPromotions" DROP CONSTRAINT "OrderPromotions_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "pricing"."Promotion" DROP CONSTRAINT "Promotion_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "product"."Category" DROP CONSTRAINT "Category_parentId_fkey";

-- DropForeignKey
ALTER TABLE "product"."Category" DROP CONSTRAINT "Category_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "product"."Media" DROP CONSTRAINT "Media_productId_fkey";

-- DropForeignKey
ALTER TABLE "product"."Media" DROP CONSTRAINT "Media_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "product"."Media" DROP CONSTRAINT "Media_variantId_fkey";

-- DropForeignKey
ALTER TABLE "product"."Product" DROP CONSTRAINT "Product_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "product"."ProductCategories" DROP CONSTRAINT "ProductCategories_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "product"."ProductCategories" DROP CONSTRAINT "ProductCategories_productId_fkey";

-- DropForeignKey
ALTER TABLE "product"."ProductCategories" DROP CONSTRAINT "ProductCategories_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "product"."TaxRate" DROP CONSTRAINT "TaxRate_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "product"."TaxRate" DROP CONSTRAINT "TaxRate_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "product"."Variant" DROP CONSTRAINT "Variant_productId_fkey";

-- DropForeignKey
ALTER TABLE "product"."Variant" DROP CONSTRAINT "Variant_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "sales"."Cart" DROP CONSTRAINT "Cart_customerId_fkey";

-- DropForeignKey
ALTER TABLE "sales"."Cart" DROP CONSTRAINT "Cart_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "sales"."CartItem" DROP CONSTRAINT "CartItem_cartId_fkey";

-- DropForeignKey
ALTER TABLE "sales"."CartItem" DROP CONSTRAINT "CartItem_promotionId_fkey";

-- DropForeignKey
ALTER TABLE "sales"."CartItem" DROP CONSTRAINT "CartItem_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "sales"."CartItem" DROP CONSTRAINT "CartItem_variantId_fkey";

-- DropForeignKey
ALTER TABLE "sales"."Order" DROP CONSTRAINT "Order_cartId_fkey";

-- DropForeignKey
ALTER TABLE "sales"."Order" DROP CONSTRAINT "Order_customerId_fkey";

-- DropForeignKey
ALTER TABLE "sales"."Order" DROP CONSTRAINT "Order_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "sales"."OrderDetail" DROP CONSTRAINT "OrderDetail_orderId_fkey";

-- DropForeignKey
ALTER TABLE "sales"."OrderDetail" DROP CONSTRAINT "OrderDetail_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "sales"."OrderDetail" DROP CONSTRAINT "OrderDetail_variantId_fkey";

-- DropForeignKey
ALTER TABLE "sales"."Payment" DROP CONSTRAINT "Payment_orderId_fkey";

-- DropForeignKey
ALTER TABLE "sales"."Payment" DROP CONSTRAINT "Payment_paymentMethodId_fkey";

-- DropForeignKey
ALTER TABLE "sales"."Payment" DROP CONSTRAINT "Payment_subscriptionId_fkey";

-- DropForeignKey
ALTER TABLE "sales"."Payment" DROP CONSTRAINT "Payment_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "sales"."PaymentMethod" DROP CONSTRAINT "PaymentMethod_customerId_fkey";

-- DropForeignKey
ALTER TABLE "sales"."PaymentMethod" DROP CONSTRAINT "PaymentMethod_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "sales"."Return" DROP CONSTRAINT "Return_orderId_fkey";

-- DropForeignKey
ALTER TABLE "sales"."Return" DROP CONSTRAINT "Return_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "sales"."Return" DROP CONSTRAINT "Return_variantId_fkey";

-- DropForeignKey
ALTER TABLE "shipping"."ShipmentRate" DROP CONSTRAINT "ShipmentRate_shippingRuleId_fkey";

-- DropForeignKey
ALTER TABLE "shipping"."ShipmentRate" DROP CONSTRAINT "ShipmentRate_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "shipping"."ShippingRule" DROP CONSTRAINT "ShippingRule_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "shipping"."ShippingRule" DROP CONSTRAINT "ShippingRule_variantId_fkey";

-- DropForeignKey
ALTER TABLE "tenant"."Employee" DROP CONSTRAINT "Employee_roleId_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "tenant"."Employee" DROP CONSTRAINT "Employee_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "tenant"."EmployeeRole" DROP CONSTRAINT "EmployeeRole_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "tenant"."RoleFeatures" DROP CONSTRAINT "RoleFeatures_roleId_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "tenant"."RoleFeatures" DROP CONSTRAINT "RoleFeatures_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "tenant"."Subscription" DROP CONSTRAINT "Subscription_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "tenant"."Tenant" DROP CONSTRAINT "Tenant_defaultBillingAddressId_fkey";

-- DropForeignKey
ALTER TABLE "tenant"."Tenant" DROP CONSTRAINT "Tenant_defaultPhoneNumberId_fkey";

-- DropForeignKey
ALTER TABLE "tenant"."Tenant" DROP CONSTRAINT "Tenant_defaultShippingAddressId_fkey";

-- DropIndex
DROP INDEX "customer"."Customer_tenantId_idx";

-- DropIndex
DROP INDEX "customer"."CustomerReviewProduct_tenantId_idx";

-- DropIndex
DROP INDEX "customer"."WishList_tenantId_idx";

-- DropIndex
DROP INDEX "inventory"."StockMovement_tenantId_idx";

-- DropIndex
DROP INDEX "inventory"."StockPerWarehouse_tenantId_idx";

-- DropIndex
DROP INDEX "inventory"."StockPerWarehouse_warehouseId_variantId_tenantId_key";

-- DropIndex
DROP INDEX "inventory"."Warehouse_id_tenantId_key";

-- DropIndex
DROP INDEX "inventory"."Warehouse_tenantId_addressId_key";

-- DropIndex
DROP INDEX "inventory"."Warehouse_tenantId_name_key";

-- DropIndex
DROP INDEX "pricing"."CartPromotions_tenantId_idx";

-- DropIndex
DROP INDEX "pricing"."Coupon_tenantId_code_key";

-- DropIndex
DROP INDEX "pricing"."CouponUsage_tenantId_idx";

-- DropIndex
DROP INDEX "pricing"."OrderPromotions_tenantId_idx";

-- DropIndex
DROP INDEX "pricing"."Promotion_tenantId_name_key";

-- DropIndex
DROP INDEX "pricing"."Promotion_tenantId_priority_key";

-- DropIndex
DROP INDEX "product"."Category_tenantId_name_key";

-- DropIndex
DROP INDEX "product"."Media_tenantId_idx";

-- DropIndex
DROP INDEX "product"."Product_tenantId_name_key";

-- DropIndex
DROP INDEX "product"."ProductCategories_tenantId_idx";

-- DropIndex
DROP INDEX "product"."TaxRate_tenantId_countryId_stateId_categoryId_key";

-- DropIndex
DROP INDEX "product"."Variant_id_tenantId_key";

-- DropIndex
DROP INDEX "product"."Variant_tenantId_barcode_key";

-- DropIndex
DROP INDEX "product"."Variant_tenantId_sku_key";

-- DropIndex
DROP INDEX "sales"."Cart_tenantId_idx";

-- DropIndex
DROP INDEX "sales"."CartItem_tenantId_idx";

-- DropIndex
DROP INDEX "sales"."Order_tenantId_orderNumber_key";

-- DropIndex
DROP INDEX "sales"."OrderDetail_tenantId_idx";

-- DropIndex
DROP INDEX "sales"."Payment_tenantId_idx";

-- DropIndex
DROP INDEX "sales"."PaymentMethod_tenantId_idx";

-- DropIndex
DROP INDEX "sales"."Return_tenantId_idx";

-- DropIndex
DROP INDEX "shipping"."ShipmentRate_tenantId_shippingRuleId_countryId_stateId_key";

-- DropIndex
DROP INDEX "shipping"."ShipmentRate_tenantId_shippingRuleId_idx";

-- DropIndex
DROP INDEX "shipping"."ShippingRule_tenantId_priority_key";

-- DropIndex
DROP INDEX "shipping"."ShippingRule_tenantId_slug_key";

-- DropIndex
DROP INDEX "shipping"."ShippingRule_tenantId_type_idx";

-- DropIndex
DROP INDEX "tenant"."Employee_tenantId_idx";

-- DropIndex
DROP INDEX "tenant"."EmployeeRole_id_tenantId_key";

-- DropIndex
DROP INDEX "tenant"."EmployeeRole_tenantId_idx";

-- DropIndex
DROP INDEX "tenant"."EmployeeRole_tenantId_role_key";

-- DropIndex
DROP INDEX "tenant"."RoleFeatures_tenantId_idx";

-- DropIndex
DROP INDEX "tenant"."Subscription_tenantId_key";

-- DropIndex
DROP INDEX "tenant"."Tenant_domain_key";

-- AlterTable
ALTER TABLE "customer"."Customer" DROP COLUMN "tenantId",
ADD COLUMN     "storeId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "customer"."CustomerReviewProduct" DROP COLUMN "tenantId",
ADD COLUMN     "storeId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "customer"."WishList" DROP COLUMN "tenantId",
ADD COLUMN     "storeId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "inventory"."StockMovement" DROP COLUMN "tenantId",
ADD COLUMN     "storeId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "inventory"."StockPerWarehouse" DROP COLUMN "tenantId",
ADD COLUMN     "storeId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "inventory"."Warehouse" DROP COLUMN "tenantId",
ADD COLUMN     "storeId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "pricing"."CartPromotions" DROP COLUMN "tenantId",
ADD COLUMN     "storeId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "pricing"."Coupon" DROP COLUMN "tenantId",
ADD COLUMN     "storeId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "pricing"."CouponUsage" DROP COLUMN "tenantId",
ADD COLUMN     "storeId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "pricing"."OrderPromotions" DROP COLUMN "tenantId",
ADD COLUMN     "storeId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "pricing"."Promotion" DROP COLUMN "tenantId",
ADD COLUMN     "storeId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "product"."Category" DROP COLUMN "tenantId",
ADD COLUMN     "storeId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "product"."Media" DROP COLUMN "tenantId",
ADD COLUMN     "storeId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "product"."Product" DROP COLUMN "tenantId",
ADD COLUMN     "storeId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "product"."ProductCategories" DROP COLUMN "tenantId",
ADD COLUMN     "storeId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "product"."TaxRate" DROP COLUMN "tenantId",
ADD COLUMN     "storeId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "product"."Variant" DROP COLUMN "tenantId",
ADD COLUMN     "storeId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "sales"."Cart" DROP COLUMN "tenantId",
ADD COLUMN     "storeId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "sales"."CartItem" DROP COLUMN "tenantId",
ADD COLUMN     "storeId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "sales"."Order" DROP COLUMN "tenantId",
ADD COLUMN     "storeId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "sales"."OrderDetail" DROP COLUMN "tenantId",
ADD COLUMN     "storeId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "sales"."Payment" DROP COLUMN "tenantId",
ADD COLUMN     "storeId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "sales"."PaymentMethod" DROP COLUMN "tenantId",
ADD COLUMN     "storeId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "sales"."Return" DROP COLUMN "tenantId",
ADD COLUMN     "storeId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "shipping"."ShipmentRate" DROP COLUMN "tenantId",
ADD COLUMN     "storeId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "shipping"."ShippingRule" DROP COLUMN "tenantId",
ADD COLUMN     "storeId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "tenant"."Employee" DROP COLUMN "tenantId",
ADD COLUMN     "storeId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "tenant"."EmployeeRole" DROP COLUMN "tenantId",
ADD COLUMN     "storeId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "tenant"."RoleFeatures" DROP COLUMN "tenantId",
ADD COLUMN     "storeId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "tenant"."Subscription" DROP COLUMN "tenantId",
ADD COLUMN     "storeId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "tenant"."Tenant" DROP COLUMN "businessName",
DROP COLUMN "currency",
DROP COLUMN "description",
DROP COLUMN "domain",
DROP COLUMN "logo",
DROP COLUMN "ownerName",
ADD COLUMN     "defaultStoreId" TEXT,
ADD COLUMN     "name" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "tenant"."Store" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT,
    "domain" TEXT,
    "logo" TEXT,
    "description" TEXT,
    "currency" "tenant"."Currency" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Store_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Store_domain_key" ON "tenant"."Store"("domain");

-- CreateIndex
CREATE INDEX "Store_tenantId_idx" ON "tenant"."Store"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Store_id_tenantId_key" ON "tenant"."Store"("id", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Address_id_tenantId_key" ON "common"."Address"("id", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Address_id_customerId_key" ON "common"."Address"("id", "customerId");

-- CreateIndex
CREATE UNIQUE INDEX "PhoneNumber_id_tenantId_key" ON "common"."PhoneNumber"("id", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "PhoneNumber_id_customerId_key" ON "common"."PhoneNumber"("id", "customerId");

-- CreateIndex
CREATE INDEX "Customer_storeId_idx" ON "customer"."Customer"("storeId");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_id_storeId_key" ON "customer"."Customer"("id", "storeId");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_defaultPhoneNumberId_id_key" ON "customer"."Customer"("defaultPhoneNumberId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_defaultShippingAddressId_id_key" ON "customer"."Customer"("defaultShippingAddressId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_defaultBillingAddressId_id_key" ON "customer"."Customer"("defaultBillingAddressId", "id");

-- CreateIndex
CREATE INDEX "CustomerReviewProduct_storeId_idx" ON "customer"."CustomerReviewProduct"("storeId");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerReviewProduct_id_storeId_key" ON "customer"."CustomerReviewProduct"("id", "storeId");

-- CreateIndex
CREATE INDEX "WishList_storeId_idx" ON "customer"."WishList"("storeId");

-- CreateIndex
CREATE UNIQUE INDEX "WishList_id_storeId_key" ON "customer"."WishList"("id", "storeId");

-- CreateIndex
CREATE INDEX "StockMovement_storeId_idx" ON "inventory"."StockMovement"("storeId");

-- CreateIndex
CREATE INDEX "StockPerWarehouse_storeId_idx" ON "inventory"."StockPerWarehouse"("storeId");

-- CreateIndex
CREATE UNIQUE INDEX "StockPerWarehouse_warehouseId_variantId_storeId_key" ON "inventory"."StockPerWarehouse"("warehouseId", "variantId", "storeId");

-- CreateIndex
CREATE UNIQUE INDEX "StockPerWarehouse_id_storeId_key" ON "inventory"."StockPerWarehouse"("id", "storeId");

-- CreateIndex
CREATE UNIQUE INDEX "Warehouse_id_storeId_key" ON "inventory"."Warehouse"("id", "storeId");

-- CreateIndex
CREATE UNIQUE INDEX "Warehouse_storeId_name_key" ON "inventory"."Warehouse"("storeId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Warehouse_storeId_addressId_key" ON "inventory"."Warehouse"("storeId", "addressId");

-- CreateIndex
CREATE INDEX "CartPromotions_storeId_idx" ON "pricing"."CartPromotions"("storeId");

-- CreateIndex
CREATE UNIQUE INDEX "Coupon_storeId_code_key" ON "pricing"."Coupon"("storeId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "Coupon_id_storeId_key" ON "pricing"."Coupon"("id", "storeId");

-- CreateIndex
CREATE INDEX "CouponUsage_storeId_idx" ON "pricing"."CouponUsage"("storeId");

-- CreateIndex
CREATE INDEX "OrderPromotions_storeId_idx" ON "pricing"."OrderPromotions"("storeId");

-- CreateIndex
CREATE UNIQUE INDEX "Promotion_storeId_name_key" ON "pricing"."Promotion"("storeId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Promotion_storeId_priority_key" ON "pricing"."Promotion"("storeId", "priority");

-- CreateIndex
CREATE UNIQUE INDEX "Promotion_id_storeId_key" ON "pricing"."Promotion"("id", "storeId");

-- CreateIndex
CREATE UNIQUE INDEX "Category_storeId_name_key" ON "product"."Category"("storeId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Category_id_storeId_key" ON "product"."Category"("id", "storeId");

-- CreateIndex
CREATE INDEX "Media_storeId_idx" ON "product"."Media"("storeId");

-- CreateIndex
CREATE UNIQUE INDEX "Product_storeId_name_key" ON "product"."Product"("storeId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Product_id_storeId_key" ON "product"."Product"("id", "storeId");

-- CreateIndex
CREATE INDEX "ProductCategories_storeId_idx" ON "product"."ProductCategories"("storeId");

-- CreateIndex
CREATE UNIQUE INDEX "TaxRate_storeId_countryId_stateId_categoryId_key" ON "product"."TaxRate"("storeId", "countryId", "stateId", "categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "Variant_id_storeId_key" ON "product"."Variant"("id", "storeId");

-- CreateIndex
CREATE UNIQUE INDEX "Variant_storeId_sku_key" ON "product"."Variant"("storeId", "sku");

-- CreateIndex
CREATE UNIQUE INDEX "Variant_storeId_barcode_key" ON "product"."Variant"("storeId", "barcode");

-- CreateIndex
CREATE INDEX "Cart_storeId_idx" ON "sales"."Cart"("storeId");

-- CreateIndex
CREATE UNIQUE INDEX "Cart_id_storeId_key" ON "sales"."Cart"("id", "storeId");

-- CreateIndex
CREATE INDEX "CartItem_storeId_idx" ON "sales"."CartItem"("storeId");

-- CreateIndex
CREATE UNIQUE INDEX "CartItem_id_storeId_key" ON "sales"."CartItem"("id", "storeId");

-- CreateIndex
CREATE UNIQUE INDEX "Order_storeId_orderNumber_key" ON "sales"."Order"("storeId", "orderNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Order_id_storeId_key" ON "sales"."Order"("id", "storeId");

-- CreateIndex
CREATE INDEX "OrderDetail_storeId_idx" ON "sales"."OrderDetail"("storeId");

-- CreateIndex
CREATE INDEX "Payment_storeId_idx" ON "sales"."Payment"("storeId");

-- CreateIndex
CREATE INDEX "PaymentMethod_storeId_idx" ON "sales"."PaymentMethod"("storeId");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentMethod_id_storeId_key" ON "sales"."PaymentMethod"("id", "storeId");

-- CreateIndex
CREATE INDEX "Return_storeId_idx" ON "sales"."Return"("storeId");

-- CreateIndex
CREATE INDEX "ShipmentRate_storeId_shippingRuleId_idx" ON "shipping"."ShipmentRate"("storeId", "shippingRuleId");

-- CreateIndex
CREATE UNIQUE INDEX "ShipmentRate_storeId_shippingRuleId_countryId_stateId_key" ON "shipping"."ShipmentRate"("storeId", "shippingRuleId", "countryId", "stateId");

-- CreateIndex
CREATE INDEX "ShippingRule_storeId_type_idx" ON "shipping"."ShippingRule"("storeId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "ShippingRule_storeId_slug_key" ON "shipping"."ShippingRule"("storeId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "ShippingRule_storeId_priority_key" ON "shipping"."ShippingRule"("storeId", "priority");

-- CreateIndex
CREATE UNIQUE INDEX "ShippingRule_id_storeId_key" ON "shipping"."ShippingRule"("id", "storeId");

-- CreateIndex
CREATE INDEX "Employee_storeId_idx" ON "tenant"."Employee"("storeId");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_id_storeId_key" ON "tenant"."Employee"("id", "storeId");

-- CreateIndex
CREATE INDEX "EmployeeRole_storeId_idx" ON "tenant"."EmployeeRole"("storeId");

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeRole_storeId_role_key" ON "tenant"."EmployeeRole"("storeId", "role");

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeRole_id_storeId_key" ON "tenant"."EmployeeRole"("id", "storeId");

-- CreateIndex
CREATE INDEX "RoleFeatures_storeId_idx" ON "tenant"."RoleFeatures"("storeId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_storeId_key" ON "tenant"."Subscription"("storeId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_id_storeId_key" ON "tenant"."Subscription"("id", "storeId");

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_defaultStoreId_key" ON "tenant"."Tenant"("defaultStoreId");

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_defaultStoreId_id_key" ON "tenant"."Tenant"("defaultStoreId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_defaultPhoneNumberId_id_key" ON "tenant"."Tenant"("defaultPhoneNumberId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_defaultShippingAddressId_id_key" ON "tenant"."Tenant"("defaultShippingAddressId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_defaultBillingAddressId_id_key" ON "tenant"."Tenant"("defaultBillingAddressId", "id");

-- AddForeignKey
ALTER TABLE "tenant"."Tenant" ADD CONSTRAINT "Tenant_defaultStoreId_id_fkey" FOREIGN KEY ("defaultStoreId", "id") REFERENCES "tenant"."Store"("id", "tenantId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."Tenant" ADD CONSTRAINT "Tenant_defaultPhoneNumberId_id_fkey" FOREIGN KEY ("defaultPhoneNumberId", "id") REFERENCES "common"."PhoneNumber"("id", "tenantId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."Tenant" ADD CONSTRAINT "Tenant_defaultShippingAddressId_id_fkey" FOREIGN KEY ("defaultShippingAddressId", "id") REFERENCES "common"."Address"("id", "tenantId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."Tenant" ADD CONSTRAINT "Tenant_defaultBillingAddressId_id_fkey" FOREIGN KEY ("defaultBillingAddressId", "id") REFERENCES "common"."Address"("id", "tenantId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."Store" ADD CONSTRAINT "Store_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."Subscription" ADD CONSTRAINT "Subscription_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "tenant"."Store"("id") ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "tenant"."Employee" ADD CONSTRAINT "Employee_roleId_storeId_fkey" FOREIGN KEY ("roleId", "storeId") REFERENCES "tenant"."EmployeeRole"("id", "storeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."Employee" ADD CONSTRAINT "Employee_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "tenant"."Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."EmployeeRole" ADD CONSTRAINT "EmployeeRole_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "tenant"."Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."RoleFeatures" ADD CONSTRAINT "RoleFeatures_roleId_storeId_fkey" FOREIGN KEY ("roleId", "storeId") REFERENCES "tenant"."EmployeeRole"("id", "storeId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."RoleFeatures" ADD CONSTRAINT "RoleFeatures_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "tenant"."Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory"."Warehouse" ADD CONSTRAINT "Warehouse_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "tenant"."Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory"."StockMovement" ADD CONSTRAINT "StockMovement_warehouseId_storeId_fkey" FOREIGN KEY ("warehouseId", "storeId") REFERENCES "inventory"."Warehouse"("id", "storeId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory"."StockMovement" ADD CONSTRAINT "StockMovement_createdById_storeId_fkey" FOREIGN KEY ("createdById", "storeId") REFERENCES "tenant"."Employee"("id", "storeId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory"."StockMovement" ADD CONSTRAINT "StockMovement_stockPerWarehouseId_storeId_fkey" FOREIGN KEY ("stockPerWarehouseId", "storeId") REFERENCES "inventory"."StockPerWarehouse"("id", "storeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory"."StockMovement" ADD CONSTRAINT "StockMovement_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "tenant"."Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory"."StockPerWarehouse" ADD CONSTRAINT "StockPerWarehouse_variantId_storeId_fkey" FOREIGN KEY ("variantId", "storeId") REFERENCES "product"."Variant"("id", "storeId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory"."StockPerWarehouse" ADD CONSTRAINT "StockPerWarehouse_warehouseId_storeId_fkey" FOREIGN KEY ("warehouseId", "storeId") REFERENCES "inventory"."Warehouse"("id", "storeId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory"."StockPerWarehouse" ADD CONSTRAINT "StockPerWarehouse_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "tenant"."Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipping"."ShippingRule" ADD CONSTRAINT "ShippingRule_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "tenant"."Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipping"."ShippingRule" ADD CONSTRAINT "ShippingRule_variantId_storeId_fkey" FOREIGN KEY ("variantId", "storeId") REFERENCES "product"."Variant"("id", "storeId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipping"."ShipmentRate" ADD CONSTRAINT "ShipmentRate_shippingRuleId_storeId_fkey" FOREIGN KEY ("shippingRuleId", "storeId") REFERENCES "shipping"."ShippingRule"("id", "storeId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipping"."ShipmentRate" ADD CONSTRAINT "ShipmentRate_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "tenant"."Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product"."TaxRate" ADD CONSTRAINT "TaxRate_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "tenant"."Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product"."TaxRate" ADD CONSTRAINT "TaxRate_categoryId_storeId_fkey" FOREIGN KEY ("categoryId", "storeId") REFERENCES "product"."Category"("id", "storeId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product"."Category" ADD CONSTRAINT "Category_parentId_storeId_fkey" FOREIGN KEY ("parentId", "storeId") REFERENCES "product"."Category"("id", "storeId") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "product"."Category" ADD CONSTRAINT "Category_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "tenant"."Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product"."ProductCategories" ADD CONSTRAINT "ProductCategories_productId_storeId_fkey" FOREIGN KEY ("productId", "storeId") REFERENCES "product"."Product"("id", "storeId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product"."ProductCategories" ADD CONSTRAINT "ProductCategories_categoryId_storeId_fkey" FOREIGN KEY ("categoryId", "storeId") REFERENCES "product"."Category"("id", "storeId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product"."ProductCategories" ADD CONSTRAINT "ProductCategories_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "tenant"."Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product"."Product" ADD CONSTRAINT "Product_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "tenant"."Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product"."Media" ADD CONSTRAINT "Media_productId_storeId_fkey" FOREIGN KEY ("productId", "storeId") REFERENCES "product"."Product"("id", "storeId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product"."Media" ADD CONSTRAINT "Media_variantId_storeId_fkey" FOREIGN KEY ("variantId", "storeId") REFERENCES "product"."Variant"("id", "storeId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product"."Media" ADD CONSTRAINT "Media_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "tenant"."Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product"."Variant" ADD CONSTRAINT "Variant_productId_storeId_fkey" FOREIGN KEY ("productId", "storeId") REFERENCES "product"."Product"("id", "storeId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product"."Variant" ADD CONSTRAINT "Variant_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "tenant"."Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pricing"."Promotion" ADD CONSTRAINT "Promotion_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "tenant"."Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pricing"."Coupon" ADD CONSTRAINT "Coupon_promotionId_storeId_fkey" FOREIGN KEY ("promotionId", "storeId") REFERENCES "pricing"."Promotion"("id", "storeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pricing"."Coupon" ADD CONSTRAINT "Coupon_customerId_storeId_fkey" FOREIGN KEY ("customerId", "storeId") REFERENCES "customer"."Customer"("id", "storeId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pricing"."Coupon" ADD CONSTRAINT "Coupon_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "tenant"."Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pricing"."CouponUsage" ADD CONSTRAINT "CouponUsage_couponId_storeId_fkey" FOREIGN KEY ("couponId", "storeId") REFERENCES "pricing"."Coupon"("id", "storeId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pricing"."CouponUsage" ADD CONSTRAINT "CouponUsage_orderId_storeId_fkey" FOREIGN KEY ("orderId", "storeId") REFERENCES "sales"."Order"("id", "storeId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pricing"."CouponUsage" ADD CONSTRAINT "CouponUsage_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "tenant"."Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pricing"."CartPromotions" ADD CONSTRAINT "CartPromotions_cartId_storeId_fkey" FOREIGN KEY ("cartId", "storeId") REFERENCES "sales"."Cart"("id", "storeId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pricing"."CartPromotions" ADD CONSTRAINT "CartPromotions_promotionId_storeId_fkey" FOREIGN KEY ("promotionId", "storeId") REFERENCES "pricing"."Promotion"("id", "storeId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pricing"."CartPromotions" ADD CONSTRAINT "CartPromotions_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "tenant"."Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pricing"."OrderPromotions" ADD CONSTRAINT "OrderPromotions_orderId_storeId_fkey" FOREIGN KEY ("orderId", "storeId") REFERENCES "sales"."Order"("id", "storeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pricing"."OrderPromotions" ADD CONSTRAINT "OrderPromotions_promotionId_storeId_fkey" FOREIGN KEY ("promotionId", "storeId") REFERENCES "pricing"."Promotion"("id", "storeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pricing"."OrderPromotions" ADD CONSTRAINT "OrderPromotions_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "tenant"."Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales"."Cart" ADD CONSTRAINT "Cart_customerId_storeId_fkey" FOREIGN KEY ("customerId", "storeId") REFERENCES "customer"."Customer"("id", "storeId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales"."Cart" ADD CONSTRAINT "Cart_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "tenant"."Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales"."CartItem" ADD CONSTRAINT "CartItem_cartId_storeId_fkey" FOREIGN KEY ("cartId", "storeId") REFERENCES "sales"."Cart"("id", "storeId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales"."CartItem" ADD CONSTRAINT "CartItem_promotionId_storeId_fkey" FOREIGN KEY ("promotionId", "storeId") REFERENCES "pricing"."Promotion"("id", "storeId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales"."CartItem" ADD CONSTRAINT "CartItem_variantId_storeId_fkey" FOREIGN KEY ("variantId", "storeId") REFERENCES "product"."Variant"("id", "storeId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales"."CartItem" ADD CONSTRAINT "CartItem_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "tenant"."Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales"."Order" ADD CONSTRAINT "Order_customerId_storeId_fkey" FOREIGN KEY ("customerId", "storeId") REFERENCES "customer"."Customer"("id", "storeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales"."Order" ADD CONSTRAINT "Order_cartId_storeId_fkey" FOREIGN KEY ("cartId", "storeId") REFERENCES "sales"."Cart"("id", "storeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales"."Order" ADD CONSTRAINT "Order_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "tenant"."Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales"."OrderDetail" ADD CONSTRAINT "OrderDetail_orderId_storeId_fkey" FOREIGN KEY ("orderId", "storeId") REFERENCES "sales"."Order"("id", "storeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales"."OrderDetail" ADD CONSTRAINT "OrderDetail_variantId_storeId_fkey" FOREIGN KEY ("variantId", "storeId") REFERENCES "product"."Variant"("id", "storeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales"."OrderDetail" ADD CONSTRAINT "OrderDetail_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "tenant"."Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales"."Return" ADD CONSTRAINT "Return_orderId_storeId_fkey" FOREIGN KEY ("orderId", "storeId") REFERENCES "sales"."Order"("id", "storeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales"."Return" ADD CONSTRAINT "Return_variantId_storeId_fkey" FOREIGN KEY ("variantId", "storeId") REFERENCES "product"."Variant"("id", "storeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales"."Return" ADD CONSTRAINT "Return_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "tenant"."Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales"."Payment" ADD CONSTRAINT "Payment_orderId_storeId_fkey" FOREIGN KEY ("orderId", "storeId") REFERENCES "sales"."Order"("id", "storeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales"."Payment" ADD CONSTRAINT "Payment_paymentMethodId_storeId_fkey" FOREIGN KEY ("paymentMethodId", "storeId") REFERENCES "sales"."PaymentMethod"("id", "storeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales"."Payment" ADD CONSTRAINT "Payment_subscriptionId_storeId_fkey" FOREIGN KEY ("subscriptionId", "storeId") REFERENCES "tenant"."Subscription"("id", "storeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales"."Payment" ADD CONSTRAINT "Payment_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "tenant"."Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales"."PaymentMethod" ADD CONSTRAINT "PaymentMethod_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "tenant"."Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales"."PaymentMethod" ADD CONSTRAINT "PaymentMethod_customerId_storeId_fkey" FOREIGN KEY ("customerId", "storeId") REFERENCES "customer"."Customer"("id", "storeId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer"."Customer" ADD CONSTRAINT "Customer_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "tenant"."Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer"."Customer" ADD CONSTRAINT "Customer_defaultPhoneNumberId_id_fkey" FOREIGN KEY ("defaultPhoneNumberId", "id") REFERENCES "common"."PhoneNumber"("id", "customerId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer"."Customer" ADD CONSTRAINT "Customer_defaultShippingAddressId_id_fkey" FOREIGN KEY ("defaultShippingAddressId", "id") REFERENCES "common"."Address"("id", "customerId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer"."Customer" ADD CONSTRAINT "Customer_defaultBillingAddressId_id_fkey" FOREIGN KEY ("defaultBillingAddressId", "id") REFERENCES "common"."Address"("id", "customerId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer"."WishList" ADD CONSTRAINT "WishList_customerId_storeId_fkey" FOREIGN KEY ("customerId", "storeId") REFERENCES "customer"."Customer"("id", "storeId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer"."WishList" ADD CONSTRAINT "WishList_variantId_storeId_fkey" FOREIGN KEY ("variantId", "storeId") REFERENCES "product"."Variant"("id", "storeId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer"."WishList" ADD CONSTRAINT "WishList_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "tenant"."Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer"."CustomerReviewProduct" ADD CONSTRAINT "CustomerReviewProduct_customerId_storeId_fkey" FOREIGN KEY ("customerId", "storeId") REFERENCES "customer"."Customer"("id", "storeId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer"."CustomerReviewProduct" ADD CONSTRAINT "CustomerReviewProduct_variantId_storeId_fkey" FOREIGN KEY ("variantId", "storeId") REFERENCES "product"."Variant"("id", "storeId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer"."CustomerReviewProduct" ADD CONSTRAINT "CustomerReviewProduct_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "tenant"."Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- RecreateView (using storeId instead of tenantId)
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

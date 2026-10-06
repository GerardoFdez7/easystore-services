-- Converts every id / foreign key from TEXT to native UUID in place.
-- Prisma's generated diff dropped and recreated each column (data loss); this version
-- casts with USING so existing rows are preserved. It fails if any value is not a valid UUID.
-- Indexes and primary keys are kept by ALTER COLUMN ... TYPE, so they are not recreated.

-- The view depends on columns being retyped; init.sql (seed step) recreates it.
DROP VIEW IF EXISTS sales.dashboard_sales_view;

-- DropForeignKey
ALTER TABLE "common"."Address" DROP CONSTRAINT "Address_countryId_fkey";

-- DropForeignKey
ALTER TABLE "common"."Address" DROP CONSTRAINT "Address_customerId_fkey";

-- DropForeignKey
ALTER TABLE "common"."Address" DROP CONSTRAINT "Address_stateId_fkey";

-- DropForeignKey
ALTER TABLE "common"."Address" DROP CONSTRAINT "Address_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "common"."PhoneNumber" DROP CONSTRAINT "PhoneNumber_customerId_fkey";

-- DropForeignKey
ALTER TABLE "common"."PhoneNumber" DROP CONSTRAINT "PhoneNumber_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "customer"."Customer" DROP CONSTRAINT "Customer_authIdentityId_fkey";

-- DropForeignKey
ALTER TABLE "customer"."Customer" DROP CONSTRAINT "Customer_defaultBillingAddressId_id_fkey";

-- DropForeignKey
ALTER TABLE "customer"."Customer" DROP CONSTRAINT "Customer_defaultPhoneNumberId_id_fkey";

-- DropForeignKey
ALTER TABLE "customer"."Customer" DROP CONSTRAINT "Customer_defaultShippingAddressId_id_fkey";

-- DropForeignKey
ALTER TABLE "customer"."Customer" DROP CONSTRAINT "Customer_storeId_fkey";

-- DropForeignKey
ALTER TABLE "customer"."CustomerReviewProduct" DROP CONSTRAINT "CustomerReviewProduct_customerId_storeId_fkey";

-- DropForeignKey
ALTER TABLE "customer"."CustomerReviewProduct" DROP CONSTRAINT "CustomerReviewProduct_storeId_fkey";

-- DropForeignKey
ALTER TABLE "customer"."CustomerReviewProduct" DROP CONSTRAINT "CustomerReviewProduct_variantId_storeId_fkey";

-- DropForeignKey
ALTER TABLE "customer"."WishList" DROP CONSTRAINT "WishList_customerId_storeId_fkey";

-- DropForeignKey
ALTER TABLE "customer"."WishList" DROP CONSTRAINT "WishList_storeId_fkey";

-- DropForeignKey
ALTER TABLE "customer"."WishList" DROP CONSTRAINT "WishList_variantId_storeId_fkey";

-- DropForeignKey
ALTER TABLE "geography"."State" DROP CONSTRAINT "State_countryId_fkey";

-- DropForeignKey
ALTER TABLE "inventory"."StockMovement" DROP CONSTRAINT "StockMovement_createdById_fkey";

-- DropForeignKey
ALTER TABLE "inventory"."StockMovement" DROP CONSTRAINT "StockMovement_stockPerWarehouseId_storeId_fkey";

-- DropForeignKey
ALTER TABLE "inventory"."StockMovement" DROP CONSTRAINT "StockMovement_storeId_fkey";

-- DropForeignKey
ALTER TABLE "inventory"."StockMovement" DROP CONSTRAINT "StockMovement_warehouseId_storeId_fkey";

-- DropForeignKey
ALTER TABLE "inventory"."StockPerWarehouse" DROP CONSTRAINT "StockPerWarehouse_storeId_fkey";

-- DropForeignKey
ALTER TABLE "inventory"."StockPerWarehouse" DROP CONSTRAINT "StockPerWarehouse_variantId_storeId_fkey";

-- DropForeignKey
ALTER TABLE "inventory"."StockPerWarehouse" DROP CONSTRAINT "StockPerWarehouse_warehouseId_storeId_fkey";

-- DropForeignKey
ALTER TABLE "inventory"."Warehouse" DROP CONSTRAINT "Warehouse_addressId_fkey";

-- DropForeignKey
ALTER TABLE "inventory"."Warehouse" DROP CONSTRAINT "Warehouse_storeId_fkey";

-- DropForeignKey
ALTER TABLE "pricing"."CartPromotions" DROP CONSTRAINT "CartPromotions_cartId_storeId_fkey";

-- DropForeignKey
ALTER TABLE "pricing"."CartPromotions" DROP CONSTRAINT "CartPromotions_promotionId_storeId_fkey";

-- DropForeignKey
ALTER TABLE "pricing"."CartPromotions" DROP CONSTRAINT "CartPromotions_storeId_fkey";

-- DropForeignKey
ALTER TABLE "pricing"."Coupon" DROP CONSTRAINT "Coupon_customerId_fkey";

-- DropForeignKey
ALTER TABLE "pricing"."Coupon" DROP CONSTRAINT "Coupon_promotionId_storeId_fkey";

-- DropForeignKey
ALTER TABLE "pricing"."Coupon" DROP CONSTRAINT "Coupon_storeId_fkey";

-- DropForeignKey
ALTER TABLE "pricing"."CouponUsage" DROP CONSTRAINT "CouponUsage_couponId_storeId_fkey";

-- DropForeignKey
ALTER TABLE "pricing"."CouponUsage" DROP CONSTRAINT "CouponUsage_orderId_storeId_fkey";

-- DropForeignKey
ALTER TABLE "pricing"."CouponUsage" DROP CONSTRAINT "CouponUsage_storeId_fkey";

-- DropForeignKey
ALTER TABLE "pricing"."OrderPromotions" DROP CONSTRAINT "OrderPromotions_orderId_storeId_fkey";

-- DropForeignKey
ALTER TABLE "pricing"."OrderPromotions" DROP CONSTRAINT "OrderPromotions_promotionId_storeId_fkey";

-- DropForeignKey
ALTER TABLE "pricing"."OrderPromotions" DROP CONSTRAINT "OrderPromotions_storeId_fkey";

-- DropForeignKey
ALTER TABLE "pricing"."Promotion" DROP CONSTRAINT "Promotion_storeId_fkey";

-- DropForeignKey
ALTER TABLE "product"."Attribute" DROP CONSTRAINT "Attribute_variantId_fkey";

-- DropForeignKey
ALTER TABLE "product"."Category" DROP CONSTRAINT "Category_parentId_fkey";

-- DropForeignKey
ALTER TABLE "product"."Category" DROP CONSTRAINT "Category_storeId_fkey";

-- DropForeignKey
ALTER TABLE "product"."Dimension" DROP CONSTRAINT "Dimension_variantId_fkey";

-- DropForeignKey
ALTER TABLE "product"."InstallmentPayment" DROP CONSTRAINT "InstallmentPayment_variantId_fkey";

-- DropForeignKey
ALTER TABLE "product"."Media" DROP CONSTRAINT "Media_productId_storeId_fkey";

-- DropForeignKey
ALTER TABLE "product"."Media" DROP CONSTRAINT "Media_storeId_fkey";

-- DropForeignKey
ALTER TABLE "product"."Media" DROP CONSTRAINT "Media_variantId_storeId_fkey";

-- DropForeignKey
ALTER TABLE "product"."Product" DROP CONSTRAINT "Product_storeId_fkey";

-- DropForeignKey
ALTER TABLE "product"."ProductCategories" DROP CONSTRAINT "ProductCategories_categoryId_storeId_fkey";

-- DropForeignKey
ALTER TABLE "product"."ProductCategories" DROP CONSTRAINT "ProductCategories_productId_storeId_fkey";

-- DropForeignKey
ALTER TABLE "product"."ProductCategories" DROP CONSTRAINT "ProductCategories_storeId_fkey";

-- DropForeignKey
ALTER TABLE "product"."Sustainability" DROP CONSTRAINT "Sustainability_productId_fkey";

-- DropForeignKey
ALTER TABLE "product"."TaxRate" DROP CONSTRAINT "TaxRate_categoryId_storeId_fkey";

-- DropForeignKey
ALTER TABLE "product"."TaxRate" DROP CONSTRAINT "TaxRate_countryId_fkey";

-- DropForeignKey
ALTER TABLE "product"."TaxRate" DROP CONSTRAINT "TaxRate_stateId_fkey";

-- DropForeignKey
ALTER TABLE "product"."TaxRate" DROP CONSTRAINT "TaxRate_storeId_fkey";

-- DropForeignKey
ALTER TABLE "product"."Variant" DROP CONSTRAINT "Variant_productId_storeId_fkey";

-- DropForeignKey
ALTER TABLE "product"."Variant" DROP CONSTRAINT "Variant_storeId_fkey";

-- DropForeignKey
ALTER TABLE "product"."Warranty" DROP CONSTRAINT "Warranty_variantId_fkey";

-- DropForeignKey
ALTER TABLE "sales"."Cart" DROP CONSTRAINT "Cart_customerId_storeId_fkey";

-- DropForeignKey
ALTER TABLE "sales"."Cart" DROP CONSTRAINT "Cart_storeId_fkey";

-- DropForeignKey
ALTER TABLE "sales"."CartItem" DROP CONSTRAINT "CartItem_cartId_storeId_fkey";

-- DropForeignKey
ALTER TABLE "sales"."CartItem" DROP CONSTRAINT "CartItem_promotionId_fkey";

-- DropForeignKey
ALTER TABLE "sales"."CartItem" DROP CONSTRAINT "CartItem_storeId_fkey";

-- DropForeignKey
ALTER TABLE "sales"."CartItem" DROP CONSTRAINT "CartItem_variantId_storeId_fkey";

-- DropForeignKey
ALTER TABLE "sales"."Order" DROP CONSTRAINT "Order_addressId_customerId_fkey";

-- DropForeignKey
ALTER TABLE "sales"."Order" DROP CONSTRAINT "Order_cartId_storeId_fkey";

-- DropForeignKey
ALTER TABLE "sales"."Order" DROP CONSTRAINT "Order_customerId_storeId_fkey";

-- DropForeignKey
ALTER TABLE "sales"."Order" DROP CONSTRAINT "Order_storeId_fkey";

-- DropForeignKey
ALTER TABLE "sales"."OrderDetail" DROP CONSTRAINT "OrderDetail_orderId_storeId_fkey";

-- DropForeignKey
ALTER TABLE "sales"."OrderDetail" DROP CONSTRAINT "OrderDetail_storeId_fkey";

-- DropForeignKey
ALTER TABLE "sales"."OrderDetail" DROP CONSTRAINT "OrderDetail_variantId_storeId_fkey";

-- DropForeignKey
ALTER TABLE "sales"."Payment" DROP CONSTRAINT "Payment_orderId_storeId_fkey";

-- DropForeignKey
ALTER TABLE "sales"."Payment" DROP CONSTRAINT "Payment_paymentMethodId_storeId_fkey";

-- DropForeignKey
ALTER TABLE "sales"."Payment" DROP CONSTRAINT "Payment_storeId_fkey";

-- DropForeignKey
ALTER TABLE "sales"."Payment" DROP CONSTRAINT "Payment_subscriptionId_storeId_fkey";

-- DropForeignKey
ALTER TABLE "sales"."PaymentMethod" DROP CONSTRAINT "PaymentMethod_customerId_storeId_fkey";

-- DropForeignKey
ALTER TABLE "sales"."PaymentMethod" DROP CONSTRAINT "PaymentMethod_storeId_fkey";

-- DropForeignKey
ALTER TABLE "sales"."Return" DROP CONSTRAINT "Return_orderId_storeId_fkey";

-- DropForeignKey
ALTER TABLE "sales"."Return" DROP CONSTRAINT "Return_storeId_fkey";

-- DropForeignKey
ALTER TABLE "sales"."Return" DROP CONSTRAINT "Return_variantId_storeId_fkey";

-- DropForeignKey
ALTER TABLE "shipping"."ShipmentRate" DROP CONSTRAINT "ShipmentRate_countryId_fkey";

-- DropForeignKey
ALTER TABLE "shipping"."ShipmentRate" DROP CONSTRAINT "ShipmentRate_shippingRuleId_storeId_fkey";

-- DropForeignKey
ALTER TABLE "shipping"."ShipmentRate" DROP CONSTRAINT "ShipmentRate_stateId_fkey";

-- DropForeignKey
ALTER TABLE "shipping"."ShipmentRate" DROP CONSTRAINT "ShipmentRate_storeId_fkey";

-- DropForeignKey
ALTER TABLE "shipping"."ShippingRule" DROP CONSTRAINT "ShippingRule_storeId_fkey";

-- DropForeignKey
ALTER TABLE "shipping"."ShippingRule" DROP CONSTRAINT "ShippingRule_variantId_storeId_fkey";

-- DropForeignKey
ALTER TABLE "tenant"."Employee" DROP CONSTRAINT "Employee_authIdentityId_fkey";

-- DropForeignKey
ALTER TABLE "tenant"."Employee" DROP CONSTRAINT "Employee_roleId_storeId_fkey";

-- DropForeignKey
ALTER TABLE "tenant"."Employee" DROP CONSTRAINT "Employee_storeId_fkey";

-- DropForeignKey
ALTER TABLE "tenant"."EmployeeRole" DROP CONSTRAINT "EmployeeRole_storeId_fkey";

-- DropForeignKey
ALTER TABLE "tenant"."RoleFeatures" DROP CONSTRAINT "RoleFeatures_featureId_fkey";

-- DropForeignKey
ALTER TABLE "tenant"."RoleFeatures" DROP CONSTRAINT "RoleFeatures_roleId_storeId_fkey";

-- DropForeignKey
ALTER TABLE "tenant"."RoleFeatures" DROP CONSTRAINT "RoleFeatures_storeId_fkey";

-- DropForeignKey
ALTER TABLE "tenant"."Store" DROP CONSTRAINT "Store_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "tenant"."Subscription" DROP CONSTRAINT "Subscription_planId_fkey";

-- DropForeignKey
ALTER TABLE "tenant"."Subscription" DROP CONSTRAINT "Subscription_storeId_fkey";

-- DropForeignKey
ALTER TABLE "tenant"."Tenant" DROP CONSTRAINT "Tenant_authIdentityId_fkey";

-- DropForeignKey
ALTER TABLE "tenant"."Tenant" DROP CONSTRAINT "Tenant_defaultBillingAddressId_id_fkey";

-- DropForeignKey
ALTER TABLE "tenant"."Tenant" DROP CONSTRAINT "Tenant_defaultPhoneNumberId_id_fkey";

-- DropForeignKey
ALTER TABLE "tenant"."Tenant" DROP CONSTRAINT "Tenant_defaultShippingAddressId_id_fkey";

-- DropForeignKey
ALTER TABLE "tenant"."Tenant" DROP CONSTRAINT "Tenant_defaultStoreId_id_fkey";

-- AlterTable
ALTER TABLE "common"."Address" ALTER COLUMN "id" SET DATA TYPE UUID USING "id"::uuid,
ALTER COLUMN "countryId" SET DATA TYPE UUID USING "countryId"::uuid,
ALTER COLUMN "tenantId" SET DATA TYPE UUID USING "tenantId"::uuid,
ALTER COLUMN "customerId" SET DATA TYPE UUID USING "customerId"::uuid,
ALTER COLUMN "stateId" SET DATA TYPE UUID USING "stateId"::uuid;

-- AlterTable
ALTER TABLE "common"."AuthIdentity" ALTER COLUMN "id" SET DATA TYPE UUID USING "id"::uuid;

-- AlterTable
ALTER TABLE "common"."PhoneNumber" ALTER COLUMN "id" SET DATA TYPE UUID USING "id"::uuid,
ALTER COLUMN "customerId" SET DATA TYPE UUID USING "customerId"::uuid,
ALTER COLUMN "tenantId" SET DATA TYPE UUID USING "tenantId"::uuid;

-- AlterTable
ALTER TABLE "customer"."Customer" ALTER COLUMN "id" SET DATA TYPE UUID USING "id"::uuid,
ALTER COLUMN "authIdentityId" SET DATA TYPE UUID USING "authIdentityId"::uuid,
ALTER COLUMN "defaultPhoneNumberId" SET DATA TYPE UUID USING "defaultPhoneNumberId"::uuid,
ALTER COLUMN "defaultShippingAddressId" SET DATA TYPE UUID USING "defaultShippingAddressId"::uuid,
ALTER COLUMN "defaultBillingAddressId" SET DATA TYPE UUID USING "defaultBillingAddressId"::uuid,
ALTER COLUMN "storeId" SET DATA TYPE UUID USING "storeId"::uuid;

-- AlterTable
ALTER TABLE "customer"."CustomerReviewProduct" ALTER COLUMN "id" SET DATA TYPE UUID USING "id"::uuid,
ALTER COLUMN "customerId" SET DATA TYPE UUID USING "customerId"::uuid,
ALTER COLUMN "variantId" SET DATA TYPE UUID USING "variantId"::uuid,
ALTER COLUMN "storeId" SET DATA TYPE UUID USING "storeId"::uuid;

-- AlterTable
ALTER TABLE "customer"."WishList" ALTER COLUMN "id" SET DATA TYPE UUID USING "id"::uuid,
ALTER COLUMN "variantId" SET DATA TYPE UUID USING "variantId"::uuid,
ALTER COLUMN "customerId" SET DATA TYPE UUID USING "customerId"::uuid,
ALTER COLUMN "storeId" SET DATA TYPE UUID USING "storeId"::uuid;

-- AlterTable
ALTER TABLE "geography"."Country" ALTER COLUMN "id" SET DATA TYPE UUID USING "id"::uuid;

-- AlterTable
ALTER TABLE "geography"."State" ALTER COLUMN "id" SET DATA TYPE UUID USING "id"::uuid,
ALTER COLUMN "countryId" SET DATA TYPE UUID USING "countryId"::uuid;

-- AlterTable
ALTER TABLE "inventory"."StockMovement" ALTER COLUMN "id" SET DATA TYPE UUID USING "id"::uuid,
ALTER COLUMN "createdById" SET DATA TYPE UUID USING "createdById"::uuid,
ALTER COLUMN "warehouseId" SET DATA TYPE UUID USING "warehouseId"::uuid,
ALTER COLUMN "stockPerWarehouseId" SET DATA TYPE UUID USING "stockPerWarehouseId"::uuid,
ALTER COLUMN "storeId" SET DATA TYPE UUID USING "storeId"::uuid;

-- AlterTable
ALTER TABLE "inventory"."StockPerWarehouse" ALTER COLUMN "id" SET DATA TYPE UUID USING "id"::uuid,
ALTER COLUMN "variantId" SET DATA TYPE UUID USING "variantId"::uuid,
ALTER COLUMN "warehouseId" SET DATA TYPE UUID USING "warehouseId"::uuid,
ALTER COLUMN "storeId" SET DATA TYPE UUID USING "storeId"::uuid;

-- AlterTable
ALTER TABLE "inventory"."Warehouse" ALTER COLUMN "id" SET DATA TYPE UUID USING "id"::uuid,
ALTER COLUMN "addressId" SET DATA TYPE UUID USING "addressId"::uuid,
ALTER COLUMN "storeId" SET DATA TYPE UUID USING "storeId"::uuid;

-- AlterTable
ALTER TABLE "pricing"."CartPromotions" ALTER COLUMN "id" SET DATA TYPE UUID USING "id"::uuid,
ALTER COLUMN "cartId" SET DATA TYPE UUID USING "cartId"::uuid,
ALTER COLUMN "promotionId" SET DATA TYPE UUID USING "promotionId"::uuid,
ALTER COLUMN "storeId" SET DATA TYPE UUID USING "storeId"::uuid;

-- AlterTable
ALTER TABLE "pricing"."Coupon" ALTER COLUMN "id" SET DATA TYPE UUID USING "id"::uuid,
ALTER COLUMN "promotionId" SET DATA TYPE UUID USING "promotionId"::uuid,
ALTER COLUMN "customerId" SET DATA TYPE UUID USING "customerId"::uuid,
ALTER COLUMN "storeId" SET DATA TYPE UUID USING "storeId"::uuid;

-- AlterTable
ALTER TABLE "pricing"."CouponUsage" ALTER COLUMN "id" SET DATA TYPE UUID USING "id"::uuid,
ALTER COLUMN "couponId" SET DATA TYPE UUID USING "couponId"::uuid,
ALTER COLUMN "orderId" SET DATA TYPE UUID USING "orderId"::uuid,
ALTER COLUMN "storeId" SET DATA TYPE UUID USING "storeId"::uuid;

-- AlterTable
ALTER TABLE "pricing"."OrderPromotions" ALTER COLUMN "id" SET DATA TYPE UUID USING "id"::uuid,
ALTER COLUMN "orderId" SET DATA TYPE UUID USING "orderId"::uuid,
ALTER COLUMN "promotionId" SET DATA TYPE UUID USING "promotionId"::uuid,
ALTER COLUMN "storeId" SET DATA TYPE UUID USING "storeId"::uuid;

-- AlterTable
ALTER TABLE "pricing"."Promotion" ALTER COLUMN "id" SET DATA TYPE UUID USING "id"::uuid,
ALTER COLUMN "storeId" SET DATA TYPE UUID USING "storeId"::uuid;

-- AlterTable
ALTER TABLE "product"."Attribute" ALTER COLUMN "id" SET DATA TYPE UUID USING "id"::uuid,
ALTER COLUMN "variantId" SET DATA TYPE UUID USING "variantId"::uuid;

-- AlterTable
ALTER TABLE "product"."Category" ALTER COLUMN "id" SET DATA TYPE UUID USING "id"::uuid,
ALTER COLUMN "parentId" SET DATA TYPE UUID USING "parentId"::uuid,
ALTER COLUMN "storeId" SET DATA TYPE UUID USING "storeId"::uuid;

-- AlterTable
ALTER TABLE "product"."Dimension" ALTER COLUMN "id" SET DATA TYPE UUID USING "id"::uuid,
ALTER COLUMN "variantId" SET DATA TYPE UUID USING "variantId"::uuid;

-- AlterTable
ALTER TABLE "product"."InstallmentPayment" ALTER COLUMN "id" SET DATA TYPE UUID USING "id"::uuid,
ALTER COLUMN "variantId" SET DATA TYPE UUID USING "variantId"::uuid;

-- AlterTable
ALTER TABLE "product"."Media" ALTER COLUMN "id" SET DATA TYPE UUID USING "id"::uuid,
ALTER COLUMN "productId" SET DATA TYPE UUID USING "productId"::uuid,
ALTER COLUMN "variantId" SET DATA TYPE UUID USING "variantId"::uuid,
ALTER COLUMN "storeId" SET DATA TYPE UUID USING "storeId"::uuid;

-- AlterTable
ALTER TABLE "product"."Product" ALTER COLUMN "id" SET DATA TYPE UUID USING "id"::uuid,
ALTER COLUMN "storeId" SET DATA TYPE UUID USING "storeId"::uuid;

-- AlterTable
ALTER TABLE "product"."ProductCategories" ALTER COLUMN "id" SET DATA TYPE UUID USING "id"::uuid,
ALTER COLUMN "productId" SET DATA TYPE UUID USING "productId"::uuid,
ALTER COLUMN "categoryId" SET DATA TYPE UUID USING "categoryId"::uuid,
ALTER COLUMN "storeId" SET DATA TYPE UUID USING "storeId"::uuid;

-- AlterTable
ALTER TABLE "product"."Sustainability" ALTER COLUMN "id" SET DATA TYPE UUID USING "id"::uuid,
ALTER COLUMN "productId" SET DATA TYPE UUID USING "productId"::uuid;

-- AlterTable
ALTER TABLE "product"."TaxRate" ALTER COLUMN "id" SET DATA TYPE UUID USING "id"::uuid,
ALTER COLUMN "countryId" SET DATA TYPE UUID USING "countryId"::uuid,
ALTER COLUMN "stateId" SET DATA TYPE UUID USING "stateId"::uuid,
ALTER COLUMN "categoryId" SET DATA TYPE UUID USING "categoryId"::uuid,
ALTER COLUMN "storeId" SET DATA TYPE UUID USING "storeId"::uuid;

-- AlterTable
ALTER TABLE "product"."Variant" ALTER COLUMN "id" SET DATA TYPE UUID USING "id"::uuid,
ALTER COLUMN "productId" SET DATA TYPE UUID USING "productId"::uuid,
ALTER COLUMN "storeId" SET DATA TYPE UUID USING "storeId"::uuid;

-- AlterTable
ALTER TABLE "product"."Warranty" ALTER COLUMN "id" SET DATA TYPE UUID USING "id"::uuid,
ALTER COLUMN "variantId" SET DATA TYPE UUID USING "variantId"::uuid;

-- AlterTable
ALTER TABLE "sales"."Cart" ALTER COLUMN "id" SET DATA TYPE UUID USING "id"::uuid,
ALTER COLUMN "customerId" SET DATA TYPE UUID USING "customerId"::uuid,
ALTER COLUMN "storeId" SET DATA TYPE UUID USING "storeId"::uuid;

-- AlterTable
ALTER TABLE "sales"."CartItem" ALTER COLUMN "id" SET DATA TYPE UUID USING "id"::uuid,
ALTER COLUMN "variantId" SET DATA TYPE UUID USING "variantId"::uuid,
ALTER COLUMN "cartId" SET DATA TYPE UUID USING "cartId"::uuid,
ALTER COLUMN "promotionId" SET DATA TYPE UUID USING "promotionId"::uuid,
ALTER COLUMN "storeId" SET DATA TYPE UUID USING "storeId"::uuid;

-- AlterTable
ALTER TABLE "sales"."Order" ALTER COLUMN "id" SET DATA TYPE UUID USING "id"::uuid,
ALTER COLUMN "customerId" SET DATA TYPE UUID USING "customerId"::uuid,
ALTER COLUMN "cartId" SET DATA TYPE UUID USING "cartId"::uuid,
ALTER COLUMN "addressId" SET DATA TYPE UUID USING "addressId"::uuid,
ALTER COLUMN "storeId" SET DATA TYPE UUID USING "storeId"::uuid;

-- AlterTable
ALTER TABLE "sales"."OrderDetail" ALTER COLUMN "id" SET DATA TYPE UUID USING "id"::uuid,
ALTER COLUMN "orderId" SET DATA TYPE UUID USING "orderId"::uuid,
ALTER COLUMN "variantId" SET DATA TYPE UUID USING "variantId"::uuid,
ALTER COLUMN "storeId" SET DATA TYPE UUID USING "storeId"::uuid;

-- AlterTable
ALTER TABLE "sales"."Payment" ALTER COLUMN "id" SET DATA TYPE UUID USING "id"::uuid,
ALTER COLUMN "orderId" SET DATA TYPE UUID USING "orderId"::uuid,
ALTER COLUMN "paymentMethodId" SET DATA TYPE UUID USING "paymentMethodId"::uuid,
ALTER COLUMN "subscriptionId" SET DATA TYPE UUID USING "subscriptionId"::uuid,
ALTER COLUMN "storeId" SET DATA TYPE UUID USING "storeId"::uuid;

-- AlterTable
ALTER TABLE "sales"."PaymentMethod" ALTER COLUMN "id" SET DATA TYPE UUID USING "id"::uuid,
ALTER COLUMN "customerId" SET DATA TYPE UUID USING "customerId"::uuid,
ALTER COLUMN "storeId" SET DATA TYPE UUID USING "storeId"::uuid;

-- AlterTable
ALTER TABLE "sales"."Return" ALTER COLUMN "id" SET DATA TYPE UUID USING "id"::uuid,
ALTER COLUMN "variantId" SET DATA TYPE UUID USING "variantId"::uuid,
ALTER COLUMN "orderId" SET DATA TYPE UUID USING "orderId"::uuid,
ALTER COLUMN "storeId" SET DATA TYPE UUID USING "storeId"::uuid;

-- AlterTable
ALTER TABLE "shipping"."ShipmentRate" ALTER COLUMN "id" SET DATA TYPE UUID USING "id"::uuid,
ALTER COLUMN "shippingRuleId" SET DATA TYPE UUID USING "shippingRuleId"::uuid,
ALTER COLUMN "countryId" SET DATA TYPE UUID USING "countryId"::uuid,
ALTER COLUMN "stateId" SET DATA TYPE UUID USING "stateId"::uuid,
ALTER COLUMN "storeId" SET DATA TYPE UUID USING "storeId"::uuid;

-- AlterTable
ALTER TABLE "shipping"."ShippingRule" ALTER COLUMN "id" SET DATA TYPE UUID USING "id"::uuid,
ALTER COLUMN "variantId" SET DATA TYPE UUID USING "variantId"::uuid,
ALTER COLUMN "storeId" SET DATA TYPE UUID USING "storeId"::uuid;

-- AlterTable
ALTER TABLE "tenant"."Employee" ALTER COLUMN "id" SET DATA TYPE UUID USING "id"::uuid,
ALTER COLUMN "roleId" SET DATA TYPE UUID USING "roleId"::uuid,
ALTER COLUMN "authIdentityId" SET DATA TYPE UUID USING "authIdentityId"::uuid,
ALTER COLUMN "storeId" SET DATA TYPE UUID USING "storeId"::uuid;

-- AlterTable
ALTER TABLE "tenant"."EmployeeRole" ALTER COLUMN "id" SET DATA TYPE UUID USING "id"::uuid,
ALTER COLUMN "storeId" SET DATA TYPE UUID USING "storeId"::uuid;

-- AlterTable
ALTER TABLE "tenant"."Feature" ALTER COLUMN "id" SET DATA TYPE UUID USING "id"::uuid;

-- AlterTable
ALTER TABLE "tenant"."Plan" ALTER COLUMN "id" SET DATA TYPE UUID USING "id"::uuid;

-- AlterTable
ALTER TABLE "tenant"."RoleFeatures" ALTER COLUMN "id" SET DATA TYPE UUID USING "id"::uuid,
ALTER COLUMN "roleId" SET DATA TYPE UUID USING "roleId"::uuid,
ALTER COLUMN "featureId" SET DATA TYPE UUID USING "featureId"::uuid,
ALTER COLUMN "storeId" SET DATA TYPE UUID USING "storeId"::uuid;

-- AlterTable
ALTER TABLE "tenant"."Store" ALTER COLUMN "id" SET DATA TYPE UUID USING "id"::uuid,
ALTER COLUMN "tenantId" SET DATA TYPE UUID USING "tenantId"::uuid;

-- AlterTable
ALTER TABLE "tenant"."Subscription" ALTER COLUMN "id" SET DATA TYPE UUID USING "id"::uuid,
ALTER COLUMN "planId" SET DATA TYPE UUID USING "planId"::uuid,
ALTER COLUMN "storeId" SET DATA TYPE UUID USING "storeId"::uuid;

-- AlterTable
ALTER TABLE "tenant"."Tenant" ALTER COLUMN "id" SET DATA TYPE UUID USING "id"::uuid,
ALTER COLUMN "authIdentityId" SET DATA TYPE UUID USING "authIdentityId"::uuid,
ALTER COLUMN "defaultPhoneNumberId" SET DATA TYPE UUID USING "defaultPhoneNumberId"::uuid,
ALTER COLUMN "defaultShippingAddressId" SET DATA TYPE UUID USING "defaultShippingAddressId"::uuid,
ALTER COLUMN "defaultBillingAddressId" SET DATA TYPE UUID USING "defaultBillingAddressId"::uuid,
ALTER COLUMN "defaultStoreId" SET DATA TYPE UUID USING "defaultStoreId"::uuid;

-- AddForeignKey
ALTER TABLE "tenant"."Tenant" ADD CONSTRAINT "Tenant_authIdentityId_fkey" FOREIGN KEY ("authIdentityId") REFERENCES "common"."AuthIdentity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

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
ALTER TABLE "tenant"."Subscription" ADD CONSTRAINT "Subscription_planId_fkey" FOREIGN KEY ("planId") REFERENCES "tenant"."Plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."Employee" ADD CONSTRAINT "Employee_roleId_storeId_fkey" FOREIGN KEY ("roleId", "storeId") REFERENCES "tenant"."EmployeeRole"("id", "storeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."Employee" ADD CONSTRAINT "Employee_authIdentityId_fkey" FOREIGN KEY ("authIdentityId") REFERENCES "common"."AuthIdentity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."Employee" ADD CONSTRAINT "Employee_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "tenant"."Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."EmployeeRole" ADD CONSTRAINT "EmployeeRole_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "tenant"."Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."RoleFeatures" ADD CONSTRAINT "RoleFeatures_roleId_storeId_fkey" FOREIGN KEY ("roleId", "storeId") REFERENCES "tenant"."EmployeeRole"("id", "storeId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."RoleFeatures" ADD CONSTRAINT "RoleFeatures_featureId_fkey" FOREIGN KEY ("featureId") REFERENCES "tenant"."Feature"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."RoleFeatures" ADD CONSTRAINT "RoleFeatures_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "tenant"."Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory"."Warehouse" ADD CONSTRAINT "Warehouse_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "tenant"."Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory"."Warehouse" ADD CONSTRAINT "Warehouse_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "common"."Address"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory"."StockMovement" ADD CONSTRAINT "StockMovement_warehouseId_storeId_fkey" FOREIGN KEY ("warehouseId", "storeId") REFERENCES "inventory"."Warehouse"("id", "storeId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory"."StockMovement" ADD CONSTRAINT "StockMovement_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "tenant"."Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

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
ALTER TABLE "shipping"."ShipmentRate" ADD CONSTRAINT "ShipmentRate_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "geography"."Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipping"."ShipmentRate" ADD CONSTRAINT "ShipmentRate_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "geography"."State"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipping"."ShipmentRate" ADD CONSTRAINT "ShipmentRate_shippingRuleId_storeId_fkey" FOREIGN KEY ("shippingRuleId", "storeId") REFERENCES "shipping"."ShippingRule"("id", "storeId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipping"."ShipmentRate" ADD CONSTRAINT "ShipmentRate_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "tenant"."Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product"."TaxRate" ADD CONSTRAINT "TaxRate_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "tenant"."Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product"."TaxRate" ADD CONSTRAINT "TaxRate_categoryId_storeId_fkey" FOREIGN KEY ("categoryId", "storeId") REFERENCES "product"."Category"("id", "storeId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product"."TaxRate" ADD CONSTRAINT "TaxRate_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "geography"."Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product"."TaxRate" ADD CONSTRAINT "TaxRate_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "geography"."State"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product"."Category" ADD CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "product"."Category"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

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
ALTER TABLE "product"."InstallmentPayment" ADD CONSTRAINT "InstallmentPayment_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "product"."Variant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product"."Sustainability" ADD CONSTRAINT "Sustainability_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product"."Warranty" ADD CONSTRAINT "Warranty_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "product"."Variant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product"."Variant" ADD CONSTRAINT "Variant_productId_storeId_fkey" FOREIGN KEY ("productId", "storeId") REFERENCES "product"."Product"("id", "storeId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product"."Variant" ADD CONSTRAINT "Variant_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "tenant"."Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product"."Attribute" ADD CONSTRAINT "Attribute_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "product"."Variant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product"."Dimension" ADD CONSTRAINT "Dimension_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "product"."Variant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pricing"."Promotion" ADD CONSTRAINT "Promotion_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "tenant"."Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pricing"."Coupon" ADD CONSTRAINT "Coupon_promotionId_storeId_fkey" FOREIGN KEY ("promotionId", "storeId") REFERENCES "pricing"."Promotion"("id", "storeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pricing"."Coupon" ADD CONSTRAINT "Coupon_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customer"."Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

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
ALTER TABLE "sales"."CartItem" ADD CONSTRAINT "CartItem_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "pricing"."Promotion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales"."CartItem" ADD CONSTRAINT "CartItem_variantId_storeId_fkey" FOREIGN KEY ("variantId", "storeId") REFERENCES "product"."Variant"("id", "storeId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales"."CartItem" ADD CONSTRAINT "CartItem_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "tenant"."Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales"."Order" ADD CONSTRAINT "Order_customerId_storeId_fkey" FOREIGN KEY ("customerId", "storeId") REFERENCES "customer"."Customer"("id", "storeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales"."Order" ADD CONSTRAINT "Order_cartId_storeId_fkey" FOREIGN KEY ("cartId", "storeId") REFERENCES "sales"."Cart"("id", "storeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales"."Order" ADD CONSTRAINT "Order_addressId_customerId_fkey" FOREIGN KEY ("addressId", "customerId") REFERENCES "common"."Address"("id", "customerId") ON DELETE RESTRICT ON UPDATE CASCADE;

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
ALTER TABLE "customer"."Customer" ADD CONSTRAINT "Customer_authIdentityId_fkey" FOREIGN KEY ("authIdentityId") REFERENCES "common"."AuthIdentity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

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

-- AddForeignKey
ALTER TABLE "common"."PhoneNumber" ADD CONSTRAINT "PhoneNumber_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customer"."Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "common"."PhoneNumber" ADD CONSTRAINT "PhoneNumber_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "common"."Address" ADD CONSTRAINT "Address_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "geography"."Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "common"."Address" ADD CONSTRAINT "Address_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "geography"."State"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "common"."Address" ADD CONSTRAINT "Address_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"."Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "common"."Address" ADD CONSTRAINT "Address_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customer"."Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "geography"."State" ADD CONSTRAINT "State_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "geography"."Country"("id") ON DELETE CASCADE ON UPDATE CASCADE;

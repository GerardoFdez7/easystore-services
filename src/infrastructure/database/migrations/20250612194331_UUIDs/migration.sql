-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "common";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "customer";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "geography";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "inventory";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "pricing";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "product";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "sales";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "shipping";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "tenant";

-- CreateEnum
CREATE TYPE "tenant"."Currency" AS ENUM ('AFN', 'ALL', 'EUR', 'DZD', 'AOA', 'XCD', 'SAR', 'ARS', 'AMD', 'AWG', 'AUD', 'AZN', 'BSD', 'BDT', 'BBD', 'BHD', 'BZD', 'XOF', 'BMD', 'BYR', 'MMK', 'BOB', 'BOV', 'USD', 'BAM', 'BWP', 'BRL', 'BND', 'BGN', 'BIF', 'BTN', 'INR', 'CVE', 'KHR', 'XAF', 'CAD', 'CLF', 'CLP', 'CNY', 'COP', 'COU', 'KMF', 'CDF', 'CRC', 'HRK', 'CUC', 'CUP', 'ANG', 'DKK', 'EGP', 'SVC', 'AED', 'ERN', 'ETB', 'FJD', 'PHP', 'XDR', 'GMD', 'GEL', 'GHS', 'GIP', 'GNF', 'GTQ', 'GYD', 'HTG', 'HNL', 'HKD', 'HUF', 'IDR', 'IQD', 'NOK', 'ISK', 'KYD', 'FKP', 'SBD', 'ILS', 'JMD', 'JPY', 'GBP', 'JOD', 'KZT', 'KES', 'KGS', 'KWD', 'LSL', 'ZAR', 'LRD', 'LYD', 'CHF', 'LBP', 'MOP', 'MKD', 'MGA', 'MYR', 'MWK', 'MVR', 'MAD', 'MUR', 'MRO', 'MNT', 'MZN', 'MXN', 'MXV', 'NAD', 'NPR', 'NIO', 'NGN', 'NZD', 'XPF', 'OMR', 'XUA', 'PKR', 'PAB', 'PGK', 'PYG', 'PEN', 'PLN', 'QAR', 'LAK', 'VEF', 'CZK', 'KRW', 'MDL', 'KPW', 'DOP', 'IRR', 'TZS', 'SYP', 'RWF', 'RON', 'RUB', 'WST', 'STD', 'RSD', 'SCR', 'SLL', 'SGD', 'XSU', 'SOS', 'LKR', 'SZL', 'SDG', 'SSP', 'SEK', 'CHE', 'CHW', 'SRD', 'THB', 'TWD', 'TJS', 'TOP', 'TTD', 'TMT', 'TRY', 'TND', 'UGX', 'UAH', 'UYI', 'UYU', 'UZS', 'VUV', 'VND', 'YER', 'DJF', 'ZMW', 'ZWL');

-- CreateEnum
CREATE TYPE "tenant"."SubscriptionStatus" AS ENUM ('ACTIVE', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "shipping"."ShippingRuleType" AS ENUM ('METHOD', 'RESTRICTION');

-- CreateEnum
CREATE TYPE "shipping"."CalculationMethod" AS ENUM ('FIXED', 'WEIGHT', 'VOLUME', 'WEIGHT_AND_VOLUME');

-- CreateEnum
CREATE TYPE "product"."ProductType" AS ENUM ('PHYSICAL', 'DIGITAL');

-- CreateEnum
CREATE TYPE "product"."MediaType" AS ENUM ('IMAGE', 'VIDEO');

-- CreateEnum
CREATE TYPE "product"."ProductCondition" AS ENUM ('NEW', 'USED', 'REFURBISHED');

-- CreateEnum
CREATE TYPE "pricing"."PromotionType" AS ENUM ('BUY_X_GET_DISCOUNT_ON_Y', 'STORE_ATTRIBUTE', 'PRODUCT_ATTRIBUTE', 'BUY_X_GET_Y', 'FIXED_GROUP', 'COUPON', 'BUNDLE');

-- CreateEnum
CREATE TYPE "pricing"."PromotionActionType" AS ENUM ('PERCENTAGE', 'FIXED');

-- CreateEnum
CREATE TYPE "sales"."OrderStatus" AS ENUM ('PROCESSING', 'CONFIRMED', 'SHIPPED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "sales"."Status" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "sales"."AcceptedPaymentMethod" AS ENUM ('CREDIT_CARD', 'DEBIT_CARD', 'CASH', 'BANK_TRANSFER', 'PAYPAL', 'PAYMENT_ON_DELIVERY', 'INSTALLMENTS');

-- CreateEnum
CREATE TYPE "common"."AddressTypes" AS ENUM ('SHIPPING', 'BILLING', 'WAREHOUSE');

-- CreateEnum
CREATE TYPE "common"."AccountType" AS ENUM ('TENANT', 'CUSTOMER', 'EMPLOYEE');

-- CreateTable
CREATE TABLE "tenant"."Tenant" (
    "id" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "ownerName" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "logo" TEXT,
    "description" TEXT,
    "currency" "tenant"."Currency" NOT NULL,
    "authIdentityId" TEXT NOT NULL,
    "defaultPhoneNumberId" TEXT,
    "defaultShippingAddressId" TEXT,
    "defaultBillingAddressId" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant"."Subscription" (
    "id" TEXT NOT NULL,
    "status" "tenant"."SubscriptionStatus" NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "planId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant"."Plan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant"."Employee" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "authIdentityId" TEXT NOT NULL,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant"."EmployeeRole" (
    "id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,

    CONSTRAINT "EmployeeRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant"."RoleFeatures" (
    "id" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "featureId" TEXT NOT NULL,

    CONSTRAINT "RoleFeatures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant"."Feature" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Feature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory"."Warehouse" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "addressId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Warehouse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory"."StockMovement" (
    "id" TEXT NOT NULL,
    "deltaQty" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "createdById" TEXT,
    "warehouseId" TEXT NOT NULL,
    "stockPerWarehouseId" TEXT NOT NULL,
    "ocurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StockMovement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory"."StockPerWarehouse" (
    "id" TEXT NOT NULL,
    "qtyAvailable" INTEGER NOT NULL DEFAULT 0,
    "qtyReserved" INTEGER NOT NULL DEFAULT 0,
    "productLocation" TEXT,
    "estimatedReplenishmentDate" TIMESTAMP(3),
    "lotNumber" TEXT,
    "serialNumbers" TEXT[],
    "variantId" TEXT NOT NULL,
    "warehouseId" TEXT NOT NULL,

    CONSTRAINT "StockPerWarehouse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shipping"."ShippingRule" (
    "id" TEXT NOT NULL,
    "type" "shipping"."ShippingRuleType" NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER,
    "conditions" JSONB,
    "tenantId" TEXT NOT NULL,
    "variantId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShippingRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shipping"."ShipmentRate" (
    "id" TEXT NOT NULL,
    "fixedRate" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "calculationMethod" "shipping"."CalculationMethod" NOT NULL,
    "data" JSONB,
    "shippingRuleId" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "stateId" TEXT,
    "tenantId" TEXT NOT NULL,

    CONSTRAINT "ShipmentRate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product"."TaxRate" (
    "id" TEXT NOT NULL,
    "rate" DOUBLE PRECISION NOT NULL,
    "countryId" TEXT NOT NULL,
    "stateId" TEXT,
    "categoryId" TEXT,
    "tenantId" TEXT NOT NULL,

    CONSTRAINT "TaxRate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product"."Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cover" TEXT NOT NULL,
    "description" TEXT,
    "parentId" TEXT,
    "tenantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product"."ProductCategories" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "ProductCategories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product"."Product" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shortDescription" TEXT NOT NULL,
    "longDescription" TEXT,
    "productType" "product"."ProductType" NOT NULL,
    "cover" TEXT NOT NULL,
    "brand" TEXT,
    "manufacturer" TEXT,
    "tags" TEXT[],
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "tenantId" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product"."Media" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "mediaType" "product"."MediaType" NOT NULL,
    "productId" TEXT,
    "variantId" TEXT,

    CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product"."InstallmentPayment" (
    "id" TEXT NOT NULL,
    "months" INTEGER NOT NULL,
    "interestRate" DOUBLE PRECISION NOT NULL,
    "variantId" TEXT NOT NULL,

    CONSTRAINT "InstallmentPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product"."Sustainability" (
    "id" TEXT NOT NULL,
    "certification" TEXT,
    "recycledPercentage" DOUBLE PRECISION NOT NULL,
    "productId" TEXT NOT NULL,

    CONSTRAINT "Sustainability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product"."Warranty" (
    "id" TEXT NOT NULL,
    "months" INTEGER NOT NULL,
    "coverage" TEXT NOT NULL,
    "instructions" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,

    CONSTRAINT "Warranty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product"."Variant" (
    "id" TEXT NOT NULL,
    "price" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "variantCover" TEXT NOT NULL,
    "personalizationOptions" TEXT[],
    "weight" DOUBLE PRECISION,
    "condition" "product"."ProductCondition" NOT NULL,
    "upc" TEXT,
    "ean" TEXT,
    "isbn" TEXT,
    "barcode" TEXT,
    "sku" TEXT,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "productId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Variant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product"."Attribute" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,

    CONSTRAINT "Attribute_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product"."Dimension" (
    "id" TEXT NOT NULL,
    "length" DOUBLE PRECISION NOT NULL,
    "width" DOUBLE PRECISION NOT NULL,
    "height" DOUBLE PRECISION NOT NULL,
    "variantId" TEXT NOT NULL,

    CONSTRAINT "Dimension_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pricing"."Promotion" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "pricing"."PromotionType" NOT NULL,
    "actionType" "pricing"."PromotionActionType",
    "actionValue" DECIMAL(65,30),
    "isStackable" BOOLEAN NOT NULL DEFAULT false,
    "params" JSONB NOT NULL,
    "priority" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tenantId" TEXT NOT NULL,

    CONSTRAINT "Promotion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pricing"."Coupon" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "usageLimit" INTEGER,
    "perCustomerLimit" INTEGER NOT NULL DEFAULT 1,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "promotionId" TEXT NOT NULL,
    "customerId" TEXT,
    "tenantId" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Coupon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pricing"."CouponUsage" (
    "id" TEXT NOT NULL,
    "couponId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "usedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CouponUsage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pricing"."CartPromotions" (
    "id" TEXT NOT NULL,
    "cartId" TEXT NOT NULL,
    "promotionId" TEXT NOT NULL,

    CONSTRAINT "CartPromotions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pricing"."OrderPromotions" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "promotionId" TEXT NOT NULL,

    CONSTRAINT "OrderPromotions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sales"."Cart" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,

    CONSTRAINT "Cart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sales"."CartItem" (
    "id" TEXT NOT NULL,
    "qty" INTEGER NOT NULL,
    "variantId" TEXT NOT NULL,
    "cartId" TEXT NOT NULL,
    "promotionId" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CartItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sales"."Order" (
    "id" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "status" "sales"."OrderStatus" NOT NULL,
    "totalAmount" DECIMAL(65,30) NOT NULL,
    "customerId" TEXT NOT NULL,
    "cartId" TEXT NOT NULL,
    "addressId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sales"."OrderDetail" (
    "id" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "qty" INTEGER NOT NULL,
    "unitPrice" DECIMAL(65,30) NOT NULL,
    "subtotal" DECIMAL(65,30) NOT NULL,
    "orderId" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrderDetail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sales"."Return" (
    "id" TEXT NOT NULL,
    "returnReason" TEXT NOT NULL,
    "refundAmount" DECIMAL(65,30) NOT NULL,
    "variantId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Return_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sales"."Payment" (
    "id" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "status" "sales"."Status" NOT NULL,
    "transactionId" TEXT,
    "orderId" TEXT NOT NULL,
    "paymentMethodId" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sales"."PaymentMethod" (
    "id" TEXT NOT NULL,
    "acceptedPaymentMethods" "sales"."AcceptedPaymentMethod"[],
    "tenantId" TEXT,
    "customerId" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentMethod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer"."Customer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "authIdentityId" TEXT NOT NULL,
    "defaultPhoneNumberId" TEXT,
    "defaultShippingAddressId" TEXT,
    "defaultBillingAddressId" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer"."WishList" (
    "id" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WishList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer"."CustomerReviewProduct" (
    "id" TEXT NOT NULL,
    "ratingCount" DOUBLE PRECISION NOT NULL,
    "comment" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CustomerReviewProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "common"."PhoneNumber" (
    "id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "customerId" TEXT,
    "tenantId" TEXT,

    CONSTRAINT "PhoneNumber_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "common"."Address" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "addressLine1" TEXT NOT NULL,
    "addressLine2" TEXT,
    "postalCode" TEXT,
    "city" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "addressType" "common"."AddressTypes" NOT NULL,
    "deliveryNum" TEXT,
    "tenantId" TEXT,
    "customerId" TEXT,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "common"."AuthIdentity" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "accountType" "common"."AccountType" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "lastLoginAt" TIMESTAMP(3),
    "failedAttempts" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuthIdentity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "geography"."Country" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,

    CONSTRAINT "Country_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "geography"."State" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,

    CONSTRAINT "State_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_businessName_key" ON "tenant"."Tenant"("businessName");

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_domain_key" ON "tenant"."Tenant"("domain");

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_authIdentityId_key" ON "tenant"."Tenant"("authIdentityId");

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_defaultPhoneNumberId_key" ON "tenant"."Tenant"("defaultPhoneNumberId");

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_defaultShippingAddressId_key" ON "tenant"."Tenant"("defaultShippingAddressId");

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_defaultBillingAddressId_key" ON "tenant"."Tenant"("defaultBillingAddressId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_tenantId_key" ON "tenant"."Subscription"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Plan_name_key" ON "tenant"."Plan"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_authIdentityId_key" ON "tenant"."Employee"("authIdentityId");

-- CreateIndex
CREATE UNIQUE INDEX "Feature_code_key" ON "tenant"."Feature"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Warehouse_tenantId_name_key" ON "inventory"."Warehouse"("tenantId", "name");

-- CreateIndex
CREATE INDEX "ShippingRule_tenantId_type_idx" ON "shipping"."ShippingRule"("tenantId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "ShippingRule_tenantId_slug_key" ON "shipping"."ShippingRule"("tenantId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "ShippingRule_tenantId_priority_key" ON "shipping"."ShippingRule"("tenantId", "priority");

-- CreateIndex
CREATE INDEX "ShipmentRate_tenantId_shippingRuleId_idx" ON "shipping"."ShipmentRate"("tenantId", "shippingRuleId");

-- CreateIndex
CREATE UNIQUE INDEX "ShipmentRate_tenantId_shippingRuleId_countryId_stateId_key" ON "shipping"."ShipmentRate"("tenantId", "shippingRuleId", "countryId", "stateId");

-- CreateIndex
CREATE UNIQUE INDEX "TaxRate_tenantId_countryId_stateId_categoryId_key" ON "product"."TaxRate"("tenantId", "countryId", "stateId", "categoryId");

-- CreateIndex
CREATE INDEX "Category_parentId_idx" ON "product"."Category"("parentId");

-- CreateIndex
CREATE UNIQUE INDEX "Category_tenantId_name_key" ON "product"."Category"("tenantId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Product_tenantId_name_key" ON "product"."Product"("tenantId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Media_productId_position_key" ON "product"."Media"("productId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "Media_variantId_position_key" ON "product"."Media"("variantId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "Variant_upc_key" ON "product"."Variant"("upc");

-- CreateIndex
CREATE UNIQUE INDEX "Variant_ean_key" ON "product"."Variant"("ean");

-- CreateIndex
CREATE UNIQUE INDEX "Variant_isbn_key" ON "product"."Variant"("isbn");

-- CreateIndex
CREATE UNIQUE INDEX "Variant_tenantId_sku_key" ON "product"."Variant"("tenantId", "sku");

-- CreateIndex
CREATE UNIQUE INDEX "Variant_tenantId_barcode_key" ON "product"."Variant"("tenantId", "barcode");

-- CreateIndex
CREATE UNIQUE INDEX "Dimension_variantId_key" ON "product"."Dimension"("variantId");

-- CreateIndex
CREATE UNIQUE INDEX "Promotion_tenantId_name_key" ON "pricing"."Promotion"("tenantId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Promotion_tenantId_priority_key" ON "pricing"."Promotion"("tenantId", "priority");

-- CreateIndex
CREATE UNIQUE INDEX "Coupon_tenantId_code_key" ON "pricing"."Coupon"("tenantId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "CouponUsage_orderId_couponId_key" ON "pricing"."CouponUsage"("orderId", "couponId");

-- CreateIndex
CREATE UNIQUE INDEX "Order_tenantId_orderNumber_key" ON "sales"."Order"("tenantId", "orderNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_authIdentityId_key" ON "customer"."Customer"("authIdentityId");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_defaultPhoneNumberId_key" ON "customer"."Customer"("defaultPhoneNumberId");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_defaultShippingAddressId_key" ON "customer"."Customer"("defaultShippingAddressId");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_defaultBillingAddressId_key" ON "customer"."Customer"("defaultBillingAddressId");

-- CreateIndex
CREATE INDEX "AuthIdentity_email_accountType_idx" ON "common"."AuthIdentity"("email", "accountType");

-- AddForeignKey
ALTER TABLE "tenant"."Tenant" ADD CONSTRAINT "Tenant_authIdentityId_fkey" FOREIGN KEY ("authIdentityId") REFERENCES "common"."AuthIdentity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."Tenant" ADD CONSTRAINT "Tenant_defaultPhoneNumberId_fkey" FOREIGN KEY ("defaultPhoneNumberId") REFERENCES "common"."PhoneNumber"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."Tenant" ADD CONSTRAINT "Tenant_defaultShippingAddressId_fkey" FOREIGN KEY ("defaultShippingAddressId") REFERENCES "common"."Address"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."Tenant" ADD CONSTRAINT "Tenant_defaultBillingAddressId_fkey" FOREIGN KEY ("defaultBillingAddressId") REFERENCES "common"."Address"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."Subscription" ADD CONSTRAINT "Subscription_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"."Tenant"("id") ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "tenant"."Subscription" ADD CONSTRAINT "Subscription_planId_fkey" FOREIGN KEY ("planId") REFERENCES "tenant"."Plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."Employee" ADD CONSTRAINT "Employee_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "tenant"."EmployeeRole"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."Employee" ADD CONSTRAINT "Employee_authIdentityId_fkey" FOREIGN KEY ("authIdentityId") REFERENCES "common"."AuthIdentity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."EmployeeRole" ADD CONSTRAINT "EmployeeRole_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."RoleFeatures" ADD CONSTRAINT "RoleFeatures_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "tenant"."EmployeeRole"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."RoleFeatures" ADD CONSTRAINT "RoleFeatures_featureId_fkey" FOREIGN KEY ("featureId") REFERENCES "tenant"."Feature"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory"."Warehouse" ADD CONSTRAINT "Warehouse_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory"."Warehouse" ADD CONSTRAINT "Warehouse_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "common"."Address"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory"."StockMovement" ADD CONSTRAINT "StockMovement_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "inventory"."Warehouse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory"."StockMovement" ADD CONSTRAINT "StockMovement_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "tenant"."Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory"."StockMovement" ADD CONSTRAINT "StockMovement_stockPerWarehouseId_fkey" FOREIGN KEY ("stockPerWarehouseId") REFERENCES "inventory"."StockPerWarehouse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory"."StockPerWarehouse" ADD CONSTRAINT "StockPerWarehouse_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "product"."Variant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory"."StockPerWarehouse" ADD CONSTRAINT "StockPerWarehouse_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "inventory"."Warehouse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipping"."ShippingRule" ADD CONSTRAINT "ShippingRule_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipping"."ShippingRule" ADD CONSTRAINT "ShippingRule_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "product"."Variant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipping"."ShipmentRate" ADD CONSTRAINT "ShipmentRate_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "geography"."Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipping"."ShipmentRate" ADD CONSTRAINT "ShipmentRate_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "geography"."State"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipping"."ShipmentRate" ADD CONSTRAINT "ShipmentRate_shippingRuleId_fkey" FOREIGN KEY ("shippingRuleId") REFERENCES "shipping"."ShippingRule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipping"."ShipmentRate" ADD CONSTRAINT "ShipmentRate_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product"."TaxRate" ADD CONSTRAINT "TaxRate_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product"."TaxRate" ADD CONSTRAINT "TaxRate_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "product"."Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product"."TaxRate" ADD CONSTRAINT "TaxRate_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "geography"."Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product"."TaxRate" ADD CONSTRAINT "TaxRate_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "geography"."State"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product"."Category" ADD CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "product"."Category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "product"."Category" ADD CONSTRAINT "Category_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product"."ProductCategories" ADD CONSTRAINT "ProductCategories_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product"."ProductCategories" ADD CONSTRAINT "ProductCategories_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "product"."Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product"."Product" ADD CONSTRAINT "Product_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product"."Media" ADD CONSTRAINT "Media_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product"."Media" ADD CONSTRAINT "Media_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "product"."Variant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product"."InstallmentPayment" ADD CONSTRAINT "InstallmentPayment_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "product"."Variant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product"."Sustainability" ADD CONSTRAINT "Sustainability_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product"."Warranty" ADD CONSTRAINT "Warranty_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "product"."Variant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product"."Variant" ADD CONSTRAINT "Variant_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product"."Variant" ADD CONSTRAINT "Variant_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product"."Attribute" ADD CONSTRAINT "Attribute_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "product"."Variant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product"."Dimension" ADD CONSTRAINT "Dimension_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "product"."Variant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pricing"."Promotion" ADD CONSTRAINT "Promotion_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pricing"."Coupon" ADD CONSTRAINT "Coupon_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "pricing"."Promotion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pricing"."Coupon" ADD CONSTRAINT "Coupon_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customer"."Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pricing"."Coupon" ADD CONSTRAINT "Coupon_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pricing"."CouponUsage" ADD CONSTRAINT "CouponUsage_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "pricing"."Coupon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pricing"."CouponUsage" ADD CONSTRAINT "CouponUsage_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "sales"."Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pricing"."CartPromotions" ADD CONSTRAINT "CartPromotions_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "sales"."Cart"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pricing"."CartPromotions" ADD CONSTRAINT "CartPromotions_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "pricing"."Promotion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pricing"."OrderPromotions" ADD CONSTRAINT "OrderPromotions_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "sales"."Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pricing"."OrderPromotions" ADD CONSTRAINT "OrderPromotions_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "pricing"."Promotion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales"."Cart" ADD CONSTRAINT "Cart_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customer"."Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales"."CartItem" ADD CONSTRAINT "CartItem_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "sales"."Cart"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales"."CartItem" ADD CONSTRAINT "CartItem_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "pricing"."Promotion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales"."CartItem" ADD CONSTRAINT "CartItem_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "product"."Variant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales"."Order" ADD CONSTRAINT "Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customer"."Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales"."Order" ADD CONSTRAINT "Order_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "sales"."Cart"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales"."Order" ADD CONSTRAINT "Order_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "common"."Address"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales"."Order" ADD CONSTRAINT "Order_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"."Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

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
ALTER TABLE "sales"."Payment" ADD CONSTRAINT "Payment_paymentMethodId_fkey" FOREIGN KEY ("paymentMethodId") REFERENCES "sales"."PaymentMethod"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales"."Payment" ADD CONSTRAINT "Payment_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "tenant"."Subscription"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales"."PaymentMethod" ADD CONSTRAINT "PaymentMethod_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales"."PaymentMethod" ADD CONSTRAINT "PaymentMethod_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customer"."Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer"."Customer" ADD CONSTRAINT "Customer_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer"."Customer" ADD CONSTRAINT "Customer_authIdentityId_fkey" FOREIGN KEY ("authIdentityId") REFERENCES "common"."AuthIdentity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer"."Customer" ADD CONSTRAINT "Customer_defaultPhoneNumberId_fkey" FOREIGN KEY ("defaultPhoneNumberId") REFERENCES "common"."PhoneNumber"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer"."Customer" ADD CONSTRAINT "Customer_defaultShippingAddressId_fkey" FOREIGN KEY ("defaultShippingAddressId") REFERENCES "common"."Address"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer"."Customer" ADD CONSTRAINT "Customer_defaultBillingAddressId_fkey" FOREIGN KEY ("defaultBillingAddressId") REFERENCES "common"."Address"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer"."WishList" ADD CONSTRAINT "WishList_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customer"."Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer"."WishList" ADD CONSTRAINT "WishList_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "product"."Variant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer"."CustomerReviewProduct" ADD CONSTRAINT "CustomerReviewProduct_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customer"."Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer"."CustomerReviewProduct" ADD CONSTRAINT "CustomerReviewProduct_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "product"."Variant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "common"."PhoneNumber" ADD CONSTRAINT "PhoneNumber_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customer"."Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "common"."PhoneNumber" ADD CONSTRAINT "PhoneNumber_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "common"."Address" ADD CONSTRAINT "Address_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "geography"."Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "common"."Address" ADD CONSTRAINT "Address_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"."Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "common"."Address" ADD CONSTRAINT "Address_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customer"."Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "geography"."State" ADD CONSTRAINT "State_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "geography"."Country"("id") ON DELETE CASCADE ON UPDATE CASCADE;

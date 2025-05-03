-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "common";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "customer";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "geography";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "inventory";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "marketing";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "sales";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "tenant";

-- CreateEnum
CREATE TYPE "tenant"."SubscriptionStatus" AS ENUM ('ACTIVE', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "marketing"."PromotionType" AS ENUM ('PERCENTAGE', 'FIXEDGROUP', 'BUNDLE', 'BUY_X_GET_Y');

-- CreateEnum
CREATE TYPE "marketing"."Action" AS ENUM ('APPLY_PROMO', 'REVERT_PROMO');

-- CreateEnum
CREATE TYPE "marketing"."TaskStatus" AS ENUM ('PENDING', 'DONE', 'FAILED');

-- CreateEnum
CREATE TYPE "sales"."OrderStatus" AS ENUM ('PROCESSING', 'CONFIRMED', 'SHIPPED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "common"."AddressTypes" AS ENUM ('SHIPPING', 'BILLING', 'WAREHOUSE');

-- CreateTable
CREATE TABLE "tenant"."Tenant" (
    "id" SERIAL NOT NULL,
    "businessName" TEXT NOT NULL,
    "ownerName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant"."Subscription" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER,
    "tenantId" INTEGER,
    "status" "tenant"."SubscriptionStatus" NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "planId" INTEGER,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant"."Plan" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant"."EmployeeRole" (
    "id" SERIAL NOT NULL,
    "role" TEXT NOT NULL,
    "tenantId" INTEGER NOT NULL,

    CONSTRAINT "EmployeeRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant"."Feature" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "employeeRoleId" INTEGER NOT NULL,

    CONSTRAINT "Feature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant"."Employee" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "roleId" INTEGER NOT NULL,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory"."Warehouse" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "addressId" INTEGER NOT NULL,
    "tenantId" INTEGER NOT NULL,

    CONSTRAINT "Warehouse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory"."StockMovement" (
    "id" SERIAL NOT NULL,
    "productId" TEXT NOT NULL,
    "variantAttributes" JSONB NOT NULL,
    "warehouseId" INTEGER NOT NULL,
    "deltaQty" INTEGER NOT NULL,
    "reason" BYTEA NOT NULL,
    "createdById" INTEGER,
    "ocurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StockMovement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "marketing"."Promotion" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "marketing"."PromotionType" NOT NULL,
    "params" JSONB NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Promotion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "marketing"."PromotionProduct" (
    "promotionId" INTEGER NOT NULL,
    "productId" TEXT NOT NULL,
    "bundleQty" INTEGER NOT NULL,

    CONSTRAINT "PromotionProduct_pkey" PRIMARY KEY ("promotionId","productId")
);

-- CreateTable
CREATE TABLE "marketing"."PromotionCategory" (
    "promotionId" INTEGER NOT NULL,
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "PromotionCategory_pkey" PRIMARY KEY ("promotionId","categoryId")
);

-- CreateTable
CREATE TABLE "marketing"."PromotionBuyGet" (
    "promotionId" INTEGER NOT NULL,
    "buyProductId" TEXT NOT NULL,
    "getProductId" TEXT NOT NULL,

    CONSTRAINT "PromotionBuyGet_pkey" PRIMARY KEY ("promotionId","buyProductId","getProductId")
);

-- CreateTable
CREATE TABLE "marketing"."PromotionBuyGetCategory" (
    "promotionId" INTEGER NOT NULL,
    "buyCategoryId" TEXT NOT NULL,
    "getCategoryId" TEXT NOT NULL,

    CONSTRAINT "PromotionBuyGetCategory_pkey" PRIMARY KEY ("promotionId","buyCategoryId","getCategoryId")
);

-- CreateTable
CREATE TABLE "marketing"."ScheduleTask" (
    "id" SERIAL NOT NULL,
    "promotionId" INTEGER NOT NULL,
    "type" "marketing"."Action" NOT NULL,
    "payload" JSONB NOT NULL,
    "runAt" TIMESTAMP(3) NOT NULL,
    "status" "marketing"."TaskStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScheduleTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "marketing"."Coupon" (
    "id" SERIAL NOT NULL,
    "promotionId" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "userId" INTEGER,
    "usageLimit" INTEGER,
    "perUserLimit" INTEGER NOT NULL DEFAULT 1,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Coupon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "marketing"."CouponUsage" (
    "id" SERIAL NOT NULL,
    "couponId" INTEGER NOT NULL,
    "orderId" INTEGER NOT NULL,
    "usedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CouponUsage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sales"."Cart" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "couponId" INTEGER,
    "promotionId" INTEGER,

    CONSTRAINT "Cart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sales"."CartItem" (
    "id" SERIAL NOT NULL,
    "cartId" INTEGER NOT NULL,
    "productId" TEXT NOT NULL,
    "qty" INTEGER NOT NULL,
    "promotionId" INTEGER,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CartItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sales"."Order" (
    "id" SERIAL NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "cartId" INTEGER NOT NULL,
    "orderDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "sales"."OrderStatus" NOT NULL,
    "totalAmount" DECIMAL(65,30) NOT NULL,
    "addressId" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sales"."OrderDetail" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "productId" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "qty" INTEGER NOT NULL,
    "unitPrice" DECIMAL(65,30) NOT NULL,
    "subtotal" DECIMAL(65,30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrderDetail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sales"."Return" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "productId" TEXT NOT NULL,
    "returnReason" TEXT NOT NULL,
    "refundAmount" DECIMAL(65,30) NOT NULL,
    "returnDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Return_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sales"."Payment" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "paymentMethodId" INTEGER NOT NULL,
    "paymentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sales"."PaymentMethod" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentMethod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer"."User" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "registrationDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer"."WishList" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "productId" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WishList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer"."UserReviewProduct" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "productId" TEXT NOT NULL,
    "ratingCount" DOUBLE PRECISION NOT NULL,
    "comment" TEXT NOT NULL,
    "createdDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserReviewProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "common"."PhoneNumber" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER,
    "tenantId" INTEGER,
    "number" TEXT NOT NULL,
    "defaultId" INTEGER,

    CONSTRAINT "PhoneNumber_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "common"."Address" (
    "id" SERIAL NOT NULL,
    "defaultId" INTEGER,
    "name" TEXT NOT NULL,
    "deliveryNum" INTEGER NOT NULL,
    "addressLine1" TEXT NOT NULL,
    "addressLine2" TEXT,
    "postalCode" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "countryId" INTEGER NOT NULL,
    "addressType" "common"."AddressTypes" NOT NULL,
    "tenantId" INTEGER,
    "userId" INTEGER,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "geography"."Country" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,

    CONSTRAINT "Country_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "geography"."State" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "countryId" INTEGER NOT NULL,

    CONSTRAINT "State_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_businessName_key" ON "tenant"."Tenant"("businessName");

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_email_key" ON "tenant"."Tenant"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_userId_key" ON "tenant"."Subscription"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_tenantId_key" ON "tenant"."Subscription"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Plan_name_key" ON "tenant"."Plan"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Feature_code_key" ON "tenant"."Feature"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_email_key" ON "tenant"."Employee"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Coupon_code_key" ON "marketing"."Coupon"("code");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "customer"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "PhoneNumber_defaultId_key" ON "common"."PhoneNumber"("defaultId");

-- CreateIndex
CREATE UNIQUE INDEX "Address_defaultId_key" ON "common"."Address"("defaultId");

-- AddForeignKey
ALTER TABLE "tenant"."Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "customer"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."Subscription" ADD CONSTRAINT "Subscription_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"."Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."Subscription" ADD CONSTRAINT "Subscription_planId_fkey" FOREIGN KEY ("planId") REFERENCES "tenant"."Plan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."EmployeeRole" ADD CONSTRAINT "EmployeeRole_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"."Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."Feature" ADD CONSTRAINT "Feature_employeeRoleId_fkey" FOREIGN KEY ("employeeRoleId") REFERENCES "tenant"."EmployeeRole"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."Employee" ADD CONSTRAINT "Employee_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "tenant"."EmployeeRole"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory"."Warehouse" ADD CONSTRAINT "Warehouse_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "common"."Address"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory"."Warehouse" ADD CONSTRAINT "Warehouse_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"."Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory"."StockMovement" ADD CONSTRAINT "StockMovement_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "inventory"."Warehouse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory"."StockMovement" ADD CONSTRAINT "StockMovement_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "tenant"."Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marketing"."Promotion" ADD CONSTRAINT "Promotion_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"."Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marketing"."PromotionProduct" ADD CONSTRAINT "PromotionProduct_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "marketing"."Promotion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marketing"."PromotionCategory" ADD CONSTRAINT "PromotionCategory_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "marketing"."Promotion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marketing"."PromotionBuyGet" ADD CONSTRAINT "PromotionBuyGet_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "marketing"."Promotion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marketing"."PromotionBuyGetCategory" ADD CONSTRAINT "PromotionBuyGetCategory_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "marketing"."Promotion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marketing"."ScheduleTask" ADD CONSTRAINT "ScheduleTask_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "marketing"."Promotion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marketing"."Coupon" ADD CONSTRAINT "Coupon_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "marketing"."Promotion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marketing"."Coupon" ADD CONSTRAINT "Coupon_userId_fkey" FOREIGN KEY ("userId") REFERENCES "customer"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marketing"."CouponUsage" ADD CONSTRAINT "CouponUsage_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "marketing"."Coupon"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marketing"."CouponUsage" ADD CONSTRAINT "CouponUsage_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "sales"."Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales"."Cart" ADD CONSTRAINT "Cart_userId_fkey" FOREIGN KEY ("userId") REFERENCES "customer"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales"."Cart" ADD CONSTRAINT "Cart_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "marketing"."Coupon"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales"."Cart" ADD CONSTRAINT "Cart_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "marketing"."Promotion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales"."CartItem" ADD CONSTRAINT "CartItem_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "sales"."Cart"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales"."CartItem" ADD CONSTRAINT "CartItem_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "marketing"."Promotion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales"."Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "customer"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales"."Order" ADD CONSTRAINT "Order_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "sales"."Cart"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales"."Order" ADD CONSTRAINT "Order_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "common"."Address"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales"."OrderDetail" ADD CONSTRAINT "OrderDetail_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "sales"."Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales"."Return" ADD CONSTRAINT "Return_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "sales"."Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales"."Payment" ADD CONSTRAINT "Payment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "sales"."Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales"."Payment" ADD CONSTRAINT "Payment_paymentMethodId_fkey" FOREIGN KEY ("paymentMethodId") REFERENCES "sales"."PaymentMethod"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales"."PaymentMethod" ADD CONSTRAINT "PaymentMethod_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"."Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales"."PaymentMethod" ADD CONSTRAINT "PaymentMethod_userId_fkey" FOREIGN KEY ("userId") REFERENCES "customer"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer"."User" ADD CONSTRAINT "User_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"."Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer"."WishList" ADD CONSTRAINT "WishList_userId_fkey" FOREIGN KEY ("userId") REFERENCES "customer"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer"."UserReviewProduct" ADD CONSTRAINT "UserReviewProduct_userId_fkey" FOREIGN KEY ("userId") REFERENCES "customer"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "common"."PhoneNumber" ADD CONSTRAINT "PhoneNumber_userId_fkey" FOREIGN KEY ("userId") REFERENCES "customer"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "common"."PhoneNumber" ADD CONSTRAINT "PhoneNumber_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"."Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "common"."PhoneNumber" ADD CONSTRAINT "PhoneNumber_defaultId_fkey" FOREIGN KEY ("defaultId") REFERENCES "common"."PhoneNumber"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "common"."Address" ADD CONSTRAINT "Address_defaultId_fkey" FOREIGN KEY ("defaultId") REFERENCES "common"."Address"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "common"."Address" ADD CONSTRAINT "Address_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "geography"."Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "common"."Address" ADD CONSTRAINT "Address_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"."Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "common"."Address" ADD CONSTRAINT "Address_userId_fkey" FOREIGN KEY ("userId") REFERENCES "customer"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "geography"."State" ADD CONSTRAINT "State_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "geography"."Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

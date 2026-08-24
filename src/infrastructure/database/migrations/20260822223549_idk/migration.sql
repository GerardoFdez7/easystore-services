-- CreateIndex
CREATE INDEX "Address_countryId_idx" ON "common"."Address"("countryId");

-- CreateIndex
CREATE INDEX "Address_stateId_idx" ON "common"."Address"("stateId");

-- CreateIndex
CREATE INDEX "PhoneNumber_customerId_idx" ON "common"."PhoneNumber"("customerId");

-- CreateIndex
CREATE INDEX "PhoneNumber_tenantId_idx" ON "common"."PhoneNumber"("tenantId");

-- CreateIndex
CREATE INDEX "Customer_tenantId_idx" ON "customer"."Customer"("tenantId");

-- CreateIndex
CREATE INDEX "CustomerReviewProduct_customerId_idx" ON "customer"."CustomerReviewProduct"("customerId");

-- CreateIndex
CREATE INDEX "CustomerReviewProduct_variantId_idx" ON "customer"."CustomerReviewProduct"("variantId");

-- CreateIndex
CREATE INDEX "WishList_customerId_idx" ON "customer"."WishList"("customerId");

-- CreateIndex
CREATE INDEX "WishList_variantId_idx" ON "customer"."WishList"("variantId");

-- CreateIndex
CREATE INDEX "State_countryId_idx" ON "geography"."State"("countryId");

-- CreateIndex
CREATE INDEX "StockMovement_createdById_idx" ON "inventory"."StockMovement"("createdById");

-- CreateIndex
CREATE INDEX "StockMovement_warehouseId_idx" ON "inventory"."StockMovement"("warehouseId");

-- CreateIndex
CREATE INDEX "StockMovement_stockPerWarehouseId_idx" ON "inventory"."StockMovement"("stockPerWarehouseId");

-- CreateIndex
CREATE INDEX "StockPerWarehouse_variantId_idx" ON "inventory"."StockPerWarehouse"("variantId");

-- CreateIndex
CREATE INDEX "Warehouse_addressId_idx" ON "inventory"."Warehouse"("addressId");

-- CreateIndex
CREATE INDEX "CartPromotions_cartId_idx" ON "pricing"."CartPromotions"("cartId");

-- CreateIndex
CREATE INDEX "CartPromotions_promotionId_idx" ON "pricing"."CartPromotions"("promotionId");

-- CreateIndex
CREATE INDEX "Coupon_promotionId_idx" ON "pricing"."Coupon"("promotionId");

-- CreateIndex
CREATE INDEX "Coupon_customerId_idx" ON "pricing"."Coupon"("customerId");

-- CreateIndex
CREATE INDEX "CouponUsage_couponId_idx" ON "pricing"."CouponUsage"("couponId");

-- CreateIndex
CREATE INDEX "OrderPromotions_orderId_idx" ON "pricing"."OrderPromotions"("orderId");

-- CreateIndex
CREATE INDEX "OrderPromotions_promotionId_idx" ON "pricing"."OrderPromotions"("promotionId");

-- CreateIndex
CREATE INDEX "Attribute_variantId_idx" ON "product"."Attribute"("variantId");

-- CreateIndex
CREATE INDEX "InstallmentPayment_variantId_idx" ON "product"."InstallmentPayment"("variantId");

-- CreateIndex
CREATE INDEX "ProductCategories_productId_idx" ON "product"."ProductCategories"("productId");

-- CreateIndex
CREATE INDEX "ProductCategories_categoryId_idx" ON "product"."ProductCategories"("categoryId");

-- CreateIndex
CREATE INDEX "Sustainability_productId_idx" ON "product"."Sustainability"("productId");

-- CreateIndex
CREATE INDEX "TaxRate_countryId_idx" ON "product"."TaxRate"("countryId");

-- CreateIndex
CREATE INDEX "TaxRate_stateId_idx" ON "product"."TaxRate"("stateId");

-- CreateIndex
CREATE INDEX "TaxRate_categoryId_idx" ON "product"."TaxRate"("categoryId");

-- CreateIndex
CREATE INDEX "Variant_productId_idx" ON "product"."Variant"("productId");

-- CreateIndex
CREATE INDEX "Warranty_variantId_idx" ON "product"."Warranty"("variantId");

-- CreateIndex
CREATE INDEX "Cart_customerId_idx" ON "sales"."Cart"("customerId");

-- CreateIndex
CREATE INDEX "CartItem_cartId_idx" ON "sales"."CartItem"("cartId");

-- CreateIndex
CREATE INDEX "CartItem_promotionId_idx" ON "sales"."CartItem"("promotionId");

-- CreateIndex
CREATE INDEX "CartItem_variantId_idx" ON "sales"."CartItem"("variantId");

-- CreateIndex
CREATE INDEX "Order_customerId_idx" ON "sales"."Order"("customerId");

-- CreateIndex
CREATE INDEX "Order_cartId_idx" ON "sales"."Order"("cartId");

-- CreateIndex
CREATE INDEX "Order_addressId_idx" ON "sales"."Order"("addressId");

-- CreateIndex
CREATE INDEX "OrderDetail_orderId_idx" ON "sales"."OrderDetail"("orderId");

-- CreateIndex
CREATE INDEX "OrderDetail_variantId_idx" ON "sales"."OrderDetail"("variantId");

-- CreateIndex
CREATE INDEX "Payment_orderId_idx" ON "sales"."Payment"("orderId");

-- CreateIndex
CREATE INDEX "Payment_paymentMethodId_idx" ON "sales"."Payment"("paymentMethodId");

-- CreateIndex
CREATE INDEX "Payment_subscriptionId_idx" ON "sales"."Payment"("subscriptionId");

-- CreateIndex
CREATE INDEX "PaymentMethod_tenantId_idx" ON "sales"."PaymentMethod"("tenantId");

-- CreateIndex
CREATE INDEX "PaymentMethod_customerId_idx" ON "sales"."PaymentMethod"("customerId");

-- CreateIndex
CREATE INDEX "Return_orderId_idx" ON "sales"."Return"("orderId");

-- CreateIndex
CREATE INDEX "Return_variantId_idx" ON "sales"."Return"("variantId");

-- CreateIndex
CREATE INDEX "ShipmentRate_countryId_idx" ON "shipping"."ShipmentRate"("countryId");

-- CreateIndex
CREATE INDEX "ShipmentRate_stateId_idx" ON "shipping"."ShipmentRate"("stateId");

-- CreateIndex
CREATE INDEX "ShippingRule_variantId_idx" ON "shipping"."ShippingRule"("variantId");

-- CreateIndex
CREATE INDEX "Employee_roleId_idx" ON "tenant"."Employee"("roleId");

-- CreateIndex
CREATE INDEX "EmployeeRole_tenantId_idx" ON "tenant"."EmployeeRole"("tenantId");

-- CreateIndex
CREATE INDEX "RoleFeatures_roleId_idx" ON "tenant"."RoleFeatures"("roleId");

-- CreateIndex
CREATE INDEX "RoleFeatures_featureId_idx" ON "tenant"."RoleFeatures"("featureId");

-- CreateIndex
CREATE INDEX "Subscription_planId_idx" ON "tenant"."Subscription"("planId");

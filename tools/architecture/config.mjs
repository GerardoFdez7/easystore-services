export const aggregateRoots = {
  address: 'address/address.entity.ts',
  authentication: 'auth/authentication.entity.ts',
  cart: 'cart/cart.entity.ts',
  category: 'category/category.entity.ts',
  inventory: 'warehouse/warehouse.entity.ts',
  product: 'product/product.entity.ts',
  tenant: 'tenant/tenant.entity.ts',
  store: 'store/store.entity.ts',
  customer: 'customer/customer.entity.ts',
  payment: 'payment/payment.entity.ts',
  order: 'order/order.entity.ts',
  shipping: 'shipping/shipping.entity.ts',
  analytics: 'dashboard/dashboard.entity.ts',
};

// Commerce records are isolated by their selected Store. Tenant remains the
// owner/account scope and is intentionally not included here.
export const storeScopedDomains = [
  'analytics', 'cart', 'category', 'customer', 'inventory',
  'product', 'payment', 'order', 'shipping',
];

// Address is Tenant/customer-owned. These Inventory boundary contracts carry a
// trusted tenantId only to validate that shared Address ownership; it is never
// substituted for the Store scope of Warehouse/stock records.
export const tenantScopedAddressCapabilityExceptions = {
  'inventory/application/ports/address.port.ts': 'Tenant-qualified shared Address lookup.',
  'inventory/infrastructure/adapters/address.adapter.ts': 'Adapter to the shared Address capability.',
  'inventory/application/commands/create/warehouse/create-warehouse.dto.ts': 'Trusted tenantId validates the Tenant-owned Address.',
  'inventory/application/commands/create/warehouse/create-warehouse.handler.ts': 'Trusted tenantId validates the Tenant-owned Address.',
  'inventory/application/commands/create/warehouse/__tests__/create-warehouse.handler.spec.ts': 'Exercises Tenant-owned Address validation.',
  'inventory/application/commands/update/warehouse/update-warehouse.dto.ts': 'Trusted tenantId validates the Tenant-owned Address.',
  'inventory/application/commands/update/warehouse/update-warehouse.handler.ts': 'Trusted tenantId validates the Tenant-owned Address.',
  'inventory/application/commands/update/warehouse/__tests__/update-warehouse.handler.spec.ts': 'Exercises Tenant-owned Address validation.',
  'inventory/application/queries/get-all/warehouse/all-warehouses.dto.ts': 'Trusted tenantId resolves Tenant-owned Address details.',
  'inventory/application/queries/get-all/warehouse/all-warehouses.handler.ts': 'Trusted tenantId resolves Tenant-owned Address details.',
  'inventory/presentation/graphql/inventory.resolver.ts': 'Trusted tenantId is passed only for Tenant-owned Address details.',
};

export const storeScopedPrismaModels = [
  'Subscription', 'Employee', 'EmployeeRole', 'RoleFeatures', 'Warehouse',
  'StockMovement', 'StockPerWarehouse', 'ShippingRule', 'ShipmentRate',
  'TaxRate', 'Category', 'ProductCategories', 'Product', 'Media', 'Variant',
  'Promotion', 'Coupon', 'CouponUsage', 'CartPromotions', 'OrderPromotions',
  'Cart', 'CartItem', 'Order', 'OrderDetail', 'Return', 'Payment',
  'PaymentMethod', 'Customer', 'WishList', 'CustomerReviewProduct',
];

// These aggregate-owned children derive Store ownership through a globally
// unique parent, so they must not duplicate storeId.
export const aggregateOwnedPrismaModels = {
  Attribute: { parentField: 'variant', parentIdField: 'variantId', parentModel: 'Variant' },
  Dimension: { parentField: 'variant', parentIdField: 'variantId', parentModel: 'Variant' },
  InstallmentPayment: { parentField: 'variant', parentIdField: 'variantId', parentModel: 'Variant' },
  Sustainability: { parentField: 'product', parentIdField: 'productId', parentModel: 'Product' },
  Warranty: { parentField: 'variant', parentIdField: 'variantId', parentModel: 'Variant' },
};

// Models with a Store-owned parent must use a composite Store-qualified foreign
// key, rather than an unscoped parent id.
export const storeQualifiedRelationModels = ['StockPerWarehouse'];

export const allowedAggregateDependencies = ['@nestjs/cqrs', 'zod', 'zod/v4'];

// Exceptions are deliberately explicit and must explain why the normal
// architectural contract does not apply. Keep this list small and review it as
// carefully as production code.
export const specializedMutationDtos = {
  'cart/application/commands/update/update-item-quantity.dto.ts':
    'Uses the aggregate-owned IUpdateItemQuantityData action contract because this command targets one cart item rather than the Cart base shape.',
};

export const persistenceRepositoryContractExceptions = {
  'address/infrastructure/postgres/country.repository.ts':
    'Read-only geographic reference-data repository; it is not an aggregate repository.',
  'address/infrastructure/postgres/state.repository.ts':
    'Read-only geographic reference-data repository; it is not an aggregate repository.',
};

export const aggregateRoots = {
  address: 'address/address.entity.ts',
  authentication: 'auth/authentication.entity.ts',
  cart: 'cart/cart.entity.ts',
  category: 'category/category.entity.ts',
  inventory: 'warehouse/warehouse.entity.ts',
  product: 'product/product.entity.ts',
  tenant: 'tenant/tenant.entity.ts',
  customer: 'customer/customer.entity.ts',
  payment: 'payment/payment.entity.ts',
  order: 'order/order.entity.ts',
  shipping: 'shipping/shipping.entity.ts',
};

export const allowedAggregateDependencies = ['@nestjs/cqrs', 'zod', 'zod/v4'];

// Exceptions are deliberately explicit and must explain why the normal
// architectural contract does not apply. Keep this list small and review it as
// carefully as production code.
export const specializedMutationDtos = {
  'cart/application/commands/update/update-item-quantity.dto.ts':
    'Uses the aggregate-owned IUpdateItemQuantityData action contract because this command targets one cart item rather than the Cart base shape.',
};

export const persistenceRepositoryContractExceptions = {
  'address/infrastructure/persistence/postgres/country.repository.ts':
    'Read-only geographic reference-data repository; it is not an aggregate repository.',
  'address/infrastructure/persistence/postgres/state.repository.ts':
    'Read-only geographic reference-data repository; it is not an aggregate repository.',
};

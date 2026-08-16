export const aggregateRoots = {
  address: 'address/address.entity.ts',
  authentication: 'auth/authentication.entity.ts',
  cart: 'cart.entity.ts',
  category: 'category/category.entity.ts',
  inventory: 'warehouse/warehouse.entity.ts',
  product: 'product/product.entity.ts',
  tenant: 'tenant/tenant.entity.ts',
};

export const allowedAggregateDependencies = ['@nestjs/cqrs', 'zod', 'zod/v4'];

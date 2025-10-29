import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

// Command Handlers
import {
  CreateProductHandler,
  UpdateProductHandler,
  SoftDeleteProductHandler,
  HardDeleteProductHandler,
  DeleteVariantHandler,
  RestoreProductHandler,
  ArchiveVariantHandler,
  RestoreVariantHandler,
} from './application/commands';
// Query Handlers
import {
  GetProductByIdHandler,
  GetAllProductsHandler,
  GetVariantsDetailsHandler,
} from './application/queries';
// Event Handlers
import {
  ProductCreatedHandler,
  ProductUpdatedHandler,
  ProductSoftDeletedHandler,
  ProductHardDeletedHandler,
  ProductRestoredHandler,
  VariantDeletedHandler,
  VariantArchivedHandler,
  VariantRestoredHandler,
} from './application/events';
import { ProductRepository } from './infrastructure/persistence/postgres/product.repository';
import { ProductResolver } from './presentation/graphql/product.resolver';
import CategoryAdapter from './infrastructure/adapters/category.adapter';

const CommandHandlers = [
  CreateProductHandler,
  UpdateProductHandler,
  SoftDeleteProductHandler,
  HardDeleteProductHandler,
  DeleteVariantHandler,
  RestoreProductHandler,
  ArchiveVariantHandler,
  RestoreVariantHandler,
];

const QueryHandlers = [
  GetProductByIdHandler,
  GetAllProductsHandler,
  GetVariantsDetailsHandler,
];

const EventHandlers = [
  ProductCreatedHandler,
  ProductUpdatedHandler,
  ProductSoftDeletedHandler,
  ProductHardDeletedHandler,
  ProductRestoredHandler,
  VariantDeletedHandler,
  VariantArchivedHandler,
  VariantRestoredHandler,
];

@Module({
  imports: [CqrsModule],
  providers: [
    { provide: 'IProductRepository', useClass: ProductRepository },
    { provide: 'ICategoryAdapter', useClass: CategoryAdapter },
    ProductResolver,
    ...CommandHandlers,
    ...QueryHandlers,
    ...EventHandlers,
  ],
  exports: [GetVariantsDetailsHandler],
})
export class ProductDomain {}

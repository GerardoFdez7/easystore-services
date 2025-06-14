import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { LoggerModule } from '@winston/winston.module';
import { PostgresModule } from '@database/postgres.module';
import { ProductRepository } from './infrastructure/persistence/postgres/product.repository';
import { ProductResolver } from './presentation/graphql/product.resolver';
// Command Handlers
import {
  CreateProductHandler,
  CreateVariantHandler,
  UpdateProductHandler,
  UpdateVariantHandler,
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
} from './application/queries';
// Event Handlers
import {
  ProductCreatedHandler,
  ProductUpdatedHandler,
  ProductSoftDeletedHandler,
  ProductHardDeletedHandler,
  ProductRestoredHandler,
  VariantCreatedHandler,
  VariantUpdatedHandler,
  VariantDeletedHandler,
  VariantArchivedHandler,
  VariantRestoredHandler,
} from './application/events';

const CommandHandlers = [
  CreateProductHandler,
  CreateVariantHandler,
  UpdateProductHandler,
  UpdateVariantHandler,
  SoftDeleteProductHandler,
  HardDeleteProductHandler,
  DeleteVariantHandler,
  RestoreProductHandler,
  ArchiveVariantHandler,
  RestoreVariantHandler,
];

const QueryHandlers = [GetProductByIdHandler, GetAllProductsHandler];

const EventHandlers = [
  ProductCreatedHandler,
  ProductUpdatedHandler,
  ProductSoftDeletedHandler,
  ProductHardDeletedHandler,
  ProductRestoredHandler,
  VariantCreatedHandler,
  VariantUpdatedHandler,
  VariantDeletedHandler,
  VariantArchivedHandler,
  VariantRestoredHandler,
];

@Module({
  imports: [CqrsModule, PostgresModule, LoggerModule],
  providers: [
    ProductResolver,
    { provide: 'IProductRepository', useClass: ProductRepository },
    ...CommandHandlers,
    ...EventHandlers,
    ...QueryHandlers,
  ],
})
export class ProductDomain {}

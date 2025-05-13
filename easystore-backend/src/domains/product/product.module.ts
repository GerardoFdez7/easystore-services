import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ScheduleModule } from '@nestjs/schedule';
import { LoggerModule } from '@shared/winston/winston.module';
import { MongoModule } from '@database/mongo/mongo.module';
import { ProductRepository } from './infrastructure/persistence/mongo/product.repository';
import { ProductResolver } from './presentation/graphql/product.resolver';
import { ScheduleDeleteProductsJob } from './infrastructure/jobs/schedule-delete.job';
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
} from './application/commands';
// Query Handlers
import {
  GetProductByIdHandler,
  GetProductsByNameHandler,
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
];

const QueryHandlers = [
  GetProductByIdHandler,
  GetProductsByNameHandler,
  GetAllProductsHandler,
];

const EventHandlers = [
  ProductCreatedHandler,
  ProductUpdatedHandler,
  ProductSoftDeletedHandler,
  ProductHardDeletedHandler,
  ProductRestoredHandler,
  VariantCreatedHandler,
  VariantUpdatedHandler,
  VariantDeletedHandler,
];

@Module({
  imports: [CqrsModule, MongoModule, LoggerModule, ScheduleModule.forRoot()],
  providers: [
    ProductResolver,
    ScheduleDeleteProductsJob,
    { provide: 'IProductRepository', useClass: ProductRepository },
    ...CommandHandlers,
    ...EventHandlers,
    ...QueryHandlers,
  ],
})
export class ProductModule {}

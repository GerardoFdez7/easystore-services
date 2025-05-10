import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ScheduleModule } from '@nestjs/schedule';
import { LoggerService } from '@shared/winston/winston.service';
import { MongoService } from '@database/mongo/mongo.service';
import { ProductRepository } from './infrastructure/persistence/mongo/product.repository';
import { ScheduleDeleteProductsJob } from './infrastructure/jobs/schedule-delete.job';
// Command Handlers
import { CreateProductHandler } from './application/commands/create/product/create-product.handler';
import { CreateVariantHandler } from './application/commands/create/product-variant/create-variant.handler';
import { UpdateProductHandler } from './application/commands/update/product/update-product.handler';
import { UpdateVariantHandler } from './application/commands/update/product-variant/update-variant.handler';
import { SoftDeleteProductHandler } from './application/commands/delete/product/soft/soft-delete-product.handler';
import { HardDeleteProductHandler } from './application/commands/delete/product/hard/hard-delete-product.handler';
import { DeleteVariantHandler } from './application/commands/delete/product-variant/delete-variant.handler';
// Query Handlers
import { GetProductByIdHandler } from './application/queries/get-id/id.handler';
import { GetProductsByNameHandler } from './application/queries/get-name/name.handler';
import { GetAllProductsHandler } from './application/queries/get-all/all-products.handler';
// Event Handlers
import { ProductCreatedHandler } from './application/events/product/product-created.handler';
import { ProductUpdatedHandler } from './application/events/product/product-updated.handler';
import { ProductSoftDeletedHandler } from './application/events/product/product-soft-deleted.handler';
import { ProductHardDeletedHandler } from './application/events/product/product-hard-deleted.handler';
import { ProductRestoredHandler } from './application/events/product/product-restored.handler';
import { VariantCreatedHandler } from './application/events/product-variant/variant-created.handler';
import { VariantUpdatedHandler } from './application/events/product-variant/variant-updated.handler';
import { VariantDeletedHandler } from './application/events/product-variant/variant-deleted.handler';

const CommandHandlers = [
  CreateProductHandler,
  CreateVariantHandler,
  UpdateProductHandler,
  UpdateVariantHandler,
  SoftDeleteProductHandler,
  HardDeleteProductHandler,
  DeleteVariantHandler,
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
  imports: [CqrsModule, MongoService, LoggerService, ScheduleModule.forRoot()],
  providers: [
    ProductRepository,
    ScheduleDeleteProductsJob,
    { provide: 'ProductRepository', useClass: ProductRepository },
    ...CommandHandlers,
    ...EventHandlers,
    ...QueryHandlers,
  ],
})
export class ProductModule {}

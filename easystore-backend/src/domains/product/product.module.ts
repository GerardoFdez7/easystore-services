import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ScheduleModule } from '@nestjs/schedule';
import { LoggerModule } from '@winston/winston.module';
import { PostgresModule } from '@database/postgres.module';
//import { ProductRepository } from './infrastructure/persistence/postgres/product.repository';
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
  MediaCreatedHandler,
  MediaUpdatedHandler,
  MediaDeletedHandler,
  WarrantyCreatedHandler,
  WarrantyUpdatedHandler,
  WarrantyDeletedHandler,
  InstallmentPaymentCreatedHandler,
  InstallmentPaymentUpdatedHandler,
  InstallmentPaymentDeletedHandler,
  SustainabilityCreatedHandler,
  SustainabilityUpdatedHandler,
  SustainabilityDeletedHandler,
  CategoryAssignedHandler,
  CategoryUnassignedHandler,
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
  MediaCreatedHandler,
  MediaUpdatedHandler,
  MediaDeletedHandler,
  WarrantyCreatedHandler,
  WarrantyUpdatedHandler,
  WarrantyDeletedHandler,
  InstallmentPaymentCreatedHandler,
  InstallmentPaymentUpdatedHandler,
  InstallmentPaymentDeletedHandler,
  SustainabilityCreatedHandler,
  SustainabilityUpdatedHandler,
  SustainabilityDeletedHandler,
  CategoryAssignedHandler,
  CategoryUnassignedHandler,
];

@Module({
  imports: [CqrsModule, PostgresModule, LoggerModule, ScheduleModule.forRoot()],
  providers: [
    ProductResolver,
    ScheduleDeleteProductsJob,
    //{ provide: 'IProductRepository', useClass: ProductRepository },
    ...CommandHandlers,
    ...EventHandlers,
    ...QueryHandlers,
  ],
})
export class ProductDomain {}

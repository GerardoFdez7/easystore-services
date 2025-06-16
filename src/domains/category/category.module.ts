import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PostgresModule } from '@database/postgres.module';
import { LoggerModule } from '@winston/winston.module';
// Command Handlers
import {
  CreateCategoryHandler,
  UpdateCategoryHandler,
  DeleteCategoryHandler,
} from './application/commands';
// Query Handlers
import {
  GetCategoryByIdHandler,
  GetAllCategoriesHandler,
} from './application/queries';
// Event Handlers
import {
  CategoryCreatedHandler,
  CategoryDeletedHandler,
  CategoryUpdatedHandler,
} from './application/events';
import CategoryRepository from './infrastructure/persistence/postgres/category.repository';

const CommandHandlers = [
  CreateCategoryHandler,
  UpdateCategoryHandler,
  DeleteCategoryHandler,
];

const QueryHandlers = [GetCategoryByIdHandler, GetAllCategoriesHandler];

const EventHandlers = [
  CategoryCreatedHandler,
  CategoryDeletedHandler,
  CategoryUpdatedHandler,
];

@Module({
  imports: [CqrsModule, PostgresModule, LoggerModule],
  providers: [
    { provide: 'ICategoryRepository', useClass: CategoryRepository },
    ...CommandHandlers,
    ...QueryHandlers,
    ...EventHandlers,
  ],
})
export class CategoryDomain {}
